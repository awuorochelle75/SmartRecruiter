import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  // Move to bottom right, add theme-aware styles
  "fixed z-50 flex flex-col gap-2 right-4 bottom-4 w-96 max-w-full"
)

export function Toaster({ children, className, ...props }) {
  return (
    <div className={cn(toastVariants(), className)} {...props}>
      {children}
    </div>
  )
} 