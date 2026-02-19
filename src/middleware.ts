import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/login", "/signUp", "/ads/create"];

  // Verifica se é rota pública - para "/" verifica exatamente, para outras verifica se começa com
  const isPublicRoute = pathname === "/" || 
    publicRoutes.some(route => route !== "/" && (pathname === route || pathname.startsWith(route + "/")));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
