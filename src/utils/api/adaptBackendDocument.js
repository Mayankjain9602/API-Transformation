export const adaptBackendDocument = (backendDoc) => {
  if (!backendDoc) return null;

  return {
    title: backendDoc.title || "",
    version: backendDoc.version || "",
    openapi: backendDoc.openapi || "",
    servers: backendDoc.servers || [],
    paths: (backendDoc.paths || []).map((p) => ({
      path: p.path,
      description: p.description || "",
      operations: (p.operations || []).map((op) => ({
        method: op.method,
        operationId: op.operationId || "",
        summary: op.summary || "",
        description: op.description || "",
        deprecated: op.deprecated || false,
        parameters: op.parameters || [],
        requestBodies: op.requestBodies || [],
        responses: op.responses || [],
      })),
    })),
  };
};