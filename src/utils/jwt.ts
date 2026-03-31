import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import env from "../config/env";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

const tokenOptions: SignOptions = {
  expiresIn: "15m",
};

const refreshTokenOptions: SignOptions = {
  expiresIn: "7d",
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET || "supersecret", tokenOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET || "supersecret", refreshTokenOptions);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
