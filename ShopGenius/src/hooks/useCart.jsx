import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useCart = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  const {
    data: carts = {},
    isLoading: isCartLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart", user?.email],
    enabled: !!user?.email,
    staleTime: 30000, // Keep data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    queryFn: async () => {
      const { data } = await axiosSecure(`/cart?email=${user?.email}`);
      return data;
    },
  });
  
  return [carts.result, carts?.totalCartItems, isCartLoading, refetch];
};

export default useCart;