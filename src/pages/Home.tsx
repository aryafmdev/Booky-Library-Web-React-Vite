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
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearJustLoggedOut } from "../features/auth/authSlice";
import type { AppDispatch } from "../app/store";

function Home() {
  // Fixed categories per design
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(clearJustLoggedOut());
  }, [dispatch]);

  useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: apiGetCategories,
  });

  const { data: recoBooks = [] } = useQuery<Book[]>({
    queryKey: ["books", "recommend"],
    queryFn: apiGetRecommendedBooks,
  });

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const desired = [
    { name: "Fiction", image: fictionImg },
    { name: "Non-Fiction", image: nonFictionImg },
    { name: "Self-Growth", image: selfImprovementImg },
    { name: "Finance", image: financeImg },
    { name: "Science", image: scienceImg },
    { name: "Education", image: educationImg },
  ];
  const categories = desired.map((d) => ({
    id: String(normalize(d.name)),
    name: d.name,
    image: d.image,
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

  const desiredCount = 10;
  const books = Array.from({ length: desiredCount }, (_, i) => ({
    id: i + 1,
    title: `Book Name ${i + 1}`,
    author: "Author name",
    rating: "4.9",
    cover: (recoBooks[i]?.cover_image) || images[i % images.length],
  }));

  const { data: apiAuthors = [] } = useQuery<Author[]>({
    queryKey: ["authors"],
    queryFn: apiGetAuthors,
  });

  const authorDesiredCount = 4;
  const authorsMapped = (apiAuthors || []).slice(0, authorDesiredCount).map((a, i) => ({
    id: Number(a.id ?? i + 1),
    name: "Author name",
    icon: bookIcon,
    books: 5,
    avatar: a.avatar || authorImg,
  }));
  const authorPlaceholders = Array.from({ length: Math.max(0, authorDesiredCount - authorsMapped.length) }).map((_, idx) => ({
    id: -2000 - idx,
    name: "Author name",
    icon: bookIcon,
    books: 5,
    avatar: authorImg,
  }));
  const authors = [...authorsMapped, ...authorPlaceholders];

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
