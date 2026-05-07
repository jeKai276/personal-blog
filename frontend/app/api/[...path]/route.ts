import { type NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080'

async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl
  const target = `${BACKEND}${pathname}${search}`

  const reqHeaders = new Headers(req.headers)
  reqHeaders.delete('host')

  try {
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
    const upstream = await fetch(target, {
      method: req.method,
      headers: reqHeaders,
      body: hasBody ? await req.arrayBuffer() : undefined,
    })

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    })
  } catch (err) {
    console.error('[proxy] target=%s error=%s', target, String(err))
    return NextResponse.json({ error: String(err), target }, { status: 502 })
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
