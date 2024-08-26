export const createImagesUrl = (targetDir: "avatars" | "categories" | "products", images: string[]) => {
  return images.map((image) => {
    return new URL(
      image,
      `${process.env.SERVER_URL}/api/database/uploads/${targetDir}/`,
    ).toString();
  });
};
