const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB().then(async () => {
  try {
    const Service = require('./models/Service');
    const servicesToMigrate = await Service.find({
      $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }]
    });
    if (servicesToMigrate.length > 0) {
      console.log(`[Migration] Found ${servicesToMigrate.length} services without a slug. Generating...`);
      for (const service of servicesToMigrate) {
        // Triggering the pre-save hook to generate the slug
        await service.save();
      }
      console.log(`[Migration] Slugs successfully generated.`);
    }
  } catch (error) {
    console.error('[Migration] Failed to migrate service slugs:', error);
  }
});

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/cart',     require('./routes/cartRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/chatbot',  require('./routes/chatbotRoutes'));
app.use('/api/admin/analytics', require('./routes/analyticsRoutes'));
app.get('/api', (req, res) => res.json({ message: '✅ KarigaarPK API Running', version: '2.0.0' }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT   = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`\n🚀 KarigaarPK API on http://localhost:${PORT}\n`));
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} busy. Change PORT in .env\n`);
    process.exit(1);
  }
});
