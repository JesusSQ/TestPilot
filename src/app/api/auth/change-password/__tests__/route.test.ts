import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { POST } from "../route";

const MOCKED_HASHED_PASSWORD = "a_simulated_hashed_password";
const EXPECTED_HASHED_NEW_PASSWORD = "hashedNewPassword123";

let mockTokenValue: string | undefined = "valid-mock-token";

jest.mock("next/headers", () => {
  const cookieStore = {
    get: jest.fn((name: string) => {
      if (name === "auth_token" && mockTokenValue)
        return { value: mockTokenValue };
      return null;
    }),
    set: jest.fn(),
  };
  return {
    cookies: jest.fn(async () => cookieStore),
  };
});

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  sign: jest.fn(() => "new-mocked-token"),
}));

describe("POST /api/auth/change-password", () => {
  const VALID_EMAIL = "test@example.com";
  const VALID_PASSWORD = "ValidPass123*";
  const NEW_PASSWORD = "NewPass123#";

  const mockUser = {
    id: "user-id-123",
    email: VALID_EMAIL,
    password: MOCKED_HASHED_PASSWORD,
    role: "STUDENT",
    status: "ACTIVE",
    mustChangePassword: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenValue = "valid-mock-token";
    (jwt.verify as jest.Mock).mockReturnValue({
      email: VALID_EMAIL,
      id: "user-id-123",
    });
  });

  it("should return 401 if token is missing in cookies", async () => {
    mockTokenValue = undefined;

    const mockRequest = {
      json: async () => ({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("No autorizado");
  });

  it("should return 400 if required fields are missing", async () => {
    const mockRequest = {
      json: async () => ({
        currentPassword: VALID_PASSWORD,
        newPassword: "",
        confirmNewPassword: "",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe(
      "La nueva contraseña debe tener al menos 8 caracteres"
    );
  });

  it("should return 400 if passwords do not match", async () => {
    const mockRequest = {
      json: async () => ({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: "differentPassword",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("Las contraseñas no coinciden");
  });

  it("should return 401 if current password is incorrect in DB", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const mockRequest = {
      json: async () => ({
        currentPassword: "WrongPassword123",
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("La contraseña actual es incorrecta");
  });

  it("should successfully change the password and refresh the cookie", async () => {
    const { cookies } = require("next/headers");
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue(EXPECTED_HASHED_NEW_PASSWORD);

    const mockRequest = {
      json: async () => ({
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmNewPassword: NEW_PASSWORD,
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const cookieStore = await cookies();
    expect(cookieStore.set).toHaveBeenCalledWith(
      "auth_token",
      "new-mocked-token",
      expect.any(Object)
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: VALID_EMAIL },
      data: {
        password: EXPECTED_HASHED_NEW_PASSWORD,
        mustChangePassword: false,
      },
    });
  });
});
