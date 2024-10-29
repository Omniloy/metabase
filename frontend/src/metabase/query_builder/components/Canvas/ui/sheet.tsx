import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
  style={{
    position: "fixed",
    inset: "0",
    zIndex: 50,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    transition: "all 0.7s",
  }}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> &
React.RefAttributes<React.ElementRef<typeof SheetPrimitive.Overlay>>
>;
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "left", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <AnimatePresence>
    <motion.div
    initial={{ x: '100%', opacity: 0 }}
    animate={{ x: '0%', opacity: 1 }}
    exit={{ x: '100%', opacity: 0 }}
    transition={{ duration: 0.3 }}
    style={{ 
      zIndex:100, 
      position: 'absolute', 
      top: 0, 
      bottom: 0, 
      right: 0, 
      width: '25%', 
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }}
  >
    <SheetPrimitive.Content
      ref={ref}
      style={{
        height: '100%',
        overflowY: 'auto', // Add this here
        scrollbarWidth: 'thin', // Ensure scrollbar width applies here too
      }}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close 
        style={{
          position: 'absolute',
          right: '1rem',
          top: '1rem',
          borderRadius: '0.125rem', 
          opacity: 0.7,
          transition: "all 0.7s",
          pointerEvents: 'auto',
          backgroundColor: 'transparent', 
          cursor: 'pointer',
        }}
      >
        <Cross2Icon style={{ width: "1rem", height: "1rem" }} />
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
    </motion.div>
    </AnimatePresence>
  </SheetPortal>
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> &
React.RefAttributes<React.ElementRef<typeof SheetPrimitive.Content>>
>;
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      gap: "0.5rem",
    }}
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column-reverse",
      justifyContent: "flex-end",
      gap: "0.5rem",
    }}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    style={{
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "var(--foreground-color)",
    }}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> &
React.RefAttributes<React.ElementRef<typeof SheetPrimitive.Title>>
>;
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    style={{
      fontSize: "0.875rem",
      color: "var(--muted-foreground-color)",
    }}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> &
React.RefAttributes<React.ElementRef<typeof SheetPrimitive.Description>>
>;
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
