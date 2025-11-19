import { Icon } from "@iconify/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "../lib/utils";

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

  const cardClassName = variant === "related" ? "rounded-2xl" : "rounded-lg";

  return (
    <Card className={cn("overflow-hidden border-neutral-200 bg-white", cardClassName)}>
      <div className="aspect-[2/3] bg-neutral-100">
        <img src={src} alt={title} className="h-full w-full object-cover" />
      </div>

      <CardHeader className="p-4">
        <CardTitle
          className={cn(
            "font-bold text-neutral-900 leading-tight", // Override font-semibold and add leading-tight
            variant === "recommendation"
              ? "text-sm md:text-lg"
              : "text-sm md:text-md"
          )}
        >
          {title}
        </CardTitle>
        <CardDescription
          className={cn(
            "font-medium text-neutral-700", // Override text-muted-foreground
            variant === "recommendation"
              ? "text-sm md:text-md"
              : "text-xs"
          )}
        >
          {author}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div
          className={cn(
            "inline-flex items-center gap-xxs text-sm font-semibold text-neutral-900",
            variant === "recommendation" ? "md:text-md" : ""
          )}
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
      </CardContent>
    </Card>
  );
}
