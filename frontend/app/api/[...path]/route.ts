import { type NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080'

async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl
  const target = `${BACKEND}${pathname}${search}`

  const reqHeaders = new Headers(req.headers)
  reqHeaders.delete('host')
  reqHeaders.delete('expect') // undici does not support Expect: 100-continue
  reqHeaders.delete('accept-encoding')

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const body = hasBody ? await req.arrayBuffer() : undefined

  // Retry once to handle backend cold starts (Neon DB wake-up + Go init can take 10-15s)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const upstream = await fetch(target, {
        method: req.method,
        headers: reqHeaders,
        body,
        signal: AbortSignal.timeout(28000),
      })

      const payload = await upstream.arrayBuffer()
      const headers = new Headers(upstream.headers)
      headers.delete('content-encoding')
      headers.delete('content-length')
      headers.delete('transfer-encoding')
      headers.delete('connection')

      return new NextResponse(payload, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      })
    } catch (err) {
      if (attempt < 1) {
        await new Promise(r => setTimeout(r, 2000))
        continue
      }
      const cause = (err instanceof Error && err.cause) ? String(err.cause) : 'none'
      console.error('[proxy] target=%s error=%s cause=%s', target, String(err), cause)
      return NextResponse.json({ error: 'Backend unavailable', detail: String(err), cause }, { status: 502 })
    }
  }

  // unreachable
  return NextResponse.json({ error: 'Unexpected proxy error' }, { status: 502 })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
