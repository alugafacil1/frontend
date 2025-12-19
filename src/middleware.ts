import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔓 rotas públicas
  const publicRoutes = ["/login", "/signup"];

  // ignora rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ignora arquivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  //Validar
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
