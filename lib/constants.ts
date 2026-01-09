export type EventItem = { //this is where the data is for each card
    title:string;
    image:string;
    slug:string;
    location:string;
    date:string;
    time:string;
};

export const events: EventItem[] = [
     {
    image: "/images/event1.png",
    title: "Google Cloud Next 2026",
    slug: "google-cloud-next-2026",
    location: "San Jose, CA, USA",
    date: "2026-04-07",
    time: "09:00 AM",
  },
  {
    image: "/images/event2.png",
    title: "ETHGlobal Hackathon: Paris 2026",
    slug: "ethglobal-paris-2026",
    location: "Paris, France",
    date: "2026-07-10",
    time: "10:00 AM",
  },
  {
    image: "/images/event3.png",
    title: "Open Source Summit North America 2026",
    slug: "oss-na-2026",
    location: "Vancouver, Canada",
    date: "2026-06-22",
    time: "09:30 AM",
  },
  {
    image: "/images/event4.png",
    title: "AI & Web Conference 2026",
    slug: "ai-web-conf-2026",
    location: "Berlin, Germany",
    date: "2026-05-18",
    time: "11:00 AM",
  },
  {
    image: "/images/event5.png",
    title: "Next.js Global Meetup",
    slug: "nextjs-global-meetup",
    location: "London, UK",
    date: "2026-03-12",
    time: "06:00 PM",
  },
  {
    image: "/images/event6.png",
    title: "Tech Projects Hub Live",
    slug: "tech-projects-hub-live",
    location: "Online",
    date: "2026-08-01",
    time: "05:00 PM",
  },
]

