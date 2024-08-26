import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import {
  DeleteNotificationRequest,
  GetNotificationsResponse,
  UpdateNotificationRequest,
} from "@shared/types/apiTypes";
import { MessageNotification, OrderNotification } from "@shared/types/entitiesTypes";

import { notificationsAPI } from "../../api/notificationsAPI";
import { useHandleErrors, useNotify, useQuery } from "../../hooks";
import {
  deleteNotification as deleteNotificationFromStore,
  updateNotification as updateNotificationInStore,
} from "../../store/slices/notificationsSlice";
import { StoreState } from "../../store/store";
import { formatCreatedSince } from "../../utils/formateCreatedSince";
import { ROLES_LIST } from "../../utils/rolesList";

const UserNotifications = () => {
  const query = useQuery(); /* For default states */

  const [notifications, setNotifications] = useState<MessageNotification[] | OrderNotification[]>(
    [],
  );
  const [notificationsLength, setNotificationsLength] = useState<number>(0);
  const [fetchNotificationsLoad, setFetchNotificationsLoad] = useState<boolean>(false);

  /* Start query states */
  const [limit, setLimit] = useState<number>(query.limit && +query.limit >= 1 ? +query.limit : 10);

  const [notificationsPage, setNotificationsPage] = useState<number>(
    query.page && +query.page >= 1 ? +query.page : 1,
  );

  const [type, setType] = useState<"messages" | "orders">(
    query.type === "messages" ? "messages" : query.type === "orders" ? "orders" : "messages",
  );
  /* End query states */

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setFetchNotificationsLoad(true);

      const res = await notificationsAPI.getNotifications(notificationsPage, limit);

      const data: GetNotificationsResponse = res.data.data;

      type === "messages"
        ? setNotifications(data.notifications.messagesNotifications)
        : type === "orders"
          ? setNotifications(data.notifications.ordersNotifications)
          : "";
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchNotificationsLoad(false);
    }
  };

  /* Set query states when location URL changes */
  useEffect(() => {
    setLimit(query.limit && +query.limit >= 1 ? +query.limit : 10);

    setNotificationsPage(query.page && +query.page >= 1 ? +query.page : 1);

    setType(
      query.type === "messages" ? "messages" : query.type === "orders" ? "orders" : "messages",
    );
  }, []);

  useEffect(() => {
    setNotificationsLength(notifications.length);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [notificationsPage, limit, type]);

  useEffect(() => {
    navigate(`/notifications?page=${notificationsPage}&limit=${limit}&type=${type}`);
  }, [notificationsPage, limit, type]);

  useEffect(() => {
    setNotificationsPage(1);
  }, [type]);

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 mb-4 border-b border-slate-200">
        <h2 className="font-bold text-lg">Your Notifications</h2>

        <div className="flex items-center space-x-2">
          <select
            id="type"
            className="p-1 border rounded border-slate-300 bg-gray-50 focus:border-slate-500 outline-none"
            value={type}
            onChange={(event) => {
              setType(
                event.target.value === "messages"
                  ? "messages"
                  : event.target.value === "orders"
                    ? "orders"
                    : type,
              );
            }}
          >
            <option className="text-black" value={"messages"}>
              Messages Notifications
            </option>
            <option className="text-black" value={"orders"}>
              Orders Notifications
            </option>
          </select>
        </div>
      </header>

      {/* Notifications Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right shadow-lg border border-slate-300">
          <thead>
            <tr className="text-sm font-bold text-body bg-whiten">
              <th scope="col" className="px-6 py-3">
                {type === "messages" ? "Message Sender" : type === "orders" ? "Order Sender" : ""}
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Since
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {fetchNotificationsLoad ? (
              <tr>
                <td className="w-full p-4">loading ...</td>
              </tr>
            ) : notifications.length > 0 ? (
              <>
                {notifications.map((notification: MessageNotification | OrderNotification) => (
                  <NotificationRow
                    key={notification._id}
                    notification={notification}
                    fetchNotifications={fetchNotifications}
                  />
                ))}
              </>
            ) : (
              <tr>
                <td className="w-full p-4">No Notifications Yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      <Pagination
        notificationsLength={notificationsLength}
        limit={limit}
        setLimit={setLimit}
        notificationsPage={notificationsPage}
        setNotificationsPage={setNotificationsPage}
      />
    </>
  );
};

const NotificationRow = ({
  notification,
  fetchNotifications,
}: {
  notification: MessageNotification | OrderNotification;
  fetchNotifications: any;
}) => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);

  const [notificationType] = useState<"message" | "order">(
    "messageId" in notification ? "message" : "orderId" in notification ? "order" : "message",
  );
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const notify = useNotify();
  const dispatch = useDispatch();

  const deleteNotification = async (notificationId: number) => {
    try {
      setDeleteLoading(true);

      const confirmResult = confirm("Are you sure?");

      if (!confirmResult) return;

      const reqBody: DeleteNotificationRequest = { type: notificationType };

      await notificationsAPI.deleteNotification(notificationId, reqBody);

      dispatch(
        deleteNotificationFromStore({ notificationId: notificationId, type: notificationType }),
      );

      fetchNotifications();

      notify("success", "Notification is deleted");
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Delete notification fail!");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Set notification as read
  useEffect(() => {
    const setNotificationAsRead = async (notificationId: number) => {
      try {
        const reqBody: UpdateNotificationRequest = { type: notificationType, isRead: true };
        await notificationsAPI.updateNotification(notificationId, reqBody);
        dispatch(
          updateNotificationInStore({
            notificationId: notificationId,
            type: notificationType,
            isRead: true,
          }),
        );
      } catch (err) {
        console.log(err);
      }
    };

    setNotificationAsRead(notification._id);
  }, []);

  return (
    <tr className="border-b border-slate-300 text-sm text-body bg-white">
      <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
        {currentUser.role === ROLES_LIST.Admin || currentUser.role === ROLES_LIST.SuperAdmin ? (
          <Link
            to={`/users/${notification.senderId}/profile`}
            className="flex items-center whitespace-nowrap"
          >
            <img className="w-10 h-10 rounded-full" src={notification.sender?.avatar} alt="" />
            <span className="ps-3 text-base font-semibold">{notification.sender?.name}</span>
          </Link>
        ) : (
          <div className="flex items-center whitespace-nowrap">
            <img className="w-10 h-10 rounded-full" src={notification.sender?.avatar} alt="" />
            <span className="ps-3 text-base font-semibold">{notification.sender?.name}</span>
          </div>
        )}
      </th>

      <td className="px-6 py-4 whitespace-nowrap">
        {new Date(notification.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">{formatCreatedSince(notification.createdAt)}</td>

      <td className="px-6 py-4 whitespace-nowrap">
        <button
          type="button"
          title="delete this notification"
          className="text-red-500"
          onClick={() => deleteNotification(notification._id)}
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

const Pagination = ({
  notificationsLength,
  limit,
  setLimit,
  notificationsPage,
  setNotificationsPage,
}) => {
  const handleNext = () => {
    setNotificationsPage(notificationsPage + 1);
  };

  const handlePrev = () => {
    if (notificationsPage > 1) {
      setNotificationsPage(notificationsPage - 1);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(event.target.value));
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center space-x-2">
        <button
          className="px-4 py-1 bg-main text-white rounded disabled:opacity-50"
          onClick={handlePrev}
          disabled={notificationsPage === 1 ? true : false}
        >
          Previous
        </button>
        <button
          className="px-4 py-1 bg-main text-white rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={notificationsLength < limit ? true : false}
        >
          Next
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="limit" className="text-sm">
          Notifications per page:
        </label>
        <select
          id="limit"
          className="p-1 border rounded border-slate-300 bg-gray-50 focus:border-slate-500 outline-none"
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

export default UserNotifications;
