import { faEye, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

import { GetUsersResponse, SearchUsersResponse } from "@shared/types/apiTypes";
import { User } from "@shared/types/entitiesTypes";

import { usersAPI } from "../../api/usersAPI";
import { AdminBreadcrumb } from "../../components";
import { useHandleErrors, useNotify, useQuery } from "../../hooks";
import { ROLES_LIST } from "../../utils/rolesList";

const AdminUsers = ({ socket }) => {
  const query = useQuery(); /* For default states */

  const [users, setUsers] = useState<User[]>([]); /* fetched or searched */
  const [usersLength, setUsersLength] = useState<number>(0);

  /* Start query states */
  const [limit, setLimit] = useState<number>(query.limit && +query.limit >= 1 ? +query.limit : 5);

  const [usersPage, setUsersPage] = useState<number>(
    !query.searchKey && query.page && +query.page >= 1 ? +query.page : 1,
  );

  const [searchUsersPage, setSearchUsersPage] = useState<number>(
    query.searchKey && query.page && +query.page >= 1 ? +query.page : 1,
  );

  const [searchKey, setSearchKey] = useState<string>(query.searchKey ? query.searchKey : "");
  /* End query states */

  const [fetchUsersLoad, setFetchUsersLoad] = useState<boolean>(false);
  const [searchUsersLoad, setSearchUsersLoad] = useState<boolean>(false);

  const handleErrors = useHandleErrors();
  const navigate = useNavigate();

  /* Start functions */
  const fetchUsers = async () => {
    try {
      setFetchUsersLoad(true);

      const res = await usersAPI.getUsers(usersPage, limit);

      const data: GetUsersResponse = res.data.data;

      setUsers(data.users);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchUsersLoad(false);
    }
  };

  const searchUsers = async () => {
    try {
      setSearchUsersLoad(true);

      const res = await usersAPI.searchUsers(searchKey, searchUsersPage, limit);

      const data: SearchUsersResponse = res.data.data;

      setUsers(data.users);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSearchUsersLoad(false);
    }
  };
  /* End functions */

  /* Set query states when location URL changes */
  useEffect(() => {
    setLimit(query.limit && +query.limit >= 1 ? +query.limit : 5);

    setUsersPage(!query.searchKey && query.page && +query.page >= 1 ? +query.page : 1);

    setSearchUsersPage(query.searchKey && query.page && +query.page >= 1 ? +query.page : 1);

    setSearchKey(query.searchKey ? query.searchKey : "");
  }, []);

  useEffect(() => {
    setUsersLength(users.length);
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [usersPage]);

  useEffect(() => {
    if (searchKey) searchUsers();
  }, [searchUsersPage]);

  useEffect(() => {
    searchKey ? searchUsers() : fetchUsers();
  }, [limit]);

  useEffect(() => {
    if (!searchKey) fetchUsers();
  }, [searchKey]);

  useEffect(() => {
    searchKey
      ? navigate(`/admin/users?page=${searchUsersPage}&searchKey=${searchKey}&limit=${limit}`)
      : navigate(`/admin/users?page=${usersPage}&limit=${limit}`);
  }, [usersPage, searchUsersPage, searchKey, limit]);

  return (
    <>
      {/* AdminBreadcrumb */}
      <AdminBreadcrumb pageName="Users" />

      {/* Search Form */}
      <header className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        <label htmlFor="table-search" className="sr-only">
          Search
        </label>
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            searchKey ? searchUsers() : fetchUsers();
          }}
        >
          <button
            type="submit"
            title="search"
            className="absolute inset-y-0 ltr:inset-r-0 flex items-center justify-center text-white bg-blue-500 rounded-md w-8 h-8 top-[3px] end-1"
          >
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>
          <input
            type="text"
            id="table-search-users"
            className="block p-2 pe-10 text-sm text-gray-900 border border-slate-300 
              dark:border-slate-700 rounded-lg w-80 bg-gray-50 dark:bg-transparent
              focus:border-slate-500 dark:focus:border-slate-500 dark:placeholder-gray-400 
              dark:text-white outline-none"
            placeholder="Search for users"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </form>
      </header>

      {/* Users Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right shadow-lg border border-slate-300 dark:border-slate-700">
          <thead>
            <tr className="text-sm font-bold text-body bg-whiten dark:bg-boxdark-2 dark:text-bodydark">
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Role
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
            {fetchUsersLoad || searchUsersLoad ? (
              <tr>
                <td className="w-full p-4">loading ...</td>
              </tr>
            ) : users.length > 0 ? (
              <>
                {users.map((user: User) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    socket={socket}
                    searchKey={searchKey}
                    fetchUsers={fetchUsers}
                    searchUsers={searchUsers}
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
        usersLength={usersLength}
        limit={limit}
        setLimit={setLimit}
        searchKey={searchKey}
        usersPage={usersPage}
        setUsersPage={setUsersPage}
        searchUsersPage={searchUsersPage}
        setSearchUsersPage={setSearchUsersPage}
      />
    </>
  );
};

const UserRow = ({ user, socket, searchKey, fetchUsers, searchUsers }) => {
  const userData: User = user;
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const notify = useNotify();

  /* Start functions */
  const deleteUser = async (userId: number) => {
    try {
      setDeleteLoading(true);

      const confirmResult = confirm("Are you sure?");

      if (!confirmResult) return;

      await usersAPI.deleteUser(userId);

      searchKey ? searchUsers() : fetchUsers();

      notify("success", "User is deleted");
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Delete user fail!");
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  /* End functions */

  /* Start Sockets to set connectionStatus */
  useEffect(() => {
    socket.emit("checkUserConnected", userData._id);
  }, []);

  useEffect(() => {
    socket.on("checkUserConnected", ({ userId, isConnected }) => {
      if (isConnected && userId === userData._id) {
        setConnectionStatus(true);
      }
    });

    return () => {
      socket.off("checkUserConnected");
    };
  }, []);
  /* End Sockets to set connectionStatus */

  return (
    <tr className="border-b border-slate-300 dark:border-slate-700 text-sm text-body bg-white dark:bg-boxdark dark:text-bodydark font-normal">
      <th
        scope="row"
        className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
      >
        <img className="w-10 h-10 rounded-full" src={userData.avatar} alt="" />

        <div className="ps-3">
          <div className="text-base font-semibold">{userData.name}</div>
          <div className="font-normal text-gray-500">{userData.email}</div>
        </div>
      </th>

      <td className="px-6 py-4">
        {userData.role === ROLES_LIST.Admin
          ? "Admin"
          : userData.role === ROLES_LIST.SuperAdmin
            ? "Super Admin"
            : "User"}
      </td>

      <td className="px-6 py-4">
        {connectionStatus ? (
          <div className="flex items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
          </div>
        ) : (
          <div className="flex items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div> Offline
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        <Link
          to={`/users/${userData._id}/profile`}
          title="view user profile"
          className="text-blue-600 dark:text-blue-500 mr-4"
        >
          <FontAwesomeIcon icon={faEye} />
        </Link>

        <button
          type="button"
          title="delete this user"
          className="text-red-500"
          onClick={() => deleteUser(userData._id)}
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
  usersLength,
  limit,
  setLimit,
  searchKey,
  usersPage,
  setUsersPage,
  searchUsersPage,
  setSearchUsersPage,
}) => {
  const handleNext = () => {
    if (searchKey) {
      setSearchUsersPage(searchUsersPage + 1);
    } else {
      setUsersPage(usersPage + 1);
    }
  };

  const handlePrev = () => {
    if (searchKey && searchUsersPage > 1) {
      setSearchUsersPage(searchUsersPage - 1);
    } else if (!searchKey && usersPage > 1) {
      setUsersPage(usersPage - 1);
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
          disabled={
            searchKey && searchUsersPage === 1 ? true : !searchKey && usersPage === 1 ? true : false
          }
        >
          Previous
        </button>
        <button
          className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={usersLength < limit ? true : false}
        >
          Next
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="limit" className="text-sm">
          Users per page:
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

export default AdminUsers;
