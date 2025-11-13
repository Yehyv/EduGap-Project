import { useQuery } from "@tanstack/react-query";
import { search } from "../services/sharedApis";

export const useSearch = (keyword: string, page: number = 1) => {
  return useQuery({
    queryKey: ["search", keyword, page],
    queryFn: () => search(keyword, page),
    enabled: keyword.length > 0,
  });
};
