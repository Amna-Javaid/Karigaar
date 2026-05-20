import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { sendChatMessage, getChatSuggestions, addToCart } from '../services/api';
import './Chatbot.css';

const CATEGORY_ICONS = {
  'Electrician':'⚡','Plumber':'🔧','Tutor':'📚','Mehndi Artist':'🌸',
  'Makeup Artist':'💄','Carpenter':'🪚','Painter':'🎨','AC Technician':'❄️',
  'Cleaner':'🧹','Driver':'🚗','Cook':'👨‍🍳','Other':'🛠️'
};

const STATUS_STYLE = {
  pending:      { color:'#f59e0b', label:'⏳ Pending' },
  confirmed:    { color:'#3b82f6', label:'✅ Confirmed' },
  'in-progress':{ color:'#8b5cf6', label:'🔧 In Progress' },
  completed:    { color:'#10b981', label:'🎉 Completed' },
  cancelled:    { color:'#ef4444', label:'❌ Cancelled' },
};

// Format reply text — bold **text** → <strong>
function formatText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function Chatbot() {
  const { user }     = useAuth();
  const { addItem, fetchCart } = useCart();
  const navigate     = useNavigate();

  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg]   = useState(false);
  const [unread, setUnread]       = useState(0);
  const [typing, setTyping]       = useState(false);
  const [cartAdding, setCartAdding] = useState(null);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const suggTimer  = useRef(null);

  // Initial welcome message
  useEffect(() => {
    const welcome = {
      id: Date.now(),
      role: 'bot',
      text: user
        ? `Salam ${user.name.split(' ')[0]}! 👋 I'm your KarigaarPK AI assistant.\n\nI can help you:\n• 🔍 **Find services** by category, city or price\n• 📦 **Track your bookings** live\n• 🛒 **Manage your cart**\n• 💡 **Get recommendations**\n• ❓ Answer any **FAQs**\n\nWhat can I help you with?`
        : `Salam! 👋 I'm the KarigaarPK AI assistant.\n\nAsk me to find electricians, plumbers, tutors and more — or ask about bookings, payment, or anything else!\n\nWhat are you looking for today?`,
      quickReplies: user
        ? ['Find Electrician', 'Track my booking', 'Show trending', 'What is in my cart?']
        : ['Find Electrician', 'Find Plumber', 'Find Tutor', 'How does booking work?'],
      time: new Date()
    };
    setMessages([welcome]);
  }, [user]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Unread counter when closed
  useEffect(() => {
    if (!open && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'bot') setUnread(u => u + 1);
    }
  }, [messages]);

  const clearUnread = () => setUnread(0);

  // Autocomplete
  const handleInputChange = async (val) => {
    setInput(val);
    clearTimeout(suggTimer.current);
    if (val.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    suggTimer.current = setTimeout(async () => {
      try {
        const { data } = await getChatSuggestions(val);
        setSuggestions(data.suggestions || []);
        setShowSugg(data.suggestions?.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), time: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setSuggestions([]);
    setShowSugg(false);
    setLoading(true);
    setTyping(true);

    try {
      // Simulate typing delay for realism
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

      const { data } = await sendChatMessage({ message: text.trim() });
      setTyping(false);

      const botMsg = {
        id:          Date.now() + 1,
        role:        'bot',
        text:        data.reply,
        services:    data.services    || [],
        bookings:    data.bookings    || [],
        quickReplies:data.quickReplies|| [],
        action:      data.action      || null,
        time:        new Date()
      };
      setMessages(p => [...p, botMsg]);

      // Handle navigation actions
      if (data.action?.type === 'navigate') {
        setTimeout(() => navigate(data.action.path), 1500);
      }
    } catch {
      setTyping(false);
      setMessages(p => [...p, {
        id: Date.now() + 1, role: 'bot',
        text: '😔 Sorry, I had trouble connecting. Please try again!',
        quickReplies: ['Try again', 'Contact support'],
        time: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, navigate]);

  const handleAddToCart = async (serviceId) => {
    if (!user) { sendMessage('I need to add a service to my cart but I am not logged in'); return; }
    setCartAdding(serviceId);
    try {
      await addToCart({ serviceId, hours: 1 });
      await fetchCart();
      setMessages(p => [...p, {
        id: Date.now(), role: 'bot',
        text: '✅ Service added to your cart! You can adjust hours in the cart page.',
        quickReplies: ['Go to cart', 'Add more services'],
        time: new Date()
      }]);
    } catch {
      setMessages(p => [...p, {
        id: Date.now(), role: 'bot',
        text: '❌ Could not add to cart. Please try from the service page.',
        quickReplies: ['Browse services'],
        time: new Date()
      }]);
    } finally { setCartAdding(null); }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    if (e.key === 'Escape') setShowSugg(false);
  };

  const handleQuickReply = (text) => {
    // Map display labels to actual messages
    const MAP = {
      'Go to cart':        () => navigate('/cart'),
      'Go to checkout':    () => navigate('/checkout'),
      'Browse services':   () => navigate('/browse'),
      'Browse all services':() => navigate('/browse'),
      'Register as provider':() => navigate('/register'),
      'View all bookings': () => navigate('/my-bookings'),
    };
    if (MAP[text]) { MAP[text](); return; }
    sendMessage(text);
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-PK', { hour:'2-digit', minute:'2-digit' });

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => { setOpen(o => !o); clearUnread(); }}
        aria-label="Open AI Assistant"
      >
        {open ? '✕' : '💬'}
        {!open && unread > 0 && <span className="chat-fab-badge">{unread}</span>}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-bot-avatar">🤖</div>
              <div>
                <div className="chat-bot-name">KarigaarPK AI</div>
                <div className="chat-bot-status">
                  <span className="status-dot" />
                  {typing ? 'typing...' : 'Online'}
                </div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg-wrap ${msg.role}`}>
                {msg.role === 'bot' && <div className="chat-bot-icon">🤖</div>}

                <div className="chat-bubble-group">
                  {/* Text bubble */}
                  <div className={`chat-bubble ${msg.role}`}>
                    <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                    <span className="chat-time">{formatTime(msg.time)}</span>
                  </div>

                  {/* Service cards */}
                  {msg.services?.length > 0 && (
                    <div className="chat-services">
                      {msg.services.map(s => (
                        <div key={s._id} className="chat-service-card">
                          <img
                            src={s.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=120&auto=format'}
                            alt={s.title}
                            className="chat-service-img"
                          />
                          <div className="chat-service-info">
                            <div className="chat-service-cat">
                              {CATEGORY_ICONS[s.category]} {s.category}
                            </div>
                            <div className="chat-service-title">{s.title}</div>
                            <div className="chat-service-meta">
                              📍 {s.city} · ⭐ {(s.rating || 0).toFixed(1)}
                            </div>
                            <div className="chat-service-price">
                              Rs. {s.pricePerHour?.toLocaleString()}<span>/hr</span>
                            </div>
                          </div>
                          <div className="chat-service-actions">
                            <button className="chat-svc-btn primary" onClick={() => navigate(`/service/${s._id}`)}>View</button>
                            <button
                              className="chat-svc-btn ghost"
                              disabled={cartAdding === s._id}
                              onClick={() => handleAddToCart(s._id)}
                            >
                              {cartAdding === s._id ? '...' : '🛒'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Booking cards */}
                  {msg.bookings?.length > 0 && (
                    <div className="chat-bookings">
                      {msg.bookings.map(b => {
                        const s = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                        return (
                          <div key={b._id} className="chat-booking-card">
                            <div className="chat-booking-header">
                              <span className="chat-booking-title">{b.serviceTitle}</span>
                              <span className="chat-booking-status" style={{ color: s.color }}>{s.label}</span>
                            </div>
                            <div className="chat-booking-meta">
                              📅 {new Date(b.scheduledDate).toLocaleDateString('en-PK', { day:'numeric', month:'short' })} · {b.scheduledTime}
                              &nbsp;·&nbsp; 📍 {b.city}
                            </div>
                            {b.trackingSteps && (
                              <div className="chat-tracking">
                                {b.trackingSteps.map((step, i) => (
                                  <div key={i} className={`chat-track-step ${step.done ? 'done' : ''}`}>
                                    <span className="chat-track-dot">{step.done ? '✓' : '○'}</span>
                                    <span>{step.step}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button className="chat-svc-btn primary" style={{ width:'100%', marginTop:8 }}
                              onClick={() => navigate(`/booking/${b._id}`)}>
                              Full Details →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick replies */}
                  {msg.quickReplies?.length > 0 && (
                    <div className="chat-quick-replies">
                      {msg.quickReplies.map((qr, i) => (
                        <button key={i} className="chat-qr-btn" onClick={() => handleQuickReply(qr)}>
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chat-msg-wrap bot">
                <div className="chat-bot-icon">🤖</div>
                <div className="chat-bubble bot typing-bubble">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Autocomplete suggestions */}
          {showSugg && suggestions.length > 0 && (
            <div className="chat-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="chat-sugg-item" onClick={() => {
                  if (s.type === 'service') navigate(`/service/${s.id}`);
                  else sendMessage(`Show me ${s.value} services`);
                  setShowSugg(false);
                }}>
                  <span className="sugg-icon">{s.type === 'category' ? '🏷️' : '🛠️'}</span>
                  <div>
                    <div className="sugg-label">{s.label}</div>
                    {s.sub && <div className="sugg-sub">{s.sub}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              type="text"
              placeholder="Ask me anything... (e.g. find plumber in Lahore)"
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => input.length >= 2 && setShowSugg(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSugg(false), 200)}
              disabled={loading}
              maxLength={300}
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              {loading ? '⟳' : '➤'}
            </button>
          </div>

          <div className="chat-footer">
            Powered by KarigaarPK AI · <span onClick={() => navigate('/browse')} style={{ cursor:'pointer', textDecoration:'underline' }}>Browse All Services</span>
          </div>
        </div>
      )}
    </>
  );
}
