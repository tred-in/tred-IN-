"use strict";
const cfg = window.TREDIN_CONFIG;
const API = (localStorage.getItem('TREDIN_API') || cfg?.api || '').replace(/\/$/, '');
let statusMsg = '';
let activeSupport = null;
let token = localStorage.getItem('tredin_admin_access') || '';
let admin = JSON.parse(localStorage.getItem('tredin_admin') || 'null');
let tab = 'dashboard';
const demo = { users: [{ user_id: 'DEMO001', role: 'CUSTOMER', status: 'ACTIVE' }], orders: [], kyc: [], finance: [], risk: [], support: [], audit: [] };
const app = document.querySelector('#app');
async function api(path, opts = {}, retry = true) { if (!API)
    throw Error('DEMO'); const h = new Headers(opts.headers); if (!(opts.body instanceof FormData))
    h.set('Content-Type', 'application/json'); if (token)
    h.set('Authorization', `Bearer ${token}`); const r = await fetch(API + path, { ...opts, headers: h }); const text = await r.text(); let d = {}; try {
    d = text ? JSON.parse(text) : {};
}
catch { } if (r.status === 401 && retry && path !== '/auth/login') {
    token = '';
    admin = null;
    localStorage.removeItem('tredin_admin_access');
    localStorage.removeItem('tredin_admin');
    throw Error('SESSION_EXPIRED');
} if (!r.ok)
    throw Error(d.error || 'REQUEST_FAILED'); return d; }
function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function login() { app.innerHTML = `<div class="login"><div class="loginBox"><div class="brand"><span class="brandMark">T</span><span>TRED<span class="gold">IN</span> ADMIN</span></div><div class="eyebrow">Control center</div><h1>Administrator access</h1><p class="muted">Live API when configured; demo control center when not.</p><form id="login" class="form"><input class="input" name="id" value="ADMIN001" placeholder="Admin ID / email"><input class="input" name="pw" value="demo" type="password" placeholder="Password"><button class="btn primary">Enter admin</button></form><div class="note">${esc(statusMsg || 'Use a real provisioned admin in live mode. Demo mode keeps the UI fully navigable without credentials.')}</div></div></div>`; document.querySelector('#login').addEventListener('submit', async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); try {
    const d = await api('/auth/login', { method: 'POST', body: JSON.stringify({ identifier: f.get('id'), password: f.get('pw') }) });
    token = d.accessToken || d.token;
    admin = d.user;
    localStorage.setItem('tredin_admin_access', token);
    localStorage.setItem('tredin_admin', JSON.stringify(admin));
    render();
}
catch (e) {
    if (API) {
        statusMsg = `Login failed: ${e.message}`;
        return login();
    }
    admin = { userId: 'ADMIN001', role: 'SUPER_ADMIN', name: 'Demo Administrator' };
    render();
} }); }
async function load() { if (!API)
    return; const reqs = [['/admin/users', 'users'], ['/admin/orders', 'orders'], ['/admin/kyc', 'kyc'], ['/admin/finance', 'finance'], ['/admin/risk', 'risk'], ['/admin/support', 'support'], ['/admin/audit', 'audit']]; for (const [p, k] of reqs)
    try {
        const d = await api(p);
        demo[k] = d[k] || d.users || d.orders || d.kyc || d.finance || d.risk || d.tickets || d.audit || [];
    }
    catch { } }
