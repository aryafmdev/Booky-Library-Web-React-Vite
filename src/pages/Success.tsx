import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const { borrowDate: routeBorrowDate, duration: routeDuration } = (location.state ?? {}) as { borrowDate?: string; duration?: number };
  const returnText = useMemo(() => {
    const base = routeBorrowDate ? new Date(routeBorrowDate) : new Date();
    const addDays = typeof routeDuration === 'number' && routeDuration > 0 ? routeDuration : 3;
    base.setDate(base.getDate() + addDays);
    return base.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [routeBorrowDate, routeDuration]);
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4xl py-3xl text-center">
        <div className="relative flex items-center justify-center md:mb-10">
          <div className="absolute rounded-full border border-primary-100 size-24 md:size-40" />
          <div className="absolute rounded-full border border-primary-100 size-28 md:size-48" />
          <div className="absolute rounded-full border border-primary-100 size-32 md:size-56" />
          <div className="size-20 md:size-28 rounded-full bg-primary-300 text-white flex items-center justify-center text-3xl md:text-4xl">✓</div>
        </div>
        <h1 className="mt-4xl text-xl md:text-2xl font-bold text-neutral-950">Borrowing Successful!</h1>
        <p className="mt-xxs text-sm md:text-md text-neutral-700">Your book has been successfully borrowed. Please return it by <span className="text-red-600 font-semibold">{returnText}</span></p>
        <Button className="mt-md rounded-full bg-primary-300 text-white font-bold px-xl md:px-2xl hover:bg-primary-400" onClick={() => navigate('/profile?tab=loans')}>See Borrowed List</Button>
      </main>
      <Footer />
    </>
  );
}