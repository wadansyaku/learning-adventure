# チャットシステムアーキテクチャ

## 概要

Learning Adventureには2つの異なるチャットルーターが存在しています：

1. **chat.ts** - StudentDashboardのCharacterChatコンポーネントで使用
2. **character.ts** - /chatページで使用

## chat.ts vs character.ts

### chat.ts

**ファイル:** `server/routers/chat.ts`

**使用場所:** 
- `client/src/components/CharacterChat.tsx` (StudentDashboard内)

**特徴:**
- **モデル:** gpt-4o-mini（軽量、高速、低コスト）
- **API:** fetch APIを直接使用
- **エンドポイント:** `https://api.openai.com/v1/chat/completions`
- **機能:**
  - `getGreeting`: 初回挨拶メッセージ
  - `sendMessage`: ユーザーメッセージを送信してAI応答を取得
- **コンテクスト:**
  - 生徒プロフィール（名前、レベル、XP）
  - 最近の学習進捗（直近10問）
  - 正解率、学習時間
- **トークン制限:** 300トークン
- **温度:** 0.8（やや創造的）

**実装例:**
```typescript
const response = await fetch(OPENAI_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.8,
    max_tokens: 300,
  }),
});
```

---

### character.ts

**ファイル:** `server/routers/character.ts`

**使用場所:**
- `client/src/pages/CharacterChat.tsx` (/chatページ)

**特徴:**
- **モデル:** gpt-4o（高性能、高コスト）
- **API:** OpenAIライブラリを使用
- **機能:**
  - `chat`: キャラクターとの会話（使用制限チェック付き）
- **コンテクスト:**
  - 生徒プロフィール（名前、レベル、XP）
  - キャラクター情報（名前、動物タイプ）
  - 会話履歴（最大10件）
- **トークン制限:** 500トークン
- **温度:** 0.7（バランス型）
- **使用制限:** 1日10回まで

**実装例:**
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages,
  temperature: 0.7,
  max_tokens: 500,
});
```

---

## 比較表

| 項目 | chat.ts | character.ts |
|------|---------|--------------|
| モデル | gpt-4o-mini | gpt-4o |
| API | fetch API | OpenAIライブラリ |
| 使用場所 | StudentDashboard | /chatページ |
| トークン制限 | 300 | 500 |
| 温度 | 0.8 | 0.7 |
| 使用制限 | なし | 1日10回 |
| コスト | 低 | 高 |
| 速度 | 高速 | やや遅い |
| 品質 | 標準 | 高品質 |

---

## 統合方針

現在、2つのルーターが重複しているため、以下の方針で統合を検討：

### オプション1: chat.tsに統合（推奨）

**メリット:**
- 低コスト
- 高速
- StudentDashboard内で完結

**デメリット:**
- 応答品質がやや劣る

**実装:**
1. character.tsの機能（使用制限、会話履歴）をchat.tsに移植
2. /chatページを削除し、StudentDashboardのCharacterChatを拡張
3. 必要に応じてgpt-4oに切り替えるオプションを追加

### オプション2: character.tsに統合

**メリット:**
- 高品質な応答
- 会話履歴機能が充実

**デメリット:**
- 高コスト
- 使用制限が必要

**実装:**
1. chat.tsの軽量な実装をcharacter.tsに移植
2. StudentDashboardのCharacterChatを/chatページに統合
3. コスト管理のため使用制限を強化

### オプション3: ハイブリッド（現状維持+改善）

**メリット:**
- 用途に応じて使い分け
- コストと品質のバランス

**デメリット:**
- コードの重複
- メンテナンスコスト

**実装:**
1. StudentDashboard: chat.ts（gpt-4o-mini）- 日常的な会話
2. /chatページ: character.ts（gpt-4o）- 深い会話、学習相談
3. 共通のコンテクスト取得関数を作成

---

## コンテクスト強化計画

両方のルーターで以下のコンテクストを追加：

### 1. 学習履歴の詳細化

```typescript
// 最近の学習進捗（直近10問）
const recentProgress = await db.getStudentProgressByStudentId(student.id, 10);

// 正解率
const accuracy = (correctAnswers / totalProblems) * 100;

// 学習時間
const totalTimeSpent = recentProgress.reduce((sum, p) => sum + p.timeSpent, 0);

// 得意・苦手分野
const problemTypes = recentProgress.map(p => p.problemType);
```

### 2. ゲーミフィケーション要素

```typescript
// レベル、XP、コイン
const { level, xp, coins } = student;

// 装備中の帽子
const equippedHat = await db.getEquippedItem(student.id);

// 最近の実績
const recentAchievements = await db.getStudentAchievements(student.id);
```

### 3. システムプロンプトの改善

```typescript
const systemPrompt = `
あなたは「${characterName}」という名前の優しい先生です。
生徒の「${student.displayName}」さん（レベル${student.level}）と話しています。

【生徒の状況】
- 最近の正解率: ${accuracy.toFixed(1)}%
- 総学習時間: ${formatTime(totalTimeSpent)}
- 装備中の帽子: ${equippedHat?.name || 'なし'}
- コイン: ${student.coins}枚

【あなたの役割】
1. 生徒を励まし、学習意欲を高める
2. 学習の進捗を褒める
3. 苦手分野を優しくサポート
4. ゲーミフィケーション要素（レベル、コイン、帽子）を活用
5. 子供向けの優しい言葉遣い

【注意事項】
- 短く、わかりやすい文章で話す
- 絵文字を適度に使う
- 生徒の年齢に合わせた内容
`;
```

---

## 今後の改善

1. **会話履歴の長期保存**
   - aiConversationsテーブルに全会話を保存
   - ベクトルデータベースで類似会話検索

2. **感情分析**
   - 生徒の感情状態を把握
   - ポジティブ/ネガティブ/ニュートラル

3. **トピック抽出**
   - 会話内容からトピックを抽出
   - 学習、ゲーム、友達、家族など

4. **パーソナライゼーション**
   - 生徒ごとの会話スタイルを学習
   - 過去の会話を参照して一貫性を保つ

5. **マルチモーダル対応**
   - 画像、音声入力のサポート
   - GPT-4 Visionの活用
