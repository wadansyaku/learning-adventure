# バグ調査結果

## 問題1: 持ち物画面でアイテム画像が正しく表示されない

### 症状
- ベレー帽（id=4）、ニット帽（id=6）、キャップ（id=5）は正しい画像が表示される
- その他のアイテム（id=7以降）はすべてシルクハット画像が表示される

### データベース確認結果
1. `characterItems`テーブルには35個のアイテムがあり、すべてに正しい画像URLが設定されている
2. `studentItems`テーブルでstudentId=1は19個のアイテムを所持している
3. JOINクエリの結果、データベースレベルでは正しい画像URLが返されている

### 推測される原因
- フロントエンドで画像URLが正しく渡されていない
- または、画像URLが正しくても、画像ファイルが存在しない
- または、CORSエラーなどで画像が読み込めない

### 次のステップ
1. ブラウザのNetwork tabで画像リクエストを確認
2. `client/src/pages/Inventory.tsx`のコードを確認
3. 画像URLが正しく渡されているか確認


## 根本原因の特定

### 問題の構造
1. `gachaItems`テーブル: ID 1-35（正しい画像URLあり）
2. `characterItems`テーブル: ID 1-35（正しい画像URLあり）
3. `studentItems`テーブル: itemId が30000番台（gachaItemsの古いIDを参照）

### なぜ30000番台のIDが保存されているか
- `getAllCharacterItems()`関数が`gachaItems`テーブルを参照していた
- ガチャを引いた際に、`gachaItems.id`（30000番台）が`studentItems.itemId`に保存された
- しかし、`getStudentItemsWithDetails()`は`characterItems.id`（1-35）とJOINしようとする
- IDが一致しないため、JOINが失敗し、画像URLが取得できない

### 修正内容
1. `getAllCharacterItems()`を`characterItems`テーブルを参照するように修正
2. これにより、今後のガチャでは正しいID（1-35）が保存される

### 残る問題
- 既存の`studentItems`データのitemIdが30000番台のまま
- これらのデータは`characterItems`とJOINできないため、画像が表示されない

### 解決方法
1. **オプション1**: 既存の`studentItems`データを削除（ユーザーデータ損失）
2. **オプション2**: `studentItems.itemId`を`characterItems.id`にマッピング（データ移行スクリプト必要）
3. **オプション3**: `getStudentItemsWithDetails()`を修正して、`gachaItems`とも正しくJOINできるようにする
