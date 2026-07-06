import { describe, it, expect } from 'vitest'
import { parseCsv, parseCsvRaw } from '@/utils/csv'

describe('parseCsvRaw', () => {
  it('parses a simple comma-separated row', () => {
    expect(parseCsvRaw('a,b,c')).toEqual([['a', 'b', 'c']])
  })

  it('splits on LF and CRLF', () => {
    expect(parseCsvRaw('a,b\nc,d')).toEqual([['a', 'b'], ['c', 'd']])
    expect(parseCsvRaw('a,b\r\nc,d')).toEqual([['a', 'b'], ['c', 'd']])
  })

  it('handles quoted fields containing commas', () => {
    expect(parseCsvRaw('"a,b",c')).toEqual([['a,b', 'c']])
  })

  it('handles escaped double quotes ("")', () => {
    expect(parseCsvRaw('"she said ""hi""",c')).toEqual([['she said "hi"', 'c']])
  })

  it('handles quoted fields spanning newlines', () => {
    expect(parseCsvRaw('"line1\nline2",c')).toEqual([['line1\nline2', 'c']])
  })

  it('flushes the final row when there is no trailing newline', () => {
    expect(parseCsvRaw('a,b')).toEqual([['a', 'b']])
  })
})

describe('parseCsv', () => {
  it('uses the first row as headers and returns objects', () => {
    const text = 'title,clientId\n"Mission A",1\n"Mission B",2'
    expect(parseCsv(text)).toEqual([
      { title: 'Mission A', clientId: '1' },
      { title: 'Mission B', clientId: '2' },
    ])
  })

  it('trims fields and headers by default', () => {
    const text = ' title , clientId \n "Mission A" , 1 '
    expect(parseCsv(text)).toEqual([{ title: 'Mission A', clientId: '1' }])
  })

  it('skips blank lines by default', () => {
    const text = 'title,clientId\n\n"Mission A",1\n\n"Mission B",2\n'
    expect(parseCsv(text)).toEqual([
      { title: 'Mission A', clientId: '1' },
      { title: 'Mission B', clientId: '2' },
    ])
  })

  it('tolerates ragged rows (missing trailing cells become empty strings)', () => {
    const text = 'title,clientId,description\n"Mission A",1\n"Mission B",2,"desc"'
    expect(parseCsv(text)).toEqual([
      { title: 'Mission A', clientId: '1', description: '' },
      { title: 'Mission B', clientId: '2', description: 'desc' },
    ])
  })

  it('returns an empty array for empty input', () => {
    expect(parseCsv('')).toEqual([])
  })

  it('returns an empty array when only a header row is present', () => {
    expect(parseCsv('title,clientId')).toEqual([])
  })

  it('parses the bulk-mission template shape correctly', () => {
    const text =
      'title,clientId,pricingType,description,agreedAmount,currency,agreedChecklist,type\n'
      + '"Example Mission",1,fixed,"Sample mission description",100,USD,"Task 1|Task 2",one_time'
    const rows = parseCsv(text)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      title: 'Example Mission',
      clientId: '1',
      pricingType: 'fixed',
      description: 'Sample mission description',
      agreedAmount: '100',
      currency: 'USD',
      agreedChecklist: 'Task 1|Task 2',
      type: 'one_time',
    })
  })
})
