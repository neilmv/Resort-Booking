const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, phone } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(query, [name, email, hashedPassword, phone]);
    return result;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results] = await db.execute(query, [email]);
    return results[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, phone, profile_picture, created_at FROM users WHERE id = ?';
    const [results] = await db.execute(query, [id]);
    return results[0];
  }

  static async updateProfile(id, updateData) {
    const { name, phone, profile_picture } = updateData;
    
    if (profile_picture) {
      const query = 'UPDATE users SET name = ?, phone = ?, profile_picture = ? WHERE id = ?';
      const [result] = await db.execute(query, [name, phone, profile_picture, id]);
      return result;
    } else {
      const query = 'UPDATE users SET name = ?, phone = ? WHERE id = ?';
      const [result] = await db.execute(query, [name, phone, id]);
      return result;
    }
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Updating password for user:', id);
    console.log('New hashed password:', hashedPassword);
    
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    const [result] = await db.execute(query, [hashedPassword, id]);
    
    console.log('Password update result:', result);
    return result;
  }
}

module.exports = User;