import { drizzle } from "drizzle-orm/mysql2";
import { characterTypes } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const charactersData = [
  {
    name: "ぱんだくん",
    species: "panda",
    description: "ちくわだいすきなぱんだだよ!いっしょにべんきょうしよう!",
    imageUrl: "/characters/panda.png",
    personality: "おだやかでやさしい",
    unlockLevel: 1,
  },
  {
    name: "うさぎちゃん",
    species: "rabbit",
    description: "げんきいっぱいのうさぎだよ!ぴょんぴょんとんでいこう!",
    imageUrl: "/characters/rabbit.png",
    personality: "げんきでかつどうてき",
    unlockLevel: 1,
  },
  {
    name: "ぺんぎんくん",
    species: "penguin",
    description: "さむいところからきたぺんぎんだよ!すべってあそぼう!",
    imageUrl: "/characters/penguin.png",
    personality: "ゆかいでたのしい",
    unlockLevel: 3,
  },
  {
    name: "きつねちゃん",
    species: "fox",
    description: "かしこいきつねのおうじょさまだよ!いっしょにかんがえよう!",
    imageUrl: "/characters/fox.png",
    personality: "かしこくておしゃれ",
    unlockLevel: 5,
  },
  {
    name: "ふくろうせんせい",
    species: "owl",
    description: "ものしりなふくろうせんせいだよ!たくさんおしえるね!",
    imageUrl: "/characters/owl.png",
    personality: "ちてきでおちついている",
    unlockLevel: 7,
  },
  {
    name: "いぬくん",
    species: "dog",
    description: "ちゅうじつないぬのなかまだよ!いっしょにがんばろう!",
    imageUrl: "/characters/dog.png",
    personality: "ちゅうじつでげんき",
    unlockLevel: 2,
  },
  {
    name: "りすちゃん",
    species: "squirrel",
    description: "どんぐりあつめがだいすきなりすだよ!たからものさがそう!",
    imageUrl: "/characters/squirrel.png",
    personality: "すばしっこくてかわいい",
    unlockLevel: 4,
  },
  {
    name: "ぞうさん",
    species: "elephant",
    description: "やさしくてつよいぞうさんだよ!いっしょにぼうけんしよう!",
    imageUrl: "/characters/elephant.png",
    personality: "やさしくてたくましい",
    unlockLevel: 6,
  },
  {
    name: "ねこちゃん",
    species: "cat",
    description: "かわいいねこのおんなのこだよ!いっしょにあそぼう!",
    imageUrl: "/characters/cat.png",
    personality: "じゆうほんぽうでかわいい",
    unlockLevel: 3,
  },
  {
    name: "くまくん",
    species: "bear",
    description: "ちからもちのくまくんだよ!いっしょにがんばろう!",
    imageUrl: "/characters/bear.png",
    personality: "ちからづよくてやさしい",
    unlockLevel: 5,
  },
];

async function updateCharacters() {
  console.log("Updating characters...");

  // Delete existing character types
  await db.delete(characterTypes);
  console.log("Deleted existing character types");

  // Insert new character types
  for (const char of charactersData) {
    await db.insert(characterTypes).values(char);
    console.log(`Inserted character type: ${char.name}`);
  }

  console.log("✅ Characters updated successfully!");
  process.exit(0);
}

updateCharacters().catch((error) => {
  console.error("❌ Error updating characters:", error);
  process.exit(1);
});
