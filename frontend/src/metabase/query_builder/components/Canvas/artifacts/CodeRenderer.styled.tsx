import styled from "@emotion/styled";

// Styled component for the CodeMirror container
export const StyledCodeMirrorContainer = styled.div`
  height: 100vh; /* Ensure it fills the viewport height */
  width: 100%; /* Ensure it fills the viewport width */
  overflow: hidden; /* Hide overflow */
  background-color: var(--mb-color-bg-light); /* Background color */
`;

// Styled component for the editor wrapper (for additional styles)
export const StyledEditorWrapper = styled.div`
  height: 100% !important; /* Fill the container */
  border: none !important; /* Remove the border */
  
  /* Additional styles for the editor */
  .cm-editor {
    background: transparent; /* Make the editor background transparent */
    color: #1b1e20; /* Text color */
    
    /* Hide the gutters */
    .cm-gutters {
      display: none; /* Hide gutters */
    }
  }
`;
