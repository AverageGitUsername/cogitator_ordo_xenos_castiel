export default function Squad() {
  return (
    <section id="tab-squad" className="tab">
        <div className="pg-head">
          <div className="pg-eyebrow">ПСИХО-ТАКТИЧЕСКИЙ НАДЗОР · СУБЪЕКТ-884 · ЛИЧНАЯ КАРТОТЕКА</div>
          <div className="pg-title">
            Истребительная Группа (Kill-Team)
            <span className="status-badge"> НАДЗОР: САНГВИС ЦЕНЗОР</span>
          </div>
        </div>
        <div className="warning-strip">
          <span className="w-mark">&#9888;</span> ЛИЧНЫЙ АРХИВ КАСТИИЛА: Субъект ведёт собственный реестр боевых братьев по Караулу Смерти, фиксируя их склонность к потере самоконтроля, тактическую выдержку и надёжность в бою. Наведите курсор и нажмите на карточку оперативника для вскрытия личного досье.
        </div>

        {/* Карточки рендерятся автоматически из массива SQUAD_DATA внизу страницы */}
        <div className="squad-grid" id="squad-grid"></div>
      </section>
  );
}
