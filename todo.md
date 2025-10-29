# Learning Adventure - TODO

**最終更新:** 2025-10-30 06:30  
**バージョン:** フェーズ1完了  
**包括的開発計画:** [COMPREHENSIVE_DEVELOPMENT_PLAN.md](./docs/COMPREHENSIVE_DEVELOPMENT_PLAN.md)

---

## 🎯 包括的開発計画サマリー

システム全体を深く解析した結果、**35個の重要なタスク**を特定しました。これらを**8つの並列開発トラック**に分割し、競合を避けながら効率的に開発を進めます。

### システム現状
- **データベース:** 29テーブル
- **サーバー関数:** 72関数（server/db.ts: 1451行）
- **ルーター:** 14個のサブルーター
- **ページ:** 18個のReactコンポーネント
- **完了度:** 約85%

### 総推定時間
- **並列開発:** 21-24時間
- **直列開発:** 33.5時間
- **時間短縮:** 約30%

---

## 📋 フェーズ1: 緊急修正（優先度: 最高 - 1-2日）

### Track 1: データ整合性修正 ✅

#### 1.1 帽子画像のS3アップロードとDB登録
- [x] **35個の帽子WebPファイルをS3にアップロードしてDB登録** (推定2時間)
  - 問題: 35個の帽子WebPファイルが存在するが、gachaItemsテーブルが空
  - 影響: ガチャシステムが機能しない
  - 実装:
    1. `scripts/upload_hats_to_s3.ts`を実行
    2. 35個の帽子をS3にアップロード
    3. gachaItemsテーブルに登録
    4. レアリティ分布を確認（Common: 4, Uncommon: 8, Rare: 9, Epic: 8, Legendary: 6）
  - ファイル: `scripts/upload_hats_to_s3.ts`, `drizzle/schema.ts`

#### 1.2 aiConversationsテーブルのデータ検証
- [x] **aiConversationsテーブルのデータを検証** (推定30分)
  - 問題: AI会話ログが保存されているか不明
  - 実装:
    1. aiConversationsテーブルのレコード数を確認
    2. サンプルデータを確認
    3. 必要に応じてテストデータを追加
  - ファイル: SQL実行

---

### Track 2: 保護者ビュー改善 ✅

#### 2.1 学習時間計算の修正
- [x] **保護者ビューの総学習時間計算を修正** (推定2時間)
  - 問題: 総学習時間が仮実装（問題数 × 0.5時間）
  - 現在: `const totalStudyHours = weeklyData.reduce((sum, d) => sum + (d.problems || 0), 0) * 0.5;`
  - 修正後: `studentProgress.timeSpent`から正確な学習時間を計算
  - 実装:
    1. `getChildWeeklyData`関数を修正してtimeSpentを集計
    2. ParentDashboard.tsxで正確な学習時間を表示
    3. 時間フォーマット（秒→時間・分）
  - ファイル: `server/db.ts`, `client/src/pages/ParentDashboard.tsx`

#### 2.2 学習効率の計算ロジック検証
- [x] **学習効率の計算ロジックを検証** (推定1時間)
  - 問題: 学習効率の計算が正答率のみ
  - 改善: 学習時間と正答率を組み合わせた効率指標
  - 実装:
    1. 効率 = (正答率 × 100) / (平均解答時間 / 60)
    2. グラフで可視化
  - ファイル: `client/src/pages/ParentDashboard.tsx`

---

### Track 3: OpenAI使用状況改善 ✅

#### 3.1 aiConversationsテーブルのデータ集計
- [x] **aiConversationsテーブルのデータを集計に含める** (推定1時間)
  - 問題: `getOpenAIUsageSummary`がopenaiUsageLogsのみを集計、aiConversationsを含まない
  - 実装:
    1. `getOpenAIUsageSummary`を修正してaiConversationsも集計
    2. 両テーブルのデータを統合
    3. トークン数とコストを合算
  - ファイル: `server/db.ts`

#### 3.2 OpenAI使用状況の自動更新
- [x] **管理者ダッシュボードのOpenAI使用状況を自動更新** (推定1時間)
  - 問題: 管理者ダッシュボードでOpenAI使用状況が手動リロードが必要
  - 実装:
    1. OpenAIUsageStats.tsxにポーリング機能を追加
    2. 30秒ごとに自動更新
    3. リアルタイム更新のUI表示
  - ファイル: `client/src/components/OpenAIUsageStats.tsx`

---

## 📋 フェーズ2: 機能完成（優先度: 高 - 2-3日）

### Track 4: ガチャシステム完成 ✅

