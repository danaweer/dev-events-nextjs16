import mongoose, { type Model, type Schema } from "mongoose";

type EventAttrs = {
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

type EventDocument = mongoose.Document & EventAttrs;

const nonEmptyString = {
  validator: (value: string) => value.trim().length > 0,
  message: "Field cannot be empty.",
};

const nonEmptyStringArray = {
  validator: (value: string[]) =>
    Array.isArray(value) && value.length > 0 && value.every((item) => item.trim().length > 0),
  message: "Array cannot be empty.",
};

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format.");
  }
  // Store as ISO string for consistent sorting.
  return parsed.toISOString();
}

function normalizeTime(value: string): string {
  const trimmed = value.trim();
  const hhmm = /^(\d{1,2}):(\d{2})$/;
  const ampm = /^(\d{1,2}):(\d{2})\s*([ap]m)$/i;

  const hhmmMatch = trimmed.match(hhmm);
  if (hhmmMatch) {
    const hours = Number(hhmmMatch[1]);
    const minutes = Number(hhmmMatch[2]);
    if (hours > 23 || minutes > 59) {
      throw new Error("Invalid time format.");
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const ampmMatch = trimmed.match(ampm);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const suffix = ampmMatch[3].toLowerCase();
    if (hours < 1 || hours > 12 || minutes > 59) {
      throw new Error("Invalid time format.");
    }
    hours = suffix === "pm" ? (hours % 12) + 12 : hours % 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  throw new Error("Invalid time format.");
}

const EventSchema: Schema<EventDocument> = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, validate: nonEmptyString },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, trim: true, validate: nonEmptyString },
    overview: { type: String, required: true, trim: true, validate: nonEmptyString },
    image: { type: String, required: true, trim: true, validate: nonEmptyString },
    venue: { type: String, required: true, trim: true, validate: nonEmptyString },
    location: { type: String, required: true, trim: true, validate: nonEmptyString },
    date: { type: String, required: true, trim: true, validate: nonEmptyString },
    time: { type: String, required: true, trim: true, validate: nonEmptyString },
    mode: { type: String, required: true, trim: true, validate: nonEmptyString },
    audience: { type: String, required: true, trim: true, validate: nonEmptyString },
    agenda: { type: [String], required: true, validate: nonEmptyStringArray },
    organizer: { type: String, required: true, trim: true, validate: nonEmptyString },
    tags: { type: [String], required: true, validate: nonEmptyStringArray },
  },
  {
    timestamps: true,
  }
);

EventSchema.pre("save", function (next) {
  const doc = this as EventDocument;

  if (doc.isModified("title")) {
    // Generate slug only when title changes.
    doc.slug = slugifyTitle(doc.title);
  }

  // Normalize date and time to a consistent storage format.
  doc.date = normalizeDate(doc.date);
  doc.time = normalizeTime(doc.time);

  next();
});

export const Event: Model<EventDocument> =
  mongoose.models.Event ?? mongoose.model<EventDocument>("Event", EventSchema);
