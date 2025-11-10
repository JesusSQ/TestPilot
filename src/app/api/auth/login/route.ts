import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { error } from "console";


const JWT_SECRET = process.env.JWT_SECRET || 'a_clave_secreta';

export async function POST(request: Request) {
    try {
        const { email, password} = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email}});

        if (!user) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        let errorMessage: string | null = null;

        if (user.role === 'STUDENT') {
            if (user.status !== 'ACTIVE') {
                errorMessage = "Your account is not active. Please contact support.";
            }
        } else if (user.role === 'ADMIN') {
            if (user.status !== 'ACTIVE') {
                errorMessage = "Your admin account is desactivated. Please contact support.";
            }
        }

        if (errorMessage) {
            return NextResponse.json({
                message: errorMessage,
                status: user.status,}, { status: 403 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role},
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                // TODO: (Ajustar más tarde para el nuevo requisito)
                mustChangePassword: user.id === 1
            },
        });
    } catch (error) {
        console.error('Login error: ', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}