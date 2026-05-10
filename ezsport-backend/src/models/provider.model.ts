import { Schema, model, Document, Types } from "mongoose";

export enum ProviderActiveStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export interface IProvider extends Document {
  userId: Types.ObjectId;
  description: string;
  experienceYears: number;
  activeStatus: ProviderActiveStatus;
  verified: boolean;
  serviceCategories: Types.ObjectId[];
  workingAreas: string[];
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema<IProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    activeStatus: {
      type: String,
      enum: Object.values(ProviderActiveStatus),
      default: ProviderActiveStatus.OFFLINE,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    serviceCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServiceCategory",
      },
    ],
    workingAreas: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Provider = model<IProvider>("Provider", providerSchema);