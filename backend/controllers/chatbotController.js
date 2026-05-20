const Service  = require('../models/Service');
const Booking  = require('../models/Booking');
const Cart     = require('../models/Cart');
const User     = require('../models/User');

// ─── FAQ Knowledge Base ───────────────────────────────────────
const FAQ = {
  shipping: `We don't ship physical goods — KarigaarPK sends skilled Karigaars to your home! Once your booking is confirmed, the provider will arrive at your scheduled date and time. You'll receive live tracking updates through your My Bookings page.`,
  return: `You can cancel any booking that is still in 'pending' or 'confirmed' status from your My Bookings page. If a service has already been completed, please contact support. For disputes about service quality, we offer a re-service guarantee within 48 hours.`,
  payment: `We support two payment methods:\n1. **Cash on Delivery (COD)** — Pay the Karigaar directly when the service is done.\n2. **Card (Sandbox)** — Simulated online card payment for testing. Use card: 4242 4242 4242 4242.\nAll prices are in Pakistani Rupees (PKR).`,
  refund: `Refunds are processed within 3-5 business days for card payments. COD bookings are settled directly with the provider. To request a refund, cancel your booking before it reaches 'in-progress' status.`,
  cities: `KarigaarPK currently operates in 7 cities: Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar. More cities coming soon!`,
  categories: `We offer 11 service categories: Electrician, Plumber, Tutor, Mehndi Artist, Makeup Artist, Carpenter, Painter, AC Technician, Cleaner, Driver, and Cook.`,
  booking: `To book a service:\n1. Browse or search for a service\n2. Click the service to view details\n3. Select number of hours and click "Book Now" or "Add to Cart"\n4. Fill in your date, time, and address\n5. Choose payment method and confirm!\nYou'll get live tracking updates once the Karigaar is on their way.`,
  provider: `Want to list your services on KarigaarPK? Register as a Service Provider on our signup page, fill in your business details, and start adding services. An admin will verify your account and you'll be live within 24 hours.`,
  contact: `For support, email us at support@karigaarpk.com or call 0300-1234567. We're available Monday to Saturday, 9am to 9pm.`
};

// ─── Intent Detection ─────────────────────────────────────────
function detectIntent(msg) {
  const m = msg.toLowerCase();

  // Order/Booking tracking
  if (/where.*(order|booking)|track|status|booking.*status|my.*booking|order.*status/.test(m))
    return 'track_order';

  // Search / Discovery
  if (/(find|show|search|looking for|need|want|get me|i want|suggest|recommend).*service/.test(m) ||
      /service.*(under|below|cheap|budget|affordable|best|top|rated)/.test(m) ||
      /(electrician|plumber|tutor|mehndi|makeup|carpenter|painter|ac|cleaner|driver|cook)/.test(m))
    return 'search_services';

  // Cart operations
  if (/(add|remove|delete|clear|empty).*cart|cart.*(add|remove)/.test(m))
    return 'cart_action';

  // Recommendations
  if (/(recommend|suggest|popular|trending|best|top|others also|customers also|similar)/.test(m))
    return 'recommend';

  // Price filter
  if (/(under|below|less than|budget|cheap|affordable|price|cost|rate|per hour)/.test(m) &&
      /\d+/.test(m))
    return 'price_filter';

  // FAQ - Shipping/Delivery
  if (/(shipping|delivery|arrive|when.*come|how.*long)/.test(m))
    return 'faq_shipping';

  // FAQ - Cancel/Return
  if (/(cancel|return|refund|money back|dispute)/.test(m))
    return 'faq_return';

  // FAQ - Payment
  if (/(payment|pay|how.*pay|cash|card|cod|method)/.test(m))
    return 'faq_payment';

  // FAQ - Cities
  if (/(city|cities|area|location|available|lahore|karachi|islamabad|rawalpindi|multan|peshawar|faisalabad)/.test(m))
    return 'faq_cities';

  // FAQ - How to book
  if (/(how.*book|booking.*work|how.*use|how.*order|process|steps)/.test(m))
    return 'faq_booking';

  // FAQ - Become provider
  if (/(provide|register.*service|offer.*service|join.*provider|become.*karigaar|list.*service)/.test(m))
    return 'faq_provider';

  // Contact
  if (/(contact|support|help|phone|email|reach)/.test(m))
    return 'faq_contact';

  // Greeting
  if (/^(hi|hello|hey|salam|assalam|good morning|good afternoon|good evening|helo|hii|sup)/.test(m))
    return 'greeting';

  // Thanks
  if (/(thank|thanks|shukriya|jazakallah|great|awesome|perfect|ok|okay|got it)/.test(m))
    return 'thanks';

  return 'unknown';
}

