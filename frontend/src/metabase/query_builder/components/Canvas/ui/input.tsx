import * as React from "react";
import { ForwardRefRenderFunction } from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        style={{
          display: 'flex',
          height: '36px', // Corresponding to 'h-9'
          width: '100%',
          borderRadius: '8px', // Assuming 'rounded-md' corresponds to '8px'
          border: '1px solid #e5e7eb', // Assuming 'border-input' is a light gray color
          backgroundColor: 'transparent',
          padding: '4px 12px', // Equivalent to 'px-3 py-1'
          fontSize: '0.875rem', // 'text-sm' corresponds to '14px'
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', // Assuming 'shadow-sm'
          transition: 'background-color 0.2s ease-in', // Assuming transition effect
          color: 'inherit', // Inherit text color
        }}
        ref={ref}
        {...props}
      />
    );
  }
) as React.ForwardRefExoticComponent<
React.InputHTMLAttributes<HTMLInputElement>
>;
Input.displayName = "Input";

export { Input };
