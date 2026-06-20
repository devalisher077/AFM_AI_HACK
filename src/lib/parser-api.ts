const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");

export async function startBackendParsing() {
  if (!backendUrl) {
    throw new Error("VITE_BACKEND_URL не задан для frontend окружения.");
  }

  const response = await fetch(`${backendUrl}/parse/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      detail || `Backend вернул ошибку запуска: ${response.status}`,
    );
  }
}
