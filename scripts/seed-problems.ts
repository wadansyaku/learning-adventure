import { getDb } from '../server/db';
import { problems } from '../drizzle/schema';

async function seedProblems() {
  const db = await getDb();
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  console.log('Seeding problems...');

  // 小学1年生レベルの算数問題
  const easyProblems = [
    { problemType: 'addition' as const, difficulty: 'easy' as const, question: '1 + 1 = ?', correctAnswer: '2', options: JSON.stringify(['1', '2', '3', '4']), xpReward: 10, coinReward: 5 },
    { problemType: 'addition' as const, difficulty: 'easy' as const, question: '2 + 2 = ?', correctAnswer: '4', options: JSON.stringify(['2', '3', '4', '5']), xpReward: 10, coinReward: 5 },
    { problemType: 'addition' as const, difficulty: 'easy' as const, question: '3 + 1 = ?', correctAnswer: '4', options: JSON.stringify(['2', '3', '4', '5']), xpReward: 10, coinReward: 5 },
    { problemType: 'subtraction' as const, difficulty: 'easy' as const, question: '5 - 2 = ?', correctAnswer: '3', options: JSON.stringify(['2', '3', '4', '5']), xpReward: 10, coinReward: 5 },
    { problemType: 'subtraction' as const, difficulty: 'easy' as const, question: '4 - 1 = ?', correctAnswer: '3', options: JSON.stringify(['2', '3', '4', '5']), xpReward: 10, coinReward: 5 },
    { problemType: 'addition' as const, difficulty: 'easy' as const, question: '2 + 3 = ?', correctAnswer: '5', options: JSON.stringify(['3', '4', '5', '6']), xpReward: 10, coinReward: 5 },
    { problemType: 'subtraction' as const, difficulty: 'easy' as const, question: '6 - 3 = ?', correctAnswer: '3', options: JSON.stringify(['2', '3', '4', '5']), xpReward: 10, coinReward: 5 },
    { problemType: 'addition' as const, difficulty: 'easy' as const, question: '1 + 4 = ?', correctAnswer: '5', options: JSON.stringify(['3', '4', '5', '6']), xpReward: 10, coinReward: 5 },
    { problemType: 'subtraction' as const, difficulty: 'easy' as const, question: '7 - 2 = ?', correctAnswer: '5', options: JSON.stringify(['4', '5', '6', '7']), xpReward: 10, coinReward: 5 },
    { problemType: 'addition' as const, difficulty: 'easy' as const, question: '3 + 3 = ?', correctAnswer: '6', options: JSON.stringify(['4', '5', '6', '7']), xpReward: 10, coinReward: 5 },
  ];

  // 小学2年生レベルの算数問題
  const mediumProblems = [
    { problemType: 'addition' as const, difficulty: 'medium' as const, question: '10 + 5 = ?', correctAnswer: '15', options: JSON.stringify(['12', '14', '15', '16']), xpReward: 15, coinReward: 8 },
    { problemType: 'subtraction' as const, difficulty: 'medium' as const, question: '12 - 4 = ?', correctAnswer: '8', options: JSON.stringify(['6', '7', '8', '9']), xpReward: 15, coinReward: 8 },
    { problemType: 'addition' as const, difficulty: 'medium' as const, question: '7 + 8 = ?', correctAnswer: '15', options: JSON.stringify(['13', '14', '15', '16']), xpReward: 15, coinReward: 8 },
    { problemType: 'subtraction' as const, difficulty: 'medium' as const, question: '16 - 9 = ?', correctAnswer: '7', options: JSON.stringify(['6', '7', '8', '9']), xpReward: 15, coinReward: 8 },
    { problemType: 'addition' as const, difficulty: 'medium' as const, question: '9 + 6 = ?', correctAnswer: '15', options: JSON.stringify(['13', '14', '15', '16']), xpReward: 15, coinReward: 8 },
    { problemType: 'pattern' as const, difficulty: 'medium' as const, question: '2 × 3 = ?', correctAnswer: '6', options: JSON.stringify(['4', '5', '6', '7']), xpReward: 15, coinReward: 8 },
    { problemType: 'pattern' as const, difficulty: 'medium' as const, question: '3 × 4 = ?', correctAnswer: '12', options: JSON.stringify(['10', '11', '12', '13']), xpReward: 15, coinReward: 8 },
    { problemType: 'pattern' as const, difficulty: 'medium' as const, question: '5 × 2 = ?', correctAnswer: '10', options: JSON.stringify(['8', '9', '10', '11']), xpReward: 15, coinReward: 8 },
    { problemType: 'pattern' as const, difficulty: 'medium' as const, question: '4 × 3 = ?', correctAnswer: '12', options: JSON.stringify(['10', '11', '12', '13']), xpReward: 15, coinReward: 8 },
    { problemType: 'pattern' as const, difficulty: 'medium' as const, question: '6 × 2 = ?', correctAnswer: '12', options: JSON.stringify(['10', '11', '12', '13']), xpReward: 15, coinReward: 8 },
  ];

  // 小学3年生レベルの算数問題
  const hardProblems = [
    { problemType: 'addition' as const, difficulty: 'hard' as const, question: '15 + 27 = ?', correctAnswer: '42', options: JSON.stringify(['40', '41', '42', '43']), xpReward: 20, coinReward: 10 },
    { problemType: 'subtraction' as const, difficulty: 'hard' as const, question: '50 - 23 = ?', correctAnswer: '27', options: JSON.stringify(['25', '26', '27', '28']), xpReward: 20, coinReward: 10 },
    { problemType: 'pattern' as const, difficulty: 'hard' as const, question: '8 × 7 = ?', correctAnswer: '56', options: JSON.stringify(['54', '55', '56', '57']), xpReward: 20, coinReward: 10 },
    { problemType: 'pattern' as const, difficulty: 'hard' as const, question: '9 × 6 = ?', correctAnswer: '54', options: JSON.stringify(['52', '53', '54', '55']), xpReward: 20, coinReward: 10 },
    { problemType: 'comparison' as const, difficulty: 'hard' as const, question: '12 ÷ 3 = ?', correctAnswer: '4', options: JSON.stringify(['3', '4', '5', '6']), xpReward: 20, coinReward: 10 },
    { problemType: 'comparison' as const, difficulty: 'hard' as const, question: '18 ÷ 6 = ?', correctAnswer: '3', options: JSON.stringify(['2', '3', '4', '5']), xpReward: 20, coinReward: 10 },
    { problemType: 'comparison' as const, difficulty: 'hard' as const, question: '24 ÷ 4 = ?', correctAnswer: '6', options: JSON.stringify(['5', '6', '7', '8']), xpReward: 20, coinReward: 10 },
    { problemType: 'pattern' as const, difficulty: 'hard' as const, question: '7 × 8 = ?', correctAnswer: '56', options: JSON.stringify(['54', '55', '56', '57']), xpReward: 20, coinReward: 10 },
    { problemType: 'comparison' as const, difficulty: 'hard' as const, question: '36 ÷ 6 = ?', correctAnswer: '6', options: JSON.stringify(['5', '6', '7', '8']), xpReward: 20, coinReward: 10 },
    { problemType: 'pattern' as const, difficulty: 'hard' as const, question: '9 × 9 = ?', correctAnswer: '81', options: JSON.stringify(['79', '80', '81', '82']), xpReward: 20, coinReward: 10 },
  ];

  const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];

  for (const problem of allProblems) {
    await db.insert(problems).values(problem);
  }

  console.log(`Seeded ${allProblems.length} problems successfully!`);
  process.exit(0);
}

seedProblems().catch(console.error);
