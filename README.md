# LocalFix - Hyperlocal Worker Services Platform

**LocalFix** is a modern, responsive hyperlocal marketplace connecting homeowners and businesses with verified local service workers — including electricians, plumbers, painters, cleaners, carpenters, and more.

---

## 🌟 Key Features (Initial Release)

- **Hero & Location Search**: Instant search by service specialty and neighborhood/locality with quick filters.
- **Top 5 Core Services**:
  - 🔧 **Plumbing**: Leak repairs, pipe fittings, drain cleaning, water heater service.
  - ⚡ **Electrical**: Circuit breakers, wiring, appliance installations, lighting fixtures.
  - 🎨 **Painting**: Interior wall painting, exterior coating, touch-ups, stain removal.
  - 🧹 **Cleaning**: Deep home cleaning, post-renovation sanitizing, move-in/out care.
  - 🪚 **Carpentry**: Custom cabinetry, furniture repair, door hanging, trim work.
- **Worker Directory**: Verified local profiles featuring customer ratings, completed job counts, hourly rates, and average response times.
- **Interactive Booking Flow**: Modal for instant service quote requests with scheduling details.
- **Worker Onboarding**: Dedicated "Become a Worker" registration flow for local pros.
- **Responsive Design**: Mobile-first design crafted with Tailwind CSS v4 and Plus Jakarta Sans typography.

---

## 🚀 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion

---

## 💻 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or newer) and npm installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd localfix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## 📂 Project Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── index.html                # App entry HTML with meta & fonts
├── metadata.json             # Applet metadata configuration
├── package.json              # Dependencies and npm scripts
├── README.md                 # Project documentation
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── src/
    ├── main.tsx              # React mounting entry point
    ├── App.tsx               # Root application view
    ├── index.css             # Tailwind base & global styles
    ├── types.ts              # TypeScript models for workers and services
    ├── data/
    │   └── mockData.ts       # Sample services, workers, and neighborhoods
    ├── components/
    │   ├── Navbar.tsx        # Top navigation bar with action CTA
    │   ├── Hero.tsx          # Hero banner with service & location search
    │   ├── ServiceCards.tsx  # Core 5 trade cards with visual imagery
    │   ├── WorkerDirectory.tsx # Verified local worker cards & booking triggers
    │   ├── BookingModal.tsx  # Interactive service booking & quote modal
    │   ├── BecomeWorkerModal.tsx # Worker onboarding modal
    │   ├── HowItWorks.tsx    # 3-step platform workflow
    │   └── Footer.tsx        # Clean bottom footer with links & guarantees
    └── assets/
        └── images/           # Generated high-resolution trade images
```

---

## 🗺️ Roadmap

- [ ] User authentication (Customer & Worker accounts)
- [ ] Real-time geolocation and GPS-based nearest worker dispatch
- [ ] In-app chat and quote negotiation
- [ ] Payment gateway integration (Stripe / UPI / Local wallets)
- [ ] Review and verified rating system with photo proof

---

## 📄 License

Apache-2.0 or MIT
