const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');

dotenv.config();

const seedAnalytics = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/karigaarpk');
    console.log('Connected.');

    // Clear old data for a fresh start (optional, let's just clear Bookings to be safe)
    await Booking.deleteMany({});
    
    // 1. Create a dummy user and provider if they don't exist
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test Customer',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'user',
        city: 'Lahore'
      });
    }

    let testProvider = await User.findOne({ email: 'provider@example.com' });
    if (!testProvider) {
      testProvider = await User.create({
        name: 'Test Provider',
        email: 'provider@example.com',
        password: 'password123',
        role: 'provider',
        city: 'Lahore',
        businessName: 'Expert Services',
        isVerified: true
      });
    }

    // 2. Create some dummy services with high views vs low views
    await Service.deleteMany({ title: { $regex: /Seed Service/ } }); // clear previous seeds
    
    const servicesData = [
      { category: 'Plumber', title: 'Seed Service: Elite Plumbing Repair', views: 850, totalBookings: 120, rating: 4.8 },
      { category: 'Electrician', title: 'Seed Service: Home Wiring Fix', views: 1200, totalBookings: 200, rating: 4.9 },
      { category: 'AC Technician', title: 'Seed Service: AC Gas Filling', views: 3000, totalBookings: 10, rating: 3.5 }, // High views, low bookings (Trending Soon)
      { category: 'Makeup Artist', title: 'Seed Service: Bridal Makeup', views: 500, totalBookings: 45, rating: 4.5 },
      { category: 'Cook', title: 'Seed Service: Daily Home Cook', views: 150, totalBookings: 5, rating: 4.0 },
    ];

    const createdServices = [];
    for (const s of servicesData) {
      const svc = await Service.create({
        title: s.title,
        category: s.category,
        description: 'A great service seeded for analytics.',
        pricePerHour: Math.floor(Math.random() * 2000) + 1000,
        providerName: testProvider.name,
        provider: testProvider._id,
        city: 'Lahore',
        available: true,
        views: s.views,
        totalBookings: s.totalBookings,
        rating: s.rating
      });
      createdServices.push(svc);
    }

    // 3. Create Bookings across the last 6 months to populate the area chart
    const bookings = [];
    const statuses = ['completed', 'completed', 'completed', 'cancelled', 'confirmed'];
    const cancelReasons = ['Too Expensive', 'Provider No-Show', 'Scheduling Conflict', 'Changed Mind'];

    // Generate ~100 bookings scattered over 180 days
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 180);
      const scheduledDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      const svc = createdServices[Math.floor(Math.random() * createdServices.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      bookings.push({
        user: testUser._id,
        service: svc._id,
        provider: testProvider._id,
        serviceTitle: svc.title,
        serviceCategory: svc.category,
        providerName: svc.providerName,
        pricePerHour: svc.pricePerHour,
        hours: 2,
        totalAmount: svc.pricePerHour * 2,
        scheduledDate: scheduledDate,
        scheduledTime: '10:00 AM',
        address: '123 Seed Street, Lahore',
        city: 'Lahore',
        status: status,
        cancellationReason: status === 'cancelled' ? cancelReasons[Math.floor(Math.random() * cancelReasons.length)] : '',
        createdAt: scheduledDate // Force created date to scatter across months
      });
    }

    await Booking.insertMany(bookings);
    console.log('✅ Successfully seeded 5 services and 100 scattered bookings!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed DB:', err);
    process.exit(1);
  }
};

seedAnalytics();
