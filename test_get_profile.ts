import * as db from './server/db';

async function testGetProfile() {
  try {
    console.log('Testing getStudentByUserId...');
    
    const student = await db.getStudentByUserId(1);
    console.log('Student:', JSON.stringify(student, null, 2));
    
    if (!student) {
      console.log('Student not found!');
      process.exit(1);
    }
    
    console.log('Success! Student ID:', student.id);
    console.log('Student name:', student.displayName);
    console.log('Student coins:', student.coins);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testGetProfile();
