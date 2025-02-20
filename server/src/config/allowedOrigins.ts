import dotenv from "dotenv";

dotenv.config();

/**
 * Retrieves the list of allowed origins from the environment variable `ALLOWED_ORIGINS`.
 *
 * The `ALLOWED_ORIGINS` environment variable should contain a comma-separated string of URLs
 * that represent the allowed origins. This function parses that string and returns an array
 * of strings representing the allowed origins.
 *
 * Example of the `ALLOWED_ORIGINS` value in `.env`:
 * ```
 * ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
 * ```
 *
 * The returned array will contain the individual origins like so:
 * ```
 * ["http://localhost:3000", "http://localhost:5173"]
 * ```
 *
 * If the `ALLOWED_ORIGINS` environment variable is not set or is empty, the function will
 * return an empty array.
 *
 * @returns {string[]} An array of allowed origin URLs.
 *
 * @throws {Error} Throws an error if the environment variable is malformed or cannot be parsed.
 */
export const getAllowedOrigins = (): string[] => {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";

  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((origin) => origin.trim());

  return allowedOrigins;
};
