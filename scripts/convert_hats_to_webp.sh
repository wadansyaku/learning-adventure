#!/bin/bash

# 帽子画像をWebPに変換するスクリプト

INPUT_DIR="/home/ubuntu/upload"
OUTPUT_DIR="/home/ubuntu/learning-adventure/public/hats"

# 出力ディレクトリを作成
mkdir -p "$OUTPUT_DIR"

# PNG画像をWebPに変換
counter=1
for file in "$INPUT_DIR"/ChatGPTImage*.png; do
  if [ -f "$file" ]; then
    output_file="$OUTPUT_DIR/hat_$(printf "%02d" $counter).webp"
    echo "Converting $file to $output_file..."
    convert "$file" -resize 256x256 -quality 85 "$output_file"
    counter=$((counter + 1))
  fi
done

echo "Conversion complete! Converted $((counter - 1)) images."
ls -lh "$OUTPUT_DIR"
