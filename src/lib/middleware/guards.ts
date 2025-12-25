import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_clave_secreta"
);

export async function authGuard(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  if (!token) return { error: true, redirectTo: "/login" };

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return { error: true, redirectTo: "/estudiante/inicio" };
    }

    if (pathname.startsWith("/estudiante") && role !== "STUDENT") {
      return { error: true, redirectTo: "/admin/inicio" };
    }

    return { error: false, payload };
  } catch (e) {
    return { error: true, redirectTo: "/login" };
  }
}

export function passwordChangeGuard(payload: any, pathname: string) {
  const changePasswordPath =
    payload.role === "ADMIN"
      ? "/admin/cambiar-contrasena"
      : "/estudiante/cambiar-contrasena";

  if (payload.mustChangePassword && pathname !== changePasswordPath) {
    return { error: true, redirectTo: changePasswordPath };
  }
  return { error: false };
}
