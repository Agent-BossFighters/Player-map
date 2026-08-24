export type DevStep = 'alpha' | 'beta' | 'early-access' | 'release';

export const DEV_STEP_LABEL: Record<DevStep, string> = {
  'alpha': 'Alpha',
  'beta': 'Beta',
  'early-access': 'Early Access',
  'release': 'Release',
};

export const DEV_STEP_COLOR: Record<DevStep, string> = {
  'alpha': '#7c3aed',
  'beta': '#2563eb',
  'early-access': '#d97706',
  'release': '#16a34a',
};
