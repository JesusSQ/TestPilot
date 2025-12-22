import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { POST } from "../route";

const MOCKED_HASHED_PASSWORD = "a_simulated_hashed_password";
const EXPECTED_HASHED_NEW_PASSWORD = "hashedNewPassword123";
const JWT_SECRET = process.env.JWT_SECRET || "a_clave_secreta";

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
}));

describe("POST /api/auth/change-password", () => {
  const VALID_EMAIL = "test@example.com";
  const VALID_PASSWORD = "ValidPass123*";
  const NEW_PASSWORD = "NewPass123#";
  const MOCK_TOKEN = "valid-mock-token";

  const mockUser = {
    id: "user-id-123",
    email: VALID_EMAIL,
    password: MOCKED_HASHED_PASSWORD,
    role: "STUDENT",
    status: "ACTIVE",
    mustChangePassword: false,
  };

  const createMockRequest = (body: any, includeToken = true) => {
    return {
      json: async () => body,
      headers: {
        get: (name: string) => {
          if (name === "authorization" && includeToken)
            return `Bearer ${MOCK_TOKEN}`;
          return null;
        },
      },
    } as unknown as Request;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockReturnValue({
      email: VALID_EMAIL,
      id: "user-id-123",
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const mockRequest = createMockRequest({
      currentPassword: VALID_PASSWORD,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("Faltan datos obligatorios");
  });

  it("should return 401 if token is missing", async () => {
    const mockRequest = createMockRequest(
      {
        currentPassword: VALID_PASSWORD,
        newPassword: NEW_PASSWORD,
      },
      false
    );

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("No autorizado");
  });

  it("should return 401 if current password is incorrect", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const mockRequest = createMockRequest({
      currentPassword: "wrong",
      newPassword: NEW_PASSWORD,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.message).toBe("La contraseña actual es incorrecta");
  });

  it("should return 400 if new password is the same as current password", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockRequest = createMockRequest({
      currentPassword: VALID_PASSWORD,
      newPassword: VALID_PASSWORD,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe("La nueva contraseña debe ser diferente");
  });

  it("should successfully change the password", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue(EXPECTED_HASHED_NEW_PASSWORD);

    const mockRequest = createMockRequest({
      currentPassword: VALID_PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("Contraseña cambiada exitosamente");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: VALID_EMAIL },
      data: {
        password: EXPECTED_HASHED_NEW_PASSWORD,
        mustChangePassword: false,
      },
    });
  });
});
