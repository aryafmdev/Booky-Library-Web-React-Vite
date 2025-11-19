import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/images/logo.png';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { HashLink } from 'react-router-hash-link';
import { logout } from '../features/auth/authSlice';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const quantity = useSelector<RootState, number>((state) => state.cart.quantity);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [openDesktop, setOpenDesktop] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

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
        <div className="hidden md:flex items-center gap-sm relative">
          {token && user ? (
            <>
              <button onClick={() => setOpenDesktop((v) => !v)} className="inline-flex items-center gap-xxs px-md py-xxs bg-white border border-neutral-200 rounded-full">
                <span className="text-md font-bold text-neutral-950">{user.name}</span>
                <Icon icon="mdi:chevron-down" className="size-4 text-neutral-700" />
              </button>
              {openDesktop && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow">
                  <button className="w-full text-left px-md py-sm text-sm hover:bg-neutral-50" onClick={() => { setOpenDesktop(false); navigate('/profile'); }}>Profile</button>
                  <button className="w-full text-left px-md py-sm text-sm hover:bg-neutral-50" onClick={() => { setOpenDesktop(false); navigate('/profile?tab=loans'); }}>Borrowed List</button>
                  <button className="w-full text-left px-md py-sm text-sm hover:bg-neutral-50" onClick={() => { setOpenDesktop(false); navigate('/profile?tab=reviews'); }}>Reviews</button>
                  <div className="my-xxs h-px bg-neutral-200" />
                  <button className="w-full text-left px-md py-sm text-sm text-red-600 hover:bg-neutral-50" onClick={() => { setOpenDesktop(false); dispatch(logout()); }}>Logout</button>
                </div>
              )}
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
        <div className="md:hidden flex items-center relative">
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
          <button className="rounded-full bg-white flex items-center justify-center size-8 cursor-pointer" onClick={() => setOpenMobile((v) => !v)}>
            <Icon icon="mdi:menu" className="size-7 text-neutral-950" />
          </button>

          {openMobile && (
            <div className="absolute right-0 top-full mt-2 w-[220px] rounded-xl border border-neutral-200 bg-white shadow">
              {token && user ? (
                <div className="py-xxs">
                  <button className="w-full text-left px-md py-sm text-sm" onClick={() => { setOpenMobile(false); navigate('/profile'); }}>Profile</button>
                  <button className="w-full text-left px-md py-sm text-sm" onClick={() => { setOpenMobile(false); navigate('/profile?tab=loans'); }}>Borrowed List</button>
                  <button className="w-full text-left px-md py-sm text-sm" onClick={() => { setOpenMobile(false); navigate('/profile?tab=reviews'); }}>Reviews</button>
                  <div className="my-xxs h-px bg-neutral-200" />
                  <button className="w-full text-left px-md py-sm text-sm text-red-600" onClick={() => { setOpenMobile(false); dispatch(logout()); }}>Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-sm p-sm">
                  <Link to="/login" className="flex-1 px-xl py-sm bg-white text-sm font-bold text-neutral-950 rounded-full border border-neutral-200" onClick={() => setOpenMobile(false)}>Login</Link>
                  <Link to="/register" className="flex-1 px-xl py-sm bg-primary-300 text-sm font-bold text-white rounded-full" onClick={() => setOpenMobile(false)}>Register</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
