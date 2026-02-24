import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiDocumentViewer from "../components/ApiDocumentViewer";

const DocumentDetails = () => {
  const { id } = useParams();
  const [documentData, setDocumentData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/swagger-docs/${id}/details`)
      .then((res) => res.json())
      .then((data) => setDocumentData(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!documentData) return <div>Loading...</div>;

  return <ApiDocumentViewer document={documentData} />;
};

export default DocumentDetails;