import { Link } from "react-router-dom";
import logoBooky from "../assets/images/logo-booky.png";

export default function Header() {
  return (
    <header id="header" className="w-full border-b border-neutral-200 px-4xl py-md">
      <div className="flex items-center justify-between">
        <Link to="/home" className="inline-block">
          <img src={logoBooky} alt="Booky Logo" className="h-8 md:h-10" />
        </Link>
        <div className="hidden md:flex items-center gap-sm">
          <Link to="/login" className="px-xl py-sm bg-white text-md font-bold text-neutral-950 rounded-full border border-neutral-200">
            Login
          </Link>
          <Link to="/register" className="px-xl py-sm bg-primary-300 text-md font-bold text-white rounded-full">
            Register
          </Link>
        </div>
        <div className="md:hidden flex items-center gap-sm">
          <span className="h-8 w-8 rounded-full bg-white border border-neutral-200 inline-flex items-center justify-center">🔍</span>
          <span className="h-8 w-8 rounded-full bg-white border border-neutral-200 inline-flex items-center justify-center">❤️</span>
        </div>
      </div>
    </header>
  );
}
