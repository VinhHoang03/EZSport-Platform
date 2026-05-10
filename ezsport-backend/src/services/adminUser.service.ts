import User from "../models/user.model";

export const getUsers = async (role?: string) => {
  const filter: any = {};

  if (role) {
    filter.role = role;
  }

  return User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 });
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserStatus = async (
  userId: string,
  status: "ACTIVE" | "INACTIVE" | "BANNED"
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};