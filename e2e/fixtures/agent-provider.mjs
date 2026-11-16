// Loaded only by the dedicated provider test server through NODE_OPTIONS.
const originalFetch = globalThis.fetch
const encoder = new TextEncoder()
globalThis.fetch = async (input, options) => {
  if (String(input) !== 'https://openrouter.ai/api/v1/chat/completions') {
    return originalFetch(input, options)
  }
  const request = JSON.parse(options.body)
  const question = request.messages.at(-1).content
  const evidence = request.messages[0].content
  const expectedSource = question.includes('publication') ? '/writing/k39-draft-permissions' : 'https://k39.online'
  if (request.max_tokens !== 2000 || request.reasoning?.effort !== 'low' || request.reasoning?.exclude !== true || request.stream !== true || !evidence.includes(expectedSource) || evidence.includes('/writing/unpublished-fixture')) {
    return new Response(null, { status: 400 })
  }
  if (question.includes('provider offline')) {
    return new Response(null, { status: 503 })
  }
  const text = question.includes('unsafe snippet')
    ? ['K39 overview.\n`', '``python\nsecret_code()\n`', '``\nContact Nick.']
    : ['K39 — карта ', 'Калининграда. [K39](/projects/k39).']
  let cancelled = false
  const stream = new ReadableStream({
    async start(controller) {
      if (question.includes('slow')) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Partial answer' } }] })}\n\n`))
        await new Promise((resolve) => options.signal.addEventListener('abort', resolve, { once: true }))
        if (!cancelled) {
          controller.error(new Error('Aborted'))
        }
        return
      }
      for (const content of text) {
        await new Promise((resolve) => setTimeout(resolve, question.includes('slow') ? 2000 : 120))
        if (cancelled || options.signal.aborted) {
          return
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`))
      }
      if (!cancelled) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
    cancel() {
      cancelled = true
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}
