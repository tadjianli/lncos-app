/* LN COS — Icon system (exact from handoff ui.jsx) */

const ICONS: Record<string, string> = {
  home:    'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5',
  grid:    'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  bag:     'M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8zM9 8V6.5a3 3 0 0 1 6 0V8',
  heart:   'M12 20s-7-4.6-9.2-9.1C1.3 7.8 3 4.8 6 4.8c1.9 0 3.1 1 4 2.3.9-1.3 2.1-2.3 4-2.3 3 0 4.7 3 3.2 6.1C19 15.4 12 20 12 20z',
  user:    'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20.5c.7-3.4 3.6-5.5 7-5.5s6.3 2.1 7 5.5',
  search:  'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.2-3.2',
  chevL:   'M15 5l-7 7 7 7',
  chevR:   'M9 5l7 7-7 7',
  chevD:   'M5 9l7 7 7-7',
  star:    'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z',
  filter:  'M4 6h16M7 12h10M10 18h4',
  sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4',
  share:   'M14 9l5-5m0 0h-4m4 0v4M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5',
  plus:    'M12 5v14M5 12h14',
  minus:   'M5 12h14',
  bell:    'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  gift:    'M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM3 7h18v4H3zM12 7v14M12 7S10.5 3 8 4s1 3 4 3zM12 7s1.5-4 4-3-1 3-4 3z',
  x:       'M6 6l12 12M18 6 6 18',
  check:   'M5 12.5 10 17l9-10',
  trash:   'M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13',
  play:    'M8 5v14l11-7z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  truck:   'M3 7h11v8H3zM14 10h4l3 3v2h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  mail:    'M3 6h18v12H3zM3 7l9 6 9-6',
  pin:     'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  card:    'M3 6h18v12H3zM3 10h18',
  tag:     'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01',
  menu:    'M4 7h16M4 12h16M4 17h16',
  crown:   'M4 8l3.5 3L12 5l4.5 6L20 8l-1.5 10h-13L4 8zM6 21h12',
  flame:   'M12 21c3.3 0 6-2.4 6-6 0-3.6-3-5.5-3-9-2 1-3 2.5-3 4.5C10 8 8.5 6 8.5 6 7 8 6 10.6 6 13c0 3.6 2.7 8 6 8z',
  arrowR:  'M5 12h14M13 6l6 6-6 6',
  clock:   'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  calendar:'M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v4M16 3v4',
  calCheck:'M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v4M16 3v4M9 15.5l2 2 4-4',
  phone:   'M5 4h3.5l1.6 4.2-2.1 1.4a12 12 0 0 0 5.4 5.4l1.4-2.1L19 16.5V20a1 1 0 0 1-1 1A15 15 0 0 1 4 6a1 1 0 0 1 1-2z',
  camera:  'M4 9a2 2 0 0 1 2-2h1.5l1.3-2h6.4l1.3 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z M12 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  edit:    'M4 20l4.5-1L20 7.5a2 2 0 0 0-2.8-2.8L5.7 16.2 4 20zM14.5 6.5l3 3',
  info:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 7.5h.01',
  bolt:    'M13 3 4 14h6l-1 7 9-11h-6l1-7z',
};

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  color?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export function Icon({
  name,
  size = 22,
  stroke = 1.7,
  color = "currentColor",
  fill = "none",
  style,
}: IconProps) {
  const d = ICONS[name];
  if (!d) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d={d} />
    </svg>
  );
}
