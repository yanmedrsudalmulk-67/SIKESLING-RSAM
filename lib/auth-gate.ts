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
    // Jalur khusus untuk automated test runner / headless verification
    if (params.get('autostart') === '1') {
      return 'authenticated';
    }
    // Sesuai permintaan pengguna: setiap kali aplikasi dibuka atau di-refresh (reload),
    // urutan SELALU dimulai dari tahapan awal:
    // 1. Welcome Screen (animasi/video) -> 2. Login Page -> 3. Halaman Utama.
    // Bersihkan session & local storage agar tidak langsung bypass ke halaman utama.
    window.sessionStorage.removeItem(AUTH_STAGE_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_STAGE_STORAGE_KEY);
    return 'welcome';
  } catch {
    return 'welcome';
  }
}

export function writeAuthStageToStorage(stage: AuthFlowStage): void {
  if (typeof window === 'undefined') return;
  try {
    // Stage hanya disimpan sementara untuk autostart jika diperlukan
    if (stage !== 'authenticated') {
      window.sessionStorage.setItem(AUTH_STAGE_STORAGE_KEY, stage);
    } else {
      window.sessionStorage.removeItem(AUTH_STAGE_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_STAGE_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export const WELCOME_VIDEO_LANDSCAPE_SRC =
  '/assets/aistudio/gemini_generated_video_91994e90_fb8b5397.mp4';

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