#### 4.1 ガチャで帽子画像を表示
- [x] **ガチャ結果で帽子画像を表示** (推定1時間)
  - 問題: ガチャ結果で帽子画像が表示されない
  - 実装:
    1. Gacha.tsxで帽子画像を表示
    2. レアリティ別のエフェクト強化
    3. 帽子プレビュー機能
  - ファイル: `client/src/pages/Gacha.tsx`

#### 4.2 所持アイテム一覧ページ作成
- [x] **所持アイテム一覧ページを作成** (推定1.5時間)
  - 問題: 生徒が所持している帽子を確認できない
  - 実装:
    1. Inventory.tsxページを作成
    2. 所持アイテム一覧表示
    3. 装備中の帽子を表示
    4. 帽子の装備・解除機能
  - ファイル: `client/src/pages/Inventory.tsx` (新規), `server/routers/gacha.ts`, `client/src/App.tsx`

#### 4.3 キャラクターに帽子を装備する機能
- [ ] **キャラクターに帽子を装備する機能を実装** (推定30分)
  - 問題: 帽子を取得しても装備できない
  - 実装:
    1. StudentDashboardでキャラクター画像に帽子を重ねて表示
    2. 帽子の装備状態を管理
    3. 帽子のプレビュー機能
  - ファイル: `client/src/pages/StudentDashboard.tsx`, `server/routers/gacha.ts`

---

### Track 7: UI/UX改善 ⏳

#### 7.1 ローディング状態の改善
- [ ] **ローディング状態を統一** (推定2時間)
  - 問題: ローディング中のUIが統一されていない
  - 実装:
    1. 共通のLoadingコンポーネント作成
    2. スケルトンスクリーンの導入
    3. プログレスバーの追加
  - ファイル: `client/src/components/Loading.tsx` (新規), 全ページコンポーネント

#### 7.2 エラーハンドリングの改善
- [ ] **エラーハンドリングを改善** (推定2時間)
  - 問題: エラーメッセージが不親切
  - 実装:
    1. エラー種別ごとのメッセージ
    2. リトライボタンの追加
    3. エラーログの記録
  - ファイル: `client/src/components/ErrorBoundary.tsx`, 全ページコンポーネント

#### 7.3 モバイルUI最適化
- [ ] **モバイルUIを最適化** (推定1時間)
  - 問題: モバイルでの操作性が低い
  - 実装:
    1. タッチ操作の最適化
    2. フォントサイズの調整
    3. ボタンサイズの拡大
  - ファイル: 全ページコンポーネント

---

## 📋 フェーズ3: コード品質改善（優先度: 中 - 3-4日）

### Track 5: コード品質改善 ⏳

#### 5.1 db.tsのリファクタリング
- [ ] **db.tsを機能別にファイル分割** (推定5時間)
  - 問題: db.tsが1451行に肥大化
  - 実装:
    1. 機能別にファイル分割
       - `server/db/user.ts` - ユーザー関連
       - `server/db/student.ts` - 生徒関連
       - `server/db/teacher.ts` - 講師関連
       - `server/db/parent.ts` - 保護者関連
       - `server/db/problem.ts` - 問題関連
       - `server/db/gacha.ts` - ガチャ関連
       - `server/db/story.ts` - ストーリー関連
       - `server/db/achievement.ts` - 実績関連
       - `server/db/openai.ts` - OpenAI関連
       - `server/db/ranking.ts` - ランキング関連
    2. 各ファイルで関数をエクスポート
    3. `server/db/index.ts`で再エクスポート
    4. 全ルーターのインポートを更新
  - ファイル: `server/db.ts` → `server/db/*.ts`, 全ルーター

#### 5.2 TypeScript型定義の強化
- [ ] **TypeScript型定義を強化** (推定1時間)
  - 問題: any型の多用
  - 実装:
    1. 全関数の戻り値型を明示
    2. any型を具体的な型に置き換え
    3. Zodスキーマの追加
  - ファイル: 全サーバーファイル

---

### Track 6: パフォーマンス最適化 ⏳

#### 6.1 ランキングシステムのN+1クエリ解消
- [ ] **ランキングシステムのN+1クエリを解消** (推定2時間)
  - 問題: ランキング取得時にN+1クエリが発生
  - 実装:
    1. JOINクエリで最適化
    2. インデックスの追加
    3. キャッシュの導入
  - ファイル: `server/db.ts`

#### 6.2 画像の遅延読み込み
- [ ] **画像の遅延読み込みを実装** (推定2時間)
  - 問題: 全画像が一度に読み込まれる
  - 実装:
    1. React.lazyでコンポーネントの遅延読み込み
    2. 画像のlazyloading属性追加
    3. Intersection Observerの導入
  - ファイル: 全ページコンポーネント

