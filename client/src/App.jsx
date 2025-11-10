import ReactJson from "@microlink/react-json-view";
import "highlight.js/styles/github.css";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

// Helper function to resolve nested path like 'data.user.tasks'
function resolvePath(obj, path) {
  if (!path || path.trim() === "") return obj;

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      throw new Error(`Path "${path}" not found in JSON data`);
    }
    current = current[key];
  }

  return current;
}

// Helper function to format cell content with whitespace preservation
function formatCellContent(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

// Component to render table cell with markdown support
function TableCell({ value }) {
  // Check if value is a JSON object/array
  if (typeof value === "object" && value !== null) {
    const jsonString = JSON.stringify(value, null, 2);
    return (
      <div className="markdown-cell">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {`\`\`\`json\n${jsonString}\n\`\`\``}
        </ReactMarkdown>
      </div>
    );
  }

  const content = formatCellContent(value);

  // Check if content looks like markdown or HTML
  const hasMarkdownOrHtml =
    content.includes('#') || // Headers
    content.includes('**') || // Bold
    content.includes('*') || // Italic or lists
    content.includes('```') || // Code blocks
    content.includes('<') || // HTML tags
    content.includes('[') || // Links
    content.includes('`'); // Inline code

  if (hasMarkdownOrHtml && typeof value === 'string') {
    return (
      <div className="markdown-cell">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Default rendering for non-markdown content
  return <pre>{content}</pre>;
}

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const useCorsProxy = true; // Always use CORS proxy

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError("");

    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      setError("Invalid file type. Please upload a JSON file (.json)");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = JSON.parse(content);
        setJsonData(parsed);
        setError("");

        // Clear URL query parameters when uploading a file
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('url');
        newUrl.searchParams.delete('path');
        window.history.pushState({}, '', newUrl);
        setUrl(''); // Also clear the URL input
        setDataPath(''); // Also clear the data path
      } catch (err) {
        setError(`Invalid JSON format: ${err.message}`);
        setJsonData(null);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsText(file);
  };

  // Handle URL fetch
  const handleUrlFetch = async () => {
    setError("");
    setLoading(true);

    // Validate URL format
    if (!url.trim()) {
      setError("Please enter a URL");
      setLoading(false);
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      setLoading(false);
      return;
    }

    try {
      // Use our own CORS proxy server
      const proxyUrl = import.meta.env.VITE_PROXY_URL || '/api/proxy';
      const fetchUrl = useCorsProxy
        ? `${proxyUrl}?url=${encodeURIComponent(url)}`
        : url;

      const response = await fetch(fetchUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Still try to parse as JSON even if content-type is not set correctly
        console.warn(
          "Content-Type is not application/json, attempting to parse anyway"
        );
      }

      const data = await response.json();
      setJsonData(data);
      setError("");

      // Update browser URL with the fetched URL
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('url', url);
      window.history.pushState({}, '', newUrl);
    } catch (err) {
      if (err.name === "SyntaxError") {
        setError(`Invalid JSON format: ${err.message}`);
      } else if (
        err.message.includes("Failed to fetch") ||
        err.name === "TypeError"
      ) {
        setError(
          `Error: Unable to fetch from this URL. The URL may be invalid or unreachable.`
        );
      } else {
        setError(`Error fetching URL: ${err.message}`);
      }
      setJsonData(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for URL query parameters on mount and auto-fetch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    const pathParam = params.get('path');

    if (urlParam) {
      setUrl(urlParam);
    }
    if (pathParam) {
      setDataPath(pathParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Auto-fetch when URL is set from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');

    if (urlParam && url === urlParam && !jsonData && !loading) {
      handleUrlFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Run when URL changes

  // Update URL query parameters when dataPath changes
  useEffect(() => {
    if (jsonData) {
      const newUrl = new URL(window.location);
      const currentUrlParam = newUrl.searchParams.get('url');

      // Only update if we have a URL parameter (meaning data came from URL fetch)
      if (currentUrlParam) {
        if (dataPath && dataPath.trim() !== '') {
          newUrl.searchParams.set('path', dataPath);
        } else {
          newUrl.searchParams.delete('path');
        }
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [dataPath, jsonData]);

  // Get table data from JSON using useMemo to avoid infinite re-renders
  const tableResult = useMemo(() => {
    if (!jsonData) return { data: null, error: null };

    try {
      let data = dataPath ? resolvePath(jsonData, dataPath) : jsonData;

      if (!Array.isArray(data)) {
        return {
          data: null,
          error: "Data at the specified path is not an array",
        };
      }

      if (data.length === 0) {
        return { data: null, error: "Array is empty" };
      }

      // Filter based on search term
      let filtered = data;
      if (searchTerm) {
        filtered = data.filter((row) =>
          Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }

      // Sort data
      if (sortConfig.key) {
        filtered = [...filtered].sort((a, b) => {
          const aVal = a[sortConfig.key];
          const bVal = b[sortConfig.key];

          if (aVal === bVal) return 0;

          let comparison = 0;
          if (aVal === null || aVal === undefined) comparison = 1;
          else if (bVal === null || bVal === undefined) comparison = -1;
          else if (typeof aVal === "string" && typeof bVal === "string") {
            comparison = aVal.localeCompare(bVal);
          } else {
            comparison = aVal < bVal ? -1 : 1;
          }

          return sortConfig.direction === "asc" ? comparison : -comparison;
        });
      }

      return { data: filtered, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  }, [jsonData, dataPath, searchTerm, sortConfig]);

  // Handle column sort
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const tableData = tableResult.data;
  const tableError = tableResult.error;
  const columns =
    tableData && tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="app">
      <h1>JSON Table Viewer</h1>

      <div className="input-section">
        <div className="main-input-row">
          <div className="upload-section">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>

          <div className="url-section">
            <div className="url-input-group">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/data.json"
                className="url-input"
                onKeyPress={(e) => e.key === "Enter" && handleUrlFetch()}
              />
              <button
                onClick={handleUrlFetch}
                disabled={loading}
                className="fetch-button"
              >
                {loading ? "Fetching..." : "Fetch JSON"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {jsonData && (
        <div className="input-section">
          <div className="path-section">
            <label className="path-label">
              Data Path (Optional) - Use dot notation to access the array object property
            </label>
            <div className="path-header">
              <input
                type="text"
                value={dataPath}
                onChange={(e) => {
                  setDataPath(e.target.value);
                  setError("");
                }}
                placeholder="e.g. data.results"
                className="path-input"
              />
              {jsonData &&
                typeof jsonData === "object" &&
                !Array.isArray(jsonData) && (
                  <div className="path-header-suggestions">
                    <small className="suggestions-label">
                      Array Property Suggestions:
                    </small>
                    <div className="property-buttons">
                      {Object.keys(jsonData).map((key) => (
                        <button
                          key={key}
                          onClick={() => setDataPath(key)}
                          className="property-button"
                          title={`Click to set path to "${key}"`}
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              <button
                onClick={() => setShowJsonModal(true)}
                className="inspect-json-button"
              >
                Inspect JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {(error || tableError) && (
        <div className="error-message">{error || tableError}</div>
      )}

      {tableData && tableData.length > 0 && (
        <div className="json-table-data-container">
          <div className="search-section">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search table..."
              className="search-input"
            />
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      onClick={() => handleSort(column)}
                      className={sortConfig.key === column ? "sorted" : ""}
                    >
                      {column}
                      {sortConfig.key === column && (
                        <span className="sort-indicator">
                          {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column) => (
                      <td key={column}>
                        <TableCell value={row[column]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-info">
            Showing {tableData.length} row{tableData.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {showJsonModal && jsonData && (
        <div className="modal-overlay" onClick={() => setShowJsonModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>JSON Structure</h2>
              <button
                onClick={() => setShowJsonModal(false)}
                className="modal-close-button"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ReactJson
                src={jsonData}
                theme="monokai"
                collapsed={2}
                displayDataTypes={false}
                enableClipboard={true}
                name={false}
                style={{
                  padding: "15px",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
