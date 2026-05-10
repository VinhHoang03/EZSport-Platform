import { Schema, model, Document, Types } from "mongoose";

export interface IServiceHistory extends Document {
  customerId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  addressId: Types.ObjectId;
  status: string;
  completedAt?: Date;
  createdAt: Date;
}

const serviceHistorySchema = new Schema<IServiceHistory>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ServiceHistory = model<IServiceHistory>(
  "ServiceHistory",
  serviceHistorySchema
);