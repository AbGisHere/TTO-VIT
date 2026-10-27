# TTO Website & Technology Brief Portal

Technology Transfer Office (TTO) official platform for VIT Innovation. Built with **React 18, Vite, TypeScript, Tailwind CSS**, and powered by **Firebase** (Auth, Firestore, Cloud Storage, Hosting).

---

## 🚀 Key Features

* **Authentication & Role-Based Access:**
  * Google Authentication.
  * Automatic domain tagging (`@vitstudent.ac.in` $\rightarrow$ VIT Student, `@vit.ac.in` $\rightarrow$ Faculty, external domains $\rightarrow$ Outside User).
  * Elevated administrative roles: `master_admin` & `tb_admin` (Technology Brief Admin).
* **Technology Brief Generator (`/upload-tb`):**
  * Admin form to enter patent details, problem statement, solution, TRL level, market potential, and upload diagrams/images.
  * Real-time preview and programmatic PDF generation matching official institutional design templates.
  * Data synced to Cloud Firestore and assets stored in Cloud Storage.
* **Technology Brief Showcase (`/tb`):**
  * Public/internal showcase of all published technology briefs with search, domain filtering, and PDF download.

---

## 🛠 Tech Stack

* **Frontend:** React 18, Vite, TypeScript
* **Styling:** Tailwind CSS, Lucide Icons
* **Backend & Infrastructure:** Firebase (`innovation-vit`)
  * Firebase Hosting: [`https://innovation-vit-tto.web.app`](https://innovation-vit-tto.web.app)
  * Firebase Authentication (Google Sign-In)
  * Cloud Firestore
  * Cloud Storage
* **PDF Engine:** jsPDF / Canvas / React-PDF

---

## 📦 Setup & Development

### 1. Install dependencies
```bash
pnpm install
```

### 2. Run local dev server
```bash
pnpm dev
```

### 3. Build for production
```bash
pnpm build
```

### 4. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting:tto
```
