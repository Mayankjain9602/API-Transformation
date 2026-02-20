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
          <div><strong>Title</strong><p>{doc.title}</p></div>
          <div><strong>Version</strong><p>{doc.version}</p></div>
          <div><strong>OpenAPI</strong><p>{doc.openapi}</p></div>
        </div>
      </div>

      {/* ================= SERVERS ================= */}
      <div className="api-section-card">
        <h2 className="section-title">Servers</h2>
        {doc.servers?.map((server, i) => (
          <div key={i} className="server-card">
            <div className="server-url">{server.url}</div>
            <div className="server-desc">{server.description}</div>
          </div>
        ))}
      </div>

      {/* ================= PATHS ================= */}
      <div className="api-section-card">
        <h2 className="section-title">Paths & Operations</h2>

        {doc.paths?.map((pathItem, i) => (
          <div key={i} className="path-card">
            <div className="path-header">
              <span className="path-label">Path:</span>
              <span className="path-value">{pathItem.path}</span>
            </div>

            {pathItem.operations?.map((op, idx) => (
              <div key={idx} className="operation-card">

                <div className="operation-header">
                  <span className={`method-tag ${op.method?.toLowerCase()}`}>
                    {op.method}
                  </span>
                  <span className="operation-summary">{op.summary}</span>
                </div>

                {/* PARAMETERS */}
                {op.parameters?.length > 0 && (
                  <>
                    <div className="sub-title">Parameters</div>
                    {op.parameters.map((param, pIndex) => (
                      <div key={pIndex} className="param-line">
                        <span className="param-name">
                          {param.in} {param.name}
                        </span>
                        <span>
                          required={param.required ? "true" : "false"}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {/* REQUEST BODY */}
                {op.requestBody && (
                  <>
                    <div className="sub-title">Request Body</div>
                    {Object.entries(op.requestBody.content || {}).map(
                      ([mediaType, content], rbIndex) => (
                        <div key={rbIndex} className="request-line">
                          mediaType={mediaType}
                          <button
                            className="toggle-btn"
                            onClick={() =>
                              toggle(`${i}-${idx}-req-${rbIndex}`)
                            }
                          >
                            schemaJson
                          </button>

                          {expanded[`${i}-${idx}-req-${rbIndex}`] && (
                            <pre className="schema-json">
                              {JSON.stringify(content.schema, null, 2)}
                            </pre>
                          )}
                        </div>
                      )
                    )}
                  </>
                )}

                {/* RESPONSES */}
                <div className="sub-title">Responses</div>
                {Object.entries(op.responses || {}).map(
                  ([status, response], rIndex) => (
                    <div key={rIndex} className="response-line">
                      <span className="status-badge">{status}</span>
                      {Object.entries(response.content || {}).map(
                        ([mediaType, content], cIndex) => (
                          <div key={cIndex}>
                            mediaType={mediaType}
                            <button
                              className="toggle-btn"
                              onClick={() =>
                                toggle(`${i}-${idx}-${status}-${cIndex}`)
                              }
                            >
                              schemaJson
                            </button>

                            {expanded[
                              `${i}-${idx}-${status}-${cIndex}`
                            ] && (
                              <pre className="schema-json">
                                {JSON.stringify(content.schema, null, 2)}
                              </pre>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDocumentViewer;