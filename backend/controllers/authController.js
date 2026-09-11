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
        role: user.role,
        title: user.title || 'Lead Administrator',
        phone: user.phone || '',
        company: user.company || 'SmartSend AI',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
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
    const user = dbHelper.get('SELECT id, name, email, role, title, phone, company, bio, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, title, phone, company, bio, avatar_url } = req.body;
    const userId = req.user.id;

    const user = dbHelper.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedName = name !== undefined && name !== null ? String(name).trim() : user.name;
    const updatedTitle = title !== undefined && title !== null ? String(title).trim() : (user.title || 'Lead Administrator');
    const updatedPhone = phone !== undefined && phone !== null ? String(phone).trim() : (user.phone || '');
    const updatedCompany = company !== undefined && company !== null ? String(company).trim() : (user.company || 'SmartSend AI');
    const updatedBio = bio !== undefined && bio !== null ? String(bio).trim() : (user.bio || '');
    const updatedAvatar = avatar_url !== undefined && avatar_url !== null ? String(avatar_url).trim() : (user.avatar_url || '');

    dbHelper.run(
      'UPDATE users SET name = ?, title = ?, phone = ?, company = ?, bio = ?, avatar_url = ? WHERE id = ?',
      [updatedName, updatedTitle, updatedPhone, updatedCompany, updatedBio, updatedAvatar, userId]
    );

    const updatedUser = dbHelper.get('SELECT id, name, email, role, title, phone, company, bio, avatar_url, created_at FROM users WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update user profile.' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = dbHelper.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    dbHelper.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to change password.' });
  }
}


