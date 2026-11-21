import portrait from '../assets/castiel-portrait.webp';
import compactPortrait from '../assets/castiel-portrait-480.webp';
import AnatomyScan from './AnatomyScan.jsx';

export default function Biometrics() {
  return (
    <section id="tab-bio" className="tab active">
        <div className="pg-head">
          <div className="pg-title">
            Кастиил
            <span className="status-badge"> АКТИВЕН · КОМАНДИРОВКА ОРДЕНА</span>
          </div>
        </div>

        <div className="profile-grid">
          {/* 1. ЛЕВАЯ КОЛОНКА: ПОРТРЕТ И ФИЗИОЛОГИЯ */}
          <div className="left-col">
            <div className="avatar-box">
              <img
                className="char-img"
                src={portrait}
                srcSet={`${compactPortrait} 480w, ${portrait} 960w`}
                sizes="(max-width: 474px) calc(100vw - 24px), 450px"
                width={960}
                height={1216}
                alt="Кастиил — Сангвис Цензор"
                fetchPriority="high"
                draggable={false}
              />
            </div>
            <p id="profile-context" className="profile-context">ТЕРМИНАЛ ОРДО КСЕНОС · АПОТЕКАРИОН КАРАУЛА СМЕРТИ · СУБЪЕКТ-884</p>
            <div className="physio-panel">
              <div className="physio-header">
                <span className="physio-title">ФИЗИОЛОГИЧЕСКИЕ ПАРАМЕТРЫ</span>
                <span className="physio-ping"></span>
              </div>
              <div className="physio-rows">
                <div className="physio-row"><span className="ph-key"></span><span className="ph-val">2.65 М</span></div>
                <div className="physio-row"><span className="ph-key"></span><span className="ph-val">340 КГ</span></div>
                <div className="physio-row"><span className="ph-key"></span><span className="ph-val ph-gold">IX-SANGUIS</span></div>
                <div className="physio-row"><span className="ph-key"></span><span className="ph-val ph-pulse" id="bio-heart-rate">42 УД/МИН</span></div>
                <div className="physio-row"><span className="ph-key"></span><span className="ph-val ph-dim">ГИБЕРНАЦИЯ</span></div>
                <div className="physio-row"><span className="ph-key"></span><span className="ph-val ph-gold">99.8%</span></div>
                <div className="physio-row"><span className="ph-key"></span><span className="ph-val ph-dim">РЕЖИМ СНА</span></div>
              </div>
            </div>
          </div>

          {/* 2. ЦЕНТРАЛЬНАЯ КОЛОНКА: ПАСПОРТ + ЖИВОЙ ОСЦИЛЛОГРАФ И ШКАЛЫ ГЕНОСЕМЕНИ */}
          <div className="center-col">
            <div className="info-panel">
              <div className="profile-identity-grid">
                <div className="data-row">
                  <span className="data-label"></span>
                  <span className="data-value hi"></span>
                </div>
                <div className="data-row">
                  <span className="data-label"></span>
                  <span className="data-value hi"></span>
                </div>
              </div>
              <div className="profile-data-grid">
                <div className="data-row"><span className="data-label"></span><span className="data-value"></span></div>
                <div className="data-row"><span className="data-label"></span><span className="data-value"></span></div>
                <div className="data-row"><span className="data-label"></span><span className="data-value"></span></div>
                <div className="data-row"><span className="data-label"></span><span className="data-value"></span></div>
                <div className="data-row"><span className="data-label"></span><span className="data-value"></span></div>
                <div className="data-row"><span className="data-label"></span><span className="data-value hi"></span></div>
              </div>
              <div className="data-row">
                <span className="data-label"></span>
                <span className="data-value gold-line"></span>
              </div>
            </div>

            <div className="geneseed-block">
              <div className="gs-label">
                <span>НЕЙРО-КАРДИОГРАММА И ПОРОГИ ПРОКЛЯТИЯ · IX ЛЕГИОН</span>
                <span id="gs-status-note" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}></span>
              </div>

              {/* Живой осциллограф двух сердец + Кнопка стресс-теста */}
              <div className="ecg-monitor">
                <div className="ecg-top-bar">
                  <div className="ecg-readout">
                    <span>СЕРДЦЕ I: <strong id="ecg-bpm-readout" style={{ color: "var(--crimson-bright)" }}>42 УД/МИН</strong></span>
                    <span style={{ color: "var(--text-dim)" }}>|</span>
                    <span>СЕРДЦЕ II: <strong style={{ color: "var(--gold)" }}>КРИО-СОН (0 УД/МИН)</strong></span>
                  </div>
                  <button className="ecg-stress-btn" id="ecg-stress-btn" onClick={() => window.triggerBioStressTest()}>[ ТЕСТ: МАРКЕР КРОВИ ]</button>
                </div>
                <canvas id="bio-ecg-canvas" width="560" height="68"></canvas>
              </div>

              {/* 4 Понятные сегментированные шкалы с вердиктами */}
              <div className="gs-horiz-list">
                <div className="gs-h-item">
                  <div className="gs-h-head">
                    <span className="gs-h-name">Красная Жажда (Гемо-Резонанс)</span>
                    <div className="gs-h-meta">
                      <span className="gs-h-verdict v-danger">ХРОНИЧЕСКИЙ ФОН · ПОДАВЛЕН</span>
                      <span className="gs-h-pct">82%</span>
                    </div>
                  </div>
                  <div className="gs-h-bar-bg"><div className="gs-h-fill danger" style={{ width: "82%" }}></div></div>
                </div>

                <div className="gs-h-item">
                  <div className="gs-h-head">
                    <span className="gs-h-name">Чёрная Ярость (Психо-Мираж Баала)</span>
                    <div className="gs-h-meta">
                      <span className="gs-h-verdict v-ok">ПАТОЛОГИЯ ОТСУТСТВУЕТ</span>
                      <span className="gs-h-pct">4%</span>
                    </div>
                  </div>
                  <div className="gs-h-bar-bg"><div className="gs-h-fill dormant" style={{ width: "4%" }}></div></div>
                </div>

                <div className="gs-h-item">
                  <div className="gs-h-head">
                    <span className="gs-h-name">Кортикальный Тормоз (Контроль Пульса)</span>
                    <div className="gs-h-meta">
                      <span className="gs-h-verdict v-ok">МАНИАКАЛЬНАЯ КОНЦЕНТРАЦИЯ</span>
                      <span className="gs-h-pct">96%</span>
                    </div>
                  </div>
                  <div className="gs-h-bar-bg"><div className="gs-h-fill positive" style={{ width: "96%" }}></div></div>
                </div>

                <div className="gs-h-item">
                  <div className="gs-h-head">
                    <span className="gs-h-name">Риск Срыва при Контакте с Кровью</span>
                    <div className="gs-h-meta">
                      <span className="gs-h-verdict v-danger" id="gs-risk-badge">ВЫСОКИЙ В БЛИЖНЕМ БОЮ</span>
                      <span className="gs-h-pct" id="gs-risk-pct">65%</span>
                    </div>
                  </div>
                  <div className="gs-h-bar-bg"><div className="gs-h-fill danger" id="gs-risk-bar" style={{ width: "65%" }}></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ПРАВАЯ КОЛОНКА: ВАРИАНТ 1 (РЕНТГЕН ТОРСА И ЧЕРЕПА) + ВАРИАНТ 2 (СПИРАЛЬ ДНК) */}
          <div className="right-bio-col">
            {/* Верхнее окно: Анатомический Рентген Астартес */}
            <div className="bio-xray-panel">
              <div className="bx-header">
                <span>БИО-СКАНЕР АПОТЕКАРИОНА · ПРИМАРИС</span>
                <span style={{ color: "var(--crimson-bright)" }}>ИМПЛАНТАТЫ: 22/22</span>
              </div>

              <AnatomyScan />

              <div className="bx-btn-strip">
                <button className="bx-btn active" onClick={() => window.selectBioNode(0)}>01. Мозг</button>
                <button className="bx-btn" onClick={() => window.selectBioNode(1)}>02. Оптика</button>
                <button className="bx-btn" onClick={() => window.selectBioNode(2)}>03. Горнило</button>
                <button className="bx-btn" onClick={() => window.selectBioNode(3)}>04. Сердца</button>
                <button className="bx-btn" onClick={() => window.selectBioNode(4)}>05. Катушки</button>
              </div>

              <div className="bx-inspector">
                <div className="bxi-top">
                  <span className="bxi-title" id="bxi-title">Каталептический Узел и Оммофагия</span>
                  <span className="bxi-status" id="bxi-status"> ОММОФАГИЯ ЗАБЛОКИРОВАНА</span>
                </div>
                <div className="bxi-desc" id="bxi-desc"></div>
              </div>
            </div>

            {/* Нижнее окно: Вариант 2 — Гемо-Спираль IX Легиона · Матрица Коула */}
            <div className="bio-dna-panel">
              <div className="bx-header" style={{ marginBottom: "0" }}>
                <span>ГЕМО-СПИРАЛЬ · МАТРИЦА КОУЛА</span>
                <span style={{ color: "var(--gold-bright)" }}>ШТАММ: IX-SANGUIS</span>
              </div>

              <div className="dna-svg-wrap">
                <svg className="dna-svg" viewBox="0 0 420 92" xmlns="http://www.w3.org/2000/svg">
                  {/* Сетка секвенатора */}
                  <line
                    x1="0"
                    y1="46"
                    x2="420"
                    y2="46"
                    stroke="rgba(201,168,76,0.15)"
                    strokeWidth="0.8"
                    strokeDasharray="3 3" />
                  {/* Поперечные водородные связи (ступеньки ДНК) */}
                  <g stroke="#6b5010" strokeWidth="1.4" opacity="0.8">
                    <line x1="35" y1="24" x2="35" y2="68" /><line x1="55" y1="18" x2="55" y2="74" /><line x1="75" y1="26" x2="75" y2="66" />
                    <line x1="115" y1="26" x2="115" y2="66" /><line x1="135" y1="18" x2="135" y2="74" /><line x1="155" y1="24" x2="155" y2="68" />
                    <line x1="195" y1="24" x2="195" y2="68" /><line x1="215" y1="18" x2="215" y2="74" /><line x1="235" y1="26" x2="235" y2="66" />
                  </g>
                  {/* Багровые связи в зоне дефекта Красной Жажды */}
                  <g stroke="#e53935" strokeWidth="1.8">
                    <line x1="275" y1="24" x2="275" y2="68" /><line x1="295" y1="16" x2="295" y2="76" /><line x1="315" y1="24" x2="315" y2="68" />
                    <line x1="355" y1="26" x2="355" y2="66" /><line x1="375" y1="18" x2="375" y2="74" />
                  </g>

                  {/* Нить А (Золотая нить чистого шаблона Марса) */}
                  <path d="M 15 46 Q 55 4, 95 46 T 175 46 T 255 46 T 335 46 T 405 46" fill="none" stroke="#e5c365" strokeWidth="2.2" />
                  {/* Нить Б (Багровая нить наследия Сангвиния) */}
                  <path d="M 15 46 Q 55 88, 95 46 T 175 46 T 255 46 T 335 46 T 405 46" fill="none" stroke="#c0392b" strokeWidth="2.2" />

                  {/* Когнитивные тиски, сдерживающие кластер Красной Жажды */}
                  <rect
                    x="262"
                    y="10"
                    width="68"
                    height="72"
                    fill="rgba(192,57,43,0.14)"
                    stroke="#ff3b30"
                    strokeWidth="1.2"
                    strokeDasharray="4 2" />
                  <path d="M258 14 L258 6 L270 6 M334 6 L322 6 M258 78 L258 86 L270 86 M334 78 L334 86 L322 86" fill="none" stroke="#e5c365" strokeWidth="1.6" />
                  <text x="266" y="83" fill="#ff3b30" fontFamily="IBM Plex Mono" fontSize="7">DEFECT: RED THIRST</text>
                  <text x="20" y="14" fill="#c9a84c" fontFamily="IBM Plex Mono" fontSize="7">MARS STASIS · 99.8%</text>

                  {/* Бегущая каретка генного анализатора */}
                  <g className="dna-scan-bar">
                    <line
                      x1="40"
                      y1="0"
                      x2="40"
                      y2="92"
                      stroke="#e5c365"
                      strokeWidth="1.5"
                      opacity="0.7" />
                    <rect x="34" y="2" width="12" height="5" fill="#e5c365" />
                  </g>
                </svg>
              </div>

              <div className="dna-tabs">
                <button className="dna-tab active" onClick={event => window.selectDnaNode(0, event.currentTarget)}>[ 01. КОД САНГВИНИЯ ]</button>
                <button className="dna-tab" onClick={event => window.selectDnaNode(1, event.currentTarget)}>[ 02. ПЕЧАТЬ КОУЛА ]</button>
                <button className="dna-tab" onClick={event => window.selectDnaNode(2, event.currentTarget)}>[ 03. АЛЛЕЛЬ ЖАЖДЫ ]</button>
              </div>

              <div className="dna-desc" id="dna-desc"></div>
            </div>
          </div>
        </div>
      </section>
  );
}
