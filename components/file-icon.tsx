import React from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import fileExtension from "file-extension";
import { Paperclip } from "lucide-react";

interface FileIconProps {
  url: string;
  className?: string;
}

export function FileIconComponent({ url }: FileIconProps) {
  // Extract extension from URL
  // file-extension returns extension without dot, e.g. 'pdf'
  const ext = fileExtension(url);

  // Normalize extension to match defaultStyles keys if necessary
  // defaultStyles keys are like 'pdf', 'doc', 'xls', 'png', etc.
  const extension = ext ? ext.toLowerCase() : "";

  // Check if we have a style for this extension
  // @ts-ignore - defaultStyles has many keys, hard to type perfectly
  const style = defaultStyles[extension];

  if (style) {
    return (
      <div className="w-6 h-6 shrink-0">
        {/* @ts-ignore */}
        <FileIcon extension={extension} {...style} />
      </div>
    );
  }

  // Fallback for types not in defaultStyles but common
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    // reuse png style or similar for images if not found
    const imgStyle = defaultStyles.png;
    return (
      <div className="w-6 h-6 shrink-0">
        {/* @ts-ignore */}
        <FileIcon extension={extension} {...imgStyle} />
      </div>
    );
  }

  // Fallback generic icon
  return <Paperclip className="w-4 h-4 text-muted-foreground" />;
}
