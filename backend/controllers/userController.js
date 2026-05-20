const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const safeUser = (user, token) => ({
  _id: user._id, name: user.name, email: user.email,
  role: user.role, phone: user.phone, city: user.city,
  businessName: user.businessName, businessCategory: user.businessCategory,
  bio: user.bio, isVerified: user.isVerified, token
});

// POST /api/users/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, city, role, businessName, businessCategory, bio } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    // Only allow user or provider on self-registration
    const allowedRole = ['user','provider'].includes(role) ? role : 'user';

    const user = await User.create({
      name, email, password, phone, city,
      role: allowedRole, businessName, businessCategory, bio
    });
    res.status(201).json(safeUser(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json(safeUser(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name             = req.body.name             || user.name;
    user.phone            = req.body.phone            ?? user.phone;
    user.city             = req.body.city             || user.city;
    user.businessName     = req.body.businessName     ?? user.businessName;
    user.businessCategory = req.body.businessCategory ?? user.businessCategory;
    user.bio              = req.body.bio              ?? user.bio;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json(safeUser(updated, generateToken(updated._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/wishlist/:serviceId
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const serviceId = req.params.serviceId;
    const idx = user.wishlist.findIndex(id => id.toString() === serviceId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else          user.wishlist.push(serviceId);
    await user.save();
    res.json({ wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users  (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id  (admin)
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id/verify  (admin — verify a provider)
const verifyProvider = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, toggleWishlist, getAllUsers, deleteUser, verifyProvider };
