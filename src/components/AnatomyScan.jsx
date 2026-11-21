import scan from '../assets/anatomy-scan.webp';

const implants = [
  { x: 31, y: 10, lead: '310,86 390,86 480,62', label: 'Мозг' },
  { x: 69, y: 18, lead: '690,154 625,154 538,102', label: 'Оптика' },
  { x: 21, y: 37, lead: '210,317 348,317 494,376', label: 'Горнило' },
  { x: 80, y: 47, lead: '800,403 667,403 548,451', label: 'Сердца' },
  { x: 16, y: 63, lead: '160,540 208,540 265,515', label: 'Катушки' },
];

export default function AnatomyScan() {
  return (
    <div className="anatomy-scan">
      <img className="anatomy-plate" src={scan} width={1000} height={858} alt="" />
      <svg className="anatomy-leaders" viewBox="0 0 1000 858" aria-hidden="true">
        {implants.map(({ lead }) => <polyline key={lead} points={lead} vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="scan-pass" aria-hidden="true" />
      {implants.map(({ x, y, label }, index) => (
        <button
          key={label}
          type="button"
          id={`bnode-${index}`}
          className={index === 0 ? 'bio-node active' : 'bio-node'}
          style={{ '--x': `${x}%`, '--y': `${y}%` }}
          aria-label={label}
          aria-controls="bxi-desc"
          aria-pressed={index === 0}
          onClick={() => window.selectBioNode(index)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
