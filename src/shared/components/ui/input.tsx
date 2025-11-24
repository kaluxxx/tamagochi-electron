import * as React from "react"

import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-button border-3 border-border bg-white px-4 py-2 text-base font-sans shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-pink focus-visible:border-primary-pink disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-text-secondary",
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
