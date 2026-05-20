const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:    String,
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: String
  },
  { timestamps: true }
);

const serviceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    category: {
      type: String, required: true,
      enum: ['Electrician','Plumber','Tutor','Mehndi Artist','Makeup Artist',
             'Carpenter','Painter','AC Technician','Cleaner','Driver','Cook','Other']
    },
    description:   { type: String, required: true },
    pricePerHour:  { type: Number, required: true },
    providerName:  { type: String, required: true },
    providerPhone: { type: String, default: '' },
    // Link service to the provider user account
    provider:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    city: {
      type: String, required: true,
      enum: ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar']
    },
    image:        { type: String, default: '' },
    featured:     { type: Boolean, default: false },
    available:    { type: Boolean, default: true },
    experience:   { type: Number, default: 1 },
    reviews:      [reviewSchema],
    rating:       { type: Number, default: 0 },
    numReviews:   { type: Number, default: 0 },
    seoTitle:       { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords:    { type: String, default: '' },
    slug:           { type: String, index: true },
    totalBookings:  { type: Number, default: 0 },
    views:          { type: Number, default: 0 },
    searchAppearances: { type: Number, default: 0 }
  },
  { timestamps: true }
);

serviceSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    let base = this.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (this.city) {
      base += '-' + this.city.toLowerCase();
    }
    if (this._id) {
      base += '-' + this._id.toString().slice(-5);
    }
    this.slug = base;
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
