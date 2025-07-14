import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
       "flex h-10 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-base text-foreground placeholder:text-muted-foreground shadow-sm outline-none focus:outline-none focus:ring-0 focus:border-gray-300 transition-none",
     className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
