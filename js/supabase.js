// ============================================================
//  Very Breizh Cup — Couche Supabase partagée
// ============================================================
const SUPABASE_URL  = 'https://zadctpscfibebpshaczw.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZGN0cHNjZmliZWJwc2hhY3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MzMwMDMsImV4cCI6MjA5OTEwOTAwM30.x7qh98X4Tzi9VTBiJz2rkzBagvE4KSlG3EJLyMGJSBM';

const HEADERS = {
  'apikey': SUPABASE_ANON,
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const SIZE_LABELS  = { S: 'Small', M: 'Medium', I: 'Intermediate', L: 'Large' };
const MEDALS       = ['🥇','🥈','🥉'];
const PODIUM_W     = [3, 2, 1];

// ---- REST helpers ----
async function sbGet(table, params = '') {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: HEADERS });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbPost(table, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbPatch(table, params, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method: 'PATCH', headers: HEADERS, body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbDelete(table, params) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method: 'DELETE', headers: { ...HEADERS, 'Prefer': 'return=minimal' }
  });
  if (!r.ok) throw new Error(await r.text());
}

// ---- Realtime (WebSocket Supabase) ----
function realtimeSubscribe(table, callback) {
  const wsUrl = SUPABASE_URL.replace('https', 'wss') + '/realtime/v1/websocket?apikey=' + SUPABASE_ANON + '&vsn=1.0.0';
  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({ topic: `realtime:public:${table}`, event: 'phx_join', payload: {}, ref: '1' }));
  };
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.event === 'INSERT' || msg.event === 'UPDATE' || msg.event === 'DELETE') {
      callback(msg.event, msg.payload?.record);
    }
  };
  ws.onerror = () => console.warn('Realtime WS error');
  return ws;
}

// ---- UI helpers partagés ----
function showToast(msg, color = 'lime', duration = 2800) {
  let t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.borderColor = color === 'red' ? 'var(--red)' : 'var(--lime)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function renderPodiumLines(picks, finalists) {
  return picks.map((pid, i) => {
    const f = finalists.find(x => String(x.id) === String(pid));
    if (!f) return '';
    return `<div class="podium-line">
      <span class="medal">${MEDALS[i]}</span>
      <span class="podium-name"><strong>${f.chien}</strong> · ${f.conducteur}</span>
      <span class="podium-cat">${f.cat}</span>
    </div>`;
  }).join('');
}

function drawQR(canvasId, text) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 130;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  const hash = [...text].reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0) | 0, 0);
  const cells = 15, cell = Math.floor(size / cells);
  ctx.fillStyle = '#000';
  const drawFinder = (ox, oy) => {
    ctx.fillStyle = '#000'; ctx.fillRect(ox, oy, cell*7, cell*7);
    ctx.fillStyle = '#fff'; ctx.fillRect(ox+cell, oy+cell, cell*5, cell*5);
    ctx.fillStyle = '#000'; ctx.fillRect(ox+cell*2, oy+cell*2, cell*3, cell*3);
  };
  drawFinder(0, 0); drawFinder((cells-7)*cell, 0); drawFinder(0, (cells-7)*cell);
  let seed = Math.abs(hash);
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inFinder = (r<8&&c<8)||(r<8&&c>=cells-8)||(r>=cells-8&&c<8);
      if (inFinder) continue;
      seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
      if (seed % 2 === 0) { ctx.fillStyle='#000'; ctx.fillRect(c*cell, r*cell, cell, cell); }
    }
  }
  ctx.fillStyle = '#99cc33';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, size/2, size - 3);
}
