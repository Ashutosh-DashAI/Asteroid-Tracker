import prisma from "../db";
import type { UpdateProfileInput } from "../validators/user.schema";

export const userService = {
  async getProfile(userId: string) {
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
        _count: {
          select: {
            followedBy: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      ...user,
      followersCount: user._count.followedBy,
      followingCount: user._count.following,
      _count: undefined,
    };
  },

  async getUserById(userId: string, currentUserId?: string) {
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
        _count: {
          select: {
            followedBy: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let isFollowing = false;
    if (currentUserId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      followersCount: user._count.followedBy,
      followingCount: user._count.following,
      isFollowing,
      _count: undefined,
    };
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    // Check if new username already exists
    if (input.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: input.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error("Username already taken");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        username: input.username,
        avatar: input.avatar,
        bio: input.bio,
      },
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

    return updatedUser;
  },

  async deleteAccount(userId: string) {
    // Delete all user data and the account
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "Account deleted successfully" };
  },

  async searchUsers(query: string, limit: number = 10, offset: number = 0) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isVerified: true,
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    return {
      users,
      total,
      hasMore: offset + limit < total,
    };
  },

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    const user = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new Error("Already following this user");
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: followingId,
        type: "FOLLOW",
        title: "New Follower",
        message: `Someone followed you`,
      },
    });

    return { message: "User followed successfully" };
  },

  async unfollowUser(followerId: string, followingId: string) {
    const follow = await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    if (follow.count === 0) {
      throw new Error("Not following this user");
    }

    return { message: "User unfollowed successfully" };
  },

  async getFollowers(userId: string, limit: number = 10, offset: number = 0) {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.follow.count({
      where: { followingId: userId },
    });

    return {
      followers: followers.map((f: any) => f.follower),
      total,
      hasMore: offset + limit < total,
    };
  },

  async getFollowing(userId: string, limit: number = 10, offset: number = 0) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.follow.count({
      where: { followerId: userId },
    });

    return {
      following: following.map((f: any) => f.following),
      total,
      hasMore: offset + limit < total,
    };
  },
};
