# Learning Adventure - 認証システム分析レポート

**作成日:** 2025-10-30 04:00  
**対象バージョン:** ec013854  
**分析者:** Manus AI Agent

---

## 📋 認証フロー概要

Learning Adventureの認証システムは、**Manus OAuth**を使用した外部認証システムに依存しています。

### 認証フロー図

```
1. ユーザー → ログインボタンクリック
2. ブラウザ → OAuth認証ページにリダイレクト
3. ユーザー → 認証情報を入力
4. OAuth Server → 認証コードを発行
5. ブラウザ → /api/oauth/callback にリダイレクト（code, state付き）
6. サーバー → コードをアクセストークンに交換
7. サーバー → ユーザー情報を取得
8. サーバー → データベースにユーザーを登録/更新
9. サーバー → セッションJWTを生成
10. サーバー → クッキーにセッションJWTを設定
11. ブラウザ → ホーム画面にリダイレクト
```

---

## 🔍 コンポーネント分析

### 1. OAuth コールバック処理 (`server/_core/oauth.ts`)

**役割:** OAuth認証コードをアクセストークンに交換し、ユーザー情報を取得してセッションを作成

**重要なコード:**
```typescript
// oauth.ts (39-46行目)
const sessionToken = await sdk.createSessionToken(userInfo.openId, {
  name: userInfo.name || "",
  expiresInMs: ONE_YEAR_MS,
});

const cookieOptions = getSessionCookieOptions(req);
res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

res.redirect(302, "/");
```

**分析:**
- ✅ セッショントークンの生成は正常
- ✅ クッキーの設定は正常
- ⚠️ クッキーオプションの詳細が不明（`getSessionCookieOptions`の実装を確認必要）

---

### 2. SDK Server (`server/_core/sdk.ts`)

**役割:** OAuth APIとの通信、セッションJWTの生成・検証、リクエストの認証

#### 2.1 セッションJWTの生成 (`signSession`)

```typescript
// sdk.ts (181-198行目)
async signSession(
  payload: SessionPayload,
  options: { expiresInMs?: number } = {}
): Promise<string> {
  const issuedAt = Date.now();
  const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
  const secretKey = this.getSessionSecret();

  return new SignJWT({
    openId: payload.openId,
    appId: payload.appId,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}
```

**分析:**
- ✅ JWT生成ロジックは正常
- ✅ HS256アルゴリズムを使用
- ✅ 有効期限は1年（ONE_YEAR_MS）
- ✅ シークレットキーは環境変数から取得

#### 2.2 セッションJWTの検証 (`verifySession`)

```typescript
// sdk.ts (200-233行目)
async verifySession(
  cookieValue: string | undefined | null
): Promise<{ openId: string; appId: string; name: string } | null> {
  if (!cookieValue) {
    console.warn("[Auth] Missing session cookie");
    return null;
  }

  try {
    const secretKey = this.getSessionSecret();
    const { payload } = await jwtVerify(cookieValue, secretKey, {
      algorithms: ["HS256"],
    });
    const { openId, appId, name } = payload as Record<string, unknown>;

    if (
      !isNonEmptyString(openId) ||
      !isNonEmptyString(appId) ||
      !isNonEmptyString(name)
    ) {
      console.warn("[Auth] Session payload missing required fields");
      return null;
    }

    return {
      openId,
      appId,
      name,
    };
  } catch (error) {
    console.warn("[Auth] Session verification failed", String(error));
    return null;
  }
}
```

**分析:**
- ✅ JWT検証ロジックは正常
- ⚠️ **重要:** `cookieValue`が`undefined`または`null`の場合、`null`を返す
- ⚠️ **重要:** エラーが発生した場合、`null`を返す（エラーの詳細がログに出力されるのみ）

**問題点:**
- **「Missing session cookie」ログが頻繁に出力される** = クッキーが送信されていない、または読み取れていない

#### 2.3 リクエストの認証 (`authenticateRequest`)

