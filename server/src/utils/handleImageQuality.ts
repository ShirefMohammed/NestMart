import { promises as fsPromises } from "fs";
import path from "path";
import sharp from "sharp";

const handleImageQuality = async (
  destDir: string,
  inputFileName: string,
  outputFileName: string,
  width: number,
  height: number,
  quality: number,
): Promise<void> => {
  const inputPath = path.join(
    __dirname,
    "..",
    "database",
    "uploads",
    destDir,
    inputFileName,
  );

  const tempPath = path.join(
    __dirname,
    "..",
    "database",
    "uploads",
    destDir,
    `temp-${outputFileName}`,
  );

  const outputPath = path.join(
    __dirname,
    "..",
    "database",
    "uploads",
    destDir,
    outputFileName,
  );

  const format = outputFileName.split(".").pop()?.toLowerCase();

  await sharp(inputPath)
    .resize(width, height)
    .toFormat(format as keyof sharp.FormatEnum, { quality })
    .toFile(tempPath);

  await fsPromises.rename(tempPath, outputPath);
};

export default handleImageQuality;
