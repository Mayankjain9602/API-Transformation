export function buildApiDocument(spec) {
  // CASE 1: Your custom format (response wrapper)
  if (spec.response && spec.response.paths) {
    const res = spec.response;

    return {
      openapi: res.openapiVersion || "",
      title: res.title || "",
      version: res.version || "",
      servers: res.servers || [],
      paths: res.paths.map((p) => ({
        path: p.path,
        operations: p.operations.map((op) => ({
          method: op.method,
          summary: op.summary,
          parameters: op.headers || [],
          requestBody: op.requestBody || null,
          responses: op.responses || {},
        })),
      })),
      components: {},
    };
  }

  // CASE 2: Standard OpenAPI
  if (spec.paths && typeof spec.paths === "object") {
    const info = spec.info || {};

    return {
      openapi: spec.openapi || spec.swagger || "",
      title: info.title || "",
      version: info.version || "",
      servers: spec.servers || [],
      paths: Object.entries(spec.paths).map(([path, methods]) => ({
        path,
        operations: Object.entries(methods).map(([method, operation]) => ({
          method: method.toUpperCase(),
          summary: operation.summary || "",
          parameters: operation.parameters || [],
          requestBody: operation.requestBody || null,
          responses: operation.responses || {},
        })),
      })),
      components: spec.components || {},
    };
  }

  throw new Error("Unsupported API document format");
}