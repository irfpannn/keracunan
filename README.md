# Keracunan Makanan (Food Safety Guide)

A comprehensive, interactive web application designed to educate the public on food safety, symptom identification, and prevention of food poisoning. This project serves as a digital guide aligned with standards from the Ministry of Health Malaysia (KKM).

![Project Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🌟 Features

### 🚑 Emergency & Assistance
* **Symptom Checker:** Interactive questionnaire to assess severity of food poisoning symptoms (Mild, Moderate, Severe) and provide actionable advice.
* **Clinic Locator:** Searchable database of government clinics and hospitals for treatment.
* **Emergency Contacts:** Quick access to emergency numbers (999) and the National Poison Centre.

### 📚 Education & Prevention
* **5 Keys to Safety:** Detailed guides on cleanliness, separation, cooking, temperature control, and safe ingredients.
* **Bacteria Encyclopedia:** Profiles of common pathogens like Salmonella, E. coli, and Vibrio.
* **High-Risk Foods:** Information on handling meat, seafood, eggs, and dairy safely.

### 🎮 Interactive Learning
* **Fridge Sorting Game:** Drag-and-drop game to teach proper food storage zones in a refrigerator.
* **Food Inspector (Lihat, Hidu, Rasa):** Simulation game to identify spoiled food using sensory cues.
* **Safety Quiz:** Test your knowledge and earn a "Food Safety Hero" score.

### 📍 BeSS Locator
* **Premise Finder:** Interactive map and list to find food premises certified with **BeSS** (Bersih, Selamat, Sihat) status by KKM.

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Tailwind Merge](https://github.com/dcastil/tailwind-merge)
* **UI Components:** * [Radix UI](https://www.radix-ui.com/) (Primitives for Accordions, Dialogs, etc.)
    * [Lucide React](https://lucide.dev/) (Icons)
* **Animations:** [Framer Motion](https://www.framer.com/motion/) & [Tw-Animate-CSS](https://github.com/ikatyang/tw-animate-css)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (Supports English & Malay)
* **Data Handling:** [PapaParse](https://www.papaparse.com/) (CSV parsing for premise data)

## 🚀 Getting Started

### Prerequisites
Ensure you have Node.js installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/irfpannn/keracunan.git](https://github.com/irfpannn/keracunan.git)
    cd keracunan
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```bash
src/
├── app/                 # Next.js App Router pages
│   ├── [locale]/        # Internationalized routes (ms/en)
│   │   ├── bantuan/     # Help/Emergency pages
│   │   ├── belajar/     # Educational content
│   │   └── interaktif/  # Games and Quizzes
├── components/          # React components
│   ├── layout/          # Header, Footer, Nav
│   └── ui/              # Reusable UI elements (Buttons, Cards)
├── lib/                 # Utilities
│   └── i18n/            # Localization setup and message files
└── public/              # Static assets (images, SVGs)
