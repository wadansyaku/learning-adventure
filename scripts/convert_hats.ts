import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const INPUT_DIR = '/home/ubuntu/upload';
const OUTPUT_DIR = '/home/ubuntu/learning-adventure/public/hats';

async function convertHatsToWebP() {
  try {
    // 出力ディレクトリを作成
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // 入力ディレクトリのファイルを取得
    const files = await fs.readdir(INPUT_DIR);
    const pngFiles = files.filter(file => file.startsWith('ChatGPTImage') && file.endsWith('.png'));

    console.log(`Found ${pngFiles.length} PNG files to convert`);

    // 各ファイルをWebPに変換
    for (let i = 0; i < pngFiles.length; i++) {
      const inputPath = path.join(INPUT_DIR, pngFiles[i]);
      const outputPath = path.join(OUTPUT_DIR, `hat_${String(i + 1).padStart(2, '0')}.webp`);

      console.log(`Converting ${pngFiles[i]} to ${path.basename(outputPath)}...`);

      await sharp(inputPath)
        .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 85 })
        .toFile(outputPath);
    }

    console.log(`\nConversion complete! Converted ${pngFiles.length} images.`);

    // 出力ディレクトリの内容を表示
    const outputFiles = await fs.readdir(OUTPUT_DIR);
    console.log(`\nOutput files:`);
    for (const file of outputFiles) {
      const stats = await fs.stat(path.join(OUTPUT_DIR, file));
      console.log(`  ${file} - ${(stats.size / 1024).toFixed(2)} KB`);
    }
  } catch (error) {
    console.error('Error converting images:', error);
    process.exit(1);
  }
}

convertHatsToWebP();
