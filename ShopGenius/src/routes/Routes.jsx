import { createBrowserRouter } from "react-router-dom";
import Main from "../layouts/Main";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home/Home";
import ProductDetails from "../components/ProductDetails/ProductDetails";
import Login from "../pages/Authentication/Login";
import SignUp from "../pages/Authentication/SignUp";
import Carts from "../pages/Carts/Carts";
import PrivateRoute from "./PrivateRoute";
import Products from "../pages/Products/Products";
import DashboardLayout from "../layouts/DashboardLayout";
import Profile from "../components/Dashboard/Shared/Profile";
import MyOrders from "../pages/Dashboard/User/MyOrders";
import UserStatistics from "../pages/Dashboard/User/UserStatistics";
import SellerStatistics from "../pages/Dashboard/Seller/SellerStatistics";
import MyProducts from "../pages/Dashboard/Seller/MyProducts";
import ManageOrders from "../pages/Dashboard/Seller/ManageOrders";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import AddProducts from "../pages/Dashboard/Seller/AddProducts";
import SellerRoute from "./SellerRoute";
import AdminRoute from "./AdminRoute";
import AdminStatistics from "../pages/Dashboard/Admin/AdminStatistics";
import MyCarts from "../pages/Dashboard/User/MyCarts";
import PaymentSuccess from "../components/Shared/PaymentSuccess";
import PaymentFail from "../components/Shared/PaymentFail";
import SubscriptionSuccess from "../components/Shared/SubscriptionSuccess";
import ReturnsOrders from "../components/Home/Returns&Orders/ReturnsOrders";
import Returns from "../components/Home/Returns&Orders/Returns";
import Orders from "../components/Home/Returns&Orders/Orders";
import OrderSummaryInvoice from "../components/Home/Returns&Orders/OrderSummaryInvoice";
import OrderDetails from "../components/Home/Returns&Orders/OrderDetails";
import OrderCancellation from "../pages/Dashboard/Seller/OrderCancellation";
import CreateCoupons from "../pages/Dashboard/Admin/CreateCoupons";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/product/:id",
        element: <ProductDetails />,
      },
      {
        path: "/carts",
        element: (
          <PrivateRoute>
            <Carts />
          </PrivateRoute>
        ),
      },
      {
        path: "/payment-success",
        element: (
          <PrivateRoute>
            <PaymentSuccess />
          </PrivateRoute>
        ),
      },
      {
        path: "/payment-fail",
        element: (
          <PrivateRoute>
            <PaymentFail />
          </PrivateRoute>
        ),
      },
      {
        path:'/subscription-success',
        element:<PrivateRoute>
          <SubscriptionSuccess/>
        </PrivateRoute>
      },
      {
        path: `/products`,
        element: <Products />,
      },
      {
        path:'/returns&orders',
        element:<ReturnsOrders/>,
        children:[
          {
            index:true,
            element:<Returns/>
          },
          {
            path:'orders',
            element:<Orders/>
          },
          {
            path:'order-summary/:order_id',
            element:<OrderSummaryInvoice/>
          },
          {
            path:'order-details/:order_id',
            element:<OrderDetails/>
          }
        ]
      }
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <SignUp />,
  },
  {
    path: "dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      // user-dashboard
      {
        index: true,
        element: (
          <PrivateRoute>
            <Profile></Profile>
          </PrivateRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "my-carts",
        element: (
          <PrivateRoute>
            <MyCarts />
          </PrivateRoute>
        ),
      },
      {
        path: "user-stats",
        element: (
          <PrivateRoute>
            <UserStatistics />
          </PrivateRoute>
        ),
      },

      // Seller
      {
        path: "seller-stats",
        element: (
          <PrivateRoute>
            <SellerRoute>
              <SellerStatistics />
            </SellerRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "add-products",
        element: (
          <PrivateRoute>
            <SellerRoute>
              <AddProducts />
            </SellerRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "my-products",
        element: (
          <PrivateRoute>
            <SellerRoute>
              <MyProducts />
            </SellerRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "manage-orders",
        element: (
          <PrivateRoute>
            <SellerRoute>
              <ManageOrders />
            </SellerRoute>
          </PrivateRoute>
        ),
      },
      {
        path:"orders-cancellation",
        element:<PrivateRoute>
          <SellerRoute>
            <OrderCancellation/>
          </SellerRoute>
        </PrivateRoute>
      },

      // admin
      {
        path: "admin-stats",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <AdminStatistics />
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "manage-users",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "create-coupons",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <CreateCoupons />
            </AdminRoute>
          </PrivateRoute>
        ),
      },

      // shared_components
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
