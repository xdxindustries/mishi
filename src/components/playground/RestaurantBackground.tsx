import React from 'react';

/**
 * RestaurantBackground — SVG scene for the Bao Bistro.
 * Renders wall, floor, counter, kitchen pass-through, tables, booth,
 * hanging lanterns, door with noren curtain, and ambient decorations.
 */
const RestaurantBackground: React.FC = () => {
  return (
    <svg
      viewBox="0 0 600 350"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <defs>
        {/* Wall gradient */}
        <linearGradient id="wall-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#FFE8CC" />
        </linearGradient>
        {/* Floor gradient */}
        <linearGradient id="floor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4A574" />
          <stop offset="100%" stopColor="#C49462" />
        </linearGradient>
        {/* Counter top */}
        <linearGradient id="counter-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B6D4C" />
          <stop offset="100%" stopColor="#7A5C3E" />
        </linearGradient>
        {/* Wood */}
        <pattern id="wood-grain" width="20" height="4" patternUnits="userSpaceOnUse">
          <rect width="20" height="4" fill="transparent" />
          <line x1="0" y1="2" x2="20" y2="2" stroke="#00000008" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* ===== LAYER 0: Wall ===== */}
      <rect x="0" y="0" width="600" height="280" fill="url(#wall-grad)" />

      {/* Wainscoting / lower wall panel */}
      <rect x="0" y="160" width="600" height="120" fill="#F5E6D3" />
      <line x1="0" y1="160" x2="600" y2="160" stroke="#D4B896" strokeWidth="2" />
      <line x1="0" y1="163" x2="600" y2="163" stroke="#E8D5BD" strokeWidth="1" />

      {/* Baseboard */}
      <rect x="0" y="273" width="600" height="7" fill="#8B6D4C" />

      {/* ===== LAYER 1: Floor ===== */}
      <rect x="0" y="280" width="600" height="70" fill="url(#floor-grad)" />
      <rect x="0" y="280" width="600" height="70" fill="url(#wood-grain)" />
      {/* Floor planks */}
      {[0, 80, 160, 240, 320, 400, 480, 560].map((x) => (
        <line key={x} x1={x} y1="280" x2={x} y2="350" stroke="#00000008" strokeWidth="0.5" />
      ))}

      {/* ===== KITCHEN PASS-THROUGH ===== */}
      <rect x="120" y="80" width="180" height="80" fill="#4a3728" rx="4" />
      <rect x="125" y="85" width="170" height="70" fill="#FFF3E8" rx="2" />
      {/* Shelf in kitchen */}
      <rect x="130" y="100" width="160" height="3" fill="#8B6D4C" />
      {/* Steamer stacks */}
      {[155, 200, 245].map((cx, i) => (
        <g key={cx}>
          {/* Steamer base */}
          <ellipse cx={cx} cy={145} rx={14} ry={4} fill="#C4A882" />
          <rect x={cx - 14} y={125} width={28} height={20} rx={3} fill="#D4B896" />
          <ellipse cx={cx} cy={125} rx={14} ry={4} fill="#E8D5BD" />
          {/* Lid */}
          <ellipse cx={cx} cy={122} rx={12} ry={3} fill="#C4A882" />
          <circle cx={cx} cy={120} r={2} fill="#8B6D4C" />
          {/* Steam wisps */}
          <ellipse cx={cx - 3} cy={110} rx={3} ry={5} fill="white" opacity="0.4">
            <animate attributeName="cy" values="110;95;80" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.2;0" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={cx + 4} cy={108} rx={2} ry={4} fill="white" opacity="0.3">
            <animate attributeName="cy" values="108;90;75" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${0.5 + i * 0.2}s`} />
            <animate attributeName="opacity" values="0.3;0.15;0" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${0.5 + i * 0.2}s`} />
          </ellipse>
        </g>
      ))}

      {/* ===== COUNTER BAR ===== */}
      <rect x="120" y="240" width="230" height="12" rx="3" fill="url(#counter-grad)" />
      <rect x="120" y="247" width="230" height="26" fill="#6B5440" rx="2" />
      {/* Counter stools */}
      {[155, 210, 265, 320].map((cx) => (
        <g key={cx}>
          {/* Stool leg */}
          <rect x={cx - 2} y={260} width={4} height={18} fill="#8B6D4C" rx={1} />
          {/* Stool seat */}
          <ellipse cx={cx} cy={258} rx={12} ry={4} fill="#D4A574" />
          <ellipse cx={cx} cy={256} rx={11} ry={3} fill="#E8C9A8" />
          {/* Foot rest */}
          <rect x={cx - 8} y={270} width={16} height={2} rx={1} fill="#8B6D4C" />
        </g>
      ))}

      {/* ===== TABLES ===== */}
      {/* Table A (lower) */}
      <ellipse cx={435} cy={270} rx={35} ry={8} fill="#8B6D4C" />
      <ellipse cx={435} cy={268} rx={33} ry={7} fill="#A07855" />
      <rect x={432} y={268} width={6} height={14} fill="#8B6D4C" />
      {/* Table A chairs */}
      <ellipse cx={405} cy={275} rx={8} ry={3} fill="#D4A574" />
      <ellipse cx={465} cy={275} rx={8} ry={3} fill="#D4A574" />

      {/* Table B (upper/further) */}
      <ellipse cx={435} cy={190} rx={30} ry={7} fill="#8B6D4C" />
      <ellipse cx={435} cy={188} rx={28} ry={6} fill="#A07855" />
      <rect x={432} y={188} width={6} height={12} fill="#8B6D4C" />
      {/* Table B chairs */}
      <ellipse cx={408} cy={195} rx={7} ry={2.5} fill="#D4A574" />
      <ellipse cx={462} cy={195} rx={7} ry={2.5} fill="#D4A574" />

      {/* ===== BOOTH ===== */}
      {/* Booth back */}
      <rect x={510} y={190} width={80} height={55} rx={6} fill="#C4574A" />
      <rect x={515} y={195} width={70} height={45} rx={4} fill="#D46B5E" />
      {/* Booth seat */}
      <rect x={510} y={240} width={80} height={12} rx={4} fill="#C4574A" />
      <rect x={512} y={238} width={76} height={8} rx={3} fill="#E8897C" />
      {/* Booth table */}
      <rect x={535} y={215} width={30} height={20} rx={3} fill="#8B6D4C" />
      <rect x={533} y={213} width={34} height={6} rx={2} fill="#A07855" />

      {/* ===== DOOR ===== */}
      {/* Door frame */}
      <rect x={0} y={170} width={60} height={110} fill="#6B5440" rx={3} />
      <rect x={4} y={174} width={52} height={102} fill="#8B7B6B" rx={2} />
      {/* Noren curtain panels */}
      {[10, 22, 34, 46].map((x, i) => (
        <rect key={x} x={x} y={174} width={10} height={50} rx={2} fill="#C4574A" opacity={0.85}>
          <animate
            attributeName="transform"
            type="rotate"
            values={`0 ${x + 5} 174;${i % 2 ? 2 : -2} ${x + 5} 174;0 ${x + 5} 174`}
            dur="4s"
            repeatCount="indefinite"
            begin={`${i * 0.3}s`}
          />
        </rect>
      ))}
      {/* Noren text (暖簾 style) */}
      <text x="30" y="200" textAnchor="middle" fontSize="8" fill="#FFF8F0" fontWeight="bold" opacity="0.7">
        包
      </text>

      {/* Welcome mat */}
      <rect x={10} y={285} width={40} height={14} rx={3} fill="#8B6D4C" opacity={0.6} />
      <rect x={12} y={287} width={36} height={10} rx={2} fill="#A07855" opacity={0.4} />

      {/* ===== DECORATIONS ===== */}
      {/* Hanging lanterns */}
      {[180, 350, 500].map((cx, i) => (
        <g key={cx} className="playground-lantern">
          <line x1={cx} y1={0} x2={cx} y2={30 + i * 3} stroke="#C4574A" strokeWidth="1" />
          <ellipse cx={cx} cy={38 + i * 3} rx={10} ry={14} fill="#E85D4A" opacity={0.9}>
            <animate
              attributeName="transform"
              type="rotate"
              values={`0 ${cx} 20;${i % 2 ? 3 : -3} ${cx} 20;0 ${cx} 20`}
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx={cx} cy={38 + i * 3} rx={8} ry={12} fill="#FF7B6B" opacity={0.6} />
          <line x1={cx - 3} y1={52 + i * 3} x2={cx + 3} y2={52 + i * 3} stroke="#C4574A" strokeWidth="1.5" />
          {/* Glow */}
          <ellipse cx={cx} cy={38 + i * 3} rx={15} ry={18} fill="#FF7B6B" opacity={0.08} />
        </g>
      ))}

      {/* Chalkboard menu */}
      <rect x={375} y={90} width={60} height={45} rx={3} fill="#2D3B2D" />
      <rect x={378} y={93} width={54} height={39} fill="#3D4B3D" rx={2} />
      <text x={405} y={107} textAnchor="middle" fontSize="6" fill="#F0E8D8" fontFamily="serif">Menu</text>
      <line x1={385} y1={111} x2={425} y2={111} stroke="#F0E8D8" strokeWidth="0.5" opacity="0.6" />
      <text x={405} y={119} textAnchor="middle" fontSize="4.5" fill="#F0E8D8" opacity="0.7">Dim Sum ★</text>
      <text x={405} y={126} textAnchor="middle" fontSize="4.5" fill="#F0E8D8" opacity="0.7">Hot Tea ♨</text>

      {/* Wall clock */}
      <circle cx={80} cy={100} r={16} fill="#FFF8F0" stroke="#8B6D4C" strokeWidth="2" />
      <circle cx={80} cy={100} r={14} fill="white" />
      {/* Clock numbers */}
      {[12, 3, 6, 9].map((n, i) => {
        const angle = (i * 90 - 90) * (Math.PI / 180);
        const tx = 80 + Math.cos(angle) * 10;
        const ty = 100 + Math.sin(angle) * 10 + 2;
        return (
          <text key={n} x={tx} y={ty} textAnchor="middle" fontSize="4" fill="#4a3728" fontWeight="bold">
            {n}
          </text>
        );
      })}
      {/* Hour hand */}
      <line x1={80} y1={100} x2={80} y2={90} stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 80 100" to="360 80 100" dur="43200s" repeatCount="indefinite" />
      </line>
      {/* Minute hand */}
      <line x1={80} y1={100} x2={80} y2={88} stroke="#8B6D4C" strokeWidth="1" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 80 100" to="360 80 100" dur="3600s" repeatCount="indefinite" />
      </line>
      {/* Center dot */}
      <circle cx={80} cy={100} r={1.5} fill="#4a3728" />

      {/* Framed bao portrait on wall */}
      <rect x={470} y={95} width={30} height={35} rx={2} fill="#8B6D4C" />
      <rect x={473} y={98} width={24} height={29} fill="#FFF3E8" rx={1} />
      <circle cx={485} cy={112} r={8} fill="#FFB5A7" opacity={0.6} />
      <circle cx={483} cy={110} r={1.5} fill="#4a3728" />
      <circle cx={487} cy={110} r={1.5} fill="#4a3728" />
      <path d="M482 114 Q485 117 488 114" fill="none" stroke="#4a3728" strokeWidth="0.8" />

      {/* Condiments on counter */}
      {[145, 230, 290].map((x) => (
        <g key={x}>
          <rect x={x - 3} y={233} width={6} height={8} rx={1} fill="#E8D5BD" />
          <rect x={x - 2} y={231} width={4} height={3} rx={1} fill="#C4A882" />
        </g>
      ))}

      {/* Teapot on counter */}
      <g transform="translate(340, 230)">
        <ellipse cx={0} cy={5} rx={8} ry={6} fill="#6B8F71" />
        <ellipse cx={0} cy={3} rx={7} ry={3} fill="#7AA37F" />
        <circle cx={0} cy={0} r={3} fill="#6B8F71" />
        <path d="M8 3 Q14 0 10 -3" fill="none" stroke="#6B8F71" strokeWidth="2" />
        {/* Tiny steam */}
        <ellipse cx={-2} cy={-5} rx={2} ry={3} fill="white" opacity="0.3">
          <animate attributeName="cy" values="-5;-15;-25" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.15;0" dur="3s" repeatCount="indefinite" />
        </ellipse>
      </g>
    </svg>
  );
};

export default RestaurantBackground;
