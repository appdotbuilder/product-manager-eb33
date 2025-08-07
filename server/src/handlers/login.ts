
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput, type AuthResponse } from '../schema';
import { eq } from 'drizzle-orm';

export async function login(input: LoginInput): Promise<AuthResponse> {
  try {
    // Query user by email
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // In a real implementation, you would verify the password hash here
    // For this mock implementation, we'll accept any password for existing users
    // const isValidPassword = await bcrypt.compare(input.password, user.password_hash);
    // if (!isValidPassword) {
    //   throw new Error('Invalid email or password');
    // }

    // Generate a mock JWT token (in real implementation, use proper JWT library)
    const mockToken = `mock-jwt-${user.id}-${Date.now()}`;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token: mockToken
    };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
