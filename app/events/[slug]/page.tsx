import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return (
    <div>
      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetails slug={slug} />
      </Suspense>
    </div>
  );
};

export default EventDetailsPage;
