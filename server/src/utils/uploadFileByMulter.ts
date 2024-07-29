import { Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";

export const uploadFileByMulter = (
  destDir: "avatars" | "categories" | "products",
  fileType: string,
) => {
  const diskStorage: StorageEngine = multer.diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      cb(null, `src/database/uploads/${destDir}`);
    },

    filename: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      if (destDir === "avatars") {
        cb(
          null,
          `avatars-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`,
        );
      } else if (destDir === "categories") {
        cb(
          null,
          `categories-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`,
        );
      } else if (destDir === "products") {
        cb(
          null,
          `products-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`,
        );
      }
    },
  });

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    file.mimetype.split("/")[0] === fileType ? cb(null, true) : cb(null, false);
  };

  return multer({ storage: diskStorage, fileFilter });
};
