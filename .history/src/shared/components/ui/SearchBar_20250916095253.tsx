import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";

const SearchBar = ({
  placeholder,
  lang,
  className = "",
}: {
  placeholder: string;
  lang: string;
  className?: string;
}) => (
  <div className={`relative text-gray-600 flex-1 ${className}`}>
    <input
      className="border border-[#8A8A8A] w-full h-8 px-2 pr-10 rounded-lg text-sm focus:outline-none"
      type="search"
      name="search"
      placeholder={placeholder}
      dir={lang === "ar" ? "rtl" : "ltr"}
    />
    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
      <SearchIcon className="w-10 h-4" />
    </button>
  </div>
);

export default SearchBar;
