import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/images/logo.png';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { HashLink } from 'react-router-hash-link';
import { logout } from '../features/auth/authSlice';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const quantity = useSelector<RootState, number>((state) => state.cart.quantity);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <header
      id="header"
      className="sticky top-0 z-50 bg-white w-full border-b border-neutral-200 px-4xl py-md"
    >
      <div className="flex items-center justify-between">
        {/* Logo + Text */}
        {isHome ? (
          <a href="#hero" className="inline-flex items-center gap-sm">
            <img src={logo} alt="Booky Logo" className="h-8 md:h-10" />
            <span className="hidden md:inline-block text-display-md font-bold text-neutral-950">
              Booky
            </span>
          </a>
        ) : (
          <HashLink
            smooth
            to="/#hero"
            className="inline-flex items-center gap-sm"
          >
            <img src={logo} alt="Booky Logo" className="h-8 md:h-10" />
            <span className="hidden md:inline-block text-display-md font-bold text-neutral-950">
              Booky
            </span>
          </HashLink>
        )}

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-sm">
          {token && user ? (
            <>
              <span className="text-md font-bold text-neutral-950">
                Hi, {user.name}
              </span>
              <button
                onClick={() => dispatch(logout())}
                className="px-xl py-sm bg-red-500 text-md font-bold text-white rounded-full hover:bg-red-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-xl py-sm bg-white text-md font-bold text-neutral-950 rounded-full border border-neutral-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-xl py-sm bg-primary-300 text-md font-bold text-white rounded-full"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Icons */}
        <div className="md:hidden flex items-center">
          {/* Search Icon */}
          <div className="relative rounded-full bg-white flex items-center justify-center size-8 cursor-pointer">
            <Icon icon="ic:round-search" className="size-7 text-neutral-950" />
          </div>

          {/* Shopping Bag Icon with Badge */}
          <div className="relative rounded-full bg-white flex items-center justify-center size-8">
            <Icon icon="mdi:shopping-outline" className="size-7 text-neutral-950" />
            {quantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {quantity}
              </span>
            )}
          </div>

          {/* Hamburger Menu */}
          <div className="rounded-full bg-white flex items-center justify-center size-8 cursor-pointer">
            <Icon icon="mdi:menu" className="size-7 text-neutral-950" />
          </div>
        </div>
      </div>
    </header>
  );
}
