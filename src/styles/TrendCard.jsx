import React from "react";

export default function TrendCard({ title, summary, link }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-sm whitespace-pre-line">{summary}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 block">
        🔗 View Full Article
      </a>
    </div>
  );
}
