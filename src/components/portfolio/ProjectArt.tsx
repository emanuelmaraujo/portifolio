export default function ProjectArt({ index }: { index: number }) {
  return <svg className={`project-art art-${index}`} viewBox="0 0 360 218" aria-hidden="true">
    <path className="art-guides" d="M0 109h360M180 0v218M24 27h14m-7-7v14m291 157h14m-7-7v14" />
    {index === 0 && <g>
      <rect x="45" y="40" width="270" height="138" rx="8" className="art-panel" />
      <path d="M68 77h224M68 105h224M68 133h224M68 154h224" className="art-guides" />
      <path d="m68 140 35-21 30 6 31-32 38 9 36-31 25 12 27-28v99H68Z" className="art-area" />
      <path d="m68 140 35-21 30 6 31-32 38 9 36-31 25 12 27-28" className="art-line" />
      <circle cx="238" cy="71" r="5" className="art-dot" />
      <circle cx="290" cy="55" r="4" className="art-dot" />
      <path d="M75 59h42m-42 105h24m8 0h12" className="art-line" opacity=".55" />
    </g>}
    {index === 1 && <g>
      <circle cx="178" cy="109" r="93" className="art-orbit" />
      <circle cx="178" cy="109" r="68" className="art-orbit" />
      <g transform="rotate(-15 144 106)">
        <rect x="84" y="59" width="116" height="83" rx="9" className="art-panel" />
        <path d="M109 84h23v23h-23zm5 6h12v11h-12zm25-6h22v23h-22zm6 6h10v11h-10zm-36 24h23v15h-23zm30 0h10v6h12v9h-22z" className="art-line" />
      </g>
      <g transform="rotate(13 218 122)">
        <rect x="169" y="76" width="111" height="92" rx="11" className="art-panel" />
        <path d="M207 108a25 25 0 0 1 0 29m8-34a33 33 0 0 1 0 39m8-44a42 42 0 0 1 0 49" className="art-line" />
        <circle cx="200" cy="123" r="3" className="art-dot" />
      </g>
    </g>}
    {index === 2 && <g>
      <rect x="47" y="41" width="266" height="136" rx="8" className="art-panel" />
      <path d="M47 65h266m-176 0v112m89-112v112" className="art-guides" />
      {[62, 150, 239].map((x, i) => <g key={x} transform={`translate(${x},0)`}>
        <path d="M0 80h38" className="art-line" />
        <rect x="0" y="91" width="59" height="24" rx="4" className="art-area" />
        <path d="M7 101h36m-36 6h19" className="art-line" opacity=".65" />
        {i < 2 && <><rect x="0" y="122" width="59" height="24" rx="4" className="art-area" /><path d="M7 133h28m-28 6h40" className="art-line" opacity=".45" /></>}
        <circle cx="54" cy="80" r="3" className="art-dot" />
      </g>)}
    </g>}
  </svg>;
}
