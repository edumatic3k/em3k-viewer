import { openDB } from 'idb';

const database = openDB('em3k-viewer', 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('packages')) {
      db.createObjectStore('packages', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('progress')) {
      db.createObjectStore('progress', { keyPath: 'courseId' });
    }
    if (!db.objectStoreNames.contains('courseSettings')) {
      db.createObjectStore('courseSettings', { keyPath: 'courseId' });
    }
  },
});

export async function listInstalledPackages() {
  return (await database).getAll('packages');
}

export async function getInstalledPackage(courseId) {
  return (await database).get('packages', courseId);
}

export async function installPackage(record) {
  return (await database).put('packages', record);
}

export async function setPackageActive(courseId, active) {
  const db = await database;
  const record = await db.get('packages', courseId);
  if (!record) return;
  record.active = active;
  await db.put('packages', record);
}

export async function getCourseSettings() {
  return (await database).getAll('courseSettings');
}

export async function setCourseActive(courseId, active) {
  return (await database).put('courseSettings', { courseId, active });
}

export async function removePackage(courseId) {
  return (await database).delete('packages', courseId);
}

export async function getCourseProgress(courseId) {
  return (await database).get('progress', courseId);
}

export async function saveCourseProgress(courseId, progress) {
  return (await database).put('progress', { courseId, ...progress });
}