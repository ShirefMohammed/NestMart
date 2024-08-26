import { faEye, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import { GetOrdersResponse } from "@shared/types/apiTypes";
import { Order } from "@shared/types/entitiesTypes";

import { ordersAPI } from "../../api/ordersAPI";
import { AdminBreadcrumb, GlassWrapper } from "../../components";
import { useHandleErrors, useNotify, useQuery } from "../../hooks";
import OrderDetails from "./components/OrderDetails";

const AdminOrders = () => {
  const query = useQuery(); /* For default states */
  const location = useLocation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLength, setOrdersLength] = useState<number>(0);

  /* Start query states */
  const [limit, setLimit] = useState<number>(query.limit && +query.limit >= 1 ? +query.limit : 5);

  const [ordersPage, setOrdersPage] = useState<number>(
    query.page && +query.page >= 1 ? +query.page : 1,
  );
  /* End query states */

  const [fetchOrdersLoad, setFetchOrdersLoad] = useState<boolean>(false);

  const [openOrderDetails, setOpenOrderDetails] = useState<boolean>(false);
  const [orderDetailsId, setOrderDetailsId] = useState<number | null>(null);

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setFetchOrdersLoad(true);

      const res = await ordersAPI.getAllOrders(ordersPage, limit);

      const data: GetOrdersResponse = res.data.data;

      setOrders(data.orders);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchOrdersLoad(false);
    }
  };

  /* Set query states when location URL changes */
  useEffect(() => {
    setLimit(query.limit && +query.limit >= 1 ? +query.limit : 5);
    setOrdersPage(query.page && +query.page >= 1 ? +query.page : 1);
  }, [location]);

  useEffect(() => {
    setOrdersLength(orders.length);
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, [ordersPage]);

  useEffect(() => {
    fetchOrders();
  }, [limit]);

  useEffect(() => {
    navigate(`/admin/orders?page=${ordersPage}&limit=${limit}`);
  }, [ordersPage, limit]);

  return (
    <>
      {/* AdminBreadcrumb */}
      <AdminBreadcrumb pageName="Orders" />

      {/* Orders Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right shadow-lg border border-slate-300 dark:border-slate-700">
          <thead>
            <tr className="text-sm font-bold text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark">
              <th scope="col" className="px-6 py-3">
                Creator
              </th>
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
                    fetchOrders={fetchOrders}
                    setOpenOrderDetails={setOpenOrderDetails}
                    setOrderDetailsId={setOrderDetailsId}
                  />
                ))}
              </>
            ) : (
              <tr>
                <td className="w-full p-4">No results</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      <Pagination
        ordersLength={ordersLength}
        limit={limit}
        setLimit={setLimit}
        ordersPage={ordersPage}
        setOrdersPage={setOrdersPage}
      />

      {/* Order Details */}
      {openOrderDetails ? (
        <GlassWrapper setOpenGlassWrapper={setOpenOrderDetails}>
          <OrderDetails orderDetailsId={Number(orderDetailsId)} />
        </GlassWrapper>
      ) : (
        ""
      )}
    </>
  );
};

const OrderRow = ({ order, fetchOrders, setOrderDetailsId, setOpenOrderDetails }) => {
  const orderData: Order = order;
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const notify = useNotify();

  const deleteOrder = async (orderId: number) => {
    try {
      setDeleteLoading(true);

      const confirmResult = confirm("Are you sure?");

      if (!confirmResult) return;

      await ordersAPI.deleteOrder(orderId);

      fetchOrders();

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
    <tr className="border-b border-slate-300 dark:border-slate-700 text-sm text-body bg-white dark:bg-boxdark dark:text-bodydark font-normal">
      <th
        scope="row"
        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
      >
        <img className="w-10 h-10 rounded-full" src={orderData.creator?.avatar} alt="" />

        <div className="ps-3">
          <div className="text-base font-semibold">{orderData.creator?.name}</div>
          <div className="font-normal text-gray-500">{orderData.creator?.email}</div>
        </div>
      </th>

      <td className="px-6 py-4">
        {new Date(orderData.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="px-6 py-4">
        <div className="text-blue-500 me-2">{orderData.totalPrice}$</div>
      </td>

      <td className="px-6 py-4">
        <div className="me-2">Pending ...</div>
      </td>

      <td className="px-6 py-4">
        <button
          type="button"
          title="view order details"
          className="text-blue-600 dark:text-blue-500 mr-4"
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

const Pagination = ({ ordersLength, limit, setLimit, ordersPage, setOrdersPage }) => {
  const handleNext = () => {
    setOrdersPage(ordersPage + 1);
  };

  const handlePrev = () => {
    if (ordersPage > 1) {
      setOrdersPage(ordersPage - 1);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(event.target.value));
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center space-x-2">
        <button
          className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handlePrev}
          disabled={ordersPage === 1 ? true : false}
        >
          Previous
        </button>
        <button
          className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={ordersLength < limit ? true : false}
        >
          Next
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="limit" className="text-sm">
          Orders per page:
        </label>
        <select
          id="limit"
          className="p-1 border rounded border-slate-300 dark:border-slate-700
              bg-gray-50 dark:bg-transparent focus:border-slate-500 dark:focus:border-slate-500 
              dark:placeholder-gray-400 dark:text-white outline-none"
          value={limit}
          onChange={handleLimitChange}
        >
          <option className="text-black" value={5}>
            5
          </option>
          <option className="text-black" value={10}>
            10
          </option>
          <option className="text-black" value={20}>
            20
          </option>
        </select>
      </div>
    </div>
  );
};

export default AdminOrders;
