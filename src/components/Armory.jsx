import { rangeMin, rangeMax, minDummies, maxDummies } from '../visorScenario.js';
import SchematicMarker from './SchematicMarker.jsx';
import auspexEliminator from '../assets/auspex-eliminator.webp';
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

                {/* ГИБРИДНЫЙ КОНТУР АУСПЕКСА: ДЕТАЛИЗИРОВАННЫЙ СИЛУЭТ МК X ФОБОС + ИНТЕРАКТИВНЫЕ УЗЛЫ */}
                <image
                  className="auspex-figure"
                  href={auspexEliminator}
                  x="30"
                  y="42"
                  width="362"
                  height="414"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                />

                {/* 5 ИНТЕРАКТИВНЫХ ТОЧЕК ТЕЛЕМЕТРИИ */}
                {[
                  { id: 'anode-0', x: 232, y: 72, tx: 192, ty: 92, label: '01. Аугментик', active: true },
                  { id: 'anode-1', x: 298, y: 142, tx: 256, ty: 146, label: '02. Наплечники' },
                  { id: 'anode-2', x: 354, y: 232, tx: 303, ty: 249, label: '03. Свитки Ствола' },
                  { id: 'anode-3', x: 56, y: 320, tx: 82, ty: 332, label: '04. Хамелеолин' },
                  { id: 'anode-4', x: 100, y: 74, tx: 136, ty: 92, label: '05. Радиаторы' },
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
                    <line
                      className="armor-node-leader"
                      x1={node.x}
                      y1={node.y}
                      x2={node.tx}
                      y2={node.ty}
                      aria-hidden="true"
                    />
                    <circle
                      className="armor-node-ping"
                      cx={node.tx}
                      cy={node.ty}
                      r="5.5"
                      aria-hidden="true"
                    />
                    <circle
                      className="armor-node-target"
                      cx={node.tx}
                      cy={node.ty}
                      r="2.6"
                      aria-hidden="true"
                    />
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
                <div className="visor-control-label"><span className="localized-copy" lang="ru">Цели</span><span className="localized-copy" lang="en">Targets</span></div>
                <div className="vc-row">
                  <button type="button" className="vc-btn" id="vdummy-minus" aria-label="Убрать цель" onClick={() => window.changeVisorDummies(-1)}>-</button>
                  <span className="vc-btn" id="vdummy-count" aria-live="polite" style={{ pointerEvents: 'none', minWidth: '3.2rem', textAlign: 'center' }}>3 / {maxDummies}</span>
                  <button type="button" className="vc-btn" id="vdummy-plus" aria-label="Добавить цель" onClick={() => window.changeVisorDummies(1)}>+</button>
                  <button type="button" className="vc-btn" id="vdummy-max" aria-label={`${maxDummies} целей`} onClick={() => window.setVisorDummies(maxDummies)}>×{maxDummies}</button>
                </div>
                <div className="visor-control-label"><span className="localized-copy" lang="ru">Сценарий целей</span><span className="localized-copy" lang="en">Target behavior</span></div>
                <div className="vc-row">
                  <button type="button" className="vc-btn" id="vcharge-0" data-visor-charge="0" aria-pressed="true" onClick={() => window.setVisorCharge(false)}>
                    <span className="localized-copy" lang="ru">Статика</span><span className="localized-copy" lang="en">Static</span>
                  </button>
                  <button type="button" className="vc-btn" id="vcharge-1" data-visor-charge="1" aria-pressed="false" onClick={() => window.setVisorCharge(true)}>
                    <span className="localized-copy" lang="ru">Штурм</span><span className="localized-copy" lang="en">Charge</span>
                  </button>
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
