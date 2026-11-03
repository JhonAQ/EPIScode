type HomeIconName = "arrow" | "news" | "curriculum" | "repository";

export function HomeIcon({ name, className = "h-4 w-4" }: {
  name: HomeIconName;
  className?: string;
}) {
  const paths: Record<HomeIconName, string> = {
    arrow: "M5 12h14m-5-5 5 5-5 5",
    news: "M5 4h14v16H5zM8 8h8M8 12h3m-3 4h8m-2-4h2",
    curriculum: "M4 5h16M4 9h16M4 13h7m-7 4h7m4-4h5v7l-2.5-1.5L15 20z",
    repository: "M5 5h14v16H5zM8 2h8v6H8zM8 12h8m-8 4h5",
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
