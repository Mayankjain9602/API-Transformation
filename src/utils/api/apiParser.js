import yaml from "js-yaml";

export function parseFile(content, fileName = "") {
  if (!content || typeof content !== "string") {
    throw new Error("Empty file content");
  }

  const cleaned = content.replace(/^\uFEFF/, "").trim();

  try {
    // JSON file
    if (fileName.endsWith(".json")) {
      return JSON.parse(cleaned);
    }

    // YAML file
    if (fileName.endsWith(".yaml") || fileName.endsWith(".yml")) {
      return yaml.load(cleaned);
    }

    // Try JSON first
    return JSON.parse(cleaned);

  } catch {
    throw new Error("Invalid JSON/YAML file");
  }
}