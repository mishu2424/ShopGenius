import { useQuery } from "@tanstack/react-query";
import { axiosSecure } from "./useAxiosSecure";

const useCoupons = () => {
    //   const { user, loading } = useAuth() || {};

  const { data: coupons, isLoading: couponInfoLoading } = useQuery({
    queryKey: ["coupon"],
    queryFn: async () => {
      const { data } = await axiosSecure(`/get-coupon-info`);
      return data;
    },
  });
  return [coupons, couponInfoLoading];
};

export default useCoupons;
