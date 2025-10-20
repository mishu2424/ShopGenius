import { useQuery } from "@tanstack/react-query";
import useAxiosCommon from "./useAxiosCommon";
import LoadingSpinner from "../components/Shared/LoadingSpinner";

const usePopularProducts = () => {
    const axiosCommon=useAxiosCommon();
    const {data:popularProducts,isLoading:isPopularProductsLoading,refetch}=useQuery({
        queryKey:['popular-products'],
        queryFn:async()=>{
            const {data}=await axiosCommon(`/popular-products`);
            return data;
        }
    })


    return [popularProducts,isPopularProductsLoading,refetch];
};

export default usePopularProducts;