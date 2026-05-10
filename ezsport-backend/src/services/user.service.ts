import User from "../models/user.model";

interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export const updateProfileService = async (
  userId: string,
  data: UpdateProfileInput
) => {

  const updateData: any = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      returnDocument: "after"
    }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};