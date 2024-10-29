import { backgroundClip } from "html2canvas-pro/dist/types/css/property-descriptors/background-clip";
import { useEffect, useState } from "react";

export const AnimatedStack = ({ children, chatStarted }) => {
    const styles = {
        container: {
          transition: 'width 700ms ease-in-out',
          width: chatStarted ? '35%' : '100%',
          height: '100%',
          marginRight: 'auto',
          backgroundColor: 'rgba(249, 250, 251, 0.7)', // This matches bg-gray-50/70
          boxShadow: 'inset -1px 0 3px rgba(0, 0, 0, 0.1)', // Approximating shadow-inner-right
        }
      };
    
      return (
        <div style={styles.container}>
          {children}
        </div>
      );
  };