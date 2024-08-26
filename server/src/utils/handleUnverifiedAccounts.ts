import { User } from "@shared/types/entitiesTypes";

import { db } from "../database";

/* setInterval every 1 hour to check unverified users 
  and delete them if their creation time becomes more than 1 day */
export const handleUnverifiedAccounts = async () => {
  setInterval(async () => {
    try {
      const unverifiedUsers: User[] =
        await db.getUnverifiedUsers("_id, createdAt");

      unverifiedUsers.map(async (user: User) => {
        if (Date.now() - user.createdAt > 24 * 60 * 60 * 1000) {
          await db.deleteUser(user._id);
        }
      });
    } catch (err) {
      console.log("Error while handling unverified accounts: ", err);
    }
  }, 3600000);
};
