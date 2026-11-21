const SHORTCUTS = [
  { keys: '1 – 8', ru: 'Переключение разделов (Биометрия … Связь)', en: 'Switch sections (Biometrics … Vox-Link)' },
  { keys: 'Tab / Shift+Tab', ru: 'Перемещение по всем кнопкам, полям и узлам', en: 'Move focus across all controls and nodes' },
  { keys: '↑ ↓ ← →', ru: 'Навигация внутри меню, вкладок, актов и свитков', en: 'Navigate inside sidebar, tab groups, acts & scrolls' },
  { keys: 'Enter / Space', ru: 'Открыть карточку, активировать узел, выстрелить', en: 'Activate node, open dossier, or fire simulation' },
  { keys: 'Home / End', ru: 'Первый или последний пункт в списке навигации', en: 'Jump to first or last navigation item' },
  { keys: 'Esc / Backspace', ru: 'Закрыть подстраницу, архив, досье или вернуться назад', en: 'Close archive, dossier, modal, or go back' },
  { keys: 'B', ru: 'Свернуть или развернуть боковую панель', en: 'Collapse or expand navigation sidebar' },
  { keys: 'M', ru: 'Включить или отключить вокс-аудио', en: 'Toggle cogitator vox-audio' },
  { keys: 'L', ru: 'Переключить язык интерфейса (RU / EN)', en: 'Switch interface language (RU / EN)' },
  { keys: 'Ctrl + Enter', ru: 'Отправить сообщение в разделе «Связь»', en: 'Transmit message in Vox-Link' },
  { keys: '? / F1', ru: 'Открыть или закрыть эту справку', en: 'Open or close this hotkeys guide' },
];

export default function HotkeysDialog() {
  return (
    <div
      className="modal-overlay"
      id="hotkeys-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hk-modal-title"
      onClick={event => {
        if (event.target === event.currentTarget) window.closeHotkeysModal();
      }}
    >
      <div className="modal-box hk-modal-box">
        <button type="button" className="modal-close" onClick={() => window.closeHotkeysModal()}>
          <span className="localized-copy" lang="ru">[X] ЗАКРЫТЬ</span>
          <span className="localized-copy" lang="en">[X] CLOSE</span>
        </button>
        <div className="modal-header hk-header">
          <div className="modal-eyebrow">
            <span className="localized-copy" lang="ru">ИНТЕРФЕЙС КОГИТАТОРА · УПРАВЛЕНИЕ С КЛАВИАТУРЫ</span>
            <span className="localized-copy" lang="en">COGITATOR INTERFACE · KEYBOARD CONTROL</span>
          </div>
          <div className="modal-title" id="hk-modal-title">
            <span className="localized-copy" lang="ru">Горячие клавиши</span>
            <span className="localized-copy" lang="en">Keyboard Shortcuts</span>
          </div>
        </div>
        <div className="hk-list">
          {SHORTCUTS.map(({ keys, ru, en }) => (
            <div className="hk-row" key={keys}>
              <kbd className="hk-keys">{keys}</kbd>
              <span className="hk-desc">
                <span className="localized-copy" lang="ru">{ru}</span>
                <span className="localized-copy" lang="en">{en}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
