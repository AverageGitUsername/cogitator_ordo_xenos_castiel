import systemImage from '../assets/callidis-lumen-ru.webp';

const bodies = [
  ['Каллидис Люмен', 780, 349, 70],
  ['Морталис-16', 90, 346, 43],
  ['Веррон-Прайм', 385, 182, 26],
  ['Флорис-4', 1016, 329, 44],
  ['Гегемон', 1089, 266, 36],
  ['Солус-7', 1126, 503, 33],
  ['Кредион', 1179, 543, 23],
  ['Маркесс-8', 1327, 316, 39],
];

export default function SystemMap() {
  const openCaelis = () => window.openAstroPlanet('caelis');
  const onActivate = (event, action) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
  };

  return (
    <>
      <div className="sys-hub-stage">
        <img className="sys-hub-img" id="sys-hub-img" src={systemImage}
          width={1480} height={704} alt="" loading="lazy" draggable={false} />
        <svg className="sys-hub-svg" viewBox="0 0 1480 704">
          {bodies.map(([name, x, y, r], index) => {
            const preview = () => window.previewSystemBody(index);
            return (
              <g key={name} role="button" tabIndex={0} aria-label={name} aria-pressed={false}
                className="system-marker" data-system-body={index}
                onClick={preview} onKeyDown={event => onActivate(event, preview)}>
                <circle className="system-hit" cx={x} cy={y} r={r} />
                <circle className="system-outline" cx={x} cy={y} r={r} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
          <g role="button" tabIndex={0} aria-label="Каэлис-9" id="system-caelis-marker"
            className="system-marker system-marker-active" transform="translate(307 239)"
            onClick={openCaelis} onKeyDown={event => onActivate(event, openCaelis)}>
            <circle className="system-hit" r="49" />
            <path className="system-corners" d="M-48 -33v-15h15 M33 -48h15v15 M48 33v15H33 M-33 48h-15V33"
              vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>
      <div className="system-index">
        {bodies.map(([name], index) => (
          <button key={name} type="button" data-system-body={index} aria-pressed={false}
            onClick={() => window.previewSystemBody(index)}>{name}</button>
        ))}
      </div>
    </>
  );
}
