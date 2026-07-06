/**
 * Browser-safe CSV parser — no Node core modules, no third-party deps.
 *
 * Replaces the `csv/sync` `parse()` call previously used by the bulk mission
 * create view. The `csv` package is Node stream-based and pulled in core
 * modules (`util.inherits`, `stream`, …) that Vite cannot polyfill in the
 * browser, crashing the route with
 * `TypeError: import_util.default.inherits is not a function`.
 *
 * This implementation is intentionally small and covers the subset of RFC 4180
 * the bulk-upload feature needs:
 *   - first record treated as headers (`columns: true`)
 *   - double-quoted fields with escaped `""` quotes
 *   - CRLF and LF line endings
 *   - leading/trailing whitespace trimmed from fields and headers (`trim`)
 *   - blank lines skipped (`skip_empty_lines`)
 *   - rows with fewer/more columns than the header are tolerated
 *     (`relax_column_count`); missing trailing cells become `''`.
 */

export interface ParseCsvOptions {
  /** Use the first record as object keys (default: true). */
  columns?: boolean
  /** Skip blank lines (default: true). */
  skipEmptyLines?: boolean
  /** Trim surrounding whitespace from every field and header (default: true). */
  trim?: boolean
}

/**
 * Parse CSV text into an array of string arrays (raw rows).
 * Handles quoted fields, escaped quotes, and CRLF/LF endings.
 */
export function parseCsvRaw(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        // Escaped quote "" → literal "
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        // Closing quote
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }

    // Not in quotes
    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (char === '\r') {
      // Handle CRLF: emit row on \n
      if (text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += char
    i++
  }

  // Flush trailing field/row (file without final newline)
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function applyTrim(value: string, trim: boolean): string {
  return trim ? value.trim() : value
}

/**
 * Parse CSV text into an array of objects keyed by the header row.
 * Mirrors `csv/sync` `parse(text, { columns: true, skip_empty_lines, trim,
 * relax_column_count: true })`.
 */
export function parseCsv(
  text: string,
  options: ParseCsvOptions = {},
): Record<string, string>[] {
  const {
    columns = true,
    skipEmptyLines = true,
    trim = true,
  } = options

  const rawRows = parseCsvRaw(text)

  // Drop fully-empty lines (no cells or a single empty cell).
  const dataRows = rawRows.filter((r) => {
    if (!skipEmptyLines) return true
    return r.length > 1 || (r.length === 1 && r[0] !== '')
  })

  if (dataRows.length === 0) return []

  if (!columns) {
    // Return array-of-arrays cast to objects (1-indexed keys) — not used by the
    // bulk view but kept for completeness.
    return dataRows.map((r) => {
      const obj: Record<string, string> = {}
      r.forEach((cell, idx) => { obj[String(idx)] = applyTrim(cell, trim) })
      return obj
    })
  }

  const headerRow = dataRows[0]
  const headers = headerRow.map((h) => applyTrim(h, trim))

  return dataRows.slice(1).map((cells) => {
    const obj: Record<string, string> = {}
    headers.forEach((header, idx) => {
      const value = idx < cells.length ? cells[idx] : ''
      obj[header] = applyTrim(value, trim)
    })
    return obj
  })
}
