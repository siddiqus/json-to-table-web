import Button from "./Button";
import Input from "./Input";
import TableCell from "./TableCell";
import "./DataTable.css";

function DataTable({
  data,
  columns,
  searchTerm,
  onSearchChange,
  sortConfig,
  onSort,
  onDownloadTSV,
  onCellEdit,
}) {
  return (
    <>
      <div className="search-section">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search table..."
          className="search-input"
        />
        <Button
          variant="purple"
          onClick={onDownloadTSV}
          title="Download table as TSV for Excel"
        >
          Download as TSV
        </Button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  onClick={() => onSort(column)}
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "40px 15px", color: "#718096" }}>
                  No results found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={column}>
                      <TableCell
                        value={row[column]}
                        onEdit={(newValue) => onCellEdit(row, column, newValue)}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-info">
        Showing {data.length} row{data.length !== 1 ? "s" : ""}
      </div>
    </>
  );
}

export default DataTable;
