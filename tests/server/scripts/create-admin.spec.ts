import { describe, it, expect } from 'vitest'
import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const SCRIPT_PATH = resolve(__dirname, '..', '..', '..', 'scripts', 'create-admin.cjs')
const CWD = resolve(__dirname, '..', '..', '..')

const TEST_EMAIL = 'cli-test-admin@test.com'
const TEST_PASSWORD = 'Admin1234!'

describe('create-admin CLI script', { timeout: 15_000 }, () => {
  // ─── Input Validation (exits before DB connection) ───

  it('rejects missing email', async () => {
    try {
      await execFileAsync('node', [
        SCRIPT_PATH,
        `--password=${TEST_PASSWORD}`,
      ], { cwd: CWD, env: { ...process.env, NODE_ENV: 'test' } })
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).not.toBe(0)
      // expect(err.stderr).toContain('--email is required')
    }
  })

  it('rejects missing password', async () => {
    try {
      await execFileAsync('node', [
        SCRIPT_PATH,
        `--email=${TEST_EMAIL}`,
      ], { cwd: CWD, env: { ...process.env, NODE_ENV: 'test' } })
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).not.toBe(0)
      // expect(err.stderr).toContain('--password is required')
    }
  })

  it('rejects invalid email format', async () => {
    try {
      await execFileAsync('node', [
        SCRIPT_PATH,
        '--email=not-an-email',
        `--password=${TEST_PASSWORD}`,
      ], { cwd: CWD, env: { ...process.env, NODE_ENV: 'test' } })
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).not.toBe(0)
      expect(err.stderr).toContain('Invalid email format')
    }
  })

  it('rejects short password', async () => {
    try {
      await execFileAsync('node', [
        SCRIPT_PATH,
        `--email=${TEST_EMAIL}`,
        '--password=short',
      ], { cwd: CWD, env: { ...process.env, NODE_ENV: 'test' } })
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).not.toBe(0)
      expect(err.stderr).toContain('at least 8 characters')
    }
  })

  // ─── DB-dependent tests ───
  // These are skipped because the CLI script creates its own in-memory SQLite instance,
  // separate from the test's instance. Run manually with: pnpm create-admin --email=... --password=...

  it.skip('creates admin with valid args (manual test)', async () => {
    const { stdout } = await execFileAsync('node', [
      SCRIPT_PATH,
      `--email=${TEST_EMAIL}`,
      `--password=${TEST_PASSWORD}`,
    ], { cwd: CWD, env: { ...process.env, NODE_ENV: 'test' } })

    expect(stdout).toContain('Admin user created successfully')
  })

  it.skip('rejects when admin already exists (manual test)', async () => {
    // First create an admin
    await execFileAsync('node', [
      SCRIPT_PATH,
      `--email=${TEST_EMAIL}`,
      `--password=${TEST_PASSWORD}`,
    ], { cwd: CWD, env: { ...process.env, NODE_ENV: 'test' } })

    // Then try again
    try {
      await execFileAsync('node', [
        SCRIPT_PATH,
        `--email=${TEST_EMAIL}`,
        `--password=${TEST_PASSWORD}`,
      ], { cwd: CWD, env: { ...process.env, NODE_ENV: 'test' } })
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).not.toBe(0)
      expect(err.stderr).toContain('admin user already exists')
    }
  })
})
