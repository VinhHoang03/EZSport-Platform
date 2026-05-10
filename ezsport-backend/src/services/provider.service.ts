import { Provider } from "../models/provider.model";

export const updateProviderStatus = async (
  userId: string,
  activeStatus: "ONLINE" | "OFFLINE"
) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    { activeStatus },
    { new: true }
  );

  if (!provider) {
    throw new Error("Provider not found");
  }

  return provider;
};