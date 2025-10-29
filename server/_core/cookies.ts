import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> & { partitioned?: boolean } {
  const isSecure = isSecureRequest(req);
  const isDevelopment = process.env.NODE_ENV !== "production";

  // 開発環境ではsameSiteを"lax"に設定してプレビューでのクッキー送信を許可
  // 本番環境では"none"を使用してCORS対応
  const sameSite = isDevelopment ? "lax" : "none";

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure: isSecure,
    // CHIPS (Cookies Having Independent Partitioned State) を使用
    // Chrome 114+でサポートされ、サードパーティクッキーを許可
    partitioned: isSecure && !isDevelopment,
  };
}
