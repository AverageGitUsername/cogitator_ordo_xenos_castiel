import '../../css/sublimation.css';

export default function Sublimation() {
  return (
    <section id="tab-sublim" className="tab" style={{ position: "relative", overflow: "hidden" }}>
        <div id="sublim-loader" className="tab-preloader"></div>
        <div id="sublim-content" className="preload-content">
          <div className="pg-head">
            <div className="pg-eyebrow">ЛИЧНЫЙ ДАТ-ПАД · СУБЪЕКТ-884 · СТАТУС: ЗАШИФРОВАНО</div>
            <div className="pg-title">
              Сублимация
              <span className="status-badge" id="sublim-top-badge"> ПЕРГАМЕНТЫ СТВОЛА: 05 СВИТКОВ</span>
            </div>
          </div>

          <div className="warning-strip">
            <span className="w-mark">&#9888;</span> ВНИМАНИЕ: Обнаружены скрытые текстовые массивы. Субъект использует ритмичную текстовую сублимацию (поэзию) во время длительных засад для подавления пульса и контроля над Красной Жаждой. Тексты наносятся на пергамент и фиксируются на стволе болт-снайперской винтовки.
          </div>

          <div className="sublim-workspace">
            {/* ЛЕВАЯ КОЛОНКА: СПИСОК ИЗ 5 СВИТКОВ */}
            <div className="sublim-list">
              {[0, 1, 2, 3, 4].map(idx => (
                <div
                  key={idx}
                  className="log-entry"
                  id={`sub-${idx + 1}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => window.selectSublimSlot(idx)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      window.selectSublimSlot(idx);
                    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                      event.preventDefault();
                      const next = (idx + (event.key === 'ArrowDown' ? 1 : 4)) % 5;
                      document.getElementById(`sub-${next + 1}`)?.focus();
                    }
                  }}
                >
                  <div className="log-hd">
                    <div className="log-hd-top">
                      <span className="log-num"></span>
                      <span className="log-enc" id={`enc-sub-${idx + 1}`}></span>
                    </div>
                    <span className="log-title-text"></span>
                  </div>
                  <div className="log-body-wrap"><div className="log-body-overflow"><div className="log-body"><pre className="log-poem"></pre></div></div></div>
                </div>
              ))}
            </div>

            {/* ПРАВАЯ КОЛОНКА: ЦЕНТРАЛЬНОЕ ОКНО СВИТКА */}
            <div className="sublim-reader">
              <div className="sr-head">
                <div>
                  <div className="sr-eyebrow" id="sr-eyebrow">ПЕРГАМЕНТ СТВОЛА EXECUTOR · ЛОГ-01</div>
                  <div className="sr-title" id="sr-title">Контроль Пульса Перед Выстрелом</div>
                </div>
                <div className="sr-head-actions">
                  <span className="sr-rhythm-badge" id="sr-rhythm"> КАРДИО-РИТМ: 28 УД/МИН · ДЫХАНИЕ 4-7-8</span>
                  <button type="button" className="sr-encrypt-btn" id="sr-encrypt-btn" onClick={() => window.encryptActiveSublimSlot()}>[ ЗАШИФРОВАТЬ ]</button>
                </div>
              </div>

              <div className="sr-body-wrap">
              <div className="sr-body" role="region" aria-labelledby="sr-title" tabIndex={0}>
                <div className="sr-poem-view" id="sr-poem-view"></div>
              </div>
              </div>

              <div className="sr-footer">
                <div className="sr-wax-seal">
                  {/* Сюда автоматически копируется готовая SVG-печать из раздела Досье */}
                  <div className="sr-wax-svg-slot" id="sr-wax-svg-slot"></div>
                  <div className="sr-wax-meta">
                    <span className="sr-wax-title" id="sr-wax-title">СУРГУЧНОЕ КЛЕЙМО КАРАУЛА СМЕРТИ</span>
                    <span className="sr-wax-sub" id="sr-wax-sub">ЗАКРЕПЛЕНО НА КОЖУХЕ ГЛУШИТЕЛЯ · РАЗРЕШЕНО КАПЕЛЛАНОМ</span>
                  </div>
                </div>
                <div className="sr-nav-btns">
                  <button className="sr-step-btn" id="sr-prev-btn" onClick={() => window.stepSublimSlot(-1)}>[ ◄ ПРЕД. ]</button>
                  <button className="sr-step-btn" id="sr-next-btn" onClick={() => window.stepSublimSlot(1)}>[ СЛЕД. ► ]</button>
                </div>
              </div>
            </div>
          </div>
        </div>{/* /sublim-content */}
      </section>
  );
}
