import { Link } from 'react-router-dom';
import logoBooky from '../assets/images/logo-booky.png';
import heroImage from '../assets/images/hero-image.png';
import fictionImg from '../assets/images/fiction.png';
import nonFictionImg from '../assets/images/non-fiction.png';
import selfImprovementImg from '../assets/images/self-improvement.png';
import financeImg from '../assets/images/finance.png';
import scienceImg from '../assets/images/science.png';
import educationImg from '../assets/images/education.png';
import image01 from '../assets/images/image01.png';
import image02 from '../assets/images/image02.png';
import image03 from '../assets/images/image03.png';
import image04 from '../assets/images/image04.png';
import image05 from '../assets/images/image05.png';
import image06 from '../assets/images/image06.png';
import image07 from '../assets/images/image07.png';
import image08 from '../assets/images/image08.png';
import image09 from '../assets/images/image09.png';
import image10 from '../assets/images/image10.png';
import authorImg from '../assets/images/author.png';
import bookIcon from '../assets/icons/book-icon.png';
import { Icon } from '@iconify/react';

function Home() {
  const categories = [
    { label: 'Fiction', image: fictionImg },
    { label: 'Non-Fiction', image: nonFictionImg },
    { label: 'Self-Improvement', image: selfImprovementImg },
    { label: 'Finance', image: financeImg },
    { label: 'Science', image: scienceImg },
    { label: 'Education', image: educationImg },
  ];

  const images = [
    image01,
    image02,
    image03,
    image04,
    image05,
    image06,
    image07,
    image08,
    image09,
    image10,
  ];

  const books = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: `Book Name`,
    author: `Author Name`,
    rating: '4.9',
    cover: images[i], // ambil dari array images
  }));

  const authors = Array.from({ length: 4 }).map((_, i) => ({
    id: i + 1,
    name: 'Author name',
    icon: bookIcon,
    books: 5,
    avatar: authorImg,
  }));

  return (
    <div className='min-h-screen bg-neutral-25 text-neutral-900 font-sans'>
      <header
        id='header'
        className='w-full border-b border-neutral-200 px-4xl py-md'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-sm'>
            <a href='#header' className='inline-block'>
              <img src={logoBooky} alt='Booky Logo' className='h-8 md:h-10' />
            </a>
          </div>
          <div className='hidden md:flex items-center gap-sm'>
            <Link
              to='/login'
              className='px-xl py-sm bg-white text-neutral-900 rounded-full border border-neutral-200'
            >
              Login
            </Link>
            <Link
              to='/register'
              className='px-xl py-sm bg-primary-300 text-white rounded-full'
            >
              Register
            </Link>
          </div>
          <div className='md:hidden flex items-center gap-sm'>
            <span className='h-8 w-8 rounded-full bg-white border border-neutral-200 inline-flex items-center justify-center'>
              🔍
            </span>
            <span className='h-8 w-8 rounded-full bg-white border border-neutral-200 inline-flex items-center justify-center'>
              ❤️
            </span>
          </div>
        </div>
      </header>

      <main className='px-4xl py-3xl'>
        <section className='rounded-xl overflow-hidden'>
          <img src={heroImage} alt='Hero' className='w-full object-cover' />
        </section>

        <section className='mt-3xl'>
          <div className='grid grid-cols-3 md:grid-cols-6 gap-md'>
            {categories.map((c) => (
              <div
                key={c.label}
                className='flex flex-col items-center gap-sm bg-white px-md py-md rounded-xl shadow-sm border border-neutral-200'
              >
                <img
                  src={c.image}
                  alt={c.label}
                  className='w-full h-14 md:h-16 object-cover rounded-md'
                />
                <span className='text-xs self-start md:text-sm font-semibold text-neutral-950'>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className='mt-4xl'>
          <h2 className='text-display-lg font-bold text-neutral-950'>
            Recommendation
          </h2>
          <div className='mt-xl grid grid-cols-2 md:grid-cols-5 gap-2xl'>
            {books.map((b) => (
              <div
                key={b.id}
                className='rounded-lg border border-neutral-200 bg-white overflow-hidden'
              >
                <div className='aspect-[2/3] bg-neutral-100'>
                  <img
                    src={b.cover}
                    alt={b.title}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='px-md py-sm'>
                  <div className='text-sm md:text-lg font-bold text-neutral-900'>
                    {b.title}
                  </div>
                  <div className='text-sm md:text-md font-medium text-neutral-700'>
                    {b.author}
                  </div>
                  <div className='mt-xs text-sm md:text-md font-semibold text-neutral-900 inline-flex items-center gap-xxs'>
                    <span>⭐</span>
                    <span>{b.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='mt-3xl flex items-center justify-center'>
            <button className='rounded-full text-neutral-950 border border-neutral-200 bg-white px-xl py-sm text-sm md:text-md font-bold'>
              Load More
            </button>
          </div>
        </section>

        <section className='mt-4xl'>
          <h2 className='text-display-xs md:text-display-lg font-bold text-neutral-950'>
            Popular Authors
          </h2>
          <div className='mt-xl grid grid-cols-1 md:grid-cols-4 gap-xl'>
            {authors.map((a) => (
              <div
                key={a.id}
                className='rounded-lg border border-neutral-200 bg-white p-md flex items-center gap-md'
              >
                <img
                  src={a.avatar}
                  alt={a.name}
                  className='h-12 w-12 rounded-full object-cover'
                />
                <div>
                  <div className='text-sm text-neutral-950 font-semibold'>{a.name}</div>
                  <div className='flex items-center gap-xxs text-xs text-neutral-700'>
                    <img src={a.icon} alt='book icon' className='w-4 h-4' />
                    {a.books} books
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className='w-full border-t border-neutral-200 px-4xl py-3xl mt-6xl text-center'>
        <a href='#header' className='inline-block'>
          <img src={logoBooky} alt='Booky Logo' className='h-8 md:h-10' />
        </a>
        <p className='mt-sm text-sm md:text-md font-semibold text-neutral-950'>
          Discover inspiring stories & timeless knowledge, ready to borrow
          anytime. Explore online or visit our nearest library branch.
        </p>
        <div className='my-3xl flex flex-col items-center text-center text-neutral-700'>
          <p className='text-md font-bold text-neutral-950 mb-sm'>
            Follow on Social Media
          </p>
          <div className='flex gap-md'>
            <span className='size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center'>
              <Icon icon='ri:facebook-fill' className='size-6 text-neutral-950' />
            </span>
            <span className='size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center'>
              <Icon icon='mdi:instagram' className='size-6 text-neutral-950' />
            </span>
            <span className='size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center'>
              <Icon icon='ri:linkedin-fill' className='size-6 text-neutral-950' />
            </span>
            <span className='size-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center'>
              <Icon
                icon='ic:baseline-tiktok'
                className='size-6 text-neutral-950'
              />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
