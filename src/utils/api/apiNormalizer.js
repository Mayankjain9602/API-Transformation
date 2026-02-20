export function normalizeCustomApi(doc) {
  return {
    meta: {
      title: doc.title,
      version: doc.version,
      openapiVersion: doc.openapiVersion,
    },
    servers: doc.servers ?? [],
    paths: doc.paths.map((p) => ({
      path: p.path,
      description: p.description,
      operations: p.operations.map((op) => ({
        method: op.method,
        operationId: op.operationId,
        summary: op.summary,
        description: op.description,
        deprecated: op.deprecated,
        parameters: op.parameters ?? [],
        requestBodies: op.requestBodies ?? [],
        responses: op.responses ?? [],
      })),
    })),
  };
}

export function normalizeOpenApi(doc) {
  return {
    meta: {
      title: doc.info?.title,
      version: doc.info?.version,
      openapiVersion: doc.openapi,
    },
    servers: doc.servers ?? [],
    paths: Object.entries(doc.paths ?? {}).map(([path, methods]) => ({
      path,
      operations: Object.entries(methods).map(([method, def]) => ({
        method: method.toUpperCase(),
        operationId: def.operationId,
        summary: def.summary,
        description: def.description,
        deprecated: def.deprecated,
        parameters: def.parameters ?? [],
        requestBodies: def.requestBody ? [def.requestBody] : [],
        responses: Object.entries(def.responses ?? {}).map(
          ([status, res]) => ({
            statusCode: status,
            description: res.description,
            mediaType: Object.keys(res.content ?? {})[0],
            schemaRef:
              res.content &&
              Object.values(res.content)[0]?.schema?.$ref,
          })
        ),
      })),
    })),
  };
}
