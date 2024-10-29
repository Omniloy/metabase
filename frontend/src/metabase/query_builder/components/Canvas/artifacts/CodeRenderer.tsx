import { ArtifactCodeV3 } from "../types"
import { Dispatch, MutableRefObject, SetStateAction, useEffect } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { StyledCodeMirrorContainer, StyledEditorWrapper} from "./CodeRenderer.styled";
import { cleanContent } from "../lib/normalize_string";
import { html } from "@codemirror/lang-html";
import { sql } from "@codemirror/lang-sql";
import { cn } from "../lib/utils";

export interface CodeRendererProps {
  artifactContent: ArtifactCodeV3;
  setArtifactContent: (index: number, content: string) => void;
  editorRef: MutableRefObject<EditorView | null>;
  firstTokenReceived: boolean;
  isStreaming: boolean;
  updateRenderedArtifactRequired: boolean;
  setUpdateRenderedArtifactRequired: Dispatch<SetStateAction<boolean>>;
}

export function CodeRenderer(props: Readonly<CodeRendererProps>) {
  let extensions: any[] = [];
  if (props.artifactContent.language === "javascript") {
    extensions = [javascript({ jsx: true, typescript: false })];
  } else if (props.artifactContent.language === "typescript") {
    extensions = [javascript({ jsx: true, typescript: true })];
  } else if (props.artifactContent.language === "cpp") {
    extensions = [cpp()];
  } else if (props.artifactContent.language === "java") {
    extensions = [java()];
  } else if (props.artifactContent.language === "php") {
    extensions = [php()];
  } else if (props.artifactContent.language === "python") {
    extensions = [python()];
  } else if (props.artifactContent.language === "html") {
    extensions = [html()];
  } else if (props.artifactContent.language === "sql") {
    extensions = [sql()];
  }

  useEffect(() => {
    if (props.updateRenderedArtifactRequired) {
      props.setUpdateRenderedArtifactRequired(false);
    }
  }, [props.updateRenderedArtifactRequired]);

  if (!props.artifactContent.code) {
    return null;
  }

  const isEditable = !props.isStreaming;

  const codeMirrorStyles = {
    height: "100vh",
    overflow: "hidden",
    width: "100%",
    minHeight: "100%",
  };
  
  const customTheme = EditorView.theme(
    {
      "&": {
        height: "100vh",
        overflow: "hidden",
      },
      ".cm-editor": {
        height: "100% !important",
        border: "none !important",
      },
      ".cm-scroller": {
        overflow: "auto",
      },
      ".cm-gutters": {
        display: "none",
      },
      ".cm-focused": {
        outline: "none !important",
      },
    },
    { dark: true } // Set this based on whether you want a light or dark theme
  );

  console.log("CODE MIRROR PROPS", props);
  console.log("extensions",extensions)
  return (
    <>
      {/* <style jsx global>{`
        .pulse-code .cm-content {
          animation: codePulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes codePulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style> */}
      <StyledCodeMirrorContainer>
      <StyledEditorWrapper>
      <CodeMirror
        editable={isEditable}
        style={codeMirrorStyles}
        // className={cn(
        //   "w-full min-h-full",
        //   styles.codeMirrorCustom,
        //   props.isStreaming && !props.firstTokenReceived ? "pulse-code" : ""
        // )}
        value={cleanContent(props.artifactContent.code)}
        height="800px"
        extensions={[...extensions, customTheme]} 
        onChange={(c) =>
          props.setArtifactContent(props.artifactContent.index, c)
        }
        onCreateEditor={(view) => {
          props.editorRef.current = view;
        }}
      />
      </StyledEditorWrapper>
      </StyledCodeMirrorContainer>
    </>
  );
}
