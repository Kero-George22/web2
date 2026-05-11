import { useId } from 'react';

export default function ZazaRobotMascot({ thinking = false, wave = false, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const rgbHead = `zaza-rgbHead-${uid}`;
  const bodyGrad = `zaza-bodyGrad-${uid}`;
  const screenGrad = `zaza-screenGrad-${uid}`;

  return (
    <div
      className={`zaza-robot-svg-wrap ${thinking ? 'zaza-thinking' : ''} ${wave ? 'zaza-wave-once' : ''} ${className}`.trim()}
      aria-hidden
    >
      <svg width="100" height="110" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={rgbHead} x1="0" y1="0" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" className="zaza-rgb-stop-1" />
            <stop offset="100%" className="zaza-rgb-stop-2" />
          </linearGradient>
          <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2f3a" />
            <stop offset="100%" stopColor="#1a1f2a" />
          </linearGradient>
          <linearGradient id={screenGrad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a0e18" />
            <stop offset="100%" stopColor="#0d1520" />
          </linearGradient>
        </defs>

        <ellipse cx="50" cy="108" rx="20" ry="4" fill="rgba(0,0,0,0.35)" />

        <g className="zaza-robot-leg-l">
          <rect x="33" y="88" width="13" height="16" rx="6" fill="#232830" stroke="#3a4050" strokeWidth="1" />
          <g className="zaza-robot-foot-l">
            <rect x="30" y="100" width="18" height="7" rx="3.5" fill="#1e232d" stroke="#3a4050" strokeWidth="1" />
          </g>
        </g>

        <g className="zaza-robot-leg-r">
          <rect x="54" y="88" width="13" height="16" rx="6" fill="#232830" stroke="#3a4050" strokeWidth="1" />
          <g className="zaza-robot-foot-r">
            <rect x="52" y="100" width="18" height="7" rx="3.5" fill="#1e232d" stroke="#3a4050" strokeWidth="1" />
          </g>
        </g>

        <g className="zaza-robot-body-group">
          <g className="zaza-robot-arm-l">
            <rect x="14" y="48" width="10" height="22" rx="5" fill="#2a2f3a" stroke="#3a4050" strokeWidth="1" />
            <circle cx="19" cy="72" r="5" fill="#232830" stroke="#3a4050" strokeWidth="1" />
          </g>

          <g className="zaza-robot-arm-r">
            <rect x="76" y="48" width="10" height="22" rx="5" fill="#2a2f3a" stroke="#3a4050" strokeWidth="1" />
            <circle cx="81" cy="72" r="5" fill="#232830" stroke="#3a4050" strokeWidth="1" />
          </g>

          <rect x="26" y="46" width="48" height="44" rx="10" fill={`url(#${bodyGrad})`} stroke="#3a4050" strokeWidth="1.5" />

          <rect x="34" y="57" width="32" height="22" rx="6" fill="#1a1f2a" stroke="#2a3040" strokeWidth="1" />

          <circle className="zaza-belly-dot-1" cx="42" cy="68" r="2.5" fill="#ff4444" />
          <circle className="zaza-belly-dot-2" cx="50" cy="68" r="2.5" fill="#00ff88" />
          <circle className="zaza-belly-dot-3" cx="58" cy="68" r="2.5" fill="#00d4ff" />

          <line x1="34" y1="55" x2="66" y2="55" stroke="#2a3040" strokeWidth="0.8" />

          <rect x="43" y="38" width="14" height="10" rx="4" fill="#232830" stroke="#3a4050" strokeWidth="1" />

          <rect x="18" y="6" width="64" height="34" rx="12" fill={`url(#${bodyGrad})`} stroke={`url(#${rgbHead})`} strokeWidth="2.5" />

          <rect x="24" y="11" width="52" height="24" rx="8" fill={`url(#${screenGrad})`} stroke="#1a2030" strokeWidth="1" />

          <g className="zaza-robot-eye">
            <circle cx="37" cy="23" r="5" fill="#0a1020" />
            <circle cx="37" cy="23" r="3.5" fill="#e8f0ff" />
            <circle cx="38.2" cy="21.8" r="1.2" fill="#00d4ff" opacity="0.9" />
            <circle cx="35.8" cy="24.2" r="0.7" fill="white" opacity="0.5" />
          </g>

          <g className="zaza-robot-eye zaza-robot-eye-r">
            <circle cx="63" cy="23" r="5" fill="#0a1020" />
            <circle cx="63" cy="23" r="3.5" fill="#e8f0ff" />
            <circle cx="64.2" cy="21.8" r="1.2" fill="#00d4ff" opacity="0.9" />
            <circle cx="61.8" cy="24.2" r="0.7" fill="white" opacity="0.5" />
          </g>

          <line x1="50" y1="6" x2="50" y2="0" stroke="#3a4050" strokeWidth="2" strokeLinecap="round" />
          <circle className="zaza-robot-antenna-tip" cx="50" cy="0" r="3" fill="#00ff88" />

          <circle cx="18" cy="23" r="3.5" fill="#232830" stroke="#3a4050" strokeWidth="1" />
          <circle cx="82" cy="23" r="3.5" fill="#232830" stroke="#3a4050" strokeWidth="1" />

          <path
            d="M 42 31 Q 50 36 58 31"
            stroke="#00ff88"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
}
