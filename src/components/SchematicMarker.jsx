export default function SchematicMarker({ x, y, number }) {
  return (
    <g className="schematic-marker" transform={`translate(${x} ${y})`} aria-hidden="true">
      <circle r="20" fill="transparent" />
      <circle className="schematic-marker-ring" r="13" vectorEffect="non-scaling-stroke" />
      <text className="schematic-marker-number" textAnchor="middle" dy=".34em">{number}</text>
    </g>
  );
}
