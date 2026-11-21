import seal from '../assets/castiel-emblem.webp';

export default function BootScreen() {
  return (
    <div id="boot-terminal" aria-label="Загрузка системы" role="dialog" aria-modal="true">
      <div className="bt-icon-wrap" id="bt-icon">
        <img className="bt-emblem" src={seal} alt="" />
      </div>
      <div className="bt-console-wrap" id="bt-console-wrap">
        <div className="bt-header">
          <span className="bt-header-left">ORDO XENOS · COGITATOR TERMINAL · СУБЪЕКТ-884</span>
          <span className="bt-header-right" id="bt-timer">00:00:00</span>
        </div>
        <div className="bt-log-area" id="bt-log-area"></div>
        <div className="bt-cursor-line"><span className="bt-cursor" id="bt-cursor">█</span></div>
        <div className="bt-progress-wrap" id="bt-progress-wrap">
          <div className="bt-progress-label">
            <span id="bt-progress-label-text">ЗАГРУЗКА СИСТЕМЫ</span>
            <span id="bt-progress-pct">0%</span>
          </div>
          <div className="bt-progress-bg">
            <div className="bt-progress-fill" id="bt-progress-fill"></div>
          </div>
        </div>
        <div className="bt-auth-wrap" id="bt-auth-wrap">
          <button className="bt-auth-btn" id="bt-auth-btn" onClick={() => window.bootAuthorize()}>
            <span>[ </span>ПРИЛОЖИТЬ РОЗЕТТУ · ВОЙТИ<span> ]</span>
          </button>
        </div>
      </div>
      <div className="bt-skip-hint" id="bt-skip-hint">НАЖМИТЕ ПРОБЕЛ / ENTER / ЛКМ ДЛЯ ПРОПУСКА</div>
    </div>
  );
}
