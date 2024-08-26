import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useParams } from "react-router-dom";

import { GetUserResponse } from "@shared/types/apiTypes";
import { User } from "@shared/types/entitiesTypes";

import { usersAPI } from "../../api/usersAPI";
import profileCover from "../../assets/profileCover.png";
import { useHandleErrors } from "../../hooks";
import { StoreState } from "../../store/store";
import { ROLES_LIST } from "../../utils/rolesList";

const UserProfile = () => {
  const { userId } = useParams();
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const [userProfileData, setUserProfileData] = useState<User>();
  const [fetchUserProfileLoad, setFetchUserProfileLoad] = useState<boolean>(false);
  const handleErrors = useHandleErrors();
  const location = useLocation();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        if (!userId) return;

        setFetchUserProfileLoad(true);

        const res = await usersAPI.getUser(+userId);

        const data: GetUserResponse = res.data.data;

        setUserProfileData(data.user);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUserProfileLoad(false);
      }
    };

    fetchUserProfileData();
  }, [userId]);

  return (
    <section className="mx-auto max-w-270">
      {userId &&
      currentUser._id !== +userId &&
      currentUser.role !== ROLES_LIST.Admin &&
      currentUser.role !== ROLES_LIST.SuperAdmin ? (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
      ) : fetchUserProfileLoad ? (
        "Loading ..."
      ) : userProfileData ? (
        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default">
          {/* Profile Cover */}
          <div className="relative z-20 h-35 md:h-65">
            <img
              src={profileCover}
              alt=""
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
            />
          </div>

          {/* Profile Info */}
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2">
                <img src={userProfileData.avatar} alt="" className="rounded-full" />
              </div>
            </div>

            <div className="mt-4">
              <h2 className="mb-1.5 text-2xl font-semibold text-black">{userProfileData.name}</h2>

              <p className="font-medium mb-1.5">{userProfileData.email}</p>

              <p className="font-bold">
                {userProfileData.role === ROLES_LIST.Admin
                  ? "Admin"
                  : userProfileData.role === ROLES_LIST.SuperAdmin
                    ? "Super Admin"
                    : "User"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default UserProfile;
