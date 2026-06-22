export function getSaved(key) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    if (key === 'quiz_data') {
      // decode base64 then parse
      return JSON.parse(atob(v));
    }
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}
export function saveData(key, obj) {
  try {
    if (key === 'quiz_data') {
      localStorage.setItem(key, btoa(JSON.stringify(obj)));
    } else {
      localStorage.setItem(key, JSON.stringify(obj));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function removeSaved(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

export async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}
