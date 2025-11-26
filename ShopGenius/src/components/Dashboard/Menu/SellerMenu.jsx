import { BsFillHouseAddFill, BsGraphUp } from "react-icons/bs";
import { MdHomeWork, MdOutlineManageHistory } from "react-icons/md";
import { FcCancel } from "react-icons/fc";
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
      <MenuItem
        icon={BsFillHouseAddFill}
        label="Add Product"
        address="/dashboard/add-products"
      />
      <MenuItem
        icon={MdHomeWork}
        label="My Products"
        address="/dashboard/my-products"
      />
      <MenuItem
        icon={MdOutlineManageHistory}
        label="Manage Orders"
        address="/dashboard/manage-orders"
        exact={false}
      />
      <MenuItem
        icon={FcCancel}
        label="Orders Cancellation"
        address="/dashboard/orders-cancellation"
        exact={false}
      />
    </>
  );
};

export default SellerMenu;
