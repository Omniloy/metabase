import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons";

import { cn } from "../lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    style={{
      display: "flex",
      cursor: "default",
      userSelect: "none",
      alignItems: "center",
      borderRadius: "0.25rem",        
      paddingTop: "0.375rem",         
      paddingBottom: "0.375rem",
      paddingLeft: inset ? "1rem" : "0.5rem",  
      paddingRight: "0.5rem",         
      fontSize: "0.875rem",           
      outline: "none",
      transition: "background-color 0.2s ease",
    }}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon style={{marginLeft: "auto", height: "1rem", width: "1rem"}} />
  </DropdownMenuPrimitive.SubTrigger>
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>>
>;
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    style={{
      zIndex: 50,
      minWidth: "8rem",
      overflow: "hidden",
      borderRadius: "0.375rem", // adjust for exact border-radius
      border: "1px solid", // adjust border style if needed
      backgroundColor: "var(--popover-bg-color)", // replace with actual color value if needed
      padding: "0.25rem",
      color: "var(--popover-foreground-color)", // replace with actual color value if needed
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // approximate shadow-lg
    }}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>>
>;
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      style={{
        zIndex: 50,
        minWidth: "8rem",
        overflow: "hidden",
        borderRadius: "0.375rem", // adjust for exact border-radius
        border: "1px solid", // adjust border style if needed
        backgroundColor: "white", // replace with actual color value if needed
        padding: "0.25rem",
        color: "var(--popover-foreground-color)", // replace with actual color value if needed
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // approximate shadow-md
      }}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.Content>>
>;
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    style={{
      position: "relative",
      display: "flex",
      cursor: "pointer",
      userSelect: "none",
      alignItems: "center",
      gap: "0.5rem",
      borderRadius: "0.25rem",        
      paddingTop: "0.375rem",         
      paddingBottom: "0.375rem",
      paddingLeft: inset ? "1rem" : "0.5rem",  
      paddingRight: "0.5rem",         
      fontSize: "0.875rem",           
      outline: "none",
      transition: "color 0.2s ease, background-color 0.2s ease", 
    }}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.Item>>
>;
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    style={{
      position: "relative",
      display: "flex",
      cursor: "default",
      userSelect: "none",
      alignItems: "center",
      borderRadius: "0.25rem",        
      paddingTop: "0.375rem",         
      paddingBottom: "0.375rem",
      paddingLeft: "2rem",            
      paddingRight: "0.5rem",         
      fontSize: "0.875rem",           
      outline: "none",
      transition: "color 0.2s ease, background-color 0.2s ease", 
    }}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span style={{position: "absolute", left: "0.5rem", display: "flex", height: "1.5rem", width: "1.5rem", alignItems: "center", justifyContent: "center"}}>
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon style={{height: "1rem", width: "1rem"}} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>>
>;
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    style={{
      position: "relative",
      display: "flex",
      cursor: "default",
      userSelect: "none",
      alignItems: "center",
      borderRadius: "0.25rem", // Adjust for exact rounded-sm value
      paddingTop: "0.375rem",   // Approximation for py-1.5
      paddingBottom: "0.375rem",
      paddingLeft: "2rem",      // Approximation for pl-8
      paddingRight: "0.5rem",   // Approximation for pr-2
      fontSize: "0.875rem",     // Equivalent to text-sm
      outline: "none",
      transition: "color 0.2s ease, background-color 0.2s ease", 
    }}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span style={{position: "absolute", left: "0.5rem", display: "flex", height: "1.5rem", width: "1.5rem", alignItems: "center", justifyContent: "center"}}>
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon style={{height: "1rem", width: "1rem", fill: "currentColor"}} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>>
>;
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    style={{
      paddingTop: "0.375rem",         
      paddingBottom: "0.375rem",
      paddingLeft: inset ? "1rem" : "0.5rem",  
      paddingRight: "0.5rem",         
      fontSize: "0.875rem",           
      fontWeight: "500",
    }}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.Label>>
>;
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    style={{ margin: "0.5rem", height: "1px", backgroundColor: "var(--muted-color)", }}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> &
React.RefAttributes<React.ElementRef<typeof DropdownMenuPrimitive.Separator>>
>;
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
    style={{marginLeft: "auto", fontSize: "0.75rem", opacity: 0.6, }}
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
