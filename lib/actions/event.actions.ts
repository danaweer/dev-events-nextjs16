'use server';
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import type { IEvent } from "@/lib/types";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
    try {
        await connectToDatabase(); //connect to database

        const event = await Event.findOne({ slug })
          .select("_id tags")
          .lean<{ _id: string; tags: string[] }>(); //fetch the event by slug
        if (!event) {
            return []; //return empty array if event not found
        }

        return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } })
          .lean<IEvent[]>(); //fetch events with similar tags excluding the current event 

    }catch (e) {
        return []; //return empty array on error
    }
}
