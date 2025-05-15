// src/middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Логи для дебагу (видалити у продакшн)
  console.log("Middleware path:", req.nextUrl.pathname);
  console.log("Session in middleware:", session);

  // Якщо користувач не залогінений і хоче зайти в /dashboard — редірект на /auth/login
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Якщо користувач залогінений і хоче зайти на сторінку логіну чи реєстрації — редірект на /dashboard
  if (
    session &&
    (req.nextUrl.pathname === "/auth/login" ||
      req.nextUrl.pathname === "/auth/register")
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
