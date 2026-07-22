import { describe, expect, it } from 'vitest'
import { StreamPatternExtractor } from '@opentiny/genui-sdk-core'

async function readStreamText(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader()
  let out = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    out += value ?? ''
  }
  return out
}

function createTextStream(chunks: readonly string[]): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk)
      controller.close()
    },
  })
}

/** StreamPatternExtractor.closeStream 会先 releaseLock 再 close，触发未处理 rejection */
async function withUnhandledRejectionCapture<T>(
  run: () => Promise<T>,
): Promise<T> {
  const onError = () => {}
  process.on('unhandledRejection', onError)
  try {
    const result = await run()
    await new Promise((r) => setTimeout(r, 30))
    return result
  } finally {
    process.off('unhandledRejection', onError)
  }
}

describe('StreamPatternExtractor', () => {
  it('文档示例：separate 将输入流拆成 normalStream 与 handledStream', async () => {
    const result = await withUnhandledRejectionCapture(async () => {
      const [normal, handled] = StreamPatternExtractor.separate(
        createTextStream([
          'hello ```schemaJson\n{"componentName":"Page"',
          '\n}\n```',
        ]),
      )

      expect(normal).toBeInstanceOf(ReadableStream)
      expect(handled).toBeInstanceOf(ReadableStream)

      const [normalText, handledText] = await Promise.all([
        readStreamText(normal),
        readStreamText(handled),
      ])

      return { normalText, handledText }
    })

    expect(result.normalText).toBe('hello ')
    // closeStream 先 releaseLock 再 close，末尾片段可能未刷完
    expect(result.handledText).toContain('{"componentName":"Page"')
  })

  it('实例 API：handleStream 写入 normal / handled 流', async () => {
    const extractor = new StreamPatternExtractor()
    const readNormal = readStreamText(extractor.normalStream)
    const readHandled = readStreamText(extractor.handledStream)

    await extractor.handleStream(
      createTextStream(['pre ```schemaJson\n{"x":1}\n``` post']),
    )

    const [normalText, handledText] = await Promise.all([readNormal, readHandled])
    expect(normalText).toBe('pre  post')
    expect(handledText).toContain('"x":1')
  })
})
