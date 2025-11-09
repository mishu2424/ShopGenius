import { Helmet } from "react-helmet-async";
import Banner from "../../components/Banner/Banner";
import BestSeller from "../../components/Home/BestSeller/BestSeller";
import DiscountedProducts from "../../components/Home/DiscountedProducts";
import PremiumMembership from "../../components/Home/PremiumMembership/PremiumMembership";
import RecentBoughtCategories from "../../components/Home/RecentBoughtCategories/RecentBoughtCategories";
import RecentlyVisitedProducts from "../../components/Home/RecentlyVisitedProducts/RecentlyVisitedProducts";


const Home = () => {

  return (
    <div>
      <Helmet>
        <title>Home | ShopGenius</title>
      </Helmet>
      <Banner />
      <DiscountedProducts />
      <BestSeller />
      <RecentBoughtCategories/>
      <RecentlyVisitedProducts/>
      <PremiumMembership />
    </div>
  );
};

export default Home;
