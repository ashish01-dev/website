# 🚀 JEEIFY — JEE 2027 Command Center

A modern, all-in-one **JEE preparation platform** built with Next.js, TypeScript, and Supabase.

JEEIFY helps aspirants plan, track, and optimize their preparation with tools like syllabus tracking, smart roadmaps, timetable planning, analytics, pomodoro sessions, and test analysis — all in one clean dashboard experience.

🌐 **Live Demo:** https://website-ten-hazel-i2529c4pzf.vercel.app

---

## ✨ Features

- 📚 **Syllabus Tracker**
  - Track chapter/topic completion for Physics, Chemistry, and Maths.
- 🗺️ **Smart Roadmap**
  - Personalized preparation flow based on your target and pace.
- 🗓️ **Hourly Timetable Planner**
  - Plan daily/weekly study blocks with clarity.
- 📈 **Progress Analytics**
  - Monitor completion trends and performance insights.
- ⏱️ **Pomodoro Timer**
  - Stay focused with session-based deep work cycles.
- 📝 **Test Analyzer**
  - Record scores, identify weak areas, and improve steadily.
- 🔐 **Google Sign-in + Cloud Sync**
  - Supabase auth + sync, with local-first experience via IndexedDB.

---

## 🧱 Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **UI/Styling:** Tailwind CSS
- **State Management:** Zustand
- **Animation:** Framer Motion
- **Database/Auth/Sync:** Supabase
- **Local Storage:** Dexie (IndexedDB)

---

## 📂 Project Structure

```text
.
├── src/                      # App source code
├── public/                   # Static assets
├── master_syllabus_tracker/  # Syllabus-related data/modules
├── roadmap_pacing/           # Roadmap + pacing logic/data
├── progress_analytics/       # Analytics logic/data
├── midnight_tech/            # Project-specific modules/assets
├── jee_2027_logo/            # Branding assets
├── supabase-schema.sql       # Supabase schema
├── JEE-2027-Tracker-Master-Plan.md
└── package.json
```

---

## ⚙️ Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/ashish01-dev/website.git
cd website
```

### 2) Install dependencies

```bash
npm install
```

### 3) Setup environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Keep your keys safe. Never commit secrets.

### 4) Run development server

```bash
npm run dev
```

Now open `http://localhost:3000`.

---

## 📜 Available Scripts

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run start` — run production server
- `npm run lint` — run lint checks

---

## 🔄 Data & Sync Model

This project uses a **local-first** flow:

1. User data is stored locally via IndexedDB (Dexie).
2. Supabase authentication identifies the user.
3. Data is synced between local store and cloud for persistence across devices.

This gives fast UI interactions with cloud backup support.

---

## 🚢 Deployment

The app is deployed on **Vercel**.

To deploy your own:

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add required environment variables.
4. Deploy.

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 🛣️ Roadmap Ideas

- AI-powered revision recommendations
- Advanced test trend predictions
- Group study / collaboration mode
- Richer analytics dashboards

---

## 👨‍💻 Author

Built with ❤️ by **Ashish**

- GitHub: [@ashish01-dev](https://github.com/ashish01-dev)

---

## 📄 License

This project currently has **no license file**.
If you want open-source usage permissions, add a `LICENSE` (for example, MIT).
