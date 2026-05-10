import mongoose, { Document, Schema } from "mongoose";

export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RequestType = "NORMAL" | "URGENT" | "RECURRING";

export interface IServiceRequest extends Document {
  customerId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  requestType: RequestType;
  scheduledTime: Date;
  description?: string;
  media: string[];
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    requestType: {
      type: String,
      enum: ["NORMAL", "URGENT", "RECURRING"],
      default: "NORMAL",
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    description: String,
    media: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IServiceRequest>(
  "ServiceRequest",
  serviceRequestSchema
);