import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Database Functions', () => {
  let testStudentId: number;
  const testUserId = 999999;

  beforeAll(async () => {
    // Create test student
    const studentData = {
      userId: testUserId,
      displayName: 'Test Student',
      avatarIcon: '🧪',
      level: 1,
      xp: 0,
      coins: 0,
      loginStreak: 0,
    };

    await db.createStudent(studentData);
    const student = await db.getStudentByUserId(testUserId);
    if (student) {
      testStudentId = student.id;
    }
  });

  describe('Student Functions', () => {
    it('should retrieve a student', async () => {
      const student = await db.getStudentByUserId(testUserId);

      expect(student).toBeDefined();
      expect(student?.displayName).toBe('Test Student');
      expect(student?.level).toBe(1);
    });

    it('should update student XP', async () => {
      const student = await db.getStudentByUserId(testUserId);
      if (!student) throw new Error('Student not found');

      const initialXP = student.xp;
      await db.updateStudentXP(student.id, 50);

      const updatedStudent = await db.getStudentByUserId(testUserId);
      expect(updatedStudent?.xp).toBe(initialXP + 50);
    });

    it('should update student coins', async () => {
      const student = await db.getStudentByUserId(testUserId);
      if (!student) throw new Error('Student not found');

      const initialCoins = student.coins;
      await db.updateStudentCoins(student.id, 20);

      const updatedStudent = await db.getStudentByUserId(testUserId);
      expect(updatedStudent?.coins).toBe(initialCoins + 20);
    });

    it('should update student level', async () => {
      const student = await db.getStudentByUserId(testUserId);
      if (!student) throw new Error('Student not found');

      await db.updateStudentLevel(student.id, 5);

      const updatedStudent = await db.getStudentByUserId(testUserId);
      expect(updatedStudent?.level).toBe(5);
    });
  });

  describe('Character Functions', () => {
    it('should get all character types', async () => {
      const characterTypes = await db.getAllCharacterTypes();
      expect(characterTypes).toBeDefined();
      expect(Array.isArray(characterTypes)).toBe(true);
      expect(characterTypes.length).toBeGreaterThan(0);
    });

    it('should create and retrieve characters', async () => {
      const student = await db.getStudentByUserId(testUserId);
      if (!student) throw new Error('Student not found');

      const characterData = {
        studentId: student.id,
        name: 'Test Character',
        animalType: 'rabbit',
        imageUrl: 'https://example.com/rabbit.png',
      };

      await db.createCharacter(characterData);

      const characters = await db.getCharactersByStudentId(student.id);
      expect(characters).toBeDefined();
      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
      
      const testCharacter = characters.find(c => c.name === 'Test Character');
      expect(testCharacter).toBeDefined();
      expect(testCharacter?.animalType).toBe('rabbit');
    });
  });

  describe('Progress Functions', () => {
    it('should get student stats', async () => {
      const student = await db.getStudentByUserId(testUserId);
      if (!student) throw new Error('Student not found');

      const stats = await db.getStudentStats(student.id);
      expect(stats).toBeDefined();
      expect(stats.totalProblems).toBeGreaterThanOrEqual(0);
      expect(stats.correctAnswers).toBeGreaterThanOrEqual(0);
    });

    it('should get student progress', async () => {
      const student = await db.getStudentByUserId(testUserId);
      if (!student) throw new Error('Student not found');

      const progress = await db.getStudentProgressByStudentId(student.id);
      expect(progress).toBeDefined();
      expect(Array.isArray(progress)).toBe(true);
    });
  });

  describe('Daily Mission Functions', () => {
    it('should get all daily missions', async () => {
      const missions = await db.getAllDailyMissions();
      expect(missions).toBeDefined();
      expect(Array.isArray(missions)).toBe(true);
    });

    it('should get student daily progress', async () => {
      const student = await db.getStudentByUserId(testUserId);
      if (!student) throw new Error('Student not found');

      const progress = await db.getStudentDailyProgress(student.id, new Date());
      expect(progress).toBeDefined();
      expect(Array.isArray(progress)).toBe(true);
    });
  });
});
