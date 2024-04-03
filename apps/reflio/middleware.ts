import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/(.*)']
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Redirect all requests to the /api/auth endpoint
  url.pathname = '/api/v1/auth';
  return NextResponse.rewrite(url);
}
