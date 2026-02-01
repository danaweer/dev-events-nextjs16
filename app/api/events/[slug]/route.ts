import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  slug?: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(req: NextRequest, { params }: { params: RouteParams }) {
  try {
    const slugFromParams = params.slug?.trim();
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const slugFromPath = pathSegments[pathSegments.length - 1];
    const slug = slugFromParams ?? slugFromPath;

    if (!slug) {
      return NextResponse.json({ message: "Slug is required." }, { status: 400 });
    }

    if (!slugPattern.test(slug)) {
      return NextResponse.json({ message: "Invalid slug format." }, { status: 400 });
    }

    await connectToDatabase();

    // Fetch the event by slug for detail views.
    const event = await Event.findOne({ slug });

    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Failed to fetch event." },
      { status: 500 }
    );
  }
} //handle GET request for event details by slug

