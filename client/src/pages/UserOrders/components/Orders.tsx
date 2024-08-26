import { faEye, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

import { GetOrdersResponse } from "@shared/types/apiTypes";
import { Order } from "@shared/types/entitiesTypes";

import { ordersAPI } from "../../../api/ordersAPI";
import { GlassWrapper } from "../../../components";
import { useHandleErrors, useNotify } from "../../../hooks";
import OrderDetails from "./OrderDetails";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchOrdersLoad, setFetchOrdersLoad] = useState<boolean>(false);
  const [openOrderDetails, setOpenOrderDetails] = useState<boolean>(false);
  const [orderDetailsId, setOrderDetailsId] = useState<number | null>(null);
  const handleErrors = useHandleErrors();

  // Fetch currentUser orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setFetchOrdersLoad(true);

        const res = await ordersAPI.getOrders();

        const data: GetOrdersResponse = res.data.data;

        setOrders(data.orders);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchOrdersLoad(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <section>
      {/* Title */}
      <h2 className="pb-3 mb-4 border-b border-slate-200 font-bold text-lg">Your Orders</h2>

      {/* Orders Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right shadow-lg border border-slate-300">
          <thead>
            <tr className="text-sm font-bold text-body bg-whiten">
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Total Price
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {fetchOrdersLoad ? (
              <tr>
                <td className="w-full p-4">loading ...</td>
              </tr>
            ) : orders.length > 0 ? (
              <>
                {orders.map((order: Order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    setOpenOrderDetails={setOpenOrderDetails}
                    setOrderDetailsId={setOrderDetailsId}
                    setOrders={setOrders}
                  />
                ))}
              </>
            ) : (
              <tr>
                <td className="w-full p-4">You don't request any orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details */}
      {openOrderDetails ? (
        <GlassWrapper setOpenGlassWrapper={setOpenOrderDetails}>
          <OrderDetails orderDetailsId={Number(orderDetailsId)} />
        </GlassWrapper>
      ) : (
        ""
      )}
    </section>
  );
};

const OrderRow = ({ order, setOrderDetailsId, setOpenOrderDetails, setOrders }) => {
  const orderData: Order = order;
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const notify = useNotify();

  const deleteOrder = async (orderId: number) => {
    try {
      setDeleteLoading(true);

      const confirmResult = confirm("Are you sure?");

      if (!confirmResult) return;

      await ordersAPI.deleteOrder(orderId);

      setOrders((prev: Order[]) => prev.filter((order: Order) => order._id !== orderData._id));

      notify("success", "Order is deleted");
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Delete order fail!");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <tr className="border-b border-slate-300 text-sm text-body bg-white font-normal">
      <td className="px-6 py-4">
        {new Date(orderData.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="px-6 py-4">
        <div className="text-main font-bold me-2">${orderData.totalPrice}</div>
      </td>

      <td className="px-6 py-4">
        <div className="me-2">Pending ...</div>
      </td>

      <td className="px-6 py-4">
        <button
          type="button"
          title="view order details"
          className="text-blue-600 mr-4"
          onClick={() => {
            setOrderDetailsId(orderData._id);
            setOpenOrderDetails(true);
          }}
        >
          <FontAwesomeIcon icon={faEye} />
        </button>

        <button
          type="button"
          title="delete this order"
          className="text-red-500"
          onClick={() => deleteOrder(orderData._id)}
          disabled={deleteLoading ? true : false}
          style={deleteLoading ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          {deleteLoading ? (
            <PuffLoader color="#000" size={20} />
          ) : (
            <FontAwesomeIcon icon={faTrashCan} />
          )}
        </button>
      </td>
    </tr>
  );
};

export default Orders;
