import { workerUrl } from '../lib/workerClient';

/**
 * Reports "app mounted with a live session" to the worker, for the
 * daily-login mission. Silent no-op if the host app has no auth
 * (getAccessToken returns null/empty) — expected for hosts that don't
 * provide one yet (e.g. Discord Activity). Never throws — a failed
 * session call must never break app mount.
 */
export async function postSession(getAccessToken: () => Promise<string | null>): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) return false;

    const response = await fetch(workerUrl('/api/player/session'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
