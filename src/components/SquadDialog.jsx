export default function SquadDialog() {
  return (
    <div className="modal-overlay" id="squad-modal" onClick={event => { if (event.target === event.currentTarget) window.closeSquadModal(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={() => window.closeSquadModal()}>[X] ЗАКРЫТЬ ДОСЬЕ</button>
        <div className="modal-header">
          <div className="modal-eyebrow" id="sqm-eyebrow">ЛИЧНАЯ КАРТОТЕКА СУБЪЕКТА-884 · ОЦЕНКА СОРАТНИКА</div>
          <div className="modal-title" id="sqm-name">ОПЕРАТИВНИК</div>
          <div className="modal-warning" id="sqm-sub">ОРДЕН · СПЕЦИАЛИЗАЦИЯ</div>
        </div>
        <div className="sq-modal-grid">
          <div className="sq-modal-portrait" id="sqm-portrait"></div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
            <div className="stat-row">
              <div className="stat-lbl"><span></span><span className="stat-val" id="sqm-v1"></span></div>
              <div className="bar-bg"><div className="bar-fill gold-fill" id="sqm-b1" style={{ width: "0%" }}></div></div>
            </div>
            <div className="stat-row">
              <div className="stat-lbl"><span></span><span className="stat-val" id="sqm-v2"></span></div>
              <div className="bar-bg"><div className="bar-fill stealth-fill" id="sqm-b2" style={{ width: "0%" }}></div></div>
            </div>
            <div className="stat-row">
              <div className="stat-lbl"><span></span><span className="stat-val" id="sqm-v3"></span></div>
              <div className="bar-bg"><div className="bar-fill danger-fill" id="sqm-b3" style={{ width: "0%" }}></div></div>
            </div>
            <div className="doc-meta" style={{ margin: "6px 0 0", padding: "10px 14px" }}>
              &gt; СТАТУС СИНЕРГИИ: <span id="sqm-synergy">ПОД НАБЛЮДЕНИЕМ</span><br />
              &gt; ПРИОРИТЕТ ПРИКРЫТИЯ: <span id="sqm-priority">СТАНДАРТНЫЙ</span>
            </div>
          </div>
        </div>
        <div className="file-heading" style={{ marginTop: "10px" }}>
          <span className="file-tag">ОБЪЕКТИВНО</span>
          <span className="file-name">Боевая Характеристика</span>
        </div>
        <div className="lore-panel" style={{ padding: "20px 24px" }}>
          <p className="lore-p" id="sqm-dossier"></p>
        </div>
        <div className="censor-verdict-box" style={{ marginTop: "20px" }}>
          <div className="cv-head"></div>
          <div className="cv-text" id="sqm-verdict"></div>
        </div>
      </div>
    </div>
  );
}
