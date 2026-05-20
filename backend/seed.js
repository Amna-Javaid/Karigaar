/**
 * KarigaarPK — Database Seeder
 * Run: node seed.js          → import data
 * Run: node seed.js --destroy → wipe all data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User    = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Cart    = require('./models/Cart');

mongoose.connect(process.env.MONGO_URI);

// ─── Sample Users ─────────────────────────────────────────────
const users = [
  {
    name: 'Admin KarigaarPK',
    email: 'admin@karigaarpk.com',
    password: 'admin123',
    role: 'admin',
    phone: '0300-0000001',
    city: 'Lahore'
  },
  {
    name: 'Usman Electric Works',
    email: 'provider@karigaarpk.com',
    password: 'provider123',
    role: 'provider',
    phone: '0321-1111111',
    city: 'Lahore',
    businessName: 'Usman Electric Works',
    businessCategory: 'Electrician',
    bio: 'Professional electrician with 10+ years experience in Lahore.',
    isVerified: true
  },
  {
    name: 'Raza Plumbing Services',
    email: 'raza@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0333-2222222',
    city: 'Lahore',
    businessName: 'Raza Plumbing Services',
    businessCategory: 'Plumber',
    bio: 'Complete plumbing solutions with 8 years of experience.',
    isVerified: true
  },
  {
    name: 'Sir Hamid Academy',
    email: 'hamid@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0344-3333333',
    city: 'Lahore',
    businessName: 'Sir Hamid Academy',
    businessCategory: 'Tutor',
    bio: 'Cambridge certified tutor with 6 years of teaching experience.',
    isVerified: true
  },
  {
    name: 'Henna by Zara',
    email: 'zara@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0311-4444444',
    city: 'Lahore',
    businessName: 'Henna by Zara',
    businessCategory: 'Mehndi Artist',
    bio: 'Specializing in bridal mehndi designs with 5 years experience.',
    isVerified: true
  },
  {
    name: 'Glamour by Sana',
    email: 'sana@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0322-5555555',
    city: 'Karachi',
    businessName: 'Glamour by Sana',
    businessCategory: 'Makeup Artist',
    bio: 'Premium bridal makeup with 7 years of professional experience.',
    isVerified: true
  },
  {
    name: 'Master Wood Craft',
    email: 'woodcraft@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0300-6666666',
    city: 'Islamabad',
    businessName: 'Master Wood Craft',
    businessCategory: 'Carpenter',
    bio: 'Custom furniture making with 15 years of woodworking experience.',
    isVerified: true
  },
  {
    name: 'ColorPro Painters',
    email: 'colorpro@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0315-7777777',
    city: 'Rawalpindi',
    businessName: 'ColorPro Painters',
    businessCategory: 'Painter',
    bio: 'Professional painting services with 9 years of experience.',
    isVerified: true
  },
  {
    name: 'Cool Tech Services',
    email: 'cooltech@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0336-8888888',
    city: 'Lahore',
    businessName: 'Cool Tech Services',
    businessCategory: 'AC Technician',
    bio: 'AC repair and maintenance for all brands with 7 years experience.',
    isVerified: true
  },
  {
    name: 'SparkleClean',
    email: 'sparkle@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0323-9999999',
    city: 'Karachi',
    businessName: 'SparkleClean',
    businessCategory: 'Cleaner',
    bio: 'Home deep cleaning service with eco-friendly products.',
    isVerified: true
  },
  {
    name: 'Chef Bilal',
    email: 'chef@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '0301-0000001',
    city: 'Multan',
    businessName: 'Chef Bilal',
    businessCategory: 'Cook',
    bio: 'Professional chef specializing in Pakistani cuisine with 12 years experience.',
    isVerified: true
  },
  {
    name: 'Amna Javaid',
    email: 'amna@example.com',
    password: 'user123',
    role: 'user',
    phone: '0301-1234567',
    city: 'Lahore'
  },
  {
    name: 'Ayesha Khan',
    email: 'ayesha@example.com',
    password: 'user123',
    role: 'user',
    phone: '0312-9876543',
    city: 'Karachi'
  }
];

// ─── Sample Services ─────────────────────────────────────────
// Will be linked to providers after users are created
const serviceTemplates = [
  {
    providerEmail: 'provider@karigaarpk.com',
    title: 'Expert Home Electrician',
    category: 'Electrician',
    description: 'Professional electrical work including wiring, panel upgrades, outlet installation, and fault diagnosis. 10+ years of experience with residential and commercial projects. All work guaranteed and safety-certified.',
    pricePerHour: 1200,
    providerName: 'Usman Electric Works',
    providerPhone: '0321-1111111',
    city: 'Lahore',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format',
    featured: true,
    available: true,
    experience: 10,
    rating: 4.8,
    numReviews: 45,
    totalBookings: 120,
    seoTitle: 'Best Electrician in Lahore | KarigaarPK',
    seoDescription: 'Hire professional electricians in Lahore. Fast, reliable, certified. Available 24/7.',
    seoKeywords: 'electrician lahore, home electrician, wiring repair lahore'
  },
  {
    providerEmail: 'raza@example.com',
    title: 'Certified Plumber & Pipe Fitter',
    category: 'Plumber',
    description: 'Complete plumbing solutions: leak repair, pipe installation, bathroom fitting, water pump services, and drainage cleaning. Emergency services available 24/7.',
    pricePerHour: 1000,
    providerName: 'Raza Plumbing Services',
    providerPhone: '0333-2222222',
    city: 'Lahore',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format',
    featured: true,
    available: true,
    experience: 8,
    rating: 4.7,
    numReviews: 38,
    totalBookings: 95,
    seoTitle: 'Trusted Plumber in Lahore | KarigaarPK',
    seoDescription: 'Fix leaks, install pipes & fittings with our expert plumbers in Lahore.',
    seoKeywords: 'plumber lahore, pipe repair, bathroom fitting lahore'
  },
  {
    providerEmail: 'hamid@example.com',
    title: 'Math & Science Home Tutor (O/A Level)',
    category: 'Tutor',
    description: 'Experienced tutor for O-Level and A-Level Mathematics, Physics, and Chemistry. Cambridge certified with 6 years of teaching experience. Personalized study plans for each student.',
    pricePerHour: 800,
    providerName: 'Sir Hamid Academy',
    providerPhone: '0344-3333333',
    city: 'Lahore',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format',
    featured: true,
    available: true,
    experience: 6,
    rating: 4.9,
    numReviews: 62,
    totalBookings: 200,
    seoTitle: 'O Level Math Tutor Lahore | KarigaarPK',
    seoDescription: 'Expert O/A Level home tutors in Lahore. Math, Physics, Chemistry.',
    seoKeywords: 'tutor lahore, o level tutor, math tutor lahore'
  },
  {
    providerEmail: 'zara@example.com',
    title: 'Bridal Mehndi Artist',
    category: 'Mehndi Artist',
    description: 'Specializing in bridal mehndi designs — Arabic, Pakistani, and fusion styles. Home service available. Includes both hands and feet for bridal packages. Booking required 2 weeks in advance for bridal events.',
    pricePerHour: 2500,
    providerName: 'Henna by Zara',
    providerPhone: '0311-4444444',
    city: 'Lahore',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format',
    featured: true,
    available: true,
    experience: 5,
    rating: 5.0,
    numReviews: 89,
    totalBookings: 150,
    seoTitle: 'Bridal Mehndi Artist Lahore | KarigaarPK',
    seoDescription: 'Beautiful bridal mehndi designs in Lahore. Home service available.',
    seoKeywords: 'mehndi artist lahore, bridal mehndi, henna lahore'
  },
  {
    providerEmail: 'sana@example.com',
    title: 'Professional Bridal Makeup Artist',
    category: 'Makeup Artist',
    description: 'Full bridal and party makeup services at home. Using premium brands (MAC, Huda Beauty, Charlotte Tilbury). Airbrush and HD makeup options available. Trial sessions offered before the big day.',
    pricePerHour: 5000,
    providerName: 'Glamour by Sana',
    providerPhone: '0322-5555555',
    city: 'Karachi',
    image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=600&auto=format',
    featured: true,
    available: true,
    experience: 7,
    rating: 4.9,
    numReviews: 104,
    totalBookings: 180,
    seoTitle: 'Bridal Makeup Artist Karachi | KarigaarPK',
    seoDescription: 'Top bridal makeup artists in Karachi. Home service, premium products.',
    seoKeywords: 'makeup artist karachi, bridal makeup, party makeup karachi'
  },
  {
    providerEmail: 'woodcraft@example.com',
    title: 'Furniture Carpenter & Wood Works',
    category: 'Carpenter',
    description: 'Custom furniture making, repair, and polishing. Specializes in bedroom sets, kitchen cabinets, wardrobes, and doors. Home visits for measurement and consultation.',
    pricePerHour: 1500,
    providerName: 'Master Wood Craft',
    providerPhone: '0300-6666666',
    city: 'Islamabad',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format',
    featured: false,
    available: true,
    experience: 15,
    rating: 4.6,
    numReviews: 27,
    totalBookings: 60,
    seoTitle: 'Carpenter Islamabad | Furniture Repair | KarigaarPK',
    seoDescription: 'Expert carpenters in Islamabad for furniture, doors, and cabinets.',
    seoKeywords: 'carpenter islamabad, furniture repair, wood work islamabad'
  },
  {
    providerEmail: 'colorpro@example.com',
    title: 'Interior & Exterior House Painter',
    category: 'Painter',
    description: 'Professional painting services for homes and offices. Full wall prep, primer, and 2 coats of premium paint included. Color consultation free. Wall textures and decorative finishes available.',
    pricePerHour: 900,
    providerName: 'ColorPro Painters',
    providerPhone: '0315-7777777',
    city: 'Rawalpindi',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format',
    featured: false,
    available: true,
    experience: 9,
    rating: 4.5,
    numReviews: 19,
    totalBookings: 45,
    seoTitle: 'House Painter Rawalpindi | Interior Painting | KarigaarPK',
    seoDescription: 'Professional house painters in Rawalpindi. Quality work, affordable rates.',
    seoKeywords: 'painter rawalpindi, house painting, wall painting service'
  },
  {
    providerEmail: 'cooltech@example.com',
    title: 'AC Service & Repair Technician',
    category: 'AC Technician',
    description: 'Split AC, window AC, and central air conditioning repair, installation, and maintenance. Gas refilling, deep cleaning, PCB repair. All brands covered. Same-day service available.',
    pricePerHour: 1800,
    providerName: 'Cool Tech Services',
    providerPhone: '0336-8888888',
    city: 'Lahore',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format',
    featured: false,
    available: true,
    experience: 7,
    rating: 4.7,
    numReviews: 53,
    totalBookings: 110,
    seoTitle: 'AC Repair Lahore | AC Service Technician | KarigaarPK',
    seoDescription: 'Fast AC repair and maintenance in Lahore. All brands. Same-day service.',
    seoKeywords: 'ac repair lahore, ac service, ac technician lahore'
  },
  {
    providerEmail: 'sparkle@example.com',
    title: 'Home Deep Cleaning Service',
    category: 'Cleaner',
    description: 'Complete home deep cleaning including kitchen, bathrooms, bedrooms, and living areas. Eco-friendly products used. Team of 2-4 trained cleaners. Sofa, mattress, and carpet cleaning also available.',
    pricePerHour: 700,
    providerName: 'SparkleClean',
    providerPhone: '0323-9999999',
    city: 'Karachi',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format',
    featured: false,
    available: true,
    experience: 4,
    rating: 4.6,
    numReviews: 41,
    totalBookings: 88,
    seoTitle: 'Home Cleaning Service Karachi | KarigaarPK',
    seoDescription: 'Professional home deep cleaning services in Karachi. Trained staff, eco-friendly products.',
    seoKeywords: 'cleaning service karachi, home cleaning, deep cleaning karachi'
  },
  {
    providerEmail: 'chef@example.com',
    title: 'Professional Cook for Events & Home',
    category: 'Cook',
    description: 'Experienced chef specializing in Pakistani cuisine, BBQ, and multi-cuisine cooking. Available for weddings, birthday parties, corporate events, and daily home cooking. Hygienic food handling certified.',
    pricePerHour: 2000,
    providerName: 'Chef Bilal',
    providerPhone: '0301-0000001',
    city: 'Multan',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format',
    featured: false,
    available: true,
    experience: 12,
    rating: 4.8,
    numReviews: 33,
    totalBookings: 70,
    seoTitle: 'Event Cook Multan | Professional Chef | KarigaarPK',
    seoDescription: 'Hire a professional cook for events, weddings, and daily cooking in Multan.',
    seoKeywords: 'cook multan, event chef, wedding cook multan'
  }
];

// ─── Seed Function ────────────────────────────────────────────
const importData = async () => {
  try {
    await User.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Cart.deleteMany();

    // Hash passwords before inserting
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10)
      }))
    );

    const insertedUsers = await User.insertMany(hashedUsers);

    // Create provider email to ID mapping
    const providerMap = {};
    insertedUsers.forEach(user => {
      providerMap[user.email] = user._id;
    });

    // Build services with provider references
    const services = serviceTemplates.map(template => ({
      ...template,
      provider: providerMap[template.providerEmail]
    }));

    await Service.insertMany(services);

    console.log('✅ Data imported successfully!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Admin    → admin@karigaarpk.com      / admin123');
    console.log('   Provider → provider@karigaarpk.com   / provider123');
    console.log('   User 1   → amna@example.com          / user123');
    console.log('   User 2   → ayesha@example.com        / user123');
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Cart.deleteMany();
    console.log('🗑️  All data wiped!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Destroy Error:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  importData();
}
