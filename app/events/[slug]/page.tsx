import { notFound } from 'next/navigation';
import React from 'react'
import BookEvent from '@/components/BookEvent';
import { IEvent } from '@/lib/types';
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions';
import EventCard from '@/components/EventCard';
import { cacheLife } from 'next/cache';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

//reusabe component and function definitions
const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}; //function to format date strings into a more readable format

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <img src={icon} alt={alt} width={17} height={17} />
    <span>{label}</span>
  </div> 
); //component for displaying individual event detail items with their respective icons

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className='agenda'>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))} 
    </ul>
  </div>
); //component for displaying the event agenda as a list

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className='flex flex-row gap-1.5 flex-wrap'>
    {tags.map((tag) => (
      <div className='pill' key={tag}>{tag}</div>
    ))}
  </div>
)

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  'use cache';
  cacheLife('hours'); //cache the page for 60 seconds
  
  const { slug } = await params; //get slug from route parameters

  const request = await fetch(`${BASE_URL}/api/events/${slug}`); //fetch event details from API route

  if (!request.ok) {
    return notFound();
  }

  const data = (await request.json()) as {
    event?: {
      _id?: string;
      slug?: string;
      description: string;
      image: string;
      overview: string;
      date: string;
      time: string;
      location: string;
      mode: string;
      agenda: string[] | string;
      audience: string;
      tags: string[] | string;
      organizer: string;
    };
  }; //type definition for event data

  if (!data.event?.description) return notFound();

  const event = data.event;
  const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } =
    event; //extract event data from response

  if (!description) return notFound();

  const bookings = 10; //number of bookings (placeholder value)

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug); //fetch similar events using server action

  return (
    <section id="event">
      <div className='header'>
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className='details'>
        
        {/*left side content */}
        <div className='content'>
          <img src={image} alt="Event Banner" width={800} height={800} className='banner' />

          <section className='flex-col-gap-2'>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className='flex-col-gap-2'>
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="Calendar Icon" label={formatDate(date)} />
            <EventDetailItem icon="/icons/clock.svg" alt="Clock Icon" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="Location Icon" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="Mode Icon" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="Audience Icon" label={audience} /> 
          </section>

          <EventAgenda agendaItems={
              Array.isArray(agenda)
                ? agenda
                    .flatMap((item) =>
                      item
                        .split(/"\s*,\s*"/)
                        .map((part) => part.replace(/^"+|"+$/g, "").trim())
                        .filter(Boolean)
                    )
                : agenda
                    .split(/"\s*,\s*"/)
                    .map((item) => item.replace(/^"+|"+$/g, "").trim())
                    .filter(Boolean)
            }
          />

          <section className='flex-col-gap-2'>
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={
              Array.isArray(tags)
                ? tags
                    .flatMap((item) =>
                      item
                        .split(/"\s*,\s*"/)
                        .map((part) => part.replace(/^"+|"+$/g, "").trim())
                        .filter(Boolean)
                    )
                : tags
                    .split(/"\s*,\s*"/)
                    .map((item) => item.replace(/^"+|"+$/g, "").trim())
                    .filter(Boolean)
            }/>

        </div>

        {/*right side content */}
        <aside className='booking'>
          <div className='signup-card'>
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className='text-sm'>
                join {bookings} people who have already booked their spot!
              </p>
            ):(
              <p className='text-sm'>Be the first to book your spot!</p>
            )} 

            <BookEvent eventId={event._id ?? ""} slug={event.slug ?? slug} /> {/*booking form component */}

          </div>
        </aside>
      </div>

      <div className='flex w-full flex-col gap-4 pt-20'>
        <h2>Similar Events</h2>
        <div className='events'>
            {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) =>(
              <EventCard key={similarEvent.slug ?? similarEvent.title} {...similarEvent}/> //render similar event cards
            ))}
        </div>
      </div>
    </section>
  )
}

export default EventDetailsPage
