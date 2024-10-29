import * as React from "react";
import { ForwardRefRenderFunction } from "react";
import { cn } from "../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        style={{
          display: 'flex',
          minHeight: '60px',
          width: '100%',
          borderRadius: '8px', // Assuming 'rounded-md' corresponds to '8px'
          border: '1px solid #e5e7eb', // Assuming 'border-input' is a light gray color
          backgroundColor: 'transparent',
          padding: '8px 12px', // Equivalent to 'px-3 py-2'
          fontSize: '0.875rem', // 'text-sm' corresponds to '14px'
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', // Assuming 'shadow-sm'
          color: 'inherit', // Inherit text color,
        }}
        ref={ref}
        {...props}
      />
    );
  }
) as React.ForwardRefExoticComponent<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>;
Textarea.displayName = "Textarea";

export { Textarea };
