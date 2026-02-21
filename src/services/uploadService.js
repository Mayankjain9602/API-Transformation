const API_URL = "http://localhost:8080/api/swagger-docs";

export async function uploadSwaggerDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload API failed");
  }

  return await response.json();
}