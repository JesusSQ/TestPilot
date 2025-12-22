import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema } from "@/lib/validations/auth";

const JWT_SECRET = process.env.JWT_SECRET || "a_clave_secreta";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      const message =
        user.role === "ADMIN"
          ? "Tu cuenta de administrador está desactivada"
          : "Tu cuenta no está activa";

      return NextResponse.json(
        { message: `${message}. Contacta con soporte.` },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login error: ", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