// ─── Extract price from message ──────────────────────────────
function extractPrice(msg) {
  const match = msg.match(/(\d[\d,]*)/);
  if (!match) return null;
  return parseInt(match[1].replace(',', ''));
}

// ─── Extract category from message ───────────────────────────
function extractCategory(msg) {
  const m = msg.toLowerCase();
  const cats = {
    'electrician': 'Electrician', 'electric': 'Electrician', 'wiring': 'Electrician',
    'plumber': 'Plumber', 'plumbing': 'Plumber', 'pipe': 'Plumber',
    'tutor': 'Tutor', 'teacher': 'Tutor', 'teaching': 'Tutor', 'math': 'Tutor', 'science': 'Tutor',
    'mehndi': 'Mehndi Artist', 'henna': 'Mehndi Artist',
    'makeup': 'Makeup Artist', 'beauty': 'Makeup Artist', 'bridal': 'Makeup Artist',
    'carpenter': 'Carpenter', 'furniture': 'Carpenter', 'wood': 'Carpenter',
    'painter': 'Painter', 'painting': 'Painter', 'wall': 'Painter',
    'ac': 'AC Technician', 'air condition': 'AC Technician', 'cooling': 'AC Technician',
    'cleaner': 'Cleaner', 'cleaning': 'Cleaner', 'maid': 'Cleaner',
    'driver': 'Driver', 'driving': 'Driver', 'car': 'Driver',
    'cook': 'Cook', 'chef': 'Cook', 'cooking': 'Cook', 'food': 'Cook'
  };
  for (const [keyword, category] of Object.entries(cats)) {
    if (m.includes(keyword)) return category;
  }
  return null;
}

