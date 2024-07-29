export const createImagesUrl = (targetDir: string, images: string[]) => {
  return images.map((image) => {
    return new URL(
      image,
      `${process.env.SERVER_URL}/api/database/uploads/${targetDir}/`,
    ).toString();
  });
};
