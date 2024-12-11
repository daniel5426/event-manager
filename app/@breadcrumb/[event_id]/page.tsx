import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getEvent } from "@/lib/db";
export default async function BreadcrumbSlot({
    params
}: {
    params: { event_id: string }
}) {
    const eventId = (await params).event_id;
    // Fetch event details here
    const event = await getEvent(parseInt(eventId)); // You'll need to implement this function
    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
            <BreadcrumbItem>
          <BreadcrumbLink className="text-md" href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

                <BreadcrumbItem>
                    <BreadcrumbLink className="text-md" href="/">Events</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="text-md">{event[0].name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
} 