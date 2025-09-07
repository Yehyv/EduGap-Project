// src/shared/localization/translations.ts
const translations = {
  en: {
    hello: "Hello",
    welcome: "Welcome to our website",
  },
  ar: {
    hello: "مرحبًا",
    welcome: "أهلاً بك في موقعنا",
  },
} as const; // 👈 مهم عشان TypeScript يفهم الـ keys ثابتة

export default translations;
