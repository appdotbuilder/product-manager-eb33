
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { login } from '../handlers/login';
import { eq } from 'drizzle-orm';

const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  password_hash: 'mock-hash-12345'
};

const validLoginInput: LoginInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('login', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should authenticate user with valid credentials', async () => {
    // Create test user in database
    await db.insert(usersTable)
      .values(testUser)
      .execute();

    const result = await login(validLoginInput);

    // Verify user data
    expect(result.user.email).toEqual('test@example.com');
    expect(result.user.name).toEqual('Test User');
    expect(result.user.id).toBeDefined();
    expect(result.user.created_at).toBeInstanceOf(Date);

    // Verify token is generated
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token).toMatch(/^mock-jwt-\d+-\d+$/);
  });

  it('should throw error for non-existent user', async () => {
    const invalidInput: LoginInput = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };

    await expect(login(invalidInput)).rejects.toThrow(/invalid email or password/i);
  });

  it('should return user data that matches database record', async () => {
    // Create test user
    const insertResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const createdUser = insertResult[0];

    const result = await login(validLoginInput);

    // Verify returned user data matches database
    expect(result.user.id).toEqual(createdUser.id);
    expect(result.user.email).toEqual(createdUser.email);
    expect(result.user.name).toEqual(createdUser.name);
    expect(result.user.created_at).toEqual(createdUser.created_at);
  });

  it('should generate unique tokens for multiple logins', async () => {
    // Create test user
    await db.insert(usersTable)
      .values(testUser)
      .execute();

    const result1 = await login(validLoginInput);
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const result2 = await login(validLoginInput);

    expect(result1.token).not.toEqual(result2.token);
    expect(result1.token).toMatch(/^mock-jwt-\d+-\d+$/);
    expect(result2.token).toMatch(/^mock-jwt-\d+-\d+$/);
  });
});
