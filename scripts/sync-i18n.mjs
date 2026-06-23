#!/usr/bin/env node

/**
 * i18n Sync Script
 *
 * Compares locale JSON files against a reference locale (en.json)
 * and reports or fixes missing/extra keys.
 *
 * Usage:
 *   node scripts/sync-i18n.mjs           # report only
 *   node scripts/sync-i18n.mjs --fix     # add missing keys with empty values
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const LOCALES_DIR = resolve('src/locales')
const REFERENCE_LOCALE = 'en'
const FIX_MODE = process.argv.includes('--fix')

// ─── Helpers ───────────────────────────────────────────────

/**
 * Recursively flatten a nested object into dot-notation keys.
 * e.g. { a: { b: 'c' } } → { 'a.b': 'c' }
 */
function flattenKeys(obj, prefix = '') {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value, fullKey))
    } else {
      result[fullKey] = value
    }
  }
  return result
}

/**
 * Build a nested object from dot-notation keys.
 * e.g. { 'a.b': 'c' } → { a: { b: 'c' } }
 */
function buildNested(flat) {
  const result = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {}
      }
      current = current[parts[i]]
    }
    current[parts[parts.length - 1]] = value
  }
  return result
}

/**
 * Deep merge source into target, preserving existing keys in target.
 * Adds new keys from source that don't exist in target.
 * Returns the merged result.
 */
function deepMerge(target, source) {
  const result = { ...target }
  for (const [key, value] of Object.entries(source)) {
    if (!(key in result)) {
      result[key] = value
    } else if (
      value && typeof value === 'object' && !Array.isArray(value) &&
      result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value)
    }
    // If key exists, keep the existing value (don't overwrite translations)
  }
  return result
}

// ─── Main ──────────────────────────────────────────────────

function main() {
  const files = readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'))

  if (files.length === 0) {
    console.error('No locale files found in', LOCALES_DIR)
    process.exit(1)
  }

  // Read reference locale
  const refFile = `${REFERENCE_LOCALE}.json`
  if (!files.includes(refFile)) {
    console.error(`Reference locale "${refFile}" not found in`, LOCALES_DIR)
    process.exit(1)
  }

  const refRaw = readFileSync(join(LOCALES_DIR, refFile), 'utf-8')
  const refData = JSON.parse(refRaw)
  const refFlat = flattenKeys(refData)

  console.log(`\n🌐 i18n Sync — Reference: ${refFile} (${Object.keys(refFlat).length} keys)\n`)

  let hasIssues = false
  const totalFiles = files.length

  for (const file of files) {
    if (file === refFile) continue

    const raw = readFileSync(join(LOCALES_DIR, file), 'utf-8')
    const data = JSON.parse(raw)
    const flat = flattenKeys(data)

    const refKeys = Object.keys(refFlat)
    const localeKeys = Object.keys(flat)

    const missingKeys = refKeys.filter(k => !(k in flat))
    const extraKeys = localeKeys.filter(k => !(k in refFlat))

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`  ✅ ${file} — all keys match`)
      continue
    }

    hasIssues = true

    if (missingKeys.length > 0) {
      console.log(`  ❌ ${file} — ${missingKeys.length} missing key(s):`)
      for (const key of missingKeys) {
        console.log(`       - ${key}`)
      }
    }

    if (extraKeys.length > 0) {
      console.log(`  ⚠️  ${file} — ${extraKeys.length} extra key(s) (not in ${refFile}):`)
      for (const key of extraKeys) {
        console.log(`       - ${key}`)
      }
    }

    // Fix mode: add missing keys with empty string values
    if (FIX_MODE && missingKeys.length > 0) {
      const additions = {}
      for (const key of missingKeys) {
        additions[key] = ''
      }

      const merged = deepMerge(data, buildNested(additions))
      const sorted = sortKeys(merged)
      writeFileSync(join(LOCALES_DIR, file), JSON.stringify(sorted, null, 2) + '\n', 'utf-8')
      console.log(`  🔧 ${file} — ${missingKeys.length} key(s) added with empty values`)
    }
  }

  console.log('')

  if (hasIssues) {
    if (FIX_MODE) {
      console.log('✅ Fix mode applied. Please translate the newly added empty values.\n')
    } else {
      console.log('💡 Run with --fix to add missing keys with empty values.\n')
      process.exit(1)
    }
  } else {
    console.log('✅ All locales are in sync.\n')
  }
}

/**
 * Sort object keys alphabetically, recursively.
 */
function sortKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj
  }
  const sorted = {}
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortKeys(obj[key])
  }
  return sorted
}

main()
