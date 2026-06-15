// src/lib/systemUtils.js
const TRUSTED_SYSTEM_TEACHER = 'em3k-system';
const PUBLIC_VERIFICATION_KEY = '...'; // hardcoded

export async function isValidSystemContent(teacherData, manifest) {
  if (teacherData.slug !== TRUSTED_SYSTEM_TEACHER || !teacherData.isSystem) {
    return false;
  }
  // Optional: verify signature with Web Crypto
  return true; // expand with real verification later
}