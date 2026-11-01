export type AuthFlowStage = 'welcome' | 'login' | 'authenticated';

export const VALID_AUTH_USERNAME = 'fitriawulandari';
export const VALID_AUTH_PASSWORD = '123456';
export const AUTH_STAGE_STORAGE_KEY = 'sikesling_auth_stage_v1';

export interface LoginValidationResult {
  valid: boolean;
  error?: string;
  normalizedUsername: string;
}

export function validateLoginCredentials(
  usernameInput: string,
  passwordInput: string
): LoginValidationResult {
  const normalizedUsername = usernameInput.trim().toLowerCase();
  const trimmedPassword = passwordInput.trim();

  if (!normalizedUsername || !trimmedPassword) {
    return {
      valid: false,
      error: 'Harap masukkan Username dan Password terlebih dahulu.',
      normalizedUsername,
    };
  }

  if (
    normalizedUsername !== VALID_AUTH_USERNAME ||
    trimmedPassword !== VALID_AUTH_PASSWORD
  ) {
    return {
      valid: false,
      error:
        'Username atau Password tidak sesuai. Gunakan username: fitriawulandari dan password: 123456.',
      normalizedUsername,
    };
  }

  return {
    valid: true,
    normalizedUsername,
  };
}

export function readAuthStageFromStorage(): AuthFlowStage {
  if (typeof window === 'undefined') return 'welcome';
  try {
    const raw = window.sessionStorage.getItem(AUTH_STAGE_STORAGE_KEY);
    if (raw === 'welcome' || raw === 'login' || raw === 'authenticated') {
      return raw;
    }
    return 'welcome';
  } catch {
    return 'welcome';
  }
}

export function writeAuthStageToStorage(stage: AuthFlowStage): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(AUTH_STAGE_STORAGE_KEY, stage);
  } catch {
    // ignore storage errors
  }
}
