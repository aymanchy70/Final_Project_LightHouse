// A pulsing placeholder that mimics content loading
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-white/10 ${className}`}
    style={{ background: "rgba(255,255,255,0.05)" }}
  />
);

export default Skeleton;
