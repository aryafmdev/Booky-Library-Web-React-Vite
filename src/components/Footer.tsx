import logoBooky from "../assets/images/logo-booky.png";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 px-4xl py-3xl mt-6xl text-center">
      <a href="#header" className="inline-block">
        <img src={logoBooky} alt="Booky Logo" className="h-8 md:h-10" />
      </a>
      <p className="mt-sm text-sm md:text-md font-semibold text-neutral-950">
        Discover inspiring stories & timeless knowledge, ready to borrow anytime. Explore online or visit our nearest library branch.
      </p>
      <div className="my-3xl flex flex-col items-center text-center text-neutral-700">
        <p className="text-md font-bold text-neutral-950 mb-sm">Follow on Social Media</p>
        <div className="flex gap-md">
          <span className="size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center">
            <Icon icon="ri:facebook-fill" className="size-6 text-neutral-950" />
          </span>
          <span className="size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center">
            <Icon icon="mdi:instagram" className="size-6 text-neutral-950" />
          </span>
          <span className="size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center">
            <Icon icon="ri:linkedin-fill" className="size-6 text-neutral-950" />
          </span>
          <span className="size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center">
            <Icon icon="ic:baseline-tiktok" className="size-6 text-neutral-950" />
          </span>
        </div>
      </div>
    </footer>
  );
}
