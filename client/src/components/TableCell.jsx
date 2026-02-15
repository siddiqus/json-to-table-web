import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { formatCellContent } from "../utils/json";

function TableCell({ value, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = () => {
    const content =
      typeof value === "object" && value !== null
        ? JSON.stringify(value, null, 2)
        : formatCellContent(value);
    setEditValue(content);
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const original =
      typeof value === "object" && value !== null
        ? JSON.stringify(value, null, 2)
        : formatCellContent(value);
    if (editValue !== original) {
      onEdit(editValue);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // Render the display content (used both for normal view and as hidden placeholder during edit)
  const renderContent = () => {
    if (typeof value === "object" && value !== null) {
      const jsonString = JSON.stringify(value, null, 2);
      return (
        <div className="markdown-cell">
          <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
            {`\`\`\`json\n${jsonString}\n\`\`\``}
          </ReactMarkdown>
        </div>
      );
    }

    const content = formatCellContent(value);

    const hasMarkdownOrHtml =
      content.includes("#") ||
      content.includes("**") ||
      content.includes("*") ||
      content.includes("```") ||
      content.includes("<") ||
      content.includes("[") ||
      content.includes("`");

    if (hasMarkdownOrHtml && typeof value === "string") {
      return (
        <div className="markdown-cell">
          <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
            {content}
          </ReactMarkdown>
        </div>
      );
    }

    return <pre>{content}</pre>;
  };

  if (editing) {
    return (
      <div className="cell-edit-wrapper">
        <div className="cell-edit-placeholder">{renderContent()}</div>
        <textarea
          ref={inputRef}
          className="cell-edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div className="editable-cell" onDoubleClick={startEditing}>
      {renderContent()}
    </div>
  );
}

export default TableCell;
