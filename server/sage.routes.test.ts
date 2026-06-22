import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createCtx(overrides?: Partial<TrpcContext>): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
    ...overrides,
  };
}

describe("auth.me", () => {
  it("retorna null quando não autenticado", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("limpa o cookie e retorna sucesso", async () => {
    const cleared: string[] = [];
    const ctx = createCtx({
      user: {
        id: 1, openId: "test-open-id", name: "Test", email: "test@sage.com",
        loginMethod: "email", role: "user",
        createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      res: { clearCookie: (name: string) => cleared.push(name) } as TrpcContext["res"],
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared.length).toBeGreaterThan(0);
  });
});

describe("Rotas tRPC Sage", () => {
  it("routers do sage estão registrados", () => {
    const keys = Object.keys(appRouter._def.procedures);
    // Verificar que os principais namespaces existem
    const hasUsuarios = keys.some(k => k.startsWith("usuarios"));
    const hasDispositivos = keys.some(k => k.startsWith("dispositivos"));
    const hasPedidos = keys.some(k => k.startsWith("pedidos"));
    const hasTickets = keys.some(k => k.startsWith("tickets"));
    const hasAdmin = keys.some(k => k.startsWith("admin"));
    const hasSensores = keys.some(k => k.startsWith("sensores"));

    expect(hasUsuarios).toBe(true);
    expect(hasDispositivos).toBe(true);
    expect(hasPedidos).toBe(true);
    expect(hasTickets).toBe(true);
    expect(hasAdmin).toBe(true);
    expect(hasSensores).toBe(true);
  });
});
