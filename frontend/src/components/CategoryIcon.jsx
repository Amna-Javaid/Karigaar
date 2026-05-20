export default function CategoryIcon({ category, className }) {
  const icons = {
    Electrician: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M13 2 6 13h5l-1 9 10-11h-5l1-10z" />
      </svg>
    ),
    Plumber: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M14.7 3.3a2.5 2.5 0 0 1 3.5 3.5l-1.4 1.4 1.9 1.9-3.2 3.2-1.9-1.9-1.4 1.4a2.5 2.5 0 1 1-3.5-3.5l1.4-1.4 1.9 1.9 3.2-3.2-1.9-1.9 1.4-1.4z" />
      </svg>
    ),
    Tutor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M4 6h16v12H4z" />
        <path d="M4 6l8 5 8-5" />
      </svg>
    ),
    'Mehndi Artist': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2" />
        <path d="M12 19v2" />
        <path d="M3 12h2" />
        <path d="M19 12h2" />
        <path d="M5.6 5.6l1.4 1.4" />
        <path d="M17 17l1.4 1.4" />
        <path d="M5.6 18.4l1.4-1.4" />
        <path d="M17 7l1.4-1.4" />
      </svg>
    ),
    'Makeup Artist': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M8 21h8v-3H8z" />
        <path d="M12 3v12" />
        <path d="M9 8h6" />
      </svg>
    ),
    Carpenter: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M4 20l4-4 2 2 10-10-6-6-10 10 2 2-4 4z" />
      </svg>
    ),
    Painter: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M6 21h12" />
        <path d="M7 15l5-5 3 3-5 5z" />
        <path d="M16 8l3-3" />
      </svg>
    ),
    'AC Technician': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 7v-3" />
        <path d="M12 20v-3" />
        <path d="M7 12H4" />
        <path d="M20 12h-3" />
      </svg>
    ),
    Cleaner: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18l8-8 4 4-8 8z" />
        <path d="M3 21l4-4" />
        <path d="M17 7l4-4" />
      </svg>
    ),
    Driver: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 16h14" />
        <path d="M6 10h12" />
        <path d="M7 16v3" />
        <path d="M17 16v3" />
        <path d="M8 10V6h8v4" />
      </svg>
    ),
    Cook: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M6 11h12v6H6z" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    ),
    Other: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M4 7h16v12H4z" />
        <path d="M8 7V4h8v3" />
        <path d="M9 12h6" />
      </svg>
    ),
  };

  const icon = icons[category] || icons.Other;

  return (
    <span className={['category-svg-icon', className].filter(Boolean).join(' ')}>
      {icon}
    </span>
  );
}
