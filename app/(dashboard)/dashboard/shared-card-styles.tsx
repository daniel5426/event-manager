import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

// Update all card headers to be responsive
<Card className="flex flex-col h-full">
  <CardHeader className="items-center pb-0 space-y-1">
    <CardTitle className="text-lg md:text-xl text-center">
      {/* Title */}
    </CardTitle>
    <CardDescription className="text-sm text-center">
      {/* Description */}
    </CardDescription>
  </CardHeader>
  {/* ... */}
  <CardFooter className="flex-col gap-2 text-xs md:text-sm">
    {/* ... */}
  </CardFooter>
</Card> 