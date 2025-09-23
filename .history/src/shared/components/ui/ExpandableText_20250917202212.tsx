import { useState } from "react";

type ExpandableTextProps = {
  text: string;
  limit?: number; // عدد السطور الافتراضي 3
};

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, limit = 3 }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`leading-relaxed text-gray-700 ${
          expanded ? "" : `line-clamp-${limit}`
        }`}
      >
        {text}
      </p>

      {text.length > 100 && (
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
