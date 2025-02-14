# **Miden Web**  

[![Deploy](https://img.shields.io/badge/Deployed-Miden%20Web-blue?style=flat-square)](https://miden.wind.app)  

## 🚀 **Live URL**  
🔗 [Miden Web](https://miden.wind.app)  

## 📖 **Overview**  
Miden Web is a modern **React + TypeScript** application powered by **Vite** for fast development and optimized performance. It uses **Tailwind CSS** for styling and follows a structured, modular approach for scalability.  

---

## ⚡ **Getting Started**  

### **1️⃣ Prerequisites**  
Ensure you have the following installed before running the project:  
- **Node.js** (Latest LTS recommended)  
- **npm** (Comes with Node.js) or **yarn**  

### **2️⃣ Installation**  
Clone the repository and install dependencies:  
```sh
git clone https://github.com/0xavalon/miden-web.git  
cd miden-web  
npm install  # or yarn install
```  

### **3️⃣ Running the Development Server**  
```sh
npm run dev  # or yarn dev
```  
The app will be available at:  
🔗 **http://localhost:5173**  

---

## 🏗 **Build for Production**  
To generate an optimized production build:  
```sh
npm run build  # or yarn build
```  
This will create a `dist/` folder with the optimized output.  

To preview the production build locally:  
```sh
npm run preview  # or yarn preview
```  

---

## 📂 **Project Structure**  
```
miden-web/
│── src/                 # Source code  
│   ├── assets/          # Static assets (images, icons, etc.)  
│   │   └── images/      # Image files  
│   ├── components/      # Reusable UI components  
│   ├── utils/           # Utility functions  
│   ├── App.tsx         # Main App component  
│   ├── index.tsx       # Entry point  
│── styles.css          # Global styles  
│── .env                # Environment variables  
│── .eslintrc.json      # ESLint configuration  
│── .gitignore          # Files to ignore in Git  
│── README.md           # Documentation  
│── index.html          # Main HTML file  
│── package.json        # Dependencies & scripts  
│── postcss.config.ts   # PostCSS configuration  
│── tailwind.config.ts  # Tailwind CSS configuration  
│── tsconfig.json       # TypeScript configuration  
│── vite.config.ts      # Vite configuration  
```

---

## 🔧 **Available Scripts**  

| Command              | Description |
|----------------------|-------------|
| `npm run dev`       | Start the development server |
| `npm run build`     | Build the app for production |
| `npm run preview`   | Preview the production build |
| `npm run lint`      | Run ESLint for code quality |
| `npm run format`    | Format code using Prettier (if configured) |

---

## 🎨 **Styling**  
- **Tailwind CSS** is used for styling.  
- Global styles are in `styles.css`.  
- Tailwind configuration: `tailwind.config.ts`.  

---

## 🚀 **Deployment**  
Miden Web is deployed on **Wind.app**. To manually deploy:  
```sh
npm run build  
```
Then upload the `dist/` folder to your hosting provider.

---

## 🛠 **Tech Stack**  
- **Frontend**: Vite + React + TypeScript  
- **Styling**: Tailwind CSS + PostCSS  
- **Linting & Formatting**: ESLint, Prettier  
- **Deployment**: Vercel / Wind.app  