```typescript
// sdk.ts (259-301行目)
async authenticateRequest(req: Request): Promise<User> {
  // Regular authentication flow
  const cookies = this.parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);
  const session = await this.verifySession(sessionCookie);

  if (!session) {
    throw ForbiddenError("Invalid session cookie");
  }

  const sessionUserId = session.openId;
  const signedInAt = new Date();
  let user = await db.getUserByOpenId(sessionUserId);

  // If user not in DB, sync from OAuth server automatically
  if (!user) {
    try {
      const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(userInfo.openId);
    } catch (error) {
      console.error("[Auth] Failed to sync user from OAuth:", error);
      throw ForbiddenError("Failed to sync user info");
    }
  }

  if (!user) {
    throw ForbiddenError("User not found");
  }

  await db.upsertUser({
    openId: user.openId,
    lastSignedIn: signedInAt,
  });

  return user;
}
```

**分析:**
- ✅ クッキーからセッションJWTを取得
- ✅ セッションJWTを検証
- ✅ ユーザー情報をデータベースから取得
- ✅ ユーザーが存在しない場合、OAuth Serverから同期
- ⚠️ **問題:** `session`が`null`の場合、`ForbiddenError`をスロー

**問題点:**
- **クッキーが送信されていない** → `sessionCookie`が`undefined` → `verifySession`が`null`を返す → `ForbiddenError`がスローされる

---

### 3. tRPC コンテキスト (`server/_core/context.ts`)

**役割:** tRPCリクエストごとにコンテキストを作成し、認証されたユーザー情報を含める

```typescript
// context.ts (11-28行目)
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
```

**分析:**
- ✅ `sdk.authenticateRequest`を呼び出してユーザーを認証
- ✅ エラーが発生した場合、`user`を`null`に設定（publicProcedureのため）
- ⚠️ **問題:** エラーが発生しても、エラーの詳細がログに出力されない

**問題点:**
- **認証エラーが発生しても、`user`が`null`になるだけ** → adminProcedureで`FORBIDDEN`エラーが発生
- **エラーの詳細が不明** → デバッグが困難

---

### 4. tRPC Procedures (`server/_core/trpc.ts`)

**役割:** ロールベースのアクセス制御を実装

#### 4.1 adminProcedure

```typescript
// trpc.ts (30-45行目)
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
```

**分析:**
- ✅ `ctx.user`が`null`の場合、`FORBIDDEN`エラーをスロー
- ✅ `ctx.user.role`が`'admin'`でない場合、`FORBIDDEN`エラーをスロー

**問題点:**
- **`ctx.user`が`null`の場合、管理者画面のAPIが全て失敗する**
- **OpenAI使用状況APIが読み込めない原因**

---

## 🚨 根本原因の特定

### 問題: 「Missing session cookie」ログが頻繁に出力される

**原因の可能性:**

#### 1. クッキーが送信されていない（最も可能性が高い）

**考えられる原因:**
- **SameSite属性の問題:** プレビューURLと開発サーバーのドメインが異なる場合、`SameSite=Strict`では クッキーが送信されない
- **Secure属性の問題:** HTTPS環境で`Secure=true`が必要だが、設定されていない可能性
- **Path属性の問題:** クッキーのPathが`/`でない場合、一部のリクエストでクッキーが送信されない
- **Domain属性の問題:** クッキーのDomainが正しく設定されていない

#### 2. クッキーの読み取りに失敗している

**考えられる原因:**
- **クッキー名の不一致:** `COOKIE_NAME`の値が正しくない
- **クッキーパーサーの問題:** `parseCookieHeader`関数にバグがある

#### 3. クッキーが設定されていない

**考えられる原因:**
- **OAuth コールバックが失敗している:** `/api/oauth/callback`でエラーが発生している
- **セッションJWTの生成に失敗している:** `createSessionToken`でエラーが発生している

---

## 🔍 デバッグ手順

### Step 1: クッキーの設定を確認

#### 1.1 `getSessionCookieOptions`の実装を確認

```bash
# cookies.tsファイルを探す
find /home/ubuntu/learning-adventure -name "cookies.ts" -type f
```

#### 1.2 クッキーオプションを確認

```typescript
// 期待される設定
{
  httpOnly: true,
  secure: true, // HTTPSの場合
  sameSite: 'lax', // または 'none'
  path: '/',
  maxAge: ONE_YEAR_MS
}
```

---

### Step 2: ブラウザでクッキーを確認

