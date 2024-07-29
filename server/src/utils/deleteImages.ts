import { deleteFile } from "./deleteFile";

export const deleteImages = async (destDir: string, imagesNames: string[]) => {
  imagesNames.map(async (image: string) => {
    await deleteFile(destDir, image);
  });
};
