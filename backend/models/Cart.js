const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  title: String,
  category: String,
  pricePerHour: Number,
  image: String,
  hours: { type: Number, default: 1 }
}, { _id: false });

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((sum, item) => sum + item.pricePerHour * item.hours, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
