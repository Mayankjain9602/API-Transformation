import React from "react";

const ApiDocumentViewer = ({ doc }) => {
  if (!doc) return null;

  return (
    <div style={{ padding: "20px" }}>

      {/* HEADER CARD */}
      <div style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginBottom: "25px"
      }}>
        <h2 style={{ marginBottom: "15px" }}>Document Overview</h2>

        <div style={{ display: "grid", gap: "8px" }}>
          <div><strong>Title:</strong> {doc.title}</div>
          <div><strong>Version:</strong> {doc.version}</div>
          <div><strong>OpenAPI:</strong> {doc.openapiVersion || "-"}</div>
          <div><strong>Partner:</strong> {doc.partnerName || "-"}</div>
        </div>
      </div>

      {/* SERVERS */}
      <div style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginBottom: "25px"
      }}>
        <h2>Servers</h2>

        {doc.servers?.length ? (
          doc.servers.map((server, i) => (
            <div key={i} style={{
              padding: "12px",
              marginTop: "10px",
              background: "#f5f7fa",
              borderRadius: "8px"
            }}>
              <div><strong>URL:</strong> {server.url}</div>
              <div><strong>Description:</strong> {server.description || "-"}</div>
            </div>
          ))
        ) : (
          <p>-</p>
        )}
      </div>

      {/* PATHS */}
      <div style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}>
        <h2>Paths & Operations</h2>

        {doc.paths?.map((pathItem, i) => (
          <div key={i} style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f9fafc",
            borderRadius: "10px"
          }}>
            <h3 style={{ color: "#1976d2" }}>
              {pathItem.path}
            </h3>

            {pathItem.operations?.map((op, idx) => (
              <div key={idx} style={{
                marginTop: "12px",
                padding: "12px",
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e0e0e0"
              }}>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: getMethodColor(op.method),
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "12px"
                  }}>
                    {op.method}
                  </span>

                  <strong>{op.operationId}</strong>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <strong>Summary:</strong> {op.summary || "-"}
                </div>

                <div>
                  <strong>Description:</strong> {op.description || "-"}
                </div>

                {/* PARAMETERS */}
                <div style={{ marginTop: "10px" }}>
                  <strong>Parameters:</strong>
                  {op.parameters?.length ? (
                    op.parameters.map((param, pIndex) => (
                      <div key={pIndex} style={{ fontSize: "14px" }}>
                        • {param.in} <b>{param.name}</b> (required: {String(param.required)})
                      </div>
                    ))
                  ) : (
                    <div>-</div>
                  )}
                </div>

                {/* RESPONSES */}
                <div style={{ marginTop: "10px" }}>
                  <strong>Responses:</strong>
                  {op.responses ? (
                    Object.keys(op.responses).map((status, rIndex) => (
                      <div key={rIndex}>• Status {status}</div>
                    ))
                  ) : (
                    <div>-</div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
};

function getMethodColor(method) {
  switch (method?.toUpperCase()) {
    case "GET": return "#4caf50";
    case "POST": return "#2196f3";
    case "PUT": return "#ff9800";
    case "DELETE": return "#f44336";
    default: return "#9e9e9e";
  }
}

export default ApiDocumentViewer;