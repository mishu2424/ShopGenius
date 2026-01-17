import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Container from "../../Shared/Container";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import RefundCard from "./RefundCard";
const Returns = () => {
  const { user } = useAuth();
  const {
    data: returns = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["returns", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure(`/refunded-order/${user?.email}`);
      return data;
    },
  });

  console.log(returns);

  if (isLoading) return <LoadingSpinner />;
  return (
    <Container>
      <Tabs>
        <TabList>
          <Tab>Pending Refund Request</Tab>
          <Tab>Successful Refunds</Tab>
        </TabList>

        <TabPanel>
          {returns?.length > 0 &&
          returns?.filter((item) => item?.status === "under-consideration")
            ?.length > 0 ? (
            <div className="col-span-12 grid grid-cols-12 gap-4 p-4 rounded-lg shadow-sm bg-white">
              {returns
                ?.filter((item) => item?.status === "under-consideration")
                ?.map((item) => (
                  <RefundCard key={item?._id} item={item} />
                ))}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <h5 className="text-lg font-semibold text-gray-500">
                No Data Found!!!
              </h5>
            </div>
          )}
        </TabPanel>
        <TabPanel>
          {returns?.length > 0 &&
          returns?.filter((item) => item?.status === "refunded")?.length > 0 ? (
            <div className="col-span-12 grid grid-cols-12 gap-4 p-4 rounded-lg shadow-sm bg-white">
              {returns
                ?.filter((item) => item?.status === "refunded")
                ?.map((item) => (
                  <RefundCard key={item?._id} item={item} />
                ))}
            </div>
          ) : (
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

export default Returns;
