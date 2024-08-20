import { useState } from "react";
import { MoonLoader } from "react-spinners";

import { User } from "@shared/types/entitiesTypes";

import { usersAPI } from "../../../api/usersAPI";
import { useLogout, useNotify } from "../../../hooks";
import { ROLES_LIST } from "../../../utils/rolesList";

const DeleteUserAccount = ({ currentUser }: { currentUser: User }) => {
  const [password, setPassword] = useState<string>("");
  const [deleteAccountLoad, setDeleteAccountLoad] = useState<boolean>(false);
  const logout = useLogout();
  const notify = useNotify();

  const deleteUserAccount = async () => {
    try {
      setDeleteAccountLoad(true);

      if (
        currentUser.role !== ROLES_LIST.Admin &&
        currentUser.role !== ROLES_LIST.SuperAdmin &&
        !password
      ) {
        return notify("info", "password is required");
      }

      const confirmResult = confirm("Are you sure?");

      if (!confirmResult) return;

      await usersAPI.deleteUser(currentUser._id, password);

      notify("success", "Account is deleted");

      logout();
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Delete password fail!");
      }
    } finally {
      setDeleteAccountLoad(false);
    }
  };

  return (
    <section className="col-span-5 xl:col-span-3">
      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <header className="border-b border-stroke py-4 px-7">
          <h3 className="font-medium text-black">Delete Account</h3>
        </header>

        <div className="p-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              deleteUserAccount();
            }}
          >
            {/* Password for Normal User */}
            {currentUser.role !== ROLES_LIST.Admin && currentUser.role !== ROLES_LIST.SuperAdmin ? (
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full">
                  <label className="mb-3 block text-sm font-medium text-black" htmlFor="Password">
                    Password
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                    type="password"
                    name="Password"
                    id="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              ""
            )}

            {/* Delete Btn */}
            <div className="flex justify-end gap-4.5">
              <button
                type="submit"
                disabled={deleteAccountLoad ? true : false}
                style={deleteAccountLoad ? { opacity: 0.5, cursor: "revert" } : {}}
                className="flex justify-center gap-4 rounded bg-red-500 py-2 px-6 w-full font-medium text-gray hover:bg-opacity-90"
              >
                <span>Delete My Account</span>
                {deleteAccountLoad && <MoonLoader color="#fff" size={15} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default DeleteUserAccount;
