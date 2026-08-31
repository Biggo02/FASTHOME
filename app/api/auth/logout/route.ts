import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('fasthome_session', '', { httpOnly: true, expires: new Date(0), sameSite: 'lax', path: '/' });
  return response;
}
