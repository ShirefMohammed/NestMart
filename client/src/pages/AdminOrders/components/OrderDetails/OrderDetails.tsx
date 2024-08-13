import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { GetOrderResponse } from "@shared/types/apiTypes";
import { Order, OrderItem } from "@shared/types/entitiesTypes";

import { ordersAPI } from "../../../../api/ordersAPI";
import { useHandleErrors } from "../../../../hooks";
import { formatOrderDate } from "../../../../utils/formateOrderDate";

const OrderDetails = ({ orderDetailsId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [fetchOrderLoad, setFetchOrderLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  const fetchOrder = async () => {
    try {
      setFetchOrderLoad(true);

      const res = await ordersAPI.getOrder(orderDetailsId);

      const data: GetOrderResponse = res.data.data;

      setOrder(data.order);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchOrderLoad(false);
    }
  };

  useEffect(() => {
    if (orderDetailsId) fetchOrder();
  }, [orderDetailsId]);

  return (
    <section className="py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark">
      {order?._id ? (
        <>
          {/* About Order */}
          <header className="flex justify-start item-start space-y-2 flex-col">
            <h1 className="text-3xl dark:text-white lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800">
              Order #{order._id}
            </h1>
            <p className="text-base dark:text-gray-300 font-medium leading-6 text-gray-600">
              {formatOrderDate(order.createdAt)}
            </p>
          </header>

          <div className="mt-10 flex flex-col xl:flex-row justify-center items-stretch w-full xl:space-x-8 space-y-4 md:space-y-6 xl:space-y-0">
            <div className="flex flex-col justify-start items-start w-full space-y-4 md:space-y-6 xl:space-y-8">
              {/* Order Items */}
              <section className="flex flex-col justify-start items-start dark:bg-gray-800 bg-gray-50 px-4 py-4 md:py-6 md:p-6 xl:p-8 w-full text-body bg-white dark:bg-boxdark dark:text-bodydar">
                <p className="text-lg md:text-xl dark:text-white font-semibold leading-6 xl:leading-5 text-gray-800">
                  Customer’s Cart
                </p>

                {order.orderItems?.map((orderItem: OrderItem) => (
                  <OrderItemCard key={orderItem.productId} orderItem={orderItem} />
                ))}
              </section>

              {/* Order Summary */}
              <section className="flex justify-center flex-col md:flex-row items-stretch w-full space-y-4 md:space-y-0 md:space-x-6 xl:space-x-8 text-body bg-white dark:bg-boxdark dark:text-bodydar">
                <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 dark:bg-gray-800 space-y-6">
                  <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">
                    Summary
                  </h3>
                  <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
                    <div className="flex justify-between w-full">
                      <p className="text-base dark:text-white leading-4 text-gray-800">Subtotal</p>
                      <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
                        ${order.totalPrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-base dark:text-white font-semibold leading-4 text-gray-800">
                      Total
                    </p>
                    <p className="text-base dark:text-gray-300 font-semibold leading-4 text-gray-600">
                      ${order.totalPrice}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </>
      ) : fetchOrderLoad ? (
        <div className="relative top-1/2 transform -translate-y-12">loading ...</div>
      ) : (
        ""
      )}
    </section>
  );
};

const OrderItemCard = ({ orderItem }: { orderItem: OrderItem }) => {
  return (
    <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-start items-start md:items-center md:space-x-6 xl:space-x-8 w-full">
      <Link to={`/products/${orderItem.product?._id}`} className="pb-4 md:pb-8 w-full md:w-40">
        <img className="w-12 md:w-36" src={orderItem.product?.images[0]} alt="" />
      </Link>

      <div className="border-b border-gray-200 md:flex-row flex-col flex justify-between items-start w-full pb-8 space-y-4 md:space-y-0">
        <Link
          to={`/products/${orderItem.product?._id}`}
          className="w-full flex flex-col justify-start items-start space-y-8"
        >
          <h3 className="text-xl dark:text-white xl:text-2xl font-semibold leading-6 text-gray-800">
            {orderItem.product?.title}
          </h3>
        </Link>

        <div className="flex justify-between space-x-8 items-start w-full">
          <p className="text-base dark:text-white xl:text-lg leading-6">
            $
            {orderItem.product!.price -
              (orderItem.product!.discount / 100) * orderItem.product!.price}{" "}
            <span className="text-red-300 line-through block text-xs">
              {" "}
              ${orderItem.product!.price}
            </span>
          </p>

          <p className="text-base dark:text-white xl:text-lg leading-6 text-gray-800">
            {orderItem.quantity}
          </p>

          <p className="text-base dark:text-white xl:text-lg font-semibold leading-6 text-gray-800">
            $
            {orderItem.product!.price -
              (orderItem.product!.discount / 100) * orderItem.product!.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
