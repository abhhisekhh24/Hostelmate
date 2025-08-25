
# Hostelmate

A modern web application built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS** to make hostel life easier.  
Hostelmate offers a seamless experience for students to manage their daily needs, meals, and communication in a simple and intuitive interface.

🌐 **Live Site:** [https://hostelmate.xyz](https://hostelmate.xyz)

---

## 🚀 Features
- ⚡ **Fast Frontend:** Powered by [Vite](https://vitejs.dev/) for lightning-fast development and builds.  
- 🎨 **Modern UI:** Styled with [Tailwind CSS](https://tailwindcss.com/) and Radix UI components.  
- 🔐 **Authentication:** Secure login and signup with [Supabase](https://supabase.com/).  
- 🗄️ **Database-Backed:** Real-time data syncing via Supabase.  
- 📱 **Responsive Design:** Fully responsive and mobile-friendly.  
- 🛠️ **TypeScript First:** Type-safe codebase for maintainability.  

---

## 🛠️ Tech Stack
| Technology           | Purpose                         |
|----------------------|---------------------------------|
| Vite                 | Frontend build tool            |
| React                | UI library                     |
| TypeScript           | Type safety                    |
| Tailwind CSS         | Utility-first styling          |
| Radix UI + Shadcn/UI | Accessible, customizable UI    |
| Supabase             | Auth, database, and APIs       |
| ESLint + Prettier    | Code quality and formatting    |

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/hostelmate.git
cd hostelmate
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root:  
```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 4. Start Development Server
```bash
npm run dev
```
Your app will run at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Supabase Integration
- Go to [Supabase](https://supabase.com/) and create a project.
- Add your **project URL** and **anon key** to the `.env` file.
- Ensure you whitelist `http://localhost:5173` in the Supabase Auth settings for local testing.

---

## 🏗️ Build for Production
```bash
npm run build
npm run preview
```
This generates an optimized build in the `dist/` folder.

---

## 🧾 Scripts
| Command              | Description                        |
|----------------------|------------------------------------|
| `npm run dev`        | Start the development server       |
| `npm run build`      | Build for production               |
| `npm run preview`    | Preview the production build       |
| `npm run lint`       | Run ESLint for code quality checks |

---

## 📂 Project Structure
```
hostelmate/
├── public/           # Static assets
├── src/              # Application source code
│   ├── components/   # Reusable components
│   ├── pages/        # Page-level components
│   ├── supabaseClient.ts # Supabase config
│   └── main.tsx      # App entry point
├── index.html        # HTML template
├── tailwind.config.ts# Tailwind configuration
├── vite.config.ts    # Vite configuration
└── package.json      # Project metadata
```

---

## 🛡️ Code Quality
- **ESLint** ensures consistent coding standards.
- **Prettier** formats code for readability.
- **TypeScript** provides static type checking.

---

## 📜 License
This project is licensed under the **MIT License**.  
Feel free to use, modify, and share with attribution.
