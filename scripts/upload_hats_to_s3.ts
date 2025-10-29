import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getDb } from '../server/db';
import { gachaItems } from '../drizzle/schema';

const execAsync = promisify(exec);
const HATS_DIR = '/home/ubuntu/learning-adventure/public/hats';

// 帽子の名前とレアリティを定義
const hatData = [
  { name: 'シルクハット', rarity: 'epic' },
  { name: 'ウィザードハット', rarity: 'rare' },
  { name: 'カウボーイハット', rarity: 'uncommon' },
  { name: 'ベレー帽', rarity: 'common' },
  { name: 'キャップ', rarity: 'common' },
  { name: 'ニット帽', rarity: 'common' },
  { name: 'ハンチング', rarity: 'uncommon' },
  { name: 'ソンブレロ', rarity: 'rare' },
  { name: 'フェドーラ', rarity: 'uncommon' },
  { name: 'トップハット', rarity: 'epic' },
  { name: 'バケットハット', rarity: 'common' },
  { name: 'パナマハット', rarity: 'uncommon' },
  { name: 'ボーラーハット', rarity: 'rare' },
  { name: 'トリルビー', rarity: 'uncommon' },
  { name: 'クロッシェ', rarity: 'rare' },
  { name: 'ピルボックスハット', rarity: 'uncommon' },
  { name: 'ファシネーター', rarity: 'epic' },
  { name: 'ターバン', rarity: 'rare' },
  { name: 'フェズ', rarity: 'uncommon' },
  { name: 'アッシュラ', rarity: 'legendary' },
  { name: 'ゴールデンクラウン', rarity: 'legendary' },
  { name: 'ドラゴンヘルム', rarity: 'legendary' },
  { name: 'エンジェルハロー', rarity: 'epic' },
  { name: 'デビルホーン', rarity: 'epic' },
  { name: 'ユニコーンホーン', rarity: 'legendary' },
  { name: 'サムライカブト', rarity: 'epic' },
  { name: 'バイキングヘルム', rarity: 'rare' },
  { name: 'ナイトヘルム', rarity: 'rare' },
  { name: 'スペースヘルメット', rarity: 'epic' },
  { name: 'パイレーツハット', rarity: 'rare' },
  { name: 'ジェスターハット', rarity: 'uncommon' },
  { name: 'サンタハット', rarity: 'rare' },
  { name: 'ウィッチハット', rarity: 'epic' },
  { name: 'ファラオクラウン', rarity: 'legendary' },
  { name: 'レインボークラウン', rarity: 'legendary' },
];

async function uploadHatsToS3() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    // hatsディレクトリのファイルを取得
    const files = await fs.readdir(HATS_DIR);
    const webpFiles = files.filter(file => file.endsWith('.webp')).sort();

    console.log(`Found ${webpFiles.length} WebP files to upload`);

    for (let i = 0; i < webpFiles.length && i < hatData.length; i++) {
      const filePath = path.join(HATS_DIR, webpFiles[i]);

      // manus-upload-fileコマンドでS3にアップロード
      console.log(`Uploading ${webpFiles[i]} to S3...`);
      
      const { stdout } = await execAsync(`manus-upload-file "${filePath}"`);
      const imageUrl = stdout.trim();
      
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.error(`Failed to upload ${webpFiles[i]}: ${stdout}`);
        continue;
      }

      console.log(`Uploaded: ${imageUrl}`);

      // データベースに追加
      const hat = hatData[i];
      await db.insert(gachaItems).values({
        name: hat.name,
        description: `おしゃれな${hat.name}です`,
        itemType: 'hat',
        rarity: hat.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
        imageUrl: imageUrl,
      });

      console.log(`Added to database: ${hat.name} (${hat.rarity})`);
    }

    console.log(`\nUpload complete! Uploaded ${Math.min(webpFiles.length, hatData.length)} hats.`);
    process.exit(0);
  } catch (error) {
    console.error('Error uploading hats:', error);
    process.exit(1);
  }
}

uploadHatsToS3();
