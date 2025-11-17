import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "./useAuth";
import { axiosSecure } from "./useAxiosSecure";
import { useEffect } from "react";

const STORAGE_KEY = "recentlyViewed";

const useRecentlyViewed = () => {
  const { user } = useAuth() || {};
  const queryClient = useQueryClient();

  //get recently viewed from localstorage for anonymous users
  const getLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error reading recently viewed", err.message);
      return [];
    }
  };

  //save to localstorage for anonymous users
  const saveToLocalStorage = (products) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error("Error saving recently viewed", err.message);
    }
  };

  //fetch data
  const { data: recentProducts = [] } = useQuery({
    queryKey: ["recently-viewed", user?.email],
    queryFn: async () => {
      if (!user?.email) {
        console.log("entered");
        return getLocalStorage();
      }
      const { data } = await axiosSecure("/user/recently-viewed");
      return data;
    },
    enabled: true, // Always enabled, handles both logged-in and anonymous
  });

  const { mutateAsync: addToBackend } = useMutation({
    mutationFn: async (productData) => {
      const { data } = await axiosSecure.post("/user/recently-viewed", {
        productId: productData.productId,
        viewedAt: new Date().toISOString(),
      });
      return data;
    },
    onSuccess: () => {
      //refetch recently viewed list
      queryClient.invalidateQueries(["recently-viewed", user?.email]);
    },
  });

  //Main function to add a product to recently viewed
  const addToRecentlyViewed = async (product) => {
    if (!product?._id) return;

    const productData = {
      productId: product?._id,
      title: product?.title,
      price: product?.price,
      salePrice: product?.discount?.active && product?.salePrice,
      colors: product?.colors || "",
      brand: product?.brand,
      viewedAt: new Date().toISOString(),
    };

    if (user?.email) {
      //logged-in user: save to backend
      try {
        await addToBackend(productData);
      } catch (err) {
        console.error("Failed to track recently viewed", err.message);
      }
    } else {
      //anonymous user: save to localstorage

      //first get the already existing data
      let recentList = getLocalStorage();

      if (recentList && recentList.length > 0) {
        recentList = recentList.filter(
          (item) => item?.productId !== productData?.productId
        );
      }

      //add the new data to the front to make it 10 data total in localstorage
      recentList.unshift(productData);

      // console.log(recentList);

      //slice it to keep max 10 data in localstorage
      recentList = recentList.slice(0, 10);

      //now save it to localstorage
      saveToLocalStorage(recentList);

      //update query to trigger re-render
      queryClient.setQueryData(["recently-viewed", null], recentList);
    }
  };

  //sync localstorage to backend when user logs in
  useEffect(() => {
    const syncLocalToBackend = async () => {
      const localData = getLocalStorage();

      if (user?.email && localData.length > 0) {
        try {
          await axiosSecure.post("/user/sync-recently-viewed", {
            products: localData,
          });
          //clear localstorage after successful sync
          localStorage.removeItem(STORAGE_KEY);

          //refetch to get merged data
          queryClient.invalidateQueries(["recently-viewed", user?.email]);
        } catch (err) {
          console.error("Failed to sync recently viewed:", err.message);
        }
      }
    };

    syncLocalToBackend();
  }, [user?.email, queryClient]);

  return {
    recentProducts,
    addToRecentlyViewed,
  };
};

export default useRecentlyViewed;
