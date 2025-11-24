import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-pixel text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-pink disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary-pink to-pink-600 text-white border-4 border-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
        destructive:
          "bg-gradient-to-br from-danger-red to-red-600 text-white border-4 border-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
        outline:
          "border-4 border-primary-pink bg-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 text-text-primary",
        secondary:
          "bg-gradient-to-br from-primary-blue to-blue-600 text-white border-4 border-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
        ghost: "hover:bg-primary-pink/10",
        link: "text-primary-pink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
