export default function Communications() {
  return (
    <section id="tab-comm" className="tab" style={{ position: "relative", overflow: "hidden", minHeight: "480px" }}>
        <div id="comm-loader" className="tab-preloader"></div>
        <div id="comm-content" className="preload-content">
          <div className="pg-head">
            <div className="pg-eyebrow">ЗАШИФРОВАННЫЙ КАНАЛ · ВАРП-МАЯК ОРДО КСЕНОС</div>
            <div className="pg-title">
              Астропатическая Трансмиссия
              <span className="status-badge" id="comm-top-badge"> ПРОТОКОЛ ШИФРОВАНИЯ: VERMILION</span>
            </div>
          </div>

          <div className="comm-workspace">
            {/* 1. ЛЕВАЯ КОЛОНКА: ПЕЛЕНГАТОР ХОРА И УЗЛЫ РЕТРАНСЛЯЦИИ */}
            <div className="comm-beacon-panel">
              <div className="comm-beacon-head">
                <span id="cb-head-title">ПЕЛЕНГАТОР ИММАТЕРИУМА</span>
                <span id="cb-freq-val" style={{ color: "var(--crimson-bright)" }}>ЧАСТОТА: 884.IX-OMICRON</span>
              </div>

              <div className="comm-radar-wrap">
                <canvas id="comm-radar-canvas" className="comm-radar-canvas"></canvas>
                <div className="cr-hud cr-tl">
                  <span className="cr-line cr-gold" id="comm-svg-node">УЗЕЛ: ПРЯМОЙ ВОКС ФОБОС</span>
                  <span className="cr-line cr-pale" id="comm-svg-clr">ШИФР: VERMILION</span>
                </div>
                <div className="cr-hud cr-tr">
                  <span className="cr-line cr-flux" id="comm-radar-flux">ВАРП-ФЛУКС: 0.01%</span>
                </div>
                <div className="cr-hud cr-bl">
                  <span className="cr-line cr-ok" id="comm-radar-shield">ЩИТ: КОНТУР ЗАМКНУТ</span>
                </div>
              </div>

              <div className="comm-telemetry-grid">
                <div className="ct-cell"><span className="ct-k" id="ct-k1">ЧИСТОТА ЭФИРА:</span><span className="ct-v ok" id="ct-v1">98.4%</span></div>
                <div className="ct-cell"><span className="ct-k" id="ct-k2">ГЕКСАГРАММА:</span><span className="ct-v ok" id="ct-v2">АКТИВНА</span></div>
                <div className="ct-cell"><span className="ct-k" id="ct-k3">ЗАДЕРЖКА ХОРА:</span><span className="ct-v" id="ct-v3">0.04 МКС</span></div>
                <div className="ct-cell"><span className="ct-k" id="ct-k4">ОМНИ-ШИФР:</span><span className="ct-v" id="ct-v4">VERMILION</span></div>
              </div>

              <div className="comm-relay-strip">
                <span className="crs-label" id="crs-label">МАРШРУТ АСТРОПАТИЧЕСКОГО РЕЛЕ:</span>
                <button type="button" className="crs-btn active" onClick={event => window.selectCommRelay(0, event.currentTarget)}>
                  <span className="crs-name">01. ПРЯМОЙ ВОКС · СУБЪЕКТ-884</span>
                  <span>[ ФОБОС-ЛИНК ]</span>
                </button>
                <button type="button" className="crs-btn" onClick={event => window.selectCommRelay(1, event.currentTarget)}>
                  <span className="crs-name">02. УДАРНЫЙ КРЕЙСЕР КАРАУЛА</span>
                  <span>[ ОРБИТА ТВД ]</span>
                </button>
                <button type="button" className="crs-btn" onClick={event => window.selectCommRelay(2, event.currentTarget)}>
                  <span className="crs-name">03. КАРАУЛЬНАЯ КРЕПОСТЬ · ОРДО КСЕНОС</span>
                  <span>[ ХОР СЕКТОРА ]</span>
                </button>
              </div>
            </div>

            {/* 2. ПРАВАЯ КОЛОНКА: ПУЛЬТ ТРАНСМИССИИ И ЖУРНАЛ ПЕРЕХВАТА */}
            <div className="comm-console-col">
              <div className="comm-panel">
                <div>
                  <div className="cp-top-bar">
                    <span id="cp-console-title">ПУЛЬТ ФОРМИРОВАНИЯ ПАКЕТА · КАНАЛ ОТКРЫТ</span>
                    <span className="cp-byte-counter" id="cp-byte-counter">ОБЪЁМ ПАКЕТА: 0 БАЙТ · ХЭШ: 0x884A</span>
                  </div>

                  {/* ВЫБОР ПРОТОКОЛА ШИФРОВАНИЯ / УРОВНЯ СРОЧНОСТИ ИНКВИЗИЦИИ */}
                  <div className="clearance-group">
                    <span className="clearance-lbl" id="clr-group-lbl">Кодировка Шифра / Уровень Срочности (Передаётся в Реестр):</span>
                    <div className="clearance-tabs">
                      <button type="button" className="clr-btn" data-clr="OMICRON" onClick={event => window.selectCommClearance('OMICRON', event.currentTarget)}>
                        <span>OMICRON</span>
                        <span className="clr-sub" data-ru="Штатный" data-en="Routine">Штатный</span>
                      </button>
                      <button type="button" className="clr-btn" data-clr="CYAN" onClick={event => window.selectCommClearance('CYAN', event.currentTarget)}>
                        <span>CYAN</span>
                        <span className="clr-sub" data-ru="Оперативный" data-en="Tactical">Оперативный</span>
                      </button>
                      <button type="button" className="clr-btn" data-clr="MAGENTA" onClick={event => window.selectCommClearance('MAGENTA', event.currentTarget)}>
                        <span>MAGENTA</span>
                        <span className="clr-sub" data-ru="Секретный" data-en="Classified">Секретный</span>
                      </button>
                      <button type="button" className="clr-btn active" data-clr="VERMILION" onClick={event => window.selectCommClearance('VERMILION', event.currentTarget)}>
                        <span>VERMILION</span>
                        <span className="clr-sub" data-ru="Приоритет" data-en="High Priority">Приоритет</span>
                      </button>
                      <button type="button" className="clr-btn" data-clr="BLACK" onClick={event => window.selectCommClearance('BLACK', event.currentTarget)}>
                        <span>BLACK</span>
                        <span className="clr-sub" data-ru="Экстренный" data-en="Extremis">Экстренный</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-row-split">
                    <div className="form-group">
                      <label id="lbl-sender" htmlFor="senderName">Позывной / Идентификатор Отправителя</label>
                      <input
                        type="text"
                        id="senderName"
                        className="comm-input"
                        placeholder="Введите позывной или ранг..."
                        autoComplete="off"
                        onInput={() => window.updateCommPacketTelemetry()} />
                    </div>
                    <div className="form-group">
                      <label id="lbl-target-node" htmlFor="commNodeReadout">Активный Узел Получателя</label>
                      <input
                        type="text"
                        id="commNodeReadout"
                        className="comm-input"
                        defaultValue="ПРЯМОЙ ВОКС · СУБЪЕКТ-884 [VERMILION]"
                        readOnly
                        style={{ color: "var(--gold)", cursor: "default" }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label id="lbl-msg" htmlFor="messageText">Пакет Данных Трансмиссии</label>
                    <textarea id="messageText" className="comm-input" rows="4" placeholder="Введите текст астропатической трансмиссии..." onInput={() => window.updateCommPacketTelemetry()}></textarea>
                  </div>
                </div>

                <div>
                  <button className="comm-btn" onClick={() => window.sendMessage()}> ПЕРЕДАТЬ В ВАРП </button>
                  <div id="form-status" role="status"></div>
                </div>
              </div>

              {/* БУФЕР АСТРОПАТИЧЕСКИХ ТРАНСМИССИЙ */}
              <div className="comm-log-box">
                <div className="clb-head">
                  <span id="clb-head-title">ЖУРНАЛ ВОКС-БУФЕРА · ПОСЛЕДНИЕ ПАКЕТЫ В ЭФИРЕ</span>
                  <span style={{ color: "var(--green-ok)" }} id="clb-head-status"> ОМНИ-СКРЕМБЛЕР: АКТИВЕН</span>
                </div>
                <div className="clb-feed" id="comm-live-feed"></div>
              </div>
            </div>
          </div>
        </div>{/* /comm-content */}
      </section>
  );
}
