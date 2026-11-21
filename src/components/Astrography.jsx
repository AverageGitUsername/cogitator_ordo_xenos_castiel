export default function Astrography() {
  return (
    <section id="tab-astro" className="tab">
        <div className="pg-head">
          <div className="pg-eyebrow" id="astro-pg-eyebrow">НАВИГАЦИОННЫЙ КОГИТАТОР · УДАРНЫЙ КРЕЙСЕР КАРАУЛА СМЕРТИ · КАРТА СИСТЕМЫ</div>
          <div className="pg-title">
            <span id="astro-pg-main-title">Система Каллидис Люмен</span>
            <span className="status-badge" id="astro-pg-badge"> АКТИВНЫЙ ТВД: КАЭЛИС-9</span>
          </div>
        </div>

        {/* Панель управления (динамически меняет кнопки между Хабом и Планетой) */}
        <div className="astro-toolbar">
          {/* Кнопки в режиме Хаба Системы */}
          <div className="astro-layers" id="astro-hub-bar-left">
            <button className="astro-btn active" id="astro-open-caelis-btn" onClick={() => window.openAstroPlanet('caelis')}>[ ОТКРЫТЬ ТВД: КАЭЛИС-9 ]</button>
          </div>

          {/* Кнопки в режиме Планеты Каэлис-9 */}
          <div className="astro-layers" id="astro-planet-bar-left" style={{ display: "none" }}>
            <button className="astro-btn back-hub-btn" id="astro-back-hub-btn" onClick={() => window.closeAstroPlanet()}>[ ◄ КАРТА СИСТЕМЫ ]</button>
            <button className="astro-btn active" id="alayer-btn-0" onClick={event => window.setAstroLayer('main', event.currentTarget)}>[ 01. ОБЗОР ТВД И ОПЕРАЦИИ ]</button>
            <button className="astro-btn" id="alayer-btn-1" onClick={event => window.setAstroLayer('tau', event.currentTarget)}>[ 02. ПЕЛЕНГ КСЕНОСОВ (ТАУ) ]</button>
            <button className="astro-btn" id="alayer-btn-2" onClick={event => window.setAstroLayer('imp', event.currentTarget)}>[ 03. РУБЕЖИ ИМПЕРИУМА ]</button>
          </div>

          <div className="astro-tools">
            {/* Скрытая заглушка, чтобы старый локализатор не выдал ошибку */}
            <span id="astro-spectrum-btn" style={{ display: "none" }}></span>
            <button className="astro-btn tool-highlight" id="astro-fs-btn" onClick={() => window.toggleAstroFullscreen()}>[ ГОЛОЛИТ НА ВЕСЬ ЭКРАН ]</button>
          </div>
        </div>

        {/* ══ ЭКРАН 1: ИНТЕРАКТИВНЫЙ ХАБ СИСТЕМЫ «КАЛЛИДИС ЛЮМЕН» ══ */}
        <div className="sys-hub-wrap" id="astro-system-hub">
          <div className="sys-hub-stage">
            <img className="sys-hub-img" id="sys-hub-img" src="https://dl.dropboxusercontent.com/scl/fi/8x43v26x508g64uboaupf/SystemRUS.jpg?rlkey=0jrfx6anpc60k0vqix6xo6y4u&amp;st=3w8cwhg0" alt="Система Каллидис Люмен" draggable="false" />

            <svg className="sys-hub-svg" viewBox="0 0 1000 462" xmlns="http://www.w3.org/2000/svg">
              {/* Прицельная сетка сектора */}
              <line
                x1="523"
                y1="0"
                x2="523"
                y2="462"
                stroke="rgba(201,168,76,0.12)"
                strokeWidth="0.8"
                strokeDasharray="6 6" />
              <line
                x1="0"
                y1="225"
                x2="1000"
                y2="225"
                stroke="rgba(201,168,76,0.12)"
                strokeWidth="0.8"
                strokeDasharray="6 6" />

              {/* Звезда: Каллидис Люмен */}
              <g className="sys-node" onClick={() => window.previewSystemBody(0)}>
                <circle className="sys-node-star" cx="523" cy="225" r="56" />
                <circle
                  cx="523"
                  cy="225"
                  r="46"
                  fill="none"
                  stroke="rgba(201,168,76,0.3)"
                  strokeWidth="1" />
              </g>

              {/* Неактивные планеты (обведены тактическими кольцами) */}
              {/* Морталис-16 */}
              <g className="sys-node" onClick={() => window.previewSystemBody(1)}>
                <circle className="sys-node-ring" cx="62" cy="222" r="34" />
                <circle
                  cx="62"
                  cy="222"
                  r="28"
                  fill="none"
                  stroke="rgba(192,57,43,0.35)"
                  strokeWidth="1" />
              </g>
              {/* Веррон-Прайм */}
              <g className="sys-node" onClick={() => window.previewSystemBody(2)}>
                <circle className="sys-node-ring" cx="259" cy="119" r="21" />
              </g>
              {/* Флорис-4 (координаты из комплекса Энигма) */}
              <g className="sys-node" onClick={() => window.previewSystemBody(3)}>
                <circle className="sys-node-ring" cx="684" cy="212" r="35" style={{ stroke: "#e53935", strokeWidth: "1.8" }} />
                <circle
                  cx="684"
                  cy="212"
                  r="29"
                  fill="none"
                  stroke="rgba(201,168,76,0.5)"
                  strokeWidth="1" />
              </g>
              {/* Гегемон */}
              <g className="sys-node" onClick={() => window.previewSystemBody(4)}>
                <circle className="sys-node-ring" cx="735" cy="171" r="29" />
              </g>
              {/* Солус-7 */}
              <g className="sys-node" onClick={() => window.previewSystemBody(5)}>
                <circle className="sys-node-ring" cx="758" cy="329" r="27" />
              </g>
              {/* Кредион */}
              <g className="sys-node" onClick={() => window.previewSystemBody(6)}>
                <circle className="sys-node-ring" cx="792" cy="357" r="17" />
              </g>
              {/* Маркесс-8 */}
              <g className="sys-node" onClick={() => window.previewSystemBody(7)}>
                <circle className="sys-node-ring" cx="896" cy="209" r="34" />
                <circle
                  cx="896"
                  cy="209"
                  r="28"
                  fill="none"
                  stroke="rgba(192,57,43,0.35)"
                  strokeWidth="1" />
              </g>

              {/* ★ КЛИКАБЕЛЬНАЯ ПЛАНЕТА: КАЭЛИС-9 ★ */}
              <g className="sys-node clickable" onClick={() => window.openAstroPlanet('caelis')}>
                <circle className="sys-caelis-pulse" cx="206" cy="147" r="38" />
                <circle className="sys-caelis-outer" cx="206" cy="147" r="42" />
                <circle className="sys-caelis-inner" cx="206" cy="147" r="33" />
                {/* Угловые скобки захвата цели */}
                <path d="M160 112 L160 100 L172 100 M252 112 L252 100 L240 100 M160 182 L160 194 L172 194 M252 182 L252 194 L240 194" fill="none" stroke="#e5c365" strokeWidth="2" />
                {/* Плашка вызова досье */}
                <rect
                  className="sys-badge-bg"
                  x="128"
                  y="66"
                  width="156"
                  height="22"
                  rx="2" />
                <text className="sys-badge-txt" x="206" y="81" textAnchor="middle" id="sys-caelis-tag">[ ОТКРЫТЬ ТВД ]</text>
              </g>
            </svg>
          </div>

          <div className="sys-hub-footer">
            <div className="shf-info">
              <div className="shf-title" id="shf-title">КАЭЛИС-9 · АКТИВНАЯ ЗОНА БОЕВЫХ ДЕЙСТВИЙ</div>
              <div className="shf-sub" id="shf-sub">Нажмите на планету Каэлис-9 на карте сектора для развёртки орбитального гололита и тактических сводок Истребительной Группы.</div>
            </div>
            <button className="astro-btn back-hub-btn" id="shf-enter-btn" onClick={() => window.openAstroPlanet('caelis')}>[ ↗ РАЗВЕРНУТЬ ДОСЬЕ КАЭЛИС-9 ]</button>
          </div>
        </div>

        {/* ══ ЭКРАН 2: ДЕТАЛЬНОЕ ДОСЬЕ И ГОЛОЛИТ КАЭЛИС-9 ══ */}
        <div className="astro-workspace" id="astro-caelis-view" style={{ display: "none" }}>
          {/* Левая часть: Голографический глобус Каэлис-9 */}
          <div className="hololith-stage" id="hololith-stage">
            <img className="holo-map-img" src="https://dl.dropboxusercontent.com/scl/fi/xuzc7518eva3pcmeao0p0/map2.png?rlkey=hq7ka92y7bt3165re5an03jo9&amp;st=yke2uxrp" alt="Тактическая карта Каэлис-9" draggable="false" />

            <svg className="holo-svg-overlay" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="500"
                cy="500"
                r="465"
                fill="none"
                stroke="rgba(201,168,76,0.22)"
                strokeWidth="1.5"
                strokeDasharray="18 10" />
              <circle
                cx="500"
                cy="500"
                r="448"
                fill="none"
                stroke="rgba(192,57,43,0.25)"
                strokeWidth="1"
                strokeDasharray="6 14" />
              <line
                x1="500"
                y1="20"
                x2="500"
                y2="980"
                stroke="rgba(192,57,43,0.14)"
                strokeWidth="1" />
              <line
                x1="20"
                y1="500"
                x2="980"
                y2="500"
                stroke="rgba(192,57,43,0.14)"
                strokeWidth="1" />

              {/* СЛОЙ 2: ПЕЛЕНГ ПОЗИЦИЙ ТАУ */}
              <g className="layer-group" id="astro-layer-tau">
                <g><circle className="tau-reticle" cx="210" cy="346" r="42" /><circle cx="210" cy="346" r="6" fill="#ff2a1a" /></g>
                <g><circle className="tau-reticle" cx="349" cy="421" r="42" /><circle cx="349" cy="421" r="6" fill="#ff2a1a" /></g>
                <g><circle className="tau-reticle" cx="513" cy="328" r="42" /><circle cx="513" cy="328" r="6" fill="#ff2a1a" /></g>
                <g><circle className="tau-reticle" cx="616" cy="499" r="42" /><circle cx="616" cy="499" r="6" fill="#ff2a1a" /></g>
                <g><circle className="tau-reticle" cx="561" cy="591" r="42" /><circle cx="561" cy="591" r="6" fill="#ff2a1a" /></g>
                <g><circle className="tau-reticle" cx="355" cy="654" r="42" /><circle cx="355" cy="654" r="6" fill="#ff2a1a" /></g>
              </g>

              {/* СЛОЙ 3: РУБЕЖИ ОБОРОНЫ ИМПЕРИУМА */}
              <g className="layer-group" id="astro-layer-imp">
                <g><circle className="imp-reticle" cx="356" cy="158" r="46" /><circle cx="356" cy="158" r="6" fill="#e5c365" /></g>
                <g><circle className="imp-reticle" cx="235" cy="263" r="46" /><circle cx="235" cy="263" r="6" fill="#e5c365" /></g>
                <g><circle className="imp-reticle" cx="562" cy="278" r="46" /><circle cx="562" cy="278" r="6" fill="#e5c365" /></g>
                <g><circle className="imp-reticle" cx="618" cy="374" r="46" /><circle cx="618" cy="374" r="6" fill="#e5c365" /></g>
                <g><circle className="imp-reticle" cx="727" cy="286" r="46" /><circle cx="727" cy="286" r="6" fill="#e5c365" /></g>
                <g><circle className="imp-reticle" cx="753" cy="656" r="46" /><circle cx="753" cy="656" r="6" fill="#e5c365" /></g>
              </g>

              {/* СЛОЙ 1 (ОСНОВНОЙ): КЛИКАБЕЛЬНЫЕ УЗЛЫ КАЭЛИС-9 */}
              <g className="layer-group visible" id="astro-layer-main">
                <path d="M 408 320 L 304 388 L 278 468" fill="none" stroke="#ff2a1a" strokeWidth="3" strokeDasharray="8 6" />

                <g className="astro-pin pin-mission active" id="apin-0" data-node-index="0" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="408" cy="320" r="18" />
                  <circle className="pin-outer" cx="408" cy="320" r="14" />
                  <polygon points="408,310 415,325 401,325" fill="#e5c365" />
                  <text className="pin-tag" x="428" y="325">ОП-01: ВЕРТИС</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-1" data-node-index="1" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="304" cy="388" r="18" />
                  <circle className="pin-outer" cx="304" cy="388" r="14" />
                  <line
                    x1="296"
                    y1="380"
                    x2="312"
                    y2="396"
                    stroke="#ff3020"
                    strokeWidth="3.5" />
                  <line
                    x1="312"
                    y1="380"
                    x2="296"
                    y2="396"
                    stroke="#ff3020"
                    strokeWidth="3.5" />
                  <text className="pin-tag" x="175" y="393">ОП-02: РУБЕЖ</text>
                </g>

                <g className="astro-pin" id="apin-2" data-node-index="2" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="444" cy="494" r="15" /><circle className="pin-inner" cx="444" cy="494" r="5" />
                </g>
                <g className="astro-pin" id="apin-3" data-node-index="3" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="835" cy="485" r="15" /><circle className="pin-inner" cx="835" cy="485" r="5" />
                </g>
                <g className="astro-pin" id="apin-4" data-node-index="4" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="224" cy="726" r="15" /><circle className="pin-inner" cx="224" cy="726" r="5" />
                </g>
                <g className="astro-pin" id="apin-5" data-node-index="5" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="475" cy="385" r="13" /><circle className="pin-inner" cx="475" cy="385" r="4" />
                </g>
                <g className="astro-pin" id="apin-6" data-node-index="6" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="765" cy="375" r="13" /><circle className="pin-inner" cx="765" cy="375" r="4" />
                </g>
                <g className="astro-pin" id="apin-7" data-node-index="7" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="225" cy="575" r="13" /><circle className="pin-inner" cx="225" cy="575" r="4" />
                </g>
                <g className="astro-pin" id="apin-8" data-node-index="8" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="675" cy="740" r="13" /><circle className="pin-inner" cx="675" cy="740" r="4" />
                </g>
                <g className="astro-pin" id="apin-9" data-node-index="9" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-outer" cx="103" cy="91" r="16" /><circle className="pin-inner" cx="103" cy="91" r="5" />
                </g>

                {/* 10. ОП-03: Точка эвакуации (строго 11-й элемент, индекс 10) */}
                <g className="astro-pin pin-mission" id="apin-10" data-node-index="10" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="278" cy="468" r="18" />
                  <circle className="pin-outer" cx="278" cy="468" r="14" />
                  <polygon points="278,458 286,468 278,478 270,468" fill="#5cd65c" />
                  <text className="pin-tag" x="108" y="473" id="apin-10-tag">ОП-03: ЭВАКУАЦИЯ</text>
                </g>

                {/* Вторая независимая высадка: маршрут ОП-04 -> ОП-11 */}
                <path d="M 560 640 L 500 570 L 480 498 L 550 420 L 620 440 L 680 480 L 670 550 L 600 500" fill="none" stroke="#ff2a1a" strokeWidth="3" strokeDasharray="8 6" />

                <g className="astro-pin pin-mission" id="apin-11" data-node-index="11" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="560" cy="640" r="18" />
                  <circle className="pin-outer" cx="560" cy="640" r="14" />
                  <circle className="pin-inner" cx="560" cy="640" r="5" />
                  <text className="pin-tag" x="580" y="645">ОП-04: КАВЕНДИШ</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-12" data-node-index="12" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="500" cy="570" r="18" />
                  <circle className="pin-outer" cx="500" cy="570" r="14" />
                  <circle className="pin-inner" cx="500" cy="570" r="5" />
                  <text className="pin-tag" x="520" y="575">ОП-05: КЛЮЧ-МАТРИЦА</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-13" data-node-index="13" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="480" cy="498" r="18" />
                  <circle className="pin-outer" cx="480" cy="498" r="14" />
                  <circle className="pin-inner" cx="480" cy="498" r="5" />
                  <text className="pin-tag" x="480" y="528" textAnchor="middle">ОП-06: САНКТУМ</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-14" data-node-index="14" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="550" cy="420" r="18" />
                  <circle className="pin-outer" cx="550" cy="420" r="14" />
                  <circle className="pin-inner" cx="550" cy="420" r="5" />
                  <text className="pin-tag" x="550" y="396" textAnchor="middle">ОП-07: НЕКРОПОЛЬ</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-15" data-node-index="15" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="620" cy="440" r="18" />
                  <circle className="pin-outer" cx="620" cy="440" r="14" />
                  <circle className="pin-inner" cx="620" cy="440" r="5" />
                  <text className="pin-tag" x="640" y="438">ОП-08: БАСТИОН</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-16" data-node-index="16" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="680" cy="480" r="18" />
                  <circle className="pin-outer" cx="680" cy="480" r="14" />
                  <circle className="pin-inner" cx="680" cy="480" r="5" />
                  <text className="pin-tag" x="700" y="485">ОП-09: МАНУФАКТОРУМ</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-17" data-node-index="17" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="670" cy="550" r="18" />
                  <circle className="pin-outer" cx="670" cy="550" r="14" />
                  <circle className="pin-inner" cx="670" cy="550" r="5" />
                  <text className="pin-tag" x="690" y="555">ОП-10: ТИТАНИКА</text>
                </g>

                <g className="astro-pin pin-mission" id="apin-18" data-node-index="18" onClick={event => window.selectAstroNode(Number(event.currentTarget.dataset.nodeIndex))}>
                  <circle className="pin-pulse-ring" cx="600" cy="500" r="18" />
                  <circle className="pin-outer" cx="600" cy="500" r="14" />
                  <circle className="pin-inner" cx="600" cy="500" r="5" />
                  <text className="pin-tag" x="580" y="505" textAnchor="end">ОП-11: СИГНАЛ</text>
                </g>
              </g>
            </svg>
          </div>

          {/* Правая часть: Тактический Инспектор Сектора */}
          <div className="astro-hud-panel">
            <div className="ah-eyebrow">
              <span id="ah-code">ОПЕРАТИВНАЯ ТОЧКА · ОП-01</span>
              <span id="ah-coords">СЕТКА: 40.8°N · 32.0°E</span>
            </div>
            <div className="ah-title" id="ah-title">Крепость Вертис</div>

            <div className="ah-specs">
              <div>
                <span className="ah-spec-k" id="ah-spec-k1">КЛАССИФИКАЦИЯ ОБЪЕКТА</span>
                <span className="ah-spec-v" id="ah-type">Узел ПВО / Макро-орудие</span>
              </div>
              <div>
                <span className="ah-spec-k" id="ah-spec-k2">БАЛЛИСТИЧЕСКАЯ СРЕДА</span>
                <span className="ah-spec-v" id="ah-ballistics">Горный рельеф · До 2 100 м</span>
              </div>
            </div>

            <div className="ah-desc" id="ah-desc"></div>

            <button className="ah-jump-btn" id="ah-jump-btn">[ ↗ ОТКРЫТЬ РАПОРТ ОПЕРАЦИИ В ЛИЧНЫХ ЛОГАХ ]</button>

            <div className="ah-quick-title" id="ah-quick-title">БЫСТРОЕ НАВЕДЕНИЕ АУСПЕКСА ПО УЗЛАМ:</div>
            <div className="ah-quick-grid" id="ah-quick-grid"></div>
          </div>
        </div>
      </section>
  );
}
