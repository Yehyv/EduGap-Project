import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // لازم تضيف الـ paths عشان Tailwind يعرف يـscan
  ],
  experimental: {
    logical: true, // عشان ts / te / bs / be يشتغلوا
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
