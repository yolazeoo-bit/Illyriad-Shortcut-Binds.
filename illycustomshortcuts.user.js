// ==UserScript==
// @name         Illyriad Keyboard Shortcuts
// @namespace    https://illyriad.co.uk/
// @version      6.7
// @description  Fully customizable keyboard shortcuts for Illyriad (URLs + actions)
// @author       You
// @match        *://*.illyriad.co.uk/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    if (window.__illyShortcutsLoaded) return;
    window.__illyShortcutsLoaded = true;

    console.log('%c[Illyriad Shortcuts] Script loaded successfully!', 'color:#8cf; font-weight:bold;');

    // ---------- Styles ----------
    const CSS = `
        .illy-panel {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #222222; color: #dcdcdc; border: 1px solid #3a3a3a; border-radius: 8px;
            padding: 16px 18px; font: 13px/1.5 "Segoe UI", Roboto, Arial, sans-serif;
            z-index: 2147483647; box-sizing: border-box;
            max-width: 96vw; max-height: 92vh;
            display: flex; flex-direction: column; overflow: hidden;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
        }
        .illy-panel button {
            font: inherit; font-size: 12.5px; color: #dcdcdc; background: #2e2e2e;
            border: 1px solid #444444; border-radius: 5px; padding: 5px 12px; cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
        }
        .illy-panel button:hover { background: #3a3a3a; border-color: #555555; }
        .illy-panel button.illy-primary { background: #d97a1f; border-color: #d97a1f; color: #1a1a1a; font-weight: 600; }
        .illy-panel button.illy-primary:hover { background: #f09538; border-color: #f09538; }
        .illy-panel button.illy-danger:hover { background: #5a2a30; border-color: #8a3b44; color: #ffd6da; }
        .illy-panel button.illy-round { width: 24px; height: 24px; padding: 0; border-radius: 50%; font-weight: 600; }
        .illy-panel button.illy-sq { width: 28px; padding: 5px 0; }
        .illy-panel button.illy-close {
            border: none; background: none; font-size: 20px; line-height: 1; padding: 0 4px; color: #999999;
        }
        .illy-panel button.illy-close:hover { color: #fff; background: none; }
        .illy-panel button.illy-recording { background: #5a2a30; border-color: #8a3b44; color: #ffd6da; }

        /* Compact favorite star */
        .illy-panel button.illy-star {
            border: none; background: none; font-size: 15px; padding: 0;
            color: #666; width: 18px; height: 20px; display: flex;
            align-items: center; justify-content: center;
        }
        .illy-panel button.illy-star.active { color: #f09538; }

        .illy-panel input {
            font: inherit; color: #eeeeee; background: #161616;
            border: 1px solid #444444; border-radius: 5px; padding: 4px 8px; box-sizing: border-box;
        }
        .illy-panel input:focus { outline: none; border-color: #f09538; box-shadow: 0 0 0 2px rgba(232, 136, 44, 0.25); }
        .illy-panel code { background: #161616; border: 1px solid #333333; border-radius: 3px; padding: 0 4px; font-size: 12px; }
        .illy-panel hr { border: 0; border-top: 1px solid #333333; margin: 0 0 10px 0; width: 100%; flex-shrink: 0; }

        #illy-shortcut-help   { width: 760px; height: 520px; }
        #illy-shortcut-editor { width: 800px; height: 600px; }
        #illy-info-modal      { width: 520px; max-height: 80vh; z-index: 2147483648; }

        .illy-head {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #333333; flex-shrink: 0;
        }
        .illy-title { font-size: 15px; font-weight: 600; color: #fff; }
        .illy-head-btns { display: flex; gap: 8px; align-items: center; }
        .illy-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-shrink: 0; flex-wrap: wrap; }
        .illy-hint { color: #888888; font-size: 11.5px; }

        .illy-list {
            overflow-y: auto; flex: 1; display: grid;
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
            column-gap: 18px; align-content: start;
        }
        .illy-row { display: flex; gap: 10px; align-items: center; padding: 4px 6px; border-radius: 5px; min-width: 0; }
        .illy-row:hover { background: #2b2b2b; }
        .illy-key {
            min-width: 26px; text-align: center; padding: 1px 7px;
            font: 600 12px Consolas, "Courier New", monospace; color: #e8882c;
            background: #161616; border: 1px solid #444444; border-radius: 4px;
        }
        .illy-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .illy-empty { color: #888888; padding: 10px 0; }

        .illy-note {
            color: #aaaaaa; font-size: 12px; margin-bottom: 12px; padding: 8px 10px;
            background: #272727; border: 1px solid #333333; border-radius: 5px; flex-shrink: 0;
        }
        .illy-rows { overflow-y: auto; flex: 1; padding-right: 6px; }

        /* Tightened gaps and widths */
        .illy-erow { display: flex; gap: 4px; align-items: center; margin: 3px 0; }
        .illy-in-key { width: 90px; text-align: center; font-family: Consolas, "Courier New", monospace; cursor: pointer; }
        .illy-in-target { flex: 1; min-width: 0; font-family: Consolas, "Courier New", monospace; }
        .illy-in-label { width: 125px; }

        /* Drag Handle */
        .illy-drag-handle {
            cursor: grab;
            color: #777;
            width: 14px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            flex-shrink: 0;
        }
        .illy-drag-handle:hover { color: #fff; }
        .illy-drag-handle:active { cursor: grabbing; }

        .illy-drag-handle::before {
            content: "••\\A••";
            white-space: pre;
            font-size: 9px;
            line-height: 8.5px;
            letter-spacing: 1.5px;
            text-align: center;
        }

        /* Dragging Visuals */
        .illy-erow.dragging {
            opacity: 0.4;
            background: #333;
            border-radius: 5px;
        }

        .illy-add-wrap { margin-top: 10px; flex-shrink: 0; }
        .illy-footer {
            display: flex; gap: 8px; margin-top: 14px; padding-top: 12px; padding-right: 18px;
            border-top: 1px solid #333333; justify-content: flex-end; flex-shrink: 0;
        }

        .illy-info-body { overflow-y: auto; flex: 1; padding-right: 8px; }
        .illy-info-body p { margin: 0 0 8px 0; }
        .illy-info-body h3 { font-size: 13.5px; font-weight: 600; color: #e8882c; margin: 16px 0 4px 0; }
        .illy-info-body ul { margin: 4px 0 8px 0; padding-left: 20px; color: #bbbbbb; }

        .illy-grip {
            position: absolute; right: 4px; bottom: 4px; width: 12px; height: 12px;
            cursor: nwse-resize; border-right: 2px solid #666666; border-bottom: 2px solid #666666;
            border-bottom-right-radius: 3px;
        }

        #illy-shortcut-toast {
            position: fixed; bottom: 70px; right: 24px;
            background: #222222; color: #eeeeee; border: 1px solid #3a3a3a; border-left: 3px solid #f09538;
            border-radius: 6px; padding: 9px 14px; font: 13px "Segoe UI", Roboto, Arial, sans-serif;
            z-index: 2147483647; pointer-events: none; transition: opacity 0.25s;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        }

        #illy-shortcut-btn {
            position: fixed; bottom: 24px; right: 24px; padding: 4px 10px;
            background: #222222; color: #bbbbbb; border: 1px solid #3a3a3a; border-radius: 6px;
            font: 12px "Segoe UI", Roboto, Arial, sans-serif; cursor: pointer; z-index: 2147483647; user-select: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        #illy-shortcut-btn:hover { background: #2e2e2e; color: #fff; border-color: #f09538; }
    `;

    function addStyles() {
        if (document.getElementById('illy-styles')) return;
        const style = document.createElement('style');
        style.id = 'illy-styles';
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);
    }
    addStyles();

    // ---------- Helpers ----------
    function isTyping() {
        const el = document.activeElement;
        if (!el) return false;
        const tag = el.tagName.toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    }

    function normText(s) {
        return (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function isShown(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // Splits by +, lowercases everything except modifiers (for matching)
    function normalizeKey(k) {
        if (!k) return '';
        return k.split('+').map(part => {
            const p = part.toLowerCase();
            if (p === 'ctrl' || p === 'shift' || p === 'alt' || p === 'meta') {
                return p.charAt(0).toUpperCase() + p.slice(1);
            }
            return p; // lowercase the actual key
        }).join('+');
    }

    function displayKey(k) {
        if (!k) return '—';
        if (k === ' ') return 'Space';
        return k;
    }

    // ---------- Navigation (with own forward stack) ----------
    let forwardStack = [];
    let internalNav = false;
    let internalNavTimer = null;

    function markInternalNav(ms = 500) {
        internalNav = true;
        clearTimeout(internalNavTimer);
        internalNavTimer = setTimeout(() => { internalNav = false; }, ms);
    }

    window.addEventListener('hashchange', () => {
        if (!internalNav) forwardStack = [];
    });

    function goHash(hash) {
        if (location.hash !== hash) {
            location.hash = hash;
        } else {
            window.dispatchEvent(new HashChangeEvent('hashchange', {
                oldURL: location.href, newURL: location.href
            }));
        }
    }

    function goBack() {
        forwardStack.push(location.hash);
        markInternalNav();
        history.back();
    }

    function goForward() {
        const before = location.href;
        markInternalNav(600);
        history.forward();
        setTimeout(() => {
            if (location.href !== before) {
                forwardStack.pop();
            } else if (forwardStack.length) {
                const target = forwardStack.pop();
                markInternalNav(500);
                goHash(target);
            } else {
                showToast('Nothing to go forward to');
            }
        }, 200);
    }

    // ---------- Drag & Resize Helpers ----------
    function detach(panel) {
        if (panel.dataset.detached) return;
        const rect = panel.getBoundingClientRect();
        panel.style.transform = 'none';
        panel.style.margin = '0';
        panel.style.left = rect.left + 'px';
        panel.style.top = rect.top + 'px';
        panel.dataset.detached = '1';
    }

    function makeDraggable(panel, handle) {
        handle.style.cursor = 'grab';
        handle.style.userSelect = 'none';

        handle.addEventListener('mousedown', (e) => {
            if (e.target.tagName.toLowerCase() === 'button') return;
            e.preventDefault();
            detach(panel);
            handle.style.cursor = 'grabbing';

            const startX = e.clientX, startY = e.clientY;
            const startLeft = parseFloat(panel.style.left);
            const startTop = parseFloat(panel.style.top);

            const onMove = (ev) => {
                panel.style.left = (startLeft + ev.clientX - startX) + 'px';
                panel.style.top = Math.max(0, startTop + ev.clientY - startY) + 'px';
            };
            const onUp = () => {
                handle.style.cursor = 'grab';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    function makeResizable(panel, minW, minH) {
        const grip = document.createElement('div');
        grip.className = 'illy-grip';
        grip.title = 'Drag to resize';
        panel.appendChild(grip);

        grip.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            detach(panel);

            const startX = e.clientX, startY = e.clientY;
            const startW = panel.offsetWidth, startH = panel.offsetHeight;

            const onMove = (ev) => {
                panel.style.width = Math.max(minW, startW + ev.clientX - startX) + 'px';
                panel.style.height = Math.max(minH, startH + ev.clientY - startY) + 'px';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // ---------- In-page Actions ----------
    function clickByText(words, label) {
        const imgSel = words.map(w =>
            `img[src*="${w}" i], img[alt*="${w}" i], img[title*="${w}" i], input[value*="${w}" i]`).join(', ');
        const imgBtn = document.querySelector(imgSel);
        if (imgBtn) { imgBtn.click(); showToast(label + ' clicked'); return; }

        const elements = Array.from(document.querySelectorAll('a, button, input, div, span'));
        for (const el of elements) {
            if (!isShown(el)) continue;
            const text = el.textContent.trim().toLowerCase();
            if (!words.includes(text)) continue;
            if (el.children.length > 0) continue;
            const style = getComputedStyle(el);
            if (style.cursor === 'pointer' || ['A', 'BUTTON', 'INPUT'].includes(el.tagName) || style.backgroundImage !== 'none') {
                el.click(); showToast(label + ' clicked'); return;
            }
        }
        showToast('Could not find ' + label + ' button');
    }

    function upgradeBuilding() { clickByText(['upgrade', 'upgrade further'], 'Upgrade'); }
    function demolishBuilding() { clickByText(['demolish'], 'Demolish'); }

    function findInnermost(phrase) {
        const matches = new Set();
        for (const el of document.body.querySelectorAll('*')) {
            if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
            if (!normText(el.textContent).includes(phrase)) continue;
            if (!isShown(el)) continue;
            matches.add(el);
        }
        return Array.from(matches).filter(el => !Array.from(el.children).some(c => matches.has(c)));
    }

    function coinLabel(img) {
        let node = img;
        for (let i = 0; i < 4 && node; i++, node = node.parentElement) {
            const text = normText(node.textContent);
            if (text && text.length <= 30) return text;
        }
        return normText((img.alt || '') + ' ' + (img.title || ''));
    }

    function isThreeCoin(img) {
        const nums = coinLabel(img).match(/\d+/g);
        return !!nums && nums.length === 1 && nums[0] === '3';
    }

    function instantComplete() {
        if (normText(document.body.innerText).includes('no buildings currently in queue')) {
            showToast('Queue is empty, nothing to complete.'); return;
        }
        const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
        const headings = findInnermost('instantly complete');
        if (!headings.length) { showToast('Could not find the "Instantly complete" section'); return; }
        const extendHeads = findInnermost('extend duration');
        const allImgs = Array.from(document.querySelectorAll('img')).filter(isShown);

        for (const head of headings) {
            let candidates = allImgs.filter(img =>
                head.contains(img) || (head.compareDocumentPosition(img) & FOLLOWING));
            const cutoff = extendHeads.find(h =>
                !head.contains(h) && (head.compareDocumentPosition(h) & FOLLOWING));
            if (cutoff) {
                candidates = candidates.filter(img =>
                    !cutoff.contains(img) &&
                    (cutoff.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_PRECEDING));
            }
            candidates = candidates.slice(0, 6);
            const three = candidates.find(isThreeCoin);
            if (three) { three.click(); showToast('Instant Complete clicked (3 Prestige)'); return; }
            if (cutoff && candidates.length === 1) {
                const nums = coinLabel(candidates[0]).match(/\d+/g);
                if (!nums || nums.every(n => n === '3')) {
                    candidates[0].click(); showToast('Instant Complete clicked (3 Prestige)'); return;
                }
            }
        }
        showToast('Could not find the 3 Prestige coin');
    }

    const ACTIONS = {
        upgrade: upgradeBuilding,
        demolish: demolishBuilding,
        instant: instantComplete,
        refresh: () => location.reload(),
        back: goBack,
        forward: goForward,
        copyurl: () => {
            navigator.clipboard.writeText(location.href).then(() => {
                showToast('URL Copied to clipboard!');
            }).catch(() => {
                showToast('Failed to copy URL.');
            });
        }
    };

    // ---------- Default Binding Catalog ----------
    // All empty except one example so the user knows how it works!
    const DEFAULT_BINDINGS = [
        { key: 'Shift+M', target: '#/World/Map',           label: 'World Map' },
        { key: '', target: '#/City',                label: 'City' },
        { key: '', target: '#/City/Resources',      label: 'City → Resources' },
        { key: '', target: '#/City/Buildings',      label: 'City → Buildings' },
        { key: '', target: '#/City/Inventory',      label: 'City → Inventory' },
        { key: '', target: '#/City/Research',       label: 'City → Research' },
        { key: '', target: '#/City/Units',          label: 'City → Units' },
        { key: '', target: '#/Military',            label: 'Military / Armies' },
        { key: '', target: '#/Diplomacy',           label: 'Diplomacy' },
        { key: '', target: '#/Trade',               label: 'Trade' },
        { key: '', target: '#/Herald',              label: 'Herald' },
        { key: '', target: '#/Profile',             label: 'Profile' },
        { key: '', target: '#/Alliance',            label: 'Alliance' },
        { key: '', target: '#/Kingdom',             label: 'Kingdom' },
        { key: '', target: '#/Quests',              label: 'Quests' },
        { key: '', target: '#/Factions',            label: 'Factions' },
        { key: '', target: '#/Groups',              label: 'Groups' },
        { key: '', target: '#/Chat',                label: 'Chat' },
        { key: '', target: '#/Notifications',       label: 'Notifications' },
        { key: '', target: '#/Sovereignty',         label: 'Sovereignty' },
        { key: '', target: '#/Trade/Orders',        label: 'Trade → Orders' },
        { key: '', target: '#/Trade/Caravans',      label: 'Trade → Caravans' },
        { key: '', target: '#/Alliance/Forum',      label: 'Alliance → Forum' },
        { key: '',  target: 'upgrade',   label: 'Upgrade open building' },
        { key: '',  target: 'demolish',  label: 'Demolish open building' },
        { key: '', target: 'instant',   label: 'Instantly Complete (Prestige)' },
        { key: '',  target: 'back',      label: 'Back' },
        { key: '',  target: 'forward',   label: 'Forward' },
        { key: '', target: 'refresh',   label: 'Reload page' }
    ];

    const STORAGE_KEY = 'illy-shortcuts-bindings-v6';
    const MIGRATION_KEY = 'illy-shortcuts-nav-added-v56';

    function loadBindings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return DEFAULT_BINDINGS.map(b => ({ ...b, fav: false }));
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return DEFAULT_BINDINGS.map(b => ({ ...b, fav: false }));
            const list = parsed.map(r => ({ key: r.key || '', target: r.target || '', label: r.label || '', fav: !!r.fav }));

            if (!localStorage.getItem(MIGRATION_KEY)) {
                for (const nb of DEFAULT_BINDINGS.filter(b => b.target === 'back' || b.target === 'forward')) {
                    const hasAction = list.some(b => b.target === nb.target);
                    const keyTaken = list.some(b => normalizeKey(b.key) === normalizeKey(nb.key));
                    if (!hasAction && !keyTaken) list.push({ ...nb, fav: false });
                }
                localStorage.setItem(MIGRATION_KEY, '1');
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            }
            return list;
        } catch (_) { return DEFAULT_BINDINGS.map(b => ({ ...b, fav: false })); }
    }

    function saveBindings(b) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)); } catch (_) {}
    }

    let bindings = loadBindings();
    let keyMapCache = null;

    function buildKeyMap() {
        if (keyMapCache) return keyMapCache;
        const map = {};
        for (const b of bindings) {
            if (!b.key || !b.target) continue;
            const nk = normalizeKey(b.key);
            if (nk) map[nk] = b.target;
        }
        keyMapCache = map;
        return map;
    }

    // ---------- Target execution ----------
    function runTarget(target) {
        const t = (target || '').trim();
        if (!t) { showToast('Empty shortcut target'); return; }

        if (/^newtab:/i.test(t)) {
            window.open(t.replace(/^newtab:/i, '').trim(), '_blank');
            return;
        }

        const ALIASES = {
            'next': 'forward', 'next page': 'forward', 'nextpage': 'forward', 'go forward': 'forward',
            'prev': 'back', 'previous': 'back', 'previous page': 'back', 'prev page': 'back', 'go back': 'back',
            'reload': 'refresh', 'complete': 'instant', 'upgrade building': 'upgrade', 'copy': 'copyurl'
        };
        let actionName = t.replace(/^action:/i, '').trim().toLowerCase();
        actionName = ALIASES[actionName] || actionName;
        if (ACTIONS[actionName]) { ACTIONS[actionName](); return; }

        if (t.startsWith('#')) { goHash(t); return; }

        if (!/^(https?:\/\/|\/|\.\/|\.\.\/|\?)/i.test(t)) {
            showToast('Unknown action: "' + t + '"', 3500);
            return;
        }

        try {
            const url = new URL(t, location.href);
            if (url.hash && url.origin === location.origin &&
                url.pathname === location.pathname && !url.search) {
                goHash(url.hash);
            } else {
                location.href = url.href;
            }
        } catch (_) {
            showToast('Invalid shortcut target: ' + t);
        }
    }

    // ---------- Toast ----------
    function showToast(msg, duration = 1800, undoFn = null) {
        let t = document.getElementById('illy-shortcut-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'illy-shortcut-toast';
            document.body.appendChild(t);
        }

        t.style.pointerEvents = undoFn ? 'auto' : 'none';
        t.style.cursor = undoFn ? 'pointer' : 'default';

        if (undoFn) {
            t.innerHTML = `${escapeHtml(msg)} <br><span style="color: #f09538; font-size: 11px; text-decoration: underline;">Click to Undo</span>`;
            t.onclick = () => {
                undoFn();
                t.style.opacity = '0';
                t.onclick = null;
            };
        } else {
            t.textContent = msg;
            t.onclick = null;
        }

        t.style.opacity = '1';
        clearTimeout(t._timer);
        t._timer = setTimeout(() => {
            t.style.opacity = '0';
            setTimeout(() => { t.onclick = null; t.style.pointerEvents = 'none'; }, 250);
        }, duration);
    }

    // ---------- Info Modal ----------
    function showInfo() {
        if (document.getElementById('illy-info-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'illy-info-modal';
        modal.className = 'illy-panel';

        modal.innerHTML = `
            <div class="illy-head">
                <div class="illy-title">Shortcuts Guide</div>
                <button id="illy-info-close" class="illy-close" title="Close">&times;</button>
            </div>
            <div class="illy-info-body">
                <p><b>How to use:</b> Press the designated key anywhere in the game (except while typing in a text box).</p>

                <h3>1. URLs &amp; Hash Routes</h3>
                <p>You can type a full web link like <code>https://elgea.illyriad.co.uk/...</code> or a hash route like <code>#/City/Resources</code>. Hash routes are faster because they don't reload the page.</p>

                <h3>2. In-Page Actions (No Links)</h3>
                <p>Some things can't be done with a link (like clicking a button). To do these, type one of these exact words into the <b>Target</b> box:</p>
                <ul>
                    <li><code>upgrade</code> - Clicks the "Upgrade" button on a building.</li>
                    <li><code>demolish</code> - Clicks the "Demolish" button.</li>
                    <li><code>instant</code> - Clicks the 3-Prestige coin for "Instantly Complete".</li>
                    <li><code>refresh</code> - Reloads the current page.</li>
                    <li><code>back</code> - Acts like the browser Back button.</li>
                    <li><code>forward</code> - Acts like the browser Forward button (works with internal pages).</li>
                    <li><code>copyurl</code> - Copies the current URL to your clipboard.</li>
                </ul>

                <h3>3. New Tab</h3>
                <p>If you want a link to open in a new tab instead of the current one, put <code>newtab:</code> in front of it. Example: <code>newtab:https://elgea.illyriad.co.uk/</code></p>

                <h3>4. The Editor (Setting up your keys)</h3>
                <p>To give you total control, <b>every shortcut starts empty</b> except for one example (<code>Shift+M</code> for the World Map). This means you can build your perfect layout from scratch without having to delete keys you'll never use.</p>
                <ul>
                    <li><b>How Recording Works:</b> Click the box under the <b>Key</b> column. It will highlight and say <i>"Press key..."</i>. Whatever you press next will be recorded.
                        <ul>
                            <li>You can press a <b>single key</b> (like <code>M</code>).</li>
                            <li>You can press a <b>combination</b> starting with modifiers (like <code>Shift+A</code>, <code>Ctrl+Shift+K</code>, or <code>Alt+F4</code>).</li>
                            <li><i>(Note: If you only press Shift, Ctrl, or Alt by themselves and let go, it will ignore it and wait for a real key).</i></li>
                        </ul>
                    </li>
                    <li><b>To Reorder:</b> Click and hold the <b>four dots (••)</b> on the far left of any row. Drag the row up or down to change its position in the list. This order will be reflected exactly in your Help window.</li>
                    <li><b>To Test:</b> Click the <b>Run</b> button next to a shortcut to instantly test if the Target works, without having to save or close the window.</li>
                    <li><b>To Delete:</b> Click the <b>red ×</b> button on the right side of the row.</li>
                </ul>
                <p><b>IMPORTANT:</b> Make sure you click <b>Save &amp; Update List</b> at the bottom when you are finished, or all your changes will be lost!</p>
            </div>
        `;
        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        modal.querySelector('#illy-info-close').onclick = closeModal;

        const escClose = (e) => {
            if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escClose, true); }
        };
        document.addEventListener('keydown', escClose, true);
    }

    // ---------- Help Box ----------
    let helpEscHandler = null;

    function closeHelp() {
        const el = document.getElementById('illy-shortcut-help');
        if (el) el.remove();
        if (helpEscHandler) {
            document.removeEventListener('keydown', helpEscHandler, true);
            helpEscHandler = null;
        }
    }

    function showHelp() {
        if (document.getElementById('illy-shortcut-help')) { closeHelp(); return; }

        const help = document.createElement('div');
        help.id = 'illy-shortcut-help';
        help.className = 'illy-panel';

        help.innerHTML = `
            <div id="illy-help-header" class="illy-head">
                <div class="illy-title">Illyriad Keyboard Shortcuts</div>
                <div class="illy-head-btns">
                    <button id="illy-help-info" class="illy-round" title="Shortcut Guide">i</button>
                    <button id="illy-help-close" class="illy-close" title="Close">&times;</button>
                </div>
            </div>
            <div class="illy-toolbar">
                <button id="illy-edit-shortcuts" class="illy-primary">Edit shortcut(s)</button>
                <input type="text" id="illy-help-search" placeholder="Search shortcuts..." style="flex:1; padding: 5px 10px;" />
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:#aaa;">
                    <input type="checkbox" id="illy-help-favs"> Favorites Only
                </label>
            </div>
            <hr>
            <div id="illy-help-list" class="illy-list"></div>
        `;
        document.body.appendChild(help);

        const rowsHost = help.querySelector('#illy-help-list');
        const searchInput = help.querySelector('#illy-help-search');
        const favCheckbox = help.querySelector('#illy-help-favs');

        const drawList = () => {
            const q = searchInput.value.toLowerCase();
            const showFavsOnly = favCheckbox.checked;

            const filtered = bindings.filter(b => b.key && b.target).filter(b => {
                if (showFavsOnly && !b.fav) return false;
                if (!q) return true;
                return (b.key && b.key.toLowerCase() === q) ||
                       (b.label && b.label.toLowerCase().includes(q)) ||
                       (b.target && b.target.toLowerCase().includes(q));
            });

            const rows = filtered.map(b => `
                <div class="illy-row">
                    <div class="illy-key">${escapeHtml(displayKey(b.key))}</div>
                    <div class="illy-label" title="${escapeHtml(b.label || b.target)}">${escapeHtml(b.label || b.target)}</div>
                </div>
            `).join('') || '<div class="illy-empty">No matching shortcuts found.</div>';

            rowsHost.innerHTML = rows;
        };

        drawList();

        searchInput.addEventListener('input', drawList);
        favCheckbox.addEventListener('change', drawList);

        makeDraggable(help, help.querySelector('#illy-help-header'));
        makeResizable(help, 300, 200);

        help.querySelector('#illy-help-info').onclick = showInfo;
        help.querySelector('#illy-help-close').onclick = closeHelp;
        help.querySelector('#illy-edit-shortcuts').onclick = () => { closeHelp(); showEditor(); };

        helpEscHandler = (e) => { if (e.key === 'Escape') closeHelp(); };
        document.addEventListener('keydown', helpEscHandler, true);
    }

    // ---------- Editor ----------
    let editorEscHandler = null;

    function closeEditor() {
        const el = document.getElementById('illy-shortcut-editor');
        if (el) el.remove();
        if (editorEscHandler) {
            document.removeEventListener('keydown', editorEscHandler, true);
            editorEscHandler = null;
        }
    }

    function showEditor() {
        if (document.getElementById('illy-shortcut-editor')) { closeEditor(); return; }

        const panel = document.createElement('div');
        panel.id = 'illy-shortcut-editor';
        panel.className = 'illy-panel';

        const renderRow = (b, idx) => `
            <div class="illy-erow" data-row="${idx}">
                <div class="illy-drag-handle" title="Drag to reorder"></div>
                <button class="illy-star ${b.fav ? 'active' : ''}" data-fav="${idx}" title="Toggle Favorite">★</button>
                <input type="text" readonly class="illy-in-key" data-field="key" data-idx="${idx}" value="${escapeHtml(displayKey(b.key))}" placeholder="Click" title="Click then press a key" />
                <input class="illy-in-target" data-field="target" data-idx="${idx}" value="${escapeHtml(b.target)}" placeholder="URL, #hash, or action" />
                <input class="illy-in-label" data-field="label" data-idx="${idx}" value="${escapeHtml(b.label)}" placeholder="Label (optional)" />
                <button data-test="${idx}" title="Test this shortcut now">Run</button>
                <button class="illy-danger illy-sq" data-del="${idx}" title="Remove">×</button>
            </div>
        `;

        panel.innerHTML = `
            <div id="illy-editor-header" class="illy-head">
                <div class="illy-title">Edit Shortcuts</div>
                <div class="illy-head-btns">
                    <button id="illy-editor-info" class="illy-round" title="Shortcut Guide">i</button>
                    <button id="illy-editor-close" class="illy-close" title="Close">&times;</button>
                </div>
            </div>
            <div class="illy-toolbar">
                <input type="text" id="illy-editor-search" placeholder="Search shortcuts..." style="flex:1; padding: 6px 10px;" />
                <button id="illy-editor-import">Import File</button>
                <button id="illy-editor-export">Export File</button>
                <input type="file" id="illy-file-input" accept=".json" style="display:none" />
            </div>
            <div class="illy-note">
                <b>Key</b> – click the box and press a key or combo to bind it.<br>
                <b>Target</b> – a URL, <code>#/City/Resources</code>, <code>newtab:https://...</code>, or an action (<code>upgrade</code>, <code>demolish</code>, <code>instant</code>, <code>refresh</code>, <code>back</code>, <code>forward</code>, <code>copyurl</code>).
            </div>
            <div id="illy-editor-rows" class="illy-rows"></div>
            <div class="illy-add-wrap">
                <button id="illy-editor-add">+ Add shortcut</button>
            </div>
            <div class="illy-footer">
                <button id="illy-editor-reset" class="illy-danger">Reset defaults</button>
                <button id="illy-editor-cancel">Cancel</button>
                <button id="illy-editor-save" class="illy-primary">Save &amp; Update List</button>
            </div>
        `;
        document.body.appendChild(panel);

        makeDraggable(panel, panel.querySelector('#illy-editor-header'));
        makeResizable(panel, 420, 300);

        let draft = bindings.map(b => ({ ...b }));
        let searchQuery = '';
        const rowsHost = panel.querySelector('#illy-editor-rows');
        const searchInput = panel.querySelector('#illy-editor-search');

        const redraw = () => {
            const q = searchQuery.toLowerCase();
            const filtered = draft.filter(b =>
                !q || (b.key && b.key.toLowerCase().includes(q)) ||
                (b.target && b.target.toLowerCase().includes(q)) ||
                (b.label && b.label.toLowerCase().includes(q))
            );

            rowsHost.innerHTML = filtered.map((b) => {
                const realIdx = draft.indexOf(b);
                return renderRow(b, realIdx);
            }).join('');

            rowsHost.querySelectorAll('input[data-field="key"]').forEach(inp => {
                inp.addEventListener('keydown', (e) => {
                    e.stopPropagation();
                    if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') return;

                    // Ignore if ONLY a modifier is pressed
                    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

                    e.preventDefault();

                    let combo = [];
                    if (e.ctrlKey) combo.push('Ctrl');
                    if (e.altKey) combo.push('Alt');
                    if (e.shiftKey) combo.push('Shift');
                    if (e.metaKey) combo.push('Meta');

                    let k = e.key;
                    if (k === ' ') k = 'Space';
                    else if (k.length === 1) k = k.toUpperCase();

                    combo.push(k);
                    const keyString = combo.join('+');

                    inp.value = keyString;
                    draft[Number(inp.dataset.idx)].key = keyString;
                    inp.classList.remove('il-recording');
                    inp.blur(); // Auto-save and unfocus after pressing a valid combo
                });
                inp.addEventListener('focus', () => {
                    inp.value = "Press key...";
                    inp.classList.add('il-recording');
                });
                inp.addEventListener('blur', () => {
                    inp.classList.remove('il-recording');
                    inp.value = displayKey(draft[Number(inp.dataset.idx)].key);
                });
            });

            rowsHost.querySelectorAll('button[data-fav]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = Number(btn.dataset.fav);
                    draft[idx].fav = !draft[idx].fav;
                    btn.classList.toggle('active');
                });
            });

            rowsHost.querySelectorAll('input[data-field="target"]').forEach(inp => {
                inp.addEventListener('input', () => { draft[Number(inp.dataset.idx)].target = inp.value; });
            });
            rowsHost.querySelectorAll('input[data-field="label"]').forEach(inp => {
                inp.addEventListener('input', () => { draft[Number(inp.dataset.idx)].label = inp.value; });
            });
            rowsHost.querySelectorAll('button[data-del]').forEach(btn => {
                btn.addEventListener('click', () => { draft.splice(Number(btn.dataset.del), 1); redraw(); });
            });
            rowsHost.querySelectorAll('button[data-test]').forEach(btn => {
                btn.addEventListener('click', () => runTarget(draft[Number(btn.dataset.test)].target));
            });

            // --- Drag to Reorder Logic ---
            let dragSrcIdx = null;

            rowsHost.querySelectorAll('.illy-drag-handle').forEach(handle => {
                handle.addEventListener('mousedown', (e) => {
                    if (searchQuery) return; // Disable drag if searching to prevent index jumps
                    const row = e.target.closest('.illy-erow');
                    if (!row) return;

                    dragSrcIdx = Number(row.dataset.row);
                    row.classList.add('dragging');
                });

                handle.addEventListener('mouseup', (e) => {
                    const row = e.target.closest('.illy-erow');
                    if (row) row.classList.remove('dragging');
                });

                const row = handle.closest('.illy-erow');
                row.draggable = true;

                row.addEventListener('dragstart', (e) => {
                    if (searchQuery || dragSrcIdx === null) {
                        e.preventDefault();
                        return;
                    }
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', dragSrcIdx);
                });

                row.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    return false;
                });

                row.addEventListener('dragenter', (e) => {
                    const targetRow = e.target.closest('.illy-erow');
                    if (targetRow) targetRow.style.borderTop = '2px solid #f09538';
                });

                row.addEventListener('dragleave', (e) => {
                    const targetRow = e.target.closest('.illy-erow');
                    if (targetRow) targetRow.style.borderTop = '';
                });

                row.addEventListener('drop', (e) => {
                    e.stopPropagation();
                    const targetRow = e.target.closest('.illy-erow');
                    if (targetRow) targetRow.style.borderTop = '';

                    const targetIdx = Number(targetRow.dataset.row);
                    if (dragSrcIdx !== null && dragSrcIdx !== targetIdx) {
                        // Move the item in the draft array
                        const movedItem = draft.splice(dragSrcIdx, 1)[0];
                        draft.splice(targetIdx, 0, movedItem);
                        redraw();
                    }
                    dragSrcIdx = null;
                    return false;
                });

                row.addEventListener('dragend', () => {
                    if (row) row.classList.remove('dragging');
                    dragSrcIdx = null;
                    rowsHost.querySelectorAll('.illy-erow').forEach(r => r.style.borderTop = '');
                });
            });
        };
        redraw();

        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value;
            redraw();
        });

        panel.querySelector('#illy-editor-info').onclick = showInfo;
        panel.querySelector('#illy-editor-close').onclick = closeEditor;
        panel.querySelector('#illy-editor-cancel').onclick = closeEditor;

        panel.querySelector('#illy-editor-add').onclick = () => {
            draft.push({ key: '', target: '', label: '', fav: false });
            searchQuery = '';
            searchInput.value = '';
            redraw();
            const inputs = rowsHost.querySelectorAll('input[data-field="target"]');
            const last = inputs[inputs.length - 1];
            if (last) { last.focus(); rowsHost.scrollTop = rowsHost.scrollHeight; }
        };

        panel.querySelector('#illy-editor-reset').onclick = () => {
            const backup = draft.map(b => ({ ...b }));
            draft = DEFAULT_BINDINGS.map(b => ({ ...b, fav: false }));
            searchQuery = '';
            searchInput.value = '';
            redraw();
            showToast('Reset to defaults.', 5000, () => {
                draft = backup;
                redraw();
                showToast('Reset undone!');
            });
        };

        const fileInput = panel.querySelector('#illy-file-input');

        panel.querySelector('#illy-editor-export').onclick = () => {
            const data = JSON.stringify(draft, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `illyriad-shortcuts-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Exported file download started.');
        };

        panel.querySelector('#illy-editor-import').onclick = () => {
            fileInput.click();
        };

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    if (Array.isArray(parsed)) {
                        draft = parsed.map(r => ({ key: r.key || '', target: r.target || '', label: r.label || '', fav: !!r.fav }));
                        searchQuery = '';
                        searchInput.value = '';
                        redraw();
                        showToast('Shortcuts imported! Click Save to apply.');
                    } else {
                        showToast('Invalid file format.');
                    }
                } catch (_) {
                    showToast('Invalid JSON file.');
                }
            };
            reader.readAsText(file);
            fileInput.value = '';
        });

        panel.querySelector('#illy-editor-save').onclick = () => {
            const cleaned = draft
                .map(b => ({
                    key: (b.key || '').trim(),
                    target: (b.target || '').trim(),
                    label: (b.label || '').trim(),
                    fav: !!b.fav
                }))
                .filter(b => b.key && b.target);

            const seen = {}, dups = [];
            for (const b of cleaned) {
                const nk = normalizeKey(b.key);
                if (seen[nk]) dups.push(b.key);
                seen[nk] = true;
            }
            if (dups.length) {
                showToast('Duplicate keys: ' + dups.join(', ') + ' (last wins)');
                console.warn('[Illyriad Shortcuts] Duplicate bindings:', dups);
            }

            bindings = cleaned;
            keyMapCache = null;
            saveBindings(bindings);

            closeEditor();
            showToast('Shortcuts saved!');
            setTimeout(showHelp, 300);
        };

        editorEscHandler = (e) => { if (e.key === 'Escape') closeEditor(); };
        document.addEventListener('keydown', editorEscHandler, true);
    }

    // ---------- Visible Help Button ----------
    function addHelpButton() {
        if (document.getElementById('illy-shortcut-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'illy-shortcut-btn';
        btn.textContent = '` ?';
        btn.title = 'Toggle Shortcuts Help (Hotkey: `)';
        btn.onclick = showHelp;
        document.body.appendChild(btn);
    }

    // ---------- Key Handler (single listener) ----------
    function keyHandler(e) {
        if (isTyping()) return;

        if (e.code === 'Backquote') {
            e.preventDefault();
            e.stopPropagation();
            showHelp();
            return;
        }

        // Build the combo string to match against bindings
        let combo = [];
        if (e.ctrlKey) combo.push('Ctrl');
        if (e.altKey) combo.push('Alt');
        if (e.shiftKey) combo.push('Shift');
        if (e.metaKey) combo.push('Meta');

        // We do NOT add the actual key if it is just a modifier itself
        if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
            let k = e.key;
            if (k === ' ') k = 'Space';
            else if (k.length === 1) k = k.toUpperCase();
            combo.push(k);
        } else {
            // If they only pressed a modifier, don't run anything
            return;
        }

        const pressedString = combo.join('+');
        const nk = normalizeKey(pressedString);

        const target = buildKeyMap()[nk];
        if (!target) return;

        e.preventDefault();
        e.stopPropagation();
        runTarget(target);
    }

    window.addEventListener('keydown', keyHandler, true);

    addHelpButton();
    new MutationObserver(addHelpButton).observe(document.body, { childList: true, subtree: true });

})();