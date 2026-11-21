import scan from '../assets/anatomy-scan.webp';

const implants = [
  { x: 32, y: 10, lead: '320,83 392,83 488,50', label: 'Мозг' },
  { x: 68, y: 18, lead: '680,150 620,150 529,87', label: 'Оптика' },
  { x: 22, y: 38, lead: '220,317 340,317 502,323', label: 'Горнило' },
  { x: 78, y: 47, lead: '780,392 677,392 547,368', label: 'Сердца' },
  { x: 17, y: 64, lead: '170,534 216,534 314,466', label: 'Катушки' },
];

export default function AnatomyScan() {
  return (
    <div className="anatomy-scan">
      <img className="anatomy-plate" src={scan} width={1000} height={834} alt="" />
      <svg className="anatomy-leaders" viewBox="0 0 1000 834" aria-hidden="true">
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