---

## 📋 フェーズ4: テスト実装（優先度: 低 - 4-5日）

### Track 8: テスト実装 ⏳

#### 8.1 ユニットテストの拡充
- [ ] **ユニットテストを拡充** (推定4時間)
  - 問題: テストカバレッジが不足
  - 実装:
    1. 主要なdb.ts関数のテスト
    2. ルーターのテスト
    3. コンポーネントのテスト
  - ファイル: `tests/db.test.ts`, `tests/routers.test.ts`, `tests/components.test.ts`

#### 8.2 E2Eテストの実装
- [ ] **E2Eテストを実装** (推定4時間)
  - 問題: E2Eテストが存在しない
  - 実装:
    1. Playwrightの導入
    2. 主要なユーザーフローのテスト
    3. CI/CDパイプラインの構築
  - ファイル: `tests/e2e/*.spec.ts` (新規)

---

## ✅ 完了済みタスク

### Phase 0.5: 新規バグ修正と機能追加 ✅

#### 0.5.1 プレビュー認証問題 ✅
- [x] **プレビューでログイン後の画面に移行できない** (完了)
  - 修正: 開発環境でsameSiteを"lax"に変更、Partitioned属性を追加
  - ファイル: `server/_core/cookies.ts`

#### 0.5.2 帽子画像の追加 ✅
- [x] **35種類の帽子画像をWebPに変換** (完了)
  - 実装: PNG→WebP変換（sharpライブラリ使用）
  - ファイル: `scripts/convert_hats.ts`, `public/hats/*.webp`

**注意:** 帽子画像はWebP形式で存在しますが、**S3アップロードとDB登録が未完了**です。これはフェーズ1のTask 1.1で実施します。

---

### Phase 0: 緊急バグ修正 ✅

#### 0.1 OpenAI API設定 ✅
- [x] **OpenAI APIキーを設定** (完了)
  - 設定値: kateikyoushi
  - ファイル: `.env`

#### 0.2 致命的バグ修正 ✅
- [x] **adminが生徒画面でstudentに変わってしまうバグ** (完了)
  - 修正: adminのロール変更を禁止
  - ファイル: `server/routers.ts`

- [x] **ランキングの「しゅうかん」でエラー** (完了)
  - 修正: nullチェック追加、表記修正
  - ファイル: `client/src/pages/Ranking.tsx`

#### 0.3 AI会話ログ保存 ✅
- [x] **AIとのやりとりをデータベースに保存** (完了)
  - 実装: aiConversationsテーブル追加、会話ログ保存処理実装
  - ファイル: `drizzle/schema.ts`, `server/db.ts`, `server/routers/chat.ts`

#### 0.4 UI修正 ✅
- [x] **ホーム画面下の「おはなししよう!」を削除** (完了)
  - 修正: キャラクター会話カードを削除
  - ファイル: `client/src/pages/StudentDashboard.tsx`

---

### Phase 1: 緊急修正 ✅

#### 1.1 ナビゲーション改善 ✅
- [x] **ランキングページからホームに戻れるようにする** (完了)
  - 修正: ヘッダーに「ホームにもどる」ボタンを追加
  - ファイル: `client/src/pages/Ranking.tsx`

- [x] **ランキングページの表記修正** (完了)
  - 修正: 「つきかん」→「げっかん」に変更
  - ファイル: `client/src/pages/Ranking.tsx`

#### 1.2 視認性向上 ✅
- [x] **コイン・ジェム・レベルをホームに分かりやすく表示** (完了)
  - 修正: StudentHeaderコンポーネント作成、アイコン + 数値で視覚化
  - ファイル: `client/src/components/StudentHeader.tsx`

#### 1.3 キャラクター管理 ✅
- [x] **キャラクター選択後も動物一覧を表示できるようにする** (完了)
  - 修正: 「なかまをえらぶ」ボタンを常に表示
  - ファイル: `client/src/pages/StudentDashboard.tsx`

#### 1.4 アクセス制御強化 ✅
- [x] **ロールベースアクセス制御の強化** (完了)
  - 修正: RoleSwitcherをadminのみに表示
  - ファイル: `client/src/components/RoleSwitcher.tsx`

---

### Phase 2: UI/UX改善 ✅

#### 2.1 生徒ホームUI改善 ✅
- [x] **生徒ホームのボタン配置を整える** (完了)
  - 修正: グリッドシステム導入、統一されたカードデザイン
  - ファイル: `client/src/pages/StudentDashboard.tsx`

#### 2.2 キャラクター会話機能 ✅
- [x] **ホーム直下にキャラクターを表示して会話できるようにする** (完了)
  - 実装: CharacterChatコンポーネント作成、OpenAI API統合
  - ファイル: `client/src/components/CharacterChat.tsx`, `server/routers/chat.ts`

