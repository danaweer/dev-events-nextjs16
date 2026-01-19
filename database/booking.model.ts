import mongoose, { type Model, type Schema, type Types } from "mongoose";
import { Event } from "./event.model";

type BookingAttrs = {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type BookingDocument = mongoose.Document & BookingAttrs;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema: Schema<BookingDocument> = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => emailRegex.test(value),
        message: "Invalid email format.",
      },
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.pre("save", async function (next) {
  const doc = this as BookingDocument;

  if (doc.isModified("eventId")) {
    // Ensure the booking references an existing Event.
    const exists = await Event.exists({ _id: doc.eventId });
    if (!exists) {
      return next(new Error("Referenced event does not exist."));
    }
  }

  return next();
});

export const Booking: Model<BookingDocument> =
  mongoose.models.Booking ?? mongoose.model<BookingDocument>("Booking", BookingSchema);
