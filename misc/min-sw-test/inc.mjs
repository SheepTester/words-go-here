// node --experimental-import-meta-resolve misc/min-sw-test/inc.mjs

import fs from 'fs/promises'
import { fileURLToPath } from 'url'

async function incV (path) {
  await fs.writeFile(
    path,
    await fs
      .readFile(path, 'utf-8')
      .then(file =>
        file.replace(/\bv(\d+)\b/g, (_, version) => `v${+version + 1}`)
      )
  )
}

async function main () {
  for (const path of ['./index.html', './sw.js']) {
    await import.meta
      .resolve(path)
      .then(fileURLToPath)
      .then(incV)
  }
}

// test: v2
main()
