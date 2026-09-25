import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { BarsLoader } from "@/components/ui/bars-loader"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-[#e45812] active:bg-[#c94b0b] disabled:bg-[#f4b28d] disabled:opacity-100",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-border bg-background hover:bg-secondary hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#dee1e6]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-6 text-sm",
        icon: "h-10 w-10",
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
  /** Shows the bar loader in place of the button's icon and blocks clicks, keeping the variant's colors. */
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, onClick, disabled, ...props }, ref) => {
    if (asChild) {
      return <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} onClick={onClick} {...(disabled === undefined ? {} : { disabled })} {...props}>{children}</Slot>
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), loading && "cursor-progress [&>svg]:!hidden")}
        ref={ref}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        data-loading={loading || undefined}
        // Not `disabled` while loading, so the button keeps its colors; clicks (and implicit form submits) are cancelled instead.
        onClick={loading ? (event) => event.preventDefault() : onClick}
        disabled={loading ? false : disabled}
        {...props}
      >
        {loading && <BarsLoader />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
