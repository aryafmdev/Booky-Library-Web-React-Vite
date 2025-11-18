import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Recommendation from "../components/Recommendation";
import Authors from "../components/Authors";
import Footer from "../components/Footer";

import fictionImg from "../assets/images/fiction.png";
import nonFictionImg from "../assets/images/non-fiction.png";
import selfImprovementImg from "../assets/images/self-improvement.png";
import financeImg from "../assets/images/finance.png";
import scienceImg from "../assets/images/science.png";
import educationImg from "../assets/images/education.png";

import image01 from "../assets/images/image01.png";
import image02 from "../assets/images/image02.png";
import image03 from "../assets/images/image03.png";
import image04 from "../assets/images/image04.png";
import image05 from "../assets/images/image05.png";
import image06 from "../assets/images/image06.png";
import image07 from "../assets/images/image07.png";
import image08 from "../assets/images/image08.png";
import image09 from "../assets/images/image09.png";
import image10 from "../assets/images/image10.png";

import authorImg from "../assets/images/author.png";
import bookIcon from "../assets/icons/book-icon.png";

function Home() {
  const categories = [
    { label: "Fiction", image: fictionImg },
    { label: "Non-Fiction", image: nonFictionImg },
    { label: "Self-Improvement", image: selfImprovementImg },
    { label: "Finance", image: financeImg },
    { label: "Science", image: scienceImg },
    { label: "Education", image: educationImg },
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
    rating: "4.9",
    cover: images[i],
  }));

  const authors = Array.from({ length: 4 }).map((_, i) => ({
    id: i + 1,
    name: "Author name",
    icon: bookIcon,
    books: 5,
    avatar: authorImg,
  }));

  return (
    <div className="min-h-screen bg-neutral-25 text-neutral-900 font-sans">
      {/* Header (styling tetap sama) */}
      <Header />

      {/* Main content (styling dan struktur tetap sama) */}
      <main className="px-4xl py-3xl">
        <Hero />

        <Categories categories={categories} />

        <Recommendation books={books} />

        <Authors authors={authors} />
      </main>

      {/* Footer (styling tetap sama) */}
      <Footer />
    </div>
  );
}

export default Home;
