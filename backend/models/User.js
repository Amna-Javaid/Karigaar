const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone:    { type: String, default: '' },
    city:     { type: String, default: 'Lahore' },
    role:     { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    avatar:   { type: String, default: '' },

    // ── Provider-only fields ──────────────────────────────────
    businessName: { type: String, default: '' },
    businessCategory: { type: String, default: '' },
    bio:          { type: String, default: '' },
    isVerified:   { type: Boolean, default: false }   // admin can verify providers
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
