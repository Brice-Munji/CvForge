import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SESSION_COOKIE, supabaseEnabled } from "@/lib/auth/config";
import { verifySessionToken } from "@/lib/auth/session";

const PROTECTED = [
  "/dashboard",
  "/builder",
  "/cover-letters",
  "/applications",
  "/application-email",
  "/settings",
  "/checkout",
  "/payment",
  "/admin",
];
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);
  if (!isProtected && !isAuthPage) return res;

  let authed = false;

  if (supabaseEnabled()) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = Boolean(user);
  } else {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    authed = Boolean(await verifySessionToken(token));
  }

  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/builder/:path*",
    "/cover-letters/:path*",
    "/applications/:path*",
    "/application-email/:path*",
    "/settings/:path*",
    "/checkout/:path*",
    "/payment/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
