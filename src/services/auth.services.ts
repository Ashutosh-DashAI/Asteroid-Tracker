import prisma from "../db";
import { hashPassword, comparePassword } from "../utils/hash";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { generateResetToken } from "../utils/generateResetToken";
import type { SignupInput, LoginInput, ResetPasswordInput, ChangePasswordInput } from "../validators/auth.schema";

export const authService = {
  async signup(input: SignupInput) {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingEmail) {
      throw new Error("Email already registered");
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        passwordHash: hashedPassword,
      },
    });

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

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
      },
      token: accessToken,
      refreshToken,
    };
  },

  async login(input: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new Error("Your account has been banned");
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
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

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
      },
      token: accessToken,
      refreshToken,
    };
  },

  async logout(userId: string, refreshToken: string) {
    // Delete refresh token
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: "Logged out successfully" };
  },

  async refreshAccessToken(refreshToken: string) {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error("Invalid or expired refresh token");
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error("Refresh token has expired");
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate new access token
    const newAccessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token: newAccessToken,
    };
  },

  async forgotPassword(email: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
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

    // In a real app, send email with reset link
    // For now, just return the token
    return {
      resetToken,
      message: "Reset token sent to your email",
    };
  },

  async resetPassword(input: ResetPasswordInput) {
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

    return { message: "Password reset successfully" };
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Compare old password
    const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);

    if (!isPasswordValid) {
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

    return { message: "Password changed successfully" };
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
};