#### 2.3 ガチャ改善 ✅
- [x] **ガチャのアイテム重複チェック** (完了)
  - 修正: 所持済みアイテムを除外、重複時にボーナスコイン付与
  - ファイル: `server/routers/gacha.ts`

- [x] **ガチャのサウンド・エフェクトを追加** (完了)
  - 実装: レアリティ別エフェクト、光エフェクト、パルスアニメーション
  - ファイル: `client/src/pages/Gacha.tsx`

---

## 📊 プロジェクト概要

| 指標 | 値 |
|------|-----|
| 総コード行数 | 16,000行+ |
| データベーステーブル数 | 29テーブル |
| サーバー関数数 | 72関数 |
| tRPCエンドポイント数 | 50エンドポイント+ |
| 主要ページ数 | 18ページ |
| 実装完了度 | 約85% |
| **システム稼働状況** | **🟢 正常動作** |

---

## 🎯 次のアクション

### 即座に実施（フェーズ1）
1. **Track 1: 帽子画像のS3アップロードとDB登録**
2. **Track 2: 保護者ビューの学習時間計算修正**
3. **Track 3: OpenAI使用状況の改善**

### チェックポイント保存
- フェーズ1完了後にチェックポイント保存
- フェーズ2完了後にチェックポイント保存
- フェーズ3完了後にチェックポイント保存
- フェーズ4完了後にチェックポイント保存

---

## 📝 注意事項

- OpenAI APIキーは既に設定済み（.envファイル）
- 帽子画像は35個のWebPファイルとして存在（public/hats/）
- **帽子画像のS3アップロードとDB登録が未完了**（フェーズ1で実施）
- adminロール変更は禁止されている（routers.tsで実装済み）
- データベースは29テーブルに拡張済み
- 認証システムはプレビュー対応完了（sameSite='lax'、Partitioned属性追加）

---

## 🚨 Phase 0.6: 緊急バグ修正（優先度: 最高 - 即対応）

### 0.6.1 ロール切り替えとナビゲーションのバグ

- [x] **生徒画面から別ページに移動すると管理者ダッシュボードに戻る**
  - 問題: 管理者が生徒ビューに切り替えて、生徒画面内で別ページに移動すると管理者ダッシュボードに戻ってしまう
  - 影響: 生徒ビューでの動作確認ができない
  - 原因: ロール切り替え時の認証チェックロジックの問題
  - ファイル: `client/src/_core/hooks/useAuth.ts`, 各ページコンポーネント

- [x] **管理者画面で「管理者画面に戻る」を押すとロール切り替え失敗エラー**
  - 問題: 管理者画面から「管理者」を押して「管理者画面に戻る」を押すと「ロール切り替えは失敗しました。」と表示される
  - 影響: 管理者が元の画面に戻れない
  - 原因: RoleSwitcherコンポーネントのロジックエラー
  - ファイル: `client/src/components/RoleSwitcher.tsx`

### 0.6.2 OpenAI API エラー

- [x] **キャラクター会話でOpenAI API Error (404 page not found)**
  - 問題: キャラクターとお話ししようとすると「Open AI API Error」「404 page not found」が表示される
  - 影響: AI会話機能が完全に使用不可
  - 原因: `getStudentContext`で`userId`と`student.id`を混同、プロファイルチェック不足
  - 修正: `server/routers/chat.ts` (51行目), `client/src/components/CharacterChat.tsx` (プロファイルチェック追加)



---

## 🚨 Phase 0.8: OpenAI APIエラーの再調査と修正（優先度: 最高 - 即対応）

### 0.8.1 OpenAI APIエラーの深い分析

- [x] **OpenAI APIエラーを深く分析して原因を特定**
  - 問題: キャラクター会話でまだOpenAI API Errorが発生している
  - 影響: AI会話機能が使用不可
  - 調査項目:
    1. APIキーの有効性確認
    2. APIエンドポイントの正確性確認
    3. リクエストペイロードの検証
    4. エラーレスポンスの詳細確認
    5. chat.tsとcharacter.tsの2つのルーターの違い
  - ファイル: `server/routers/chat.ts`, `server/routers/character.ts`, `client/src/components/CharacterChat.tsx`

- [x] **OpenAI APIキーを更新**
  - 新しいAPIキーをSettings → Secretsで更新完了

- [x] **APIエラーの根本原因を修正**
  - chat.tsとcharacter.tsで`BUILT_IN_FORGE_API_KEY`を`OPENAI_API_KEY`に修正
  - character.tsで不要な`baseURL`を削除
