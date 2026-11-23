import type { RadarRecord } from "./content";

export default function Creator({ creator, compact = false }: { creator: RadarRecord["creator"]; compact?: boolean }) {
  const initials = creator.name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("");
  return <span className={`r-creator${compact ? " r-creator-small" : ""}`}>
    <span className="r-avatar"><span aria-hidden>{initials}</span>{creator.handle &&
      // The official account avatar is supplemental. Text attribution is always visible.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={creator.remoteAvatar ? `https://github.com/${creator.handle}.png?size=64` : `/radar/creators/${creator.handle.toLowerCase()}.png`} alt="" width={32} height={32} referrerPolicy="no-referrer" loading="lazy" />}</span>
    {creator.name}
  </span>;
}
