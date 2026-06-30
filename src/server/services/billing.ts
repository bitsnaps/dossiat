import { Op } from 'sequelize'
import { Payment, PlatformCredit, CreditTransaction, Invoice, User } from '@/server/database/models'

interface InvoiceResult {
  agentId: number
  invoiceId: number
  status: string
  totalFees: number
}

/**
 * Generate invoices for all agents in the given billing cycle.
 * Deducts platform fees from agent credits if sufficient balance exists.
 */
export async function generateAgentInvoices(
  billingCycleStart: Date,
  billingCycleEnd: Date,
): Promise<InvoiceResult[]> {
  const results: InvoiceResult[] = []
  const now = new Date()

  const agents = await User.findAll({ where: { role: 'agent' } })

  for (const agent of agents) {
    // Skip if invoice already exists for this period
    const existingInvoice = await Invoice.findOne({
      where: {
        agentId: agent.id,
        periodStart: billingCycleStart,
        periodEnd: billingCycleEnd,
      },
    })
    if (existingInvoice) continue

    // Find confirmed payments in the billing period
    const payments = await Payment.findAll({
      where: {
        payeeId: agent.id,
        status: 'confirmed',
        confirmedAt: { [Op.gte]: billingCycleStart, [Op.lte]: billingCycleEnd },
      },
    })

    if (payments.length === 0) continue

    const totalFees = payments.reduce((sum, p) => sum + Number(p.platformFee), 0)
    if (totalFees <= 0) continue

    // Check agent's credit balance
    const credit = await PlatformCredit.findOne({ where: { agentId: agent.id } })
    let status: 'draft' | 'sent' | 'paid' = 'sent'

    if (credit && Number(credit.balance) >= totalFees) {
      await credit.update({ balance: Number(credit.balance) - totalFees })
      await CreditTransaction.create({
        creditId: credit.id,
        type: 'deduction',
        amount: totalFees,
        description: `Auto-deducted for billing cycle ${billingCycleStart.toISOString().slice(0, 7)}`,
      })
      status = 'paid'
    }

    const invoice = await Invoice.create({
      agentId: agent.id,
      periodStart: billingCycleStart,
      periodEnd: billingCycleEnd,
      totalFees,
      currency: 'USD',
      status,
      paidAt: status === 'paid' ? now : null,
    })

    results.push({
      agentId: agent.id,
      invoiceId: invoice.id,
      status,
      totalFees,
    })
  }

  return results
}
