# Learning Adventure - TODO

**最終更新:** 2025-10-30 13:05  
**バージョン:** Phase 1.4 - 緊急バグ修正  

---

## 🚨 Phase 0: 緊急バグ修正（最優先）

### 0.1 ガチャシステムのデータベースエラー修正
- [x] **ガチャ実行時のINSERTエラーを修正** (推定30分)
  - エラー: `insert into studentItems ... params: 1,11,,false` - characterIdがnullではなく空文字列
  - 原因: `addStudentItem`関数でcharacterIdにnullを正しく設定していない可能性
  - 修正: server/db.tsのaddStudentItem関数を確認し、characterIdをnullに設定
  - ファイル: `server/db.ts`, `server/routers/gacha.ts`

### 0.2 チャット機能のエラー修正
- [ ] **チャット機能の"(void 0) is not a function"エラーを修正** (推定30分)
  - エラー: `(void 0) is not a function`
  - 原因: 未定義の関数を呼び出している可能性
  - 修正: CharacterChat.tsxとchat.tsルーターを確認
  - ファイル: `client/src/components/CharacterChat.tsx`, `server/routers/chat.ts`

### 0.3 装備中の帽子画像が表示されない問題
- [x] **装備中の帽子画像の表示を修正** (推定20分)
  - 問題: StudentDashboardで装備中の帽子が表示されない
  - 原因: 画像URLが正しくない、またはCSSの問題
  - 修正: 画像URLとCSSを確認
  - ファイル: `client/src/pages/StudentDashboard.tsx`

### 0.4 キャラクター選択画面の問題
- [x] **キャラクター選択画面の「もう仲間がいるよ」エラーを修正** (推定20分)
  - 問題: 「なかまをえらぶ」を押すと「もう仲間がいるよ」と表示され画面遷移できない
  - 原因: CharacterSelect.tsxの既存キャラクターチェックが厳しすぎる
  - 修正: 複数キャラクター所持を許可するか、編集モードを追加
  - ファイル: `client/src/pages/CharacterSelect.tsx`

### 0.5 ベレー帽・キャップの画像参照エラー
- [ ] **ベレー帽・キャップの画像参照を修正** (推定30分)
  - 問題: ベレー帽やキャップの参照画像が違う
  - 原因: gachaItemsテーブルのimageUrlが間違っている可能性
  - 修正: データベースのimageUrlを確認し、正しい画像URLに更新
  - ファイル: SQL実行、`scripts/upload_hats_to_s3.ts`

---

## 📋 Phase 1: 機能追加（優先度: 高）

### 1.1 保護者画面のデータ反映
- [ ] **保護者画面で実際に登録した子供のデータを反映** (推定1時間)
  - 問題: 保護者画面で実際に登録した子供のデータが反映されていない
  - 原因: parentChildrenテーブルのデータが正しく取得されていない可能性
  - 修正: ParentDashboard.tsxとparent.tsルーターを確認
  - ファイル: `client/src/pages/ParentDashboard.tsx`, `server/routers/parent.ts`

### 1.2 usersテーブルのname更新
- [ ] **usersテーブルのnameデータを更新** (推定20分)
  - 問題: usersのnameのデータベースをいじったので、更新してほしい
  - 修正: データベースのusersテーブルのnameを確認し、必要に応じて更新
  - ファイル: SQL実行

### 1.3 表示名のカスタマイズ機能
- [ ] **各ユーザーが表示名を決められる機能を追加** (推定2時間)
  - 問題: 表示名を各ユーザーが決められるようにしたい
  - 実装:
    1. studentsテーブルにdisplayNameカラムを追加（既存）
    2. teachersテーブルにdisplayNameカラムを追加
    3. parentsテーブルにdisplayNameカラムを追加
    4. 各ダッシュボードに表示名編集機能を追加
  - ファイル: `drizzle/schema.ts`, `server/db.ts`, 各ダッシュボード

---

## 📋 Phase 2: 既存タスク（以前のtodo.mdから継続）

### Track 4: ガチャシステム完成 ✅

#### 4.1 ガチャで帽子画像を表示
- [x] **ガチャ結果で帽子画像を表示** (推定1時間)

#### 4.2 所持アイテム一覧ページ作成
- [x] **所持アイテム一覧ページを作成** (推定1.5時間)

#### 4.3 キャラクターに帽子を装備する機能
- [x] **キャラクターに帽子を装備する機能を実装** (推定30分)

---

### Track 7: UI/UX改善 ⏳

#### 7.1 ローディング状態の改善
- [ ] **ローディング状態を統一** (推定2時間)

#### 7.2 エラーハンドリングの改善
- [ ] **エラーハンドリングを改善** (推定2時間)

#### 7.3 モバイルUI最適化
- [ ] **モバイルUIを最適化** (推定1時間)

---

## 📊 進捗状況

- **Phase 0 (緊急バグ修正):** 3/5 完了
- **Phase 1 (機能追加):** 0/3 完了
- **Phase 2 (既存タスク):** 3/6 完了

**総合進捗:** 約 87% → 緊急バグ修正により一時的に 82% に低下

---

## 🎯 次のアクション

1. ガチャシステムのデータベースエラー修正（最優先）
2. チャット機能のエラー修正
3. 装備中の帽子画像表示修正
4. キャラクター選択画面の問題修正
5. ベレー帽・キャップの画像参照修正
