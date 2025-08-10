import { pool } from '../config/database.js';

export class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password = userData.password;
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
    this.role = userData.role;
    this.tenantId = userData.tenant_id;
    this.isActive = userData.is_active;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;
  }

  // Static methods for database operations
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async create({ email, password, firstName, lastName, role, tenantId }) {
    const query = `
      INSERT INTO users (email, password, first_name, last_name, role, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [email, password, firstName, lastName, role, tenantId];
    const result = await pool.query(query, values);
    return new User(result.rows[0]);
  }

  // Instance methods
  async save() {
    const query = `
      UPDATE users 
      SET email = $2, first_name = $3, last_name = $4, role = $5, tenant_id = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [this.id, this.email, this.firstName, this.lastName, this.role, this.tenantId, this.isActive];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete() {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [this.id]);
    return true;
  }

  // Helper methods
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      tenantId: this.tenantId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  hasRole(role) {
    return this.role === role;
  }

  isTenantUser() {
    return this.role === 'user' && this.tenantId !== null;
  }

  isAdmin() {
    return ['super-admin', 'tenant-admin'].includes(this.role);
  }
}
