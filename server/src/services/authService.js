import { pool } from '../config/database.js';

export class AuthService {
  async findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async findUserById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async createUser({ email, password, firstName, lastName, role, tenantId }) {
    const query = `
      INSERT INTO users (email, password, first_name, last_name, role, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [email, password, firstName, lastName, role, tenantId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateUser(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  async deleteUser(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
    return true;
  }

  async getAllUsers(tenantId = null) {
    let query = 'SELECT id, email, first_name, last_name, role, tenant_id, is_active, created_at FROM users';
    let values = [];

    if (tenantId) {
      query += ' WHERE tenant_id = $1';
      values.push(tenantId);
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }
}
