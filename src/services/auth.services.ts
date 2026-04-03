import prisma from "../db";
import { hashPassword, comparePassword } from "../utils/hash";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { generateResetToken } from "../utils/generateResetToken";
import logger from "../utils/logger";
import type { SignupInput, LoginInput, ResetPasswordInput, ChangePasswordInput } from "../validators/auth.schema";

export const authService = {
  async signup(input: SignupInput) {
    logger.info(`Signup attempt for email: ${input.email}`);

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingEmail) {
      logger.warn(`Signup failed: Email already registered - ${input.email}`);
      throw new Error("Email already registered");
    }

    try {
      // Hash password
      const hashedPassword = await hashPassword(input.password);

      // Create user with username defaulting to first part of email
      const emailParts = input.email.split("@");
      const defaultUsername = emailParts[0] || "user";

      // Create user
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          username: defaultUsername,
          passwordHash: hashedPassword,
        },
      });

      logger.info(`User created successfully: ${user.id} (${user.email})`);

      // Generate tokens
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt,
        },
      });

      logger.info(`Signup successful for user: ${user.id}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Signup failed for email ${input.email}:`, error);
      throw error;
    }
  },

  async login(input: LoginInput) {
    logger.info(`Login attempt for email: ${input.email}`);

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        logger.warn(`Login failed: User not found - ${input.email}`);
        throw new Error("Invalid email or password");
      }

      // Check if user is banned
      if (user.isBanned) {
        logger.warn(`Login failed: User banned - ${input.email}`);
        throw new Error("Your account has been banned");
      }

      // Compare passwords
      const isPasswordValid = await comparePassword(input.password, user.passwordHash);

      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password - ${input.email}`);
        throw new Error("Invalid email or password");
      }

      // Generate tokens
      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Save refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt,
        },
      });

      logger.info(`Login successful for user: ${user.id}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Login failed for email ${input.email}:`, error);
      throw error;
    }
  },

  async logout(userId: string, refreshToken: string) {
    logger.info(`Logout attempt for user: ${userId}`);

    try {
      // Delete refresh token
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });

      logger.info(`User logged out successfully: ${userId}`);
      return { message: "Logged out successfully" };
    } catch (error) {
      logger.error(`Logout failed for user ${userId}:`, error);
      throw error;
    }
  },

  async refreshAccessToken(refreshToken: string) {
    logger.debug(`Refresh token attempt`);

    try {
      // Verify refresh token JWT
      const payload = verifyRefreshToken(refreshToken);

      if (!payload) {
        logger.warn("Refresh token verification failed");
        throw new Error("Invalid or expired refresh token");
      }

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        logger.warn(`Refresh token not found in database for user: ${payload.userId}`);
        throw new Error("Refresh token has been revoked");
      }

      if (storedToken.expiresAt < new Date()) {
        logger.warn(`Refresh token expired for user: ${payload.userId}`);
        throw new Error("Refresh token has expired");
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        logger.warn(`User not found during token refresh: ${payload.userId}`);
        throw new Error("User not found");
      }

      // Generate new access token
      const newAccessToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info(`Token refreshed successfully for user: ${payload.userId}`);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      logger.error("Token refresh failed:", error);
      throw error;
    }
  },

  async forgotPassword(email: string) {
    logger.info(`Forgot password request for email: ${email}`);

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        logger.warn(`Forgot password: User not found - ${email}`);
        // Don't reveal if user exists for security
        return {
          resetToken: null,
          message: "If this email exists, you will receive a reset link",
        };
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const hashedResetToken = await hashPassword(resetToken);

      // Update user with reset token
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: hashedResetToken,
          resetTokenExpire: expiresAt,
        },
      });

      logger.info(`Reset token generated for user: ${user.id}`);

      // In a real app, send email with reset link
      // For now, just return the token
      return {
        resetToken,
        message: "Reset token sent to your email",
      };
    } catch (error) {
      logger.error(`Forgot password failed for email ${email}:`, error);
      throw error;
    }
  },

  async resetPassword(input: ResetPasswordInput) {
    logger.info(`Password reset attempt`);

    try {
      // Find user with a reset token
      const users = await prisma.user.findMany({
        where: {
          resetTokenExpire: {
            gt: new Date(),
          },
        },
      });

      let user = null;
      for (const u of users) {
        if (u.resetTokenHash) {
          const isValid = await comparePassword(input.token, u.resetTokenHash);
          if (isValid) {
            user = u;
            break;
          }
        }
      }

      if (!user) {
        logger.warn("Password reset: Invalid or expired reset token");
        throw new Error("Invalid or expired reset token");
      }

      // Hash new password
      const hashedPassword = await hashPassword(input.password);

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          resetTokenHash: null,
          resetTokenExpire: null,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "PASSWORD_CHANGED",
          title: "Password Changed",
          message: "Your password has been reset successfully",
        },
      });

      logger.info(`Password reset successfully for user: ${user.id}`);

      return { message: "Password reset successfully" };
    } catch (error) {
      logger.error("Password reset failed:", error);
      throw error;
    }
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    logger.info(`Password change attempt for user: ${userId}`);

    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn(`Password change: User not found - ${userId}`);
        throw new Error("User not found");
      }

      // Compare old password
      const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);

      if (!isPasswordValid) {
        logger.warn(`Password change: Invalid current password - ${userId}`);
        throw new Error("Invalid current password");
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: hashedPassword,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: "PASSWORD_CHANGED",
          title: "Password Changed",
          message: "Your password has been changed successfully",
        },
      });

      logger.info(`Password changed successfully for user: ${userId}`);

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error(`Password change failed for user ${userId}:`, error);
      throw error;
    }
  },

  async getCurrentUser(userId: string) {
    logger.debug(`Fetching current user: ${userId}`);

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        logger.warn(`Get current user: User not found - ${userId}`);
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      logger.error(`Get current user failed for user ${userId}:`, error);
      throw error;
    }
  },
};