const items = [['dashboard', 'Dashboard'], ['users', 'Users'], ['orders', 'Orders'], ['kyc', 'KYC'], ['finance', 'Finance'], ['risk', 'Risk'], ['support', 'Support'], ['audit', 'Audit'], ['reconciliation', 'Reconciliation']];
function nav() { return items.map(([id, l]) => `<button class="${tab === id ? 'active' : ''}" data-tab="${id}">${l}</button>`).join(''); }
function layout(content) { app.innerHTML = `<div class="shell"><header class="top"><div class="brand"><span class="brandMark">T</span><span>TRED<span class="gold">IN</span> ADMIN</span></div><div class="toolbar"><span class="pill">${esc(admin?.role || 'SUPER_ADMIN')}</span><button class="btn small" id="logout">Logout</button></div></header><div class="layout"><aside><div class="nav">${nav()}</div></aside><main>${statusMsg ? `<div class="note" role="status" style="margin-bottom:14px">${esc(statusMsg)}</div>` : ''}${content}</main></div><div class="mobileNav">${nav()}</div></div>`; document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; render(); })); document.querySelector('#logout')?.addEventListener('click', () => { token = ''; admin = null; localStorage.removeItem('tredin_admin_access'); localStorage.removeItem('tredin_admin'); statusMsg = ''; login(); }); }
function table(headers, rows, empty = 'No records') { return `<div class="tableWrap"><table class="table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="muted">${empty}</td></tr>`}</tbody></table></div>`; }
function dashboard() { return `<div class="hero"><div><div class="eyebrow">Operations command</div><div class="h1">Admin control center</div><div class="muted">Monitor customers, execution, compliance, finance, risk and support from one place.</div></div></div><div class="grid g4"><div class="card stat"><div class="label">Users</div><div class="value">${demo.users.length}</div></div><div class="card stat"><div class="label">Orders</div><div class="value">${demo.orders.length}</div></div><div class="card stat"><div class="label">KYC cases</div><div class="value">${demo.kyc.length}</div></div><div class="card stat"><div class="label">Finance requests</div><div class="value">${demo.finance.length}</div></div></div><div class="grid g2" style="margin-top:14px"><div class="card"><div class="eyebrow">Operations</div><div class="grid" style="margin-top:12px"><button class="btn" data-tab="orders">Review orders</button><button class="btn" data-tab="risk">Review risk</button><button class="btn" data-tab="reconciliation">Run reconciliation</button></div></div><div class="card"><div class="eyebrow">Control</div><p class="muted">All privileged actions should be authenticated server-side and written to audit logs. The UI never assumes that a button click equals a completed operation.</p></div></div>`; }
function users() { return `<div class="hero"><div><div class="eyebrow">Customer control</div><div class="h1">Users</div></div></div><div class="card">${table(['User', 'Role', 'Status', 'Action'], demo.users.map(u => [esc(u.user_id), esc(u.role), `<span class="pill">${esc(u.status)}</span>`, `<button class="btn small" data-user-action="${esc(u.id || u.user_id)}" data-action="${u.status === 'SUSPENDED' ? 'activate' : 'suspend'}">${u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}</button>`]))}</div>`; }
function orders() { return `<div class="hero"><div><div class="eyebrow">Execution</div><div class="h1">Orders</div></div></div><div class="card">${table(['Customer', 'Instrument', 'Side', 'Type', 'Qty', 'Status'], demo.orders.map(o => [esc(o.customer_id || o.user_id), esc(o.symbol || o.instrument_id), esc(o.side), esc(o.order_type), esc(o.quantity), `<span class="pill">${esc(o.status)}</span>`]))}</div>`; }
function kyc() { return `<div class="hero"><div><div class="eyebrow">Compliance queue</div><div class="h1">KYC review</div></div></div><div class="card">${table(['Case', 'Customer', 'Status', 'Action'], demo.kyc.map(k => [esc(k.id), esc(k.customer_id), `<span class="pill">${esc(k.status)}</span>`, `<button class="btn small" data-kyc="${esc(k.id)}" data-action="approve">Approve</button> <button class="btn small danger" data-kyc="${esc(k.id)}" data-action="reject">Reject</button>`]))}</div>`; }
function finance() { return `<div class="hero"><div><div class="eyebrow">Money control</div><div class="h1">Finance queue</div></div></div><div class="card">${table(['Request', 'Customer', 'Type', 'Amount', 'Status', 'Action'], demo.finance.map(f => [esc(f.id), esc(f.customer_id), esc(f.request_type), `₹${Number(f.amount || 0).toLocaleString('en-IN')}`, `<span class="pill">${esc(f.status)}</span>`, `<button class="btn small" data-fin="${esc(f.id)}" data-action="approve">Approve</button> <button class="btn small danger" data-fin="${esc(f.id)}" data-action="reject">Reject</button>`]))}</div>`; }
function risk() { return `<div class="hero"><div><div class="eyebrow">Risk management</div><div class="h1">Risk limits</div></div></div><div class="card">${table(['Customer', 'Max order', 'Open orders', 'Daily loss', 'Margin x', 'Enabled'], demo.risk.map(r => [esc(r.customer_id), esc(r.max_order_value), esc(r.max_open_orders), esc(r.max_daily_loss), esc(r.margin_multiplier), String(r.enabled)]))}</div>`; }
function support() { return `<div class="hero"><div><div class="eyebrow">Service desk</div><div class="h1">Support tickets</div></div></div><div class="card">${table(['Ticket', 'Customer', 'Subject', 'Status', 'Messages', 'Action'], demo.support.map(t => [esc(t.id), esc(t.customer_id), `<button class="btn small" data-support-open="${esc(t.id)}">${esc(t.subject)}</button>`, `<span class="pill">${esc(t.status)}</span>`, esc(t.message_count), t.status === 'CLOSED' ? 'Closed' : `<button class="btn small danger" data-support-action="${esc(t.id)}" data-action="close">Close</button>`]))}</div>${activeSupport ? `<div class="card" style="margin-top:14px"><div class="eyebrow">Ticket detail</div><h3>${esc(activeSupport.ticket?.subject || 'Ticket')}</h3>${(activeSupport.messages || []).map((m) => `<div class="note" style="margin-top:8px">${esc(m.message)}<br><small class="muted">${esc(m.created_at || '')}</small></div>`).join('')}<form id="adminReply" class="form"><textarea class="input" name="message" maxlength="10000" placeholder="Reply to customer" required></textarea><button class="btn primary">Send reply</button></form></div>` : ''}`; }
function audit() { return `<div class="hero"><div><div class="eyebrow">Traceability</div><div class="h1">Audit log</div></div></div><div class="card">${table(['Time', 'Actor', 'Action', 'Entity', 'ID'], demo.audit.map(a => [esc(a.created_at), esc(a.actor_id), esc(a.action), esc(a.entity_type), esc(a.entity_id)]))}</div>`; }
function reconciliation() { return `<div class="hero"><div><div class="eyebrow">Integrity</div><div class="h1">Reconciliation</div><div class="muted">Run a structural reconciliation across executions, positions and ledger records.</div></div></div><div class="card"><button class="btn primary" id="recon">Run reconciliation now</button><div id="reconResult" class="note" style="margin-top:12px">No run started.</div></div>`; }
function bind() { document.querySelectorAll('[data-user-action]').forEach(b => b.addEventListener('click', async () => { const id = b.dataset.userAction, action = b.dataset.action; try {
    await api(`/admin/users/${id}/${action}`, { method: 'POST' });
    await load();
    statusMsg = `User ${action}d successfully.`;
    render();
}
catch (e) {
    statusMsg = API ? `Action failed: ${e.message}` : 'Demo mode is active; no live user change was made.';
    render();
} })); document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; render(); })); document.querySelectorAll('[data-kyc]').forEach(b => b.addEventListener('click', async () => { const id = b.dataset.kyc, action = b.dataset.action; try {
    await api(`/admin/kyc/${id}/${action}`, { method: 'POST' });
    await load();
    statusMsg = `KYC ${action}d successfully.`;
    render();
}
catch (e) {
    statusMsg = API ? `KYC action failed: ${e.message}` : 'Demo mode is active; no live KYC action was made.';
    render();
} })); document.querySelectorAll('[data-fin]').forEach(b => b.addEventListener('click', async () => { const id = b.dataset.fin, action = b.dataset.action; try {
    await api(`/admin/finance/${id}/${action}`, { method: 'POST' });
    await load();
    statusMsg = `Finance ${action}d successfully.`;
    render();
}
catch (e) {
    statusMsg = API ? `Finance action failed: ${e.message}` : 'Demo mode is active; no live finance action was made.';
    render();
} })); document.querySelectorAll('[data-support-open]').forEach(b => b.addEventListener('click', async () => { try {
    activeSupport = await api(`/admin/support/${b.dataset.supportOpen}`);
    statusMsg = '';
    render();
}
catch (e) {
    statusMsg = `Ticket load failed: ${e.message}`;
    render();
} })); document.querySelector('#adminReply')?.addEventListener('submit', async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); try {
    await api(`/admin/support/${activeSupport.ticket.id}/reply`, { method: 'POST', body: JSON.stringify({ message: String(f.get('message') || '').trim() }) });
    activeSupport = await api(`/admin/support/${activeSupport.ticket.id}`);
    statusMsg = 'Reply sent.';
    await load();
    render();
}
catch (e) {
    statusMsg = `Reply failed: ${e.message}`;
    render();
} }); document.querySelectorAll('[data-support-action]').forEach(b => b.addEventListener('click', async () => { const id = b.dataset.supportAction, action = b.dataset.action; try {
    await api(`/admin/support/${id}/${action}`, { method: 'POST' });
    await load();
    statusMsg = `Support ${action} completed successfully.`;
    render();
}
catch (e) {
    statusMsg = `Support action failed: ${e.message}`;
    render();
} })); document.querySelector('#recon')?.addEventListener('click', async () => { const box = document.querySelector('#reconResult'); try {
    const d = await api('/admin/reconciliation/run', { method: 'POST' });
    box.textContent = `PASS — ${JSON.stringify(d.reconciliation)}`;
}
catch (e) {
    box.textContent = API ? `FAILED — ${e.message}` : 'DEMO — no live reconciliation was run.';
} }); }
function render() { if (!admin)
    return login(); const pages = { dashboard, users, orders, kyc, finance, risk, support, audit, reconciliation }; layout(pages[tab]()); bind(); }
(async () => { if (token && API) {
    try {
        await load();
    }
    catch {
        token = '';
        admin = null;
        localStorage.removeItem('tredin_admin_access');
        localStorage.removeItem('tredin_admin');
    }
} if (!admin && !API && token)
    admin = { userId: 'ADMIN001', role: 'SUPER_ADMIN' }; render(); })();
