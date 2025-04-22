import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // If trying to access admin routes without a token
  if (isAdminRoute && !isLoginPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Decode the token to check the role
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      if (tokenPayload.role !== 'admin') {
        // If not an admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // If already logged in and trying to access login page
  if (isLoginPage && token) {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      if (tokenPayload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    } catch (err) {
      // Invalid token, clear it
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}; 