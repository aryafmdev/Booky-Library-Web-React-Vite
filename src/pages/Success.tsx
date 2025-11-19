import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export default function Success() {
  const navigate = useNavigate();
  const returnText = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, []);
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4xl py-3xl text-center">
        <div className="size-20 rounded-full bg-primary-100 flex items-center justify-center">
          <div className="size-14 rounded-full bg-primary-300 text-white flex items-center justify-center text-3xl">✓</div>
        </div>
        <h1 className="mt-lg text-xl md:text-2xl font-bold text-neutral-950">Borrowing Successful!</h1>
        <p className="mt-xxs text-sm md:text-md text-neutral-700">Your book has been successfully borrowed. Please return it by <span className="text-red-600 font-semibold">{returnText}</span></p>
        <Button className="mt-md rounded-full bg-primary-300 text-white font-bold" onClick={() => navigate('/profile?tab=loans')}>See Borrowed List</Button>
      </main>
      <Footer />
    </>
  );
}