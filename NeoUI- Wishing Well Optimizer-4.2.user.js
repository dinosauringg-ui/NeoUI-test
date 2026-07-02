// ==UserScript==
// @name         NeoUI: Wishing Well Optimizer
// @namespace    http://tampermonkey.net/
// @version      4.2
// @description  Mobile-optimized Wishing Well integrated seamlessly with the NeoUI Core Framework.
// @author       ext1nct
// @match        *://*.neopets.com/wishing.phtml*
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
            box.textContent = 'Wishing Well crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) { }
    }

    function run() {
        if (!window.NeoUI || !window.NeoUI.__ready) { throw new Error('NeoUI Core Framework was not found.'); }
        const NeoUI = window.NeoUI;

        const originalForm = document.querySelector('form[action="process_wishing.phtml"]');
        if (!originalForm) return; // Failsafe if not on the right page

        // 1. Define Scraping Functions
        function scrapeUsername() {
            const userLink = document.querySelector('.user a[href^="/userlookup.phtml?user="]');
            return userLink ? userLink.textContent.trim() : 'Neopian';
        }

        function scrapePetInfo() {
            const petImg = document.querySelector('.activePet img');
            const petName = document.querySelector('.sidebarHeader a b');
            return {
                name: petName ? petName.textContent.trim() : 'Unknown Pet',
                image: petImg ? petImg.src : 'https://images.neopets.com/themes/h5/basic/images/mystery-icon.png'
            };
        }

        function scrapeStats() {
            const npEl = document.getElementById('npanchor');
            const ncEl = document.getElementById('ncanchor');
            return { np: npEl ? npEl.textContent.trim() : '0', nc: ncEl ? ncEl.textContent.trim() : '0' };
        }

        // 2. EXECUTE SCRAPING BEFORE DESTROYING THE DOM
        const activeUsername = scrapeUsername();
        const activePet = scrapePetInfo();
        const activeStats = scrapeStats();

        let recentTable = null;
        document.querySelectorAll('table').forEach(t => {
            if (t.innerHTML.includes('Got a...')) {
                recentTable = t.cloneNode(true);
            }
        });

        // 3. Nuke the legacy DOM safely
        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        // 4. Initialize NeoUI & pass the saved scraped data
        NeoUI.init();
        NeoUI.setProfileInfo({
            username: activeUsername,
            petname: activePet.name,
            petImage: activePet.image,
            np: activeStats.np,
            nc: activeStats.nc
        });

        // 5. Inject Topbar with Dynamic SVG Logo
        function injectTopbar() {
            const headerWrapper = document.createElement('div');
            headerWrapper.className = 'nui-header-wrapper nui-reset';
            headerWrapper.innerHTML = `
                <div class="nui-topbar" style="position: relative;">
                    <div style="display:flex; align-items:center; gap:10px; z-index:2;" id="neowish-neogo-slot"></div>

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

                    <div class="nui-topbar-stats" id="neowish-stats" style="z-index:2;">NP: <b>${activeStats.np}</b> &nbsp; NC: <b>${activeStats.nc}</b></div>
                </div>
            `;
            document.body.appendChild(headerWrapper);
            headerWrapper.querySelector('#neowish-neogo-slot').appendChild(NeoUI.neoGoButton());
        }

        injectTopbar();

        // 6. Build Main App Container
        const pageWrapper = document.createElement('div');
        pageWrapper.style.cssText = 'min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: calc(var(--nui-topbar-h) + var(--nui-space-5)) var(--nui-space-4) var(--nui-space-5); box-sizing: border-box;';
        document.body.appendChild(pageWrapper);

        const container = document.createElement('div');
        container.style.cssText = 'width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        pageWrapper.appendChild(container);

        // Image Card
        container.innerHTML += `
            <div class="nui-surface" style="border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-3); text-align: center; box-shadow: 0 4px 12px var(--nui-shadow);">
                <img src="//images.neopets.com/images/wishingwell.gif" style="border-radius: var(--nui-radius-md); max-width: 100%; height: auto; display: block; margin: 0 auto;">
            </div>
        `;

        // Form Card
        const formCard = document.createElement('form');
        formCard.className = 'nui-surface';
        formCard.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-5); box-shadow: 0 4px 12px var(--nui-shadow); display: flex; flex-direction: column; gap: var(--nui-space-4);';

        formCard.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--nui-space-2);">
                <label class="nui-text" style="font-weight: 700; font-size: 14px;">What item do you wish for?</label>
                <input name="wish" class="nui-input" type="text" placeholder="e.g. Acara Maractite Coin">
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--nui-space-2);">
                <label class="nui-text" style="font-weight: 700; font-size: 14px;">Donation Amount (NP)</label>
                <input name="donation" class="nui-input" type="number" min="21" value="21">
            </div>
            <button type="submit" class="nui-btn nui-btn-primary nui-btn-block" style="margin-top: var(--nui-space-2);">Make a Wish</button>
        `;
        container.appendChild(formCard);

        const wishInput = formCard.querySelector('input[name="wish"]');
        const donInput = formCard.querySelector('input[name="donation"]');
        const submitBtn = formCard.querySelector('button[type="submit"]');

        // Form Logic
        const savedWish = localStorage.getItem('neo_last_wish');
        if (savedWish) wishInput.value = savedWish;

        if (wishInput.value) {
            submitBtn.focus();
        } else {
            wishInput.focus();
        }

        formCard.addEventListener('submit', async (e) => {
            e.preventDefault();
            localStorage.setItem('neo_last_wish', wishInput.value);

            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Wishing...";
            submitBtn.disabled = true;

            try {
                const formData = new URLSearchParams();
                formData.append('wish', wishInput.value);
                formData.append('donation', donInput.value);

                const response = await fetch('/process_wishing.phtml', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                if (response.ok) {
                    let count = parseInt(sessionStorage.getItem('neo_wish_count') || '0') + 1;
                    sessionStorage.setItem('neo_wish_count', count);

                    submitBtn.textContent = `Wish Submitted! (${count}/7)`;
                    submitBtn.style.backgroundColor = 'var(--nui-success)';
                    submitBtn.style.color = 'var(--nui-surface)';
                    submitBtn.style.borderColor = 'var(--nui-success)';

                    // Use the activeStats variable to correctly subtract NP visually
                    const currentNp = parseInt(activeStats.np.replace(/,/g, ''));
                    const donated = parseInt(donInput.value);
                    const headerStats = document.querySelector('#neowish-stats b');
                    if (headerStats) {
                        const newNp = (currentNp - donated).toLocaleString();
                        headerStats.textContent = newNp;
                        activeStats.np = newNp; // Update the saved state so consecutive wishes math correctly
                    }

                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.style.color = '';
                        submitBtn.style.borderColor = '';
                        submitBtn.focus();
                    }, 1000);
                } else {
                    throw new Error('Network error');
                }
            } catch (error) {
                submitBtn.textContent = "Error! Try Again.";
                submitBtn.style.backgroundColor = 'var(--nui-danger)';
                submitBtn.style.color = 'var(--nui-surface)';

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                }, 1500);
            }
        });

        // 7. Recent Wishes Table
        if (recentTable) {
            const tableCard = document.createElement('div');
            tableCard.className = 'nui-surface';
            tableCard.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); box-shadow: 0 4px 12px var(--nui-shadow); overflow: hidden; margin-top: var(--nui-space-3);';

            tableCard.innerHTML = `<div class="nui-text" style="padding: var(--nui-space-4); font-weight: 800; font-size: 16px; border-bottom: 1px solid var(--nui-border); background: var(--nui-surface-2);">Recently Granted</div>`;

            recentTable.style.width = '100%';
            recentTable.style.borderCollapse = 'collapse';

            recentTable.querySelectorAll('td, th').forEach(cell => {
                cell.style.padding = 'var(--nui-space-3) var(--nui-space-4)';
                cell.style.borderBottom = '1px solid var(--nui-border)';
                cell.style.backgroundColor = 'transparent';
                cell.style.color = 'var(--nui-text)';
                cell.style.fontSize = '14px';
                cell.style.textAlign = 'left';
                cell.removeAttribute('bgcolor');
            });

            recentTable.querySelectorAll('a').forEach(link => {
                link.style.color = 'var(--nui-accent)';
                link.style.textDecoration = 'none';
                link.style.fontWeight = 'bold';
            });

            const tableScrollWrap = document.createElement('div');
            tableScrollWrap.style.cssText = 'overflow-x: auto; width: 100%;';
            tableScrollWrap.appendChild(recentTable);
            tableCard.appendChild(tableScrollWrap);
            container.appendChild(tableCard);
        }
    }
})();
