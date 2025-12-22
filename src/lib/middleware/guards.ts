import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_clave_secreta"
);

export async function authGuard(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return { error: true, redirectTo: "/login" };

  try {
    const { payload } = await jwtVerify(token, secret);
    return { error: false, payload };
  } catch (e) {
    return { error: true, redirectTo: "/login" };
  }
}

export function passwordChangeGuard(payload: any, pathname: string) {
  if (payload.mustChangePassword && pathname !== "/admin/cambiar-contrasena") {
    return { error: true, redirectTo: "/admin/cambiar-contrasena" };
  }
  return { error: false };
}
