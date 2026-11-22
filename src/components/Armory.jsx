import { rangeMin, rangeMax, minDummies, maxDummies } from '../visorScenario.js';
import SchematicMarker from './SchematicMarker.jsx';
import '../../css/visor.css';

export default function Armory() {
  return (
    <section id="tab-armory" className="tab">
        <div className="pg-head">
          <div className="pg-eyebrow">КАТАЛОГ СНАРЯЖЕНИЯ · СУБЪЕКТ-884 · ЭЛИМИНАТОР / X РОТА</div>
          <div className="pg-title">
            Арсенал и Телеметрия Доспеха
            <span className="status-badge"> ПРОТОКОЛ: БЕЗМОЛВНАЯ ЛИКВИДАЦИЯ</span>
          </div>
        </div>

        {/* TOP 3-COLUMN VISUAL COMPLEX: AUSPEX SCHEMATIC + NODE/AMMO CONSOLE + BALLISTIC VISOR */}
        <div className="armory-complex">

          {/* 1. ЛЕВАЯ КОЛОНКА: СХЕМА ФОБОСА С МИКРО-ТЕЛЕМЕТРИЕЙ */}
          <div className="auspex-panel">
            <div className="auspex-top-bar">
              <span>АУСПЕКС-СКАН · MK X PHOBOS</span>
              <span style={{ color: "var(--crimson-bright)" }}>СИГНАТУРА: 0.02%</span>
            </div>
            <div className="auspex-svg-wrap">
              <svg className="auspex-svg" viewBox="0 0 400 510" xmlns="http://www.w3.org/2000/svg">
                {/* Вращающиеся кольца радара Ауспекса */}
                <g className="radar-ring-rot" opacity="0.24">
                  <circle
                    cx="200"
                    cy="250"
                    r="175"
                    stroke="#c0392b"
                    strokeWidth="1"
                    strokeDasharray="12 6"
                    fill="none" />
                  <circle
                    cx="200"
                    cy="250"
                    r="135"
                    stroke="#c9a84c"
                    strokeWidth="0.7"
                    strokeDasharray="4 8"
                    fill="none" />
                </g>
                <g className="radar-ring-rot-rev" opacity="0.18">
                  <circle
                    cx="200"
                    cy="250"
                    r="155"
                    stroke="#c0392b"
                    strokeWidth="1"
                    strokeDasharray="28 14"
                    fill="none" />
                </g>
                {/* Прицельная сетка чертежа */}
                <line
                  x1="200"
                  y1="10"
                  x2="200"
                  y2="495"
                  stroke="#2e0a0a"
                  strokeWidth="0.8" />
                <line
                  x1="15"
                  y1="250"
                  x2="385"
                  y2="250"
                  stroke="#2e0a0a"
                  strokeWidth="0.8" />

                {/* МИКРО-ТЕЛЕМЕТРИЯ ПО КРАЯМ ЧЕРТЕЖА (В СТИЛЕ РЕНТГЕНА БИОМЕТРИИ) */}
                <g className="schematic-microdata" opacity="0.55" fontFamily="IBM Plex Mono, monospace" fontSize="6.5" fill="#9e352b">
                  <text x="10" y="24" fill="#c9a84c">PWR-CORE · MK-X</text>
                  <text x="10" y="34">OUTPUT: 98.4%</text>
                  <text x="10" y="43">HEAT: 28.1°C</text>
                  <text x="10" y="52">NOISE: -64 dB</text>
                  <rect x="10" y="58" width="42" height="3" fill="#2e0a0a" />
                  <rect x="10" y="58" width="38" height="3" fill="#c0392b" />

                  <text x="312" y="24" fill="#c9a84c">STEALTH-GRID</text>
                  <text x="312" y="34">REFRACT: 98.4%</text>
                  <text x="312" y="43">VOX-JAM: ON</text>
                  <text x="312" y="52">SEALS: 05/05</text>
                  <rect x="312" y="58" width="48" height="3" fill="#2e0a0a" />
                  <rect x="312" y="58" width="46" height="3" fill="#e5c365" />

                  <text x="10" y="468" fill="#c9a84c">SERVO-DAMPERS</text>
                  <text x="10" y="478">TREMOR: 0.00%</text>
                  <text x="10" y="487">RECOIL: LOCKED</text>

                  <text x="308" y="468" fill="#c9a84c">ORDO XENOS</text>
                  <text x="308" y="478">REF: 884-IX</text>
                  <text x="308" y="487" fill="#e53935">EXILE: ACTIVE</text>
                </g>

                {/* Контур хамелеолинового плаща */}
                <path d="M120 95 L72 195 L58 395 L125 440 L275 440 L342 395 L328 195 L280 95 Z" fill="rgba(22, 4, 4, 0.35)" stroke="#5a1515" strokeWidth="1" strokeDasharray="4 3" />

                {/* 1. РАНЕЦ МК X ФОБОС И АНТЕННЫ ОМНИ-ГЛУШИЛОК */}
                <g fill="#0c0202" stroke="#9e2a22" strokeWidth="1.4" strokeLinejoin="round">
                  <circle cx="122" cy="96" r="26" fill="#0e0202" stroke="#c0392b" />
                  <path d="M100 84 C112 76, 132 76, 142 88" fill="none" stroke="#6e1814" strokeWidth="1" />
                  <circle cx="278" cy="96" r="26" fill="#0e0202" stroke="#c0392b" />
                  <path d="M258 88 C268 76, 288 76, 300 84" fill="none" stroke="#6e1814" strokeWidth="1" />
                  <path d="M142 108 L142 66 L165 56 L235 56 L258 66 L258 108 Z" fill="#110303" />
                  <line
                    x1="158"
                    y1="58"
                    x2="158"
                    y2="102"
                    stroke="#5a1515"
                    strokeWidth="1" />
                  <line
                    x1="242"
                    y1="58"
                    x2="242"
                    y2="102"
                    stroke="#5a1515"
                    strokeWidth="1" />
                  <rect
                    x="163"
                    y="48"
                    width="8"
                    height="9"
                    fill="#180404"
                    stroke="#c9a84c"
                    strokeWidth="1" />
                  <line
                    x1="167"
                    y1="10"
                    x2="167"
                    y2="48"
                    stroke="#c9a84c"
                    strokeWidth="1.6" />
                  <rect
                    x="175"
                    y="38"
                    width="5"
                    height="18"
                    fill="#140303"
                    stroke="#c0392b"
                    strokeWidth="1" />
                  <line
                    x1="219"
                    y1="40"
                    x2="219"
                    y2="85"
                    stroke="#c9a84c"
                    strokeWidth="1.3" />
                </g>

                {/* 2. ШЛЕМ ФОБОС С РЕСПИРАТОРОМ И ГОРЖЕТ */}
                <g fill="#150303" stroke="#e53935" strokeWidth="1.4" strokeLinejoin="round">
                  <path d="M150 105 C150 132, 250 132, 250 105 L242 98 C242 120, 158 120, 158 98 Z" fill="#100202" stroke="#a02520" />
                  <path d="M170 86 C170 54, 230 54, 230 86 L228 108 L172 108 Z" />
                  <rect
                    x="188"
                    y="52"
                    width="24"
                    height="9"
                    rx="2"
                    fill="#1d0404"
                    stroke="#c9a84c"
                    strokeWidth="1.1" />
                  <line
                    x1="192"
                    y1="57"
                    x2="208"
                    y2="57"
                    stroke="#c0392b"
                    strokeWidth="1.5" />
                  <path d="M173 83 L197 89 L203 89 L227 83" fill="none" stroke="#c0392b" strokeWidth="1.2" />
                  <polygon points="177,85 194,90 179,92" fill="#ff3b30" stroke="none" />
                  <circle
                    cx="213"
                    cy="88"
                    r="5.5"
                    fill="#090101"
                    stroke="#c9a84c"
                    strokeWidth="1.5" />
                  <circle cx="213" cy="88" r="2.2" fill="#ff3b30" stroke="none" />
                  <circle
                    cx="176"
                    cy="102"
                    r="9.5"
                    fill="#0d0202"
                    stroke="#c0392b"
                    strokeWidth="1.3" />
                  <circle
                    cx="176"
                    cy="102"
                    r="5"
                    fill="none"
                    stroke="#7b0000"
                    strokeWidth="1" />
                  <circle
                    cx="224"
                    cy="102"
                    r="9.5"
                    fill="#0d0202"
                    stroke="#c0392b"
                    strokeWidth="1.3" />
                  <circle
                    cx="224"
                    cy="102"
                    r="5"
                    fill="none"
                    stroke="#7b0000"
                    strokeWidth="1" />
                  <path d="M191 91 L209 91 L212 112 L188 112 Z" fill="#1a0404" stroke="#e53935" strokeWidth="1.2" />
                  <line
                    x1="196"
                    y1="95"
                    x2="195"
                    y2="109"
                    stroke="#7b0000"
                    strokeWidth="1" />
                  <line
                    x1="200"
                    y1="95"
                    x2="200"
                    y2="109"
                    stroke="#7b0000"
                    strokeWidth="1" />
                  <line
                    x1="204"
                    y1="95"
                    x2="205"
                    y2="109"
                    stroke="#7b0000"
                    strokeWidth="1" />
                </g>

                {/* 3. АСИММЕТРИЧНЫЕ НАПЛЕЧНИКИ ФОБОС */}
                <g strokeLinejoin="round">
                  <path d="M148 106 C105 104, 82 132, 78 182 L115 182 L124 162 L135 162 L146 125 Z" fill="#140303" stroke="#c0392b" strokeWidth="1.6" />
                  <path d="M84 182 L86 196 L128 196 L132 182 Z" fill="#0e0202" stroke="#8b0000" strokeWidth="1.2" />
                  <path d="M250 100 C295 102, 318 132, 322 184 L276 184 L250 124 Z" fill="#160404" stroke="#c9a84c" strokeWidth="1.8" />
                  <path d="M256 107 C290 110, 310 135, 314 178" fill="none" stroke="#6b5010" strokeWidth="1.2" />
                </g>

                {/* 4. НАГРУДНИК, ПОДСУМКИ, ГРАНАТЫ И ЭМБЛЕМА ЧЕРЕПА */}
                <g strokeLinejoin="round">
                  <path d="M144 118 L254 118 L248 205 L199 222 L150 205 Z" fill="#120303" stroke="#a02520" strokeWidth="1.5" />
                  <g stroke="#c9a84c" strokeWidth="1.1" fill="#1a0604">
                    <line x1="180" y1="146" x2="214" y2="168" strokeWidth="1.6" />
                    <line x1="214" y1="146" x2="180" y2="168" strokeWidth="1.6" />
                    <circle cx="197" cy="153" r="8" fill="#180404" />
                    <rect x="193" y="159" width="8" height="5" fill="#180404" />
                    <circle cx="194" cy="153" r="1.8" fill="#c0392b" stroke="none" />
                    <circle cx="200" cy="153" r="1.8" fill="#c0392b" stroke="none" />
                  </g>
                  <rect
                    x="142"
                    y="136"
                    width="28"
                    height="26"
                    rx="2"
                    fill="#180404"
                    stroke="#c0392b"
                    strokeWidth="1.2" />
                  <path d="M142 145 L156 150 L170 145" fill="none" stroke="#c0392b" strokeWidth="1" />
                  <rect x="154" y="147" width="4" height="5" fill="#c9a84c" />
                  <rect
                    x="142"
                    y="168"
                    width="28"
                    height="24"
                    rx="2"
                    fill="#180404"
                    stroke="#c0392b"
                    strokeWidth="1.2" />
                  <path d="M142 176 L156 181 L170 176" fill="none" stroke="#c0392b" strokeWidth="1" />
                  <g transform="rotate(-14 232 148)">
                    <rect
                      x="214"
                      y="136"
                      width="36"
                      height="16"
                      rx="5"
                      fill="#1a0505"
                      stroke="#c9a84c"
                      strokeWidth="1.2" />
                    <line
                      x1="224"
                      y1="136"
                      x2="224"
                      y2="152"
                      stroke="#6b5010"
                      strokeWidth="1" />
                    <line
                      x1="234"
                      y1="136"
                      x2="234"
                      y2="152"
                      stroke="#6b5010"
                      strokeWidth="1" />
                    <line
                      x1="214"
                      y1="144"
                      x2="250"
                      y2="144"
                      stroke="#6b5010"
                      strokeWidth="1" />
                  </g>
                  <g transform="rotate(-14 236 168)">
                    <rect
                      x="218"
                      y="158"
                      width="36"
                      height="16"
                      rx="5"
                      fill="#1a0505"
                      stroke="#c9a84c"
                      strokeWidth="1.2" />
                    <line
                      x1="228"
                      y1="158"
                      x2="228"
                      y2="174"
                      stroke="#6b5010"
                      strokeWidth="1" />
                    <line
                      x1="238"
                      y1="158"
                      x2="238"
                      y2="174"
                      stroke="#6b5010"
                      strokeWidth="1" />
                  </g>
                </g>

                {/* 5. РУКИ, НАРУЧИ И БОЛТ-КАРАБИН / ВИНТОВКА ПОПЕРЁК ГРУДИ */}
                <g strokeLinejoin="round">
                  <path d="M84 196 C74 210, 78 232, 96 240 L106 204 Z" fill="#120303" stroke="#a02520" strokeWidth="1.3" />
                  <path d="M98 202 L166 214 L158 250 L94 236 Z" fill="#160404" stroke="#e53935" strokeWidth="1.5" />
                  <rect
                    x="128"
                    y="216"
                    width="14"
                    height="8"
                    transform="rotate(12 135 220)"
                    fill="#0d0202"
                    stroke="#c9a84c"
                    strokeWidth="1" />
                  <path d="M162 214 L184 218 L188 246 L158 248 Z" fill="#1a0505" stroke="#c0392b" strokeWidth="1.3" />
                  <rect
                    x="192"
                    y="226"
                    width="16"
                    height="7"
                    rx="2"
                    fill="#1f0606"
                    stroke="#e53935"
                    strokeWidth="1.1" />
                  <rect
                    x="190"
                    y="234"
                    width="17"
                    height="7"
                    rx="2"
                    fill="#1f0606"
                    stroke="#e53935"
                    strokeWidth="1.1" />
                  <rect
                    x="188"
                    y="242"
                    width="16"
                    height="7"
                    rx="2"
                    fill="#1f0606"
                    stroke="#e53935"
                    strokeWidth="1.1" />

                  <g transform="rotate(14 240 230)">
                    <path d="M175 194 L340 194 L340 240 L265 240 L260 250 L195 250 L175 235 Z" fill="#0d0202" stroke="#c9a84c" strokeWidth="1.6" />
                    <rect
                      x="242"
                      y="175"
                      width="66"
                      height="10"
                      rx="2"
                      fill="#160404"
                      stroke="#c9a84c"
                      strokeWidth="1.3" />
                    <rect
                      x="248"
                      y="185"
                      width="54"
                      height="9"
                      fill="#120303"
                      stroke="#c0392b"
                      strokeWidth="1.2" />
                    <line
                      x1="265"
                      y1="175"
                      x2="265"
                      y2="194"
                      stroke="#c9a84c"
                      strokeWidth="1.2" />
                    <line
                      x1="290"
                      y1="175"
                      x2="290"
                      y2="194"
                      stroke="#c9a84c"
                      strokeWidth="1.2" />
                    <rect
                      x="218"
                      y="248"
                      width="34"
                      height="36"
                      fill="#140303"
                      stroke="#c0392b"
                      strokeWidth="1.4" />
                    <line
                      x1="228"
                      y1="248"
                      x2="228"
                      y2="284"
                      stroke="#7b0000"
                      strokeWidth="1" />
                    <line
                      x1="240"
                      y1="248"
                      x2="240"
                      y2="284"
                      stroke="#7b0000"
                      strokeWidth="1" />
                    <line
                      x1="278"
                      y1="214"
                      x2="278"
                      y2="238"
                      stroke="#8b0000"
                      strokeWidth="1.5" />
                    <line
                      x1="288"
                      y1="214"
                      x2="288"
                      y2="238"
                      stroke="#8b0000"
                      strokeWidth="1.5" />
                    <line
                      x1="298"
                      y1="214"
                      x2="298"
                      y2="238"
                      stroke="#8b0000"
                      strokeWidth="1.5" />
                    <line
                      x1="308"
                      y1="214"
                      x2="308"
                      y2="238"
                      stroke="#8b0000"
                      strokeWidth="1.5" />
                    <line
                      x1="318"
                      y1="214"
                      x2="318"
                      y2="238"
                      stroke="#8b0000"
                      strokeWidth="1.5" />
                    <rect
                      x="340"
                      y="198"
                      width="14"
                      height="12"
                      fill="#180404"
                      stroke="#c0392b"
                      strokeWidth="1.2" />
                    <rect
                      x="340"
                      y="212"
                      width="24"
                      height="20"
                      fill="#0f0202"
                      stroke="#c9a84c"
                      strokeWidth="1.4" />
                    <circle
                      cx="352"
                      cy="222"
                      r="5"
                      fill="#050000"
                      stroke="#c0392b"
                      strokeWidth="1" />
                    <path d="M328 240 Q334 262 325 276" stroke="#c9a84c" strokeWidth="2" fill="none" />
                    <path d="M336 240 Q344 258 338 270" stroke="#c9a84c" strokeWidth="1.8" fill="none" />
                    <rect
                      x="292"
                      y="238"
                      width="8"
                      height="12"
                      rx="3"
                      fill="#1f0606"
                      stroke="#e53935"
                      strokeWidth="1.2" />
                    <rect
                      x="301"
                      y="238"
                      width="8"
                      height="13"
                      rx="3"
                      fill="#1f0606"
                      stroke="#e53935"
                      strokeWidth="1.2" />
                    <rect
                      x="310"
                      y="238"
                      width="8"
                      height="12"
                      rx="3"
                      fill="#1f0606"
                      stroke="#e53935"
                      strokeWidth="1.2" />
                    <rect
                      x="319"
                      y="238"
                      width="7"
                      height="10"
                      rx="3"
                      fill="#1f0606"
                      stroke="#e53935"
                      strokeWidth="1.2" />
                  </g>
                </g>

                {/* 6. ПОЯС, НАБЕДРЕННЫЕ ЩИТКИ, НАКОЛЕННИКИ И БОТИНКИ ФОБОС */}
                <g fill="#120303" stroke="#a02520" strokeWidth="1.4" strokeLinejoin="round">
                  <path d="M174 255 L226 255 L216 296 L184 296 Z" fill="#150404" stroke="#c0392b" />
                  <rect
                    x="116"
                    y="242"
                    width="22"
                    height="32"
                    rx="4"
                    transform="rotate(10 127 258)"
                    fill="#160404"
                    stroke="#c9a84c"
                    strokeWidth="1.1" />
                  <path d="M270 262 L292 260 L304 336 L282 340 Z" fill="#0e0202" stroke="#7b0000" strokeWidth="1.2" />
                  <path d="M126 272 L176 286 L166 360 L110 352 Z" />
                  <path d="M110 282 L128 286 L116 335 L102 330 Z" fill="#0d0202" stroke="#7b0000" />
                  <path d="M224 286 L274 272 L290 352 L234 360 Z" />
                  <line
                    x1="252"
                    y1="302"
                    x2="266"
                    y2="302"
                    stroke="#c9a84c"
                    strokeWidth="1.3" />
                  <line
                    x1="254"
                    y1="309"
                    x2="268"
                    y2="309"
                    stroke="#c9a84c"
                    strokeWidth="1.3" />
                  <line
                    x1="256"
                    y1="316"
                    x2="270"
                    y2="316"
                    stroke="#c9a84c"
                    strokeWidth="1.3" />
                  <path d="M230 338 L286 322 L288 332 L232 348 Z" fill="#1c0505" stroke="#c9a84c" strokeWidth="1.1" />
                  <ellipse
                    cx="132"
                    cy="366"
                    rx="26"
                    ry="27"
                    fill="#180404"
                    stroke="#e53935"
                    strokeWidth="1.5" />
                  <ellipse
                    cx="268"
                    cy="366"
                    rx="26"
                    ry="27"
                    fill="#180404"
                    stroke="#e53935"
                    strokeWidth="1.5" />
                  <path d="M105 384 L92 430 C112 442, 142 442, 160 430 L156 384 Z" fill="#130303" stroke="#c0392b" strokeWidth="1.5" />
                  <line
                    x1="128"
                    y1="392"
                    x2="124"
                    y2="436"
                    stroke="#6e1814"
                    strokeWidth="1" />
                  <path d="M244 384 L240 430 C258 442, 288 442, 308 430 L295 384 Z" fill="#130303" stroke="#c0392b" strokeWidth="1.5" />
                  <line
                    x1="272"
                    y1="392"
                    x2="276"
                    y2="436"
                    stroke="#6e1814"
                    strokeWidth="1" />
                  <path d="M100 433 L94 468 L152 468 L152 433 Z" fill="#0f0202" stroke="#8b0000" />
                  <path d="M248 433 L248 468 L306 468 L300 433 Z" fill="#0f0202" stroke="#8b0000" />
                  <circle cx="152" cy="468" r="8" fill="#180404" stroke="#c0392b" />
                  <circle cx="248" cy="468" r="8" fill="#180404" stroke="#c0392b" />
                  <path d="M90 465 L76 495 L74 503 L148 503 L150 482 L136 465 Z" fill="#160404" stroke="#e53935" strokeWidth="1.4" />
                  <path d="M84 484 C98 476, 124 476, 138 486" fill="none" stroke="#c9a84c" strokeWidth="1" />
                  <path d="M264 465 L250 482 L252 503 L326 503 L324 495 L310 465 Z" fill="#160404" stroke="#e53935" strokeWidth="1.4" />
                  <path d="M262 486 C276 476, 302 476, 316 484" fill="none" stroke="#c9a84c" strokeWidth="1" />
                </g>

                {/* 5 ИНТЕРАКТИВНЫХ ТОЧЕК ТЕЛЕМЕТРИИ */}
                {[
                  { id: 'anode-0', x: 213, y: 88, label: '01. Аугментик', active: true },
                  { id: 'anode-1', x: 110, y: 148, label: '02. Наплечники' },
                  { id: 'anode-2', x: 332, y: 252, label: '03. Свитки Ствола' },
                  { id: 'anode-3', x: 197, y: 155, label: '04. Хамелеолин' },
                  { id: 'anode-4', x: 278, y: 96, label: '05. Радиаторы' },
                ].map((node, index) => (
                  <g
                    key={node.id}
                    className={node.active ? 'armor-node active' : 'armor-node'}
                    id={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={node.label}
                    onClick={() => window.selectArmorNode(index)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        window.selectArmorNode(index);
                      }
                    }}
                  >
                    <SchematicMarker x={node.x} y={node.y} number={index + 1} />
                  </g>
                ))}
              </svg>
            </div>

            <div className="auspex-mini-stats">
              <div className="ams-cell"><span className="ams-k" id="ams-k1">РЕАКТОР:</span><span className="ams-v ok" id="ams-v1">БЕСШУМНЫЙ</span></div>
              <div className="ams-cell"><span className="ams-k" id="ams-k2">СЕРВО-ШУМ:</span><span className="ams-v" id="ams-v2">0.02 ДБ</span></div>
              <div className="ams-cell"><span className="ams-k" id="ams-k3">МИМИКРИЯ:</span><span className="ams-v" id="ams-v3">98.4%</span></div>
              <div className="ams-cell"><span className="ams-k" id="ams-k4">ОМНИ-РЭБ:</span><span className="ams-v ok" id="ams-v4">АКТИВЕН</span></div>
            </div>

            <div className="auspex-foot">НАЖМИТЕ НА ТОЧКУ ТЕЛЕМЕТРИИ ДЛЯ ДИАГНОСТИКИ УЗЛА</div>
          </div>

          {/* 2. ЦЕНТРАЛЬНАЯ КОЛОНКА: ИНСПЕКТОР УЗЛОВ + СПЕЦБОЕПРИПАСЫ */}
          <div className="tactical-console">
            <div className="node-inspector">
              <div className="ni-header">
                <div>
                  <div className="ni-code" id="ni-code">УЗЕЛ ТЕЛЕМЕТРИИ · 01-OPTIC</div>
                  <div className="ni-title" id="ni-title">Оптический Аугментик и Нейролинк</div>
                </div>
                <span className="ni-status" id="ni-status"> СИНХРОНИЗИРОВАН</span>
              </div>

              <p className="ni-desc" id="ni-desc"></p>

              {/* Полоса живых показателей узла (заполняет пустоту!) */}
              <div className="ni-telemetry-grid">
                <div className="nit-box">
                  <span className="nit-k" id="nit-k1">ЭНЕРГОПОТРЕБЛЕНИЕ</span>
                  <span className="nit-v" id="nit-v1">1.4 МВт · НОРМА</span>
                </div>
                <div className="nit-box">
                  <span className="nit-k" id="nit-k2">ДЕМАСКИРОВКА</span>
                  <span className="nit-v" id="nit-v2">0.00% (ПАССИВ)</span>
                </div>
                <div className="nit-box">
                  <span className="nit-k" id="nit-k3">НЕЙРО-ЗАДЕРЖКА</span>
                  <span className="nit-v" id="nit-v3">0.002 МС</span>
                </div>
                <div className="nit-box">
                  <span className="nit-k" id="nit-k4">ДУХ МАШИНЫ</span>
                  <span className="nit-v" id="nit-v4">БДИТЕЛЕН</span>
                </div>
              </div>

              <div className="ni-selector-strip">
                <button className="ni-btn active" onClick={() => window.selectArmorNode(0)}>01. Аугментик</button>
                <button className="ni-btn" onClick={() => window.selectArmorNode(1)}>02. Наплечники</button>
                <button className="ni-btn" onClick={() => window.selectArmorNode(2)}>03. Свитки Ствола</button>
                <button className="ni-btn" onClick={() => window.selectArmorNode(3)}>04. Хамелеолин</button>
                <button className="ni-btn" onClick={() => window.selectArmorNode(4)}>05. Радиаторы</button>
              </div>
            </div>

            {/* Special Issue Ammunition Selector */}
            <div className="ammo-box">
              <div className="ammo-head">
                <span className="ammo-title">СПЕЦБОЕПРИПАСЫ КАРАУЛА · EXECUTOR PATTERN</span>
                <div className="ammo-tabs">
                  <button className="ammo-tab active" onClick={event => window.selectAmmo(0, event.currentTarget)}>[ EXECUTIONER ]</button>
                  <button className="ammo-tab" onClick={event => window.selectAmmo(1, event.currentTarget)}>[ MORTIS ]</button>
                  <button className="ammo-tab" onClick={event => window.selectAmmo(2, event.currentTarget)}>[ INFERNUS ]</button>
                </div>
              </div>
              <div className="ammo-grid">
                <div className="ammo-desc" id="ammo-desc"></div>
                <div className="ammo-bars">
                  <div className="stat-row" style={{ marginBottom: "6px" }}>
                    <div className="stat-lbl"><span></span><span className="stat-val" id="am-v1"></span></div>
                    <div className="bar-bg"><div className="bar-fill gold-fill" id="am-b1" style={{ width: "98%" }}></div></div>
                  </div>
                  <div className="stat-row" style={{ marginBottom: "6px" }}>
                    <div className="stat-lbl"><span></span><span className="stat-val" id="am-v2"></span></div>
                    <div className="bar-bg"><div className="bar-fill gold-fill" id="am-b2" style={{ width: "82%" }}></div></div>
                  </div>
                  <div className="stat-row" style={{ marginBottom: "0" }}>
                    <div className="stat-lbl"><span></span><span className="stat-val" id="am-v3"></span></div>
                    <div className="bar-bg"><div className="bar-fill stealth-fill" id="am-b3" style={{ width: "90%" }}></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ПРАВАЯ КОЛОНКА: БАЛЛИСТИЧЕСКИЙ КОГИТАТОР ПРИЦЕЛА (ВИЗОР «ПАЛАЧ») */}
          <section className="visor-panel" id="visor-panel" aria-labelledby="visor-top-title">
            <header className="visor-top">
              <h2 id="visor-top-title">ВИЗОР «ПАЛАЧ» · ОККУЛОБ-ЛИНК</h2>
              <div className="visor-view-actions">
                <button type="button" id="visor-cast-view" className="vc-btn" aria-pressed="false" disabled>
                  <span className="localized-copy" lang="ru">Крупный план</span><span className="localized-copy" lang="en">Close-up</span>
                </button>
                <button type="button" id="visor-receiver-view" className="vc-btn" aria-pressed="false" disabled>
                  <span className="localized-copy" lang="ru">Мишень</span><span className="localized-copy" lang="en">Target view</span>
                </button>
                <button type="button" id="visor-expand" className="vc-btn" aria-pressed="false" onClick={() => window.toggleVisorFullscreen()}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M2 6V2h4m4 0h4v4m0 4v4h-4m-4 0H2v-4" />
                  </svg>
                  <span className="localized-copy" lang="ru">На весь экран</span><span className="localized-copy" lang="en">Fullscreen</span>
                </button>
              </div>
            </header>

            <div className="visor-scene">
              <div className="visor-viewport" id="visor-viewport" tabIndex={0} aria-labelledby="visor-top-title" aria-describedby="visor-controls-hint">
                <canvas id="visor-3d-canvas" className="visor-3d-canvas" aria-hidden="true" />
                <div className="visor-unavailable" role="status">
                  <span className="localized-copy" lang="ru">3D-сцена недоступна. Проверьте поддержку WebGL в браузере.</span>
                  <span className="localized-copy" lang="en">3D view unavailable. Check WebGL support in your browser.</span>
                </div>
                <div className="visor-hud-overlay">
                  <div className="vhud-tl"><span id="visor-svg-ammo">Executioner</span></div>
                  <div className="vhud-tr"><span id="visor-hud-tof" /></div>
                  <div className="vhud-bl" id="visor-controls-hint">
                    <span className="localized-copy" lang="ru">WASD — полёт · перетаскивание — обзор · колесо или щипок — зум</span>
                    <span className="localized-copy" lang="en">WASD to fly · drag to orbit · scroll or pinch to zoom</span>
                  </div>
                </div>
              </div>
              <ol className="visor-sequence" id="visor-sequence" data-step="ready">
                <li data-visor-step="setup">
                  <span className="localized-copy" lang="ru">Подготовка</span><span className="localized-copy" lang="en">Setup</span>
                </li>
                <li data-visor-step="flight">
                  <span className="localized-copy" lang="ru">Полёт</span><span className="localized-copy" lang="en">In flight</span>
                </li>
                <li data-visor-step="event">
                  <span className="localized-copy" lang="ru">Попадание</span><span className="localized-copy" lang="en">Impact</span>
                </li>
                <li data-visor-step="complete">
                  <span className="localized-copy" lang="ru">Завершено</span><span className="localized-copy" lang="en">Complete</span>
                </li>
              </ol>
            </div>

            <div className="visor-settings">
              <div className="visor-controls">
                <div className="visor-control-label"><span className="localized-copy" lang="ru">Режим огня</span><span className="localized-copy" lang="en">Fire mode</span></div>
                <div className="vc-row">
                  {[
                    ['Одиночный', 'Single'], ['Короткая очередь', 'Short burst'],
                  ].map(([ru, en], index) => (
                    <button type="button" key={en} className="vc-btn" data-visor-burst={index} aria-pressed={index === 0} onClick={() => window.setVisorBurst(index === 1)}>
                      <span className="localized-copy" lang="ru">{ru}</span><span className="localized-copy" lang="en">{en}</span>
                    </button>
                  ))}
                </div>
                <div className="visor-control-label"><span className="localized-copy" lang="ru">Наведение</span><span className="localized-copy" lang="en">Aiming</span></div>
                <div className="vc-row">
                  <button type="button" className="vc-btn" id="vspread-0" data-visor-spread="0" aria-pressed="true" onClick={() => window.setVisorSpread(false)}>
                    <span className="localized-copy" lang="ru">Прицельно</span><span className="localized-copy" lang="en">Aimed</span>
                  </button>
                  <button type="button" className="vc-btn" id="vspread-1" data-visor-spread="1" aria-pressed="false" onClick={() => window.setVisorSpread(true)}>
                    <span className="localized-copy" lang="ru">Вразброс</span><span className="localized-copy" lang="en">Scatter</span>
                  </button>
                </div>
                <div className="visor-control-label"><span className="localized-copy" lang="ru">Манекены</span><span className="localized-copy" lang="en">Mannequins</span></div>
                <div className="vc-row">
                  <button type="button" className="vc-btn" id="vdummy-minus" aria-label="Убрать манекен" onClick={() => window.changeVisorDummies(-1)}>-</button>
                  <span className="vc-btn" id="vdummy-count" aria-live="polite" style={{ pointerEvents: 'none', minWidth: '3.2rem', textAlign: 'center' }}>3 / {maxDummies}</span>
                  <button type="button" className="vc-btn" id="vdummy-plus" aria-label="Добавить манекен" onClick={() => window.changeVisorDummies(1)}>+</button>
                </div>
                <div className="visor-control-label"><span className="localized-copy" lang="ru">Режим визора</span><span className="localized-copy" lang="en">Visor mode</span></div>
                <div className="vc-row">
                  <button className="vc-btn active" id="vmode-0" aria-pressed="true" onClick={() => window.setVisorMode(0)}>[ ТЕПЛОВИЗОР ]</button>
                  <button className="vc-btn" id="vmode-1" aria-pressed="false" onClick={() => window.setVisorMode(1)}>[ АУСПЕКС ]</button>
                  <button className="vc-btn" id="vmode-2" aria-pressed="false" onClick={() => window.setVisorMode(2)}>[ НОЧНОЙ ИК ]</button>
                </div>
                <div className="visor-control-label"><span className="localized-copy" lang="ru">Профиль импульса</span><span className="localized-copy" lang="en">Pulse profile</span></div>
                <div className="vc-row">
                  {['Executioner', 'Mortis', 'Infernus'].map((name, index) => (
                    <button key={name} className="vc-btn" data-visor-ammo={index} aria-pressed={index === 0} onClick={() => window.selectAmmo(index)}>{name}</button>
                  ))}
                </div>
              </div>
              <div className="visor-sim-bar">
                <div className="visor-dist-wrap">
                  <div className="visor-dist-head">
                    <label id="visor-dist-lbl" htmlFor="visor-dist-slider">ДИСТАНЦИЯ</label>
                    <span><span id="visor-dist-val">1 840</span>{' '}
                      <span className="localized-copy" lang="ru">ед.</span><span className="localized-copy" lang="en">u</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    id="visor-dist-slider"
                    className="visor-range"
                    min={rangeMin}
                    max={rangeMax}
                    step="10"
                    defaultValue="1840"
                    onInput={event => window.onVisorDistChange(event.currentTarget.value)} />
                </div>
                <button type="button" className="vc-btn vc-fire-btn" id="visor-fire-btn" onClick={() => window.simulateVisorShot()}>
                  <span className="localized-copy" lang="ru">Запустить демонстрацию</span><span className="localized-copy" lang="en">Run demonstration</span>
                </button>
              </div>

              <output id="visor-shot-status" className="visor-shot-status" aria-live="polite" />
            </div>
          </section>

        </div>

        {/* DIVIDER WITH EXPAND/COLLAPSE ALL BUTTON */}
        <div className="armory-divider-bar">
          <div className="divider" id="armory-reg-divider">Штатный Реестр Вооружения (Нажмите на карточку для развёртки)</div>
          <button className="armory-toggle-all-btn" id="armory-toggle-all-btn" onClick={() => window.toggleAllWeapons()}>[ СВЕРНУТЬ ВЕСЬ РЕЕСТР ]</button>
        </div>

        {/* BOTTOM 6 DETAILED CARDS (3x2 BALANCED GRID) */}
        <div className="armory-grid">
          {/* CARD 1: Bolt Sniper Rifle (relic) — ref: Rifle.png (no hand, no sling) */}
          <div className="weapon-card relic open">
            <button type="button" className="w-head" aria-expanded={true} aria-controls="weapon-details-1" onClick={event => window.toggleWeapon(event.currentTarget.closest('.weapon-card'))}>
              <span className="w-icon-box">
                <svg className="w-icon-svg" viewBox="0 0 64 64" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {/* Buttstock & recoil pad */}
                  <path d="M4 27 L6 27 L6 40 L4 40 Z" />
                  <path d="M6 28 L12 25 L12 37 L6 37" />
                  {/* Pistol grip */}
                  <path d="M12 36 L10 47 L15 47 L17 36" />
                  {/* Main receiver & handguard */}
                  <path d="M12 25 L37 25 L39 27 L39 34 L36 35 L25 35 L25 37 L12 37 Z" />
                  {/* Magazine */}
                  <path d="M18 37 L18 43 L24 43 L24 37" />
                  {/* Carry handle / Picatinny rail */}
                  <path d="M19 25 L22 22 L34 22 L37 25" />
                  <line x1="23" y1="24" x2="33" y2="24" strokeWidth="1.2" />
                  {/* Sniper scope & mounts */}
                  <path d="M10 17 L16 18 L24 16 L32 15 L30 20 L23 20 L16 20 L10 21 Z" />
                  <line x1="17" y1="20" x2="17" y2="25" />
                  <line x1="28" y1="20" x2="28" y2="22" />
                  {/* Suppressor barrel & front sight */}
                  <rect x="39" y="28.5" width="5" height="4" />
                  <path d="M44 27.5 L60 27.5 L60 33.5 L44 33.5 Z" />
                  <path d="M46 27.5 L47.5 24.5 L49 27.5" />
                  <circle cx="57.5" cy="30.5" r="1" />
                </svg>
              </span>
              <span className="w-meta">
                <span className="w-cat"></span>
                <span className="w-name"></span>
                <span className="w-sub"></span>
              </span>
              <span className="w-chevron" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg></span>
            </button>
            <div className="w-quick-specs">
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
            </div>
            <div className="w-body" id="weapon-details-1">
              <div className="w-body-overflow">
                <div className="w-body-inner">
                  <div>
                    <div className="w-hr"></div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill gold-fill" data-w="95" style={{ width: "95%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill gold-fill" data-w="80" style={{ width: "80%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill gold-fill" data-w="15" style={{ width: "15%" }}></div></div>
                    </div>
                    <div className="w-note"></div>
                  </div>
                  <div className="w-forge-stamp">
                    <span className="wfs-left"></span>
                    <span className="wfs-seal"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Plasma Pistol Mk III — ref: PlasmaPistol.png */}
          <div className="weapon-card open">
            <button type="button" className="w-head" aria-expanded={true} aria-controls="weapon-details-2" onClick={event => window.toggleWeapon(event.currentTarget.closest('.weapon-card'))}>
              <span className="w-icon-box">
                <svg className="w-icon-svg" viewBox="0 0 64 64" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {/* Rear housing & top carry bar */}
                  <path d="M9 22 L13 19 L30 19 L32 22" />
                  <path d="M9 22 L9 36 L14 38 L42 38 L44 41 L54 41 L56 38 L56 23 L43 23 L41 25 L26 25 L23 21 L9 22 Z" />
                  {/* Ergonomic grip & trigger */}
                  <path d="M14 38 L10 51 L19 52 L23 38" />
                  <path d="M23 38 L24 43 L29 43 L29 38" strokeWidth="1.3" />
                  {/* Ribbed plasma cooling coils on top */}
                  <rect x="26" y="18.5" width="14" height="6.5" rx="1.5" />
                  <line x1="28.5" y1="18.5" x2="28.5" y2="25" />
                  <line x1="31" y1="18.5" x2="31" y2="25" />
                  <line x1="33.5" y1="18.5" x2="33.5" y2="25" />
                  <line x1="36" y1="18.5" x2="36" y2="25" />
                  <line x1="38.5" y1="18.5" x2="38.5" y2="25" />
                  {/* Slotted muzzle shroud & front sight */}
                  <path d="M48 23 L50 18.5 L53 23" />
                  <line x1="45" y1="27" x2="52" y2="27" strokeWidth="1.3" />
                  <line x1="45" y1="30.5" x2="52" y2="30.5" strokeWidth="1.3" />
                  <line x1="45" y1="34" x2="52" y2="34" strokeWidth="1.3" />
                  <rect x="56" y="26.5" width="3" height="8" />
                </svg>
              </span>
              <span className="w-meta">
                <span className="w-cat"></span>
                <span className="w-name"></span>
                <span className="w-sub"></span>
              </span>
              <span className="w-chevron" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg></span>
            </button>
            <div className="w-quick-specs">
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
            </div>
            <div className="w-body" id="weapon-details-2">
              <div className="w-body-overflow">
                <div className="w-body-inner">
                  <div>
                    <div className="w-hr"></div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill danger-fill" data-w="100" style={{ width: "100%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill" data-w="30" style={{ width: "30%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill danger-fill" data-w="85" style={{ width: "85%" }}></div></div>
                    </div>
                    <div className="w-note"></div>
                  </div>
                  <div className="w-forge-stamp">
                    <span className="wfs-left"></span>
                    <span className="wfs-seal"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Astartes Combat Knife — ref: Knife.jpg */}
          <div className="weapon-card open">
            <button type="button" className="w-head" aria-expanded={true} aria-controls="weapon-details-3" onClick={event => window.toggleWeapon(event.currentTarget.closest('.weapon-card'))}>
              <span className="w-icon-box">
                <svg className="w-icon-svg" viewBox="0 0 64 64" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {/* Massive pommel */}
                  <path d="M8 49 L14 55 L18 51 L12 45 Z" />
                  <line x1="9" y1="53" x2="12" y2="56" />
                  {/* Grip */}
                  <path d="M13 46 L21 38 L25 42 L17 50 Z" />
                  {/* Winged crossguard */}
                  <path d="M18 33 L29 44 L27 46 L23 42 L20 39 L16 35 Z" />
                  {/* Broad blade with serrated spine & tip */}
                  <path d="M22 36 L25 33 L27 35 L29 33 L27 31 L30 28 L32 30 L34 28 L32 26 L35 23 L37 25 L39 23 L37 21 L40 18 L42 20 L44 18 L42 16 L46 12 L56 8 L51 19 L28 42 Z" />
                  {/* Fuller groove */}
                  <line x1="27" y1="36" x2="46" y2="17" strokeWidth="1.2" />
                </svg>
              </span>
              <span className="w-meta">
                <span className="w-cat"></span>
                <span className="w-name"></span>
                <span className="w-sub"></span>
              </span>
              <span className="w-chevron" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg></span>
            </button>
            <div className="w-quick-specs">
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
            </div>
            <div className="w-body" id="weapon-details-3">
              <div className="w-body-overflow">
                <div className="w-body-inner">
                  <div>
                    <div className="w-hr"></div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill gold-fill" data-w="96" style={{ width: "96%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill danger-fill" data-w="100" style={{ width: "100%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill stealth-fill" data-w="100" style={{ width: "100%" }}></div></div>
                    </div>
                    <div className="w-note"></div>
                  </div>
                  <div className="w-forge-stamp">
                    <span className="wfs-left"></span>
                    <span className="wfs-seal"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: Phobos Armor Mk X Helmet — ref: Phobos.png */}
          <div className="weapon-card open">
            <button type="button" className="w-head" aria-expanded={true} aria-controls="weapon-details-4" onClick={event => window.toggleWeapon(event.currentTarget.closest('.weapon-card'))}>
              <span className="w-icon-box">
                <svg className="w-icon-svg" viewBox="0 0 64 64" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {/* Top intake vent ridge */}
                  <path d="M24 10 L26 6 L38 6 L40 10" />
                  {/* Rounded helmet dome & brow */}
                  <path d="M13 33 C12 18 20 10 32 10 C44 10 52 18 51 33" />
                  <path d="M14 28 L29 30 L32 29 L35 30 L50 28" />
                  {/* Forehead rivets */}
                  <circle cx="22" cy="23" r="0.8" /><circle cx="32" cy="24" r="0.8" /><circle cx="42" cy="23" r="0.8" />
                  {/* Narrow angry eye lenses */}
                  <path d="M17 29 L29 31 L26 34 L18 33 Z" />
                  <path d="M47 29 L35 31 L38 34 L46 33 Z" />
                  {/* Skull faceplate & chin */}
                  <path d="M18 35 L18 41 M46 35 L46 41" />
                  <path d="M22 49 C25 55 39 55 42 49" />
                  {/* Nasal cavity */}
                  <path d="M32 34 L29 40 L35 40 Z" />
                  {/* Skull teeth grille */}
                  <line x1="25" y1="45" x2="39" y2="45" />
                  <line x1="27" y1="42" x2="27" y2="48" strokeWidth="1.2" />
                  <line x1="30.5" y1="42" x2="30.5" y2="48" strokeWidth="1.2" />
                  <line x1="33.5" y1="42" x2="33.5" y2="48" strokeWidth="1.2" />
                  <line x1="37" y1="42" x2="37" y2="48" strokeWidth="1.2" />
                  {/* Cylindrical side respirator filters */}
                  <ellipse cx="16" cy="43" rx="4.5" ry="6" />
                  <path d="M12 37 L9 39 L9 46 L14 49" />
                  <ellipse cx="48" cy="43" rx="4.5" ry="6" />
                  <path d="M52 37 L55 39 L55 46 L50 49" />
                </svg>
              </span>
              <span className="w-meta">
                <span className="w-cat"></span>
                <span className="w-name"></span>
                <span className="w-sub"></span>
              </span>
              <span className="w-chevron" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg></span>
            </button>
            <div className="w-quick-specs">
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
            </div>
            <div className="w-body" id="weapon-details-4">
              <div className="w-body-overflow">
                <div className="w-body-inner">
                  <div>
                    <div className="w-hr"></div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill stealth-fill" data-w="10" style={{ width: "10%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill stealth-fill" data-w="5" style={{ width: "5%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill" data-w="90" style={{ width: "90%" }}></div></div>
                    </div>
                    <div className="w-note"></div>
                  </div>
                  <div className="w-forge-stamp">
                    <span className="wfs-left"></span>
                    <span className="wfs-seal"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: Cameleoline Cloak */}
          <div className="weapon-card open">
            <button type="button" className="w-head" aria-expanded={true} aria-controls="weapon-details-5" onClick={event => window.toggleWeapon(event.currentTarget.closest('.weapon-card'))}>
              <span className="w-icon-box">
                <svg className="w-icon-svg" viewBox="0 0 64 64" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {/* Hood */}
                  <path d="M23 22 C23 11 32 7 32 7 C32 7 41 11 41 22" />
                  <path d="M26 22 C27 15 32 13 32 13 C32 13 37 15 38 22" />
                  {/* Draped shoulders & jagged camo hem */}
                  <path d="M23 22 L11 29 L14 54 L22 50 L28 56 L32 51 L36 56 L42 50 L50 54 L53 29 L41 22" />
                  {/* Clasp & fabric folds */}
                  <path d="M24 24 L32 27 L40 24" />
                  <path d="M23 30 Q20 40 19 49" strokeWidth="1.2" />
                  <path d="M41 30 Q44 40 45 49" strokeWidth="1.2" />
                  <line
                    x1="32"
                    y1="27"
                    x2="32"
                    y2="51"
                    strokeDasharray="3 2"
                    strokeWidth="1.2" />
                </svg>
              </span>
              <span className="w-meta">
                <span className="w-cat"></span>
                <span className="w-name"></span>
                <span className="w-sub"></span>
              </span>
              <span className="w-chevron" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg></span>
            </button>
            <div className="w-quick-specs">
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
            </div>
            <div className="w-body" id="weapon-details-5">
              <div className="w-body-overflow">
                <div className="w-body-inner">
                  <div>
                    <div className="w-hr"></div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill stealth-fill" data-w="98" style={{ width: "98%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill stealth-fill" data-w="98" style={{ width: "98%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="w-stat-val stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill gold-fill" data-w="92" style={{ width: "92%" }}></div></div>
                    </div>
                    <div className="w-note"></div>
                  </div>
                  <div className="w-forge-stamp">
                    <span className="wfs-left"></span>
                    <span className="wfs-seal"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 6: Auspex & Omni-Scramblers */}
          <div className="weapon-card open">
            <button type="button" className="w-head" aria-expanded={true} aria-controls="weapon-details-6" onClick={event => window.toggleWeapon(event.currentTarget.closest('.weapon-card'))}>
              <span className="w-icon-box">
                <svg className="w-icon-svg" viewBox="0 0 64 64" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {/* Whip antenna & signal arcs */}
                  <line x1="20" y1="20" x2="20" y2="6" />
                  <circle cx="20" cy="6" r="1.2" />
                  <path d="M24 10 A6 6 0 0 1 24 16" strokeWidth="1.2" />
                  <path d="M27 7 A10 10 0 0 1 27 19" strokeWidth="1.2" />
                  {/* Handheld scanner body */}
                  <path d="M17 20 L45 20 L48 23 L48 47 L44 54 L20 54 L16 47 L16 23 Z" />
                  {/* Circular radar screen */}
                  <circle cx="32" cy="34" r="10.5" />
                  <circle cx="32" cy="34" r="5" strokeDasharray="2 2" strokeWidth="1.1" />
                  <line x1="22" y1="34" x2="42" y2="34" strokeWidth="0.9" />
                  <line x1="32" y1="24" x2="32" y2="44" strokeWidth="0.9" />
                  <line x1="32" y1="34" x2="39" y2="28" strokeWidth="1.4" />
                  <circle cx="37" cy="30" r="1.2" />
                  {/* Control buttons */}
                  <rect x="22" y="48" width="5" height="2.5" />
                  <rect x="30" y="48" width="5" height="2.5" />
                  <circle cx="40" cy="49.2" r="1.3" />
                </svg>
              </span>
              <span className="w-meta">
                <span className="w-cat"></span>
                <span className="w-name"></span>
                <span className="w-sub"></span>
              </span>
              <span className="w-chevron" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg></span>
            </button>
            <div className="w-quick-specs">
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
              <div className="wqs-pill"><span className="wqs-k"></span><span className="wqs-v"></span></div>
            </div>
            <div className="w-body" id="weapon-details-6">
              <div className="w-body-overflow">
                <div className="w-body-inner">
                  <div>
                    <div className="w-hr"></div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill" data-w="88" style={{ width: "88%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill stealth-fill" data-w="100" style={{ width: "100%" }}></div></div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-lbl"><span></span><span className="stat-val"></span></div>
                      <div className="bar-bg"><div className="bar-fill gold-fill" data-w="95" style={{ width: "95%" }}></div></div>
                    </div>
                    <div className="w-note"></div>
                  </div>
                  <div className="w-forge-stamp">
                    <span className="wfs-left"></span>
                    <span className="wfs-seal"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* АВТОНОМНЫЙ МОДУЛЬ ТЕЛЕМЕТРИИ И БАЛЛИСТИЧЕСКОГО ВИЗОРА АРСЕНАЛА */}
      </section>
  );
}
