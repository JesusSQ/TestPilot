import { GET, PATCH } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => {
  const mockInternalPrisma = {
    request: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    prisma: mockInternalPrisma,
  };
});

describe("Admin Requests API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/requests", () => {
    it("should return a list of pending requests", async () => {
      const mockRequests = [
        {
          id: 1,
          status: "PENDING",
          user: {
            firstName: "Jesús",
            lastName: "García",
            email: "test@test.com",
          },
        },
      ];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockRequests);
      expect(prisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "PENDING" },
        })
      );
    });

    it("should return 500 if database fetch fails", async () => {
      (prisma.request.findMany as jest.Mock).mockRejectedValue(
        new Error("DB Error")
      );

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toBe("Error al obtener solicitudes");
    });
  });

  describe("PATCH /api/admin/requests", () => {
    const VALID_PAYLOAD = {
      requestId: 1,
      status: "APPROVED",
      adminNotes: "Bienvenido a bordo",
    };

    it("should successfully update a request status", async () => {
      (prisma.request.update as jest.Mock).mockResolvedValue({
        id: 1,
        status: "APPROVED",
      });

      const mockRequest = {
        json: async () => VALID_PAYLOAD,
      } as unknown as Request;

      const response = await PATCH(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe("Solicitud approved con éxito");
      expect(prisma.request.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: "APPROVED",
          adminNotes: "Bienvenido a bordo",
        },
      });
    });

    it("should return 400 for invalid status", async () => {
      const mockRequest = {
        json: async () => ({ requestId: 1, status: "INVALID_STATUS" }),
      } as unknown as Request;

      const response = await PATCH(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe("Estado no válido");
      expect(prisma.request.update).not.toHaveBeenCalled();
    });

    it("should return 500 if update fails", async () => {
      (prisma.request.update as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      const mockRequest = {
        json: async () => VALID_PAYLOAD,
      } as unknown as Request;

      const response = await PATCH(mockRequest);
      expect(response.status).toBe(500);
    });
  });
});
