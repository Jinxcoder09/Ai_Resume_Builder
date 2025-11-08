import React from 'react';

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface HighlightProps {
    text: string;
    keywords: string[];
}

export const Highlight: React.FC<HighlightProps> = React.memo(({ text, keywords }) => {
    if (!keywords?.length || !text) {
        return <>{text}</>;
    }

    const regex = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) && keywords.some(k => k.toLowerCase() === part.toLowerCase()) ? (
                    <mark key={i} className="bg-teal/30 rounded px-1 py-0.5 font-semibold">{part}</mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                )
            )}
        </>
    );
});
