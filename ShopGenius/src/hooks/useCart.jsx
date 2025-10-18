import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useCart = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const {
    data: carts = [],
    isLoading:isCartLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart", user?.email],
    enabled: !!user && !!user.email,
    queryFn: async () => {
      const { data } = await axiosSecure(`/cart?email=${user?.email}`);
      return data;
    },
  });
  return [carts, isCartLoading, refetch];
};

export default useCart;
