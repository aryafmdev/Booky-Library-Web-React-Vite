import logoBooky from '../assets/images/logo-booky.png';
import { Icon } from '@iconify/react';
import { useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user } = useSelector((s: RootState) => s.auth);
  const isAdmin =
    /admin/i.test(String(user?.role ?? '')) ||
    String(user?.email ?? '').toLowerCase() === 'admin@library.local';
  if (isAdmin) return null;

  return (
    <footer className='w-full border-t border-neutral-200 px-4xl py-3xl mt-6xl text-center'>
      {isHome ? (
        <a href='#hero' className='inline-block'>
          <img src={logoBooky} alt='Booky Logo' className='h-8 w-auto' />
        </a>
      ) : (
        <HashLink smooth to='/#hero' className='inline-block'>
          <img src={logoBooky} alt='Booky Logo' className='h-8 w-auto' />
        </HashLink>
      )}
      <p className='mt-sm text-sm md:text-md font-semibold text-neutral-950'>
        Discover inspiring stories & timeless knowledge, ready to borrow
        anytime. Explore online or visit our nearest library branch.
      </p>
      <div className='my-3xl flex flex-col items-center text-center text-neutral-700'>
        <p className='text-md font-bold text-neutral-950 mb-sm'>
          Follow on Social Media
        </p>
        <div className='flex gap-md'>
          <Button variant='outline' size='icon' className='rounded-full'>
            <Icon icon='ri:facebook-fill' className='size-6 text-neutral-950' />
          </Button>
          <Button variant='outline' size='icon' className='rounded-full'>
            <Icon icon='mdi:instagram' className='size-6 text-neutral-950' />
          </Button>
          <Button variant='outline' size='icon' className='rounded-full'>
            <Icon icon='ri:linkedin-fill' className='size-6 text-neutral-950' />
          </Button>
          <Button variant='outline' size='icon' className='rounded-full'>
            <Icon
              icon='ic:baseline-tiktok'
              className='size-6 text-neutral-950'
            />
          </Button>
        </div>
      </div>
      <p className='mt-3xl text-xs md:text-sm text-neutral-950'>
        © 2025 Library Web · Developed by AryaFMDev
      </p>
    </footer>
  );
}
