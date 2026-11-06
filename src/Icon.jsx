import React from 'react'

const P = {
  lighthouse: <><path d="M9 21h6M10 21l1-12h2l1 12M10 9l-1-3h6l-1 3M12 3v1" /><path d="M5 7l3 1M19 7l-3 1" /></>,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><path d="M16 5.2a3 3 0 010 5.6M18 14.8c1.8.7 3 2.4 3 5.2" /></>,
  class: <><path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" /></>,
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9zM9 12h6M9 16h4" /></>,
  spark: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></>,
  shield: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01" /></>,
  bell: <><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15zM10 20a2 2 0 004 0" /></>,
  chev: <path d="M9 6l6 6-6 6" />,
  chevdown: <path d="M6 9l6 6 6-6" />,
  updown: <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />,
  download: <><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></>,
  filter: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  sort: <path d="M4 6h16M7 12h10M10 18h4" />,
  shieldsmall: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  flag: <><path d="M6 21V4M6 5h11l-2 4 2 4H6" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  book: <><path d="M5 5a2 2 0 012-2h12v16H7a2 2 0 00-2 2zM5 19V5" /></>,
  wifioff: <><path d="M3 3l18 18M8.5 16.5a5 5 0 017 0M5 12.5a10 10 0 015-2.6M12 20h.01" /></>,
  heart: <><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.4A4 4 0 0119 10c0 5.600-7 10-7 10z" /></>,
  user: <><circle cx="12" cy="9" r="3.5" /><path d="M5 20c0-3.5 3.1-6 7-6s7 2.500 7 6" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M15 6l-6 6 6 6" />,
  scan: <><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M8 12h8" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  upload: <><path d="M12 16V5M7 9l5-5 5 5M5 20h14" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /></>,
}

export default function Icon({ name, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  )
}
