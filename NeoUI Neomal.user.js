// ==UserScript==
// @name         NeoUI Neomail
// @namespace    http://tampermonkey.net/
// @version      0.6.4
// @description  Mobile-friendly Neomail overhaul: single-pane SPA layout, local thread archive, native reply/delete, and mail counters.
// @author       ext1nct
// @match        *://*.neopets.com/neomessages.phtml*
// @require      https://your-host-or-cdn/neoui-core.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    try { run(); } catch (err) { showFatalError(err); }

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Neomail crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) { }
    }

    function run() {
        if (!window.NeoUI || !window.NeoUI.__ready) { throw new Error('NeoGo (window.NeoUI) was not found.'); }
        const NeoUI = window.NeoUI;

        const NEOMAIL_CSS = `
            .premium_bar_spacer, #premium_bar, .nav-premium-container, #premium-bar,
            .premium-toolbar, #superfooter, #footer_menu, .sswdrop, .featureddrop,
            .dailiesdrop, .snapshotdrop {
                display: none !important;
            }

            .nui-spa-active #main, .nui-spa-active #ban, .nui-spa-active #header,
            .nui-spa-active #footer, .nui-spa-active form[name="messages"], .nui-spa-active td.sidebar {
                display: none !important;
            }

            .nui-spa-active, .nui-spa-active body {
                margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important;
                background: var(--nui-bg) !important;
            }

            .legacy-read-fallback { white-space: pre-wrap !important; }

            #neomail-app {
                position: fixed; top: var(--nui-header-total); left: 0; right: 0; bottom: 0;
                display: flex; flex-direction: row; width: 100vw; background: var(--nui-surface);
                box-shadow: 0 -4px 20px var(--nui-shadow); overflow: hidden;
            }

            .neomail-pane { flex: 0 0 100vw; width: 100vw; background: var(--nui-surface); display: flex; flex-direction: column; transition: transform var(--nui-dur-base) var(--nui-ease); }
            .neomail-viewer { flex: 0 0 100vw; width: 100vw; position: absolute; left: 100vw; top: 0; height: 100%; display: flex; flex-direction: column; background: var(--nui-bg); transition: transform var(--nui-dur-base) var(--nui-ease); overflow: hidden; }
            #neomail-viewer-content { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

            #neomail-app.thread-open .neomail-pane { transform: translateX(-100vw); }
            #neomail-app.thread-open .neomail-viewer { transform: translateX(-100vw); }

            .neomail-sidebar-header { padding: var(--nui-space-3) var(--nui-space-4); border-bottom: 1px solid var(--nui-border); background: var(--nui-surface); }
            .neomail-message-list { flex: 1; overflow-y: auto; padding-bottom: 30px; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }
            .neomail-thread-list { padding: var(--nui-space-4); flex: 1; display: flex; flex-direction: column; gap: var(--nui-space-4); overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }

            .neomail-message-list::-webkit-scrollbar, .neomail-thread-list::-webkit-scrollbar { width: 6px; }
            .neomail-message-list::-webkit-scrollbar-track, .neomail-thread-list::-webkit-scrollbar-track { background: transparent; }
            .neomail-message-list::-webkit-scrollbar-thumb, .neomail-thread-list::-webkit-scrollbar-thumb { background: var(--nui-border); border-radius: var(--nui-radius-pill); }

            .neomail-viewer-header { padding: var(--nui-space-4); background: var(--nui-surface); box-shadow: 0 2px 4px var(--nui-shadow); z-index: 10; }
            .neomail-back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: var(--nui-accent-2); font-weight: 600; font-size: 16px; padding: 0 0 12px 0; cursor: pointer; }
            .neomail-viewer-subject { font-size: 20px; font-weight: 800; color: var(--nui-text); margin: 0 0 4px 0; word-wrap: break-word; line-height: 1.2; }
            .neomail-viewer-meta { font-size: 14px; font-weight: 500; color: var(--nui-text-muted); }

            .neomail-reply-box {
                padding: var(--nui-space-4) var(--nui-space-4) 48px var(--nui-space-4);
                background: var(--nui-surface);
                border-top: 1px solid var(--nui-border);
                display: flex; flex-direction: column;
                gap: var(--nui-space-3); align-items: center;
            }

            .nui-user-link {
                color: inherit;
                font: inherit;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: color var(--nui-dur-fast) var(--nui-ease), border-color var(--nui-dur-fast) var(--nui-ease);
            }
            .nui-user-link:hover, .nui-user-link:focus-visible {
                color: var(--nui-accent);
                border-bottom-color: var(--nui-accent);
            }
            .nui-user-link:active { opacity: 0.7; }
        `;

        const styleEl = document.createElement('style'); styleEl.id = 'neomail-app-style'; styleEl.textContent = NEOMAIL_CSS; document.head.appendChild(styleEl);

        function getUsername() {
            const userLink = document.querySelector('.user a[href^="/userlookup.phtml?user="]');
            return userLink ? userLink.textContent.trim() : 'Neopian';
        }

        function getPetInfo() {
            const petImg = document.querySelector('.activePet img');
            const petName = document.querySelector('.sidebarHeader a b');
            return {
                name: petName ? petName.textContent.trim() : 'Unknown Pet',
                image: petImg ? petImg.src : 'https://images.neopets.com/themes/h5/basic/images/mystery-icon.png'
            };
        }

        function getStats() { const npEl = document.getElementById('npanchor'); const ncEl = document.getElementById('ncanchor'); return { np: npEl ? npEl.textContent.trim() : '0', nc: ncEl ? ncEl.textContent.trim() : '0' }; }

        NeoUI.init();
        NeoUI.setProfileInfo({
            username: getUsername(),
            petname: getPetInfo().name,
            petImage: getPetInfo().image,
            np: getStats().np,
            nc: getStats().nc
        });

        const ARCHIVE_KEY = 'nm_local_archive_v4';
        const AVATAR_KEY = 'nm_avatar_map_v3';

        function getAvatarMap() { try { return JSON.parse(localStorage.getItem(AVATAR_KEY) || '{}'); } catch (e) { return {}; } }
        function rememberAvatar(sender, avatarUrl) { try { const map = getAvatarMap(); if (map[sender] !== avatarUrl) { map[sender] = avatarUrl; localStorage.setItem(AVATAR_KEY, JSON.stringify(map)); } } catch (e) {} }
        function getAvatar(sender) { return getAvatarMap()[sender] || null; }
        function getLocalArchive() { try { return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]'); } catch (e) { return []; } }
        function saveLocalArchive(archiveArray) { if (archiveArray.length > 2000) archiveArray = archiveArray.slice(-2000); try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archiveArray)); } catch (e) {} }

        function updateMailStats() {
            const statsEl = document.getElementById('neomail-stats');
            if (!statsEl) return;
            const stats = getStats();
            const archive = getLocalArchive();
            const onsiteCount = archive.filter(m => m.isOnServer).length;
            const archivedCount = archive.filter(m => !m.isOnServer).length;
            statsEl.innerHTML = `NP: <b>${stats.np}</b> &nbsp; NC: <b>${stats.nc}</b> &nbsp;|&nbsp; Onsite: <b>${onsiteCount}</b> &nbsp; Archived: <b>${archivedCount}</b>`;
        }

        function addSentMessageToArchive(recipient, subject, bodyText) {
            const archive = getLocalArchive();
            const baseSubject = subject.replace(/^(Re:\s*)+/i, '').trim();
            const now = new Date(); const min = now.getMinutes().toString().padStart(2, '0'); const ampm = now.getHours() >= 12 ? 'pm' : 'am'; let hour = now.getHours() % 12 || 12;
            const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${hour}:${min}${ampm}`;
            archive.push({ id: 'sent_' + Date.now(), sender: getUsername(), recipient: recipient, rawSubject: subject, baseSubject: baseSubject, date: dateStr, body: bodyText, isRead: true, isSent: true, isOnServer: false, timestamp: Date.now() });
            saveLocalArchive(archive);
        }

        function parseNeoDate(dateStr) {
            try {
                const parts = dateStr.split(' '); const dateParts = parts[0].split('/'); const timeStr = parts[1];
                const day = parseInt(dateParts[0], 10); const month = parseInt(dateParts[1], 10) - 1; const year = parseInt(dateParts[2], 10);
                let hour = parseInt(timeStr.replace(/[^0-9]/g, ''), 10); if (timeStr.includes(':')) hour = parseInt(timeStr.split(':')[0], 10);
                const min = parseInt(timeStr.split(':')[1].replace(/[^0-9]/g, ''), 10);
                if (timeStr.toLowerCase().includes('pm') && hour !== 12) hour += 12;
                if (timeStr.toLowerCase().includes('am') && hour === 12) hour = 0;
                return new Date(year, month, day, hour, min).getTime();
            } catch (e) { return 0; }
        }

        function hexToRgba(hex, alpha) {
            const clean = hex.replace('#', '');
            const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
            const r = parseInt(full.substr(0, 2), 16);
            const g = parseInt(full.substr(2, 2), 16);
            const b = parseInt(full.substr(4, 2), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        function applyVibeTint(bubbleEl, username) {
            if (!window.VibeRater || typeof window.VibeRater.getVibe !== 'function' || !username) return;
            const key = username.toLowerCase().trim();
            bubbleEl.dataset.vibeUser = key;
            const vibe = window.VibeRater.getVibe(key);
            if (vibe && vibe.color) {
                bubbleEl.style.borderLeft = `3px solid ${vibe.color}`;
                bubbleEl.style.background = hexToRgba(vibe.color, 0.12);
            } else {
                bubbleEl.style.borderLeft = '';
                bubbleEl.style.background = '';
            }
        }

        if (window.VibeRater && typeof window.VibeRater.onChange === 'function') {
            window.VibeRater.onChange(function (username) {
                const key = String(username).toLowerCase().trim();
                document.querySelectorAll(`.nui-bubble[data-vibe-user="${CSS.escape(key)}"]`).forEach(function (el) {
                    applyVibeTint(el, key);
                });
            });
        }

        function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

        function userLink(name, extraClass) {
            const safeName = escapeHTML(name);
            const cls = 'nui-user-link' + (extraClass ? ' ' + extraClass : '');
            return `<a href="/userlookup.phtml?user=${encodeURIComponent(name)}" class="${cls}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${safeName}</a>`;
        }

        function renderComposeView() {
            const viewerContent = document.getElementById('neomail-viewer-content');
            if (!viewerContent) return;

            document.getElementById('neomail-viewer-empty').style.display = 'none';
            viewerContent.style.display = 'flex';

            const app = document.getElementById('neomail-app');
            if (app) app.classList.add('thread-open');

            viewerContent.innerHTML = `
                <div class="neomail-viewer-header">
                    <button type="button" class="neomail-back-btn" id="neomail-back-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>Back
                    </button>
                    <div class="neomail-viewer-subject">Compose New Message</div>
                </div>
                <div style="padding: var(--nui-space-5); overflow-y: auto; flex: 1; background: var(--nui-bg);">
                    <form id="neomail-compose-form" style="display: flex; flex-direction: column; gap: var(--nui-space-4); max-width: 600px; margin: 0 auto; background: var(--nui-surface); padding: var(--nui-space-5); border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); box-shadow: 0 4px 12px var(--nui-shadow);">

                        <div>
                            <label style="font-size: 13px; font-weight: 800; color: var(--nui-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">To:</label>
                            <input type="text" name="recipient" class="nui-input" placeholder="Neopets Username" required maxlength="20">
                        </div>

                        <div>
                            <label style="font-size: 13px; font-weight: 800; color: var(--nui-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Subject:</label>
                            <input type="text" name="subject" class="nui-input" placeholder="What's this about?" maxlength="30">
                        </div>

                        <div>
                            <label style="font-size: 13px; font-weight: 800; color: var(--nui-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Message:</label>
                            <textarea name="message_body" rows="6" class="nui-textarea" placeholder="Write your message here..." required></textarea>
                        </div>

                        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 14px; margin-top: 8px;">
                            <span id="compose-status-text" style="font-size: 13.5px; font-weight: 700;"></span>
                            <button type="submit" class="nui-btn nui-btn-primary">Send NeoMail</button>
                        </div>
                    </form>
                </div>
            `;

            viewerContent.querySelector('#neomail-back-btn').addEventListener('click', () => {
                if (app) app.classList.remove('thread-open');
            });

            const form = viewerContent.querySelector('#neomail-compose-form');
            const statusText = viewerContent.querySelector('#compose-status-text');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                const recipientInput = form.querySelector('input[name="recipient"]');
                const subjectInput = form.querySelector('input[name="subject"]');
                const bodyInput = form.querySelector('textarea[name="message_body"]');

                if (recipientInput.value.includes("'")) {
                    statusText.style.color = 'var(--nui-danger)';
                    statusText.textContent = "Username cannot contain apostrophes.";
                    return;
                }

                submitBtn.disabled = true;
                statusText.style.color = 'var(--nui-text-muted)';
                statusText.textContent = 'Sending...';

                const recipient = recipientInput.value.trim();
                const subject = subjectInput.value.trim() || 'No Subject';
                const bodyText = bodyInput.value;

                const payload = new URLSearchParams();
                payload.append('recipient', recipient);
                payload.append('subject', subject);
                payload.append('message_body', bodyText);

                try {
                    const postRes = await fetch('/process_neomessages.phtml', {
                        method: 'POST',
                        body: payload,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    });

                    if (postRes.ok) {
                        statusText.style.color = 'var(--nui-success)';
                        statusText.textContent = 'Sent successfully!';

                        addSentMessageToArchive(recipient, subject, bodyText);
                        allThreads = syncAndProcessThreads([]);
                        updateMailStats();

                        recipientInput.value = '';
                        subjectInput.value = '';
                        bodyInput.value = '';

                        setTimeout(() => {
                            if (app) app.classList.remove('thread-open');
                            const activeTab = document.querySelector('.nui-pill.is-active');
                            if (activeTab) renderSidebarList(activeTab.getAttribute('data-tab'));
                        }, 1200);

                    } else {
                        throw new Error('Server error');
                    }
                } catch (err) {
                    statusText.style.color = 'var(--nui-danger)';
                    statusText.textContent = 'Failed to send.';
                    submitBtn.disabled = false;
                }
            });
        }

        function injectTopbar() {
            const headerWrapper = document.createElement('div');
            headerWrapper.className = 'nui-header-wrapper nui-reset';
            headerWrapper.innerHTML = `
                <div class="nui-topbar" style="position: relative;">
                    <div style="display:flex; align-items:center; gap:10px; z-index:2;" id="neomail-neogo-slot"></div>

                    <div class="nui-topbar-title" style="position: absolute; left: 50%; transform: translateX(-50%); z-index: 1;">
                        <a href="/home/index.phtml" style="
                            display: block;
                            width: 140px; height: 38px;
                            background-color: var(--nui-accent);
                            -webkit-mask: url('https://images.neopets.com/brandhub/5ccf2080/images/Header_25Logo_new.svg') no-repeat center / contain;
                            mask: url('https://images.neopets.com/brandhub/5ccf2080/images/Header_25Logo_new.svg') no-repeat center / contain;
                            filter: drop-shadow(0 2px 4px var(--nui-shadow));
                        "></a>
                    </div>

                    <div class="nui-topbar-stats" id="neomail-stats" style="z-index:2;">NP: <b>0</b> &nbsp; NC: <b>0</b></div>
                </div>
                <div class="nui-hnav">
                    <a class="nui-pill is-active" data-tab="inbox">Inbox</a>
                    <a class="nui-pill" data-tab="sent">Sent</a>
                    <a class="nui-pill" data-tab="archive">Archive</a>

                    <div style="flex: 1;"></div>

                    <a class="nui-pill" style="background: var(--nui-accent); color: var(--nui-accent-ink); border: none; cursor: pointer;" id="neomail-compose-btn">
                        <span style="font-size: 16px; font-weight: 800; line-height: 1; vertical-align: middle; margin-right: 4px;">+</span>Compose
                    </a>
                </div>
            `;

            document.body.insertBefore(headerWrapper, document.body.firstChild);
            headerWrapper.querySelector('#neomail-neogo-slot').appendChild(NeoUI.neoGoButton());
            updateMailStats();

            headerWrapper.querySelectorAll('.nui-hnav .nui-pill').forEach(function (pill) {
                pill.addEventListener('click', function () {
                    if (pill.id === 'neomail-compose-btn') return;
                    headerWrapper.querySelectorAll('.nui-hnav .nui-pill').forEach(function (p) { p.classList.remove('is-active'); });
                    pill.classList.add('is-active'); renderSidebarList(pill.getAttribute('data-tab'));
                });
            });

            const composeBtn = headerWrapper.querySelector('#neomail-compose-btn');
            if (composeBtn) {
                composeBtn.addEventListener('click', renderComposeView);
            }
        }

        let allThreads = [];
        const urlParams = new URLSearchParams(window.location.search);

        injectTopbar();
        initApp();

        async function initApp() {
            document.documentElement.classList.add('nui-spa-active');
            NeoUI.registerSettingsSection({
                id: 'neomail_data',
                title: 'Data Management',
                render: function (container) {
                    container.innerHTML = `
                        <div class="nui-drawer-section-title" style="background:transparent; padding:0; margin-top:20px;">Neomail Storage</div>
                        <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
                            <div style="font-size: 13px; color: var(--nui-text-muted);">Manage your local message archive and avatar cache.</div>
                            <button type="button" class="nui-btn nui-btn-warning nui-btn-block" id="nui-clear-archive">Clear Local Archive</button>
                            <button type="button" class="nui-btn nui-btn-danger nui-btn-block" id="nui-clear-avatars">Clear Avatar Cache</button>
                            <span id="nui-settings-status" style="font-size: 13px; font-weight: 600; text-align: center; display: block; margin-top: 4px;"></span>
                        </div>
                    `;

                    container.querySelector('#nui-clear-archive').addEventListener('click', function() {
                        localStorage.removeItem(ARCHIVE_KEY);
                        updateMailStats();
                        const status = container.querySelector('#nui-settings-status');
                        status.style.color = 'var(--nui-warning)';
                        status.textContent = 'Archive cleared! Refresh page to resync.';
                        setTimeout(() => status.textContent = '', 4000);
                    });

                    container.querySelector('#nui-clear-avatars').addEventListener('click', function() {
                        localStorage.removeItem(AVATAR_KEY);
                        const status = container.querySelector('#nui-settings-status');
                        status.style.color = 'var(--nui-success)';
                        status.textContent = 'Avatar cache cleared!';
                        setTimeout(() => status.textContent = '', 4000);
                    });
                }
            });

            const container = document.createElement('div');
            container.id = 'neomail-app'; container.className = 'nui-reset';

            const sidebar = document.createElement('div'); sidebar.className = 'neomail-pane';
            sidebar.innerHTML = `<div class="neomail-message-list" id="neomail-message-list"><div class="nui-empty"><span class="nui-text-muted">Loading inbox...</span></div></div>`;

            const viewer = document.createElement('div'); viewer.className = 'neomail-viewer';
            viewer.innerHTML = `
                <div class="nui-empty" id="neomail-viewer-empty"><span class="nui-empty-emoji">📭</span>Select a conversation.</div>
                <div id="neomail-viewer-content" style="display:none;"></div>
            `;

            container.appendChild(sidebar); container.appendChild(viewer); document.body.appendChild(container);

            if (urlParams.get('type') === 'send') {
                renderComposeView();

                const targetRecipient = urlParams.get('recipient');
                if (targetRecipient) {
                    const recipientInput = document.querySelector('#neomail-compose-form input[name="recipient"]');
                    if (recipientInput) recipientInput.value = targetRecipient;
                }
            }

            let liveMessages = [];
            let start = 0;
            let hasMore = true;
            const originalForm = document.querySelector('form[name="messages"]');
            const seenIds = new Set();

            const syncStatus = document.createElement('div');
            syncStatus.style.cssText = 'position:fixed; bottom:20px; right:20px; background:var(--nui-accent); color:var(--nui-accent-ink); padding:10px 16px; border-radius:var(--nui-radius-pill); z-index:999999; font-weight:bold; box-shadow:0 4px 12px var(--nui-shadow); transition:opacity 0.3s; font-family:var(--nui-font-body); font-size:13px;';
            syncStatus.textContent = 'Syncing Inbox...';
            document.body.appendChild(syncStatus);

            while (hasMore) {
                try {
                    let doc = document;

                    if (start > 0 || !originalForm) {
                        if (start > 0) await new Promise(r => setTimeout(r, 400));
                        const res = await fetch(`/neomessages.phtml?folder=Inbox&lower=${start}`);
                        const htmlText = await res.text();
                        doc = new DOMParser().parseFromString(htmlText, 'text/html');
                    }

                    const fetchedForm = doc.querySelector('form[name="messages"]');

                    if (fetchedForm) {
                        const pageMsgs = scrapeInboxData(fetchedForm);
                        const newMsgs = pageMsgs.filter(msg => !seenIds.has(msg.id));

                        if (newMsgs.length > 0) {
                            newMsgs.forEach(msg => seenIds.add(msg.id));
                            liveMessages.push(...newMsgs);
                            syncStatus.textContent = `Syncing Inbox... (${liveMessages.length})`;

                            if (pageMsgs.length >= 20) {
                                start += 20;
                            } else {
                                hasMore = false;
                            }
                        } else {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false;
                    }
                } catch (e) {
                    console.error("Neomail UI: Failed to fetch inbox page", e);
                    hasMore = false;
                }
            }

            syncStatus.style.opacity = '0';
            setTimeout(() => syncStatus.remove(), 300);

            allThreads = syncAndProcessThreads(liveMessages);
            updateMailStats();
            renderSidebarList('inbox');

            const targetId = urlParams.get('id');
            if (targetId) {
                const targetThread = allThreads.find(t => t.messages.some(m => m.id === targetId));
                if (targetThread) {
                    targetThread.isRead = true;
                    document.getElementById('neomail-viewer-empty').style.display = 'none';
                    const viewerContent = document.getElementById('neomail-viewer-content');
                    viewerContent.style.display = 'flex';
                    container.classList.add('thread-open');

                    document.querySelectorAll('.nui-item').forEach(item => {
                        const titleEl = item.querySelector('.nui-item-title');
                        if (titleEl && titleEl.textContent === targetThread.sender) {
                            item.classList.add('is-active');
                            item.classList.remove('is-unread');
                        }
                    });

                    loadThreadIntoViewer(targetThread, viewerContent);
                }
            }
        }

        function scrapeInboxData(formElement) {
            const rows = formElement.querySelectorAll('table tr'); const data = [];
            for (let i = 1; i < rows.length - 1; i++) {
                const cols = rows[i].querySelectorAll('td'); if (cols.length < 5) continue;
                const idInput = cols[0].querySelector('input'); const id = idInput ? idInput.value : null;
                const dateText = cols[1].textContent.trim();
                let sender = 'Unknown'; const senderTag = cols[2].querySelector('a b'); if (senderTag) sender = senderTag.textContent.trim();
                let avatarUrl = null; const avatarImg = cols[2].querySelector('img');
                if (avatarImg && avatarImg.getAttribute('src')) {
                    avatarUrl = avatarImg.getAttribute('src');
                    if (avatarUrl.startsWith('//')) avatarUrl = 'https:' + avatarUrl; else if (avatarUrl.startsWith('/')) avatarUrl = 'https://images.neopets.com' + avatarUrl;
                }
                if (avatarUrl && sender !== 'Unknown') rememberAvatar(sender, avatarUrl);
                const subjectLink = cols[3].querySelector('a'); const rawSubject = subjectLink ? subjectLink.textContent.trim() : 'No Subject';
                const url = subjectLink ? subjectLink.href : ''; const statusText = cols[4].textContent.trim();
                const isRead = statusText.toLowerCase() === 'read' || statusText.toLowerCase() === 'replied';
                if (id && url) {
                    const baseSubject = rawSubject.replace(/^(Re:\s*)+/i, '').trim();
                    data.push({ id, date: dateText, sender, rawSubject, baseSubject, url, isRead, isSent: false, isOnServer: true, timestamp: parseNeoDate(dateText) });
                }
            }
            return data;
        }

        function syncAndProcessThreads(liveMessages) {
            const archive = getLocalArchive();
            liveMessages.forEach(liveMsg => {
                const existingMsg = archive.find(m => m.id === liveMsg.id);
                if (!existingMsg) archive.push(liveMsg); else { existingMsg.isOnServer = true; existingMsg.isRead = liveMsg.isRead; }
            });
            saveLocalArchive(archive);
            const threadMap = {};
            archive.forEach(msg => {
                const targetUser = msg.isSent ? msg.recipient : msg.sender;
                const threadKey = `${targetUser}::${msg.baseSubject}`;
                if (!threadMap[threadKey]) { threadMap[threadKey] = { key: threadKey, sender: targetUser, baseSubject: msg.baseSubject, isRead: true, latestDate: msg.timestamp, isFullyLocal: true, messages: [] }; }
                threadMap[threadKey].messages.push(msg);
                if (!msg.isRead) threadMap[threadKey].isRead = false;
                if (msg.isOnServer) threadMap[threadKey].isFullyLocal = false;
                if (msg.timestamp > threadMap[threadKey].latestDate) { threadMap[threadKey].latestDate = msg.timestamp; threadMap[threadKey].latestDateStr = msg.date; }
            });
            Object.values(threadMap).forEach(thread => {
                thread.messages.sort((a, b) => a.timestamp - b.timestamp);
                if (!thread.latestDateStr && thread.messages.length > 0) { thread.latestDateStr = thread.messages[thread.messages.length - 1].date; }
            });
            const threadArray = Object.values(threadMap); threadArray.sort((a, b) => b.latestDate - a.latestDate);
            return threadArray;
        }

        function filterThreadsForTab(tab) {
            if (tab === 'sent') return allThreads.filter(t => t.messages.some(m => m.isSent));
            if (tab === 'archive') return allThreads.filter(t => t.isFullyLocal);
            return allThreads;
        }

        function renderSidebarList(tab) {
            const listContainer = document.getElementById('neomail-message-list'); listContainer.innerHTML = '';
            const filteredThreads = filterThreadsForTab(tab);
            if (filteredThreads.length === 0) { listContainer.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">📭</span>No conversations found.</div>`; return; }

            filteredThreads.forEach(thread => {
                const item = document.createElement('div'); item.className = `nui-item nui-reset ${thread.isRead ? '' : 'is-unread'}`;
                let badges = '';
                if (thread.isFullyLocal) badges += `<span class="nui-badge nui-badge-warning">Local Archive</span> `;
                if (thread.messages.length > 1) badges += `<span class="nui-badge">${thread.messages.length} msgs</span>`;

                const avatarUrl = getAvatar(thread.sender);
                const avatarHTML = avatarUrl ? `<img class="nui-avatar" data-sender="${escapeHTML(thread.sender)}" src="${avatarUrl}" alt="" loading="lazy">` : `<div class="nui-avatar-fallback" data-sender="${escapeHTML(thread.sender)}">${escapeHTML(thread.sender.charAt(0).toUpperCase())}</div>`;

                item.innerHTML = `
                    <div class="nui-avatar-wrapper">${avatarHTML}<div class="nui-dot"></div></div>
                    <div class="nui-item-main">
                        <div class="nui-item-top"><span class="nui-item-title">${userLink(thread.sender)}</span><span class="nui-item-meta">${thread.latestDateStr}</span></div>
                        <div class="nui-item-bottom"><span class="nui-item-subtitle">${thread.baseSubject}</span><div>${badges}</div></div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    document.querySelectorAll('.nui-item').forEach(i => i.classList.remove('is-active'));
                    item.classList.add('is-active'); item.classList.remove('is-unread'); thread.isRead = true;
                    document.getElementById('neomail-viewer-empty').style.display = 'none';
                    const viewerContent = document.getElementById('neomail-viewer-content'); viewerContent.style.display = 'flex';
                    const app = document.getElementById('neomail-app'); if (app) app.classList.add('thread-open');
                    loadThreadIntoViewer(thread, viewerContent);
                });
                listContainer.appendChild(item);
            });
        }

        function createMessageNode(msg) {
            const msgNode = document.createElement('div'); msgNode.className = `nui-bubble nui-reset ${msg.isSent ? 'is-mine' : 'is-theirs'}`;
            if (!msg.isSent) applyVibeTint(msgNode, msg.sender);
            let bodyHTML = msg.body; if (msg.isSent) { bodyHTML = msg.isScrapedHTML ? `<div>${msg.body}</div>` : `<div>${escapeHTML(msg.body)}</div>`; }
            const displayName = msg.isSent ? getUsername() : msg.sender;
            const avatarUrl = msg.isSent ? getAvatar(getUsername()) : getAvatar(msg.sender);
            const avatarHTML = avatarUrl ? `<img class="nui-avatar" style="width:24px;height:24px;" data-sender="${escapeHTML(displayName)}" src="${avatarUrl}" alt="" loading="lazy">` : `<div class="nui-avatar-fallback" style="width:24px;height:24px;font-size:12px;" data-sender="${escapeHTML(displayName)}">${escapeHTML(displayName.charAt(0).toUpperCase())}</div>`;
            msgNode.innerHTML = `
                <div class="nui-bubble-header"><span class="nui-bubble-who">${avatarHTML}<span>${userLink(displayName)}</span></span><span>${msg.date}</span></div>
                <div class="nui-bubble-body">${(msg.isSent || msg.body) ? bodyHTML : '<span class="nui-text-muted" style="font-style:italic;">Loading...</span>'}</div>
            `;
            return msgNode;
        }

        async function loadThreadIntoViewer(thread, container) {
            container.innerHTML = `
                <div class="neomail-viewer-header">
                    <button type="button" class="neomail-back-btn" id="neomail-back-btn"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>Back</button>
                    <div class="neomail-viewer-subject">${thread.baseSubject}</div>
                    <div class="neomail-viewer-meta">Thread with ${userLink(thread.sender)}</div>
                </div>
                <div class="neomail-thread-list" id="neomail-thread-list"></div>
                <div id="neomail-reply-container"></div>
            `;

            const backBtn = container.querySelector('#neomail-back-btn');
            if (backBtn) { backBtn.addEventListener('click', () => { const app = document.getElementById('neomail-app'); if (app) app.classList.remove('thread-open'); }); }

            const listEl = container.querySelector('#neomail-thread-list');
            const renderedSentTexts = new Set();
            let archiveModified = false;

            for (const msg of thread.messages) {
                if (msg.isSent) {
                    listEl.appendChild(createMessageNode(msg));
                    if (msg.body) renderedSentTexts.add(msg.body.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
                } else {
                    if (msg.body) { listEl.appendChild(createMessageNode(msg)); continue; }

                    const msgNode = document.createElement('div'); msgNode.className = 'nui-bubble is-theirs';
                    applyVibeTint(msgNode, msg.sender);
                    msgNode.innerHTML = `<div class="nui-bubble-body"><span class="nui-text-muted" style="font-style:italic;">Fetching from Neopets...</span></div>`;
                    listEl.appendChild(msgNode);

                    try {
                        const response = await fetch(msg.url); const htmlText = await response.text();
                        const doc = new DOMParser().parseFromString(htmlText, 'text/html');

                        const avatarImg = doc.querySelector('img[src*="/avatars/"]');
                        if (avatarImg) {
                            let aSrc = avatarImg.getAttribute('src');
                            if (aSrc.startsWith('//')) aSrc = 'https:' + aSrc; else if (aSrc.startsWith('/')) aSrc = 'https://images.neopets.com' + aSrc;
                            rememberAvatar(msg.sender, aSrc);
                            document.querySelectorAll(`[data-sender="${escapeHTML(msg.sender)}"]`).forEach(el => {
                                if (!el.classList.contains('nui-avatar')) {
                                    const img = document.createElement('img'); img.className = 'nui-avatar';
                                    if (el.style.width) img.style.cssText = el.style.cssText;
                                    img.setAttribute('data-sender', escapeHTML(msg.sender)); img.src = aSrc; el.replaceWith(img);
                                } else { el.src = aSrc; }
                            });
                        }

                        const youWroteLabel = Array.from(doc.querySelectorAll('td b')).find(b => b.textContent.includes('You wrote:'));
                        if (youWroteLabel) {
                            const quoteTd = youWroteLabel.closest('tr').querySelectorAll('td')[1];
                            if (quoteTd) {
                                let quoteTextForDedup = quoteTd.textContent.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                if (!renderedSentTexts.has(quoteTextForDedup)) {
                                    let quoteHTML = quoteTd.innerHTML.trim().replace(/^/, '').replace(/^<em>/i, '').replace(/<\/em>$/i, '').trim();

                                    const sentMsgObj = {
                                        id: 'scraped_sent_' + msg.id,
                                        sender: getUsername(),
                                        recipient: msg.sender,
                                        rawSubject: msg.rawSubject,
                                        baseSubject: msg.baseSubject,
                                        date: 'Previous Message',
                                        body: quoteHTML,
                                        isRead: true,
                                        isSent: true,
                                        isOnServer: false,
                                        isScrapedHTML: true,
                                        timestamp: msg.timestamp - 1000
                                    };

                                    const sentNode = createMessageNode(sentMsgObj);
                                    listEl.insertBefore(sentNode, msgNode);
                                    renderedSentTexts.add(quoteTextForDedup);

                                    const archive = getLocalArchive();
                                    if (!archive.find(a => a.id === sentMsgObj.id)) {
                                        archive.push(sentMsgObj);
                                        saveLocalArchive(archive);
                                        thread.messages.push(sentMsgObj);
                                        thread.messages.sort((a, b) => a.timestamp - b.timestamp);
                                    }
                                }
                            }
                        }

                        let rawHTML = '';
                        const tdElements = doc.querySelectorAll('td[bgcolor="#FFFFFF"][valign="top"]');
                        if (tdElements.length > 0) {
                            const targetTd = tdElements[tdElements.length - 1];
                            const reportDiv = targetTd.querySelector('div.sf'); if (reportDiv) reportDiv.remove();
                            rawHTML = targetTd.innerHTML.trim();
                        } else {
                            const mainContent = doc.querySelector('td.content table[style*="border: 1px solid"]');
                            if (mainContent) rawHTML = mainContent.innerHTML;
                        }

                        const formattedBody = /<table/i.test(rawHTML) ? rawHTML : `<div>${rawHTML}</div>`;
                        const finalAvatarUrl = getAvatar(msg.sender);
                        const avatarHTML = finalAvatarUrl ? `<img class="nui-avatar" style="width:24px;height:24px;" data-sender="${escapeHTML(msg.sender)}" src="${finalAvatarUrl}" alt="" loading="lazy">` : `<div class="nui-avatar-fallback" style="width:24px;height:24px;font-size:12px;" data-sender="${escapeHTML(msg.sender)}">${escapeHTML(msg.sender.charAt(0).toUpperCase())}</div>`;

                        msgNode.innerHTML = `
                            <div class="nui-bubble-header"><span class="nui-bubble-who">${avatarHTML}<span>${userLink(msg.sender)}</span></span><span>${msg.date}</span></div>
                            <div class="nui-bubble-body">${formattedBody}</div>
                        `;
                        msg.body = formattedBody; archiveModified = true;

                    } catch (error) { msgNode.innerHTML = `<div class="nui-bubble-body" style="color: var(--nui-danger);">Failed to load from Neopets.</div>`; }
                }
            }

            if (archiveModified) {
                const archive = getLocalArchive();
                thread.messages.forEach(tm => { const archMsg = archive.find(am => am.id === tm.id); if (archMsg && tm.body) archMsg.body = tm.body; });
                saveLocalArchive(archive);
                updateMailStats();
            }

            const replyContainer = container.querySelector('#neomail-reply-container');
            appendReplyBox(replyContainer, thread);

            const viewerScroll = document.querySelector('.neomail-thread-list');
            if (viewerScroll) viewerScroll.scrollTop = viewerScroll.scrollHeight;
        }

        function appendReplyBox(container, thread) {
            const recipient = thread.sender;
            const subject = thread.baseSubject.startsWith('Re:') ? thread.baseSubject : 'Re: ' + thread.baseSubject;
            const lastReceivedMsg = thread.messages.slice().reverse().find(m => !m.isSent);
            const replyId = lastReceivedMsg ? lastReceivedMsg.id : '';

            container.innerHTML = `
                <div class="neomail-reply-box nui-reset">
                    <form id="neomail-inline-form" style="width: 100%; max-width: 600px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                        <textarea name="message_body" rows="3" class="nui-textarea" placeholder="Write a reply..." required style="text-align: center;"></textarea>
                        <div class="neomail-actions" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%;">
                            <button type="button" class="nui-btn nui-btn-warning nui-btn-sm" id="neomail-btn-clear-server">Clear from Site</button>
                            <button type="button" class="nui-btn nui-btn-danger nui-btn-sm" id="neomail-btn-delete-local">Delete Entirely</button>
                            <button type="submit" class="nui-btn nui-btn-primary nui-btn-sm">Send Reply</button>
                        </div>
                        <span id="neomail-status-text" style="font-size: 13px; font-weight: 600;"></span>
                    </form>
                </div>
            `;

            const form = container.querySelector('#neomail-inline-form');
            const statusText = container.querySelector('#neomail-status-text');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                statusText.style.color = 'var(--nui-text-muted)';
                statusText.textContent = 'Sending...';

                const bodyText = form.querySelector('textarea').value;
                const payload = new URLSearchParams();
                payload.append('recipient', recipient);
                payload.append('subject', subject);
                if (replyId) payload.append('reply_message_id', replyId);
                payload.append('message_body', bodyText);

                try {
                    const postRes = await fetch('/process_neomessages.phtml', {
                        method: 'POST',
                        body: payload,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    });

                    if (postRes.ok) {
                        statusText.style.color = 'var(--nui-success)';
                        statusText.textContent = 'Sent!';
                        addSentMessageToArchive(recipient, subject, bodyText);
                        allThreads = syncAndProcessThreads([]);
                        updateMailStats();
                        form.querySelector('textarea').value = '';

                        const listEl = document.getElementById('neomail-thread-list');
                        const now = new Date();
                        const ampm = now.getHours() >= 12 ? 'pm' : 'am';
                        let hour = now.getHours() % 12 || 12;
                        const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${hour}:${now.getMinutes().toString().padStart(2, '0')}${ampm}`;
                        listEl.appendChild(createMessageNode({ sender: getUsername(), date: dateStr, body: bodyText, isSent: true }));

                        const viewerScroll = document.querySelector('.neomail-thread-list');
                        if(viewerScroll) viewerScroll.scrollTop = viewerScroll.scrollHeight;

                        setTimeout(() => { statusText.textContent = ''; }, 3000);
                    } else { throw new Error('Server error'); }
                } catch (err) {
                    statusText.style.color = 'var(--nui-danger)';
                    statusText.textContent = 'Failed to send.';
                } finally { submitBtn.disabled = false; }
            });

            bindDeleteLogic(container, thread);
        }

        function bindDeleteLogic(container, thread) {
            const btnClear = container.querySelector('#neomail-btn-clear-server');
            const btnDelete = container.querySelector('#neomail-btn-delete-local');
            const statusSpan = container.querySelector('#neomail-status-text');
            const serverMessages = thread.messages.filter(m => m.isOnServer);
            if (serverMessages.length === 0 && btnClear) btnClear.style.display = 'none';

            if (btnClear) {
                btnClear.addEventListener('click', async () => {
                    btnClear.disabled = true; btnDelete.disabled = true; statusSpan.style.color = 'var(--nui-warning)'; statusSpan.textContent = 'Clearing...';
                    const payload = new URLSearchParams({ folder: 'Inbox', action: 'Delete Messages' });
                    serverMessages.forEach(m => payload.append('checkbox_arr[]', m.id));
                    try {
                        const res = await fetch('/modify_neomessages.phtml', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
                        if (res.ok) {
                            let archive = getLocalArchive();
                            serverMessages.forEach(sm => { const match = archive.find(a => a.id === sm.id); if (match) match.isOnServer = false; });
                            saveLocalArchive(archive);
                            updateMailStats();
                            statusSpan.style.color = 'var(--nui-success)'; statusSpan.textContent = 'Cleared!'; btnClear.style.display = 'none';
                            const activeItem = document.querySelector('.nui-item.is-active');
                            if (activeItem) {
                                const badgesDiv = activeItem.querySelector('.nui-item-bottom div');
                                if (badgesDiv && !badgesDiv.innerHTML.includes('Local Archive')) badgesDiv.innerHTML = `<span class="nui-badge nui-badge-warning">Local Archive</span> ` + badgesDiv.innerHTML;
                            }
                        }
                    } catch (e) { statusSpan.style.color = 'var(--nui-danger)'; statusSpan.textContent = 'Error.'; } finally { btnDelete.disabled = false; }
                });
            }

            btnDelete.addEventListener('click', async () => {
                if (btnClear) btnClear.disabled = true;
                btnDelete.disabled = true; statusSpan.style.color = 'var(--nui-danger)'; statusSpan.textContent = 'Deleting...';
                if (serverMessages.length > 0) {
                    const payload = new URLSearchParams({ folder: 'Inbox', action: 'Delete Messages' });
                    serverMessages.forEach(m => payload.append('checkbox_arr[]', m.id));
                    await fetch('/modify_neomessages.phtml', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(e => {});
                }
                let archive = getLocalArchive();
                archive = archive.filter(a => `${a.sender}::${a.baseSubject}` !== thread.key && `${a.recipient}::${a.baseSubject}` !== thread.key);
                saveLocalArchive(archive);
                updateMailStats();
                document.getElementById('neomail-viewer-content').style.display = 'none';
                const emptyViewer = document.getElementById('neomail-viewer-empty');
                emptyViewer.style.display = 'block'; emptyViewer.innerHTML = '<span class="nui-empty-emoji">🗑️</span>Thread deleted.';
                const app = document.getElementById('neomail-app'); if (app) app.classList.remove('thread-open');
                const activeItem = document.querySelector('.nui-item.is-active'); if (activeItem) activeItem.remove();
            });
        }
    }
})();
