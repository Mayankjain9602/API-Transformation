import React, { useState } from "react";

const ApiDocumentViewer = ({ doc }) => {
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!doc) return null;

  return (
    <div className="api-wrapper">

      {/* ================= DOCUMENT ================= */}
      <div className="api-section-card">
        <h2 className="section-title">Document</h2>
        <div className="doc-meta-grid">
          <div><strong>Title:</strong> {doc.title || "-"}</div>
          <div><strong>Version:</strong> {doc.version || "-"}</div>
          <div><strong>OpenAPI:</strong> {doc.openapi || "-"}</div>
        </div>
      </div>

      {/* ================= SERVERS ================= */}
      <div className="api-section-card">
        <h2 className="section-title">Servers</h2>
        {doc.servers?.length ? (
          doc.servers.map((server, i) => (
            <div key={i} className="server-card">
              <div><strong>URL:</strong> {server.url}</div>
              <div><strong>Description:</strong> {server.description || "-"}</div>
            </div>
          ))
        ) : (
          <p>-</p>
        )}
      </div>

      {/* ================= PATHS & OPERATIONS ================= */}
<div className="api-section-card">
  <h2 className="section-title">Paths & Operations</h2>

  {doc.paths?.map((pathItem, i) => (
    <div key={i} className="path-block">

      {/* Path Title */}
      <div className="path-title">
        <strong>Path:</strong> {pathItem.path}
      </div>

      {/* Operations Row */}
      <div className="operations-grid">
        {pathItem.operations?.map((op, idx) => (
          <div key={idx} className="operation-card-grid">

            {/* HEADER */}
            <div className="operation-header">
              <span className={`method-tag ${op.method?.toLowerCase()}`}>
                {op.method}
              </span>
              <span>
                <strong>operationId:</strong> {op.operationId || "-"}
              </span>
            </div>

            <div><strong>Summary:</strong> {op.summary || "-"}</div>
            <div><strong>Description:</strong> {op.description || "-"}</div>
            <div><strong>Deprecated:</strong> {String(op.deprecated)}</div>

            {/* PARAMETERS */}
            <div className="sub-title">Parameters</div>
            {op.parameters?.length ? (
              op.parameters.map((param, pIndex) => (
                <div key={pIndex} className="param-line">
                  - {param.in} <strong>{param.name}</strong>{" "}
                  required={String(param.required)},{" "}
                  type={param.schema?.type || "-"}
                </div>
              ))
            ) : (
              <p>-</p>
            )}

            {/* RESPONSES */}
            <div className="sub-title">Responses</div>
            {op.responses && Object.keys(op.responses).length ? (
              Object.entries(op.responses).map(
                ([status], rIndex) => (
                  <div key={rIndex} className="response-line">
                    - status={status}
                  </div>
                )
              )
            ) : (
              <p>-</p>
            )}

          </div>
        ))}
      </div>

    </div>
  ))}
</div>
    </div>
  );
};

export default ApiDocumentViewer;