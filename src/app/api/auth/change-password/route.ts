import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Email, current password and new password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const correctCurrentPassword = user
      ? await bcrypt.compare(currentPassword, user.password)
      : false;

    if (!correctCurrentPassword) {
      return NextResponse.json(
        { message: "Invalid email or current password" },
        { status: 401 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { message: "New password must be different from current password" },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update mustChangePassword flag if it's set, if not just update the password
    if (user.mustChangePassword) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedNewPassword, mustChangePassword: false },
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: { password: hashedNewPassword },
      });
    }

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
