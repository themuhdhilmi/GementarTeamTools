import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"; 


// DO NOT import this variable anywhere else — it's only safe in middleware.
const secret = process.env.NEXT_PUBLIC_NEXTAUTH_SECRET!;

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  const isSigninPage = request.nextUrl.pathname.startsWith("/api/auth/signin");
  const isRootPath = request.nextUrl.pathname === "/";

  if (!token && !isSigninPage) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  if (token && (isSigninPage || isRootPath)) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/api/auth/signin", "/"],
}