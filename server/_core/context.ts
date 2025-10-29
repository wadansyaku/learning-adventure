import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  console.log('[Context] Creating context', {
    path: opts.req.path,
    method: opts.req.method,
    hasCookie: !!opts.req.headers.cookie,
    cookiePreview: opts.req.headers.cookie ? opts.req.headers.cookie.substring(0, 50) + '...' : 'none',
  });

  try {
    user = await sdk.authenticateRequest(opts.req);
    console.log('[Context] User authenticated', { 
      userId: user.id, 
      role: user.role,
      openId: user.openId.substring(0, 10) + '...',
    });
  } catch (error) {
    console.error('[Context] Authentication failed', {
      error: error instanceof Error ? error.message : String(error),
      path: opts.req.path,
      hasCookie: !!opts.req.headers.cookie,
    });
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
