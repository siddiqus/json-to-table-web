import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { formatCellContent } from "../utils/json";

function TableCell({ value }) {
  // Check if value is a JSON object/array
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

  // Check if content looks like markdown or HTML
  const hasMarkdownOrHtml =
    content.includes("#") || // Headers
    content.includes("**") || // Bold
    content.includes("*") || // Italic or lists
    content.includes("```") || // Code blocks
    content.includes("<") || // HTML tags
    content.includes("[") || // Links
    content.includes("`"); // Inline code

  if (hasMarkdownOrHtml && typeof value === "string") {
    return (
      <div className="markdown-cell">
        <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Default rendering for non-markdown content
  return <pre>{content}</pre>;
}

export default TableCell;
