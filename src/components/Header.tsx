import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/images/logo.png';
import avatarUser from '../assets/images/avatar-user.png';
import { Input } from './ui/input';
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

  const [search, setSearch] = useState('');
  const displayName = user?.name?.trim() || 'John Doe';

  return (
    <header
      id="header"
      className="sticky top-0 z-50 bg-white w-full border-b border-neutral-200 px-4xl py-md"
    >
      <div className="flex items-center gap-md justify-between">
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

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 items-center">
          <div className="w-full max-w-[560px] mx-auto relative">
            <Input
              placeholder="Search book"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/books');
              }}
              className="rounded-full pl-10"
            />
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          </div>
        </div>

        {/* Desktop Cart + User */}
        <div className="hidden md:flex items-center gap-sm relative">
          <button className="relative border-none bg-white flex items-center justify-center size-12" onClick={() => navigate('/cart')}>
            <Icon icon="ic:round-shopping-bag" className="size-10 text-neutral-950" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
              {quantity ?? 0}
            </span>
          </button>
          {token && user ? (
            <>
              <button onClick={() => setOpenDesktop((v) => !v)} className="inline-flex items-center gap-xxs px-md py-xxs bg-white rounded-full">
                <img src={user.avatar || avatarUser} alt={user.name} className="size-8 rounded-full object-cover" />
                {displayName && (
                  <span className="text-md font-bold text-neutral-950">{displayName}</span>
                )}
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
            <Icon icon="ic:round-shopping-bag" className="size-7 text-neutral-950" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
              {quantity ?? 0}
            </span>
          </div>

          {/* Avatar for logged-in, Hamburger for guest */}
          {token && user ? (
            <button className="bg-white border-none flex items-center justify-center size-11 cursor-pointer" onClick={() => setOpenMobile((v) => !v)}>
              <img src={user.avatar || avatarUser} alt={user.name} className="size-8 rounded-full object-contain" />
            </button>
          ) : (
            <button className="rounded-full bg-white flex items-center justify-center size-8 cursor-pointer" onClick={() => setOpenMobile((v) => !v)}>
              <Icon icon="mdi:menu" className="size-7 text-neutral-950" />
            </button>
          )}

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
