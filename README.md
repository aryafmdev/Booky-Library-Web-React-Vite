# 📚 Library Web App

A modern, scalable **React + TypeScript + Vite** Library Web Application built with atomic design principles.  
This project is designed to be **audit‑ready**, mentor‑compatible, and focused on clean architecture.

---

## 🌐 Live Demo

👉 Try the application here: [Booky Library Web](https://booky-library-web.vercel.app/)

Use the following dummy account to log in and explore the features:

- **Email:** `johndoe@example.com`
- **Password:** `123456`

---

## ✨ Features

- 🔐 Authentication (Register, Login, Forgot Password)
- 📖 Book List with search & filter
- 📚 Book Detail with stock & reviews
- 📝 Borrow books with optimistic update
- 📂 User Loans & Profile
- 🛒 Optional Cart & Checkout
- 🎨 Responsive UI (Mobile ≤393px, Desktop ≥md)

---

## 🛠 Tech Stack

- ⚛️ **React + TypeScript + Vite** → core framework & dev server
- 🎨 **Tailwind CSS + shadcn/ui** → styling & UI components
- 🔄 **Redux Toolkit** → global auth state (token, user info)
- 📡 **TanStack Query** → API fetching & caching
- ⏰ **Day.js** → date formatting & validation
- 🎬 **Framer Motion (optional)** → animations
- 🌐 **Swagger API** → core backend (auth, books, loans, reviews, profile, cart)
- 📚 **Open Library API** → extra metadata (cover, description, ISBN)
- 🛠 **React Router DOM** → multi‑page routing (Login, Register, Book List, Book Detail, Loans, Profile, Cart)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/library-web-app.git
cd library-web-app
2. Install dependencies
bash
npm install
3. Environment setup
Create a .env.local file and configure your keys:

env
VITE_API_BASE_URL=https://be-library-api-xh3x6c5iiq-et.a.run.app/api
VITE_OPEN_LIBRARY_API=https://openlibrary.org
(See .env.example for full list of variables.)

4. Run the development server
bash
npm run dev
App will be available at: 👉 http://localhost:5173 (React + Vite default port)

5. Build for production
bash
npm run build
npm run preview
🔑 Dummy Account for Testing
Use this account to explore the app:

Email: johndoe@example.com

Password: 123456

✅ Verification
Run npm run lint && npm run build before pushing changes.

All commits follow Conventional Commit style.

Styling integrity preserved; only logic/data updated when necessary.

📌 Notes
Default category fallback: Fiction, Non-Fiction, Self-Growth, Finance, Science, Education.

Borrow date in Checkout is restricted to today onwards.

Search in header (mobile & desktop) routes to /categories/<slug>.

🤝 Contribution
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

📜 License
This project is licensed under the MIT License.
```
