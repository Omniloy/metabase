import * as React from "react";
import { ForwardRefRenderFunction } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "../lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{
      position: "fixed",
      inset: "0",
      zIndex: 50,
      backgroundColor: "rgba(0, 0, 0, 0.8)", // Adjust the opacity as needed
      transition: "background-color 0.2s ease",
    }}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
  React.RefAttributes<React.ElementRef<typeof DialogPrimitive.Overlay>>
>;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseIcon?: boolean;
  }
>(({ className, children, hideCloseIcon = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        zIndex: 50,
        display: "grid",
        width: "100%",
        maxWidth: "32rem",             
        transform: "translate(-50%, -50%)",
        gap: "1rem",                  
        border: "1px solid",           // Replace with specific border color if needed
        backgroundColor: "var(--background-color)", // Replace with actual background color if needed
        padding: "1.5rem",            
        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.15)",
        transitionDuration: "200ms", 
      }}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {!hideCloseIcon && (
        <DialogPrimitive.Close style={{ position: "absolute", right: "0.25rem", top: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.375rem", opacity: 0.7, transition: "opacity 0.2s ease", cursor: "pointer", outline: "none", boxShadow: "0 0 0 2px #000", backgroundColor: "transparent", color: "var(--foreground-color)", }}>
          <Cross2Icon style={{ height: "1rem", width: "1rem" }} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
React.RefAttributes<React.ElementRef<typeof DialogPrimitive.Content>>
>;
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> &
React.RefAttributes<React.ElementRef<typeof DialogPrimitive.Title>>
>;
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> &
React.RefAttributes<React.ElementRef<typeof DialogPrimitive.Description>>
>;
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
