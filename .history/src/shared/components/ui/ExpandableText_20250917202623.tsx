import { useState, useRef, useEffect } from "react";

type ExpandableTextProps = {
  text: string;
  limit?: number;
};

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, limit = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current;
      // check if content is actually clamped
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [text, limit]);

  return (
    <div>
      <p
        ref={textRef}
        className={`leading-relaxed text-gray-700 ${
          expanded ? "" : `line-clamp-${limit}`
        }`}
      >
        {text}
      </p>

      {isClamped && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-1 text-sm font-medium ${
            expanded ? "text-gray-500" : "text-blue-500"
          }`}
        >
          {expanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
