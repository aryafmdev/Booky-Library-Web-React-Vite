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
import { useQuery } from "@tanstack/react-query";
import { apiGetCategories, apiGetRecommendedBooks, apiGetAuthors, type Category, type Book, type Author } from "../lib/api";

function Home() {
  const imageMap: Record<string, string> = {
    "Fiction": fictionImg,
    "Non-Fiction": nonFictionImg,
    "Self-Improvement": selfImprovementImg,
    "Finance": financeImg,
    "Science": scienceImg,
    "Education": educationImg,
  };

  const { data: apiCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: apiGetCategories,
  });

  const { data: recoBooks = [] } = useQuery<Book[]>({
    queryKey: ["books", "recommend"],
    queryFn: apiGetRecommendedBooks,
  });

  const categories = (apiCategories || []).map((c) => ({
    id: c.id,
    name: c.name,
    image: imageMap[c.name] || undefined,
  }));

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

  const books = (recoBooks || []).map((b, i) => ({
    id: b.id,
    title: b.title,
    author: b.author.name,
    rating: "4.9",
    cover: b.cover_image || images[i % images.length],
  }));

  const { data: apiAuthors = [] } = useQuery<Author[]>({
    queryKey: ["authors"],
    queryFn: apiGetAuthors,
  });

  const authors = (apiAuthors || []).map((a) => ({
    id: Number(a.id),
    name: a.name,
    icon: bookIcon,
    books: a.books ?? 0,
    avatar: a.avatar || authorImg,
  }));

  return (
    <div className="min-h-screen bg-neutral-25 text-neutral-900 font-sans">
      <Header />
      <main className="px-4xl py-3xl">
        <Hero />
        <Categories categories={categories} />
        <Recommendation books={books} />
        <Authors authors={authors} />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
