import { Helmet } from "react-helmet-async";
import Banner from "../../components/Banner/Banner";
import BestSeller from "../../components/Home/BestSeller/BestSeller";
import DiscountedProducts from "../../components/Home/DiscountedProducts";
import PremiumMembership from "../../components/Home/PremiumMembership/PremiumMembership";


const Home = () => {

  return (
    <div>
      <Helmet>
        <title>ShopGenius | Home</title>
      </Helmet>
      <Banner />
      <DiscountedProducts />
      <BestSeller />
      <PremiumMembership />
    </div>
  );
};

export default Home;
