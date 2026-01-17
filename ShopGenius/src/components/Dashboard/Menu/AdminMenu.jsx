import { FaUserCog } from "react-icons/fa";
import MenuItem from "./MenuItem";
import { BsGraphUp } from "react-icons/bs";
import { RiCoupon3Fill } from "react-icons/ri";

const AdminMenu = () => {
  return (
    <>
      <MenuItem
        address={`/dashboard/admin-stats`}
        label={"Statistics"}
        icon={BsGraphUp}
      />
      <MenuItem icon={FaUserCog} label="Manage Users" address="manage-users" />
      <MenuItem
        icon={RiCoupon3Fill}
        label="Create Coupons"
        address="create-coupons"
      />
    </>
  );
};

export default AdminMenu;
