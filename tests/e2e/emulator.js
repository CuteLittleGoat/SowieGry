// Pomocnicy testów na emulatorze Firestore (REST z uprawnieniami właściciela emulatora).
// Każdy test używa własnego projektu demo-sowiegry-…, więc testy są od siebie niezależne.
const EMULATOR = "http://127.0.0.1:8080";

let sequence = 0;

function uniqueProject(testInfo) {
  sequence += 1;
  const random = Math.random().toString(36).slice(2, 6);
  return `demo-sowiegry-${testInfo.workerIndex}-${sequence}-${Date.now().toString(36).slice(-5)}${random}`;
}

function cloudUrl(pathname, project, extra = "") {
  const joiner = pathname.includes("?") ? "&" : "?";
  return `${pathname}${joiner}cloud=emulator&projekt=${project}${extra}`;
}

function fromValue(value) {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return Date.parse(value.timestampValue);
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromValue);
  if ("mapValue" in value) return fromFields(value.mapValue.fields || {});
  return undefined;
}

function fromFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromValue(value)]));
}

function toValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number")
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toValue(v)])) } };
}

function docUrl(project, docPath) {
  return `${EMULATOR}/v1/projects/${project}/databases/(default)/documents/${docPath}`;
}

async function readDoc(project, docPath) {
  const response = await fetch(docUrl(project, docPath), { headers: { Authorization: "Bearer owner" } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Emulator: ${response.status} ${await response.text()}`);
  return fromFields((await response.json()).fields || {});
}

async function listDocs(project, collectionPath) {
  const response = await fetch(docUrl(project, collectionPath), { headers: { Authorization: "Bearer owner" } });
  if (!response.ok) throw new Error(`Emulator: ${response.status} ${await response.text()}`);
  return ((await response.json()).documents || []).map((entry) => fromFields(entry.fields || {}));
}

async function seedDoc(project, docPath, data) {
  const response = await fetch(docUrl(project, docPath), {
    method: "PATCH",
    headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toValue(data).mapValue.fields }),
  });
  if (!response.ok) throw new Error(`Emulator: ${response.status} ${await response.text()}`);
}

module.exports = { uniqueProject, cloudUrl, readDoc, listDocs, seedDoc };
