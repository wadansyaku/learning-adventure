import { db } from '../server/db';
import * as dbModule from '../server/db';

async function seedTestUsers() {
  console.log('Starting test user seeding...');

  try {
    // 1. Create or update users
    const studentOpenId = '480030';
    const parentOpenId = '540011';
    const teacherOpenId = '540022';

    console.log('Creating/updating users...');

    // Create users (assuming they don't exist yet)
    // In production, these would be created via OAuth login
    
    // 2. Create student profile
    console.log('Creating student profile for', studentOpenId);
    const student = await dbModule.createStudent({
      userId: studentOpenId, // This should be the actual user ID from users table
      displayName: 'テスト生徒',
      level: 5,
      xp: 150,
      coins: 100,
      loginStreak: 3,
    });
    console.log('Student created:', student);

    // 3. Create parent-child relationship
    console.log('Creating parent-child relationship...');
    await dbModule.addChildToParent(parentOpenId, student.id);
    console.log('Parent-child relationship created');

    // 4. Assign teacher to student
    console.log('Assigning teacher to student...');
    // This would require a teacher-student relationship table
    // For now, we'll skip this as it's not implemented yet

    console.log('Test user seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding test users:', error);
    throw error;
  }
}

// Run the seed function
seedTestUsers()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
