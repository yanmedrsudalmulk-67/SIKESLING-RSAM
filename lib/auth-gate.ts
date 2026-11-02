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
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      window.sessionStorage.setItem(AUTH_STAGE_STORAGE_KEY, 'authenticated');
      return 'authenticated';
    }
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

export const WELCOME_VIDEO_LANDSCAPE_SRC =
  '/assets/aistudio/gemini_generated_video_d24d733d_3d063e8d.mp4';

export const WELCOME_VIDEO_PORTRAIT_SRC =
  '/assets/aistudio/gemini_generated_video_4eb3b858_7592732a.mp4';

export const NATIVE_PORTRAIT_VIDEO_ASPECT_RATIO = 9 / 16;

export type PortraitVideoFitMode = 'fit-width' | 'fit-height';

export function isPortraitViewport(width: number, height: number): boolean {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false;
  }
  return height > width;
}

export function getPortraitVideoFitMode(
  width: number,
  height: number
): PortraitVideoFitMode {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 'fit-width';
  }
  const viewportRatio = width / height;
  return viewportRatio <= NATIVE_PORTRAIT_VIDEO_ASPECT_RATIO
    ? 'fit-width'
    : 'fit-height';
}

export function getWelcomeVideoSrc(isPortrait: boolean): string {
  return isPortrait ? WELCOME_VIDEO_PORTRAIT_SRC : WELCOME_VIDEO_LANDSCAPE_SRC;
}


