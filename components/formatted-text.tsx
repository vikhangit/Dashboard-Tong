import React from "react";
import { cn } from "@/lib/utils";

interface FormattedTextProps {
  text: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function FormattedText({
  text,
  className,
  onClick,
  title,
}: FormattedTextProps) {
  if (!text) return null;

  // Split by newlines first to handle paragraphs/breaks
  const lines = text.split("\n");

  return (
    <div
      className={cn("whitespace-pre-wrap", className)}
      onClick={onClick}
      title={title}
    >
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {parseMarkdown(line)}
          {lineIndex < lines.length - 1 && "\n"}
        </React.Fragment>
      ))}
    </div>
  );
}

function parseMarkdown(text: string): React.ReactNode[] {
  // Regex for **bold** and *italic*
  // This is a simple parser and might not handle nested complex cases perfectly
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyCounter = 0;

  while (currentText.length > 0) {
    // Find next marker
    const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
    const italicMatch = currentText.match(/\*(.*?)\*/);

    let matchIndex = -1;
    let matchLength = 0;
    let matchContent = "";
    let type: "bold" | "italic" | "text" = "text";

    // Determine which comes first
    if (boldMatch && italicMatch) {
      if ((boldMatch.index ?? Infinity) <= (italicMatch.index ?? Infinity)) {
        matchIndex = boldMatch.index!;
        matchLength = boldMatch[0].length;
        matchContent = boldMatch[1];
        type = "bold";
      } else {
        matchIndex = italicMatch.index!;
        matchLength = italicMatch[0].length;
        matchContent = italicMatch[1];
        type = "italic";
      }
    } else if (boldMatch) {
      matchIndex = boldMatch.index!;
      matchLength = boldMatch[0].length;
      matchContent = boldMatch[1];
      type = "bold";
    } else if (italicMatch) {
      matchIndex = italicMatch.index!;
      matchLength = italicMatch[0].length;
      matchContent = italicMatch[1];
      type = "italic";
    }

    if (matchIndex === -1) {
      // No more matches
      parts.push(<span key={keyCounter++}>{currentText}</span>);
      break;
    }

    // Push text before match
    if (matchIndex > 0) {
      parts.push(
        <span key={keyCounter++}>{currentText.substring(0, matchIndex)}</span>,
      );
    }

    // Push match
    if (type === "bold") {
      parts.push(
        <strong key={keyCounter++} className="font-bold">
          {matchContent}
        </strong>,
      );
    } else {
      parts.push(
        <em key={keyCounter++} className="italic">
          {matchContent}
        </em>,
      );
    }

    // Advance
    currentText = currentText.substring(matchIndex + matchLength);
  }

  return parts;
}
