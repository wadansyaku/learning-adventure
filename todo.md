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
- [x] **チャット機能の"(void 0) is not a function"エラーを修正** (推定30分) - ✅ 完了（Phase 1.1で修正）
  - エラー: `(void 0) is not a function`
  - 原因: `getStudentAchievementsByStudentId`関数が存在しなかった
  - 修正: Phase 1.1で修正済み
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
- [ ] **アイテム画像が正しく表示されない問題を修正** (推定60分)
  - 問題: ガチャで出てくるアイテムと画像が一致していない
  - 原因: `gachaItems`と`characterItems`のアイテム名が一致していない
  - 一部修正: `getStudentItemsWithDetails()`を名前ベースのマッチングに修正
  - 結果: 一部のアイテム（ニット帽、キャップ）は正しく表示されるが、他のアイテムはシルクハット画像が表示される
  - 残り作業: `gachaItems`と`characterItems`のデータを統一する
  - ファイル: `server/db.ts`, データベース

---

## 📋 Phase 1: 機能追加（優先度: 高）

### 1.1 保護者画面のデータ反映
- [x] **保護者画面で実際に登録した子供のデータを反映** (推定1時間) - ✅ 完了
  - 問題: 保護者画面で「お子様が登録されていません」と表示される
  - 原因: ParentDashboard.tsxの`getMyChildren`クエリの`enabled`条件が`user?.role === 'parent'`のみだった
  - 修正内容:
    1. ParentDashboard.tsxの`enabled`条件を`user?.role === 'parent' || user?.role === 'admin'`に変更
    2. 管理者の場合も`getMyChildren`クエリが実行されるようになった
  - 結果: 保護者画面で子供のデータ（名前、学習時間、完了タスク、継続日数）が正しく表示される
  - ファイル: `client/src/pages/ParentDashboard.tsx`

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

- **Phase 0 (緊急バグ修正):** 3/5 完了 (ガチャシステム、装備表示、キャラクター選択)
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


---

## 🐛 Phase 0.6: 新規バグ修正（2025-10-30追加）

### 0.6.1 ログインボーナスの矛盾修正
- [x] **ログインボーナスの表示コインとXPの矛盾を修正** (推定30分)
  - 問題: 3日目は「14コインと7XP」と表示されるが、右下のコメントでは「16コインと8XP」と表示される
  - 原因: ログインボーナスの計算ロジックまたは表示ロジックが2箇所で異なる
  - 修正: ログインボーナスのロジックを統一
  - ファイル: `server/routers/student.ts`, `client/src/pages/StudentDashboard.tsx`

### 0.6.2 生徒ビューの右下コメント削除
- [x] **生徒ビューで右下にひょっこり出てくるコメントを削除** (推定15分)
  - 問題: 右下のコメント表示が不要
  - 修正: コメント表示機能を削除またはオプション化
  - ファイル: `client/src/pages/StudentDashboard.tsx`

---

## 🔍 Phase 0.7: システム批判的分析と改善タスク

### 0.7.1 UI/UX改善
- [ ] **不要なアニメーションやポップアップを削除** (推定1時間)
  - 分析: 生徒ビューで不要な通知が多い可能性
  - 改善: 通知を最小限に抑え、重要な情報のみ表示

### 0.7.2 データ整合性の確認
- [x] **gachaItemsとcharacterItemsのデータ統一** (推定1時間)
  - 問題: 2つのテーブルにアイテムデータが分散している
  - 改善: 1つのテーブルに統一するか、明確な役割分担を定義

### 0.7.3 エラーハンドリングの改善
- [ ] **500エラーの詳細ログを追加** (推定30分)
  - 問題: チャット機能などで500エラーが発生しているが、詳細が不明
  - 改善: サーバーログに詳細なエラー情報を出力

### 0.7.4 パフォーマンス最適化
- [ ] **不要なデータベースクエリを削減** (推定1時間)
  - 分析: 同じデータを複数回取得している可能性
  - 改善: クエリを最適化し、キャッシュを活用


---

## 🚨 Phase 1: 最優先バグ修正（2025-10-30追加）

### 1.1 チャット機能のエラー修正
- [x] **「(void 0) is not a function」エラーを修正** (推定45分) - ✅ 完了
  - 問題: キャラクターとチャットしようとすると500エラーが発生し、メッセージが送信できない
  - 原因: `getStudentAchievementsByStudentId`関数が存在せず、正しい関数名は`getStudentAchievements`だった
  - 修正内容:
    1. chat.tsの107行目で`db.getStudentAchievementsByStudentId(student.id)`を`db.getStudentAchievements(student.id)`に修正
    2. getStudentContext関数に詳細なログとエラーハンドリングを追加
    3. getGreeting procedureにエラーハンドリングとログを追加
  - 結果: チャット機能が完全に動作し、挨拶メッセージとユーザーメッセージへの応答が正常に表示される
  - ファイル: `server/routers/chat.ts`

### 1.2 「なかまをえらぶ」ボタンの問題修正
- [x] **「もう仲間がいるよ」エラーを修正** (推定30分) - ✅ 完了
  - 問題: 「なかまをえらぶ」ボタンを押すと「もう仲間がいるよ」と表示され、画面移行できない
  - 原因: CharacterSelect.tsxのuseEffectが既存キャラクターがいる場合に自動的にリダイレクトしていた
  - 修正内容:
    1. useEffectを修正して、既存キャラクターがいてもページを表示するように変更
    2. handleConfirm関数に既存キャラクターチェックを追加し、新規作成を禁止
    3. ページ上部に警告メッセージを追加
  - 結果: キャラクター選択画面が正常に表示され、既存キャラクターがいる場合は警告が表示される
  - ファイル: `client/src/pages/CharacterSelect.tsx`

### 1.3 生徒ビュー全体のトースト通知削除
- [x] **生徒ビューのすべての右下トースト通知を削除** (推定30分) - ✅ 完了
  - 問題: 生徒ビューで右下にトースト通知が表示される
  - 修正内容:
    1. StudentDashboard.tsx - 2箇所（プロフィール作成成功/失敗）
    2. Inventory.tsx - 4箇所（装備成功/失敗、装備解除成功/失敗）
    3. CharacterChat.tsx - 1箇所（エラー）
    4. CharacterSelect.tsx - 5箇所（キャラクター作成関連）
    5. ProblemPlay.tsx - 5箇所（問題回答関連）
  - 結果: すべてのtoast関数をコメントアウトし、console.logでログを出力
  - ファイル: `client/src/pages/StudentDashboard.tsx`, `client/src/pages/Inventory.tsx`, `client/src/pages/ProblemPlay.tsx`, `client/src/components/CharacterChat.tsx`, `client/src/pages/CharacterSelect.tsx`

---

### 0.5 調査結果（2025-11-01）
- **問題確認:** 「ふしぎなきいろのそら」がシルクハット画像で表示される
- **原因:** characterItemsテーブルに535行のデータがあり、一部のアイテムのimageUrlが正しく設定されていない可能性
- **技術的詳細:**
  - ガチャシステムは既にcharacterItemsを使用（修正済み）
  - getStudentItemsWithDetails関数は正しくJOINしている
  - 問題はcharacterItemsテーブルのデータ品質にある
- **次のステップ:** characterItemsテーブルの全アイテムのimageUrlを確認し、正しい画像URLを設定する必要がある
- **推定時間:** 60分以上（データベースの大規模な修正が必要）

