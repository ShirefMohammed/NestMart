import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { GetUserResponse } from "@shared/types/apiTypes";
import { User } from "@shared/types/entitiesTypes";

import { usersAPI } from "../../api/usersAPI";
import { useHandleErrors } from "../../hooks";
import { StoreState } from "../../store/store";
import DeleteUserAccount from "./components/DeleteUserAccount";
import UpdateUserAvatar from "./components/UpdateUserAvatar";
import UpdateUserInfo from "./components/UpdateUserInfo";
import UpdateUserPassword from "./components/UpdateUserPassword";

const UserSettings = () => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [currentUserData, setCurrentUserData] = useState<User>();
  const [fetchCurrentUserLoad, setFetchCurrentUserLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();

  // Fetch currentUser Data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (!currentUser._id) return;

        setFetchCurrentUserLoad(true);

        const res = await usersAPI.getUser(currentUser._id);

        const data: GetUserResponse = res.data.data;

        setCurrentUserData(data.user);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchCurrentUserLoad(false);
      }
    };

    fetchCurrentUser();
  }, [currentUser]);

  return (
    <section className="mx-auto max-w-270">
      <h2 className="pb-3 mb-4 border-b border-slate-200 font-bold text-lg">Settings</h2>

      {fetchCurrentUserLoad ? (
        "Loading ..."
      ) : currentUserData ? (
        <div className="grid grid-cols-5 gap-8">
          <UpdateUserInfo currentUser={currentUserData!} />

          <UpdateUserAvatar currentUser={currentUserData!} />

          <UpdateUserPassword currentUser={currentUserData!} />

          <DeleteUserAccount currentUser={currentUserData!} />
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default UserSettings;
