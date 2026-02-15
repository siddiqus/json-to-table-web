// Helper function to resolve nested path like 'data.user.tasks'
export function resolvePath(obj, path) {
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
export function formatCellContent(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
