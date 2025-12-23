import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "../route";
import { cookies } from "next/headers";

jest.mock("next/headers", () => {
  const cookieStore = {
    set: jest.fn(),
    get: jest.fn(),
  };
  return {
    cookies: jest.fn(async () => cookieStore),
  };
});

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked_jwt_token"),
}));

describe("POST /api/auth/login", () => {
  const VALID_EMAIL = "test@example.com";
  const INVALID_EMAIL = "invalid@example.com";
  const VALID_PASSWORD = "Password123*";
  const INVALID_PASSWORD = "WrongPassword";
  const HASHED_PASSWORD = "hashed_password";

  const mockUser = {
    id: "user-id-123",
    email: VALID_EMAIL,
    password: HASHED_PASSWORD,
    role: "STUDENT",
    status: "ACTIVE",
    firstName: "Test",
    lastName: "User",
    mustChangePassword: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a 401 status for invalid credentials (email not found)", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      json: async () => ({
        email: INVALID_EMAIL,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Credenciales inválidas");
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("should return a 401 status for invalid credentials (incorrect password)", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        password: INVALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("Credenciales inválidas");
  });

  it("should return a 400 status if email format is invalid", async () => {
    const mockRequest = {
      json: async () => ({
        email: "not-an-email",
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("Formato de email inválido");
  });

  it("should return a 403 status for a valid but INACTIVE user (STUDENT)", async () => {
    const mockInactiveStudent = {
      ...mockUser,
      status: "INACTIVE",
      role: "STUDENT",
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(
      mockInactiveStudent
    );
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({
        email: mockInactiveStudent.email,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe(
      "Tu cuenta no está activa. Contacta con soporte."
    );
  });

  it("should return a 403 status for a valid but INACTIVE user (ADMIN)", async () => {
    const mockInactiveAdmin = {
      ...mockUser,
      status: "INACTIVE",
      role: "ADMIN",
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockInactiveAdmin);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({
        email: mockInactiveAdmin.email,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe(
      "Tu cuenta de administrador está desactivada. Contacta con soporte."
    );
  });

  it("should return a 200 status and set a cookie for a valid ACTIVE user", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Login exitoso");

    const cookieStore = await cookies();
    expect(cookieStore.set).toHaveBeenCalledWith(
      "auth_token",
      "mocked_jwt_token",
      expect.any(Object)
    );
  });
});
