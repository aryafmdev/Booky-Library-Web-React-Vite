import { Icon } from "@iconify/react";

export interface BookCardProps {
  id?: number;
  title: string;
  author?: string;
  rating?: number | string;
  cover?: string;
  variant?: "recommendation" | "related";
}

export default function BookCard({
  title,
  author = "Unknown Author",
  rating = 0,
  cover,
  variant = "recommendation",
}: BookCardProps) {
  const src = cover ?? "/assets/images/default-cover.png";

  // styling sesuai variant
  const baseClass =
    variant === "related" ? "rounded-2xl" : "rounded-lg";

  return (
    <div className={`${baseClass} border border-neutral-200 bg-white overflow-hidden`}>
      <div className="aspect-[2/3] bg-neutral-100">
        <img src={src} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="px-md py-sm">
        <p
          className={
            variant === "recommendation"
              ? "text-sm md:text-lg font-bold text-neutral-900"
              : "text-sm md:text-md font-bold text-neutral-900"
          }
        >
          {title}
        </p>
        <p
          className={
            variant === "recommendation"
              ? "text-sm md:text-md font-medium text-neutral-700"
              : "text-xs text-neutral-700 font-medium"
          }
        >
          {author}
        </p>
        <div
          className={
            variant === "recommendation"
              ? "mt-xs text-sm md:text-md font-semibold text-neutral-900 inline-flex items-center gap-xxs"
              : "mt-xs inline-flex items-center gap-xxs text-sm font-semibold text-neutral-900"
          }
        >
          {variant === "related" ? (
            <>
              <Icon icon="mdi:star" className="size-4 text-yellow-500" />
              <span>{rating}</span>
            </>
          ) : (
            <>
              <span>⭐</span>
              <span>{rating}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
