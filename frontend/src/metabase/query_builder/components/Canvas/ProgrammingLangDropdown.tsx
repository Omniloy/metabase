import { ProgrammingLanguageOptions } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Code } from "lucide-react";
import { Button } from "./ui/button";
// import { Button } from "@mantine/core";
import { TooltipIconButton } from "./ui/assistant-ui/tooltip-icon-button";

interface ProgrammingLanguageListProps {
  handleSubmit: (portLanguage: ProgrammingLanguageOptions) => Promise<void>;
}

export function ProgrammingLanguageList(
  props: Readonly<ProgrammingLanguageListProps>
) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", width: "100%", textAlign: "left" }}>
      <TooltipIconButton
        tooltip="PHP"
        variant="ghost"
        className="transition-colors w-full h-fit"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("php")}
      >
        <p>PHP</p>
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="TypeScript"
        variant="ghost"
        className="transition-colors w-full h-fit px-1 py-1"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("typescript")}
      >
        <p>TypeScript</p>
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="JavaScript"
        variant="ghost"
        className="transition-colors w-full h-fit"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("javascript")}
      >
        <p>JavaScript</p>
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="C++"
        variant="ghost"
        className="transition-colors w-full h-fit"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("cpp")}
      >
        <p>C++</p>
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="Java"
        variant="ghost"
        className="transition-colors w-full h-fit"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("java")}
      >
        <p>Java</p>
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="Python"
        variant="ghost"
        className="transition-colors w-full h-fit"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("python")}
      >
        <p>Python</p>
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="HTML"
        variant="ghost"
        className="transition-colors w-full h-fit"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("html")}
      >
        <p>HTML</p>
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="SQL"
        variant="ghost"
        className="transition-colors w-full h-fit"
        delayDuration={400}
        onClick={async () => await props.handleSubmit("sql")}
      >
        <p>SQL</p>
      </TooltipIconButton>
    </div>
  );
}

const LANGUAGES: Array<{ label: string; key: ProgrammingLanguageOptions }> = [
  { label: "PHP", key: "php" },
  { label: "TypeScript", key: "typescript" },
  { label: "JavaScript", key: "javascript" },
  { label: "C++", key: "cpp" },
  { label: "Java", key: "java" },
  { label: "Python", key: "python" },
  { label: "HTML", key: "html" },
  { label: "SQL", key: "sql" },
];

export const ProgrammingLanguagesDropdown = ({
  handleSubmit,
}: {
  handleSubmit: (portLanguage: ProgrammingLanguageOptions) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          style={{
            border: "1px solid #e5e7eb",
            transition: 'background-color 0.2s ease',
            color: '#4B5563',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '250px',
            height: '64px',
            cursor: "pointer",
            borderRadius: "0.375rem",
          }}
        >
          New Code File
          <Code />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{ maxHeight: "600px", width: "250px", overflowY: "auto", backgroundColor: "white", padding: "1.5rem", borderRadius: "0.375rem" ,boxShadow: "0 10px 15px rgba(0, 0, 0, 0.15)" }}
       className="max-h-[600px] w-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <DropdownMenuLabel>Languages</DropdownMenuLabel>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.key}
            onSelect={() => handleSubmit(lang.key)}
            // style={{ cursor: "pointer"}}
            className="flex items-center justify-start gap-1"
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
