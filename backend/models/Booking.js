const mongoose = require('mongoose');

const trackingStepSchema = new mongoose.Schema(
  { step: String, done: { type: Boolean, default: false }, completedAt: { type: Date, default: null } },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service:  { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    serviceTitle:    { type: String, default: '' },
    serviceCategory: { type: String, default: '' },
    providerName:    { type: String, default: '' },
    pricePerHour:    { type: Number, required: true },
    serviceImage:    { type: String, default: '' },
    hours:           { type: Number, required: true, min: 1, default: 1 },
    totalAmount:     { type: Number, required: true },
    scheduledDate:   { type: Date,   required: true },
    scheduledTime:   { type: String, required: true },
    address:         { type: String, required: true },
    city:            { type: String, required: true },
    notes:           { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending','confirmed','in-progress','completed','cancelled'],
      default: 'pending'
    },
    paymentMethod: { type: String, enum: ['cod','card'], default: 'cod' },
    paymentStatus: { type: String, enum: ['unpaid','paid'], default: 'unpaid' },
    trackingSteps: {
      type: [trackingStepSchema],
      default: () => [
        { step: 'Booking Received',      done: true,  completedAt: new Date() },
        { step: 'Confirmed by Provider', done: false, completedAt: null },
        { step: 'Provider En Route',     done: false, completedAt: null },
        { step: 'Service In Progress',   done: false, completedAt: null },
        { step: 'Completed',             done: false, completedAt: null }
      ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
