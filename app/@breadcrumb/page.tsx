import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BreadcrumbSlot() {
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
      </BreadcrumbList>
    </Breadcrumb>
  );
} 