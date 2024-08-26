import { useState } from "react";
import { MoonLoader } from "react-spinners";

import { User } from "@shared/types/entitiesTypes";

import { usersAPI } from "../../../api/usersAPI";
import { useNotify } from "../../../hooks";

const UpdateUserPassword = ({ currentUser }: { currentUser: User }) => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmedNewPassword, setConfirmedNewPassword] = useState<string>("");

  const [updatePasswordLoad, setUpdatePasswordLoad] = useState<boolean>(false);
  const notify = useNotify();

  const updateUserPassword = async () => {
    try {
      setUpdatePasswordLoad(true);

      if (!oldPassword || !newPassword || !confirmedNewPassword) {
        return notify("info", "Old, new and confirmed new passwords are required");
      }

      if (newPassword !== confirmedNewPassword) {
        return notify("info", "Confirmed new password must be equal new password");
      }

      const formData = new FormData();
      formData.append("oldPassword", oldPassword);
      formData.append("password", newPassword);

      const res = await usersAPI.updateUser(currentUser._id, formData);

      notify("success", res.data?.message);
    } catch (err) {
      if (!err?.response) {
        notify("error", "No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? notify("error", message) : notify("error", "Update password fail!");
      }
    } finally {
      setUpdatePasswordLoad(false);
    }
  };

  return (
    <section className="col-span-5 xl:col-span-3">
      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <header className="border-b border-stroke py-4 px-7">
          <h3 className="font-medium text-black">Account Password</h3>
        </header>

        <div className="p-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUserPassword();
            }}
          >
            {/* Old Password */}
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full">
                <label className="mb-3 block text-sm font-medium text-black" htmlFor="oldPassword">
                  Old Password
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                  type="password"
                  name="oldPassword"
                  id="oldPassword"
                  placeholder="Enter your old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full">
                <label className="mb-3 block text-sm font-medium text-black" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Confirmed New Password */}
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full">
                <label
                  className="mb-3 block text-sm font-medium text-black"
                  htmlFor="confirmedNewPassword"
                >
                  Confirmed New Password
                </label>
                <input
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none"
                  type="password"
                  name="confirmedNewPassword"
                  id="confirmedNewPassword"
                  placeholder="Enter your ConfirmedNew password"
                  value={confirmedNewPassword}
                  onChange={(e) => setConfirmedNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Save Btn */}
            <div className="flex justify-end gap-4.5">
              <button
                type="submit"
                disabled={updatePasswordLoad ? true : false}
                style={updatePasswordLoad ? { opacity: 0.5, cursor: "revert" } : {}}
                className="flex justify-center gap-4 rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
              >
                <span>Save</span>
                {updatePasswordLoad && <MoonLoader color="#fff" size={15} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UpdateUserPassword;
