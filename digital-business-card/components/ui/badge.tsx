import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
          className,
        )}
        {...props}
        ref={ref}
      />
    )
  },
)
Badge.displayName = "Badge"

export { Badge }

import { Card as ShadCard, CardContent as ShadCardContent } from "@/components/ui/card"

const Card = React.forwardRef<React.ElementRef<typeof ShadCard>, React.ComponentPropsWithoutRef<typeof ShadCard>>(
  ({ className, ...props }, ref) => {
    return (
      <ShadCard
        className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
        {...props}
        ref={ref}
      />
    )
  },
)
Card.displayName = ShadCard.displayName

const CardContent = React.forwardRef<
  React.ElementRef<typeof ShadCardContent>,
  React.ComponentPropsWithoutRef<typeof ShadCardContent>
>(({ className, ...props }, ref) => {
  return <ShadCardContent className={cn("p-6 pt-0", className)} {...props} ref={ref} />
})
CardContent.displayName = ShadCardContent.displayName

export { Card, CardContent }
