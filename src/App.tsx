// import React from "react";

function App() {
  const categories = [
    { label: "Fiction", icon: "📚" },
    { label: "Non-Fiction", icon: "📖" },
    { label: "Self-Improvement", icon: "🌱" },
    { label: "Finance", icon: "💰" },
    { label: "Science", icon: "🔬" },
    { label: "Education", icon: "🎓" },
  ];

  const books = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: "Book Name",
    author: "Author name",
    rating: "4.9",
    cover: `https://picsum.photos/seed/book-${i}/300/450`,
  }));

  const authors = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: "Author name",
    books: 5,
    avatar: `https://i.pravatar.cc/100?img=${i + 10}`,
  }));

  return (
    <div className="min-h-screen bg-neutral-25 text-neutral-900 font-sans">
      <header className="w-full border-b border-neutral-200 px-4xl py-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-300 text-white">★</span>
            <span className="text-lg font-bold">Booky</span>
          </div>
          <div className="hidden md:flex items-center gap-sm">
            <button className="px-xl py-sm bg-white text-neutral-900 rounded-full border border-neutral-200">Login</button>
            <button className="px-xl py-sm bg-primary-300 text-white rounded-full">Register</button>
          </div>
          <div className="md:hidden flex items-center gap-sm">
            <span className="h-8 w-8 rounded-full bg-white border border-neutral-200 inline-flex items-center justify-center">🔍</span>
            <span className="h-8 w-8 rounded-full bg-white border border-neutral-200 inline-flex items-center justify-center">❤️</span>
          </div>
        </div>
      </header>

      <main className="px-4xl py-3xl">
        <section className="rounded-xl overflow-hidden bg-gradient-to-r from-primary-200 to-primary-300 p-4xl text-white">
          <h1 className="text-display-xl font-extrabold text-center">Welcome to Booky</h1>
        </section>

        <section className="mt-3xl">
          <div className="flex gap-md overflow-x-auto pb-sm">
            {categories.map((c) => (
              <div key={c.label} className="min-w-[120px] rounded-lg border border-neutral-200 bg-white px-md py-sm flex items-center gap-sm shadow-sm">
                <span className="h-8 w-8 rounded-md bg-neutral-100 flex items-center justify-center">{c.icon}</span>
                <div className="text-sm text-neutral-700">{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4xl">
          <h2 className="text-display-md font-semibold text-neutral-800">Recommendation</h2>
          <div className="mt-xl grid grid-cols-2 md:grid-cols-5 gap-2xl">
            {books.map((b) => (
              <div key={b.id} className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
                <div className="aspect-[2/3] bg-neutral-100">
                  <img src={b.cover} alt={b.title} className="h-full w-full object-cover" />
                </div>
                <div className="px-md py-sm">
                  <div className="text-sm font-semibold">{b.title}</div>
                  <div className="text-xs text-neutral-600">{b.author}</div>
                  <div className="mt-xs text-xs text-neutral-700 inline-flex items-center gap-xxs">
                    <span>⭐</span>
                    <span>{b.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3xl flex items-center justify-center">
            <button className="rounded-full text-neutral-900 border border-neutral-200 bg-white px-xl py-sm text-sm">Load More</button>
          </div>
        </section>

        <section className="mt-4xl">
          <h2 className="text-display-md font-semibold text-neutral-800">Popular Authors</h2>
          <div className="mt-xl grid grid-cols-1 md:grid-cols-5 gap-2xl">
            {authors.map((a) => (
              <div key={a.id} className="rounded-lg border border-neutral-200 bg-white p-md flex items-center gap-md">
                <img src={a.avatar} alt={a.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="text-xs text-neutral-600">{a.books} books</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-neutral-200 px-4xl py-3xl mt-6xl text-center">
        <div className="text-display-xs font-bold text-primary-300">Booky</div>
        <p className="mt-sm text-sm text-neutral-600">Discover inspiring stories & timeless knowledge, ready to borrow anytime. Explore online or visit our nearest library branch.</p>
        <div className="mt-md flex items-center justify-center gap-md text-neutral-700">
          <span className="h-8 w-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center">f</span>
          <span className="h-8 w-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center">x</span>
          <span className="h-8 w-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center">in</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
