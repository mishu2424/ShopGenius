import { useQuery } from "@tanstack/react-query";
import React from "react";
import { axiosSecure } from "./useAxiosSecure";
import useAuth from "./useAuth";

const useRecentBoughtProducts = (isCat = false) => {
  const { user } = useAuth();
  console.log(isCat);
  const {
    data: recentBoughtProducts,
    isLoading: isBoughtProductsLoading,
    refetch,
  } = useQuery({
    queryKey: ["recent-bought", user?.email],
    enabled: !!user && !!user.email,
    queryFn: async () => {
      const { data } = await axiosSecure(
        `/recent-bought?recentBoughtCat=${isCat}`
      );
      return data;
    },
  });

  // console.log(recentBoughtProducts);
  return [recentBoughtProducts, isBoughtProductsLoading, refetch];
};

export default useRecentBoughtProducts;
