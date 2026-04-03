import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import env from "../config/env";
import logger from "./logger";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

const tokenOptions: SignOptions = {
  expiresIn: env.JWT_EXPIRE,
};

const refreshTokenOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRE,
};

export const generateToken = (payload: JWTPayload): string => {
  try {
    const token = jwt.sign(payload, env.JWT_SECRET, tokenOptions);
    logger.debug(`Generated access token for user ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error("Error generating access token:", error);
    throw new Error("Failed to generate token");
  }
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  try {
    const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOptions);
    logger.debug(`Generated refresh token for user ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    logger.debug(`Verified access token for user ${payload.userId}`);
    return payload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      logger.warn(`Access token expired for user: ${error.message}`);
    } else if (error.name === "JsonWebTokenError") {
      logger.warn(`Invalid access token: ${error.message}`);
    } else {
      logger.error("Error verifying access token:", error);
    }
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
    logger.debug(`Verified refresh token for user ${payload.userId}`);
    return payload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      logger.warn(`Refresh token expired for user: ${error.message}`);
    } else if (error.name === "JsonWebTokenError") {
      logger.warn(`Invalid refresh token: ${error.message}`);
    } else {
      logger.error("Error verifying refresh token:", error);
    }
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    logger.error("Error decoding token:", error);
    return null;
  }
};
