import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getEvent } from "@/lib/db";

interface PageProps {
    params: Promise<{
        event_id: string
    }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BreadcrumbSlot({
    params,
}: PageProps) {
    const resolvedParams = await params;
    const eventId = resolvedParams.event_id;
    // Fetch event details here
    const event = await getEvent(parseInt(eventId));
    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
            <BreadcrumbItem>
          <BreadcrumbLink className="text-md" href="/">בית</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="rotate-180" />

                <BreadcrumbItem>
                    <BreadcrumbLink className="text-md" href="/">אירועים</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="rotate-180" />
                <BreadcrumbItem>
                    <BreadcrumbPage className="text-md">{event[0].name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
} 