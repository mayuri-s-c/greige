import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Requires `Authorization: Bearer <jwt>`.
 * Verifies signature, expiry, and that the user still exists.
 */
export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized — missing Bearer token' });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: 'Not authorized — empty token' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT secret is not configured' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized — user no longer exists' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired — please sign in again' });
    }
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden for this role' });
    }
    next();
  };
}
