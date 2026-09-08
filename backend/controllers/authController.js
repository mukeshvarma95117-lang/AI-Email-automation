import bcrypt from 'bcryptjs';
import dbHelper from '../database/db.js';
import { generateToken } from '../middleware/authMiddleware.js';

export async function login(req, res) {
  try {
    const { email, password, autoRegister } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = dbHelper.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    
    if (!user) {
      if (autoRegister) {
        // Auto-create account with their email
        const derivedName = normalizedEmail.split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        const passwordHash = await bcrypt.hash(password, 10);
        const result = dbHelper.run(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [derivedName, normalizedEmail, passwordHash, 'user']
        );

        const newUser = {
          id: result.lastInsertRowid,
          name: derivedName,
          email: normalizedEmail,
          role: 'user'
        };

        const token = generateToken(newUser);
        return res.status(201).json({
          message: 'Account created and signed in successfully!',
          token,
          user: newUser
        });
      }

      return res.status(404).json({ 
        error: 'No account found with this email.', 
        code: 'USER_NOT_FOUND' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
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
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password should be at least 4 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = dbHelper.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please Sign In.' });
    }

    const displayName = (name && name.trim()) || normalizedEmail.split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const passwordHash = await bcrypt.hash(password, 10);
    const result = dbHelper.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [displayName, normalizedEmail, passwordHash, 'user']
    );

    const newUser = {
      id: result.lastInsertRowid,
      name: displayName,
      email: normalizedEmail,
      role: 'user'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account registered successfully! Welcome.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create user account.' });
  }
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

