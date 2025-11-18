import { Icon } from "@iconify/react";
import authorImg from "../assets/images/author.png";

type ReviewCardProps = {
  name?: string;
  avatar?: string;
  date?: string;
  rating?: number;
  text?: string;
};

export default function ReviewCard({
  name = "John Doe",
  avatar = authorImg,
  date = "25 August 2025, 13:38",
  rating = 5,
  text =
    "Lorem ipsum dolor sit amet consectetur. Pulvinar porttitor aliquam viverra nunc sed facilisis. Integer tristique nullam morbi mauris ante.",
}: ReviewCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-md md:p-lg shadow-sm">
      <div className="flex items-center gap-md mb-sm">
        <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
        <div>
          <div className="text-sm font-semibold text-neutral-950">{name}</div>
          <div className="text-xs text-neutral-600">{date}</div>
        </div>
      </div>
      <div className="flex items-center gap-xxs text-yellow-500 mb-sm">
        {Array.from({ length: rating }).map((_, i) => (
          <Icon key={i} icon="mdi:star" className="size-4" />
        ))}
      </div>
      <p className="text-sm text-neutral-700 leading-relaxed">{text}</p>
    </div>
  );
}
