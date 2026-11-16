// Both provider and browser streams use SSE; chunks can split inside UTF-8 or a line.
export async function* readSse(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      while (true) {
        const boundary = /\r?\n\r?\n/.exec(buffer)
        if (!boundary) {
          break
        }
        const frame = buffer.slice(0, boundary.index)
        buffer = buffer.slice(boundary.index + boundary[0].length)
        const data = frame.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n')
        if (data) {
          yield data
        }
      }
      if (buffer.length > 65536) {
        throw new Error('Stream frame too large')
      }
      if (done) {
        break
      }
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
