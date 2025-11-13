import { useState, useRef, useEffect } from "react";
import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";
import { Link, useNavigate } from "react-router-dom";
import { useSearch } from "@/shared/hooks/useSearch";

type SearchBarProps = {
  placeholder: string;
  lang: string;
  className?: string;
  onSelect?: (item: CourseType) => void;
};

const SearchBar = ({
  placeholder,
  lang,
  className = "",
  onSelect,
}: SearchBarProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useSearch(query);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        setShowDropdown(true);
        refetch();
      } else {
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, refetch]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelect = (item: CourseType) => {
    setShowDropdown(false);
    onSelect?.(item);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(query)}`);
      setShowDropdown(false);
    }
  };

  return (
    <div className={`relative ${className} w-full`} ref={inputRef}>
      <div className="relative text-gray-600 flex-1">
        <input
          className="border border-[#8A8A8A] w-full h-8 px-2 pr-10 rounded-lg text-sm focus:outline-none"
          type="search"
          placeholder={placeholder}
          dir={lang === "ar" ? "rtl" : "ltr"}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnter}
          onFocus={() => query && setShowDropdown(true)}
        />

        <button
          type="button"
          onClick={() =>
            query.trim() &&
            navigate(`/search-results?query=${encodeURIComponent(query)}`)
          }
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 bg-white border border-gray-300 rounded-md w-full max-h-60 overflow-auto mt-1 shadow-sm">
          {isLoading && (
            <p className="p-2 text-sm text-gray-500">{t("search_loading")}</p>
          )}

          {!isLoading && data && data?.items?.length === 0 && (
            <p className="p-2 text-sm text-gray-500">
              {t("search_no_results")}
            </p>
          )}

          {!isLoading &&
            data?.items?.map((item: CourseType) => (
              <Link
                to={`/user-course-details/${item?.id}`}
                key={item.id}
                className="block p-2 text-sm cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(item)}
              >
                {item.name}
              </Link>
            ))}

          {!isLoading && data?.items && data.items.length > 0 && (
            <Link
              to={`/search-results?query=${encodeURIComponent(query)}`}
              className="block text-center p-2 text-sm bg-primary hover:bg-gray-200 text-secondary font-medium"
              onClick={() => setShowDropdown(false)}
            >
              {t("search_show_all")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
