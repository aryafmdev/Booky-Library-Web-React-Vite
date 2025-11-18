import Header from "../components/Header";
import Footer from "../components/Footer";
import StickyActionBar from "../components/StickyActionBar";
import ReviewCard from "../components/ReviewCard";
import RelatedBookCard from "../components/RelatedBookCard";
import bookCover from "../assets/images/book-detail.png";
import image01 from "../assets/images/image01.png";
import image02 from "../assets/images/image02.png";
import image03 from "../assets/images/image03.png";
import image04 from "../assets/images/image04.png";
import image05 from "../assets/images/image05.png";
import { Icon } from "@iconify/react";

export default function BookDetail() {
  return (
    <>
      <Header />

      <main className="relative pb-[96px] pt-4 px-4xl ">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-3 md:mb-5">
          Home &gt; Business & Economics &gt; The Psychology of Money
        </nav>

        {/* Book Info */}
        <section className="flex flex-col md:flex-row gap-5 md:gap-10">
          <img
            src={bookCover}
            alt="The Psychology of Money"
            className="w-full md:w-[337px] rounded-xl shadow-sm"
          />

          <div className="space-y-2 md:space-y-3">
            <span className="inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700">
              Business & Economics
            </span>

            <h1 className="text-xl md:text-2xl font-bold text-neutral-950 leading-tight">
              The Psychology of Money
            </h1>

            <p className="text-sm text-neutral-700">Morgan Housel</p>

            <div className="inline-flex items-center gap-xxs text-sm font-semibold text-neutral-900">
              <Icon icon="mdi:star" className="size-4 text-yellow-500" />
              <span>4.9</span>
            </div>

            <div className="mt-sm flex gap-2xl text-neutral-950">
              {[
                { label: "Pages", value: "320" },
                { label: "Rating", value: "212" },
                { label: "Reviews", value: "179" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-start">
                  <span className="text-lg font-bold">{item.value}</span>
                  <span className="text-xs text-neutral-500">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="my-sm h-px bg-neutral-200" />

            <p className="text-sm font-bold text-neutral-950">Description</p>
            <p className="text-sm leading-normal text-neutral-700">
              “The Psychology of Money” explores how emotions, biases, and human behavior shape the way we think about money, investing, and financial decisions. Morgan Housel shares timeless lessons on wealth, greed, and happiness, showing that financial success is not about knowledge, but about behavior.
            </p>

            {/* Desktop Buttons */}
            <div className="hidden md:flex gap-3 pt-3 items-center">
              <button className="px-lg py-sm rounded-full bg-white text-neutral-950 font-bold border border-neutral-200">
                Add to Cart
              </button>
              <button className="px-lg py-sm rounded-full bg-primary-300 text-white font-bold">
                Borrow Book
              </button>
              <button className="size-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-neutral-700">
                <Icon icon="mdi:share-variant" className="size-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-8 md:mt-12">
          <h2 className="text-base md:text-lg font-bold text-neutral-950 mb-3">
            Review
          </h2>
          <h2 className="text-base md:text-lg font-bold text-neutral-950 mb-3">
            ⭐ 4.9 (24 Ulasan)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ReviewCard key={i} />
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button className="rounded-full text-neutral-950 border border-neutral-200 bg-white px-lg py-sm text-sm font-bold">
              Load More
            </button>
          </div>
        </section>

        {/* Related Books */}
        <section className="mt-10 md:mt-14">
          <h2 className="text-base md:text-lg font-bold text-neutral-950 mb-3">
            Related Books
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <RelatedBookCard title="Book Name" cover={image01} />
            <RelatedBookCard title="Book Name" cover={image02} />
            <RelatedBookCard title="Book Name" cover={image03} />
            <RelatedBookCard title="Book Name" cover={image04} />
            <RelatedBookCard title="Book Name" cover={image05} />
          </div>
        </section>
      </main>

      <Footer />
      <StickyActionBar />
    </>
  );
}
