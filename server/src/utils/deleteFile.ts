import fsPromises from "fs/promises";
import path from "path";

export const deleteFile = async (
  destDir: "avatars" | "categories" | "products",
  filename: string,
): Promise<void> => {
  try {
    await fsPromises.unlink(
      path.join(__dirname, "..", "database", "uploads", destDir, filename),
    );
  } catch (err) {
    console.log("Delete file error: ", err);
  }
};
