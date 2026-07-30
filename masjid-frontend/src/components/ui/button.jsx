import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  active = false,
  disabled,
  type,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : "button"
  const resolvedVariant = variant ?? (className ? "custom" : undefined)

  return (
    <Comp
      data-slot="button"
      data-active={active ? "true" : undefined}
      type={asChild ? undefined : type ?? "button"}
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant: resolvedVariant, size }), fullWidth && "w-full", className)}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : leftIcon}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon}
    </Comp>
  );
}

function IconButton({ "aria-label": ariaLabel, size = "icon", variant = "icon", children, ...props }) {
  return (
    <Button
      aria-label={ariaLabel}
      size={size}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  )
}

function ActionButton({ variant = "link", size = "sm", className, ...props }) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("h-auto px-0 py-0 font-medium", className)}
      {...props}
    />
  )
}

function TabButton({ active = false, variant = "tab", ...props }) {
  return <Button active={active} variant={variant} {...props} />
}

function SubmitButton({ type = "submit", fullWidth = true, variant = "primary", ...props }) {
  return <Button type={type} fullWidth={fullWidth} variant={variant} {...props} />
}

export { ActionButton, Button, IconButton, SubmitButton, TabButton }
