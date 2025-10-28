# Learning Adventure (ぼうけんがくしゅう)

**5歳児向けゲーミフィケーション学習支援アプリケーション**

---

## 概要

Learning Adventureは、5歳児を対象とした学習支援アプリケーションです。RPG要素と教育コンテンツを組み合わせ、実世界の宿題時間を最大化しながら、アプリを報酬・動機付けシステムとして活用する設計思想に基づいています。

### コンセプト

実世界の宿題や学習活動を主軸とし、アプリは以下の役割を果たします:

- **報酬システム:** 宿題完了時にXP・コイン・ガチャチケットを付与
- **動機付け:** キャラクター育成、ストーリー進行、実績解除で学習意欲を向上
- **可視化:** 学習進捗をグラフ・統計で保護者に提供
- **補助学習:** アプリ内問題で基礎学力を補強(算数500問)

---

## 主要機能

### 生徒向け
- ✅ レベル・XP・コインシステム
- ✅ 10種類の動物キャラクター(レベル解放制)
- ✅ 500問の算数問題(足し算、引き算、比較、パターン、図形)
- ✅ ガチャシステム(100アイテム、4段階レアリティ)
- ✅ ストーリーモード(10章、32学習クイズ、30宝物)
- ✅ 実績システム(20実績)
- ✅ ログインボーナス(連続ログインストリーク)
- ✅ ChatGPT統合(キャラクター会話、ひらがな対応)

### 講師向け
- ✅ 課題作成(宿題割り当て)
- ✅ 問題作成(アプリ内問題追加)
- ✅ 生徒進捗確認

### 保護者向け
- ✅ 詳細統計グラフ(正答率、学習時間、進捗)
- ✅ AI分析レポート
- ✅ 子供の学習状況可視化

---

## 技術スタック

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Wouter** - ルーティング
- **TailwindCSS** - スタイリング
- **shadcn/ui** - UIコンポーネント
- **Recharts** - グラフ可視化

### バックエンド
- **tRPC** - 型安全なAPI
- **Drizzle ORM** - データベースORM
- **MySQL** - データベース
- **Zod** - バリデーション

### インフラ
- **Manus Platform** - ホスティング・デプロイ
- **S3** - ファイルストレージ

---

## プロジェクト構造

```
learning-adventure/
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── pages/         # ページコンポーネント
│   │   ├── components/    # 再利用可能コンポーネント
│   │   ├── lib/           # ユーティリティ
│   │   └── hooks/         # カスタムフック
│   └── public/
│       └── characters/    # キャラクター画像(10種類)
├── server/                # バックエンド
│   ├── routers.ts         # tRPCルーター
│   ├── db.ts              # データベース関数
│   └── _core/             # コアモジュール
├── drizzle/               # データベーススキーマ
│   ├── schema.ts          # テーブル定義
│   └── relations.ts       # リレーション定義
├── scripts/               # シードスクリプト
│   ├── seed.ts            # 基本データ
│   ├── seed-extended.ts   # 拡張データ
│   └── seed-learning-quizzes.ts  # 学習クイズ
├── docs/                  # ドキュメント
│   ├── CRITICAL_ANALYSIS_V2.md
│   ├── LEARNING_CURRICULUM.md
│   ├── AI_ASSET_PROMPTS.md
│   └── archive/           # アーカイブ
├── SYSTEM_REPORT.md       # システム分析レポート
└── todo.md                # タスク管理
```

---

## セットアップ

### 前提条件
- Node.js 22.x
- pnpm
- MySQL 8.x

### インストール

```bash
# 依存関係のインストール
pnpm install

# データベースマイグレーション
pnpm db:push

# シードデータ投入
pnpm seed
pnpm seed:extended
pnpm seed:quizzes

# 開発サーバー起動
pnpm dev
```

### 環境変数

必要な環境変数は自動的に注入されます:
- `BUILT_IN_FORGE_API_KEY` - AI API キー
- `JWT_SECRET` - JWT署名キー
- `OAUTH_SERVER_URL` - OAuth認証URL
- `VITE_APP_TITLE` - アプリタイトル
- `VITE_APP_LOGO` - アプリロゴ

---

## データベース構造

### 主要テーブル(17テーブル)

**ユーザー管理:**
- `users` - ユーザー情報
- `students` - 生徒プロフィール

**キャラクター:**
- `characterTypes` - キャラクターマスターデータ(10種類)
- `characters` - 生徒が所有するキャラクター
- `characterItems` - 着せ替えアイテム(100個)
- `studentItems` - 生徒が所有するアイテム

**学習:**
- `problems` - 問題(500問)
- `tasks` - 課題
- `studentProgress` - 学習進捗

**ゲーミフィケーション:**
- `achievements` - 実績(20個)
- `studentAchievements` - 獲得実績
- `treasures` - 宝物(30個)
- `studentTreasures` - 獲得宝物

**ストーリー:**
- `storyChapters` - ストーリー章(10章)
- `learningQuizzes` - 学習クイズ(32問)
- `studentStoryProgress` - ストーリー進捗
- `studentQuizProgress` - クイズ進捗

---

## API構造

### tRPCルーター

- `auth` - 認証・ロール切り替え
- `student` - 生徒プロフィール・進捗
- `teacher` - 講師機能
- `parent` - 保護者機能
- `character` - キャラクター管理
- `task` - 課題管理
- `problem` - 問題管理
- `gacha` - ガチャシステム
- `story` - ストーリー進行
- `achievement` - 実績管理
- `item` - アイテム管理

---

## 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# データベースマイグレーション
pnpm db:push

# シードデータ投入
pnpm seed
pnpm seed:extended
pnpm seed:quizzes

# キャラクターデータ更新
pnpm update:characters

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

---

## デプロイ

Manus Platformを使用したデプロイ:

1. チェックポイントを作成
2. Management UIの「Publish」ボタンをクリック
3. 自動的にデプロイが実行されます

---

## ライセンス

MIT License

---

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

---

## サポート

問題が発生した場合は、GitHubのissueを作成してください。

---

**最終更新:** 2025-10-29  
**バージョン:** c99761f2
