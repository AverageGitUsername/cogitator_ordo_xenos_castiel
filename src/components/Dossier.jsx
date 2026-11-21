export default function Dossier() {
  return (
    <section id="tab-dossier" className="tab" style={{ position: "relative", overflow: "hidden" }}>
        <div id="auth-screen">
          <div className="auth-scanlines"></div>
          <div className="auth-line" id="al1">&gt; Запрос к крипто-хранилищу Ордо Ксенос...<span className="auth-cursor"></span></div>
          <div className="auth-line" id="al2">&gt; Снятие Инфо-Печатей Инквизиции... <span className="auth-ok">[ УСПЕШНО ]</span></div>
          <div className="auth-line" id="al3">&gt; Изоляция инфо-пространства... <span className="auth-ok">[ ВАКУУМ ОБЕСПЕЧЕН ]</span></div>
          <div className="auth-line ok" id="al4">&gt; Расшифровка досье 884-OMEGA...</div>
        </div>
        <div id="dossier-content"></div>
      </section>
  );
}
