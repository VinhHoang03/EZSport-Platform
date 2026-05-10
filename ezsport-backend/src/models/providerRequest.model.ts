import { Schema, model, Document, Types } from "mongoose";

export enum ProviderRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IProviderRequest extends Document {
  userId: Types.ObjectId;
  description: string;
  experienceYears: number;
  serviceCategories: Types.ObjectId[];
  workingAreas: string[];
  status: ProviderRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const providerRequestSchema = new Schema<IProviderRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    serviceCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServiceCategory",
        required: true,
      },
    ],
    workingAreas: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: Object.values(ProviderRequestStatus),
      default: ProviderRequestStatus.PENDING,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ProviderRequest = model<IProviderRequest>(
  "ProviderRequest",
  providerRequestSchema
);