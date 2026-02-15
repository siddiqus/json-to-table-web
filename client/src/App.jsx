import ReactJson from "@microlink/react-json-view";
import "highlight.js/styles/github.css";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import Button from "./components/Button";
import Card from "./components/Card";
import DataTable from "./components/DataTable";
import ErrorMessage from "./components/ErrorMessage";
import Input from "./components/Input";
import Modal from "./components/Modal";
import { resolvePath } from "./utils/json";

function App() {
  const fileInputRef = useRef(null);
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showTextInputModal, setShowTextInputModal] = useState(false);
  const [jsonTextInput, setJsonTextInput] = useState("");
  const [jsonTextError, setJsonTextError] = useState("");
  const [inputType, setInputType] = useState("json-text");
  const [fileName, setFileName] = useState("");
  const useCorsProxy = true;

  // Handle JSON text input changes with live validation
  const handleJsonTextChange = (text) => {
    setJsonTextInput(text);
    if (!text.trim()) {
      setJsonTextError("");
      return;
    }
    try {
      JSON.parse(text);
      setJsonTextError("");
    } catch (err) {
      setJsonTextError(err.message);
    }
  };

  // Format JSON text in the editor
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonTextInput);
      setJsonTextInput(JSON.stringify(parsed, null, 2));
      setJsonTextError("");
    } catch (err) {
      setJsonTextError(err.message);
    }
  };

  // Save JSON from text input
  const handleSaveJsonText = () => {
    try {
      const parsed = JSON.parse(jsonTextInput);
      setJsonData(parsed);
      setError("");
      setShowTextInputModal(false);

      const newUrl = new URL(window.location);
      newUrl.searchParams.delete("url");
      newUrl.searchParams.delete("path");
      window.history.pushState({}, "", newUrl);
      setUrl("");
      setDataPath("");
    } catch (err) {
      setJsonTextError(err.message);
    }
  };

  // Open text input modal
  const handleOpenTextInput = () => {
    if (jsonData && !url) {
      setJsonTextInput(JSON.stringify(jsonData, null, 2));
      setJsonTextError("");
    }
    setShowTextInputModal(true);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError("");

    if (!file) return;

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
        setFileName(file.name);

        const newUrl = new URL(window.location);
        newUrl.searchParams.delete("url");
        newUrl.searchParams.delete("path");
        window.history.pushState({}, "", newUrl);
        setUrl("");
        setDataPath("");
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
      const proxyUrl = import.meta.env.VITE_PROXY_URL || "/api/proxy";
      const fetchUrl = useCorsProxy
        ? `${proxyUrl}?url=${encodeURIComponent(url)}`
        : url;

      const response = await fetch(fetchUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(
          "Content-Type is not application/json, attempting to parse anyway"
        );
      }

      const data = await response.json();
      setJsonData(data);
      setError("");

      const newUrl = new URL(window.location);
      newUrl.searchParams.set("url", url);
      window.history.pushState({}, "", newUrl);
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

  // Check for URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    const pathParam = params.get("path");

    if (urlParam) {
      setUrl(urlParam);
      setInputType("fetch-url");
    }
    if (pathParam) setDataPath(pathParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch when URL is set from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");

    if (urlParam && url === urlParam && !jsonData && !loading) {
      handleUrlFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Update URL query parameters when dataPath changes
  useEffect(() => {
    if (jsonData) {
      const newUrl = new URL(window.location);
      const currentUrlParam = newUrl.searchParams.get("url");

      if (currentUrlParam) {
        if (dataPath && dataPath.trim() !== "") {
          newUrl.searchParams.set("path", dataPath);
        } else {
          newUrl.searchParams.delete("path");
        }
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [dataPath, jsonData]);

  // Get table data from JSON
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

      let filtered = data;
      if (searchTerm) {
        filtered = data.filter((row) =>
          Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }

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

  const copyTableAsTSV = () => {
    if (!tableData || tableData.length === 0) return;

    const header = columns.join("\t");
    const rows = tableData.map((row) =>
      columns
        .map((column) => {
          const value = row[column];
          if (value === null) return "null";
          if (value === undefined) return "undefined";
          if (typeof value === "object") return JSON.stringify(value);
          return String(value).replace(/\t/g, " ").replace(/\n/g, " ");
        })
        .join("\t")
    );

    const tsv = [header, ...rows].join("\n");

    navigator.clipboard
      .writeText(tsv)
      .then(() => {
        alert("Table copied as TSV! You can now paste it into Excel.");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy to clipboard. Please try again.");
      });
  };

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-title">JSON to Table</div>
        <div className="header-controls">
          <select
            className="input-type-select"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
          >
            <option value="json-text">JSON Text</option>
            <option value="file-upload">File Upload</option>
            <option value="fetch-url">Fetch from URL</option>
          </select>

          {inputType === "json-text" && (
            <Button variant="primary" onClick={handleOpenTextInput}>
              {jsonData && !url ? "View / Edit JSON" : "Paste JSON"}
            </Button>
          )}

          {inputType === "file-upload" && (
            <div className="file-upload-controls">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                hidden
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current.click()}
              >
                Choose File
              </Button>
              {fileName && (
                <span className="file-name">{fileName}</span>
              )}
            </div>
          )}

          {inputType === "fetch-url" && (
            <div className="url-input-group">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/data.json"
                className="url-input"
                onKeyDown={(e) => e.key === "Enter" && handleUrlFetch()}
              />
              <Button
                variant="primary"
                onClick={handleUrlFetch}
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fetch"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {jsonData && (
        <Card>
          <div className="path-section">
            <label className="path-label">
              Data Path (Optional) - Use dot notation to access the array object
              property
            </label>
            <div className="path-header">
              <Input
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
              <Button
                variant="success"
                size="md"
                onClick={() => setShowJsonModal(true)}
              >
                Inspect JSON
              </Button>
            </div>
          </div>
        </Card>
      )}

      <ErrorMessage message={error || tableError} />

      {tableData && tableData.length > 0 && (
        <Card>
          <DataTable
            data={tableData}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortConfig={sortConfig}
            onSort={handleSort}
            onCopyTSV={copyTableAsTSV}
          />
        </Card>
      )}

      {showTextInputModal && (
        <Modal
          title="Paste JSON"
          onClose={() => setShowTextInputModal(false)}
          className="text-input-modal"
          actions={
            <>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setJsonTextInput("");
                  setJsonTextError("");
                }}
                disabled={!jsonTextInput}
              >
                Clear
              </Button>
              <Button
                variant="purple"
                size="md"
                onClick={handleFormatJson}
                disabled={!jsonTextInput.trim() || !!jsonTextError}
              >
                Format
              </Button>
              <Button
                variant="success"
                size="md"
                onClick={handleSaveJsonText}
                disabled={!jsonTextInput.trim() || !!jsonTextError}
              >
                Load JSON
              </Button>
            </>
          }
        >
          <div className="text-input-body">
            <textarea
              value={jsonTextInput}
              onChange={(e) => handleJsonTextChange(e.target.value)}
              placeholder='Paste or type JSON here, e.g. [{"name": "Alice"}, {"name": "Bob"}]'
              className={`json-textarea ${
                jsonTextError
                  ? "json-textarea-error"
                  : jsonTextInput.trim()
                  ? "json-textarea-valid"
                  : ""
              }`}
              spellCheck={false}
            />
            <ErrorMessage message={jsonTextError} mono />
          </div>
        </Modal>
      )}

      {showJsonModal && jsonData && (
        <Modal
          title="JSON Structure"
          onClose={() => setShowJsonModal(false)}
          className="json-inspector-modal"
        >
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
        </Modal>
      )}
    </div>
  );
}

export default App;
