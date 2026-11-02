import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VALID_AUTH_PASSWORD,
  VALID_AUTH_USERNAME,
  WELCOME_VIDEO_LANDSCAPE_SRC,
  WELCOME_VIDEO_PORTRAIT_SRC,
  getPortraitVideoFitMode,
  getWelcomeVideoSrc,
  isPortraitViewport,
  validateLoginCredentials,
} from './auth-gate';

test('validateLoginCredentials accepts fitriawulandari / 123456 and rejects invalid inputs', () => {
  const emptyCheck = validateLoginCredentials('', '');
  assert.equal(emptyCheck.valid, false);
  assert.ok(emptyCheck.error);

  const wrongUser = validateLoginCredentials('admin', '123456');
  assert.equal(wrongUser.valid, false);

  const wrongPass = validateLoginCredentials('fitriawulandari', '000000');
  assert.equal(wrongPass.valid, false);

  const validExact = validateLoginCredentials(
    VALID_AUTH_USERNAME,
    VALID_AUTH_PASSWORD
  );
  assert.equal(validExact.valid, true);
  assert.equal(validExact.normalizedUsername, 'fitriawulandari');

  const validWithSpacesAndCaps = validateLoginCredentials(
    '  FitriaWulandari ',
    ' 123456 '
  );
  assert.equal(validWithSpacesAndCaps.valid, true);
});

test('isPortraitViewport and getWelcomeVideoSrc select portrait video on mobile/portrait and landscape video on desktop/landscape', () => {
  assert.equal(isPortraitViewport(390, 844), true);
  assert.equal(isPortraitViewport(375, 667), true);
  assert.equal(isPortraitViewport(1440, 960), false);
  assert.equal(isPortraitViewport(1280, 720), false);
  assert.equal(isPortraitViewport(0, 0), false);

  assert.equal(getWelcomeVideoSrc(true), WELCOME_VIDEO_PORTRAIT_SRC);
  assert.equal(getWelcomeVideoSrc(false), WELCOME_VIDEO_LANDSCAPE_SRC);
});

test('getPortraitVideoFitMode preserves 9:16 aspect ratio on tall 20:9 smartphones and wider 3:4 portrait tablets', () => {
  // Tall 20:9 phone like 1220x2712 or 390x844 -> fit-width so video is never stretched vertically
  assert.equal(getPortraitVideoFitMode(1220, 2712), 'fit-width');
  assert.equal(getPortraitVideoFitMode(390, 844), 'fit-width');
  // Standard 9:16 phone (360x640) -> fit-width
  assert.equal(getPortraitVideoFitMode(360, 640), 'fit-width');
  // Wider portrait tablet (768x1024, 3:4) -> fit-height so video does not overflow vertically
  assert.equal(getPortraitVideoFitMode(768, 1024), 'fit-height');
});


