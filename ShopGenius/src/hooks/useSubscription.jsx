import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useSubscription = () => {
  const { user, loading } = useAuth() || {};
  const axiosSecure = useAxiosSecure();
//   console.log(!!user?.email, !loading);

  const { data: subscription, isLoading: userSubscriptionLoading } = useQuery({
    queryKey: ["subscription",user?.email],
    enabled: !!user?.email && !loading,
    queryFn: async () => {
      const { data } = await axiosSecure(`/user/subscription/${user?.email}`);
      return data;
    },
  });
  return [subscription, userSubscriptionLoading];
};

export default useSubscription;
