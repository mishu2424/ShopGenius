import React from "react";
import useAuth from "../../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Container from "../../Shared/Container";
import OrderCard from "./OrderCard";
import ProductCard from "./ProductCard";

const Orders = () => {
  const { user } = useAuth();

  const {
    data: orders,
    isLoading: ordersInfoLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-orders", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure(`/my-orders/${user?.email}`);
      return data;
    },
  });

  const { data: recentBoughtProducts, isLoading: isBoughtProductsLoading } =
    useQuery({
      queryKey: ["recent-bought-products-suggestions", user?.email],
      enabled: !!user?.email,
      queryFn: async () => {
        const { data } = await axiosSecure(
          `/recent-bought?recentBoughtCat=${true}`
        );
        return data;
      },
    });

  console.log(recentBoughtProducts);

  console.log(orders);

  if (ordersInfoLoading || isBoughtProductsLoading) return <LoadingSpinner />;
  return (
    <Container>
      <Tabs>
        <TabList>
          <Tab>Buy again</Tab>
          <Tab>Suggested Products</Tab>
        </TabList>

        <TabPanel>
          <div className="grid grid-cols-1 gap-3">
            {orders.length > 0 ? (
              orders?.map((order) => (
                <OrderCard key={order?._id} order={order} />
              ))
            ) : (
              <div className="flex items-center justify-center">
                <h5 className="text-lg font-semibold text-gray-500">
                  No Data Found!!!
                </h5>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {recentBoughtProducts.length > 0 &&
              recentBoughtProducts?.map((product) => (
                <ProductCard key={product?._id} product={product} />
              ))}
          </div>
          {recentBoughtProducts.length === 0 && (
            <div className="flex items-center justify-center">
              <h5 className="text-lg font-semibold text-gray-500">
                No Data Found!!!
              </h5>
            </div>
          )}
        </TabPanel>
      </Tabs>
    </Container>
  );
};

export default Orders;
