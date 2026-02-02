import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase(); // Connect to the MongoDB database

    const formData = await req.formData(); // Expect multipart/form-data for file upload
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Image file is required." }, { status: 400 });
    }

    let tags = JSON.parse(formData.get("tags") as string);
    let agenda = JSON.parse(formData.get("agenda") as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await imagekit.upload({
      file: buffer,
      fileName: file.name || "event-image",
      folder: "DevEvent",
    }); // Upload image to ImageKit

    const ALLOWED_FIELDS = [
      "title",
      "description",
      "overview",
      "venue",
      "location",
      "date",
      "time",
      "mode",
      "audience",
      "organizer",
      "tags",
      "agenda",
    ];

    const eventData: Record<string, string | string[]> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "image" || typeof value !== "string") continue;
      if (!ALLOWED_FIELDS.includes(key)) continue;

      // Support repeated keys (e.g., tags=Cloud&tags=DevOps) and JSON arrays.
      if (key === "tags" || key === "agenda") {
        if (value.trim().startsWith("[")) {
          try {
            eventData[key] = JSON.parse(value) as string[];
          } catch {
            return NextResponse.json(
              { message: `Invalid JSON format for ${key}` },
              { status: 400 }
            );
          }
          continue;
        }
        // Handle repeated keys

        const current = eventData[key];
        if (Array.isArray(current)) {
          current.push(value);
        } else if (typeof current === "string") {
          eventData[key] = [current, value];
        } else {
          eventData[key] = [value];
        }
        continue;
      }

      eventData[key] = value;
    } // Process other form fields

    eventData.image = uploadResult.url; // Set the image URL from ImageKit upload result

    const normalizeList = (input: string | string[] | undefined) => {
      if (!input) return [];
      if (Array.isArray(input)) {
        return input.flatMap((item) =>
          item
            .split(/"\s*,\s*"/)
            .map((part) => part.replace(/^"+|"+$/g, "").trim())
            .filter(Boolean)
        );
      }
      return input
        .split(/"\s*,\s*"/)
        .map((item) => item.replace(/^"+|"+$/g, "").trim())
        .filter(Boolean);
    };
    // Normalize list fields so they are always stored as string arrays.
    
    eventData.agenda = normalizeList(eventData.agenda);
    eventData.tags = normalizeList(eventData.tags);

    const createdEvent = await Event.create({
      ...eventData,
      tags: tags,
      agenda: agenda,
    }); // Create new event in the database

    revalidateTag("events");

    return NextResponse.json(
      { message: "Event Created Successfully", event: createdEvent },
      { status: 201 }
    );

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Event Creation Failed", error: e instanceof Error ? e.message : "Unknown Error" }, // Provide more specific error information
      { status: 500 }
    );
  }
} // Handle POST requests to create a new event

export async function GET() {
    try{

        await connectToDatabase(); // Connect to the MongoDB database

        const events = await Event.find().sort({ createdAt: -1 }); // Fetch all events from the database, sorted by creation date the newest first (-1)

        return NextResponse.json({message: "Events fetched successfully", events }, { status: 200 });

    }catch (e){
        return NextResponse.json({ message: "Failed to fetch events", error: e instanceof Error ? e.message : "Unknown Error" }, { status: 500 });  
    }
} // Handle GET requests to fetch all events
