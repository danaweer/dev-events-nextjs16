'use server';
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import type { IEvent } from "@/lib/types";
import { unstable_cache } from "next/cache";

export const getEventBySlug = unstable_cache(
  async (slug: string) => {
    try {
      await connectToDatabase();
      return await Event.findOne({ slug }).lean();
    } catch (e) {
      return null;
    }
  },
  ["event-by-slug"],
  { revalidate: 3600 }
);

export const getSimilarEventsBySlug = unstable_cache(
  async (slug: string): Promise<IEvent[]> => {
    try {
      await connectToDatabase(); //connect to database

      const event = await Event.findOne({ slug })
        .select("_id tags")
        .lean<{ _id: string; tags: string[] }>(); //fetch the event by slug
      if (!event) {
        return []; //return empty array if event not found
      }

      return await Event.find({
        _id: { $ne: event._id },
        tags: { $in: event.tags },
      }).lean<IEvent[]>(); //fetch events with similar tags excluding the current event
    } catch (e) {
      return []; //return empty array on error
    }
  },
  ["similar-events-by-slug"],
  { revalidate: 3600 }
);
