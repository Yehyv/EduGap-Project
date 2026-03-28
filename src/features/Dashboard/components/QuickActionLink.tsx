import { Link } from "react-router-dom";

const QuickActionLink = ({ to, label, icon: Icon, color, lang }) => (
  <Link
    className={`group relative overflow-hidden ${color} text-white text-sm font-bold rounded-2xl px-5 py-3.5 flex items-center justify-between w-full shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}
    to={to}
  >
    <span className="relative z-10">{label}</span>
    <Icon
      className={`w-5 h-5 relative z-10 transform group-hover:rotate-90 transition-transform duration-300 ${lang === "ar" ? "me-2" : "ms-2"}`}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
  </Link>
);
export default QuickActionLink;
