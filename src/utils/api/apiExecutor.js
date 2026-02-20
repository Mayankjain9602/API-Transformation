export async function executeApi({ server, path, method, headers = {}, body }) {
  const response = await fetch(`${server}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return data;
}