import { useQuery } from "@tanstack/react-query";
import useAxiosCommon from "../../../hooks/useAxiosCommon";
import LoadingSpinner from "../../Shared/LoadingSpinner";


import Container from "../../Shared/Container";
import Title from "../../Shared/Title";
import { HiMiniCheckBadge } from "react-icons/hi2";
import MenSwiper from "./MenSwiper";
import WomenSwiper from "./WomenSwiper";
import NeutralSwiper from "./NeutralSwiper";

const BestSeller = () => {
  const axiosCommon = useAxiosCommon();
  //   men
  const { data: bestProductsMen, isLoading: isMenProductLoading } = useQuery({
    queryKey: ["best-seller-men"],
    queryFn: async () => {
      const { data } = await axiosCommon(`/best-seller-products?gender=men`);
      return data;
    },
  });

  //   women
  const { data: bestProductsWomen, isLoading: isWomenProductLoading } =
    useQuery({
      queryKey: ["best-seller-women"],
      queryFn: async () => {
        const { data } = await axiosCommon(
          `/best-seller-products?gender=women`
        );
        return data;
      },
    });

  //   neutral
  const { data: bestProducts, isLoading: isBestProductLoading } = useQuery({
    queryKey: ["best-seller"],
    queryFn: async () => {
      const { data } = await axiosCommon(`/best-seller-products?gender=none`);
      return data;
    },
  });


  if (isMenProductLoading || isWomenProductLoading || isBestProductLoading)
    return <LoadingSpinner />;
  return (
    <Container>
      <Title
        title={"Best Seller"}
        borderColor={"border-blue-500"}
        icon={HiMiniCheckBadge}
        iconColor={"text-blue-500"}
      />

      {/* MEN */}
      <MenSwiper bestProductsMen={bestProductsMen} />

      {/* WOMEN */}
      <WomenSwiper bestProductsWomen={bestProductsWomen} />

      {/* Neutral */}
      <NeutralSwiper bestProducts={bestProducts} />
    </Container>
  );
};

export default BestSeller;
