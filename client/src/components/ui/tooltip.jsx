import * as React from "react"
import { cn } from "../../lib/utils"

const Tooltip = React.forwardRef(({ className, children, content, show, ...props }, ref) => {
  return (
    <div className="relative group" ref={ref} {...props}>
      {children}
      {show && (
        <div className="absolute left-full ml-2 px-2 py-1 text-xs text-popover-foreground bg-popover border border-border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
          {content}
          <div className="absolute top-1/2 right-full transform -translate-y-1/2 border-4 border-transparent border-r-popover"></div>
        </div>
      )}
    </div>
  )
})

Tooltip.displayName = "Tooltip"

export { Tooltip } 