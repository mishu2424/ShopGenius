import useAuth from "./useAuth";
import useAxiosCommon from "./useAxiosCommon";
import { useQuery } from "@tanstack/react-query";

const useRole = () => {
  const { user, loading } = useAuth();
  const axiosCommon = useAxiosCommon(); // or useAxiosCommon if your /user/:email is public

  const email = user?.email ?? null;

  // hard guard: don't start the query until we truly have an email
  const enabled = Boolean(!loading && email);

  const {
    data: role,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["user-role", email || "anon"],
    enabled,
    // keep the queryFn free of changing refs; only depend on email
    queryFn: async () => {
      const { data } = await axiosCommon.get(`/user/${email}`);
      return data.role;
    },

    // make it quiet + stable
    staleTime: 5 * 60 * 1000,            // don't refetch for 5 min
    cacheTime: 30 * 60 * 1000,           // keep in cache for 30 min
    retry: 1,                            // avoid endless retries on 401
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,               // prevents mount refetch when cached
  });

  return [role, isLoading || (enabled && isFetching), error];
};

export default useRole;