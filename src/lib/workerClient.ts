export function workerUrl(path: string): string {
  const base = import.meta.env.VITE_WORKER_URL ?? '';
  return `${base}${path}`;
}

export async function fetchWorkerJson<T>(path: string): Promise<T> {
  const response = await fetch(workerUrl(path));
  if (!response.ok) {
    throw new Error(`Worker request failed: ${path} (${response.status})`);
  }
  return response.json();
}
