
import { db } from '../../db.ts';
import { users, tenants } from '../schema.ts';
import { eq, and } from 'drizzle-orm';

export class AuthService {
  async findUserByEmail(email) {
    try {
      const result = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        tenantId: users.tenantId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findUserById(id) {
    try {
      const result = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        tenantId: users.tenantId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async createUser({ email, password, username, role, tenantId }) {
    try {
      const result = await db.insert(users).values({
        email,
        password,
        username: username || email.split('@')[0],
        role,
        tenantId,
        isActive: true
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, updates) {
    try {
      const result = await db.update(users)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deactivateUser(id) {
    try {
      const result = await db.update(users)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }
}
