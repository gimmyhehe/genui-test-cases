import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { genPrompt } from '@opentiny/genui-sdk-core'
import { materialsMeta } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../out-prompt/vue-prompt.md')

export function generateVuePrompt() {
  const prompt = genPrompt('Vue', materialsMeta)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, prompt, 'utf-8')
  return outPath
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectRun) {
  const path = generateVuePrompt()
  console.log(`Vue prompt written to ${path}`)
}
