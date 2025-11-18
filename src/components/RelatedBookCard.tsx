import { Icon } from "@iconify/react";
// import defaultCover from "../assets/images/default-cover.png";

type RelatedBookCardProps = {
  title: string;
  author?: string;
  rating?: number;
  cover?: string; // local path: "../assets/images/book-title.png"
};

export default function RelatedBookCard({
  title,
  author = "Author name",
  rating = 4.9,
  cover,
}: RelatedBookCardProps) {
  const src = cover ?? "../assets/images/default-cover.png";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div className="aspect-[2/3] bg-neutral-100">
        <img src={src} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="px-md py-sm">
        <p className="text-sm md:text-md font-bold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-700 font-medium">{author}</p>
        <div className="mt-xs inline-flex items-center gap-xxs text-sm font-semibold text-neutral-900">
          <Icon icon="mdi:star" className="size-4 text-yellow-500" />
          <span>{rating}</span>
        </div>
      </div>
    </div>
  );
}
