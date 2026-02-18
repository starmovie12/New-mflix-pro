"use client";

import { useState } from "react";

interface ReportModalProps {
  movieId: string;
  movieTitle: string;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export default function ReportModal({
  movieTitle,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [text, setText] = useState("");

  return (
    <div className="fixed inset-0 bg-[rgba(2,4,8,0.75)] backdrop-blur-sm flex items-center justify-center z-[9990] p-5">
      <div className="w-[min(600px,100%)] rounded-3xl border border-white/[0.14] bg-gradient-to-br from-[rgba(18,22,32,0.98)] to-[rgba(10,13,20,0.98)] shadow-xl overflow-hidden">
        <div className="px-4 py-4">
          <h3 className="m-0 text-lg font-bold">Report Issue</h3>
          <p className="text-sm text-gray-400 mt-1">
            Reporting issue for: {movieTitle}
          </p>
        </div>
        <div className="px-4 pb-4">
          <label htmlFor="reportText" className="text-sm text-[#c5cee2]">
            What went wrong?
          </label>
          <textarea
            id="reportText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Video not playing, wrong content, audio issue..."
            className="w-full mt-2 border border-white/[0.16] bg-white/[0.04] rounded-xl px-3.5 py-3 text-white resize-y placeholder-gray-500 outline-none focus:border-mflix-accent/50"
          />
        </div>
        <div className="flex justify-end gap-2.5 px-4 py-4">
          <button
            onClick={onClose}
            className="border-0 rounded-xl px-3.5 py-2.5 bg-white/10 text-white hover:bg-white/[0.16] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (text.trim()) {
                onSubmit(text.trim());
                onClose();
              }
            }}
            className="border-0 rounded-xl px-3.5 py-2.5 bg-gradient-to-br from-mflix-accent to-[color-mix(in_srgb,#E50914,#fff_22%)] text-white font-bold hover:brightness-110 transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