#### 2.1 ブラウザの開発者ツールを開く
1. 管理者ダッシュボードを開く
2. F12キーを押す
3. Applicationタブ → Cookies

#### 2.2 クッキーの存在を確認
- `manus-session`クッキーが存在するか？
- 値が設定されているか？
- 有効期限は正しいか？
- Domain, Path, SameSite, Secureの設定は正しいか？

---

### Step 3: ネットワークリクエストを確認

#### 3.1 Networkタブを開く
1. 管理者ダッシュボードを開く
2. F12キーを押す
3. Networkタブ

#### 3.2 tRPCリクエストを確認
1. `admin.getOpenAIUsageSummary`リクエストを探す
2. Request Headersに`Cookie`ヘッダーが含まれているか？
3. `Cookie`ヘッダーに`manus-session`が含まれているか？

---

### Step 4: サーバーログを詳細に確認

#### 4.1 認証ログを追加

```typescript
// context.ts
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  console.log('[Context] Creating context', {
    cookie: opts.req.headers.cookie,
    path: opts.req.path,
  });

  try {
    user = await sdk.authenticateRequest(opts.req);
    console.log('[Context] User authenticated', { userId: user.id, role: user.role });
  } catch (error) {
    console.error('[Context] Authentication failed', error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
```

---

## 📊 問題の影響範囲

| コンポーネント | 影響 | 深刻度 |
|---------------|------|--------|
| 管理者ダッシュボード | OpenAI使用状況が表示されない | 🔴 高 |
| 管理者ダッシュボード | 画面遷移が機能しない | 🔴 高 |
| 生徒ダッシュボード | 認証が失敗する可能性 | 🟡 中 |
| 講師ダッシュボード | 認証が失敗する可能性 | 🟡 中 |
| 保護者ダッシュボード | 認証が失敗する可能性 | 🟡 中 |

---

## 🎯 推奨される修正方法

### 修正1: クッキーオプションの確認と修正

#### 1.1 `cookies.ts`を確認
```typescript
// server/_core/cookies.ts
export function getSessionCookieOptions(req: Request) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction, // HTTPSの場合のみtrue
    sameSite: 'lax' as const, // 'lax'または'none'
    path: '/',
  };
}
```

#### 1.2 プレビューURL環境での設定
```typescript
// プレビューURL環境では常にHTTPS
export function getSessionCookieOptions(req: Request) {
  const isSecure = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
  
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    path: '/',
  };
}
```

---

### 修正2: 認証エラーのログを強化

#### 2.1 `context.ts`にログを追加
```typescript
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    console.error('[Context] Authentication failed', {
      error: error instanceof Error ? error.message : String(error),
      path: opts.req.path,
      hasCookie: !!opts.req.headers.cookie,
    });
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
```

---

### 修正3: adminProcedureのエラーメッセージを改善

#### 3.1 より詳細なエラーメッセージ
```typescript
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      console.error('[adminProcedure] User not authenticated');
      throw new TRPCError({ 
        code: "UNAUTHORIZED", 
        message: "認証が必要です。ログインしてください。" 
      });
    }

    if (ctx.user.role !== 'admin') {
      console.error('[adminProcedure] User is not admin', { 
        userId: ctx.user.id, 
        role: ctx.user.role 
      });
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "管理者権限が必要です。" 
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
```

---

## 💡 所見

Learning Adventureの認証システムは**設計上は正しい**ですが、**クッキーの送信に問題**がある可能性が高いです。

**最も可能性が高い原因:**
1. **SameSite属性の問題** - プレビューURL環境でクッキーが送信されない
2. **Secure属性の問題** - HTTPS環境で`Secure=true`が必要

**推奨される対応:**
1. `cookies.ts`の実装を確認
2. クッキーオプションを修正
3. ブラウザでクッキーの存在を確認
4. ネットワークリクエストでクッキーの送信を確認
5. 認証ログを強化してデバッグ

これらの修正により、管理者ダッシュボードの問題が解決される可能性が高いです。

---

**作成者:** Manus AI Agent  
**レビュー推奨:** バックエンドエンジニア、DevOpsエンジニア  
**次回更新:** 修正実施後
