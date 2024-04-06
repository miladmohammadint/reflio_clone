import { NextRequest, NextResponse } from 'next/server';

// Export an empty middleware function
export const middleware = (req: NextRequest) => {
  return NextResponse.next();
};

// Optionally export the configuration
export const config = {
  matcher: ['/(.*)']
};
