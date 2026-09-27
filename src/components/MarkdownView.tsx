import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  // Parse code blocks vs regular text blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-[15px] sm:text-base leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0].trim().match(/^[a-zA-Z0-9_-]+$/) ? lines[0].trim() : '';
          const code = language ? lines.slice(1).join('\n') : lines.join('\n');

          return <CodeBlock key={index} code={code} language={language} />;
        }

        return <TextSection key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/70 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-xs font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-xs sm:text-sm text-slate-200 leading-normal">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const TextSection: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph is a list
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
        const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));

        if (isBulletList) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 my-2">
              {lines.map((line, lIdx) => (
                <li key={lIdx}>
                  <FormattedLine line={line.replace(/^[-*]\s+/, '')} />
                </li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1 my-2">
              {lines.map((line, lIdx) => (
                <li key={lIdx}>
                  <FormattedLine line={line.replace(/^\d+\.\s+/, '')} />
                </li>
              ))}
            </ol>
          );
        }

        // Check for blockquote
        if (trimmed.startsWith('>')) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-emerald-500/60 dark:border-emerald-400/60 pl-3.5 my-2 italic text-slate-700 dark:text-slate-300"
            >
              <FormattedLine line={trimmed.replace(/^>\s*/, '')} />
            </blockquote>
          );
        }

        // Check for headers
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 mt-3 mb-1">
              <FormattedLine line={trimmed.replace(/^###\s+/, '')} />
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mt-4 mb-1">
              <FormattedLine line={trimmed.replace(/^##\s+/, '')} />
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mt-4 mb-2">
              <FormattedLine line={trimmed.replace(/^#\s+/, '')} />
            </h1>
          );
        }

        return (
          <p key={idx} className="my-1.5">
            {lines.map((l, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                <FormattedLine line={l} />
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};

const FormattedLine: React.FC<{ line: string }> = ({ line }) => {
  // Regex tokenization for bold, italic, inline code
  // Tokenize by inline code `...`
  const codeParts = line.split(/(`[^`]+`)/g);

  return (
    <>
      {codeParts.map((sub, i) => {
        if (sub.startsWith('`') && sub.endsWith('`') && sub.length > 2) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs sm:text-[13px] mx-0.5"
            >
              {sub.slice(1, -1)}
            </code>
          );
        }

        // Bold formatting **text**
        const boldParts = sub.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={i}>
            {boldParts.map((bPart, bIdx) => {
              if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
                return (
                  <strong key={bIdx} className="font-semibold text-slate-950 dark:text-white">
                    {bPart.slice(2, -2)}
                  </strong>
                );
              }

              // Simple italic formatting *text*
              const italicParts = bPart.split(/(\*[^*]+\*)/g);
              return (
                <React.Fragment key={bIdx}>
                  {italicParts.map((itPart, itIdx) => {
                    if (itPart.startsWith('*') && itPart.endsWith('*') && itPart.length > 2) {
                      return <em key={itIdx}>{itPart.slice(1, -1)}</em>;
                    }
                    return itPart;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};
