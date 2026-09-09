import bcrypt from 'bcryptjs';
import dbHelper from '../database/db.js';
import { generateToken } from '../middleware/authMiddleware.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = dbHelper.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password. Please try again.', 
        code: 'INVALID_CREDENTIALS' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid email or password. Please try again.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
}

export async function register(req, res) {
  return res.status(403).json({ 
    error: 'Public registration is disabled. Only pre-configured administrators can access this workspace.',
    code: 'REGISTRATION_DISABLED'
  });
}

export function getCurrentUser(req, res) {
  try {
    const user = dbHelper.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

