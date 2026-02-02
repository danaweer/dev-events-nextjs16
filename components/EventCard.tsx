import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Props{
    title:string;
    image:string;
    slug:string;
    location:string;
    date:string;
    time:string;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  // Display a friendly date instead of the full ISO string.
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  return (
    <Link href={`/events/${slug}`} className="event-card">
        
        <Image
          src={image}
          alt={title}
          width={410}
          height={300}
          className="poster"
          style={{ width: "100%", height: "auto" }}
        />

        <div className='flex flex-row gap-2'>
            <img src="/icons/pin.svg" alt="location" width={14} height={14} />
            <p>{location}</p>
        </div>

        <p className='title'>{title}</p>

        <div className='datetime'>
            <div>
                <img src="/icons/calendar.svg" alt="date" width={14} height={14} />
            <p>{formatDate(date)}</p>
            </div>
            <div>
                <img src="/icons/clock.svg" alt="time" width={14} height={14} />
                <p>{time}</p>
            </div>
        </div>

    </Link>

  )
}

export default EventCard
