export async function postLog(url, payload) {
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error('Logging request failed');
    return true;
  } catch (e) {
    console.warn('postLog error', e);
    return false;
  }
}
