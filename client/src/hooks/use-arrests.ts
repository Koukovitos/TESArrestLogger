import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useArrests() {
  return useQuery({
    queryKey: [api.arrests.list.path],
    queryFn: async () => {
      const res = await fetch(api.arrests.list.path);
      if (!res.ok) throw new Error("Failed to fetch arrests");
      return api.arrests.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Poll every 10s for new bot entries
  });
}
