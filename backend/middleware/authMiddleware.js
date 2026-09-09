import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smartsend-ai-super-secret-key-2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query?.token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

