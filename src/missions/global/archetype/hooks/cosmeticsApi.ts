import { workerUrl } from '../../../../lib/workerClient';

export interface ArchetypeBadgeOption {
  id: string;
  variant_group: string;
  archetype: string;
  name: string;
  image_url: string;
}

export interface ArchetypeBadgesCatalogueResponse {
  items: ArchetypeBadgeOption[];
  equippedItemId: string | null;
}

export async function fetchArchetypeBadgesCatalogue(address: string): Promise<ArchetypeBadgesCatalogueResponse> {
  const response = await fetch(workerUrl(`/api/player/${address}/cosmetics/archetype-badges`));
  if (!response.ok) {
    throw new Error(`Failed to fetch archetype badges: ${response.status}`);
  }
  return response.json();
}

export interface EquipArchetypeBadgeResponse {
  equipped: true;
  item_id: string;
}

export class CosmeticsError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function putArchetypeBadge(
  address: string,
  itemId: string,
  getAccessToken: () => Promise<string | null>
): Promise<EquipArchetypeBadgeResponse> {
  const token = await getAccessToken();
  if (!token) {
    throw new CosmeticsError(401, 'Not authenticated');
  }

  const response = await fetch(workerUrl(`/api/player/${address}/cosmetics/archetype-badge`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ item_id: itemId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new CosmeticsError(response.status, body.error ?? `Equip failed (${response.status})`);
  }

  return response.json();
}
