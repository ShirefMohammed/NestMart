import { db } from "../database";

export const handleUnverifiedAccounts = async () => {
  setInterval(async () => {
    try {
      const unverifiedUsers = await db.getUnverifiedUsers("_id, createdAt");

      unverifiedUsers.map(async (user: any) => {
        if (Date.now() - user?.createdAt > 24 * 60 * 60 * 1000) {
          await db.deleteUser(user._id);
        }
      });
    } catch (err) {
      console.log("Error while handling unverified accounts: ", err);
    }
  }, 3600000);
};
