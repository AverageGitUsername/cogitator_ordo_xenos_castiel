export default function MissionLogs() {
  return (
    <section id="tab-logs" className="tab">

        <div className="pg-head">
          <div className="pg-eyebrow">ОПЕРАТИВНЫЙ АРХИВ · АВАНГАРДНАЯ РАЗВЕДКА И ОГНЕВАЯ ПОДДЕРЖКА ЗВЕНА</div>
          <div className="pg-title">
            Личные Логи Операций
            <span className="status-badge"> РОЛЬ: МАРКСМАН / АВАНГАРД</span>
          </div>
        </div>

        {/* Top Telemetry Summary (Подстроено под динамику игры) */}
        <div className="telemetry-summary">
          <div className="ts-card">
            <div className="ts-lbl"></div>
            <div className="ts-val" id="ts-sorties-count"></div>
          </div>
          <div className="ts-card">
            <div className="ts-lbl"></div>
            <div className="ts-val"></div>
          </div>
          <div className="ts-card">
            <div className="ts-lbl"></div>
            <div className="ts-val"></div>
          </div>
          <div className="ts-card">
            <div className="ts-lbl"></div>
            <div className="ts-val crimson">00</div>
          </div>
        </div>

        <div className="warning-strip">
          <span className="w-mark"> </span> ЖУРНАЛ БОЕВЫХ ВЫХОДОВ: Фиксация реальных операций Истребительной Группы. Работа в передовом дозоре (разведка ауспексом, вскрытие засад), мобильное огневое прикрытие штурмовых братьев на средних и дальних дистанциях, ликвидация узловых целей и надзор за дисциплиной строя.
        </div>

        {/* МИССИЯ 01: Удар на Каэлис-9 */}
        <div className="mission-entry open" id="mission-1">
          <button type="button" className="mission-hd" aria-expanded={true} aria-controls="mission-1-details" onClick={() => window.toggleMission('mission-1')}>
            <span className="m-code"></span>
            <span className="m-title"></span>
            <span className="m-dist"></span>
            <span className="m-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-1-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                </div>
                <p className="lore-p"></p>
                <p className="lore-p"></p>
                <p className="lore-p"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head"></div>
                  <div className="cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 02: Пограничный стык и комплекс «Энигма» */}
        <div className="mission-entry" id="mission-2">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-2-details" onClick={() => window.toggleMission('mission-2')}>
            <span className="m-code"></span>
            <span className="m-title"></span>
            <span className="m-dist"></span>
            <span className="m-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-2-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                  <div className="st-item"><span className="st-k"></span><span className="st-v"></span></div>
                </div>
                <p className="lore-p"></p>
                <p className="lore-p"></p>
                <p className="lore-p"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head"></div>
                  <div className="cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 03: Пепельный Рубеж и Эвакуация с Каэлис-9 */}
        <div className="mission-entry" id="mission-3">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-3-details" onClick={() => window.toggleMission('mission-3')}>
            <span className="m-code" id="m3-code"></span>
            <span className="m-title" id="m3-title"></span>
            <span className="m-dist" id="m3-dist"></span>
            <span className="m-status" id="m3-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-3-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m3-tk1"></span><span className="st-v" id="m3-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m3-tk2"></span><span className="st-v" id="m3-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m3-tk3"></span><span className="st-v" id="m3-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m3-tk4"></span><span className="st-v" id="m3-tv4"></span></div>
                </div>
                <p className="lore-p" id="m3-p1"></p>
                <p className="lore-p" id="m3-p2"></p>
                <p className="lore-p" id="m3-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m3-cv-head"></div>
                  <div className="cv-text" id="m3-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 04: Пепельные Пределы и Дознаватель Кавендиш */}
        <div className="mission-entry" id="mission-4">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-4-details" onClick={() => window.toggleMission('mission-4')}>
            <span className="m-code" id="m4-code"></span>
            <span className="m-title" id="m4-title"></span>
            <span className="m-dist" id="m4-dist"></span>
            <span className="m-status" id="m4-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-4-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m4-tk1"></span><span className="st-v" id="m4-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m4-tk2"></span><span className="st-v" id="m4-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m4-tk3"></span><span className="st-v" id="m4-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m4-tk4"></span><span className="st-v" id="m4-tv4"></span></div>
                </div>
                <p className="lore-p" id="m4-p1"></p>
                <p className="lore-p" id="m4-p2"></p>
                <p className="lore-p" id="m4-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m4-cv-head"></div>
                  <div className="cv-text" id="m4-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 05: Охота за Архидьяконом и Повелители Ночи (БЕЗ КАСТИИЛА) */}
        <div className="mission-entry" id="mission-5">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-5-details" onClick={() => window.toggleMission('mission-5')}>
            <span className="m-code" id="m5-code"></span>
            <span className="m-title" id="m5-title"></span>
            <span className="m-dist" id="m5-dist"></span>
            <span className="m-status" id="m5-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-5-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m5-tk1"></span><span className="st-v" id="m5-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m5-tk2"></span><span className="st-v" id="m5-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m5-tk3"></span><span className="st-v" id="m5-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m5-tk4"></span><span className="st-v" id="m5-tv4"></span></div>
                </div>
                <p className="lore-p" id="m5-p1"></p>
                <p className="lore-p" id="m5-p2"></p>
                <p className="lore-p" id="m5-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m5-cv-head"></div>
                  <div className="cv-text" id="m5-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 06: Столица Голгота и Хранилище */}
        <div className="mission-entry" id="mission-6">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-6-details" onClick={() => window.toggleMission('mission-6')}>
            <span className="m-code" id="m6-code"></span>
            <span className="m-title" id="m6-title"></span>
            <span className="m-dist" id="m6-dist"></span>
            <span className="m-status" id="m6-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-6-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m6-tk1"></span><span className="st-v" id="m6-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m6-tk2"></span><span className="st-v" id="m6-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m6-tk3"></span><span className="st-v" id="m6-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m6-tk4"></span><span className="st-v" id="m6-tv4"></span></div>
                </div>
                <p className="lore-p" id="m6-p1"></p>
                <p className="lore-p" id="m6-p2"></p>
                <p className="lore-p" id="m6-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m6-cv-head"></div>
                  <div className="cv-text" id="m6-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 07: Гробница Некронов */}
        <div className="mission-entry" id="mission-7">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-7-details" onClick={() => window.toggleMission('mission-7')}>
            <span className="m-code" id="m7-code"></span>
            <span className="m-title" id="m7-title"></span>
            <span className="m-dist" id="m7-dist"></span>
            <span className="m-status" id="m7-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-7-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m7-tk1"></span><span className="st-v" id="m7-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m7-tk2"></span><span className="st-v" id="m7-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m7-tk3"></span><span className="st-v" id="m7-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m7-tk4"></span><span className="st-v" id="m7-tv4"></span></div>
                </div>
                <p className="lore-p" id="m7-p1"></p>
                <p className="lore-p" id="m7-p2"></p>
                <p className="lore-p" id="m7-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m7-cv-head"></div>
                  <div className="cv-text" id="m7-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 08: Плацдарм у Крепости, Плато Титанов и Пепельная Буря */}
        <div className="mission-entry" id="mission-8">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-8-details" onClick={() => window.toggleMission('mission-8')}>
            <span className="m-code" id="m8-code"></span>
            <span className="m-title" id="m8-title"></span>
            <span className="m-dist" id="m8-dist"></span>
            <span className="m-status" id="m8-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-8-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m8-tk1"></span><span className="st-v" id="m8-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m8-tk2"></span><span className="st-v" id="m8-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m8-tk3"></span><span className="st-v" id="m8-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m8-tk4"></span><span className="st-v" id="m8-tv4"></span></div>
                </div>
                <p className="lore-p" id="m8-p1"></p>
                <p className="lore-p" id="m8-p2"></p>
                <p className="lore-p" id="m8-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m8-cv-head"></div>
                  <div className="cv-text" id="m8-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 09: Рейд на Мануфакторум и Оборона Периметра (БЕЗ КАСТИИЛА) */}
        <div className="mission-entry" id="mission-9">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-9-details" onClick={() => window.toggleMission('mission-9')}>
            <span className="m-code" id="m9-code"></span>
            <span className="m-title" id="m9-title"></span>
            <span className="m-dist" id="m9-dist"></span>
            <span className="m-status" id="m9-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-9-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m9-tk1"></span><span className="st-v" id="m9-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m9-tk2"></span><span className="st-v" id="m9-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m9-tk3"></span><span className="st-v" id="m9-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m9-tk4"></span><span className="st-v" id="m9-tv4"></span></div>
                </div>
                <p className="lore-p" id="m9-p1"></p>
                <p className="lore-p" id="m9-p2"></p>
                <p className="lore-p" id="m9-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m9-cv-head"></div>
                  <div className="cv-text" id="m9-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 10: Битва у Мануфакторума и Дуэль Богомашин */}
        <div className="mission-entry" id="mission-10">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-10-details" onClick={() => window.toggleMission('mission-10')}>
            <span className="m-code" id="m10-code"></span>
            <span className="m-title" id="m10-title"></span>
            <span className="m-dist" id="m10-dist"></span>
            <span className="m-status" id="m10-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-10-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m10-tk1"></span><span className="st-v" id="m10-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m10-tk2"></span><span className="st-v" id="m10-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m10-tk3"></span><span className="st-v" id="m10-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m10-tk4"></span><span className="st-v" id="m10-tv4"></span></div>
                </div>
                <p className="lore-p" id="m10-p1"></p>
                <p className="lore-p" id="m10-p2"></p>
                <p className="lore-p" id="m10-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m10-cv-head"></div>
                  <div className="cv-text" id="m10-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* МИССИЯ 11: Последний Сигнал и Кислотный Дождь */}
        <div className="mission-entry" id="mission-11">
          <button type="button" className="mission-hd" aria-expanded={false} aria-controls="mission-11-details" onClick={() => window.toggleMission('mission-11')}>
            <span className="m-code" id="m11-code"></span>
            <span className="m-title" id="m11-title"></span>
            <span className="m-dist" id="m11-dist"></span>
            <span className="m-status" id="m11-status"></span>
            <span className="log-chevron">&#9660;</span>
          </button>
          <div className="mission-body-wrap" id="mission-11-details">
            <div className="mission-body-overflow">
              <div className="mission-body">
                <div className="shot-telemetry-grid">
                  <div className="st-item"><span className="st-k" id="m11-tk1"></span><span className="st-v" id="m11-tv1"></span></div>
                  <div className="st-item"><span className="st-k" id="m11-tk2"></span><span className="st-v" id="m11-tv2"></span></div>
                  <div className="st-item"><span className="st-k" id="m11-tk3"></span><span className="st-v" id="m11-tv3"></span></div>
                  <div className="st-item"><span className="st-k" id="m11-tk4"></span><span className="st-v" id="m11-tv4"></span></div>
                </div>
                <p className="lore-p" id="m11-p1"></p>
                <p className="lore-p" id="m11-p2"></p>
                <p className="lore-p" id="m11-p3"></p>
                <div className="censor-verdict-box">
                  <div className="cv-head" id="m11-cv-head"></div>
                  <div className="cv-text" id="m11-cv-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
