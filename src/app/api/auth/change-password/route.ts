import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { changePasswordSchema } from "@/lib/validations/auth";

const JWT_SECRET = process.env.JWT_SECRET || "a_clave_secreta";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    // Extra security: Middleware detects someone is entering this route but we need to be sure the user is the right one.
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
    const userEmail = decoded.email;

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json(
        { message: "La contraseña actual es incorrecta" },
        { status: 401 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: userEmail },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
      },
    });

    const newToken = jwt.sign(
      {
        id: String(user.id),
        email: user.email,
        role: user.role,
        mustChangePassword: false, // Update the token payload
      },
      process.env.JWT_SECRET || "a_clave_secreta",
      { expiresIn: "1h" }
    );

    // Update the auth_token cookie with the new token
    (await cookies()).set("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    return NextResponse.json(
      { message: "Contraseña cambiada exitosamente" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error en change-password:", err);
    return NextResponse.json(
      { message: "Sesión inválida o expirada" },
      { status: 401 }
    );
  }
}
