import { deleteFile } from "./deleteFile";

export const deleteImages = async (
  destDir: "avatars" | "categories" | "products",
  imagesNames: string[],
) => {
  imagesNames.map(async (image: string) => {
    await deleteFile(destDir, image);
  });
};
