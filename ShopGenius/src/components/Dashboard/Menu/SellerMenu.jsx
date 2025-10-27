import { BsFillHouseAddFill, BsGraphUp } from "react-icons/bs";
import { MdHomeWork, MdOutlineManageHistory } from "react-icons/md";
import MenuItem from "./MenuItem";
const SellerMenu = () => {
  return (
    <>
      {/* Statistics */}
      <MenuItem
        address={`/dashboard/seller-stats`}
        label={"Statistics"}
        icon={BsGraphUp}
      />
      <MenuItem icon={BsFillHouseAddFill} label="Add Product" address="/dashboard/add-products" />
      <MenuItem icon={MdHomeWork} label="My Products" address="/dashboard/my-products" />
      <MenuItem
        icon={MdOutlineManageHistory}
        label="Manage Orders"
        address="/dashboard/manage-orders"
        exact={false}
      />
    </>
  );
};

export default SellerMenu;