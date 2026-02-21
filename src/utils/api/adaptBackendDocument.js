export const adaptBackendDocument = (backendDoc) => {
  if (!backendDoc) return null;

  return {
    title: backendDoc.title || "",
    version: backendDoc.version || "",
    openapi: backendDoc.openapiVersion || "",
    servers: backendDoc.servers || [],
    paths: (backendDoc.paths || []).map((p) => ({
      path: p.path,
      operations: (p.operations || []).map((op) => ({
        method: op.method,
        operationId: op.operationId || "",
        summary: op.summary || "",
        headers: op.headers || [],
        requestBody: op.requestBody || null,

        // 🔥 CONVERT OBJECT → ARRAY
        responses: op.responses
          ? Object.entries(op.responses).map(([status, value]) => ({
              status,
              ...value,
            }))
          : [],
      })),
    })),
  };
};