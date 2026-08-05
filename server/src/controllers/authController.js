import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import BuyerProfile from '../models/BuyerProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

function authPayload(user) {
  const token = signToken(user);
  return {
    token,
    tokenType: 'Bearer',
    expiresIn: TOKEN_EXPIRES_IN,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
    },
  };
}

export const registerValidators = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['buyer', 'supplier']),
];

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, businessName, businessType } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role });

  if (role === 'buyer') {
    await BuyerProfile.create({
      user: user._id,
      businessType: businessType || '',
    });
  } else {
    await SupplierProfile.create({
      user: user._id,
      contactEmail: email,
      businessName: businessName || name,
      businessType: businessType || '',
    });
  }

  res.status(201).json(authPayload(user));
}

export const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json(authPayload(user));
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
    },
  });
}

/** Client discards JWT; endpoint exists for a clean logout contract. */
export async function logout(_req, res) {
  res.json({ message: 'Logged out successfully' });
}