// ─── Extract city from message ────────────────────────────────
function extractCity(msg) {
  const m = msg.toLowerCase();
  const cities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar'];
  for (const city of cities) {
    if (m.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
  }
  return null;
}

// ─── Format service for chat ──────────────────────────────────
function formatService(s) {
  return {
    _id:          s._id,
    title:        s.title,
    category:     s.category,
    pricePerHour: s.pricePerHour,
    city:         s.city,
    rating:       s.rating,
    providerName: s.providerName,
    image:        s.image
  };
}

// ─────────────────────────────────────────────────────────────
// POST /api/chatbot/message
// ─────────────────────────────────────────────────────────────
const handleMessage = async (req, res) => {
  try {
    const { message, sessionData = {} } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const intent    = detectIntent(message);
    const userId    = req.user?._id || null;
    let reply       = '';
    let services    = [];
    let bookings    = [];
    let quickReplies = [];
    let action      = null;

    // ── 1. GREETING ──────────────────────────────────────────
    if (intent === 'greeting') {
      reply = userId
        ? `Salam! 👋 Welcome back to KarigaarPK! I'm your AI assistant. I can help you:\n\n🔍 **Find services** — "show me electricians in Lahore"\n📦 **Track bookings** — "where is my booking?"\n🛒 **Cart help** — "what's in my cart?"\n💡 **Recommendations** — "what's trending?"\n❓ **FAQs** — ask me anything!\n\nWhat can I help you with today?`
        : `Salam! 👋 Welcome to KarigaarPK — Pakistan's #1 local service hub!\n\nI'm your AI assistant. I can help you find electricians, plumbers, tutors, mehndi artists and more.\n\nWhat service are you looking for?`;
      quickReplies = ['Find Electrician', 'Find Plumber', 'Find Tutor', 'Track my booking', 'Payment methods'];
    }

    // ── 2. TRACK ORDER ───────────────────────────────────────
    else if (intent === 'track_order') {
      if (!userId) {
        reply = '🔐 Please **log in** to track your bookings. Your booking history and live tracking are available after login.';
        quickReplies = ['How to book?', 'Contact support'];
      } else {
        const myBookings = await Booking.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(5);

        if (myBookings.length === 0) {
          reply = `You don't have any bookings yet! Browse our services and book your first Karigaar. 😊`;
          quickReplies = ['Browse services', 'How to book?'];
        } else {
          const statusEmoji = { pending: '⏳', confirmed: '✅', 'in-progress': '🔧', completed: '🎉', cancelled: '❌' };
          bookings = myBookings.map(b => ({
            _id:            b._id,
            serviceTitle:   b.serviceTitle,
            serviceCategory:b.serviceCategory,
            status:         b.status,
            scheduledDate:  b.scheduledDate,
            scheduledTime:  b.scheduledTime,
            totalAmount:    b.totalAmount,
            providerName:   b.providerName,
            city:           b.city,
            trackingSteps:  b.trackingSteps
          }));
          const latest = myBookings[0];
          reply = `Here are your recent bookings! Your latest booking **"${latest.serviceTitle}"** is currently **${statusEmoji[latest.status] || ''} ${latest.status}**.\n\nScheduled for ${new Date(latest.scheduledDate).toLocaleDateString('en-PK', { weekday:'long', day:'numeric', month:'short' })} at ${latest.scheduledTime}.`;
          quickReplies = ['View all bookings', 'Cancel a booking', 'Contact support'];
        }
      }
    }

    // ── 3. SEARCH SERVICES ───────────────────────────────────
    else if (intent === 'search_services' || intent === 'price_filter') {
      const category = extractCategory(message);
      const city     = extractCity(message);
      const maxPrice = extractPrice(message);

      const query = { available: true };
      if (category) query.category = category;
      if (city)     query.city     = city;
      if (maxPrice) query.pricePerHour = { $lte: maxPrice };

      const found = await Service.find(query).sort({ rating: -1 }).limit(5);

      if (found.length === 0) {
        reply = `I couldn't find services matching your request${category ? ` for "${category}"` : ''}${city ? ` in ${city}` : ''}${maxPrice ? ` under Rs. ${maxPrice}` : ''}. Try different filters or browse all services.`;
        quickReplies = ['Browse all services', 'Show all categories', 'Change city'];
      } else {
        services = found.map(formatService);
        const filters = [category, city, maxPrice ? `under Rs. ${maxPrice}` : null].filter(Boolean);
        reply = `Found **${found.length} service${found.length > 1 ? 's' : ''}**${filters.length ? ` for ${filters.join(', ')}` : ''}! Here's what I found:`;
        quickReplies = ['Show more', 'Change city', 'Different category'];
      }
    }

    // ── 4. RECOMMENDATIONS ───────────────────────────────────
    else if (intent === 'recommend') {
      // Trending = highest total bookings; Top rated = highest rating
      const [trending, topRated] = await Promise.all([
        Service.find({ available: true }).sort({ totalBookings: -1 }).limit(3),
        Service.find({ available: true, numReviews: { $gt: 0 } }).sort({ rating: -1 }).limit(3)
      ]);

      // "Customers also booked" — if user has bookings, find services in same category
      let alsoBooked = [];
      if (userId) {
        const lastBooking = await Booking.findOne({ user: userId }).sort({ createdAt: -1 });
        if (lastBooking?.serviceCategory) {
          alsoBooked = await Service.find({
            available: true,
            category: lastBooking.serviceCategory,
            _id: { $ne: lastBooking.service }
          }).limit(2);
        }
      }

      const combined = [...new Map(
        [...(alsoBooked.length ? alsoBooked : []), ...trending].map(s => [s._id.toString(), s])
      ).values()].slice(0, 5);

      services = combined.map(formatService);
      reply = alsoBooked.length
        ? `Based on your booking history, here are services you might love! Also showing our top trending services:`
        : `Here are our **most popular and trending services** right now! These are booked most often by customers like you:`;
      quickReplies = ['Show top rated', 'Browse all categories', 'Find by city'];
    }

    // ── 5. CART ACTION ───────────────────────────────────────
    else if (intent === 'cart_action') {
      if (!userId) {
        reply = '🔐 Please **log in** to manage your cart. Cart is saved across sessions once you sign in!';
        quickReplies = ['How to book?'];
      } else {
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
          reply = `Your cart is currently **empty**. Browse services and add them to your cart to book multiple Karigaars at once!`;
          quickReplies = ['Browse services', 'Show trending'];
          action = { type: 'navigate', path: '/browse' };
        } else {
          const total = cart.items.reduce((s, i) => s + i.pricePerHour * i.hours, 0);
          const itemList = cart.items.map(i => `• **${i.title}** — ${i.hours}h × Rs. ${i.pricePerHour?.toLocaleString()} = Rs. ${(i.hours * i.pricePerHour).toLocaleString()}`).join('\n');
          reply = `🛒 Your cart has **${cart.items.length} service${cart.items.length > 1 ? 's' : ''}**:\n\n${itemList}\n\n**Total: Rs. ${total.toLocaleString()}**`;
          quickReplies = ['Go to checkout', 'Clear cart', 'Add more services'];
          action = { type: 'show_cart' };
        }
      }
    }

    // ── 6. FAQ RESPONSES ─────────────────────────────────────
    else if (intent === 'faq_shipping') {
      reply = FAQ.shipping;
      quickReplies = ['How to book?', 'Track my booking', 'Payment methods'];
    }
    else if (intent === 'faq_return') {
      reply = FAQ.return;
      quickReplies = ['How to cancel?', 'Contact support', 'Payment methods'];
    }
    else if (intent === 'faq_payment') {
      reply = FAQ.payment;
      quickReplies = ['How to book?', 'Refund policy', 'Contact support'];
    }
    else if (intent === 'faq_cities') {
      reply = FAQ.cities;
      quickReplies = ['Find services in Lahore', 'Find services in Karachi', 'Browse all'];
    }
    else if (intent === 'faq_booking') {
      reply = FAQ.booking;
      quickReplies = ['Browse services', 'Track my booking', 'Payment methods'];
    }
    else if (intent === 'faq_provider') {
      reply = FAQ.provider;
      quickReplies = ['Register as provider', 'Contact support'];
    }
    else if (intent === 'faq_contact') {
      reply = FAQ.contact;
      quickReplies = ['Shipping info', 'Refund policy', 'How to book?'];
    }

    // ── 7. THANKS ────────────────────────────────────────────
    else if (intent === 'thanks') {
      reply = `You're welcome! 😊 Is there anything else I can help you with?\n\nYou can always ask me to find services, track bookings, or answer any questions!`;
      quickReplies = ['Find a service', 'Track my booking', 'Browse categories'];
    }

    // ── 8. UNKNOWN ───────────────────────────────────────────
    else {
      reply = `I'm not sure I understood that. Here's what I can help with:\n\n🔍 **Find services** — "show me plumbers in Lahore"\n📦 **Track bookings** — "where is my booking?"\n💡 **Recommendations** — "what's trending?"\n🛒 **Cart** — "what's in my cart?"\n❓ **FAQs** — shipping, payment, cancellation\n\nOr type **hello** to start over!`;
      quickReplies = ['Find Electrician', 'Track my booking', 'Payment info', 'Contact support'];
    }

    return res.json({ reply, services, bookings, quickReplies, action, intent });

  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({
      reply: 'Sorry, I ran into an error. Please try again or contact support at support@karigaarpk.com',
      services: [], bookings: [], quickReplies: ['Contact support']
    });
  }
};

// POST /api/chatbot/autocomplete  — smart search suggestions
const autocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ suggestions: [] });

    const services = await Service.find({
      available: true,
      $or: [
        { title:       { $regex: q, $options: 'i' } },
        { category:    { $regex: q, $options: 'i' } },
        { providerName:{ $regex: q, $options: 'i' } }
      ]
    }).select('title category city pricePerHour slug').limit(6);

    // Also add category suggestions
    const allCats = ['Electrician','Plumber','Tutor','Mehndi Artist','Makeup Artist','Carpenter','Painter','AC Technician','Cleaner','Driver','Cook'];
    const catSugg = allCats.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 3);

    res.json({
      suggestions: [
        ...catSugg.map(c => ({ type: 'category', label: c, value: c })),
        ...services.map(s => ({ type: 'service', label: s.title, sub: `${s.category} · ${s.city} · Rs. ${s.pricePerHour}/hr`, id: s._id }))
      ]
    });
  } catch (err) {
    res.status(500).json({ suggestions: [] });
  }
};

module.exports = { handleMessage, autocomplete };
