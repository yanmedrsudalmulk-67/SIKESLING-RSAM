import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VALID_AUTH_PASSWORD,
  VALID_AUTH_USERNAME,
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
