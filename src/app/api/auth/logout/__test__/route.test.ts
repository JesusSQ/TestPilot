import { POST } from "../route";
import { cookies } from "next/headers";

jest.mock("next/headers", () => {
  const cookieStore = {
    set: jest.fn(),
  };
  return {
    cookies: jest.fn(async () => cookieStore),
  };
});

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and clear the auth_token cookie", async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Sesión cerrada exitosamente");

    const cookieStore = await cookies();

    expect(cookieStore.set).toHaveBeenCalledWith(
      "auth_token",
      "",
      expect.objectContaining({
        expires: expect.any(Date),
        path: "/",
      })
    );

    const callArgs = (cookieStore.set as jest.Mock).mock.calls[0][2];
    expect(callArgs.expires.getTime()).toBe(0);
  });

  it("should return 500 if an error occurs during logout", async () => {
    (cookies as jest.Mock).mockRejectedValueOnce(new Error("Cookie error"));

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Error al cerrar sesión");
  });
});
