import PortraitFeed from './PortraitFeed.jsx';
import AnatomyScan from './AnatomyScan.jsx';
import DnaHelix from './DnaHelix.jsx';

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
            <PortraitFeed />
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

              <DnaHelix />

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
