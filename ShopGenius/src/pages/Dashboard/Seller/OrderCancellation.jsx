import { useQuery } from '@tanstack/react-query';
import React from 'react';
import useAuth from '../../../hooks/useAuth';
import { axiosSecure } from '../../../hooks/useAxiosSecure';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import CancelledOrderDataRow from '../../../components/TableRows/CancelledOrderDataRow';

const OrderCancellation = () => {
    const {user}=useAuth();
    const {data:ordersCancellation=[], isPending, refetch}=useQuery({
        queryKey:['cancelled-orders',user?.email],
        queryFn:async()=>{
            const {data}=await axiosSecure(`/canceled-order/${user?.email}`);
            return data;
        }
    })

    console.log(ordersCancellation);
    if(isPending) return <LoadingSpinner/>;
    return (
        <div>
                  <Helmet>
                    <title>Orders Cancellation | ShopGenius</title>
                  </Helmet>
            
                  <div className="container mx-auto px-4 sm:px-8">
                    <div className="py-8">
                      <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                          <table className="min-w-full leading-normal">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Title
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Guest Email
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Price
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Purchased Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  End of Returning Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Returned Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Order Quantity
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Refund Status
                                </th>
                                <th
                                  scope="col"
                                  className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                >
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Table row data */}
                              {ordersCancellation.length > 0 &&
                                ordersCancellation.map((order) => (
                                  <CancelledOrderDataRow
                                    key={order?._id}
                                    order={order}
                                    refetch={refetch}
                                    // dashboardStatus
                                  />
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
        </div>
    );
};

export default OrderCancellation;