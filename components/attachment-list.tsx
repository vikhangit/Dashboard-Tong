"use client";

import { Link as LinkIcon } from "lucide-react";

interface AttachmentListProps {
  attachments: string[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {attachments.map((link, idx) => (
        <a
          key={idx}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <LinkIcon className="w-3 h-3" />
          Link {idx + 1}
        </a>
      ))}
    </div>
  );
}
