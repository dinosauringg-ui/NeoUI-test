// ==UserScript==
// @name         NeoUI: Unified Suite
// @namespace    ext1nct
// @version      1.1.46
// @description  NeoUI Unified Suite: polished theme system, global search, and a daily timer hub for timed Neopets activities, bundled into one mobile-forward userscript.
// @author       ext1nct
// @match        *://*.neopets.com/*
// @grant        none
// @run-at       document-end
// @license      MIT
// ==/UserScript==

/*
 * ============================================================================
 * NEOUI: UNIFIED SUITE  —  ext1nct
 * ============================================================================
 * A single-install, mobile-forward overhaul of the Neopets experience.
 * All modules share one design system, theme engine, and topbar.
 *
 * MODULES
 *   Core Framework   — design tokens (12 themes + custom), topbar, drawer nav,
 *                      global search (Ctrl+K / /), SSW modal, daily-timer hub,
 *                      theme editor (basic + advanced tokens, 18 SVG textures),
 *                      VibeRater, NickNames, settings panel, custom site nav,
 *                      module toggle system (all modules on/off per-toggle)
 *   Home             — smart NST greeting, pet card, live training pills (all 3
 *                      schools), dailies + wheels accordions, NST clock,
 *                      Snowager alert, quick links (incl. Quest Log)
 *   Neomail          — threaded inbox SPA, bulk select, avatar fetch, vibe tints,
 *                      nicknames, reply/compose composers, char counter
 *   Neoboards        — tabbed multi-thread SPA, quick reply, Neoboards index
 *                      (collapsible categories, board favourites), vibe tints,
 *                      nicknames, history push/pop state, board URL persistence
 *   Neopian Times    — article/comic/editorial reader, home/list view, pagination
 *   Food Club        — pirates, bet, my-bets, collect, history tabs; NeoFoodClub
 *                      bet-string importer; odds calc; max-bet enforced
 *   Buried Treasure  — mobile-friendly pick-a-spot map (scaled clicks), cooldown
 *                      synced to daily timer hub
 *   Fruit Machine    — headless SPA wrapper for the daily spin (ready/cooldown/
 *                      result states scraped, spin submitted via fetch), cooldown
 *                      synced to daily timer hub
 *   Stock Market     — portfolio view with chart, buy/sell
 *   Training         — status across all 3 schools (MI, Ninja, Pirate Academy);
 *                      SSW / SW / SDB buttons per codestone/dubloon
 *   Quickref         — reformatted pet stats page
 *   Dailies Hub      — modal countdown dashboard for all timed dailies
 *   Games            — games room card grid (fetches category page, live filter);
 *                      Ruffle player wrapper with submit-score form
 *   Faerie Quests    — sitewide quest watcher + /quests.phtml enhancement
 *
 * CHANGELOG  (last 5 versions)
 *
 * v1.1.42
 *   - Module toggle system: every module except Core checks
 *     window.NeoUI.isModuleEnabled(id) at its URL guard and exits immediately
 *     if disabled. Toggles are persisted in neoui_disabled_modules. A "Modules"
 *     section in the Settings drawer lists all 19 toggleable modules with
 *     on/off pill buttons. Changes take effect on next page load.
 *   - Smart greeting: home page hero banner now uses one of 7 NST time-keyed
 *     greetings instead of the static "Welcome back, username!": Up late (0-4),
 *     Early bird (4-7), Good morning (7-12), Good afternoon (12-14),
 *     Hey there (14-18), Good evening (18-21), Winding down (21-24).
 *
 * v1.1.41
 *     one page at a time with Prev/page-number/Next buttons, per feedback —
 *     the multi-page background crawl wasn't wanted, just confirmation the
 *     SPA can fetch pages itself rather than needing every page pasted in.
 *     Sort tabs, the premium-featured callout, and the filter box are
 *     unchanged; filtering is scoped to whichever page is currently loaded.
 *
 * v1.1.40
 *   - Games Room (step 2): since every page is just the same alphabetical
 *     listing, the module now crawls all of them in the background on load
 *     and presents one complete, fully-searchable list instead of making
 *     you click through pages. Crawling follows each page's own pagination
 *     links and stops once no new page numbers turn up, rather than trusting
 *     any single page's pagination window to reveal the true last page (the
 *     sample only showed links 1-7, which may or may not be the real total).
 *     Games are de-duplicated by href and merged under their alphabetical
 *     letter as pages come in. The old manual Prev/page-number/Next buttons
 *     are gone, replaced with a small "N games loaded from M pages" summary
 *     and a Refresh button; sort tabs now trigger a fresh full crawl from
 *     that tab's URL. Filtering now searches the entire loaded list, not
 *     just whichever page happened to be showing.
 *
 * v1.1.39
 *   - Games Room module rebuilt from a real sample of /games/category.phtml
 *     (step 1 of a multi-step redo). The old version guessed at a
 *     Ruffle/H5/Other split that doesn't exist in the real markup; it's
 *     replaced with what's actually there: alphabetical letter-group
 *     headers (.gr-group-header + sibling .ctp-med cards), real pagination
 *     via ?page=N (the page "numbers" are sprite icons with no visible
 *     text, so numbers come from each link's href instead), the
 *     premium-featured callout above the list, and the four server-provided
 *     sort tabs (A-Z / Newest / Difficulty / Popularity). Also fixed a
 *     latent bug: the old code reused the live `document` when already on
 *     category.phtml, but by that point document.body had already been
 *     wiped to build the NeoUI shell, so that branch was scraping nothing.
 *     Every load — including the first — now goes through fetch() and a
 *     fresh DOMParser document. Category/world filters, popularity sort
 *     wiring, and richer game metadata are follow-up steps.
 *
 * v1.1.38
 *   - New module: Fruit Machine (headless SPA wrapper), mirroring the Buried
 *     Treasure module's approach — scrapes whichever server-rendered state
 *     the page is in (ready to spin / already spun today / spin result),
 *     rebuilds it inside the shared NeoUI chrome, and submits the real spin
 *     via fetch() using whatever hidden fields (spin, ck, etc.) the form
 *     actually contains, so the underlying game logic and single-use ck
 *     token are untouched. Cooldown and result screens weren't available to
 *     sample, so both use best-effort scrapers with a raw-content fallback —
 *     same safety-net pattern Buried Treasure uses for its result screen.
 *     Cooldown countdown uses the page's own NST clock globals (nh/nm/ns) to
 *     estimate time to daily reset when no explicit wait time is given.
 *     Timer synced to the Daily Timer Hub under the existing 'fruit-machine'
 *     id (24h interval). Confirmed against a real "already spun today"
 *     sample: div.result is the one container reused for every sub-state
 *     (the spin form when ready, bare unwrapped text on cooldown), so the
 *     scraper now scopes off it directly and shows that text verbatim
 *     instead of a generic placeholder when no b/strong/p wrapper is present.
 * ============================================================================
 */

// MODULE 1: NEOUI CORE FRAMEWORK
// ==============================================================================

/*
 * ============================================================================
 * NEOUI CORE
 * ----------------------------------------------------------------------------
 * A standalone, @require-able design system for Neopets mobile-overhaul
 * userscripts. Provides:
 *
 *   1. Design tokens (CSS variables) for 7 swappable themes
 *   2. A base component library (topbar, nav, list items, bubbles, buttons,
 *      forms, badges, empty states, modals)
 *   3. A tiny JS runtime: window.NeoUI
 *        - NeoUI.init()                 mounts styles + floating theme menu
 *        - NeoUI.setTheme(name)         switches theme, persists, broadcasts
 *        - NeoUI.getTheme()             current theme name
 *        - NeoUI.injectViewport()       forces mobile viewport meta
 *        - NeoUI.mount(el)              appends el to document.body
 *        - NeoUI.h(tag, attrs, html)    tiny element-creation helper
 *        - NeoUI.THEMES                 theme metadata (for custom pickers)
 *
 * Consuming scripts should @require this file, then call NeoUI.init() before
 * building their own UI. NeoUI guarantees the <style> and theme attribute
 * exist exactly once per page even if multiple scripts call init().
 * ============================================================================
 */

(function (global) {
    'use strict';

    if (global.NeoUI && global.NeoUI.__ready) {
        // Already initialized by another script on this page — don't double-inject.
        return;
    }

    // ==========================================================================
    // 1. THEME DEFINITIONS
    // ==========================================================================
    // Every theme defines the SAME token set. Components only ever reference
    // var(--nui-*) — never raw hex — so adding a 7th theme later is just adding
    // an entry here.

    const THEMES = {
        maractite: {
            label: 'Maractite',
            emoji: '🌊',
            tokens: {
                '--nui-bg':            '#060B19',
                '--nui-surface':       '#0D162B',
                '--nui-surface-2':     '#162340',
                '--nui-border':        '#263A64',
                '--nui-text':          '#E2E8F0',
                '--nui-text-muted':    '#829AC1',
                '--nui-text-faint':    '#485D82',
                '--nui-accent':        '#3B82F6',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#162A5E',
                '--nui-accent-2':      '#06B6D4',
                '--nui-accent-2-soft': '#083344',
                '--nui-success':       '#10B981',
                '--nui-success-soft':  '#064E3B',
                '--nui-warning':       '#F59E0B',
                '--nui-warning-soft':  '#452908',
                '--nui-danger':        '#EF4444',
                '--nui-danger-soft':   '#4A1212',
                '--nui-shadow':        'rgba(0, 0, 0, 0.7)',
                '--nui-overlay':       'rgba(0, 0, 0, 0.8)',
                // Sonar ping from the deep — one tight burst of concentric
                // rings (pressure wave) radiating from a single anchor, plus a
                // slow drift of bioluminescent motes. The ring cluster is
                // unique to this theme; Maraqua uses a different water motif.
                '--nui-texture':       'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'72\' height=\'72\'%3E%3Cline x1=\'14\' y1=\'10\' x2=\'14\' y2=\'26\' stroke=\'rgba(180,210,255,0.16)\' stroke-width=\'1.1\' stroke-linecap=\'round\'/%3E%3Cline x1=\'14\' y1=\'13\' x2=\'20\' y2=\'13\' stroke=\'rgba(180,210,255,0.13)\' stroke-width=\'1\' stroke-linecap=\'round\'/%3E%3Cline x1=\'14\' y1=\'19\' x2=\'18\' y2=\'19\' stroke=\'rgba(180,210,255,0.11)\' stroke-width=\'0.9\' stroke-linecap=\'round\'/%3E%3Ccircle cx=\'14\' cy=\'10\' r=\'1.3\' fill=\'rgba(212,175,80,0.38)\'/%3E%3Cline x1=\'50\' y1=\'18\' x2=\'50\' y2=\'34\' stroke=\'rgba(180,210,255,0.13)\' stroke-width=\'1\' stroke-linecap=\'round\'/%3E%3Cline x1=\'44\' y1=\'26\' x2=\'56\' y2=\'26\' stroke=\'rgba(180,210,255,0.13)\' stroke-width=\'1\' stroke-linecap=\'round\'/%3E%3Cline x1=\'44\' y1=\'18\' x2=\'50\' y2=\'26\' stroke=\'rgba(212,175,80,0.2)\' stroke-width=\'0.8\' stroke-linecap=\'round\'/%3E%3Cline x1=\'10\' y1=\'50\' x2=\'16\' y2=\'44\' stroke=\'rgba(180,210,255,0.12)\' stroke-width=\'1\' stroke-linecap=\'round\'/%3E%3Cline x1=\'16\' y1=\'44\' x2=\'22\' y2=\'50\' stroke=\'rgba(180,210,255,0.12)\' stroke-width=\'1\' stroke-linecap=\'round\'/%3E%3Cline x1=\'10\' y1=\'57\' x2=\'16\' y2=\'51\' stroke=\'rgba(212,175,80,0.16)\' stroke-width=\'0.8\' stroke-linecap=\'round\'/%3E%3Cline x1=\'16\' y1=\'51\' x2=\'22\' y2=\'57\' stroke=\'rgba(212,175,80,0.16)\' stroke-width=\'0.8\' stroke-linecap=\'round\'/%3E%3Cline x1=\'56\' y1=\'50\' x2=\'56\' y2=\'66\' stroke=\'rgba(180,210,255,0.11)\' stroke-width=\'1\' stroke-linecap=\'round\'/%3E%3Cline x1=\'52\' y1=\'54\' x2=\'56\' y2=\'54\' stroke=\'rgba(180,210,255,0.1)\' stroke-width=\'0.9\' stroke-linecap=\'round\'/%3E%3Cline x1=\'52\' y1=\'60\' x2=\'60\' y2=\'60\' stroke=\'rgba(212,175,80,0.18)\' stroke-width=\'0.9\' stroke-linecap=\'round\'/%3E%3Ccircle cx=\'56\' cy=\'66\' r=\'1.1\' fill=\'rgba(212,175,80,0.32)\'/%3E%3C/svg%3E")',
                '--nui-texture-opacity': '1',
                '--nui-texture-blend':  'screen',
                '--nui-texture-rotate': '0deg',
            },
        },
        neopia: {
            label: 'Neopia Central',
            emoji: '🏠 ',
            tokens: {
                '--nui-bg':            '#FFF6E0',
                '--nui-surface':       '#FFFFFF',
                '--nui-surface-2':     '#FFE9C2',
                '--nui-border':        '#F5CE8A',
                '--nui-text':          '#2E2410',
                '--nui-text-muted':    '#7A6A40',
                '--nui-text-faint':    '#AE9C6E',
                '--nui-accent':        '#FF8A00',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#FFD27A',
                '--nui-accent-2':      '#0F6FFF',
                '--nui-accent-2-soft': '#BFD9FF',
                '--nui-success':       '#2FA84B',
                '--nui-success-soft':  '#CFEFD7',
                '--nui-warning':       '#C99A06',
                '--nui-warning-soft':  '#FBF0CB',
                '--nui-danger':        '#E8392E',
                '--nui-danger-soft':   '#FCD2CE',
                '--nui-shadow':        'rgba(46, 36, 16, 0.14)',
                '--nui-overlay':       'rgba(46, 36, 16, 0.48)',
                // Scrapbook dot-scatter — reads as flecked paper/corkboard,
                // not a printed grid. Distinct in kind (dots, not lines)
                // from every other warm theme below.
                '--nui-texture':       'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'56\' height=\'56\'%3E%3Cpath d=\'M14 6 L16.4 13.4 L24.2 13.4 L18 18.2 L20.4 25.6 L14 21 L7.6 25.6 L10 18.2 L3.8 13.4 L11.6 13.4 Z\' fill=\'rgba(255,138,0,0.22)\' transform=\'rotate(-10,14,16)\'/%3E%3Cpath d=\'M42 22 L43.8 27.6 L49.8 27.6 L45 31 L46.8 36.6 L42 33.2 L37.2 36.6 L39 31 L34.2 27.6 L40.2 27.6 Z\' fill=\'none\' stroke=\'rgba(255,138,0,0.32)\' stroke-width=\'0.9\' transform=\'rotate(18,42,29)\'/%3E%3Cpath d=\'M20 40 L21 43 L24.2 43 L21.8 44.8 L22.8 47.8 L20 46 L17.2 47.8 L18.2 44.8 L15.8 43 L19 43 Z\' fill=\'rgba(15,111,255,0.2)\' transform=\'rotate(6,20,44)\'/%3E%3Cpath d=\'M46 8 L46.7 10.2 L49 10.2 L47.2 11.4 L47.9 13.6 L46 12.4 L44.1 13.6 L44.8 11.4 L43 10.2 L45.3 10.2 Z\' fill=\'none\' stroke=\'rgba(255,138,0,0.25)\' stroke-width=\'0.7\' transform=\'rotate(-22,46,11)\'/%3E%3Ccircle cx=\'6\' cy=\'46\' r=\'1.3\' fill=\'rgba(255,138,0,0.28)\'/%3E%3Ccircle cx=\'32\' cy=\'32\' r=\'0.9\' fill=\'rgba(15,111,255,0.2)\'/%3E%3C/svg%3E")',
                '--nui-texture-opacity': '0.55',
                '--nui-texture-blend':  'multiply',
                '--nui-texture-rotate': '0deg',
            },
        },
        haunted: {
            label: 'Haunted Woods',
            emoji: '🌙',
            tokens: {
                '--nui-bg':            '#1A1626',
                '--nui-surface':       '#241E33',
                '--nui-surface-2':     '#322A47',
                '--nui-border':        '#473A5E',
                '--nui-text':          '#F1EBFF',
                '--nui-text-muted':    '#B9A9DE',
                '--nui-text-faint':    '#85729E',
                '--nui-accent':        '#3DDC72',
                '--nui-accent-ink':    '#0B2412',
                '--nui-accent-soft':   '#1F5C36',
                '--nui-accent-2':      '#C77CFF',
                '--nui-accent-2-soft': '#3A2A55',
                '--nui-success':       '#3DDC72',
                '--nui-success-soft':  '#1A3A26',
                '--nui-warning':       '#F0C24B',
                '--nui-warning-soft':  '#433619',
                '--nui-danger':        '#FF5F5A',
                '--nui-danger-soft':   '#452228',
                '--nui-shadow':        'rgba(0, 0, 0, 0.5)',
                '--nui-overlay':       'rgba(0, 0, 0, 0.65)',
                // Spiderweb — radial strands from one corner plus three
                // concentric ring stops to suggest the spiral. Ghost wisps
                // (angled feathered blobs) drift across the lower half.
                // No straight repeating lines at all, so it can't be read
                // as crosshatch or plank grain.
                '--nui-texture':       'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'%3E%3Ccircle cx=\'20\' cy=\'18\' r=\'1.2\' fill=\'rgba(199,124,255,0.5)\'/%3E%3Ccircle cx=\'60\' cy=\'50\' r=\'0.9\' fill=\'rgba(61,220,114,0.45)\'/%3E%3Ccircle cx=\'44\' cy=\'30\' r=\'0.7\' fill=\'rgba(199,124,255,0.35)\'/%3E%3Ccircle cx=\'10\' cy=\'62\' r=\'0.8\' fill=\'rgba(61,220,114,0.3)\'/%3E%3Ccircle cx=\'70\' cy=\'14\' r=\'0.6\' fill=\'rgba(199,124,255,0.28)\'/%3E%3Ccircle cx=\'36\' cy=\'68\' r=\'1\' fill=\'rgba(61,220,114,0.38)\'/%3E%3Ccircle cx=\'66\' cy=\'72\' r=\'0.7\' fill=\'rgba(199,124,255,0.3)\'/%3E%3C/svg%3E")',
                '--nui-texture-opacity': '1',
                '--nui-texture-blend':  'screen',
                '--nui-texture-rotate': '0deg',
            },
        },
        moltara: {
            // Underground volcanic city — near-black charcoal with molten
            // orange/ember accents. Distinct from Haunted Woods (cool
            // purple/green) by leaning warm and fiery instead of spooky.
            label: 'Moltara',
            emoji: '🌋',
            tokens: {
                '--nui-bg':            '#1B1411',
                '--nui-surface':       '#241B17',
                '--nui-surface-2':     '#3A2A22',
                '--nui-border':        '#5A3F2E',
                '--nui-text':          '#FBE9DD',
                '--nui-text-muted':    '#D2A98C',
                '--nui-text-faint':    '#9C7259',
                '--nui-accent':        '#FF5722',
                '--nui-accent-ink':    '#2B0E04',
                '--nui-accent-soft':   '#5C2A14',
                '--nui-accent-2':      '#FFC247',
                '--nui-accent-2-soft': '#4A3318',
                '--nui-success':       '#5FCB6B',
                '--nui-success-soft':  '#1E3A20',
                '--nui-warning':       '#FFC247',
                '--nui-warning-soft':  '#4A3318',
                '--nui-danger':        '#FF6B5A',
                '--nui-danger-soft':   '#4A211A',
                '--nui-shadow':        'rgba(0, 0, 0, 0.55)',
                '--nui-overlay':       'rgba(0, 0, 0, 0.7)',
                // Floating embers of mixed size drifting up off molten rock —
                // dot scatter, no straight lines at all, so it can't be
                // mistaken for a woven/gridded theme. Screen blend so the
                // embers actually glow against the charcoal surface.
                '--nui-texture':       'radial-gradient(circle at 12% 82%, rgba(255,87,34,0.55) 1.8px, transparent 2.4px), radial-gradient(circle at 30% 55%, rgba(255,194,71,0.4) 1.2px, transparent 1.8px), radial-gradient(circle at 48% 90%, rgba(255,87,34,0.5) 1.4px, transparent 2px), radial-gradient(circle at 65% 40%, rgba(255,194,71,0.45) 1.8px, transparent 2.4px), radial-gradient(circle at 80% 70%, rgba(255,87,34,0.4) 1.2px, transparent 1.8px), radial-gradient(circle at 92% 20%, rgba(255,194,71,0.35) 1px, transparent 1.6px), radial-gradient(circle at 20% 20%, rgba(255,87,34,0.14) 0, transparent 40%)',
                '--nui-texture-opacity': '0.6',
                '--nui-texture-blend':  'screen',
                '--nui-texture-rotate': '-4deg',
            },
        },
        spacefaerie: {
            // Deep-space cosmic indigo with neon magenta/cyan — the
            // "after dark" counterpart to the soft pastel Faerieland theme.
            label: 'Space Faerie',
            emoji: '🌌',
            tokens: {
                '--nui-bg':            '#0D0E24',
                '--nui-surface':       '#161A3A',
                '--nui-surface-2':     '#222652',
                '--nui-border':        '#3C3F75',
                '--nui-text':          '#EDEBFF',
                '--nui-text-muted':    '#A7A8D9',
                '--nui-text-faint':    '#6F71A8',
                '--nui-accent':        '#FF4FD8',
                '--nui-accent-ink':    '#1A0A16',
                '--nui-accent-soft':   '#4A1E45',
                '--nui-accent-2':      '#4FE0FF',
                '--nui-accent-2-soft': '#163C45',
                '--nui-success':       '#4FE0A0',
                '--nui-success-soft':  '#163A2E',
                '--nui-warning':       '#FFD24F',
                '--nui-warning-soft':  '#4A3A14',
                '--nui-danger':        '#FF5C7A',
                '--nui-danger-soft':   '#451A24',
                '--nui-shadow':        'rgba(0, 0, 0, 0.55)',
                '--nui-overlay':       'rgba(0, 0, 0, 0.7)',
                // Starfield — pure dot scatter, no glow blob, so it never
                // reads as the same "soft glow" shape used by Faerieland or
                // the crackle/ripple shapes used elsewhere.
                '--nui-texture':       'radial-gradient(circle at 12% 25%, rgba(79,224,255,0.6) 1px, transparent 1.6px), radial-gradient(circle at 30% 65%, rgba(255,255,255,0.5) 1px, transparent 1.6px), radial-gradient(circle at 55% 20%, rgba(255,79,216,0.55) 1px, transparent 1.6px), radial-gradient(circle at 72% 55%, rgba(255,255,255,0.4) 1px, transparent 1.6px), radial-gradient(circle at 88% 30%, rgba(79,224,255,0.5) 1px, transparent 1.6px), radial-gradient(circle at 40% 88%, rgba(255,255,255,0.35) 0.8px, transparent 1.3px), radial-gradient(circle at 8% 70%, rgba(255,79,216,0.4) 0.8px, transparent 1.3px)',
                '--nui-texture-opacity': '0.65',
                '--nui-texture-blend':  'screen',
                '--nui-texture-rotate': '0deg',
            },
        },
        maraqua: {
            label: 'Maraqua',
            emoji: '🌊',
            tokens: {
                '--nui-bg':            '#DCF3F6',
                '--nui-surface':       '#FFFFFF',
                '--nui-surface-2':     '#B9EAF0',
                '--nui-border':        '#6FCBD6',
                '--nui-text':          '#0B2E33',
                '--nui-text-muted':    '#3F7A82',
                '--nui-text-faint':    '#7DAFB5',
                '--nui-accent':        '#00A8BC',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#7FE0EA',
                '--nui-accent-2':      '#FF7A33',
                '--nui-accent-2-soft': '#FFD2B0',
                '--nui-success':       '#1F9E6E',
                '--nui-success-soft':  '#BFEFD9',
                '--nui-warning':       '#C98A12',
                '--nui-warning-soft':  '#F5DFA0',
                '--nui-danger':        '#D9483F',
                '--nui-danger-soft':   '#F8CFC9',
                '--nui-shadow':        'rgba(11, 46, 51, 0.16)',
                '--nui-overlay':       'rgba(7, 35, 39, 0.5)',
                // Caustic light through shallow water — the rippling bright
                // patches you see on a sandy seabed. Tall narrow ellipses
                // (kelp/caustic shafts) plus a couple of shell-scatter dots.
                // Totally distinct from Maractite's sonar-ring motif.
                '--nui-texture':       'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'56\'%3E%3Cpath d=\'M0 14 C8 7 16 7 24 14 C32 21 40 21 48 14\' fill=\'none\' stroke=\'rgba(0,168,188,0.42)\' stroke-width=\'1.4\' stroke-linecap=\'round\'/%3E%3Cpath d=\'M0 30 C8 23 16 23 24 30 C32 37 40 37 48 30\' fill=\'none\' stroke=\'rgba(0,168,188,0.24)\' stroke-width=\'1\' stroke-linecap=\'round\'/%3E%3Cpath d=\'M0 46 C8 39 16 39 24 46 C32 53 40 53 48 46\' fill=\'none\' stroke=\'rgba(0,168,188,0.14)\' stroke-width=\'0.8\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
                '--nui-texture-opacity': '1',
                '--nui-texture-blend':  'multiply',
                '--nui-texture-rotate': '0deg',
            },
        },
        faerie: {
            // Intentionally kept MUTED/soft — Faerieland's airy, cloud-soft identity
            // is the exception to the suite's otherwise-vivid default.
            label: 'Faerieland',
            emoji: '☁️',
            tokens: {
                '--nui-bg':            '#F6F1FA',
                '--nui-surface':       '#FFFFFF',
                '--nui-surface-2':     '#EFE5F7',
                '--nui-border':        '#DCC9EC',
                '--nui-text':          '#3B2E4A',
                '--nui-text-muted':    '#8E7A9D',
                '--nui-text-faint':    '#B8A8C8',
                '--nui-accent':        '#A66CD1',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#EEDFF7',
                '--nui-accent-2':      '#E68FAE',
                '--nui-accent-2-soft': '#FBE3EB',
                '--nui-success':       '#5BAE82',
                '--nui-success-soft':  '#E2F2E9',
                '--nui-warning':       '#D9A441',
                '--nui-warning-soft':  '#FAEFD7',
                '--nui-danger':        '#D9697E',
                '--nui-danger-soft':   '#FAE1E6',
                '--nui-shadow':        'rgba(59, 46, 74, 0.12)',
                '--nui-overlay':       'rgba(40, 30, 55, 0.5)',
                // Soap-bubble clusters — overlapping translucent rings of
                // varying size in pink/lavender/white iridescence. Rings not
                // dots, so it reads as bubble membranes, not sparkle scatter.
                // The only theme using ringed radials without repeating.
                '--nui-texture':       'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'56\' height=\'56\'%3E%3Cpath d=\'M14 6 L15.4 10.6 L20 12 L15.4 13.4 L14 18 L12.6 13.4 L8 12 L12.6 10.6 Z\' fill=\'rgba(166,108,209,0.45)\'/%3E%3Cpath d=\'M40 32 L41 35 L44 36 L41 37 L40 40 L39 37 L36 36 L39 35 Z\' fill=\'rgba(230,143,174,0.4)\'/%3E%3Cpath d=\'M8 40 L8.8 42.6 L11.4 43.4 L8.8 44.2 L8 46.8 L7.2 44.2 L4.6 43.4 L7.2 42.6 Z\' fill=\'rgba(166,108,209,0.28)\'/%3E%3Ccircle cx=\'44\' cy=\'10\' r=\'1.4\' fill=\'rgba(230,143,174,0.45)\'/%3E%3Ccircle cx=\'28\' cy=\'28\' r=\'0.9\' fill=\'rgba(166,108,209,0.35)\'/%3E%3Ccircle cx=\'20\' cy=\'46\' r=\'1.1\' fill=\'rgba(230,143,174,0.32)\'/%3E%3Ccircle cx=\'50\' cy=\'46\' r=\'0.8\' fill=\'rgba(166,108,209,0.28)\'/%3E%3C/svg%3E")',
                '--nui-texture-opacity': '0.55',
                '--nui-texture-blend':  'screen',
                '--nui-texture-rotate': '0deg',
            },
        },
        gray: {
            // Warm stone-gray neutral. Accent is a small muted pink nod to
            // Neopets' Grey pet palette (grey pets traditionally keep a faint
            // pink cheek/nose tint even when fully desaturated).
            label: 'Grey Neopia',
            emoji: '🐭',
            tokens: {
                '--nui-bg':            '#EDEAE4',
                '--nui-surface':       '#FAF8F5',
                '--nui-surface-2':     '#E1DCD3',
                '--nui-border':        '#C9C1B4',
                '--nui-text':          '#322E28',
                '--nui-text-muted':    '#766E62',
                '--nui-text-faint':    '#A39A8C',
                '--nui-accent':        '#C97D8C',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#E8C9D0',
                '--nui-accent-2':      '#6E7C82',
                '--nui-accent-2-soft': '#D6DCDE',
                '--nui-success':       '#5C8C5A',
                '--nui-success-soft':  '#DCE9DA',
                '--nui-warning':       '#9C7F3E',
                '--nui-warning-soft':  '#E9DEC2',
                '--nui-danger':        '#B5524F',
                '--nui-danger-soft':   '#EBD2D0',
                '--nui-shadow':        'rgba(50, 46, 40, 0.12)',
                '--nui-overlay':       'rgba(50, 46, 40, 0.45)',
                // Halftone — offset rows of dots like a printed newspaper
                // photograph, using the pink-grey palette. Completely distinct
                // from the line-based textures on every other theme.
                '--nui-texture':       'radial-gradient(circle at 10% 10%, rgba(80,70,65,0.22) 1.5px, transparent 2.5px), radial-gradient(circle at 30% 10%, rgba(201,125,140,0.18) 1.5px, transparent 2.5px), radial-gradient(circle at 50% 10%, rgba(80,70,65,0.2) 1.5px, transparent 2.5px), radial-gradient(circle at 70% 10%, rgba(201,125,140,0.16) 1.5px, transparent 2.5px), radial-gradient(circle at 90% 10%, rgba(80,70,65,0.18) 1.5px, transparent 2.5px), radial-gradient(circle at 20% 30%, rgba(80,70,65,0.2) 1.5px, transparent 2.5px), radial-gradient(circle at 40% 30%, rgba(201,125,140,0.16) 1.5px, transparent 2.5px), radial-gradient(circle at 60% 30%, rgba(80,70,65,0.18) 1.5px, transparent 2.5px), radial-gradient(circle at 80% 30%, rgba(201,125,140,0.14) 1.5px, transparent 2.5px), radial-gradient(circle at 10% 50%, rgba(201,125,140,0.18) 1.5px, transparent 2.5px), radial-gradient(circle at 30% 50%, rgba(80,70,65,0.16) 1.5px, transparent 2.5px), radial-gradient(circle at 50% 50%, rgba(201,125,140,0.2) 1.5px, transparent 2.5px), radial-gradient(circle at 70% 50%, rgba(80,70,65,0.14) 1.5px, transparent 2.5px), radial-gradient(circle at 90% 50%, rgba(201,125,140,0.16) 1.5px, transparent 2.5px), radial-gradient(circle at 20% 70%, rgba(80,70,65,0.18) 1.5px, transparent 2.5px), radial-gradient(circle at 40% 70%, rgba(201,125,140,0.14) 1.5px, transparent 2.5px), radial-gradient(circle at 60% 70%, rgba(80,70,65,0.16) 1.5px, transparent 2.5px), radial-gradient(circle at 80% 70%, rgba(201,125,140,0.12) 1.5px, transparent 2.5px), radial-gradient(circle at 10% 90%, rgba(201,125,140,0.16) 1.5px, transparent 2.5px), radial-gradient(circle at 30% 90%, rgba(80,70,65,0.14) 1.5px, transparent 2.5px), radial-gradient(circle at 50% 90%, rgba(201,125,140,0.18) 1.5px, transparent 2.5px), radial-gradient(circle at 70% 90%, rgba(80,70,65,0.12) 1.5px, transparent 2.5px), radial-gradient(circle at 90% 90%, rgba(201,125,140,0.14) 1.5px, transparent 2.5px)',
                '--nui-texture-opacity': '0.35',
                '--nui-texture-blend':  'multiply',
                '--nui-texture-rotate': '0deg',
            },
        },
        tyrannia: {
            // Prehistoric badlands — cracked terracotta earth, bone-white
            // text, and mossy green accents. Warm and earthy, distinct from
            // both Neopia Central's golden warmth and Moltara's fiery darks.
            label: 'Tyrannia',
            emoji: '🦕',
            tokens: {
                '--nui-bg':            '#F5EDD8',
                '--nui-surface':       '#FFFDF5',
                '--nui-surface-2':     '#EDE0C4',
                '--nui-border':        '#C9AD7A',
                '--nui-text':          '#2E2010',
                '--nui-text-muted':    '#7A6440',
                '--nui-text-faint':    '#B09A70',
                '--nui-accent':        '#5A8A3C',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#C8DDB8',
                '--nui-accent-2':      '#C0622A',
                '--nui-accent-2-soft': '#F0CBB0',
                '--nui-success':       '#4E8C3A',
                '--nui-success-soft':  '#C8E0BA',
                '--nui-warning':       '#B87A20',
                '--nui-warning-soft':  '#F0DBA8',
                '--nui-danger':        '#C0422A',
                '--nui-danger-soft':   '#F0C2B0',
                '--nui-shadow':        'rgba(46, 32, 16, 0.14)',
                '--nui-overlay':       'rgba(46, 32, 16, 0.5)',
                // Cracked, dried mud — three uneven-angle lines (not a neat
                // two-line crosshatch) so the network reads as irregular
                // crackle, plus a few pebble dots for grit.
                '--nui-texture':       'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'52\' height=\'48\'%3E%3Cellipse cx=\'12\' cy=\'10\' rx=\'7\' ry=\'5\' transform=\'rotate(-15,12,10)\' fill=\'rgba(192,98,42,0.14)\' stroke=\'rgba(192,98,42,0.32)\' stroke-width=\'1\'/%3E%3Cellipse cx=\'32\' cy=\'8\' rx=\'4\' ry=\'3\' transform=\'rotate(10,32,8)\' fill=\'rgba(90,138,60,0.1)\' stroke=\'rgba(90,138,60,0.28)\' stroke-width=\'0.9\'/%3E%3Cellipse cx=\'44\' cy=\'16\' rx=\'6\' ry=\'4\' transform=\'rotate(-8,44,16)\' fill=\'rgba(192,98,42,0.08)\' stroke=\'rgba(192,98,42,0.22)\' stroke-width=\'0.8\'/%3E%3Cellipse cx=\'18\' cy=\'28\' rx=\'10\' ry=\'6\' transform=\'rotate(5,18,28)\' fill=\'rgba(90,138,60,0.08)\' stroke=\'rgba(90,138,60,0.22)\' stroke-width=\'1\'/%3E%3Cellipse cx=\'40\' cy=\'30\' rx=\'5\' ry=\'7\' transform=\'rotate(-20,40,30)\' fill=\'rgba(192,98,42,0.07)\' stroke=\'rgba(192,98,42,0.2)\' stroke-width=\'0.8\'/%3E%3Cellipse cx=\'8\' cy=\'42\' rx=\'5\' ry=\'3\' transform=\'rotate(12,8,42)\' fill=\'rgba(90,138,60,0.06)\' stroke=\'rgba(90,138,60,0.18)\' stroke-width=\'0.8\'/%3E%3Cellipse cx=\'30\' cy=\'44\' rx=\'3\' ry=\'2\' fill=\'rgba(192,98,42,0.1)\' stroke=\'rgba(192,98,42,0.24)\' stroke-width=\'0.7\'/%3E%3Cellipse cx=\'48\' cy=\'44\' rx=\'4\' ry=\'3\' transform=\'rotate(-10,48,44)\' fill=\'rgba(90,138,60,0.07)\' stroke=\'rgba(90,138,60,0.2)\' stroke-width=\'0.8\'/%3E%3C/svg%3E")',
                '--nui-texture-opacity': '0.5',
                '--nui-texture-blend':  'multiply',
                '--nui-texture-rotate': '3deg',
            },
        },
        virtupets: {
            // Sloth's space station — clinical steel grey with neon green
            // terminal readouts and hard-edged circuit-board geometry.
            // A cold, industrial dark theme distinct from Kreludor's
            // warm-ember moon and Space Faerie's cosmic magenta.
            label: 'Virtupets',
            emoji: '🛸',
            tokens: {
                '--nui-bg':            '#0E1218',
                '--nui-surface':       '#161C24',
                '--nui-surface-2':     '#1E2830',
                '--nui-border':        '#2C3C44',
                '--nui-text':          '#D8F0E0',
                '--nui-text-muted':    '#7AAA90',
                '--nui-text-faint':    '#3E6050',
                '--nui-accent':        '#1EE060',
                '--nui-accent-ink':    '#021408',
                '--nui-accent-soft':   '#0A3020',
                '--nui-accent-2':      '#44AAFF',
                '--nui-accent-2-soft': '#0A2840',
                '--nui-success':       '#1EE060',
                '--nui-success-soft':  '#0A3020',
                '--nui-warning':       '#FFD020',
                '--nui-warning-soft':  '#302800',
                '--nui-danger':        '#FF4040',
                '--nui-danger-soft':   '#301010',
                '--nui-shadow':        'rgba(0, 0, 0, 0.6)',
                '--nui-overlay':       'rgba(0, 0, 0, 0.72)',
                // Circuit board — rigid right-angle grid (kept, it's the
                // right motif) plus glowing node dots at a few junctions so
                // it reads as a live PCB instead of plain graph paper.
                // Screen blend so the green/blue lines actually light up
                // against the dark steel surface.
                '--nui-texture':       'repeating-linear-gradient(90deg, rgba(30,224,96,0.16) 0, rgba(30,224,96,0.16) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(0deg, rgba(68,170,255,0.14) 0, rgba(68,170,255,0.14) 1px, transparent 1px, transparent 22px), radial-gradient(circle at 22% 22%, rgba(30,224,96,0.6) 1.4px, transparent 2px), radial-gradient(circle at 66% 44%, rgba(68,170,255,0.55) 1.4px, transparent 2px), radial-gradient(circle at 44% 88%, rgba(30,224,96,0.5) 1.2px, transparent 1.8px)',
                '--nui-texture-opacity': '0.55',
                '--nui-texture-blend':  'screen',
                '--nui-texture-rotate': '0deg',
            },
        },
        meridell: {
            // Medieval kingdom — heraldic blue and red on aged parchment.
            // Previously leaned on forest greens for its primary accent,
            // which read too close to Tyrannia's mossy-green badlands.
            // Swapped the identity color to banner blue (kept green only
            // as the semantic "success" color) so the two are unmistakable
            // at a glance.
            label: 'Meridell',
            emoji: '🛡️',
            tokens: {
                '--nui-bg':            '#EDEADC',
                '--nui-surface':       '#FAFAF2',
                '--nui-surface-2':     '#DEDAC4',
                '--nui-border':        '#5C74A0',
                '--nui-text':          '#1A2038',
                '--nui-text-muted':    '#3A4868',
                '--nui-text-faint':    '#8290A8',
                '--nui-accent':        '#1E4FA0',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#BACCEA',
                '--nui-accent-2':      '#B01E28',
                '--nui-accent-2-soft': '#EFC0C4',
                '--nui-success':       '#3A7A2A',
                '--nui-success-soft':  '#C0DCA8',
                '--nui-warning':       '#A07818',
                '--nui-warning-soft':  '#EADBA0',
                '--nui-danger':        '#B01E28',
                '--nui-danger-soft':   '#EFC0C4',
                '--nui-shadow':        'rgba(20, 26, 50, 0.16)',
                '--nui-overlay':       'rgba(20, 26, 50, 0.5)',
                // Heraldic field — alternating chevron rows like a stamped
                // coat-of-arms ground, in banner blue and crimson. Much
                // denser and more intentional than the old bare lattice;
                // reads as "illuminated manuscript" not "graph paper."
                '--nui-texture':       'repeating-linear-gradient(45deg, rgba(30,79,160,0.18) 0, rgba(30,79,160,0.18) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, rgba(176,30,40,0.14) 0, rgba(176,30,40,0.14) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(45deg, transparent 0, transparent 5px, rgba(30,79,160,0.08) 5px, rgba(30,79,160,0.08) 6px, transparent 6px, transparent 12px), radial-gradient(circle at 50% 50%, rgba(30,79,160,0.22) 1.8px, transparent 2.6px), radial-gradient(circle at 0% 0%, rgba(176,30,40,0.18) 1.4px, transparent 2.2px), radial-gradient(circle at 100% 100%, rgba(176,30,40,0.18) 1.4px, transparent 2.2px), radial-gradient(circle at 0% 100%, rgba(30,79,160,0.16) 1.4px, transparent 2.2px), radial-gradient(circle at 100% 0%, rgba(30,79,160,0.16) 1.4px, transparent 2.2px)',
                '--nui-texture-opacity': '0.5',
                '--nui-texture-blend':  'multiply',
                '--nui-texture-rotate': '0deg',
            },
        },
        krawkisland: {
            // Pirate cove gone dark — black hull timbers, silver cutlass
            // steel, and blood-red accents. A moody, dangerous smuggler's-
            // den palette instead of a sunny beach one.
            label: 'Krawk Island',
            emoji: '🏴‍☠️',
            tokens: {
                '--nui-bg':            '#0A0A0A',
                '--nui-surface':       '#161616',
                '--nui-surface-2':     '#242424',
                '--nui-border':        '#585860',
                '--nui-text':          '#EAEAEC',
                '--nui-text-muted':    '#ACACB4',
                '--nui-text-faint':    '#6E6E76',
                '--nui-accent':        '#C8142A',
                '--nui-accent-ink':    '#FFFFFF',
                '--nui-accent-soft':   '#3A1418',
                '--nui-accent-2':      '#B6B8C2',
                '--nui-accent-2-soft': '#34343C',
                '--nui-success':       '#3DA85A',
                '--nui-success-soft':  '#173A22',
                '--nui-warning':       '#D0A82C',
                '--nui-warning-soft':  '#3A3014',
                '--nui-danger':        '#E01E30',
                '--nui-danger-soft':   '#3A1418',
                '--nui-shadow':        'rgba(0, 0, 0, 0.6)',
                '--nui-overlay':       'rgba(0, 0, 0, 0.75)',
                // Simple diagonal stripe pattern in dark slate gray — clean
                // and understated instead of the previous ornate motif.
                '--nui-texture':       'repeating-linear-gradient(45deg, rgba(100,116,139,0.14) 0px, rgba(100,116,139,0.14) 2px, transparent 2px, transparent 14px)',
                '--nui-texture-opacity': '0.5',
                '--nui-texture-blend':  'overlay',
                '--nui-texture-rotate': '0deg',
            },
        },
    };

    // Sanity-check: only validate color tokens (those that should be hex or
    // rgba). Texture, opacity, blend-mode, rotate, shadow strings are not
    // color values and must be left alone.
    const COLOR_TOKEN_RE = /^--nui-(?!texture|shadow|overlay)/;
    Object.keys(THEMES).forEach(function (key) {
        const t = THEMES[key].tokens;
        Object.keys(t).forEach(function (tk) {
            if (!COLOR_TOKEN_RE.test(tk)) return; // skip non-color tokens
            if (typeof t[tk] !== 'string' || !/^(#|rgba?\()/.test(t[tk])) {
                t[tk] = '#888888';
            }
        });
    });

    const DEFAULT_THEME = 'neopia';
    const STORAGE_KEY = 'neoui_theme_v1';
    const ROOT_ATTR = 'data-neoui-theme';

    // ==========================================================================
    // 2. SHARED NON-COLOR TOKENS (spacing, radius, type, motion)
    // ==========================================================================
    // These don't change per-theme — they're the "retro-modern" shape language.

   const STATIC_TOKENS = `
        --nui-font-display: "TP Cafeteria", "Museo", "Segoe UI Rounded", sans-serif;
        --nui-font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

        --nui-radius-sm: 8px;
        --nui-radius-md: 14px;
        --nui-radius-lg: 20px;
        --nui-radius-pill: 8px;
        --nui-radius-stamp: 16px 8px 16px 8px;

        --nui-space-1: 4px;
        --nui-space-2: 8px;
        --nui-space-3: 12px;
        --nui-space-4: 16px;
        --nui-space-5: 24px;
        --nui-space-6: 32px;

        --nui-ease: cubic-bezier(0.25, 1, 0.5, 1);
        --nui-ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1);
        --nui-dur-fast: 0.12s;
        --nui-dur-base: 0.22s;
        --nui-dur-slow: 0.36s;

        --nui-topbar-h: 58px;
        --nui-navbar-h: 52px;
        --nui-header-total: calc(var(--nui-topbar-h) + var(--nui-navbar-h));
    `;

    // ==========================================================================
    // 3. COMPONENT CSS
    // ==========================================================================
    // Everything below references var(--nui-*) only. This is the visual
    // vocabulary shared by every script in the suite.

    const COMPONENT_CSS = `
    @font-face {
        font-family: "TP Cafeteria";
        src: url("https://images.neopets.com/vending/fonts/cafeteria-black/cafeteria-black.otf") format("opentype");
        font-display: swap;
    }


        [${ROOT_ATTR}] {
            ${STATIC_TOKENS}
        }

        .nui-reset, .nui-reset * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        /* Force sans-serif globally to kill Neopets' legacy Times New Roman */
        .nui-reset { font-family: var(--nui-font-body); }
        .nui-spa-active { font-family: var(--nui-font-body); }

        /* Subtle full-page texture wash behind SPA content */
        .nui-spa-active body::after {
            content: '';
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            background-image: var(--nui-texture);
            background-repeat: repeat;
            background-size: var(--nui-texture-size, cover);
            opacity: calc(var(--nui-texture-opacity, 0.42) * 0.4);
            mix-blend-mode: var(--nui-texture-blend, multiply);
        }

        /* ---------- Surfaces & Type ---------- */
        .nui-surface {
            background: var(--nui-surface);
            position: relative;
            isolation: isolate;
            overflow: hidden;
        }
        .nui-topbar::before,
        .nui-header-wrapper::before,
        .nui-drawer::before,
        .nui-theme-option::before {
            content: '';
            position: absolute;
            inset: -10%;
            pointer-events: none;
            z-index: 0;
            background-image: var(--nui-texture);
            background-repeat: repeat;
            background-position: center;
            background-size: var(--nui-texture-size, cover);
            opacity: var(--nui-texture-opacity, 0.42);
            mix-blend-mode: var(--nui-texture-blend, multiply);
        }
        /* Texture is now scoped to only the outer app chrome — the top bar,
           header, and the drawer's own shell — plus the theme-swatch preview
           that's meant to show the pattern off. Everything that repeats on
           screen (cards, list rows, chat bubbles, the drawer's profile box
           and stat rows, buttons/pills/badges) is flat. Those repeating
           elements were what made texture feel constant rather than
           occasional, even after their opacity was dimmed. */
        .nui-topbar > *,
        .nui-header-wrapper > *,
        .nui-drawer > *,
        .nui-theme-option > * {
            position: relative;
            z-index: 1;
        }
        .nui-text { color: var(--nui-text); }
        .nui-text-muted { color: var(--nui-text-muted); }
        .nui-font-display { font-family: var(--nui-font-display); }

        /* ---------- Top Bar ---------- */
                              .nui-header-wrapper {
            position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
            background-color: var(--nui-bg);
            background-image:
                linear-gradient(to bottom, transparent 24%, var(--nui-bg) 100%),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
            border-bottom: 2px solid var(--nui-border);
            box-shadow: 0 4px 12px var(--nui-shadow);
        }

        /* Per-theme header texture, written as complete literal rules rather
           than a single --nui-texture custom property holding multiple
           comma-separated gradients. A custom property expanding into several
           layers of a background-image list is solid in Chromium but
           unreliable in WebKit/Safari, so each theme gets its own full
           declaration here instead of relying on that pattern. Each
           gradient still safely references single var(--nui-*) tokens. */
        [data-neoui-theme="neopia"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                repeating-linear-gradient(45deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 12px),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="haunted"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                radial-gradient(ellipse 55% 40% at 15% 20%, var(--nui-accent-2-soft) 0%, transparent 70%),
                radial-gradient(ellipse 45% 35% at 82% 65%, var(--nui-accent-soft) 0%, transparent 70%),
                radial-gradient(ellipse 40% 30% at 45% 90%, var(--nui-accent-2-soft) 0%, transparent 70%),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="moltara"] .nui-header-wrapper {
            /* Drifting embers rising off molten rock, instead of a crosshatch
               that read as a chain-link/diamond grid rather than lava cracks.
               Denser and larger toward the bottom to suggest they're rising. */
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                radial-gradient(circle at 10% 85%, var(--nui-accent) 1.5px, transparent 2px),
                radial-gradient(circle at 22% 60%, var(--nui-accent-2) 1px, transparent 1.5px),
                radial-gradient(circle at 35% 92%, var(--nui-accent) 1px, transparent 1.5px),
                radial-gradient(circle at 48% 45%, var(--nui-accent-2) 1.5px, transparent 2px),
                radial-gradient(circle at 58% 80%, var(--nui-accent) 1px, transparent 1.5px),
                radial-gradient(circle at 68% 55%, var(--nui-accent) 1.5px, transparent 2px),
                radial-gradient(circle at 78% 90%, var(--nui-accent-2) 1px, transparent 1.5px),
                radial-gradient(circle at 88% 65%, var(--nui-accent) 1px, transparent 1.5px),
                radial-gradient(circle at 95% 85%, var(--nui-accent-2) 1.5px, transparent 2px),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="spacefaerie"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                radial-gradient(circle at 12% 25%, var(--nui-accent-2) 1px, transparent 1.5px),
                radial-gradient(circle at 30% 65%, var(--nui-text) 1px, transparent 1.5px),
                radial-gradient(circle at 55% 20%, var(--nui-accent) 1px, transparent 1.5px),
                radial-gradient(circle at 72% 55%, var(--nui-text) 1px, transparent 1.5px),
                radial-gradient(circle at 88% 30%, var(--nui-accent-2) 1px, transparent 1.5px),
                radial-gradient(circle at 45% 85%, var(--nui-text) 1px, transparent 1.5px),
                radial-gradient(circle at 95% 75%, var(--nui-accent) 1px, transparent 1.5px),
                radial-gradient(circle at 5% 55%, var(--nui-text) 0.8px, transparent 1.2px),
                radial-gradient(circle at 20% 10%, var(--nui-accent-2) 0.8px, transparent 1.2px),
                radial-gradient(circle at 40% 40%, var(--nui-text) 0.8px, transparent 1.2px),
                radial-gradient(circle at 63% 85%, var(--nui-accent) 0.8px, transparent 1.2px),
                radial-gradient(circle at 80% 8%, var(--nui-text) 0.8px, transparent 1.2px),
                radial-gradient(circle at 98% 55%, var(--nui-accent-2) 0.8px, transparent 1.2px),
                radial-gradient(circle at 15% 90%, var(--nui-text) 0.8px, transparent 1.2px),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="maraqua"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                repeating-radial-gradient(circle at 50% 130%, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 14px),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="faerie"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                radial-gradient(ellipse 80% 70% at 15% 25%, var(--nui-accent-soft) 0%, transparent 60%),
                radial-gradient(ellipse 70% 60% at 80% 65%, var(--nui-accent-2-soft) 0%, transparent 60%),
                radial-gradient(ellipse 60% 55% at 48% 0%, var(--nui-accent-soft) 0%, transparent 60%),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        /* gray: intentionally no override, falls back to the plain base rule above */
        [data-neoui-theme="tyrannia"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                repeating-linear-gradient(70deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 18px),
                repeating-linear-gradient(160deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 22px),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="lostdesert"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                repeating-linear-gradient(90deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(0deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 20px),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="meridell"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                radial-gradient(ellipse 60% 50% at 20% 30%, var(--nui-accent-soft) 0%, transparent 70%),
                radial-gradient(ellipse 50% 40% at 75% 70%, var(--nui-accent-2-soft) 0%, transparent 70%),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }
        [data-neoui-theme="kreludor"] .nui-header-wrapper {
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
                radial-gradient(ellipse 40% 30% at 20% 70%, var(--nui-accent-soft) 0%, transparent 80%),
                radial-gradient(ellipse 35% 25% at 75% 30%, var(--nui-accent-2-soft) 0%, transparent 80%),
                radial-gradient(ellipse 30% 20% at 50% 50%, var(--nui-accent-soft) 0%, transparent 80%),
                linear-gradient(to bottom, var(--nui-surface) 0%, var(--nui-bg) 100%);
        }





        .nui-topbar {
            height: var(--nui-topbar-h);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 var(--nui-space-4);
            border-bottom: 1px solid var(--nui-border);
            gap: var(--nui-space-2);
        }

        .nui-topbar-title {
            font-family: "TP Cafeteria", cursive; /* New decorative font */
            font-weight: 400;
            font-size: 26px; /* Bumped up size for the stylized font */
            color: var(--nui-accent);
            letter-spacing: 0.5px;
            display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }

        .nui-topbar-stats {
            font-size: 13px;
            font-weight: 600;
            color: var(--nui-text-muted);
            white-space: nowrap;
        }
        .nui-topbar-stats b { color: var(--nui-text); }

        /* ---------- Pill Nav ---------- */
        .nui-hnav {
            height: var(--nui-navbar-h);
            display: flex;
            align-items: center;
            gap: var(--nui-space-2);
            padding: 0 var(--nui-space-4);
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            position: relative;
            isolation: isolate;
        }
        .nui-hnav::-webkit-scrollbar { display: none; }

       .nui-pill {
            color: var(--nui-text-muted);
            text-decoration: none;
            font-family: var(--nui-font-display);
            font-weight: 400;
            letter-spacing: 0.5px;
            font-size: 18px;
            background: var(--nui-surface-2);
            padding: 7px 14px;
            border-radius: var(--nui-radius-pill);
            transition: background var(--nui-dur-fast) var(--nui-ease), color var(--nui-dur-fast) var(--nui-ease), transform var(--nui-dur-fast) var(--nui-ease);
            flex-shrink: 0;
            border: 1px solid transparent;
            position: relative;
            isolation: isolate;
            overflow: hidden;
        }
        .nui-pill:active { transform: scale(0.96); }
        .nui-pill.is-active {
            background: var(--nui-accent-soft);
            color: var(--nui-accent);
            border-color: var(--nui-accent-soft);
        }

        /* ---------- Buttons ---------- */
        .nui-btn {
            font-family: var(--nui-font-body);
            padding: 13px 18px;
            font-size: 15px;
            font-weight: 700;
            border-radius: var(--nui-radius-stamp);
            border: none;
            cursor: pointer;
            transition: transform var(--nui-dur-fast) var(--nui-ease-snap), filter var(--nui-dur-fast) var(--nui-ease), opacity var(--nui-dur-fast) var(--nui-ease);
            text-align: center;
            line-height: 1.2;
            position: relative;
            isolation: isolate;
            overflow: hidden;
        }
        .nui-btn:active { transform: scale(0.97); }
        .nui-btn:disabled { opacity: 0.55; cursor: default; transform: none; }

        .nui-btn-primary { background: var(--nui-accent); color: var(--nui-accent-ink); }
        .nui-btn-primary:active { filter: brightness(0.94); }

        .nui-btn-secondary { background: var(--nui-surface-2); color: var(--nui-text); border: 1px solid var(--nui-border); }

        .nui-btn-warning { background: var(--nui-warning-soft); color: var(--nui-warning); border: 1px solid var(--nui-warning-soft); }
        .nui-btn-danger  { background: var(--nui-danger-soft);  color: var(--nui-danger);  border: 1px solid var(--nui-danger-soft); }

        .nui-btn-block { width: 100%; display: block; }
        .nui-btn-sm { padding: 9px 14px; font-size: 13px; border-radius: 12px 6px 12px 6px; }

        /* ---------- Form Fields ---------- */
        .nui-input, .nui-select, .nui-textarea {
            width: 100%;
            font-family: var(--nui-font-body);
            padding: 12px 14px;
            font-size: 15px;
            font-weight: 500;
            border-radius: var(--nui-radius-md);
            border: 1px solid var(--nui-border);
            background: var(--nui-surface-2);
            color: var(--nui-text);
            outline: none;
            -webkit-appearance: none;
            appearance: none;
            transition: border-color var(--nui-dur-fast) var(--nui-ease), background var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-input:focus, .nui-select:focus, .nui-textarea:focus {
            border-color: var(--nui-accent);
            background: var(--nui-surface);
        }
        .nui-textarea { resize: none; font-family: inherit; }

        /* ---------- List Items ---------- */
       .nui-item {
    padding: var(--nui-space-3) var(--nui-space-4);
    margin: 8px 12px;
    border-radius: var(--nui-radius-md);
    border: 1px solid var(--nui-border);
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 14px;
    align-items: center;
    background: var(--nui-surface);
    box-shadow: 0 2px 4px var(--nui-shadow);
    transition: transform var(--nui-dur-fast) var(--nui-ease), background var(--nui-dur-fast) var(--nui-ease);
    position: relative;
    isolation: isolate;
    overflow: hidden;
}

.nui-item:active {
    background: var(--nui-surface-2);
    transform: scale(0.98);
}

        .nui-avatar-wrapper { position: relative; width: 48px; height: 48px; flex-shrink: 0; }
        .nui-avatar {
            width: 100%; height: 100%; object-fit: cover;
            background: var(--nui-surface-2);

        }
             .nui-avatar-fallback {
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 18px; color: var(--nui-accent);
            background: var(--nui-accent-soft);
            width: 100%; height: 100%;
            font-family: var(--nui-font-display);
        }

        .nui-dot {
            display: none; position: absolute; top: -2px; right: -2px;
            width: 13px; height: 13px; background: var(--nui-accent-2);
            border: 2px solid var(--nui-surface); border-radius: 50%;
        }
        .nui-item.is-unread .nui-dot { display: block; }

        .nui-item-main { display: flex; flex-direction: column; min-width: 0; gap: 3px; }
        .nui-item-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
        .nui-item-title {
            font-weight: 700; color: var(--nui-text); font-size: 15.5px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nui-item-meta { font-size: 12.5px; color: var(--nui-text-faint); flex-shrink: 0; }

        .nui-item-bottom { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .nui-item-subtitle {
            font-size: 13.5px; color: var(--nui-text-muted); white-space: nowrap;
            overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;
        }
        .nui-item.is-unread .nui-item-subtitle { font-weight: 600; color: var(--nui-text); }

        /* ---------- Badges ---------- */
        .nui-badge {
            background: var(--nui-surface-2); color: var(--nui-text-muted);
            padding: 2px 9px; border-radius: var(--nui-radius-pill);
            font-size: 10.5px; font-weight: 700; white-space: nowrap;
            text-transform: uppercase; letter-spacing: 0.3px;
        }
        .nui-badge-accent  { background: var(--nui-accent-soft); color: var(--nui-accent); }
        .nui-badge-warning { background: var(--nui-warning-soft); color: var(--nui-warning); }
        .nui-badge-danger  { background: var(--nui-danger-soft); color: var(--nui-danger); }
        .nui-badge-success { background: var(--nui-success-soft); color: var(--nui-success); }

        /* ---------- Message / Chat Bubbles ---------- */
       .nui-bubble {
    background: var(--nui-surface);
    border-radius: var(--nui-radius-md); /* Matching your squared-off aesthetic */
    border: 1px solid var(--nui-border);
    max-width: 90%;
    box-shadow: 0 1px 2px var(--nui-shadow);
    flex-shrink: 0; /* Prevents the squishing and text cut-off */
}

        .nui-bubble.is-mine {
            align-self: flex-end;
            background: var(--nui-accent-2-soft);
            border-color: var(--nui-accent-2-soft);
            border-bottom-right-radius: 6px;
        }
        .nui-bubble.is-theirs {
            align-self: flex-start;
            border-bottom-left-radius: 6px;
        }

        .nui-bubble-header {
            padding: 9px 14px; border-bottom: 1px solid var(--nui-border);
            display: flex; justify-content: space-between; align-items: center;
            font-size: 12px; color: var(--nui-text-muted);
        }
        .nui-bubble-who { display: flex; align-items: center; gap: 8px; color: var(--nui-text); font-weight: 700; font-size: 13.5px; }
        .nui-bubble-body { padding: 13px 14px; font-size: 15px; color: var(--nui-text); line-height: 1.5; }
        .nui-bubble-body table { width: 100% !important; border-collapse: collapse; }

        /* ---------- Empty States ---------- */
        .nui-empty {
            margin: auto; color: var(--nui-text-faint); font-size: 15px;
            padding: var(--nui-space-5); text-align: center;
        }
        .nui-empty-emoji { font-size: 40px; display: block; margin-bottom: 8px; }

        /* ---------- NeoGo Drawer Trigger ---------- */
        .nui-neogo-btn {
            width: 38px; height: 38px;
            border-radius: 50%;
            background: var(--nui-accent-soft);
            border: none;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            padding: 0;
            flex-shrink: 0;
            transition: transform var(--nui-dur-fast) var(--nui-ease-snap);
        }
        .nui-neogo-btn:active { transform: scale(0.92); }
        .nui-neogo-btn svg { width: 100%; height: 100%; display: block; }

        /* ---------- Drawer (site nav + nested settings) ---------- */
        .nui-drawer-backdrop {
            position: fixed; inset: 0; z-index: 99999;
            background: var(--nui-overlay);
            opacity: 0; pointer-events: none;
            transition: opacity var(--nui-dur-base) var(--nui-ease);
        }
        .nui-drawer-backdrop.is-open { opacity: 1; pointer-events: auto; }

        .nui-drawer {
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 100000;
            width: min(82vw, 340px);
            background: var(--nui-surface);
            box-shadow: 4px 0 24px var(--nui-shadow);
            transform: translateX(-100%);
            transition: transform var(--nui-dur-slow) var(--nui-ease);
            display: flex; flex-direction: column;
            overflow: hidden;
            border-right: 1px solid var(--nui-border);
        }
        .nui-drawer-backdrop.is-open .nui-drawer { transform: translateX(0); }

        .nui-drawer-views {
            position: relative;
            flex: 1;
            overflow: hidden;
        }

        .nui-drawer-view {
            position: absolute; inset: 0;
            overflow-y: auto;
            padding: var(--nui-space-4);
            transition: transform var(--nui-dur-base) var(--nui-ease), opacity var(--nui-dur-base) var(--nui-ease);
        }
        /* nav view is the resting view; settings view slides in from the right over it */
        .nui-drawer-view[data-view="settings"] {
            transform: translateX(100%);
            background: var(--nui-surface);
        }
        .nui-drawer[data-active-view="settings"] .nui-drawer-view[data-view="nav"] {
            transform: translateX(-30%);
            opacity: 0.4;
        }
        .nui-drawer[data-active-view="settings"] .nui-drawer-view[data-view="settings"] {
            transform: translateX(0);
        }

        .nui-drawer-profile {
            display: flex; align-items: center; gap: 14px;
            /* Negative margins pull the background flush to the edges of the drawer */
            margin: calc(var(--nui-space-4) * -1) calc(var(--nui-space-4) * -1) var(--nui-space-4) calc(var(--nui-space-4) * -1);
            padding: var(--nui-space-5) var(--nui-space-4);
            background: linear-gradient(135deg, var(--nui-accent-soft), var(--nui-surface-2));
            border-bottom: 2px solid var(--nui-border);
        }
                     .nui-drawer-avatar {
            width: 90px; height: 90px;
            background: transparent;
            flex-shrink: 0;
            object-fit: cover;
            margin-left: -10px;
        }


        .nui-drawer-name {
            font-weight: 800;
            font-size: 20px; /* Scaled up to match the larger avatar */
            color: var(--nui-text);
            line-height: 1.1;
        }
    .nui-drawer-sub { font-size: 13px; color: var(--nui-accent); font-weight: 700; margin-top: 2px; }

        .nui-drawer-stats {
            display: flex; gap: 8px;
            padding-bottom: var(--nui-space-3);
            margin-bottom: var(--nui-space-2);
        }
        .nui-drawer-stat {
            flex: 1;
            background: var(--nui-surface-2);
            border-radius: var(--nui-radius-stamp);
            padding: 8px 10px;
            text-decoration: none;
            text-align: center;
        }
        .nui-drawer-stat-label { font-size: 10px; font-weight: 700; color: var(--nui-text-faint); text-transform: uppercase; letter-spacing: 0.3px; }
        .nui-drawer-stat-value { font-size: 13.5px; font-weight: 800; color: var(--nui-text); }

        .nui-drawer-section { margin: var(--nui-space-3) 0; position: relative; isolation: isolate; }
        .nui-drawer-section-title {
            font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;
            color: var(--nui-text); font-weight: 800;
            background: var(--nui-surface-2);
            padding: 12px 14px; margin-bottom: 4px;
            border-radius: var(--nui-radius-sm);
            transition: filter var(--nui-dur-fast) var(--nui-ease);
            position: relative;
            isolation: isolate;
            overflow: hidden;
        }
        .nui-drawer-section-title:active { filter: brightness(0.9); }

        /* Hides the default browser triangle markers on the accordion */
        details.nui-drawer-section summary::-webkit-details-marker { display: none; }
        details.nui-drawer-section summary { list-style: none; }

        .nui-drawer-item {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 6px; font-size: 18px; font-weight: 400; color: var(--nui-text);
            font-family: var(--nui-font-display); letter-spacing: 0.5px;
            text-decoration: none; border-radius: var(--nui-radius-sm);
            transition: background var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-drawer-item:active { background: var(--nui-surface-2); }
        .nui-drawer-item .nui-drawer-ic { width: 20px; text-align: center; flex-shrink: 0; font-size: 15px; }
        .nui-drawer-item.is-action { color: var(--nui-accent); }
        .nui-drawer-item.is-danger { color: var(--nui-danger); }

        .nui-nav-pill {
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            padding: 8px 12px; border-radius: 999px; border: 1px solid var(--nui-border);
            background: var(--nui-surface-2); color: var(--nui-text); cursor: pointer;
            font-size: 13px; font-weight: 700; flex-shrink: 0; transition: transform var(--nui-dur-fast) var(--nui-ease-snap), background var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-nav-pill:active { transform: scale(0.96); }
        .nui-nav-pill:hover { background: var(--nui-surface); }

        .nui-icon-btn {
            width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--nui-border);
            background: var(--nui-surface-2); color: var(--nui-text); display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 16px; flex-shrink: 0; transition: transform var(--nui-dur-fast) var(--nui-ease-snap), background var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-icon-btn:active { transform: scale(0.92); }
        .nui-icon-btn:hover { background: var(--nui-surface); }

        .nui-drawer-back {
            display: flex; align-items: center; gap: 8px;
            font-weight: 700; font-size: 14px; color: var(--nui-text);
            padding: 6px; margin-bottom: var(--nui-space-3);
            cursor: pointer;
        }

        .nui-theme-grid {
            display: grid; grid-template-columns: repeat(2, 1fr);
            gap: var(--nui-space-3);
        }

        .nui-theme-option {
            position: relative;
            display: flex; flex-direction: column;
            border-radius: var(--nui-radius-md);
            border: 2px solid var(--nui-border);
            background: var(--nui-surface);
            cursor: pointer;
            overflow: hidden;
            box-shadow: 0 2px 8px var(--nui-shadow);
            transition: border-color var(--nui-dur-fast) var(--nui-ease),
                        transform var(--nui-dur-fast) var(--nui-ease-snap),
                        box-shadow var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-theme-option:active { transform: scale(0.97); }
        .nui-theme-option.is-selected {
            border-color: var(--nui-accent);
            box-shadow: 0 0 0 3px var(--nui-accent-soft);
        }

        /* Mini live preview of the theme's own palette, independent of the
           page's CURRENT theme — everything inside .nui-theme-preview-card
           is painted with that theme's own tokens via inline style, not
           var(--nui-*), so it actually shows what the theme looks like
           instead of two abstract dots. */
        .nui-theme-preview {
            position: relative;
            padding: 10px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--nui-border);
        }

        .nui-theme-preview-card {
            display: flex;
            align-items: center;
            gap: 7px;
            width: 100%;
            padding: 8px;
            border-radius: 10px;
            border: 1px solid;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
        }

        .nui-theme-preview-avatar {
            width: 22px; height: 22px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .nui-theme-preview-avatar span {
            width: 10px; height: 10px;
            border-radius: 50%;
        }

        .nui-theme-preview-lines {
            flex: 1; min-width: 0;
            display: flex; flex-direction: column; gap: 4px;
        }
        .nui-theme-preview-lines span {
            display: block; height: 6px; border-radius: 3px;
        }
        .nui-theme-preview-lines span:first-child { width: 72%; }
        .nui-theme-preview-lines span:last-child { width: 44%; }

        .nui-theme-preview-chip {
            width: 22px; height: 13px;
            border-radius: 7px;
            flex-shrink: 0;
        }

        .nui-theme-check {
            position: absolute;
            top: 6px; right: 6px;
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--nui-accent);
            color: var(--nui-accent-ink);
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 800;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
            opacity: 0; transform: scale(0.5);
            transition: opacity var(--nui-dur-fast) var(--nui-ease-snap), transform var(--nui-dur-fast) var(--nui-ease-snap);
        }
        .nui-theme-option.is-selected .nui-theme-check {
            opacity: 1; transform: scale(1);
        }

        .nui-theme-meta {
            display: flex; align-items: center; gap: 8px;
            padding: 9px 10px;
            font-weight: 700; font-size: 13px; color: var(--nui-text);
            background: var(--nui-surface-2);
        }
        .nui-theme-emoji { font-size: 14px; line-height: 1; }
        .nui-theme-label { line-height: 1.15; }
    `;

    // ==========================================================================
    // 4. RUNTIME
    // ==========================================================================

    // ---- NeoGo logo mark (original artwork: stylized "n" + sparkle badge) ----
    // Uses currentColor so it inherits --nui-accent via the button's color.
            const NEOGO_MARK_SVG = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="M13.5 2.5 l2.2 6.2 l6.8 -1.2 l-4.6 5.3 l2.3 6.7 l-7.2 -3.2 l-6.4 4.8 l1.8 -7.1 l-6.2 -4.3 l7.1 -0.8 z"/></svg>';


    // ---- Real Neopets site navigation (desktop #template_nav, mirrored) ----
    // Each section matches the live site's dropdown groupings so the drawer
    // stays a trustworthy map of "the rest of Neopia," not a reinvention of it.
    const DEFAULT_SITE_NAV = [
        {
            title: 'My Account',
            items: [
                { label: 'Control Panel', href: '/myaccount.phtml' },
                { label: 'Preferences', href: '/preferences.phtml' },
                { label: 'Edit Profile', href: '/userinfo.phtml' },
                { label: 'Neomail', href: '/neomessages.phtml' },
                { label: 'Neofriends', href: '/neofriends.phtml' },
                { label: 'Quickref', href: '/quickref.phtml' },
                { label: 'Create a Neopet', href: '/addpet.phtml' },
            ],
        },
        {
            title: 'Shops & Economy',
            items: [
                { label: 'Shop Wizard', href: '/market.phtml?type=wizard' },
                { label: 'Super Shop Wizard ⚡', href: null, action: 'open-ssw' },
                { label: 'Neopia Central', href: '/objects.phtml' },
                { label: 'Your Shop', href: '/market.phtml?type=your' },
                { label: 'Auctions', href: '/auctions.phtml' },
                { label: 'Trading Post', href: '/island/tradingpost.phtml' },
                { label: 'Bank', href: '/bank.phtml' },
            ],
        },
        {
            title: 'Games & Battling',
            items: [
                { label: 'Games Room', href: '/games/' },
                { label: 'Battledome', href: '/dome/' },
                { label: 'Mystery Island Training', href: '/island/training.phtml' },
                { label: 'Ninja Training School', href: '/island/fight_training.phtml' },
                { label: 'Swashbuckling Academy', href: '/pirates/academy.phtml' },
                { label: 'Lab Ray', href: '/lab2.phtml' },
                { label: 'Petpet Lab Ray', href: '/petpetlab.phtml' },
                { label: 'High Scores', href: '/games/hiscores.phtml' },
            ],
        },
        {
            title: 'Customise',
            items: [
                { label: 'Customise Neopet', href: '/customise/' },
                { label: 'Inventory', href: '/inventory.phtml' },
                { label: 'Closet', href: '/closet.phtml' },
                { label: 'Neohomes', href: '/neohome/' },
                { label: 'Pound', href: '/pound/' },
            ],
        },
        {
            title: 'Explore',
            items: [
                { label: 'Map of Neopia', href: '/explore.phtml' },
                { label: 'Neopedia', href: '/neopedia.phtml' },
                { label: 'Pet Central', href: '/petcentral.phtml' },
                { label: 'Calendar', href: '/calendar.phtml' },
                { label: 'Faerie Quests', href: '/quests.phtml' },
            ],
        },
        {
            title: 'Community',
            items: [
                { label: 'Neoboards', href: '/neoboards/index.phtml' },
                { label: 'Guilds', href: '/guilds/index.phtml' },
                { label: 'Community Hub', href: '/community/index.phtml' },
                { label: 'Spotlights', href: '/contests.phtml' },
            ],
        },
        {
            title: 'News & Info',
            items: [
                { label: 'New Features', href: '/nf.phtml' },
                { label: 'Neopian Times', href: '/ntimes/index.phtml' },
                { label: 'Daily Puzzle', href: '/daily.phtml' },
                { label: 'Coming Soon', href: '/comingsoon.phtml' },
            ],
        },
        {
            title: 'Premium',
            items: [
                { label: 'Super Shop Wizard ⚡', href: null, action: 'open-ssw' },
                { label: 'Wheel of Starlight', href: '/premium/wheel.phtml' },
                { label: 'Premium Features', href: '/premium/index.phtml' },
                { label: 'Manage Membership', href: 'https://nc.neopets.com/managemembership/' },
            ],
        },
    ];

    const CUSTOM_NAV_KEY = 'neoui_custom_nav_v1';

    function loadSiteNav() {
        try {
            const raw = localStorage.getItem(CUSTOM_NAV_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return DEFAULT_SITE_NAV;
    }

    function saveSiteNav(nav) {
        try { localStorage.setItem(CUSTOM_NAV_KEY, JSON.stringify(nav)); } catch (e) {}
    }

    function resetSiteNav() {
        try { localStorage.removeItem(CUSTOM_NAV_KEY); } catch (e) {}
    }

    // Keep SITE_NAV as a computed alias for backward compat
    const SITE_NAV = DEFAULT_SITE_NAV;

    function getStoredTheme() {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            return THEMES[v] ? v : DEFAULT_THEME;
        } catch (e) { return DEFAULT_THEME; }
    }

    function persistTheme(name) {
        try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
    }

    // Build the layered background-image value used on .nui-header-wrapper
    // for a given token set. Shared by applyThemeVars() (real theme switch)
    // and the custom-theme editor's live preview (scoped, in-memory tokens),
    // so the preview is guaranteed to match what Save & Apply will produce.
    function buildHeaderBgImage(tk) {
        const texVal = tk['--nui-texture'] && tk['--nui-texture'] !== 'none' ? tk['--nui-texture'] : null;
        const bg = tk['--nui-bg']      || '#f0f0f0';
        const sf = tk['--nui-surface'] || '#ffffff';
        if (texVal) {
            const texLayers = splitTopLevelCommas(texVal);
            return [
                'linear-gradient(to bottom, transparent 30%, ' + bg + ' 100%)',
                ...texLayers,
                'linear-gradient(to bottom, ' + sf + ' 0%, ' + bg + ' 100%)',
            ].join(',\n                ');
        }
        return [
            'linear-gradient(to bottom, transparent 30%, ' + bg + ' 100%)',
            'linear-gradient(to bottom, ' + sf + ' 0%, ' + bg + ' 100%)',
        ].join(',\n                ');
    }

   function applyThemeVars(name) {
        const theme = THEMES[name] || THEMES[DEFAULT_THEME];
        const root = document.documentElement;
        root.setAttribute(ROOT_ATTR, name);
        Object.keys(theme.tokens).forEach(function (key) {
            root.style.setProperty(key, theme.tokens[key]);
        });

        const DYNAMIC_STYLE_ID = 'neoui-style-dynamic-theme';
        let dynStyle = document.getElementById(DYNAMIC_STYLE_ID);
        if (!dynStyle) {
            dynStyle = document.createElement('style');
            dynStyle.id = DYNAMIC_STYLE_ID;
            document.head.appendChild(dynStyle);
        }

        // Map the texture explicitly to all targets to bypass WebKit variable limitations
        const textureTargets = [
            '.nui-topbar::before', '.nui-header-wrapper::before',
            '.nui-drawer::before', '.nui-theme-option::before',
            '.nui-spa-active body::after'
        ].map(sel => `[data-neoui-theme="${name}"] ${sel}`).join(',\n');

        const baseTexture = theme.tokens['--nui-texture'] && theme.tokens['--nui-texture'] !== 'none'
            ? theme.tokens['--nui-texture']
            : 'none';

        dynStyle.textContent =
            textureTargets + ' {\n' +
            '    background-image: ' + baseTexture + ';\n' +
            '}\n' +
            '[data-neoui-theme="' + name + '"] .nui-header-wrapper {\n' +
            '    background-image:\n        ' + buildHeaderBgImage(theme.tokens) + ';\n' +
            '}';
    }

    // Split a CSS gradient list on top-level commas only (ignores commas
    // inside parentheses, which appear inside color-stop and position values).
    function splitTopLevelCommas(str) {
        const parts = [];
        let depth = 0, start = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '(') depth++;
            else if (str[i] === ')') depth--;
            else if (str[i] === ',' && depth === 0) {
                parts.push(str.slice(start, i).trim());
                start = i + 1;
            }
        }
        parts.push(str.slice(start).trim());
        return parts;
    }

    function injectStylesOnce() {
        if (document.getElementById('neoui-style-core')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'neoui-style-core';
        styleEl.textContent = COMPONENT_CSS;
        document.head.appendChild(styleEl);
    }

    function injectViewport() {
    if (document.querySelector('meta[name="viewport"]')) return;
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    // Remove maximum-scale and user-scalable constraints
    meta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(meta);
}


    // Tiny element-builder helper so consuming scripts don't hand-roll
    // innerHTML strings for every component.
    function h(tag, attrs, html) {
        const el = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'class') el.className = attrs[k];
                else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
                    el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
                } else {
                    el.setAttribute(k, attrs[k]);
                }
            });
        }
        if (html !== undefined) el.innerHTML = html;
        return el;
    }

    function mount(el) {
        document.body.appendChild(el);
        return el;
    }

    // ---- Shared legacy-page scraping (same selectors, every module) ----
    // Pulls username / active pet / NP / NC off the classic Neopets header +
    // sidebar before a consuming script does anything destructive to the DOM.
    // Centralized here so every page's topbar+drawer are populated from one
    // implementation instead of each script keeping its own copy in sync.
            function scrapeLegacyProfile() {
        try {
            const profileDropdown = document.querySelector('[id^="navprofiledropdown__"]');
            const petImgDiv = document.querySelector('[id^="navProfilePet__"]');

            const userLink = (profileDropdown && profileDropdown.querySelector('a[href^="/userlookup.phtml?user="]'))
                || document.querySelector('.user a[href^="/userlookup.phtml?user="]');

            const petLink = profileDropdown && profileDropdown.querySelector('a[href^="/petlookup.phtml?pet="]');
            const legacyPetName = document.querySelector('.sidebarHeader a b');

            let petImage = null;
            if (petImgDiv && petImgDiv.style.backgroundImage) {
                const m = petImgDiv.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (m) petImage = m[1].startsWith('//') ? 'https:' + m[1] : m[1];
            }
            if (!petImage) {
                const legacyPetImg = document.querySelector('.activePet img');
                if (legacyPetImg && legacyPetImg.src) petImage = legacyPetImg.src;
            }

            const npEl = document.getElementById('npanchor');
            const ncEl = document.getElementById('ncanchor');

            const notifIcon = document.querySelector('.eventIcon.sf');
            const notifImg = notifIcon && notifIcon.querySelector('img[src]');
            const hasClassicNotif = !!(notifImg && notifImg.getAttribute('src') && !notifImg.getAttribute('src').includes('blank'));
            const modernBadge = document.querySelector('.nav-bell .nav-bell-icon__badge, .nav-bell .bell-badge, [class*="nav-bell"] [class*="badge"], [class*="nav-bell"] [class*="alert"]');
            const hasNotification = hasClassicNotif || !!modernBadge;

            // Extract what we can find on the CURRENT page
            const liveData = {
                username: (userLink && userLink.textContent) ? userLink.textContent.trim() : null,
                petname: (petLink && petLink.textContent) ? petLink.textContent.trim() : ((legacyPetName && legacyPetName.textContent) ? legacyPetName.textContent.trim() : null),
                petImage: petImage,
                np: (npEl && npEl.textContent) ? npEl.textContent.trim() : null,
                nc: (ncEl && ncEl.textContent) ? ncEl.textContent.trim() : null,
                hasNotification: hasNotification
            };

            // Load cache
            let cache = {};
            try { cache = JSON.parse(localStorage.getItem('nui_profile_cache')) || {}; } catch (e) {}

            // Merge live data over cache, falling back to defaults if BOTH are empty
            const finalProfile = {
                username: liveData.username || cache.username || 'Neopian',
                petname: liveData.petname || cache.petname || 'Unknown Pet',
                petImage: liveData.petImage || cache.petImage || 'https://images.neopets.com/themes/h5/basic/images/mystery-icon.png',
                np: liveData.np || cache.np || '0',
                nc: liveData.nc || cache.nc || '0',
                hasNotification: liveData.hasNotification || false // Don't cache notifications
            };

            // Save the newly merged state back to cache
            try { localStorage.setItem('nui_profile_cache', JSON.stringify(finalProfile)); } catch (e) {}

            return finalProfile;

        } catch (err) {
            console.error("NeoUI: Failed to scrape profile.", err);
            return { username: 'Neopian', petname: 'Unknown Pet', petImage: 'https://images.neopets.com/themes/h5/basic/images/mystery-icon.png', np: '0', nc: '0', hasNotification: false };
        }
    }



    // ---- Shared fixed topbar (logo + NeoGo button + NP/NC) ----
    // This is THE topbar markup for the suite. Every page-level module calls
    // this same function so the header looks and behaves identically
    // everywhere, instead of each script hand-rolling its own version.
    // Returns the wrapper element (idempotent - safe to call more than once).
        function openNotificationDrawer() {
        if (document.getElementById('nui-notif-drawer')) return; // Already open

        const backdrop = document.createElement('div');
        backdrop.id = 'nui-notif-drawer';
        backdrop.className = 'nui-drawer-backdrop nui-reset';
        backdrop.style.zIndex = '100000';

                // Slide in from the right with a corrected left-facing shadow
        backdrop.innerHTML = `
            <div class="nui-drawer" style="right: 0; left: auto; transform: translateX(100%); transition: transform var(--nui-dur-slow) var(--nui-ease); box-shadow: -8px 0 24px var(--nui-shadow); border-left: 1px solid var(--nui-border);">
                <iframe src="/allevents.phtml" style="width: 100%; height: 100%; border: none; background: var(--nui-surface);"></iframe>
            </div>
        `;

        document.body.appendChild(backdrop);

        // Trigger animation
        requestAnimationFrame(() => {
            backdrop.classList.add('is-open');
            backdrop.querySelector('.nui-drawer').style.transform = 'translateX(0)';
        });

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.classList.remove('is-open');
                backdrop.querySelector('.nui-drawer').style.transform = 'translateX(100%)';
                setTimeout(() => backdrop.remove(), 300);
            }
        });
    }

        function buildTopbar(opts) {
        opts = opts || {};
        const existing = document.getElementById('nui-page-topbar');

        if (existing) {
            if (opts.stats) {
                const statsEl = existing.querySelector('#nui-topbar-stats');
                if (statsEl) statsEl.innerHTML = 'NP: <b>' + opts.stats.np + '</b> &nbsp; NC: <b>' + opts.stats.nc + '</b>';
            }
            return existing;
        }

        const stats = opts.stats || { np: '0', nc: '0' };
        const wrapper = document.createElement('div');
        wrapper.id = 'nui-page-topbar';
        wrapper.className = 'nui-header-wrapper nui-reset';

        // Only show the red dot if there's a notification
        const dotHtml = opts.hasNotification ? '<div style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: var(--nui-danger); border: 2px solid var(--nui-bg); border-radius: 50%;"></div>' : '';

        // The bell itself is always rendered
        const bellHtml =
            '<button type="button" class="nui-reset" id="nui-notif-btn" style="width: 38px; height: 38px; position: relative; display: flex; align-items: center; justify-content: center; background: var(--nui-surface-2); border: 1px solid var(--nui-border); border-radius: 50%; color: var(--nui-text); cursor: pointer; flex-shrink: 0; transition: transform var(--nui-dur-fast) var(--nui-ease-snap);">' +
                '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>' +
                dotHtml +
            '</button>';

        wrapper.innerHTML =
            '<div class="nui-topbar" style="position: relative;">' +
                '<div style="display:flex; align-items:center; gap:10px; z-index:2;" id="nui-topbar-left-slot"></div>' +
                '<div class="nui-topbar-title" style="position: absolute; left: 50%; transform: translateX(-50%); z-index: 1;">' +
                    '<a href="/home/index.phtml" style="' +
                        'display: block;' +
                        'width: 140px; height: 38px;' +
                        'background-color: var(--nui-accent);' +
                        '-webkit-mask: url(\'https://images.neopets.com/brandhub/5ccf2080/images/Header_25Logo_new.svg\') no-repeat center / contain;' +
                        'mask: url(\'https://images.neopets.com/brandhub/5ccf2080/images/Header_25Logo_new.svg\') no-repeat center / contain;' +
                        'filter: drop-shadow(0 2px 4px var(--nui-shadow));' +
                    '"></a>' +
                '</div>' +
                '<div class="nui-topbar-stats" id="nui-topbar-stats" style="z-index:2;"><a href="/inventory.phtml" style="color:inherit;text-decoration:none;">NP: <b>' + stats.np + '</b></a> &nbsp; NC: <b>' + stats.nc + '</b></div>' +
            '</div>';

        document.body.insertBefore(wrapper, document.body.firstChild);

        const leftSlot = wrapper.querySelector('#nui-topbar-left-slot');
        leftSlot.appendChild(buildNeoGoButton());

        const searchBtn = h('button', { class: 'nui-icon-btn nui-reset', 'aria-label': 'Open global search', type: 'button' }, '🔎');
        searchBtn.addEventListener('click', openGlobalSearchModal);
        leftSlot.appendChild(searchBtn);

        // Always append the bell and bind the iframe drawer
        leftSlot.insertAdjacentHTML('beforeend', bellHtml);

        const bellBtn = wrapper.querySelector('#nui-notif-btn');
        bellBtn.addEventListener('mousedown', () => bellBtn.style.transform = 'scale(0.92)');
        bellBtn.addEventListener('mouseup', () => bellBtn.style.transform = 'scale(1)');
        bellBtn.addEventListener('click', openNotificationDrawer);

        return wrapper;
    }



    const SEARCH_CATALOG = [
        { label: 'Super Shop Wizard', icon: '⚡', action: 'open-ssw', category: 'Premium' },
        { label: 'Wishing Well', icon: '💧', href: '/wishing.phtml', category: 'Dailies' },
        { label: 'Item Transfer Log', icon: '📦', href: '/items/transfer_list.phtml', category: 'Inventory' },
        { label: 'Quickref', icon: '🗺️', href: '/quickref.phtml', category: 'Reference' },
        { label: 'Daily Puzzle', icon: '🧩', href: '/daily.phtml', category: 'Dailies' },
        { label: 'Wheel of Monotony', icon: '🎡', href: '/prehistoric/monotony/monotony.phtml', category: 'Dailies' },
        { label: 'Bank Interest', icon: '🏦', href: '/bank.phtml', category: 'Banking' },
        { label: 'Buried Treasure', icon: '🗺️', href: '/pirates/buriedtreasure/index.phtml', category: 'Dailies' },
        { label: 'The Snowager', icon: '❄️', href: '/winter/snowager.phtml', category: 'Dailies' },
        { label: 'The Lab Ray', icon: '🧪', href: '/lab2.phtml', category: 'Dailies' },
        { label: 'Giant Jelly', icon: '🫧', href: '/jelly/jelly.phtml', category: 'Dailies' },
        { label: 'Fruit Machine', icon: '🎰', href: '/desert/fruitmachine.phtml', category: 'Dailies' },
        { label: 'Tombola', icon: '🎟️', href: '/island/tombola.phtml', category: 'Dailies' },
        { label: "Coltzan's Shrine", icon: '⛏️', href: '/desert/shrine.phtml', category: 'Dailies' },
        { label: 'Games Room', icon: '🕹️', href: '/games/', category: 'Games' },
        { label: 'Daily Tracker', icon: '⏰', action: 'daily-hub', category: 'NeoUI' },
        { label: 'NeoUI Settings', icon: '⚙️', action: 'open-settings', category: 'NeoUI' },
        { label: 'Theme Editor', icon: '🎨', action: 'theme-editor', category: 'NeoUI' },
    ];

    // ---- Premium detection ----
    // Runs before any DOM nuke. Sets a persisted flag so the SSW button shows
    // on every module, not just pages that expose the premium toolbar.
    (function detectPremium() {
        if (document.querySelector('.sswdrop, #premium_bar, .premium-toolbar, .nav-premium-container')) {
            try { localStorage.setItem('neoui_is_premium', '1'); } catch (e) {}
        }
    })();

    function isPremiumUser() {
        try { return localStorage.getItem('neoui_is_premium') === '1'; } catch (e) { return false; }
    }

    // ---- Module toggle system ------------------------------------------------
    // Each toggleable module has a stable ID. Disabled IDs are stored in
    // neoui_disabled_modules. Core, VibeRater, and NickNames are never listed.
    const MODULE_TOGGLE_KEY = 'neoui_disabled_modules';

    const TOGGLEABLE_MODULES = [
        { id: 'neomail',        label: 'Neomail',                    desc: 'Threaded inbox SPA' },
        { id: 'neoboards',      label: 'Neoboards',                  desc: 'Tabbed multi-thread SPA' },
        { id: 'ntimes',         label: 'Neopian Times',              desc: 'Article/comic reader' },
        { id: 'foodclub',       label: 'Food Club',                  desc: 'Bets, odds, history' },
        { id: 'training-mi',    label: 'Training — Mystery Island',  desc: 'MI Training School SPA' },
        { id: 'training-ninja', label: 'Training — Ninja School',    desc: 'Secret Ninja Training SPA' },
        { id: 'training-pirate',label: 'Training — Pirate Academy',  desc: 'Swashbuckling Academy SPA' },
        { id: 'quickref',       label: 'Quickref',                   desc: 'Pet stats overhaul' },
        { id: 'stockmarket',    label: 'Stock Market',               desc: 'Portfolio dashboard' },
        { id: 'coincidence',    label: 'The Coincidence',            desc: 'Coincidence SPA' },
        { id: 'buried-treasure',label: 'Buried Treasure',            desc: 'Map SPA' },
        { id: 'fruit-machine',  label: 'Fruit Machine',              desc: 'Spin SPA' },
        { id: 'coconut-shy',    label: 'Coconut Shy',                desc: 'Coconut Shy wrapper' },
        { id: 'faerie-quests',  label: 'Faerie Quests',              desc: 'Quest watcher + page' },
        { id: 'games',          label: 'Games Room',                 desc: 'Games list + Ruffle wrapper' },
        { id: 'home',           label: 'Home Dashboard',             desc: 'Homepage SPA' },
        { id: 'wishing-well',   label: 'Wishing Well',               desc: 'Wishing Well optimizer' },
        { id: 'item-transfer',  label: 'Item Transfer Log',          desc: 'Transfer log SPA' },
        { id: 'allevents',      label: 'All Events',                 desc: 'Compact events UI' },
    ];

    function getDisabledModules() {
        try {
            const raw = localStorage.getItem(MODULE_TOGGLE_KEY);
            return new Set(raw ? JSON.parse(raw) : []);
        } catch (e) { return new Set(); }
    }

    function setDisabledModules(set) {
        try { localStorage.setItem(MODULE_TOGGLE_KEY, JSON.stringify([...set])); } catch (e) {}
    }

    function isModuleEnabled(id) {
        return !getDisabledModules().has(id);
    }

    // Each section is {id, title, render(container)}. Theme picker ships
    // built-in; consuming apps can push more via NeoUI.registerSettingsSection.
    const settingsSections = [];

    // Register the Modules settings section in Core
    registerSettingsSection({
        id: 'module_toggles',
        title: 'Modules',
        render: function (container) {
            function renderModuleToggles() {
                const disabled = getDisabledModules();
                const existingDetails = container.querySelector('details.nui-drawer-section');
                const wasOpen = existingDetails ? existingDetails.open : false;

                const rows = TOGGLEABLE_MODULES.map(mod => {
                    const on = !disabled.has(mod.id);
                    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--nui-border);gap:8px;">
                        <div style="min-width:0;">
                            <div style="font-size:13px;font-weight:700;color:var(--nui-text);">${mod.label}</div>
                            <div style="font-size:11px;color:var(--nui-text-muted);">${mod.desc}</div>
                        </div>
                        <button type="button" data-mod-toggle="${mod.id}" style="flex-shrink:0;padding:4px 12px;border-radius:var(--nui-radius-pill);border:1px solid;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;background:${on ? 'var(--nui-accent)' : 'var(--nui-surface-2)'};color:${on ? 'var(--nui-accent-ink)' : 'var(--nui-text-muted)'};border-color:${on ? 'var(--nui-accent)' : 'var(--nui-border)'};">${on ? 'On' : 'Off'}</button>
                    </div>`;
                }).join('');

                container.innerHTML = `
                    <details class="nui-drawer-section"${wasOpen ? ' open' : ''}>
                        <summary class="nui-drawer-section-title" style="cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
                            Modules <span style="font-size:10px;opacity:0.5;">▼</span>
                        </summary>
                        <div style="margin-top:12px;display:flex;flex-direction:column;gap:0;">
                            <div style="font-size:12px;color:var(--nui-text-muted);margin-bottom:10px;line-height:1.5;">Toggle modules on or off. Changes take effect on next page load.</div>
                            ${rows}
                        </div>
                    </details>
                `;

                container.querySelectorAll('[data-mod-toggle]').forEach(btn => {
                    btn.addEventListener('click', e => {
                        e.stopPropagation();
                        const id = btn.getAttribute('data-mod-toggle');
                        const d = getDisabledModules();
                        if (d.has(id)) { d.delete(id); } else { d.add(id); }
                        setDisabledModules(d);
                        renderModuleToggles();
                    });
                });
            }
            renderModuleToggles();
        }
    });

    const DAILY_TIMERS_KEY = 'neoui_daily_timers_v1';

    function getDefaultDailyTimers() {
        return [
            { id: 'advent-calendar', label: 'Advent Calendar', icon: '🎁', img: 'https://images.neopets.com/items/fur_mistletoe_wreath.gif', href: '/winter/adventcalendar.phtml', intervalHours: 24.0, note: 'Once a day in December', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'anchor-management', label: 'Anchor Management', icon: '🎁', img: 'https://images.neopets.com/items/fur_pirate_anchor.gif', href: '/pirates/anchormanagement.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'apple-bobbing', label: 'Apple Bobbing', icon: '🎁', img: 'https://images.neopets.com/items/spf_slimy_apple.gif', href: '/halloween/applebobbing.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'bank-interest', label: 'Bank Interest', icon: '🎁', img: 'https://images.neopets.com/items/ltoo_scorch_bank.gif', href: '/bank.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'coltzan-s-shrine', label: 'Coltzan\'s Shrine', icon: '🎁', img: 'https://images.neopets.com/items/bd_desert_deathmask.gif', href: '/desert/shrine.phtml', intervalHours: 13.0, note: 'Once every 13 hours; resets at 12:26 AM', category: 'Timed', timed: true, sourceGroup: 'Freebies' },
            { id: 'council-chamber', label: 'Council Chamber', icon: '🎁', img: 'https://images.neopets.com/items/toy_kingaltador_figure.gif', href: '/altador/council.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'daily-ad-reward', label: 'Daily Ad Reward', icon: '🎁', img: 'https://images.neopets.com/themes/h5/basic/images/watchadreward-icon.png', href: '/home/', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'daily-puzzle', label: 'Daily Puzzle', icon: '🎁', img: 'https://images.neopets.com/events/500neopoints.gif', href: '/community/', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'dark-cave', label: 'Dark Cave', icon: '🎁', img: 'https://images.neopets.com/items/mmat_moltite.gif', href: '/magma/darkcave.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'deadly-dice', label: 'Deadly Dice', icon: '🎁', img: 'https://images.neopets.com/items/bd_vonroo_dice.gif', href: '/worlds/deadlydice.phtml', intervalHours: 24.0, note: 'Once a day, between 12:00am and 1:00am NST', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'deserted-tomb', label: 'Deserted Tomb', icon: '🎁', img: 'https://images.neopets.com/items/bd_ger_goldtalisman.gif', href: '/worlds/geraptiku/tomb.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'faerie-crossword', label: 'Faerie Crossword', icon: '🎁', img: 'https://images.neopets.com/items/fbo_library_tales.gif', href: '/games/crossword/index.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'forgotten-shore', label: 'Forgotten Shore', icon: '🎁', img: 'https://images.neopets.com/items/bg_forgotten_shore.gif', href: '/pirates/forgottenshore.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'fruit-machine', label: 'Fruit Machine', icon: '🎁', img: 'https://images.neopets.com/items/food_desert3.gif', href: '/desert/fruitmachine.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'giant-jelly', label: 'Giant Jelly', icon: '🎁', img: 'https://images.neopets.com/items/jel_cornupepper_whole.gif', href: '/jelly/jelly.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'giant-omelette', label: 'Giant Omelette', icon: '🎁', img: 'https://images.neopets.com/items/om_sausage_pepperoni1.gif', href: '/prehistoric/omelette.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'grave-danger', label: 'Grave Danger', icon: '🎁', img: 'https://images.neopets.com/items/boo_zombiehandbook.gif', href: '/halloween/gravedanger/', intervalHours: 10.0, note: 'Once every 4 to 10 hours', category: 'Timed', timed: true, sourceGroup: 'Freebies' },
            { id: 'grumpy-old-king', label: 'Grumpy Old King', icon: '🎁', img: 'https://images.neopets.com/items/toy_plushie_skarl.gif', href: '/medieval/grumpyking.phtml', intervalHours: 12.0, note: 'Twice a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'guess-the-weight-of-the-marrow', label: 'Guess the Weight of the Marrow', icon: '🎁', img: 'https://images.neopets.com/items/marrow_veg.gif', href: '/medieval/guessmarrow.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'haunted-woods-hunt', label: 'Haunted Woods Hunt', icon: '🎁', img: 'https://images.neopets.com/items/spookyfoo_putridpumpkin.gif', href: '/halloween/haunted_woods_hunt.phtml', intervalHours: 12.0, note: 'Up to twice per day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'healing-springs', label: 'Healing Springs', icon: '🎁', img: 'https://images.neopets.com/items/mag_healing_striped.gif', href: '/faerieland/springs.phtml', intervalHours: 0.5, note: 'Once every 30 minutes', category: 'Timed', timed: true, sourceGroup: 'Freebies' },
            { id: 'kiko-pop', label: 'Kiko Pop', icon: '🎁', img: 'https://images.neopets.com/items/foo_kiko_carmelpopcorn.gif', href: '/worlds/kiko/kpop/', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'lair-of-the-beast', label: 'Lair of the Beast', icon: '🎁', img: 'https://images.neopets.com/items/d8f1a3b609.gif', href: '/prehistoric/thebeast.phtml', intervalHours: 24.0, note: 'Once per day, available after clearing Orion\'s Quest in The Void Within Epilogue', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'lost-in-the-dark', label: 'Lost in the Dark', icon: '🎁', img: 'https://images.neopets.com/items/gwl_empty_lantern.gif', href: '/games/lostinthedark/index.phtml', intervalHours: 12.0, note: 'Up to twice per day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'lunar-temple', label: 'Lunar Temple', icon: '🎁', img: 'https://images.neopets.com/items/fur_lunar_chart.gif', href: '/shenkuu/lunar/', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'meteor', label: 'Meteor', icon: '🎁', img: 'https://images.neopets.com/items/bd_meteor_rock.gif', href: '/moon/meteor.phtml', intervalHours: 1.0, note: 'Once every hour, one prize a day', category: 'Timed', timed: true, sourceGroup: 'Freebies' },
            { id: 'moltara-quarry', label: 'Moltara Quarry', icon: '🎁', img: 'https://images.neopets.com/items/mmat_obsidian.gif', href: '/magma/quarry.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'money-tree', label: 'Money Tree', icon: '🎁', img: 'https://images.neopets.com/items/mini_moneytree.gif', href: '/donations.phtml', intervalHours: 24.0, note: 'Up to 10 items a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'monthly-freebies', label: 'Monthly Freebies', icon: '🎁', img: 'https://images.neopets.com/items/fur_y7_calendar.gif', href: '/freebies/', intervalHours: 24.0, note: 'Once a month', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'mysterious-negg-cave', label: 'Mysterious Negg Cave', icon: '🎁', img: 'https://images.neopets.com/items/gif_fony14_fg_darkmagic.gif', href: '/shenkuu/neggcave/', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'qasalan-expellibox', label: 'Qasalan Expellibox', icon: '🎁', img: 'https://images.neopets.com/items/bat_desert_scarab.gif', href: 'http://ncmall.neopets.com/mall/shop.phtml?page=giveaway', intervalHours: 7.0, note: 'Once every 7 hours 7 minutes', category: 'Timed', timed: true, sourceGroup: 'Freebies' },
            { id: 'rich-slorg-shop-of-offers', label: 'Rich Slorg  (Shop of Offers)', icon: '🎁', img: 'https://images.neopets.com/items/mall_roamingwindslorg.gif', href: '/shop_of_offers.phtml?slorg_payout=yes', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'rubbish-dump', label: 'Rubbish Dump', icon: '🎁', img: 'https://images.neopets.com/items/med_zeenanapeel.gif', href: '/medieval/rubbishdump.phtml', intervalHours: 24.0, note: 'Up to 10 items a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'second-hand-shoppe', label: 'Second-Hand Shoppe', icon: '🎁', img: 'https://images.neopets.com/items/clo_zombie_buzz_shirt.gif', href: '/thriftshoppe/index.phtml', intervalHours: 24.0, note: 'Up to 10 items a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'soup-kitchen', label: 'Soup Kitchen', icon: '🎁', img: 'https://images.neopets.com/items/bd_soupfaerie_soup.gif', href: '/soupkitchen.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Freebies' },
            { id: 'symol-hole', label: 'Symol Hole', icon: '🎁', img: 'https://images.neopets.com/items/symol_brown.gif', href: '/medieval/symolhole.phtml', intervalHours: 1.0, note: '4-minute hourly window; one hour cooldown after trying', category: 'Timed', timed: true, sourceGroup: 'Freebies' },
            { id: 'tarla-s-non-toolbar-treasures', label: 'Tarla\'s Non-Toolbar Treasures', icon: '🎁', img: 'https://images.neopets.com/items/plu_tarla.gif', href: '/freebies/tarlastoolbar.phtml', intervalHours: 24.0, note: 'Once a day, random which days and times', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'the-discarded-magical-blue-grundo-plushie-of-prosperity', label: 'The Discarded Magical Blue Grundo Plushie of Prosperity', icon: '🎁', img: 'https://images.neopets.com/items/plu_TDMBGPOP_replica.gif', href: '/faerieland/tdmbgpop.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'tombola', label: 'Tombola', icon: '🎁', img: 'https://images.neopets.com/items/toy_squeezy_tombola.gif', href: '/island/tombola.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'trudy-s-surprise', label: 'Trudy\'s Surprise', icon: '🎁', img: 'https://images.neopets.com/items/boo_defender_mynci.gif', href: '/trudys_surprise.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'wise-old-king', label: 'Wise Old King', icon: '🎁', img: 'https://images.neopets.com/items/usuki_hagan.gif', href: '/medieval/wiseking.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Freebies' },
            { id: 'ye-olde-fishing-vortex', label: 'Ye Olde Fishing Vortex', icon: '🎁', img: 'https://images.neopets.com/items/vor_evilcarp.gif', href: '/water/fishing.phtml', intervalHours: 24.0, note: 'Random', category: 'Special', sourceGroup: 'Freebies' },
            { id: 'desert-kiosk', label: 'Desert Kiosk', icon: '🎫', img: 'https://images.neopets.com/items/scr_coltzans_cash.gif', href: '/desert/sc/kiosk.phtml', intervalHours: 4.0, note: 'Once every four hours', category: 'Timed', timed: true, sourceGroup: 'Scratchcards' },
            { id: 'haunted-fairgrounds-kiosk', label: 'Haunted Fairgrounds Kiosk', icon: '🎫', img: 'https://images.neopets.com/items/bd_sssidney_tickets.gif', href: '/halloween/scratch.phtml', intervalHours: 2.0, note: 'Once every two hours', category: 'Timed', timed: true, sourceGroup: 'Scratchcards' },
            { id: 'ice-caves-kiosk', label: 'Ice Caves Kiosk', icon: '🎫', img: 'https://images.neopets.com/items/toy_kiosk_plushie.gif', href: '/winter/kiosk.phtml', intervalHours: 6.0, note: 'Once every six hours', category: 'Timed', timed: true, sourceGroup: 'Scratchcards' },
            { id: 'black-pawkeet-slots', label: 'Black Pawkeet Slots', icon: '🕹️', img: 'https://images.neopets.com/items/krawk_pirate.gif', href: '/games/game.phtml?game_id=1099', intervalHours: 0.096, note: '250 times a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'brucey-b-slots', label: 'Brucey B Slots', icon: '🕹️', img: 'https://images.neopets.com/items/plu_advc2013_bruceyb.gif', href: '/games/game.phtml?game_id=1121', intervalHours: 0.096, note: '250 times a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'cosy-campfire-collection', label: 'Cosy Campfire Collection', icon: '🕹️', img: 'https://images.neopets.com/items/spf_angry_marshmallows.gif', href: '/games/cosycampfire/', intervalHours: 12.0, note: 'Up to twice per day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'destruct-o-match-iii', label: 'Destruct O Match III', icon: '🕹️', img: 'https://images.neopets.com/items/foo_destruct_munch.gif', href: '/games/game.phtml?game_id=999', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'dice-a-roo', label: 'Dice-a-Roo', icon: '🕹️', img: 'https://images.neopets.com/items/fur_dice_gold.gif', href: '/games/dicearoo.phtml', intervalHours: 24.0, note: 'Daily until pet is bored', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'doglefetch', label: 'Doglefetch', icon: '🕹️', img: 'https://images.neopets.com/items/r5n36yd833.gif', href: '/games/doglefetch/', intervalHours: 12.0, note: 'Up to twice per day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'dr-landelbrot-s-voidworks', label: 'Dr. Landelbrot\'s Voidworks', icon: '🕹️', img: 'https://images.neopets.com/items/c8m85che0f.gif', href: '/games/voidworks/', intervalHours: 24.0, note: 'Once per day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'dubloon-disaster', label: 'Dubloon Disaster', icon: '🕹️', img: 'https://images.neopets.com/items/gif_dubdis_mine.gif', href: '/games/game.phtml?game_id=772', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'faerie-bubbles', label: 'Faerie Bubbles', icon: '🕹️', img: 'https://images.neopets.com/items/clo_faeriebub_brac.gif', href: '/games/game.phtml?game_id=358', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'fashion-fever', label: 'Fashion Fever', icon: '🕹️', img: 'https://images.neopets.com/items/clo_ff_shirt.gif', href: '/games/game.phtml?game_id=805', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'hasee-bounce', label: 'Hasee Bounce', icon: '🕹️', img: 'https://images.neopets.com/items/toy_haseebounce_set.gif', href: '/games/h5game.phtml?game_id=1393', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'kass-basher', label: 'Kass Basher', icon: '🕹️', img: 'https://images.neopets.com/items/toy_whackakass_home.gif', href: '/games/h5game.phtml?game_id=1310', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'meerca-chase-ii', label: 'Meerca Chase II', icon: '🕹️', img: 'https://images.neopets.com/items/toy_meercachase_pullcart.gif', href: '/games/game.phtml?game_id=500', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'potato-counter', label: 'Potato Counter', icon: '🕹️', img: 'https://images.neopets.com/items/food_potatoe.gif', href: '/games/game.phtml?game_id=158', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'puzzles-of-the-past', label: 'Puzzles of the Past', icon: '🕹️', img: 'https://images.neopets.com/items/toy_fon_jigsawnegg.gif', href: '/games/puzzlesofthepast/', intervalHours: 12.0, note: 'Twice per day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'splat-a-sloth', label: 'Splat-A-Sloth', icon: '🕹️', img: 'https://images.neopets.com/items/stamp_spa_splat.gif', href: '/games/game.phtml?game_id=81', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'turmac-roll', label: 'Turmac Roll', icon: '🕹️', img: 'https://images.neopets.com/items/petpet_turmac.gif', href: '/games/game.phtml?game_id=1392', intervalHours: 8.0, note: 'Three plays a day', category: 'Daily', sourceGroup: 'Popular Games' },
            { id: 'almost-abandoned-attic', label: 'Almost Abandoned Attic', icon: '💰', img: 'https://images.neopets.com/items/fur_cobwebs.gif', href: '/halloween/garage.phtml', intervalHours: 24.0, note: '5 items per day, restock times vary', category: 'Special', sourceGroup: 'Some NP Required' },
            { id: 'bagatelle', label: 'Bagatelle', icon: '💰', img: 'https://images.neopets.com/items/gar_bagatelle.gif', href: '/halloween/bagatelle.phtml', intervalHours: 1.2, note: '20 times a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'buried-treasure', label: 'Buried Treasure', icon: '💰', img: 'https://images.neopets.com/items/mall_jjpb_treasurechesttrinket.gif', href: '/pirates/buriedtreasure/index.phtml', intervalHours: 3.0, note: 'Once every three hours', category: 'Timed', timed: true, sourceGroup: 'Some NP Required' },
            { id: 'cheeseroller', label: 'Cheeseroller', icon: '💰', img: 'https://images.neopets.com/items/med_cheese_0.gif', href: '/medieval/cheeseroller.phtml', intervalHours: 8.0, note: 'Three times a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'coconut-shy', label: 'Coconut Shy', icon: '💰', img: 'https://images.neopets.com/items/spo_coconut_15.gif', href: '/halloween/coconutshy.phtml', intervalHours: 1.2, note: '20 times a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'cork-gun-gallery', label: 'Cork Gun Gallery', icon: '💰', img: 'https://images.neopets.com/items/can_box_fruitbeans.gif', href: '/halloween/corkgun.phtml', intervalHours: 1.2, note: '20 times a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'employment-agency', label: 'Employment Agency', icon: '💰', img: 'https://images.neopets.com/items/purple_ticket.gif', href: '/faerieland/employ/employment.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Some NP Required' },
            { id: 'faerie-caverns', label: 'Faerie Caverns', icon: '💰', img: 'https://images.neopets.com/items/bg_faerie_caverns.gif', href: '/faerieland/caverns/index.phtml', intervalHours: 12.0, note: 'Up to twice per day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'food-club', label: 'Food Club', icon: '💰', img: 'https://images.neopets.com/games/pages/trophies/88_1.png', href: '/pirates/foodclub.phtml?type=bet', intervalHours: 2.4, note: '10 bets per daily round', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'hidden-tower', label: 'Hidden Tower', icon: '💰', img: 'https://images.neopets.com/items/fyora_supreme_doll.gif', href: '/faerieland/hiddentower938.phtml', intervalHours: 24.0, note: 'Can purchase one item every 24 hours', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'igloo-garage-sale', label: 'Igloo Garage Sale', icon: '💰', img: 'https://images.neopets.com/items/gar_igloo.gif', href: '/winter/igloo.phtml', intervalHours: 2.4, note: '10 items per day, restock times vary', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'lever-of-doom', label: 'Lever of Doom', icon: '💰', img: 'https://images.neopets.com/items/coi_leverofdoom.gif', href: '/space/strangelever.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Some NP Required' },
            { id: 'neolodge', label: 'Neolodge', icon: '💰', img: 'https://images.neopets.com/items/fur_fyorabed.gif', href: '/neolodge.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Some NP Required' },
            { id: 'neopian-lottery', label: 'Neopian Lottery', icon: '💰', img: 'https://images.neopets.com/games/clicktoplay/icon_58.gif', href: '/games/lottery.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'pick-your-own', label: 'Pick Your Own', icon: '💰', img: 'https://images.neopets.com/items/4clover.gif', href: '/medieval/pickyourown_index.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'poogle-racing', label: 'Poogle Racing', icon: '💰', img: 'https://images.neopets.com/items/toy_poogle_blue.gif', href: '/faerieland/poogleracing.phtml', intervalHours: 0.25, note: 'Once every 15 minutes', category: 'Timed', timed: true, sourceGroup: 'Some NP Required' },
            { id: 'stock-market-bargain-list', label: 'Stock Market - Bargain List', icon: '💰', img: 'https://images.neopets.com/games/game_stocks.gif', href: '/stockmarket.phtml?type=list&search=%&bargain=true', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Some NP Required' },
            { id: 'stock-market-portfolio', label: 'Stock Market - Portfolio', icon: '💰', img: 'https://images.neopets.com/games/game_stocks.gif', href: '/stockmarket.phtml?type=portfolio', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Some NP Required' },
            { id: 'tarla-s-shop-of-mystery', label: 'Tarla\'s Shop of Mystery', icon: '💰', img: 'https://images.neopets.com/items/toy_tarla_squirty.gif', href: '/winter/shopofmystery.phtml', intervalHours: 24.0, note: 'Restock times vary', category: 'Special', sourceGroup: 'Some NP Required' },
            { id: 'test-your-strength', label: 'Test Your Strength', icon: '💰', img: 'https://images.neopets.com/items/gar_testyourstrength.gif', href: '/halloween/strtest/index.phtml', intervalHours: 6.0, note: 'Once every six hours', category: 'Timed', timed: true, sourceGroup: 'Some NP Required' },
            { id: 'turdle-racing', label: 'Turdle Racing', icon: '💰', img: 'https://images.neopets.com/items/pet_turdle.gif', href: '/medieval/turdleracing.phtml', intervalHours: 8.0, note: 'Three times a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'tyrannian-ticket-booth', label: 'Tyrannian Ticket Booth', icon: '💰', img: 'https://images.neopets.com/items/ticket_mmband.gif', href: '/prehistoric/ticketbooth.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'wishing-well', label: 'Wishing Well', icon: '💰', img: 'https://images.neopets.com/items/stamp_neo_well.gif', href: '/wishing.phtml', intervalHours: 24.0, note: 'Seven wishes per 12-hour window', category: 'Daily', sourceGroup: 'Some NP Required' },
            { id: 'brain-tree-quests', label: 'Brain Tree Quests', icon: '📜', img: 'https://images.neopets.com/items/toy_brain1.gif', href: '/halloween/braintree.phtml', intervalHours: 24.0, note: 'Once every 24 hours', category: 'Timed', timed: true, sourceGroup: 'Quests' },
            { id: 'edna-s-quests', label: 'Edna\'s Quests', icon: '📜', img: 'https://images.neopets.com/items/toy_plushie_edna.gif', href: '/halloween/witchtower.phtml', intervalHours: 2.4, note: '10 times a day', category: 'Daily', sourceGroup: 'Quests' },
            { id: 'esophagor-s-quests', label: 'Esophagor\'s Quests', icon: '📜', img: 'https://images.neopets.com/items/mall_miniesophagor.gif', href: '/halloween/esophagor.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Quests' },
            { id: 'faerie-quests', label: 'Faerie Quests', icon: '📜', img: 'https://images.neopets.com/items/toy_faerie_princess.gif', href: '/quests.phtml', intervalHours: 24.0, note: 'Randomly given out', category: 'Special', sourceGroup: 'Quests' },
            { id: 'illusen-s-glade', label: 'Illusen\'s Glade', icon: '📜', img: 'https://images.neopets.com/items/toy_faerie_illusen.gif', href: '/medieval/earthfaerie.phtml', intervalHours: 12.0, note: 'Once every 12 hours', category: 'Timed', timed: true, sourceGroup: 'Quests' },
            { id: 'jhudora-s-bluff', label: 'Jhudora\'s Bluff', icon: '📜', img: 'https://images.neopets.com/items/toy_faerie_jhudora.gif', href: '/faerieland/darkfaerie.phtml', intervalHours: 12.0, note: 'Once every 12 hours', category: 'Timed', timed: true, sourceGroup: 'Quests' },
            { id: 'kitchen-quests', label: 'Kitchen Quests', icon: '📜', img: 'https://images.neopets.com/items/toy_kitchenquest_flotsam.gif', href: '/island/kitchen.phtml', intervalHours: 2.4, note: '10 times a day', category: 'Daily', sourceGroup: 'Quests' },
            { id: 'quest-log', label: 'Quest Log', icon: '📜', img: 'https://images.neopets.com/items/toy_hannah_action.gif', href: '/questlog/', intervalHours: 24.0, note: 'Daily', category: 'Daily', sourceGroup: 'Quests' },
            { id: 'taelia-s-quests', label: 'Taelia\'s Quests', icon: '📜', img: 'https://images.neopets.com/items/toy_faerie_snow.gif', href: '/winter/snowfaerie.phtml', intervalHours: 2.4, note: '10 times a day', category: 'Daily', sourceGroup: 'Quests' },
            { id: 'tea-time-with-tavi', label: 'Tea Time with Tavi', icon: '📜', img: 'https://images.neopets.com/items/plu_tavi.gif', href: '/games/teatime/', intervalHours: 4.8, note: '5 times a day', category: 'Daily', sourceGroup: 'Quests' },
            { id: 'the-coincidence', label: 'The Coincidence', icon: '📜', img: 'https://images.neopets.com/items/rpp_reu2014_robotassispetpet.gif', href: '/space/coincidence.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Quests' },
            { id: 'battledome', label: 'Battledome', icon: '🗺️', img: 'https://images.neopets.com/items/bd_spirit_blade.gif', href: '/dome/', intervalHours: 24.0, note: 'Anytime, 15 items per day', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'favourite-games', label: 'Favourite Games', icon: '🗺️', img: 'https://images.neopets.com/items/boo_dd_ilovegames.gif', href: '/games/favourites.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'games-room', label: 'Games Room', icon: '🗺️', img: 'https://images.neopets.com/items/mall_bckground_arcade2010gmc.gif', href: '/games/', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'haiku-generator', label: 'Haiku Generator', icon: '🗺️', img: 'https://images.neopets.com/items/toy_plushie_rorru.gif', href: '/island/haiku/haiku.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Other Places' },
            { id: 'island-mystic', label: 'Island Mystic', icon: '🗺️', img: 'https://images.neopets.com/items/toy_plushie_mystic.gif', href: '/island/mystichut.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Other Places' },
            { id: 'lab-ray', label: 'Lab Ray', icon: '🗺️', img: 'https://images.neopets.com/items/labmap_09.gif', href: '/lab.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Other Places' },
            { id: 'magma-pool', label: 'Magma Pool', icon: '🗺️', img: 'https://images.neopets.com/items/bg_magma_pool.gif', href: '/magma/pool.phtml', intervalHours: 192.0, note: 'Once every 8 days', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'mystery-island-training-school', label: 'Mystery Island Training School', icon: '🗺️', img: 'https://images.neopets.com/items/bg_mystery_training.gif', href: '/island/training.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'new-features', label: 'New Features', icon: '🗺️', img: 'https://images.neopets.com/items/fur_ntpaperrack.gif', href: '/nf.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'petpet-lab-ray', label: 'Petpet Lab Ray', icon: '🗺️', img: 'https://images.neopets.com/items/petpetlab_soot.gif', href: '/petpetlab.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Other Places' },
            { id: 'quick-reference', label: 'Quick Reference', icon: '🗺️', img: 'https://images.neopets.com/items/tornado_ring.gif', href: '/quickref.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'secret-ninja-training-school', label: 'Secret Ninja Training School', icon: '🗺️', img: 'https://images.neopets.com/items/nin_smoke_bomb.gif', href: '/island/fight_training.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'smuggler-s-cove', label: 'Smuggler\'s Cove', icon: '🗺️', img: 'https://images.neopets.com/items/toy_smugglers_cove.gif', href: '/pirates/smugglerscove.phtml', intervalHours: 24.0, note: 'Random', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'snowager', label: 'Snowager', icon: '🗺️', img: 'https://images.neopets.com/items/toy_snowager_plushie.gif', href: '/winter/snowager.phtml', intervalHours: 24.0, note: 'Once per time slot: 6-7am NST, 2-3pm NST, 10-11pm NST', category: 'Daily', sourceGroup: 'Other Places' },
            { id: 'swashbuckling-academy', label: 'Swashbuckling Academy', icon: '🗺️', img: 'https://images.neopets.com/items/toy_pirate_cutlass.gif', href: '/pirates/academy.phtml', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'the-kadoatery', label: 'The Kadoatery', icon: '🗺️', img: 'https://images.neopets.com/items/kadoatie_pink.gif', href: '/games/kadoatery/index.phtml?', intervalHours: 24.0, note: 'Random', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'turmaculus', label: 'Turmaculus', icon: '🗺️', img: 'https://images.neopets.com/items/toy_turmaculus_figure.gif', href: '/medieval/turmaculus.phtml', intervalHours: 24.0, note: 'Once a day, during predicted times', category: 'Daily', sourceGroup: 'Other Places' },
            { id: 'tyrannian-battleground', label: 'Tyrannian Battleground', icon: '🗺️', img: 'https://images.neopets.com/items/bd_tyweof2013_itsashovel.gif', href: '/prehistoric/battleground/', intervalHours: 24.0, note: 'Two-week rotation, 3 days to sign up, 4 days to battle, 7 days of boons', category: 'Daily', sourceGroup: 'Other Places' },
            { id: 'your-shop-till', label: 'Your Shop Till', icon: '🗺️', img: 'https://images.neopets.com/items/broken_bag_np.gif', href: '/market.phtml?type=till', intervalHours: 24.0, note: 'Anytime', category: 'Special', sourceGroup: 'Other Places' },
            { id: 'wheel-of-excitement', label: 'Wheel of Excitement', icon: '🎡', img: 'https://images.neopets.com/items/toy_faerie_light.gif', href: '/faerieland/wheel.phtml', intervalHours: 2.0, note: 'Once every two hours', category: 'Timed', timed: true, sourceGroup: 'Wheels' },
            { id: 'wheel-of-extravagance', label: 'Wheel of Extravagance', icon: '🎡', img: 'https://images.neopets.com/items/sta_wheel_of_extravagance.gif', href: '/desert/extravagance.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Wheels' },
            { id: 'wheel-of-knowledge', label: 'Wheel of Knowledge', icon: '🎡', img: 'https://images.neopets.com/items/toy_bv_wheelofknowledge.gif', href: '/medieval/knowledge.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Wheels' },
            { id: 'wheel-of-mediocrity', label: 'Wheel of Mediocrity', icon: '🎡', img: 'https://images.neopets.com/items/toy_action_plesio.gif', href: '/prehistoric/mediocrity.phtml', intervalHours: 0.667, note: 'Once every 40 minutes', category: 'Timed', timed: true, sourceGroup: 'Wheels' },
            { id: 'wheel-of-misfortune', label: 'Wheel of Misfortune', icon: '🎡', img: 'https://images.neopets.com/items/gar_wheelmisfortune.gif', href: '/halloween/wheel/index.phtml', intervalHours: 2.0, note: 'Once every two hours', category: 'Timed', timed: true, sourceGroup: 'Wheels' },
            { id: 'wheel-of-monotony', label: 'Wheel of Monotony', icon: '🎡', img: 'https://images.neopets.com/items/toy_monotony_plushie.gif', href: '/prehistoric/monotony/monotony.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Wheels' },
            { id: 'wheel-of-starlight-premium-only', label: 'Wheel of Starlight (Premium Only)', icon: '🎡', img: 'https://images.neopets.com/items/185mjdi5jd.gif', href: '/premium/wheel.phtml', intervalHours: 24.0, note: 'Once a day', category: 'Daily', sourceGroup: 'Wheels' },
        ];
    }

    function normalizeDailyTimers(items) {
        const defaults = getDefaultDailyTimers();
        const byId = {};
        defaults.forEach(function (item) { byId[item.id] = item; });
        const saved = Array.isArray(items) ? items : [];
        return defaults.map(function (item) {
            const found = saved.find(function (entry) { return entry && entry.id === item.id; });
            const nextAt = found && found.nextAt ? found.nextAt : Date.now() + item.intervalHours * 60 * 60 * 1000;
            return Object.assign({}, item, found || {}, { nextAt: nextAt });
        });
    }

    function normalizeSearchText(value) {
        return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function buildSiteSearchCatalog() {
        const items = [];
        const seen = {};
        const addItem = function (item) {
            const key = (item.label || '') + '|' + (item.href || '') + '|' + (item.action || '');
            const normalized = normalizeSearchText(key);
            if (!normalized || seen[normalized]) return;
            seen[normalized] = true;
            items.push(item);
        };

        SEARCH_CATALOG.forEach(addItem);

        // The hard-coded SEARCH_CATALOG above is tiny; the real "sitewide"
        // coverage comes from the full dailies list (~120 real neopets.com
        // destinations), so search finds them by name no matter what page
        // you're currently on — not just the handful of links visible here.
        // Hidden dailies are still searchable (hiding only affects the hub).
        try {
            normalizeDailyTimers(loadDailyTimers()).forEach(function (t) {
                addItem({ label: t.label, icon: t.icon, href: t.href, category: (t.sourceGroup || 'Dailies'), note: t.note });
            });
        } catch (e) {}

        Array.prototype.forEach.call(document.querySelectorAll('a[href], button, [role="button"]'), function (el) {
            const href = el.getAttribute('href') || el.getAttribute('data-href') || '';
            const label = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
            if (!label) return;
            if (href && href.indexOf('#') === 0) return;
            addItem({ label: label, icon: '🔗', href: href || null, category: 'This page' });
        });

        if (location.pathname && location.pathname !== '/') {
            addItem({ label: 'Open current page', icon: '📍', href: location.pathname, category: 'Current page' });
        }

        // No cap here — the caller filters by query and slices to a
        // reasonable on-screen count, but capping earlier would silently
        // drop dailies/pages from the pool before the person even searches.
        return items;
    }

    function loadDailyTimers() {
        try {
            const raw = localStorage.getItem(DAILY_TIMERS_KEY);
            if (!raw) return normalizeDailyTimers([]);
            const parsed = JSON.parse(raw);
            return normalizeDailyTimers(Array.isArray(parsed) ? parsed : []);
        } catch (e) { return normalizeDailyTimers([]); }
    }

    function saveDailyTimers(items) {
        try { localStorage.setItem(DAILY_TIMERS_KEY, JSON.stringify(items)); } catch (e) {}
    }

    function sortDailyTimers(items) {
        return items.slice().sort(function (a, b) { return (a.nextAt || 0) - (b.nextAt || 0); });
    }

    function formatCountdown(timestamp) {
        const diff = Math.max(0, timestamp - Date.now());
        if (!diff) return 'Ready now';
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        if (hrs >= 24) return Math.floor(hrs / 24) + 'd ' + (hrs % 24) + 'h';
        if (hrs) return hrs + 'h ' + mins + 'm';
        return mins + 'm';
    }

    function getDailyHubSummary(items) {
        const visible = items.filter(function (item) { return !item.hidden; });
        if (!visible.length) return 'All dailies are hidden.';
        const ready = visible.filter(function (item) { return (item.nextAt || 0) <= Date.now(); }).length;
        const upcoming = visible.length - ready;
        if (!ready) return 'Next up: ' + visible[0].label;
        if (ready === visible.length) return 'Everything is ready now.';
        return ready + ' ready • ' + upcoming + ' upcoming';
    }

    function openDayTimerHub() {
        const timers = normalizeDailyTimers(loadDailyTimers());
        const summary = getDailyHubSummary(timers);
        let showHidden = false;
        const backdrop = document.createElement('div');
        backdrop.id = 'nui-daily-hub';
        backdrop.className = 'nui-drawer-backdrop nui-reset is-open';
        backdrop.style.zIndex = '100010';
        backdrop.innerHTML = '<div class="nui-drawer" style="left: 0; right: auto; transform: translateX(-100%); transition: transform var(--nui-dur-slow) var(--nui-ease); box-shadow: 8px 0 24px var(--nui-shadow); border-right: 1px solid var(--nui-border); width: min(92vw, 420px);"><div style="padding: 10px var(--nui-space-4); border-bottom: 1px solid var(--nui-border); background: linear-gradient(135deg, var(--nui-accent-soft), var(--nui-surface-2));"><div style="display:flex; justify-content:space-between; align-items:center; gap:10px;"><div style="min-width:0;"><div style="font-size: 15px; font-weight: 800; color: var(--nui-text); line-height:1.2;">📅 Dailies</div><div style="font-size: 11px; color: var(--nui-text-muted); margin-top: 2px;">' + summary + '</div></div><div style="font-size: 10px; padding: 3px 7px; border-radius: var(--nui-radius-pill); background: var(--nui-surface); color: var(--nui-accent); font-weight: 700; flex-shrink:0;">NeoUI</div></div><div style="margin-top: 8px; display:flex; gap:6px;"><input id="nui-daily-filter" type="text" placeholder="Search dailies" style="flex:1; min-width:0; padding: 7px 10px; font-size: 13px; border-radius: var(--nui-radius-sm); border: 1px solid var(--nui-border); background: var(--nui-surface); color: var(--nui-text);" /><button type="button" id="nui-daily-toggle-hidden" title="Show hidden dailies" style="flex-shrink:0; font-size:11px; font-weight:700; padding:0 10px; border-radius: var(--nui-radius-sm); border: 1px solid var(--nui-border); background: var(--nui-surface); color: var(--nui-text-muted); cursor:pointer; white-space:nowrap;">🙈 0</button></div></div><div id="nui-daily-hub-body" style="padding: 8px var(--nui-space-3); display: flex; flex-direction: column; gap: 4px; overflow-y: auto; height: calc(100% - 92px);"></div></div>';
        document.body.appendChild(backdrop);
        requestAnimationFrame(function () {
            backdrop.classList.add('is-open');
            backdrop.querySelector('.nui-drawer').style.transform = 'translateX(0)';
        });
        function render(filter) {
            const body = backdrop.querySelector('#nui-daily-hub-body');
            const q = normalizeSearchText(filter || '');
            body.innerHTML = '';

            const hiddenCount = timers.filter(function (item) { return item.hidden; }).length;
            const toggleBtn = backdrop.querySelector('#nui-daily-toggle-hidden');
            if (toggleBtn) {
                toggleBtn.textContent = '🙈 ' + hiddenCount;
                toggleBtn.style.background = showHidden ? 'var(--nui-accent-soft)' : 'var(--nui-surface)';
                toggleBtn.style.color = showHidden ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                toggleBtn.title = showHidden ? 'Showing hidden dailies — tap to hide them again' : (hiddenCount ? 'Show ' + hiddenCount + ' hidden daily/dailies' : 'No hidden dailies yet');
            }

            const groups = { Daily: [], Timed: [], Seasonal: [], Special: [] };
            timers.filter(function (item) {
                if (!showHidden && item.hidden) return false;
                if (!q) return true;
                const hay = normalizeSearchText([item.label, item.note || '', item.category || '', item.sourceGroup || ''].join(' '));
                return hay.indexOf(q) !== -1;
            }).forEach(function (item) {
                const bucket = groups[item.category] || groups.Daily;
                bucket.push(item);
            });
            ['Daily', 'Timed', 'Seasonal', 'Special'].forEach(function (category) {
                const items = groups[category];
                if (!items || !items.length) return;
                // Soonest reset first, so the thing worth checking next is
                // always at the top of its section.
                const sorted = items.slice().sort(function (a, b) { return (a.nextAt || 0) - (b.nextAt || 0); });
                const readyCount = sorted.filter(function (item) { return !item.hidden && (item.nextAt || 0) <= Date.now(); }).length;

                const details = document.createElement('details');
                details.className = 'nui-drawer-section';
                details.style.cssText = 'margin: 0;';
                details.open = true;

                const summary = document.createElement('summary');
                summary.className = 'nui-drawer-section-title';
                summary.style.cssText = 'cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center; padding:6px 4px;';
                summary.innerHTML = '<span style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.6px; color:var(--nui-text-faint);">' + category + ' · ' + sorted.length + (readyCount ? ' <span style="color:var(--nui-success);">· ' + readyCount + ' ready</span>' : '') + '</span><span style="font-size:10px; opacity:0.5;">▼</span>';
                details.appendChild(summary);

                const list = document.createElement('div');
                list.style.cssText = 'display:flex; flex-direction:column;';

                sorted.forEach(function (item) {
                    const isReady = (item.nextAt || 0) <= Date.now();
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; align-items:center; gap:6px; padding:7px 4px; border-bottom:1px solid var(--nui-border);' + (item.hidden ? ' opacity:0.5;' : '');
                    row.innerHTML = [
                        '<span style="font-size:17px; width:20px; text-align:center; flex-shrink:0;">' + item.icon + '</span>',
                        '<div style="min-width:0; flex:1; display:flex; flex-direction:column; gap:0;">',
                        '<span style="font-weight:700; font-size:13px; color:var(--nui-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + item.label + '</span>',
                        '<span style="font-size:11px; color:var(--nui-text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + (item.note || item.sourceGroup || category) + '</span>',
                        '</div>',
                        isReady ? '<span style="font-size:10.5px; font-weight:700; padding:3px 6px; border-radius:var(--nui-radius-pill); background:var(--nui-success-soft); color:var(--nui-success); flex-shrink:0; white-space:nowrap;">Ready</span>' : '',
                        '<button type="button" class="nui-icon-btn" data-act="go" data-href="' + item.href + '" title="Open" style="width:24px; height:24px; font-size:12px; flex-shrink:0;">↗</button>',
                        '<button type="button" class="nui-icon-btn" data-act="edit" data-id="' + item.id + '" title="Edit name/note" style="width:24px; height:24px; font-size:12px; flex-shrink:0;">✏️</button>',
                        '<button type="button" class="nui-icon-btn" data-act="hide" data-id="' + item.id + '" title="' + (item.hidden ? 'Unhide' : 'Hide from list') + '" style="width:24px; height:24px; font-size:12px; flex-shrink:0;">' + (item.hidden ? '👁️' : '🙈') + '</button>',
                        item.hidden ? '' : '<button type="button" class="nui-icon-btn" data-act="done" data-id="' + item.id + '" title="Mark done" style="width:24px; height:24px; font-size:12px; flex-shrink:0;">✓</button>'
                    ].join('');
                    list.appendChild(row);
                });

                details.appendChild(list);
                body.appendChild(details);
            });
            if (!body.children.length) {
                body.innerHTML = '<div style="padding: 12px 4px; color: var(--nui-text-muted); font-size: 13px;">No matches. Try a different keyword' + (hiddenCount && !showHidden ? ', or tap 🙈 above to see hidden dailies' : '') + '.</div>';
            }
            body.querySelectorAll('[data-act="go"]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const href = this.getAttribute('data-href');
                    if (href) window.location.assign(href);
                });
            });
            body.querySelectorAll('[data-act="done"]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const next = timers.find(function (item) { return item.id === id; });
                    if (next) {
                        next.nextAt = Date.now() + next.intervalHours * 60 * 60 * 1000;
                        saveDailyTimers(timers);
                        render(backdrop.querySelector('#nui-daily-filter').value);
                    }
                });
            });
            body.querySelectorAll('[data-act="hide"]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const next = timers.find(function (item) { return item.id === id; });
                    if (next) {
                        next.hidden = !next.hidden;
                        saveDailyTimers(timers);
                        render(backdrop.querySelector('#nui-daily-filter').value);
                    }
                });
            });
            body.querySelectorAll('[data-act="edit"]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const next = timers.find(function (item) { return item.id === id; });
                    if (!next) return;
                    // Freeform text is intentional here — any label/note the
                    // person types is accepted as-is and persisted verbatim,
                    // including blank/odd entries. Cancel leaves it untouched.
                    const newLabel = window.prompt('Name for this daily:', next.label);
                    if (newLabel === null) return;
                    const newNote = window.prompt('Short note (shown under the name):', next.note || '');
                    if (newNote === null) { // still apply the label change even if note prompt was cancelled
                        next.label = newLabel.trim() ? newLabel : next.label;
                        saveDailyTimers(timers);
                        render(backdrop.querySelector('#nui-daily-filter').value);
                        return;
                    }
                    next.label = newLabel.trim() ? newLabel : next.label;
                    next.note = newNote;
                    saveDailyTimers(timers);
                    render(backdrop.querySelector('#nui-daily-filter').value);
                });
            });
        }
        const filterInput = backdrop.querySelector('#nui-daily-filter');
        filterInput.addEventListener('input', function () { render(this.value); });
        const toggleHiddenBtn = backdrop.querySelector('#nui-daily-toggle-hidden');
        toggleHiddenBtn.addEventListener('click', function () {
            showHidden = !showHidden;
            render(filterInput.value);
        });
        render('');
        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) {
                backdrop.querySelector('.nui-drawer').style.transform = 'translateX(-100%)';
                backdrop.classList.remove('is-open');
                setTimeout(function () { backdrop.remove(); }, 300);
            }
        });
        const esc = function (e) { if (e.key === 'Escape') { backdrop.remove(); document.removeEventListener('keydown', esc); } };
        document.addEventListener('keydown', esc);
    }

    function isEditingTextTarget(target) {
        if (!target) return false;
        const tag = (target.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
    }

    function openGlobalSearchModal() {
        const existing = document.getElementById('nui-global-search');
        if (existing) { existing.remove(); return; }
        const backdrop = document.createElement('div');
        backdrop.id = 'nui-global-search';
        backdrop.className = 'nui-drawer-backdrop nui-reset is-open';
        backdrop.style.zIndex = '100011';
        backdrop.innerHTML = '<div class="nui-surface" style="width:min(92vw, 520px); max-height:84vh; border-radius:var(--nui-radius-lg); border:1px solid var(--nui-border); overflow:hidden; box-shadow:0 18px 48px rgba(0,0,0,0.26); display:flex; flex-direction:column;">' +
            '<div style="padding:var(--nui-space-4); border-bottom:1px solid var(--nui-border); background:var(--nui-surface-2);"><div style="font-size:18px; font-weight:800; color:var(--nui-text);">🔎 Sitewide Search</div><input id="nui-search-input" type="text" placeholder="Search pages, tools, and dailies" style="margin-top:10px; width:100%; padding:8px 10px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface); color:var(--nui-text);" /></div>' +
            '<div id="nui-search-results" style="padding:10px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;"></div>' +
        '</div>';
        document.body.appendChild(backdrop);
        const input = backdrop.querySelector('#nui-search-input');
        const results = backdrop.querySelector('#nui-search-results');
        function renderSiteSearchBtn(query) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'nui-reset';
            btn.style.cssText = 'display:flex; align-items:center; justify-content:space-between; width:100%; padding:10px 12px; border-radius:var(--nui-radius-sm); border:1px dashed var(--nui-border); background:var(--nui-surface-2); color:var(--nui-text); text-align:left; cursor:pointer; margin-top:4px;';
            const label = query ? '\u{1F310} Search Neopets.com for \u201C' + query + '\u201D' : '\u{1F310} Search Neopets.com\u2026';
            btn.innerHTML = '<span style="display:flex; flex-direction:column; gap:2px; min-width:0;"><span style="font-weight:700;">' + label + '</span><span style="font-size:12px; color:var(--nui-text-muted);">Neopets site search</span></span><span style="font-size:12px; color:var(--nui-text-muted);">Go</span>';
            btn.addEventListener('click', function () {
                const enc = encodeURIComponent(query || '');
                window.location.assign('/search.phtml?selected_type=item&search_string=' + enc);
                backdrop.remove();
            });
            return btn;
        }

        function render(query) {
            const q = normalizeSearchText(query);
            const filtered = buildSiteSearchCatalog().filter(function (item) {
                if (!q) return true;
                const hay = normalizeSearchText([item.label, item.category, item.href || '', item.action || '', item.note || ''].join(' '));
                return hay.indexOf(q) !== -1;
            }).slice(0, 24);
            results.innerHTML = '';
            if (!filtered.length) {
                const msg = document.createElement('div');
                msg.style.cssText = 'padding:16px 8px; color:var(--nui-text-muted); font-size:13px;';
                msg.textContent = 'No local matches. Try searching Neopets.com directly:';
                results.appendChild(msg);
                results.appendChild(renderSiteSearchBtn(query));
                return;
            }
            filtered.forEach(function (item) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'nui-reset';
                btn.style.cssText = 'display:flex; align-items:center; justify-content:space-between; width:100%; padding:10px 12px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface); color:var(--nui-text); text-align:left; cursor:pointer;';
                btn.innerHTML = '<span style="display:flex; flex-direction:column; gap:2px; min-width:0;"><span style="font-weight:700;">' + item.icon + ' ' + item.label + '</span><span style="font-size:12px; color:var(--nui-text-muted);">' + (item.category || 'Go') + '</span></span><span style="font-size:12px; color:var(--nui-text-muted);">' + (item.href ? 'Open' : 'Go') + '</span>';
                btn.addEventListener('click', function () {
                    if (item.action === 'theme-editor') { openThemeEditorModal(); }
                    else if (item.action === 'daily-hub') { openDayTimerHub(); }
                    else if (item.action === 'open-ssw') { backdrop.remove(); openGlobalSSW(input.value.trim()); }
                    else if (item.action === 'open-settings') { openDrawer(); setTimeout(function () { var settingBtn = document.querySelector('[data-action="open-settings"]'); if (settingBtn) settingBtn.click(); }, 80); }
                    else if (item.href) { window.location.assign(item.href); }
                    else backdrop.remove();
                    if (item.action !== 'open-ssw') backdrop.remove();
                });
                results.appendChild(btn);
            });
            // Always append Neopets.com site search at the bottom when there is a query
            if (q) results.appendChild(renderSiteSearchBtn(query));
        }
        render('');
        input.addEventListener('input', function () { render(this.value); });
        backdrop.addEventListener('click', function (e) { if (e.target === backdrop) { backdrop.remove(); } });
        input.addEventListener('keydown', function (e) { if (e.key === 'Escape') backdrop.remove(); });
        input.focus();
    }

    // ---- Global Super Shop Wizard ----
    // Single implementation in Core — modules reference window.NeoUI.openSSW
    // so we don't have three copies of the same 80-line function.
    function openGlobalSSW(itemName) {
        itemName = (itemName || '').trim();
        const backdrop = document.createElement('div');
        backdrop.className = 'nui-drawer-backdrop nui-reset is-open';
        backdrop.style.cssText = 'position:fixed;inset:0;z-index:100000;background:var(--nui-overlay);display:flex;align-items:center;justify-content:center;padding:var(--nui-space-4);';

        const modal = document.createElement('div');
        modal.className = 'nui-surface';
        modal.style.cssText = 'width:100%;max-width:520px;border-radius:var(--nui-radius-lg);border:1px solid var(--nui-border);box-shadow:0 10px 40px rgba(0,0,0,0.5);display:flex;flex-direction:column;overflow:hidden;transform:scale(0.95);opacity:0;transition:all var(--nui-dur-fast) var(--nui-ease-snap);';

        function closeModal() {
            modal.style.transform = 'scale(0.95)'; modal.style.opacity = '0';
            backdrop.style.opacity = '0';
            setTimeout(() => backdrop.remove(), 200);
        }
        backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
        document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc); } });

        const header = document.createElement('div');
        header.style.cssText = 'padding:var(--nui-space-4);border-bottom:1px solid var(--nui-border);background:var(--nui-surface-2);display:flex;flex-direction:column;gap:10px;';
        header.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:18px;">⚡</span>
                    <div style="font-family:var(--nui-font-display);font-size:18px;font-weight:800;color:var(--nui-text);">Super Shop Wizard</div>
                </div>
                <button type="button" id="nui-ssw-close" class="nui-reset" style="font-size:24px;cursor:pointer;color:var(--nui-text-muted);line-height:1;">&times;</button>
            </div>
            <div style="display:flex;gap:8px;">
                <input id="nui-ssw-input" type="text" value="${itemName.replace(/"/g, '&quot;')}" placeholder="Item name…" class="nui-input" style="flex:1;padding:8px 10px;">
                <button type="button" id="nui-ssw-go" class="nui-btn nui-btn-primary nui-btn-sm">Search</button>
            </div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--nui-text-muted);cursor:pointer;">
                    <select id="nui-ssw-criteria" class="nui-input" style="padding:3px 6px;font-size:12px;">
                        <option value="containing">Contains phrase</option>
                        <option value="exact" selected>Exact match</option>
                    </select>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--nui-text-muted);cursor:pointer;user-select:none;">
                    <input type="checkbox" id="nui-ssw-priceonly" style="width:14px;height:14px;cursor:pointer;">
                    Price only
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--nui-text-muted);cursor:pointer;">
                    <select id="nui-ssw-area" class="nui-input" style="padding:3px 6px;font-size:12px;">
                        <option value="0">Shop</option>
                        <option value="1">Gallery</option>
                    </select>
                </label>
            </div>
        `;
        header.querySelector('#nui-ssw-close').addEventListener('click', closeModal);

        const content = document.createElement('div');
        content.style.cssText = 'padding:var(--nui-space-4);max-height:55vh;overflow-y:auto;font-size:14px;';

        modal.appendChild(header); modal.appendChild(content);
        backdrop.appendChild(modal); document.body.appendChild(backdrop);
        requestAnimationFrame(() => { modal.style.transform = 'scale(1)'; modal.style.opacity = '1'; });

        async function doSearch(query) {
            if (!query) return;
            const criteriaEl = header.querySelector('#nui-ssw-criteria');
            const priceOnlyEl = header.querySelector('#nui-ssw-priceonly');
            const areaEl = header.querySelector('#nui-ssw-area');
            const criteria = criteriaEl ? criteriaEl.value : 'exact';
            const priceOnly = priceOnlyEl && priceOnlyEl.checked ? 1 : 0;
            const partial = criteria === 'containing' ? 1 : 0;
            const context = areaEl ? parseInt(areaEl.value) : 0;

            content.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:var(--nui-space-5) 0;color:var(--nui-text-muted);"><div style="width:24px;height:24px;border:3px solid var(--nui-border);border-top-color:var(--nui-accent);border-radius:50%;animation:spin 1s linear infinite;"></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style><div>Searching for <b>${query}</b>…</div></div>`;
            try {
                const fetchParams = new URLSearchParams({ q: query, priceOnly: priceOnly, context: context, partial: partial, min_price: 0, max_price: 0, lang: 'en', json: 1, cb: Date.now() });
                const res = await fetch(`/shops/ssw/ssw_query.php?${fetchParams}`);
                const data = await res.json();
                if (data.data && data.data.error) {
                    content.innerHTML = `<div style="padding:var(--nui-space-4);text-align:center;"><div style="font-size:32px;">⚠️</div><div style="color:var(--nui-danger);font-weight:800;margin-top:8px;">${data.data.error}</div><div style="font-size:12px;color:var(--nui-text-muted);margin-top:6px;">SSW requires a Premium membership.</div></div>`;
                    try { localStorage.removeItem('neoui_is_premium'); } catch (e) {}
                } else if (data.html) {
                    try { localStorage.setItem('neoui_is_premium', '1'); } catch (e) {}
                    content.innerHTML = data.html;
                    const table = content.querySelector('table');
                    if (table) {
                        table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;';
                        table.querySelectorAll('tr').forEach((tr, i) => {
                            tr.style.background = i % 2 === 0 ? 'var(--nui-surface-2)' : 'var(--nui-surface)';
                            tr.querySelectorAll('td').forEach(td => { td.style.padding = '6px 8px'; td.style.borderBottom = '1px solid var(--nui-border)'; });
                        });
                        // Make shop links open in new tab
                        content.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
                    }
                } else {
                    content.innerHTML = `<div style="padding:16px;color:var(--nui-text-muted);text-align:center;">No results found.</div>`;
                }
            } catch (e) {
                content.innerHTML = `<div style="padding:16px;color:var(--nui-danger);text-align:center;">Search failed. Are you logged in?</div>`;
            }
        }

        const sswInput = header.querySelector('#nui-ssw-input');
        const sswGo = header.querySelector('#nui-ssw-go');
        sswGo.addEventListener('click', () => doSearch(sswInput.value.trim()));
        sswInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(sswInput.value.trim()); });
        if (itemName) doSearch(itemName);
        else setTimeout(() => sswInput.focus(), 80);
    }

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openGlobalSearchModal();
            return;
        }
        if (e.key === '/' && !isEditingTextTarget(e.target)) {
            e.preventDefault();
            openGlobalSearchModal();
        }
    });

    // ---- Settings panel sections (extensible) ----
    // ---- Custom themes (persisted to localStorage) ----
    const CUSTOM_THEMES_KEY = 'neoui_custom_themes_v1';

    function loadCustomThemes() {
        try {
            const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
            if (!raw) return;
            const customs = JSON.parse(raw);
            Object.keys(customs).forEach(function (key) {
                THEMES[key] = customs[key];
            });
        } catch (e) {}
    }

    function saveCustomTheme(key, def) {
        try {
            const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
            const customs = raw ? JSON.parse(raw) : {};
            customs[key] = def;
            localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customs));
        } catch (e) {}
    }

    function deleteCustomTheme(key) {
        try {
            const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
            if (!raw) return;
            const customs = JSON.parse(raw);
            delete customs[key];
            localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customs));
        } catch (e) {}
    }

    loadCustomThemes();

    // Texture preset catalogue — each entry is a valid CSS background-image value
    // using only var(--nui-*) tokens so it reacts to the theme's own palette.
    // Compact custom theme editor — just the 4 colors that matter.
    const CUSTOM_EDITOR_COLORS = [
        { key: '--nui-bg',       label: 'Page BG'  },
        { key: '--nui-surface',  label: 'Cards'    },
        { key: '--nui-accent',   label: 'Accent'   },
        { key: '--nui-accent-2', label: 'Accent 2' },
    ];

        function buildThemeOptionHtml(key) {
        const t = THEMES[key];
        const tk = t.tokens;
        const isCustom = key.startsWith('custom_');

        // Add a delete button overlay for custom themes
        const delBtn = isCustom ? '<button type="button" class="nui-theme-del-btn" data-del-theme="' + key + '" style="position:absolute; top:6px; right:6px; width:22px; height:22px; border-radius:50%; background:var(--nui-danger); color:#fff; border:none; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; z-index:10; box-shadow:0 2px 4px rgba(0,0,0,0.4);">✕</button>' : '';

        return (
            '<div class="nui-theme-option" data-theme="' + key + '">' +
                delBtn +
                '<div class="nui-theme-preview" style="background:' + tk['--nui-bg'] + '">' +
                    '<div class="nui-theme-preview-card" style="background:' + tk['--nui-surface'] + ';border-color:' + tk['--nui-border'] + '">' +
                        '<span class="nui-theme-preview-avatar" style="background:' + tk['--nui-accent-soft'] + '">' +
                            '<span style="background:' + tk['--nui-accent'] + '"></span>' +
                        '</span>' +
                        '<span class="nui-theme-preview-lines">' +
                            '<span style="background:' + tk['--nui-text'] + '"></span>' +
                            '<span style="background:' + tk['--nui-text-faint'] + '"></span>' +
                        '</span>' +
                        '<span class="nui-theme-preview-chip" style="background:' + tk['--nui-accent-2'] + '"></span>' +
                    '</div>' +
                    '<span class="nui-theme-check">&#10003;</span>' +
                '</div>' +
                '<div class="nui-theme-meta">' +
                    '<span class="nui-theme-emoji">' + t.emoji + '</span>' +
                    '<span class="nui-theme-label">' + t.label + '</span>' +
                '</div>' +
            '</div>'
        );
    }

    // Which built-in themes are "dark" — everything else is treated as light.
    const DARK_THEMES = new Set(['haunted', 'moltara', 'spacefaerie', 'kreludor', 'virtupets', 'krawkisland', 'maractite']);

    function renderThemeSection(container) {
        // Split built-in themes into light/dark groups; custom themes go at the end
        const allKeys = Object.keys(THEMES);
        const lightKeys  = allKeys.filter(k => !k.startsWith('custom_') && !DARK_THEMES.has(k));
        const darkKeys   = allKeys.filter(k => !k.startsWith('custom_') && DARK_THEMES.has(k));
        const customKeys = allKeys.filter(k => k.startsWith('custom_'));

        function groupSection(label, keys) {
            if (!keys.length) return '';
            return '<div style="margin-bottom:6px;">' +
                '<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;color:var(--nui-text-faint);padding:6px 2px 4px;">' + label + '</div>' +
                '<div class="nui-theme-grid">' + keys.map(buildThemeOptionHtml).join('') + '</div>' +
            '</div>';
        }

        const optionsHtml =
            groupSection('☀️ Light', lightKeys) +
            groupSection('🌑 Dark',  darkKeys)  +
            (customKeys.length ? groupSection('🎨 Custom', customKeys) : '');

        // Removed the "open" attribute so it collapses by default
        container.innerHTML =
            '<details class="nui-drawer-section">' +
                '<summary class="nui-drawer-section-title" style="cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">' +
                    'Theme <span style="font-size:10px; opacity:0.5;">▼</span>' +
                '</summary>' +
                '<div id="nui-theme-grid-inner" style="margin-top:10px;">' + optionsHtml + '</div>' +
            '</details>';

        function refresh() {
            const current = getStoredTheme();
            container.querySelectorAll('.nui-theme-option').forEach(function (opt) {
                opt.classList.toggle('is-selected', opt.getAttribute('data-theme') === current);
            });
        }

        container.querySelectorAll('.nui-theme-option').forEach(function (opt) {
            opt.addEventListener('click', function (e) {
                // Prevent clicking the delete button from also selecting the theme
                if (e.target.closest('.nui-theme-del-btn')) return;
                setTheme(opt.getAttribute('data-theme'));
                refresh();
            });
        });

        // Wire up the delete buttons
        container.querySelectorAll('.nui-theme-del-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const dk = btn.getAttribute('data-del-theme');
                if (confirm("Delete this custom theme?")) {
                    delete THEMES[dk];
                    if (global.NeoUI && global.NeoUI.deleteCustomTheme) {
                        global.NeoUI.deleteCustomTheme(dk);
                    } else {
                        deleteCustomTheme(dk);
                    }
                    if (getStoredTheme() === dk) setTheme(DEFAULT_THEME);
                    renderThemeSection(container); // Re-render the grid
                }
            });
        });

        refresh();
    }


    function safeHex(val) {
        const m = (val || '').match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
        if (!m) return '#888888';
        const raw = m[1];
        return '#' + (raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw);
    }

    // Loose hex parser for freeform text input (accepts with/without '#', 3 or 6 digits).
    function parseHexLoose(val) {
        const m = (val || '').trim().match(/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
        if (!m) return null;
        const raw = m[1];
        return '#' + (raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw).toLowerCase();
    }

    // ---- Color conversion helpers (for the custom HSV picker) ----
    function clamp01(n) { return Math.max(0, Math.min(1, n)); }
    function hexToRgb(hex) {
        hex = (hex || '000000').replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16) || 0;
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
    function rgbToHex(rgb) {
        return '#' + rgb.map(c => {
            const v = Math.round(Math.max(0, Math.min(255, c)));
            return v.toString(16).padStart(2, '0');
        }).join('');
    }
    function rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const d = max - min;
        let h = 0;
        if (d !== 0) {
            if (max === r) h = ((g - b) / d) % 6;
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
            if (h < 0) h += 360;
        }
        const v = max;
        const s = max === 0 ? 0 : d / max;
        return { h, s, v };
    }
    function hsvToRgb(h, s, v) {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        let r = 0, g = 0, b = 0;
        if (h < 60)       { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else              { r = c; g = 0; b = x; }
        return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    }

    // Custom saturation/value + hue color picker popover — replaces the OS
    // native <input type="color"> swatch so every browser/platform gets the
    // same picker and it can live-update the theme preview as you drag.
    function openColorPopover(anchor, initialHex, onChange) {
        const prev = document.getElementById('nui-color-popover');
        if (prev) prev.remove();

        const pop = document.createElement('div');
        pop.id = 'nui-color-popover';
        pop.className = 'nui-surface nui-reset';
        // Change z-index from 100010 to 2147483647
pop.style.cssText = 'position:fixed; z-index:2147483647; width:212px; padding:12px; border-radius:var(--nui-radius-md); border:1px solid var(--nui-border); box-shadow:0 10px 32px rgba(0,0,0,0.4); display:flex; flex-direction:column; gap:10px;';

        const canvas = document.createElement('canvas');
        canvas.width = 188; canvas.height = 110;
        canvas.style.cssText = 'width:100%; height:110px; border-radius:8px; cursor:crosshair; display:block; touch-action:none;';

        const hueWrap = document.createElement('div');
        hueWrap.style.cssText = 'position:relative; height:14px; border-radius:7px; cursor:pointer; touch-action:none; background:linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);';
        const hueThumb = document.createElement('div');
        hueThumb.style.cssText = 'position:absolute; top:-2px; width:18px; height:18px; margin-left:-9px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 1px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.5); pointer-events:none;';
        hueWrap.appendChild(hueThumb);

        const hexRow = document.createElement('div');
        hexRow.style.cssText = 'display:flex; align-items:center; gap:8px;';
        const swatchPreview = document.createElement('div');
        swatchPreview.style.cssText = 'width:26px; height:26px; border-radius:6px; border:1px solid var(--nui-border); flex-shrink:0;';
        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.maxLength = 7;
        hexInput.spellcheck = false;
        hexInput.style.cssText = 'flex:1; min-width:0; padding:6px 8px; font-size:12px; font-family:monospace; border-radius:6px; border:1px solid var(--nui-border); background:var(--nui-surface-2); color:var(--nui-text);';
        hexRow.appendChild(swatchPreview);
        hexRow.appendChild(hexInput);

        pop.appendChild(canvas);
        pop.appendChild(hueWrap);
        pop.appendChild(hexRow);
        document.body.appendChild(pop);

        const r = anchor.getBoundingClientRect();
        pop.style.top = (r.bottom + 8) + 'px';
        pop.style.left = r.left + 'px';
        requestAnimationFrame(() => {
            const pr = pop.getBoundingClientRect();
            let top = r.bottom + 8, left = r.left;
            if (left + pr.width > window.innerWidth - 8) left = window.innerWidth - pr.width - 8;
            if (left < 8) left = 8;
            if (top + pr.height > window.innerHeight - 8) top = Math.max(8, r.top - pr.height - 8);
            pop.style.top = top + 'px';
            pop.style.left = left + 'px';
        });

        const rgb0 = hexToRgb(initialHex);
        let { h, s, v } = rgbToHsv(rgb0[0], rgb0[1], rgb0[2]);

        function currentHex() { return rgbToHex(hsvToRgb(h, s, v)); }

        function drawSV() {
            const ctx = canvas.getContext('2d');
            const w = canvas.width, ht = canvas.height;
            const hueRgb = hsvToRgb(h, 1, 1);
            ctx.fillStyle = 'rgb(' + hueRgb.map(Math.round).join(',') + ')';
            ctx.fillRect(0, 0, w, ht);
            const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
            whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
            whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = whiteGrad;
            ctx.fillRect(0, 0, w, ht);
            const blackGrad = ctx.createLinearGradient(0, 0, 0, ht);
            blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
            blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = blackGrad;
            ctx.fillRect(0, 0, w, ht);
            const mx = s * w, my = (1 - v) * ht;
            ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1; ctx.stroke();
        }

        function refresh() {
            drawSV();
            hueThumb.style.left = (h / 360 * 100) + '%';
            const hex = currentHex();
            swatchPreview.style.background = hex;
            hexInput.value = hex;
        }
        refresh();

        function emit() {
            const hex = currentHex();
            swatchPreview.style.background = hex;
            hexInput.value = hex;
            onChange(hex);
        }

        let draggingSV = false;
        function pickSV(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            s = clamp01((clientX - rect.left) / rect.width);
            v = clamp01(1 - (clientY - rect.top) / rect.height);
            drawSV(); emit();
        }
        canvas.addEventListener('pointerdown', (e) => { draggingSV = true; canvas.setPointerCapture(e.pointerId); pickSV(e.clientX, e.clientY); });
        canvas.addEventListener('pointermove', (e) => { if (draggingSV) pickSV(e.clientX, e.clientY); });
        canvas.addEventListener('pointerup', () => { draggingSV = false; });
        canvas.addEventListener('pointercancel', () => { draggingSV = false; });

        let draggingHue = false;
        function pickHue(clientX) {
            const rect = hueWrap.getBoundingClientRect();
            h = clamp01((clientX - rect.left) / rect.width) * 360;
            drawSV(); hueThumb.style.left = (h / 360 * 100) + '%'; emit();
        }
        hueWrap.addEventListener('pointerdown', (e) => { draggingHue = true; hueWrap.setPointerCapture(e.pointerId); pickHue(e.clientX); });
        hueWrap.addEventListener('pointermove', (e) => { if (draggingHue) pickHue(e.clientX); });
        hueWrap.addEventListener('pointerup', () => { draggingHue = false; });
        hueWrap.addEventListener('pointercancel', () => { draggingHue = false; });

        hexInput.addEventListener('change', () => {
            const parsed = parseHexLoose(hexInput.value);
            if (parsed) {
                const rgb = hexToRgb(parsed);
                const hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]);
                h = hsv.h; s = hsv.s; v = hsv.v;
                refresh();
                onChange(parsed);
            } else {
                hexInput.value = currentHex();
            }
        });
        hexInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') hexInput.blur(); });

        function outsideClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) close();
}
        function onEsc(e) { if (e.key === 'Escape') close(); }
        function close() {
            document.removeEventListener('pointerdown', outsideClick, true);
            document.removeEventListener('keydown', onEsc, true);
            pop.remove();
        }
        setTimeout(() => {
            document.addEventListener('pointerdown', outsideClick, true);
            document.addEventListener('keydown', onEsc, true);
        }, 0);

        return { close };
    }

    // Texture presets — literal CSS background-image values using fixed colors
    // so they render correctly in the preview without needing resolved tokens.
    const TEXTURE_PRESETS = [
        { label: 'None',         svg: null },
        { label: 'Polka dots',   svg: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='3' fill='none' stroke='rgba(128,128,128,0.45)' stroke-width='1.2'/></svg>` },
        { label: 'Stars',        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><path d='M14 6 L16.4 13.4 L24.2 13.4 L18 18.2 L20.4 25.6 L14 21 L7.6 25.6 L10 18.2 L3.8 13.4 L11.6 13.4 Z' fill='rgba(128,128,128,0.2)' transform='rotate(-10,14,16)'/><path d='M42 22 L43.8 27.6 L49.8 27.6 L45 31 L46.8 36.6 L42 33.2 L37.2 36.6 L39 31 L34.2 27.6 L40.2 27.6 Z' fill='none' stroke='rgba(128,128,128,0.32)' stroke-width='0.9' transform='rotate(18,42,29)'/><path d='M20 40 L21 43 L24.2 43 L21.8 44.8 L22.8 47.8 L20 46 L17.2 47.8 L18.2 44.8 L15.8 43 L19 43 Z' fill='rgba(128,128,128,0.18)' transform='rotate(6,20,44)'/><circle cx='6' cy='46' r='1.3' fill='rgba(128,128,128,0.28)'/><circle cx='32' cy='32' r='0.9' fill='rgba(128,128,128,0.2)'/></svg>` },
        { label: 'Waves',        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='56'><path d='M0 14 C8 7 16 7 24 14 C32 21 40 21 48 14' fill='none' stroke='rgba(128,128,128,0.4)' stroke-width='1.3' stroke-linecap='round'/><path d='M0 30 C8 23 16 23 24 30 C32 37 40 37 48 30' fill='none' stroke='rgba(128,128,128,0.22)' stroke-width='1' stroke-linecap='round'/><path d='M0 46 C8 39 16 39 24 46 C32 53 40 53 48 46' fill='none' stroke='rgba(128,128,128,0.13)' stroke-width='0.8' stroke-linecap='round'/></svg>` },
        { label: 'Pebbles',      svg: `<svg xmlns='http://www.w3.org/2000/svg' width='52' height='48'><ellipse cx='12' cy='10' rx='7' ry='5' transform='rotate(-15,12,10)' fill='rgba(128,128,128,0.1)' stroke='rgba(128,128,128,0.28)' stroke-width='1'/><ellipse cx='32' cy='8' rx='4' ry='3' transform='rotate(10,32,8)' fill='rgba(128,128,128,0.07)' stroke='rgba(128,128,128,0.22)' stroke-width='0.9'/><ellipse cx='44' cy='16' rx='6' ry='4' transform='rotate(-8,44,16)' fill='rgba(128,128,128,0.06)' stroke='rgba(128,128,128,0.18)' stroke-width='0.8'/><ellipse cx='18' cy='28' rx='10' ry='6' transform='rotate(5,18,28)' fill='rgba(128,128,128,0.07)' stroke='rgba(128,128,128,0.2)' stroke-width='1'/><ellipse cx='40' cy='30' rx='5' ry='7' transform='rotate(-20,40,30)' fill='rgba(128,128,128,0.05)' stroke='rgba(128,128,128,0.16)' stroke-width='0.8'/><ellipse cx='8' cy='42' rx='5' ry='3' transform='rotate(12,8,42)' fill='rgba(128,128,128,0.05)' stroke='rgba(128,128,128,0.14)' stroke-width='0.8'/><ellipse cx='30' cy='44' rx='3' ry='2' fill='rgba(128,128,128,0.08)' stroke='rgba(128,128,128,0.2)' stroke-width='0.7'/></svg>` },
        { label: 'Sparkles',     svg: `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><path d='M14 6 L15.4 10.6 L20 12 L15.4 13.4 L14 18 L12.6 13.4 L8 12 L12.6 10.6 Z' fill='rgba(128,128,128,0.42)'/><path d='M40 32 L41 35 L44 36 L41 37 L40 40 L39 37 L36 36 L39 35 Z' fill='rgba(128,128,128,0.36)'/><path d='M8 40 L8.8 42.6 L11.4 43.4 L8.8 44.2 L8 46.8 L7.2 44.2 L4.6 43.4 L7.2 42.6 Z' fill='rgba(128,128,128,0.25)'/><circle cx='44' cy='10' r='1.4' fill='rgba(128,128,128,0.38)'/><circle cx='28' cy='28' r='0.9' fill='rgba(128,128,128,0.28)'/><circle cx='50' cy='46' r='0.8' fill='rgba(128,128,128,0.22)'/></svg>` },
        { label: 'Honeycomb',    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='32'><polygon points='14,2 24,7.5 24,18.5 14,24 4,18.5 4,7.5' fill='none' stroke='rgba(128,128,128,0.35)' stroke-width='1'/></svg>` },
        { label: 'Hearts',       svg: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><path d='M16 26 C16 26 4 18 4 10 C4 6 8 3 12 5 C13.5 5.8 15 7 16 9 C17 7 18.5 5.8 20 5 C24 3 28 6 28 10 C28 18 16 26 16 26Z' fill='rgba(128,128,128,0.2)' stroke='rgba(128,128,128,0.32)' stroke-width='0.8'/></svg>` },
        { label: 'Diamonds',     svg: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 2 L22 12 L12 22 L2 12 Z' fill='none' stroke='rgba(128,128,128,0.35)' stroke-width='1'/><path d='M12 7 L17 12 L12 17 L7 12 Z' fill='rgba(128,128,128,0.1)'/></svg>` },
        { label: 'Triangles',    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 3 L22 21 L2 21 Z' fill='none' stroke='rgba(128,128,128,0.35)' stroke-width='1'/></svg>` },
        { label: 'Bubbles',      svg: `<svg xmlns='http://www.w3.org/2000/svg' width='52' height='52'><circle cx='16' cy='14' r='10' fill='none' stroke='rgba(128,128,128,0.28)' stroke-width='1.1'/><circle cx='16' cy='14' r='6' fill='none' stroke='rgba(128,128,128,0.15)' stroke-width='0.7'/><circle cx='38' cy='36' r='8' fill='none' stroke='rgba(128,128,128,0.22)' stroke-width='1'/><circle cx='38' cy='36' r='4' fill='none' stroke='rgba(128,128,128,0.12)' stroke-width='0.6'/><circle cx='40' cy='12' r='4' fill='none' stroke='rgba(128,128,128,0.18)' stroke-width='0.8'/><circle cx='12' cy='42' r='5' fill='none' stroke='rgba(128,128,128,0.16)' stroke-width='0.8'/></svg>` },
        { label: 'Argyle',       svg: `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='rgba(128,128,128,0.28)' stroke-width='1'/><path d='M20 8 L32 20 L20 32 L8 20 Z' fill='none' stroke='rgba(128,128,128,0.16)' stroke-width='0.7'/><line x1='20' y1='0' x2='20' y2='40' stroke='rgba(128,128,128,0.1)' stroke-width='0.6'/><line x1='0' y1='20' x2='40' y2='20' stroke='rgba(128,128,128,0.1)' stroke-width='0.6'/></svg>` },
        { label: 'Crosshatch',   svg: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><line x1='0' y1='0' x2='20' y2='20' stroke='rgba(128,128,128,0.22)' stroke-width='0.8'/><line x1='20' y1='0' x2='0' y2='20' stroke='rgba(128,128,128,0.22)' stroke-width='0.8'/></svg>` },
        { label: 'Cobblestone',  svg: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='32'><ellipse cx='12' cy='10' rx='10' ry='7' fill='none' stroke='rgba(128,128,128,0.38)' stroke-width='1'/><ellipse cx='36' cy='10' rx='10' ry='7' fill='none' stroke='rgba(128,128,128,0.3)' stroke-width='1'/><ellipse cx='24' cy='26' rx='10' ry='7' fill='none' stroke='rgba(128,128,128,0.34)' stroke-width='1'/><ellipse cx='0' cy='26' rx='10' ry='7' fill='none' stroke='rgba(128,128,128,0.28)' stroke-width='0.9'/><ellipse cx='48' cy='26' rx='10' ry='7' fill='none' stroke='rgba(128,128,128,0.28)' stroke-width='0.9'/></svg>` },
        { label: 'Motes',        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><circle cx='20' cy='18' r='1.2' fill='rgba(128,128,128,0.5)'/><circle cx='60' cy='50' r='0.9' fill='rgba(128,128,128,0.4)'/><circle cx='44' cy='30' r='0.7' fill='rgba(128,128,128,0.32)'/><circle cx='10' cy='62' r='0.8' fill='rgba(128,128,128,0.28)'/><circle cx='70' cy='14' r='0.6' fill='rgba(128,128,128,0.25)'/><circle cx='36' cy='68' r='1' fill='rgba(128,128,128,0.35)'/><circle cx='66' cy='72' r='0.7' fill='rgba(128,128,128,0.28)'/></svg>` },
        { label: 'Herringbone',  svg: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><line x1='0' y1='12' x2='12' y2='0' stroke='rgba(128,128,128,0.28)' stroke-width='1' stroke-linecap='round'/><line x1='12' y1='24' x2='24' y2='12' stroke='rgba(128,128,128,0.28)' stroke-width='1' stroke-linecap='round'/><line x1='0' y1='24' x2='24' y2='0' stroke='rgba(128,128,128,0.14)' stroke-width='0.6' stroke-linecap='round'/></svg>` },
        { label: 'Pinstripe',    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><line x1='0' y1='0' x2='0' y2='20' stroke='rgba(128,128,128,0.22)' stroke-width='1'/><line x1='10' y1='0' x2='10' y2='20' stroke='rgba(128,128,128,0.1)' stroke-width='0.6'/></svg>` },
        { label: 'Scales',       svg: `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><path d='M0 16 Q8 0 16 0 Q24 0 32 16' fill='none' stroke='rgba(128,128,128,0.3)' stroke-width='1'/><path d='M0 32 Q8 16 16 16 Q24 16 32 32' fill='none' stroke='rgba(128,128,128,0.22)' stroke-width='0.9'/><path d='M-16 24 Q-8 8 0 8' fill='none' stroke='rgba(128,128,128,0.18)' stroke-width='0.8'/><path d='M16 8 Q24 -8 32 -8' fill='none' stroke='rgba(128,128,128,0.18)' stroke-width='0.8'/></svg>` },
        { label: 'Grid',         svg: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><line x1='0' y1='0' x2='20' y2='0' stroke='rgba(128,128,128,0.2)' stroke-width='0.7'/><line x1='0' y1='10' x2='20' y2='10' stroke='rgba(128,128,128,0.12)' stroke-width='0.5'/><line x1='0' y1='0' x2='0' y2='20' stroke='rgba(128,128,128,0.2)' stroke-width='0.7'/><line x1='10' y1='0' x2='10' y2='20' stroke='rgba(128,128,128,0.12)' stroke-width='0.5'/></svg>` },
    ].map(tp => ({
        ...tp,
        value: tp.svg
            ? 'url("data:image/svg+xml,' + tp.svg.replace(/"/g, "'").replace(/%/g, '%25').replace(/#/g, '%23') + '")'
            : 'none'
    }));

    // Merge base theme + in-progress edits into a complete token set — used
    // both by the live preview (every keystroke/drag) and by Save & Apply,
    // so the preview can never drift from what actually gets saved.
    function computeWorkingTokens(baseKey, working, workingTexture) {
        const base = THEMES[baseKey] || THEMES[DEFAULT_THEME];
        const finalTokens = Object.assign({}, base.tokens, working);
        finalTokens['--nui-accent-soft'] = safeHex(working['--nui-accent']) + '28';
        finalTokens['--nui-accent-2-soft'] = safeHex(working['--nui-accent-2']) + '28';
        if (workingTexture && workingTexture !== 'none') {
            finalTokens['--nui-texture'] = workingTexture;
        } else {
            delete finalTokens['--nui-texture'];
        }
        return finalTokens;
    }

    // ---- Full-screen modal theme editor with a live sample preview ----
    function openThemeEditorModal() {
        if (document.getElementById('nui-theme-editor-backdrop')) return;

        let baseKey = getStoredTheme();
        let working = {};
        let workingTexture = 'none';
        let openPopover = null;
        let activeTab = 'basic';

        function seedFromBase() {
            const base = THEMES[baseKey] || THEMES[DEFAULT_THEME];
            [...CUSTOM_EDITOR_COLORS, ...ADVANCED_COLORS].forEach(c => { working[c.key] = base.tokens[c.key] || '#888888'; });
        }

        const ADVANCED_COLORS = [
            { key: '--nui-surface-2',  label: 'Surface 2'  },
            { key: '--nui-border',     label: 'Border'     },
            { key: '--nui-text',       label: 'Text'       },
            { key: '--nui-text-muted', label: 'Text Muted' },
            { key: '--nui-success',    label: 'Success'    },
            { key: '--nui-warning',    label: 'Warning'    },
            { key: '--nui-danger',     label: 'Danger'     },
        ];
        seedFromBase();

        const TABS = [
            { id: 'basic',    label: 'Basic'    },
            { id: 'advanced', label: 'Advanced' },
            { id: 'texture',  label: 'Texture'  },
        ];

        const backdrop = document.createElement('div');
        backdrop.id = 'nui-theme-editor-backdrop';
        backdrop.className = 'nui-drawer-backdrop nui-reset is-open';
        backdrop.style.cssText = 'position: fixed; inset: 0; z-index: 2147483647; isolation: isolate; background: var(--nui-overlay); display: flex; align-items: center; justify-content: center; padding: var(--nui-space-4); transition: opacity var(--nui-dur-fast) var(--nui-ease);';

        const modal = document.createElement('div');
        modal.className = 'nui-surface';
        modal.style.cssText = 'position: relative; z-index: 2147483647; width: 100%; max-width: 640px; max-height: 90vh; border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); box-shadow: 0 10px 40px rgba(0,0,0,0.6); display: flex; flex-direction: column; overflow: hidden; transform: scale(0.95); opacity: 0; transition: all var(--nui-dur-fast) var(--nui-ease-snap);';

        const header = document.createElement('div');
        header.style.cssText = 'padding: var(--nui-space-4); border-bottom: 1px solid var(--nui-border); background: var(--nui-surface-2); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;';
        header.innerHTML =
            '<div style="font-family: var(--nui-font-display); font-size: 18px; font-weight: 800; color: var(--nui-text);">🎨 Theme Editor</div>' +
            '<button type="button" class="nui-reset" id="nui-ct-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--nui-text-muted); line-height: 1;">&times;</button>';

        // ---- Sticky zone: live preview + base theme picker (always visible, not part of the scrolling tab content) ----
        const topZone = document.createElement('div');
        topZone.style.cssText = 'padding: var(--nui-space-4); padding-bottom: var(--nui-space-3); display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; border-bottom: 1px solid var(--nui-border);';

        // ---- Tab bar ----
        const tabBar = document.createElement('div');
        tabBar.style.cssText = 'display: flex; gap: 2px; padding: 0 var(--nui-space-3); flex-shrink: 0; background: var(--nui-surface-2); border-bottom: 1px solid var(--nui-border);';

        // ---- Scrollable tab content (only this area scrolls) ----
        const content = document.createElement('div');
        content.style.cssText = 'flex: 1 1 auto; min-height: 0; padding: var(--nui-space-4); overflow-y: auto; -webkit-overflow-scrolling: touch;';

        const footer = document.createElement('div');
        footer.style.cssText = 'padding: var(--nui-space-3) var(--nui-space-4); border-top: 1px solid var(--nui-border); background: var(--nui-surface-2); display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;';
        footer.innerHTML =
            '<div style="display:flex; gap:6px;">' +
                '<input id="nui-ct-emoji" type="text" maxlength="2" value="🎨" placeholder="🎨" style="width:38px; text-align:center; font-size:16px; padding:6px 4px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface); color:var(--nui-text);">' +
                '<input id="nui-ct-name" type="text" placeholder="Theme name" style="flex:1; padding:6px 8px; font-size:13px; font-weight:700; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface); color:var(--nui-text);">' +
            '</div>' +
            '<span id="nui-ct-status" style="font-size:12px; text-align:center; color:var(--nui-success); display:block; min-height:16px;"></span>' +
            '<div style="display:flex; gap:8px;">' +
                '<button type="button" class="nui-btn nui-btn-block" id="nui-ct-cancel" style="background: var(--nui-surface); border: 1px solid var(--nui-border); color: var(--nui-text-muted);">Cancel</button>' +
                '<button type="button" class="nui-btn nui-btn-primary nui-btn-block" id="nui-ct-save">Save &amp; Apply</button>' +
            '</div>';

        modal.appendChild(header);
        modal.appendChild(topZone);
        modal.appendChild(tabBar);
        modal.appendChild(content);
        modal.appendChild(footer);
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        function close() {
            if (openPopover) { openPopover.close(); openPopover = null; }
            modal.style.transform = 'scale(0.95)';
            modal.style.opacity = '0';
            backdrop.style.opacity = '0';
            setTimeout(() => backdrop.remove(), 200);
        }
        header.querySelector('#nui-ct-close').addEventListener('click', close);
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

        const baseOpts = Object.keys(THEMES).map(k =>
            '<option value="' + k + '"' + (k === baseKey ? ' selected' : '') + '>' +
            THEMES[k].emoji + ' ' + THEMES[k].label + '</option>'
        ).join('');

        function swatchBtn(c) {
            return '<button type="button" class="nui-ct-swatch-btn nui-reset" data-ckey="' + c.key + '" style="display:flex; align-items:center; gap:10px; padding:8px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface-2); cursor:pointer; text-align:left;">' +
                '<span class="nui-ct-swatch" data-ckey="' + c.key + '" style="width:32px; height:32px; border-radius:7px; border:1px solid var(--nui-border); flex-shrink:0; background:' + safeHex(working[c.key]) + ';"></span>' +
                '<span style="font-size:12px; font-weight:700; color:var(--nui-text);">' + c.label + '</span>' +
            '</button>';
        }

        function texCardHtml(tp) {
            const isNone = tp.value === 'none';
            const active = workingTexture === tp.value;
            const border = active ? '2px solid var(--nui-accent)' : '1.5px solid var(--nui-border)';
            const bgImage = isNone
                ? 'repeating-linear-gradient(45deg,var(--nui-border) 0,var(--nui-border) 1px,transparent 1px,transparent 8px)'
                : tp.value.replace(/"/g, '&quot;');
            return '<button type="button" class="nui-ct-tex" data-tex="' + tp.value.replace(/"/g, '&quot;') + '" ' +
                'style="border-radius:8px; overflow:hidden; border:' + border + '; cursor:pointer; background:none; padding:0; text-align:left; width:100%;">' +
                '<div style="height:64px; background:var(--nui-surface); background-image:' + bgImage + '; background-repeat:repeat; background-size:auto;"></div>' +
                '<div style="padding:6px 7px; background:var(--nui-surface-2); border-top:1px solid var(--nui-border);">' +
                    '<div style="font-size:11px; font-weight:700; color:' + (active ? 'var(--nui-accent)' : 'var(--nui-text)') + ';">' + tp.label + '</div>' +
                '</div>' +
            '</button>';
        }

        topZone.innerHTML =
            '<div id="nui-ct-preview" class="nui-reset" style="border:1px solid var(--nui-border); border-radius:var(--nui-radius-lg); overflow:hidden; background:var(--nui-bg);">' +
                '<div id="nui-ct-preview-header" style="height:56px; display:flex; align-items:center; padding:0 14px; border-bottom:2px solid var(--nui-border);">' +
                    '<div style="width:28px;height:28px;border-radius:50%;background:var(--nui-accent-soft);display:flex;align-items:center;justify-content:center;color:var(--nui-accent);font-size:14px;flex-shrink:0;">🎨</div>' +
                    '<div style="margin-left:10px;font-family:var(--nui-font-display);font-weight:800;font-size:14px;color:var(--nui-text);">Sample Page</div>' +
                '</div>' +
                '<div style="padding:14px; display:flex; flex-direction:column; gap:10px;">' +
                    '<div class="nui-surface" style="border:1px solid var(--nui-border); border-radius:var(--nui-radius-md); padding:12px;">' +
                        '<div style="font-weight:800; font-size:14px; color:var(--nui-text); margin-bottom:4px;">Sample Card</div>' +
                        '<div style="font-size:12px; color:var(--nui-text-muted); margin-bottom:10px;">Muted text next to primary and secondary colors.</div>' +
                        '<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">' +
                            '<button type="button" class="nui-btn nui-btn-primary nui-btn-sm" tabindex="-1">Primary</button>' +
                            '<span style="font-size:11px; font-weight:700; padding:3px 9px; border-radius:var(--nui-radius-pill); background:var(--nui-accent-2-soft); color:var(--nui-accent-2);">Badge</span>' +
                            '<span style="font-size:11px; font-weight:700; padding:3px 9px; border-radius:var(--nui-radius-pill); background:var(--nui-success)22; color:var(--nui-success);">Success</span>' +
                            '<span style="font-size:11px; font-weight:700; padding:3px 9px; border-radius:var(--nui-radius-pill); background:var(--nui-danger)22; color:var(--nui-danger);">Danger</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
                '<span style="font-size:12px; font-weight:700; color:var(--nui-text-muted); flex-shrink:0;">Base theme</span>' +
                '<select id="nui-ct-base" style="flex:1; padding:6px 8px; font-size:12px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface-2); color:var(--nui-text);">' + baseOpts + '</select>' +
            '</div>';

        tabBar.innerHTML = TABS.map(t =>
            '<button type="button" class="nui-ct-tab nui-reset" data-tab="' + t.id + '" style="' +
                'flex:1; padding:10px 8px; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; ' +
                'background:none; border:none; cursor:pointer; margin-bottom:-1px; ' +
                'color:' + (t.id === activeTab ? 'var(--nui-accent)' : 'var(--nui-text-muted)') + '; ' +
                'border-bottom:2px solid ' + (t.id === activeTab ? 'var(--nui-accent)' : 'transparent') + ';">' +
                t.label +
            '</button>'
        ).join('');

        content.innerHTML =
            '<div class="nui-ct-panel" data-panel="basic" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">' +
                CUSTOM_EDITOR_COLORS.map(swatchBtn).join('') +
            '</div>' +
            '<div class="nui-ct-panel" data-panel="advanced" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">' +
                '<div style="grid-column:1 / -1; font-size:10px; font-weight:800; text-transform:uppercase; color:var(--nui-text-faint); letter-spacing:0.5px;">Additional tokens</div>' +
                ADVANCED_COLORS.map(swatchBtn).join('') +
            '</div>' +
            '<div class="nui-ct-panel" data-panel="texture" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;" id="nui-ct-tex-grid">' +
                TEXTURE_PRESETS.map(texCardHtml).join('') +
            '</div>';

        content.querySelectorAll('.nui-ct-panel').forEach(p => {
            p.style.display = p.getAttribute('data-panel') === activeTab ? 'grid' : 'none';
        });

        function setActiveTab(tabId) {
            activeTab = tabId;
            tabBar.querySelectorAll('.nui-ct-tab').forEach(btn => {
                const isActive = btn.getAttribute('data-tab') === tabId;
                btn.style.color = isActive ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                btn.style.borderBottomColor = isActive ? 'var(--nui-accent)' : 'transparent';
            });
            content.querySelectorAll('.nui-ct-panel').forEach(p => {
                p.style.display = p.getAttribute('data-panel') === tabId ? 'grid' : 'none';
            });
            content.scrollTop = 0;
        }
        tabBar.querySelectorAll('.nui-ct-tab').forEach(btn => {
            btn.addEventListener('click', () => setActiveTab(btn.getAttribute('data-tab')));
        });

        const previewEl = topZone.querySelector('#nui-ct-preview');
        const previewHeaderEl = topZone.querySelector('#nui-ct-preview-header');

        function updatePreview() {
            const tk = computeWorkingTokens(baseKey, working, workingTexture);
            Object.keys(tk).forEach(k => previewEl.style.setProperty(k, tk[k]));
            previewHeaderEl.style.backgroundImage = buildHeaderBgImage(tk);
        }
        updatePreview();

        topZone.querySelector('#nui-ct-base').addEventListener('change', function () {
            baseKey = this.value;
            seedFromBase();
            workingTexture = 'none';
            content.querySelectorAll('.nui-ct-swatch').forEach(s => {
                const key = s.getAttribute('data-ckey');
                s.style.background = safeHex(working[key] || '#888888');
            });
            content.querySelectorAll('.nui-ct-tex').forEach(b => {
                const active = b.getAttribute('data-tex') === workingTexture;
                b.style.border = active ? '2px solid var(--nui-accent)' : '1.5px solid var(--nui-border)';
                const label = b.querySelector('div > div');
                if (label) label.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text)';
            });
            updatePreview();
        });

        content.querySelectorAll('.nui-ct-swatch-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const key = this.getAttribute('data-ckey');
                const swatch = this.querySelector('.nui-ct-swatch');
                const currentVal = working[key] || (THEMES[baseKey] || THEMES[DEFAULT_THEME]).tokens[key] || '#888888';
                openPopover = openColorPopover(this, safeHex(currentVal), (hex) => {
                    working[key] = hex;
                    swatch.style.background = hex;
                    updatePreview();
                });
            });
        });

        content.querySelectorAll('.nui-ct-tex').forEach(btn => {
            btn.addEventListener('click', function () {
                workingTexture = this.getAttribute('data-tex');
                content.querySelectorAll('.nui-ct-tex').forEach(b => {
                    const active = b.getAttribute('data-tex') === workingTexture;
                    b.style.border = active ? '2px solid var(--nui-accent)' : '1.5px solid var(--nui-border)';
                    const label = b.querySelector('div > div');
                    if (label) label.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text)';
                });
                updatePreview();
            });
        });

        footer.querySelector('#nui-ct-save').addEventListener('click', function () {
            const nameInp = footer.querySelector('#nui-ct-name');
            const emojiInp = footer.querySelector('#nui-ct-emoji');
            const label = (nameInp && nameInp.value.trim()) || 'Custom';
            const emoji = (emojiInp && emojiInp.value.trim()) || '🎨';
            const finalTokens = computeWorkingTokens(baseKey, working, workingTexture);
            const key = 'custom_' + label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20) + '_' + Date.now().toString(36);
            const def = { label, emoji, tokens: finalTokens };
            THEMES[key] = def;
            saveCustomTheme(key, def);
            setTheme(key);
            const st = footer.querySelector('#nui-ct-status');
            if (st) st.textContent = '✓ Saved and applied!';
            setTimeout(close, 700);
        });

        footer.querySelector('#nui-ct-cancel').addEventListener('click', close);

        requestAnimationFrame(() => requestAnimationFrame(() => {
            modal.style.transform = 'scale(1)';
            modal.style.opacity = '1';
        }));
    }

    // ---- Drawer entry point: quick list + button that opens the full editor ----
    function renderCustomThemeSection(container) {
        function buildHtml() {
            const savedRaw = localStorage.getItem(CUSTOM_THEMES_KEY);
            const saved = savedRaw ? JSON.parse(savedRaw) : {};
            const savedKeys = Object.keys(saved);
            const savedList = savedKeys.length === 0 ? '' :
                '<div style="margin-top:12px;">' +
                '<div style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--nui-text-faint); letter-spacing:0.5px; margin-bottom:6px;">Saved</div>' +
                savedKeys.map(k =>
                    '<div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--nui-border);">' +
                    '<div style="width:14px; height:14px; border-radius:50%; flex-shrink:0; border:1px solid var(--nui-border); background:' + safeHex(saved[k].tokens['--nui-accent'] || '#888') + ';"></div>' +
                    '<span style="flex:1; font-size:13px; font-weight:700; color:var(--nui-text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + saved[k].emoji + ' ' + saved[k].label + '</span>' +
                    '<button type="button" data-ca="' + k + '" style="font-size:11px; padding:2px 8px; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); background:var(--nui-surface-2); color:var(--nui-text-muted); cursor:pointer;">Apply</button>' +
                    '<button type="button" data-cd="' + k + '" style="font-size:11px; padding:2px 8px; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); background:var(--nui-surface-2); color:var(--nui-danger); cursor:pointer;">✕</button>' +
                    '</div>'
                ).join('') +
                '</div>';

            return '<details class="nui-drawer-section">' +
                '<summary class="nui-drawer-section-title" style="cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">' +
                    '🎨 Custom Theme <span style="font-size:10px; opacity:0.5;">▼</span>' +
                '</summary>' +
                '<div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">' +
                    '<div style="font-size:12px; color:var(--nui-text-muted);">Design a theme with a live preview — colors, texture, and name all in one place.</div>' +
                    '<button type="button" id="nui-ct-open" class="nui-btn nui-btn-primary nui-btn-block">🎨 Open Theme Editor</button>' +
                    savedList +
                '</div>' +
            '</details>';
        }

        function render() {
            container.innerHTML = buildHtml();

            container.querySelector('#nui-ct-open').addEventListener('click', openThemeEditorModal);

            container.querySelectorAll('[data-ca]').forEach(btn => {
                btn.addEventListener('click', () => setTheme(btn.getAttribute('data-ca')));
            });
            container.querySelectorAll('[data-cd]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const dk = btn.getAttribute('data-cd');
                    delete THEMES[dk];
                    deleteCustomTheme(dk);
                    if (getStoredTheme() === dk) setTheme(DEFAULT_THEME);
                    render();
                });
            });
        }

        render();
    }

    settingsSections.push({ id: 'theme', title: 'Theme', render: renderThemeSection });
    settingsSections.push({ id: 'custom_theme', title: 'Custom Theme', render: renderCustomThemeSection });

    function registerSettingsSection(section) {
        if (section && section.id && typeof section.render === 'function') {
            const existingIndex = settingsSections.findIndex(function (item) {
                return item && item.id === section.id;
            });
            if (existingIndex >= 0) {
                settingsSections[existingIndex] = section;
            } else {
                settingsSections.push(section);
            }
        }
    }

    // ---- Nav Editor settings section ----
    registerSettingsSection({
        id: 'nav_editor',
        title: 'Site Nav',
        render: function (container) {
            function renderNavEditor() {
                const nav = loadSiteNav();
                const isCustom = !!localStorage.getItem(CUSTOM_NAV_KEY);
                const existingDetails = container.querySelector('details.nui-drawer-section');
                const wasOpen = existingDetails ? existingDetails.open : false;

                const sectionsHtml = nav.map((section, si) => {
                    const itemRows = section.items.map((item, ii) => `
                        <div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid var(--nui-border);">
                            <span style="flex:1;font-size:12px;color:var(--nui-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.label}</span>
                            <button type="button" data-nav-del-item="${si}-${ii}" style="font-size:10px;padding:1px 6px;border-radius:var(--nui-radius-pill);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-danger);cursor:pointer;">✕</button>
                        </div>`).join('');

                    return `<div style="border:1px solid var(--nui-border);border-radius:var(--nui-radius-sm);overflow:hidden;margin-bottom:6px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:var(--nui-surface-2);border-bottom:1px solid var(--nui-border);">
                            <span style="font-size:12px;font-weight:800;color:var(--nui-text);">${section.title}</span>
                            <button type="button" data-nav-del-section="${si}" style="font-size:10px;padding:1px 6px;border-radius:var(--nui-radius-pill);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-danger);cursor:pointer;">Remove</button>
                        </div>
                        <div style="padding:4px 8px;">${itemRows || '<div style="font-size:11px;color:var(--nui-text-muted);padding:4px 0;">No items yet.</div>'}</div>
                        <div style="padding:4px 8px 8px;display:flex;gap:4px;">
                            <input type="text" data-nav-new-label="${si}" placeholder="Link label" class="nui-input" style="flex:1;padding:3px 6px;font-size:11px;">
                            <input type="text" data-nav-new-href="${si}" placeholder="/path" class="nui-input" style="flex:1;padding:3px 6px;font-size:11px;">
                            <button type="button" data-nav-add-item="${si}" style="font-size:11px;padding:3px 8px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-accent);cursor:pointer;white-space:nowrap;">+ Add</button>
                        </div>
                    </div>`;
                }).join('');

                container.innerHTML = `
                    <details class="nui-drawer-section"${wasOpen ? ' open' : ''}>
                        <summary class="nui-drawer-section-title" style="cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
                            Site Nav <span style="font-size:10px;opacity:0.5;">▼</span>
                        </summary>
                        <div style="margin-top:12px;display:flex;flex-direction:column;gap:10px;">
                            <div style="font-size:12px;color:var(--nui-text-muted);line-height:1.5;">${isCustom ? '✏️ Using your custom nav.' : 'Using default nav. Edit below to customize.'} Changes apply on next page load.</div>
                            ${sectionsHtml}
                            <div style="display:flex;gap:6px;padding-top:4px;border-top:1px solid var(--nui-border);">
                                <input type="text" id="nui-nav-new-section-title" placeholder="New section title…" class="nui-input" style="flex:1;padding:4px 8px;font-size:12px;">
                                <button type="button" id="nui-nav-add-section" class="nui-btn nui-btn-secondary nui-btn-sm" style="white-space:nowrap;">+ Section</button>
                            </div>
                            ${isCustom ? '<button type="button" id="nui-nav-reset" class="nui-btn nui-btn-danger nui-btn-block" style="margin-top:4px;">Reset to Default Nav</button>' : ''}
                        </div>
                    </details>
                `;

                container.querySelectorAll('[data-nav-del-section]').forEach(btn => {
                    btn.addEventListener('click', e => { e.stopPropagation(); const si = parseInt(btn.getAttribute('data-nav-del-section')); const n = loadSiteNav(); n.splice(si, 1); saveSiteNav(n); renderNavEditor(); });
                });
                container.querySelectorAll('[data-nav-del-item]').forEach(btn => {
                    btn.addEventListener('click', e => { e.stopPropagation(); const [si, ii] = btn.getAttribute('data-nav-del-item').split('-').map(Number); const n = loadSiteNav(); n[si].items.splice(ii, 1); saveSiteNav(n); renderNavEditor(); });
                });
                container.querySelectorAll('[data-nav-add-item]').forEach(btn => {
                    btn.addEventListener('click', e => {
                        e.stopPropagation();
                        const si = parseInt(btn.getAttribute('data-nav-add-item'));
                        const labelInput = container.querySelector(`[data-nav-new-label="${si}"]`);
                        const hrefInput = container.querySelector(`[data-nav-new-href="${si}"]`);
                        const label = labelInput.value.trim(); const href = hrefInput.value.trim();
                        if (!label) return;
                        const n = loadSiteNav(); n[si].items.push({ label, href: href || null }); saveSiteNav(n); renderNavEditor();
                    });
                });
                const addSectionBtn = container.querySelector('#nui-nav-add-section');
                if (addSectionBtn) addSectionBtn.addEventListener('click', e => { e.stopPropagation(); const titleInput = container.querySelector('#nui-nav-new-section-title'); const title = titleInput.value.trim(); if (!title) return; const n = loadSiteNav(); n.push({ title, items: [] }); saveSiteNav(n); renderNavEditor(); });
                const resetBtn = container.querySelector('#nui-nav-reset');
                if (resetBtn) resetBtn.addEventListener('click', e => { e.stopPropagation(); resetSiteNav(); renderNavEditor(); });
            }
            renderNavEditor();
        }
    });

    // ---- Drawer (NeoGo nav + nested settings) ----
    let drawerBuilt = false;
    let drawerEl = null;
    let listeners = [];

    function buildNavHtml(nav) {
        return nav.map(function (section) {
            const itemsHtml = section.items.map(function (item) {
                if (item.action === 'open-ssw') {
                    return '<div class="nui-drawer-item" data-nui-action="open-ssw">' + item.label + '</div>';
                }
                return '<a class="nui-drawer-item" href="' + (item.href || '#') + '">' + item.label + '</a>';
            }).join('');
            return (
                '<details class="nui-drawer-section">' +
                    '<summary class="nui-drawer-section-title" style="cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">' +
                        section.title + '<span style="font-size:10px;opacity:0.5;">▼</span>' +
                    '</summary>' +
                    '<div style="margin-top:8px;">' + itemsHtml + '</div>' +
                '</details>'
            );
        }).join('');
    }

    function buildDrawer() {
        if (drawerBuilt) return;
        drawerBuilt = true;

        const nav = loadSiteNav();
        const navHtml = buildNavHtml(nav);

        const backdrop = h('div', { class: 'nui-drawer-backdrop nui-reset' },
            '<div class="nui-drawer" data-active-view="nav"><div class="nui-drawer-views"><div class="nui-drawer-view" data-view="nav">' +

                '<div class="nui-drawer-profile">' +
                    '<img class="nui-drawer-avatar" data-slot="petImage" src="https://images.neopets.com/themes/h5/basic/images/mystery-icon.png" alt="Pet">' +
                    '<div>' +
                        '<div class="nui-drawer-name" data-slot="username">Neopian</div>' +
                        '<div class="nui-drawer-sub" data-slot="petname"></div>' +
                    '</div>' +
                '</div>' +

                navHtml +

                '<div class="nui-drawer-section">' +
                    '<div class="nui-drawer-item" data-action="open-daily-hub">📅 Dailies Hub</div>' +
                    '<div class="nui-drawer-item" data-action="open-global-search">🔎 Search</div>' +
                    '<div class="nui-drawer-item" data-action="open-settings">⚙️ NeoUI Settings</div>' +
                    '<a class="nui-drawer-item is-danger" href="/logout.phtml">Logout</a>' +
                '</div>' +

            '</div><div class="nui-drawer-view" data-view="settings"><div class="nui-drawer-back" data-action="back-to-nav">&larr; Back</div><div data-slot="settings-sections"></div></div></div></div>'
        );

        const drawer = backdrop.querySelector('.nui-drawer');
        const navView = backdrop.querySelector('[data-view="nav"]');
        const settingsContainer = backdrop.querySelector('[data-slot="settings-sections"]');

        function renderSettings() {
            settingsContainer.innerHTML = '';
            settingsSections.forEach(function (section) {
                const tmp = document.createElement('div');
                section.render(tmp);
                while (tmp.firstChild) settingsContainer.appendChild(tmp.firstChild);
            });
        }

        function openDrawer() { backdrop.classList.add('is-open'); }
        function closeDrawer() {
            backdrop.classList.remove('is-open');
            drawer.setAttribute('data-active-view', 'nav');
        }

        backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeDrawer(); });

        // Action wiring
        backdrop.querySelector('[data-action="open-global-search"]').addEventListener('click', () => { openGlobalSearchModal(); closeDrawer(); });
        backdrop.querySelector('[data-action="open-daily-hub"]').addEventListener('click', () => { openDayTimerHub(); closeDrawer(); });
        backdrop.querySelector('[data-action="open-settings"]').addEventListener('click', () => { renderSettings(); drawer.setAttribute('data-active-view', 'settings'); });
        backdrop.querySelector('[data-action="back-to-nav"]').addEventListener('click', () => { drawer.setAttribute('data-active-view', 'nav'); });

        // SSW action items inside nav sections
        backdrop.querySelectorAll('[data-nui-action="open-ssw"]').forEach(el => {
            el.addEventListener('click', () => { closeDrawer(); openGlobalSSW(''); });
        });

        document.body.appendChild(backdrop);
        drawerEl = backdrop;

        return { open: openDrawer, close: closeDrawer };
    }

    function openDrawer() {
        const ctrl = buildDrawer();
        if (ctrl) ctrl.open();
        else if (drawerEl) drawerEl.classList.add('is-open');
    }

    function buildNeoGoButton() {
        const btn = h('button', { class: 'nui-neogo-btn nui-reset', 'aria-label': 'Open Neopia navigation', type: 'button', style: 'color: var(--nui-accent);' }, NEOGO_MARK_SVG);
        btn.addEventListener('click', openDrawer);
        return btn;
    }

        function setProfileInfo(info) {
        buildDrawer(); if (!drawerEl) return; info = info || {};

        const map = { username: info.username, petname: info.petname };
        Object.keys(map).forEach(function (key) {
            if (map[key] === undefined) return;
            const el = drawerEl.querySelector('[data-slot="' + key + '"]');
            if (el) el.textContent = map[key];
        });

        if (info.petImage) {
            const imgEl = drawerEl.querySelector('[data-slot="petImage"]');
            if (imgEl) imgEl.src = info.petImage;
        }
    }


    function setTheme(name) {
        if (!THEMES[name]) name = DEFAULT_THEME;
        applyThemeVars(name);
        persistTheme(name);
        listeners.forEach(function (fn) {
            try { fn(name); } catch (e) {}
        });
    }

    function onThemeChange(fn) {
        if (typeof fn === 'function') listeners.push(fn);
    }

    // ---- Public init ----
    let initialized = false;
    function init(opts) {
        opts = opts || {};
        injectViewport();
        injectStylesOnce();
        applyThemeVars(getStoredTheme());
        if (opts.showNeoGoButton !== false) buildDrawer();
        initialized = true;
        return global.NeoUI;
    }

    global.NeoUI = {
        __ready: true,
        VERSION: '2.3.0',
        THEMES: THEMES,
        init: init,
        setTheme: setTheme,
        getTheme: getStoredTheme,
        onThemeChange: onThemeChange,
        injectViewport: injectViewport,
        h: h,
        mount: mount,
        neoGoButton: buildNeoGoButton,
        openDrawer: openDrawer,
        setProfileInfo: setProfileInfo,
        scrapeLegacyProfile: scrapeLegacyProfile,
        buildTopbar: buildTopbar,
        registerSettingsSection: registerSettingsSection,
        openSSW: openGlobalSSW,
        isPremium: isPremiumUser,
        isModuleEnabled: isModuleEnabled,
        get isInitialized() { return initialized; },
        openNotificationDrawer: openNotificationDrawer,
        openThemeEditor: openThemeEditorModal,
        openGlobalSearch: openGlobalSearchModal,
        openDailyTimerHub: openDayTimerHub,
        syncDailyTimer: function (id, msFromNow) {
            try {
                const raw = localStorage.getItem(DAILY_TIMERS_KEY);
                const list = Array.isArray(raw ? JSON.parse(raw) : []) ? (raw ? JSON.parse(raw) : []) : [];
                let entry = list.find(function (i) { return i && i.id === id; });
                if (!entry) { entry = { id: id }; list.push(entry); }
                entry.nextAt = Date.now() + msFromNow;
                localStorage.setItem(DAILY_TIMERS_KEY, JSON.stringify(list));
            } catch (e) {}
        },
        addCustomTheme: function(key, def) { THEMES[key] = def; saveCustomTheme(key, def); },
        deleteCustomTheme: function(key) { delete THEMES[key]; deleteCustomTheme(key); },
    };

})(window);

// =============================================================================
// VIBE RATER — window.VibeRater
// =============================================================================
(function (global) {
    'use strict';

    const VIBE_KEY = 'neoui_vibes_v1';
    const VIBE_PRESETS_KEY = 'neoui_vibe_presets_v1';

    const DEFAULT_PRESETS = [
        { id: 'friend',  label: 'Friend',   color: '#22c55e' },
        { id: 'fave',    label: 'Fave',     color: '#a855f7' },
        { id: 'sus',     label: 'Sus',      color: '#f59e0b' },
        { id: 'avoid',   label: 'Avoid',    color: '#f97316' },
        { id: 'block',   label: 'Block',    color: '#ef4444' },
        { id: 'neutral', label: 'Neutral',  color: '#6b7280' },
    ];

    function loadPresets() {
        try { return JSON.parse(localStorage.getItem(VIBE_PRESETS_KEY)) || DEFAULT_PRESETS; }
        catch (e) { return DEFAULT_PRESETS; }
    }

    function savePresets(presets) {
        try { localStorage.setItem(VIBE_PRESETS_KEY, JSON.stringify(presets)); notify('__presets__'); } catch (e) {}
    }

    function load() {
        try { return JSON.parse(localStorage.getItem(VIBE_KEY) || '{}'); } catch (e) { return {}; }
    }
    function save(data) {
        try { localStorage.setItem(VIBE_KEY, JSON.stringify(data)); } catch (e) {}
    }

    const listeners = [];
    function notify(username) {
        listeners.forEach(fn => { try { fn(username); } catch (e) {} });
    }

    global.VibeRater = {
        get PRESETS() { return loadPresets(); },

        saveCustomPresets: savePresets,

        getVibe: function (username) {
            if (!username) return null;
            const data = load();
            return data[username.toLowerCase().trim()] || null;
        },

        setVibe: function (username, presetId) {
            if (!username) return;
            const key = username.toLowerCase().trim();
            const presets = loadPresets();
            const preset = presets.find(p => p.id === presetId);
            if (!preset) return;
            const data = load();
            data[key] = { id: preset.id, label: preset.label, color: preset.color };
            save(data);
            notify(key);
        },

        clearVibe: function (username) {
            if (!username) return;
            const key = username.toLowerCase().trim();
            const data = load();
            delete data[key];
            save(data);
            notify(key);
        },

        getAllVibes: function () { return load(); },

        clearAll: function () {
            save({});
            notify('__all__');
        },

        onChange: function (fn) {
            if (typeof fn === 'function') listeners.push(fn);
        },
    };
})(window);


// NICK NAMES — window.NickNames
// =============================================================================
(function (global) {
    'use strict';

    const NICK_KEY = 'neoui_nicknames_v1';
    const listeners = [];

    function load() {
        try { return JSON.parse(localStorage.getItem(NICK_KEY) || '{}'); } catch (e) { return {}; }
    }
    function save(data) {
        try { localStorage.setItem(NICK_KEY, JSON.stringify(data)); } catch (e) {}
        listeners.forEach(fn => { try { fn(); } catch (e) {} });
    }

    global.NickNames = {
        // Returns the nickname string, or null if none set
        getNick: function (username) {
            if (!username) return null;
            return load()[username.toLowerCase().trim()] || null;
        },
        // Returns nickname if set, otherwise the raw username
        display: function (username) {
            if (!username) return username;
            return global.NickNames.getNick(username) || username;
        },
        // Returns "Nickname (username)" if nick set, otherwise just username
        displayWithFallback: function (username) {
            if (!username) return username;
            const nick = global.NickNames.getNick(username);
            return nick ? `${nick} (${username})` : username;
        },
        setNick: function (username, nick) {
            if (!username) return;
            const key = username.toLowerCase().trim();
            const data = load();
            if (nick && nick.trim()) {
                data[key] = nick.trim();
            } else {
                delete data[key];
            }
            save(data);
        },
        clearNick: function (username) {
            if (!username) return;
            const data = load();
            delete data[username.toLowerCase().trim()];
            save(data);
        },
        getAll: function () { return load(); },
        clearAll: function () { save({}); },
        onChange: function (fn) {
            if (typeof fn === 'function') listeners.push(fn);
        },
    };
})(window);




(function () {
    'use strict';

    if (/\/neomessages\.phtml/.test(location.pathname)) {
        if (!window.NeoUI || !window.NeoUI.isModuleEnabled('neomail')) return;
        try { run(); } catch (err) { showFatalError(err); }
    }

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

        // --- Vibe Rater integration (optional companion script) -----------
        // Purely a reader: if "Neopets - User Vibe Rater" is installed, it
        // exposes window.VibeRater = { getVibe, onChange }. Neomail has no
        // vibe data or storage of its own, and no-ops cleanly if the
        // companion script isn't installed. Only applied to received
        // messages, never the current user's own sent bubbles.
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

                // Update bubbles
                document.querySelectorAll(`.nui-bubble[data-vibe-user="${CSS.escape(key)}"]`).forEach(function (el) {
                    applyVibeTint(el, key);
                });

                // ADD THIS: Update sidebar items
                document.querySelectorAll(`.nui-item[data-vibe-user="${CSS.escape(key)}"]`).forEach(function (el) {
                    applyVibeTint(el, key);
                });
            });
        }


        function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

        // Wraps a username in a link to their userlookup page. Opens in a new
        // tab (so people don't lose their place in the Neomail SPA) and stops
        // the click from bubbling up to any parent row/item click handler.
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
                            <textarea name="message_body" rows="6" class="nui-textarea" placeholder="Write your message here..." required maxlength="2000"></textarea>
                            <div id="nui-compose-counter" style="text-align:right;font-size:11px;font-weight:800;color:var(--nui-text-muted);margin-top:3px;">0 / 2000</div>
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
            const composeTA = form.querySelector('textarea[name="message_body"]');
            const composeCounter = form.querySelector('#nui-compose-counter');
            composeTA.addEventListener('input', () => {
                const len = composeTA.value.length;
                const pct = len / 2000;
                composeCounter.textContent = `${len} / 2000`;
                composeCounter.style.color = pct >= 1 ? 'var(--nui-danger)' : pct >= 0.85 ? 'var(--nui-warning)' : 'var(--nui-text-muted)';
            });

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
            // Use the shared app-wide topbar builder instead of rolling a
            // second one — this was duplicating .nui-header-wrapper/.nui-topbar
            // (and its background texture layer) on top of the real one.
            const profile = NeoUI.scrapeLegacyProfile();
            const topbarWrapper = NeoUI.buildTopbar({
                stats: { np: profile.np, nc: profile.nc },
                hasNotification: profile.hasNotification
            });

            // NeoMail's Inbox/Sent/Archive tab strip is unique to this module,
            // so it still gets built here — just appended after the shared
            // topbar rather than baked into a second copy of it.
            const hnav = document.createElement('div');
            hnav.className = 'nui-hnav nui-reset';
            hnav.style.cssText = 'position: fixed; top: var(--nui-topbar-h); left: 0; right: 0; z-index: 9998; background: var(--nui-surface); border-bottom: 1px solid var(--nui-border); box-shadow: 0 2px 6px var(--nui-shadow);';
            hnav.innerHTML = `
                <a class="nui-pill is-active" data-tab="inbox">Inbox</a>
                <a class="nui-pill" data-tab="sent">Sent</a>
                <a class="nui-pill" data-tab="archive">Archive</a>

                <div style="flex: 1;"></div>

                <a class="nui-pill" style="cursor: pointer;" id="neomail-select-btn">Select</a>
                <a class="nui-pill" style="background: var(--nui-accent); color: var(--nui-accent-ink); border: none; cursor: pointer;" id="neomail-compose-btn">
                    <span style="font-size: 16px; font-weight: 800; line-height: 1; vertical-align: middle; margin-right: 4px;">+</span>Compose
                </a>
            `;
            topbarWrapper.insertAdjacentElement('afterend', hnav);

            hnav.querySelectorAll('.nui-pill').forEach(function (pill) {
                pill.addEventListener('click', function () {
                    if (pill.id === 'neomail-compose-btn') return;
                    hnav.querySelectorAll('.nui-pill').forEach(function (p) { p.classList.remove('is-active'); });
                    pill.classList.add('is-active'); renderSidebarList(pill.getAttribute('data-tab'));
                });
            });

            const composeBtn = hnav.querySelector('#neomail-compose-btn');
            if (composeBtn) {
                composeBtn.addEventListener('click', renderComposeView);
            }

            const selectBtn = hnav.querySelector('#neomail-select-btn');
            if (selectBtn) {
                selectBtn.addEventListener('click', () => {
                    bulkSelectMode = !bulkSelectMode;
                    selectedThreadKeys.clear();
                    selectBtn.textContent = bulkSelectMode ? 'Done' : 'Select';
                    selectBtn.style.background = bulkSelectMode ? 'var(--nui-accent-soft)' : '';
                    selectBtn.style.color = bulkSelectMode ? 'var(--nui-accent)' : '';
                    // Re-render the list in the new mode
                    const activeTab = hnav.querySelector('.nui-pill.is-active[data-tab]');
                    renderSidebarList(activeTab ? activeTab.getAttribute('data-tab') : 'inbox');
                });
            }
        }



        let allThreads = [];
        let serverInboxCount = 0; // raw individual message count from the server
        let bulkSelectMode = false;
        const selectedThreadKeys = new Set();
        const urlParams = new URLSearchParams(window.location.search);

        injectTopbar();
        initApp();

        async function initApp() {
            document.documentElement.classList.add('nui-spa-active');

            // 1. Declare the main app container FIRST with a strictly unique name
            const neomailAppContainer = document.createElement('div');
            neomailAppContainer.id = 'neomail-app';

            NeoUI.registerSettingsSection({
                id: 'neomail_data',
                title: 'Data Management',
                render: function (settingsContainer) {
                                        settingsContainer.innerHTML = `
                        <details class="nui-drawer-section">
                            <summary class="nui-drawer-section-title" style="cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
                                Data Management <span style="font-size:10px; opacity:0.5;">▼</span>
                            </summary>
                            <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
                                <div style="font-size: 13px; color: var(--nui-text-muted);">Manage your local message archive and avatar cache.</div>
                                <button type="button" class="nui-btn nui-btn-warning nui-btn-block" id="nui-clear-archive">Clear Local Archive</button>
                                <button type="button" class="nui-btn nui-btn-danger nui-btn-block" id="nui-clear-avatars">Clear Avatar Cache</button>
                                <span id="nui-settings-status" style="font-size: 13px; font-weight: 600; text-align: center; display: block; margin-top: 4px;"></span>
                            </div>
                        </details>
                    `;


                    settingsContainer.querySelector('#nui-clear-archive').addEventListener('click', function() {
                        localStorage.removeItem(ARCHIVE_KEY);
                        const status = settingsContainer.querySelector('#nui-settings-status');
                        status.style.color = 'var(--nui-warning)';
                        status.textContent = 'Archive cleared! Refresh page to resync.';
                        setTimeout(() => status.textContent = '', 4000);
                    });

                    settingsContainer.querySelector('#nui-clear-avatars').addEventListener('click', function() {
                        localStorage.removeItem(AVATAR_KEY);
                        const status = settingsContainer.querySelector('#nui-settings-status');
                        status.style.color = 'var(--nui-success)';
                        status.textContent = 'Avatar cache cleared!';
                        setTimeout(() => status.textContent = '', 4000);
                    });
                }
            });

            NeoUI.registerSettingsSection({
                id: 'neomail_vibe',
                title: 'Vibe Rater',
                render: function (settingsContainer) {
                    function renderVibeSettings() {
                        const vibes = window.VibeRater.getAllVibes();
                        const keys = Object.keys(vibes);
                        const presets = window.VibeRater.PRESETS;

                        // Preserve open state of the details wrapper if it already exists
                        const existingDetails = settingsContainer.querySelector('details.nui-drawer-section');
                        const wasOpen = existingDetails ? existingDetails.open : false;

                        const rows = keys.length === 0
                            ? '<div style="font-size:13px; color:var(--nui-text-muted); padding:8px 0;">No vibes assigned yet.</div>'
                            : keys.map(u => {
                                const v = vibes[u];
                                return '<div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--nui-border);">' +
                                    '<div style="width:12px; height:12px; border-radius:50%; background:' + v.color + '; flex-shrink:0;"></div>' +
                                    '<span style="flex:1; font-size:13px; font-weight:700; color:var(--nui-text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + u + '</span>' +
                                    '<span style="font-size:11px; color:var(--nui-text-muted); font-weight:600;">' + v.label + '</span>' +
                                    '<button type="button" data-vr="' + u + '" style="font-size:11px; padding:2px 8px; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); background:var(--nui-surface-2); color:var(--nui-danger); cursor:pointer;">✕</button>' +
                                '</div>';
                            }).join('');

                        const presetList = presets.map((p, idx) => `
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                                <input type="color" data-preset-idx="${idx}" value="${p.color}" style="width:24px; height:24px; border:none; padding:0; cursor:pointer; background:none;">
                                <input type="text" data-preset-label="${idx}" value="${p.label}" class="nui-input" style="padding:4px 8px; font-size:12px; flex:1;">
                                <button type="button" data-preset-del="${idx}" style="background:none; border:none; color:var(--nui-danger); cursor:pointer; font-weight:bold;">✕</button>
                            </div>
                        `).join('');

                        settingsContainer.innerHTML = `
                            <details class="nui-drawer-section"${wasOpen ? ' open' : ''}>
                                <summary class="nui-drawer-section-title" style="cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
                                    Vibe Rater <span style="font-size:10px; opacity:0.5;">▼</span>
                                </summary>
                                <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 16px;">
                                    <div>
                                        <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--nui-text-faint); letter-spacing:0.5px; margin-bottom:6px;">Presets</div>
                                        <div style="font-size:12px; color:var(--nui-text-muted); margin-bottom: 10px; line-height:1.5;">Customize your vibe options. Edits are saved automatically.</div>
                                        <div id="nui-vibe-presets-container">
                                            ${presetList}
                                            <button type="button" id="nui-add-preset" class="nui-btn nui-btn-secondary nui-btn-sm nui-btn-block" style="margin-top:8px;">+ Add New Vibe</button>
                                        </div>
                                    </div>
                                    <div>
                                        <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--nui-text-faint); letter-spacing:0.5px; margin-bottom:6px;">Assigned Users</div>
                                        <div>${rows}</div>
                                        ${keys.length > 0 ? '<button type="button" id="nui-vr-clear-all" class="nui-btn nui-btn-danger nui-btn-block" style="margin-top:10px;">Clear All Assigned</button>' : ''}
                                    </div>
                                </div>
                            </details>
                        `;

                        const updatePresets = () => {
                            const newPresets = [];
                            settingsContainer.querySelectorAll('[data-preset-idx]').forEach(colorInput => {
                                const idx = colorInput.getAttribute('data-preset-idx');
                                const labelInput = settingsContainer.querySelector(`[data-preset-label="${idx}"]`);
                                const id = labelInput.value.toLowerCase().replace(/[^a-z0-9]/g, '_') || `vibe_${idx}`;
                                newPresets.push({ id, label: labelInput.value || 'Custom', color: colorInput.value });
                            });
                            window.VibeRater.saveCustomPresets(newPresets);
                        };

                        settingsContainer.querySelectorAll('[data-preset-idx], [data-preset-label]').forEach(input => {
                            input.addEventListener('change', updatePresets);
                        });

                        settingsContainer.querySelectorAll('[data-preset-del]').forEach(btn => {
                            btn.addEventListener('click', () => {
                                btn.parentElement.remove();
                                updatePresets();
                                renderVibeSettings();
                            });
                        });

                        settingsContainer.querySelector('#nui-add-preset').addEventListener('click', (e) => {
                            e.stopPropagation();
                            const current = window.VibeRater.PRESETS;
                            current.push({ id: `new_${Date.now()}`, label: 'New Vibe', color: '#888888' });
                            window.VibeRater.saveCustomPresets(current);
                            renderVibeSettings();
                        });
                        settingsContainer.querySelector('#nui-add-preset').addEventListener('touchend', (e) => {
                            e.preventDefault(); e.stopPropagation();
                            const current = window.VibeRater.PRESETS;
                            current.push({ id: `new_${Date.now()}`, label: 'New Vibe', color: '#888888' });
                            window.VibeRater.saveCustomPresets(current);
                            renderVibeSettings();
                        });

                        settingsContainer.querySelectorAll('[data-vr]').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                window.VibeRater.clearVibe(btn.getAttribute('data-vr'));
                                renderVibeSettings();
                            });
                        });

                        const clearAll = settingsContainer.querySelector('#nui-vr-clear-all');
                        if (clearAll) clearAll.addEventListener('click', (e) => { e.stopPropagation(); window.VibeRater.clearAll(); renderVibeSettings(); });
                    }

                    renderVibeSettings();
                    window.VibeRater.onChange((changed) => {
                        if (changed === '__all__' || changed === '__presets__') renderVibeSettings();
                    });
                }
            });

            NeoUI.registerSettingsSection({
                id: 'neomail_nicknames',
                title: 'Nicknames',
                render: function (container) {
                    function renderNickSettings() {
                        const nicks = window.NickNames ? window.NickNames.getAll() : {};
                        const keys = Object.keys(nicks);
                        const existingDetails = container.querySelector('details.nui-drawer-section');
                        const wasOpen = existingDetails ? existingDetails.open : true;

                        const rows = keys.length === 0
                            ? '<div style="font-size:13px;color:var(--nui-text-muted);padding:8px 0;">No nicknames set yet.</div>'
                            : keys.map(u => `
                                <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--nui-border);">
                                    <div style="flex:1;min-width:0;">
                                        <div style="font-size:13px;font-weight:700;color:var(--nui-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(nicks[u])}</div>
                                        <div style="font-size:11px;color:var(--nui-text-muted);">${escapeHTML(u)}</div>
                                    </div>
                                    <button type="button" data-nick-edit="${escapeHTML(u)}" style="font-size:11px;padding:2px 8px;border-radius:var(--nui-radius-pill);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-text-muted);cursor:pointer;">✏️</button>
                                    <button type="button" data-nick-del="${escapeHTML(u)}" style="font-size:11px;padding:2px 8px;border-radius:var(--nui-radius-pill);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-danger);cursor:pointer;">✕</button>
                                </div>`).join('');

                        container.innerHTML = `
                            <details class="nui-drawer-section"${wasOpen ? ' open' : ''}>
                                <summary class="nui-drawer-section-title" style="cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
                                    Nicknames <span style="font-size:10px;opacity:0.5;">▼</span>
                                </summary>
                                <div style="margin-top:12px;display:flex;flex-direction:column;gap:12px;">
                                    <div style="font-size:12px;color:var(--nui-text-muted);line-height:1.5;">Set display names for other users. Shown in Neomail and Neoboards instead of their actual username.</div>
                                    <div>${rows}</div>
                                    ${keys.length > 0 ? '<button type="button" id="nui-nick-clear-all" class="nui-btn nui-btn-danger nui-btn-block">Clear All Nicknames</button>' : ''}
                                </div>
                            </details>
                        `;

                        container.querySelectorAll('[data-nick-edit]').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const u = btn.getAttribute('data-nick-edit');
                                const current = nicks[u] || '';
                                const input = prompt(`New nickname for "${u}" (blank to clear):`, current);
                                if (input === null) return;
                                if (input.trim()) { window.NickNames.setNick(u, input.trim()); }
                                else { window.NickNames.clearNick(u); }
                                renderNickSettings();
                            });
                        });

                        container.querySelectorAll('[data-nick-del]').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                window.NickNames.clearNick(btn.getAttribute('data-nick-del'));
                                renderNickSettings();
                            });
                        });

                        const clearAll = container.querySelector('#nui-nick-clear-all');
                        if (clearAll) clearAll.addEventListener('click', (e) => { e.stopPropagation(); window.NickNames.clearAll(); renderNickSettings(); });
                    }
                    renderNickSettings();
                    if (window.NickNames) window.NickNames.onChange(() => renderNickSettings());
                }
            });
            const sidebar = document.createElement('div');
            sidebar.className = 'neomail-pane';
            sidebar.innerHTML = `<div class="neomail-message-list" id="neomail-message-list"><div class="nui-empty"><span class="nui-text-muted">Loading inbox...</span></div></div>`;

            const viewer = document.createElement('div');
            viewer.className = 'neomail-viewer';
            viewer.innerHTML = `
                <div class="nui-empty" id="neomail-viewer-empty"><span class="nui-empty-emoji">📭</span>Select a conversation.</div>
                <div id="neomail-viewer-content" style="display:none;"></div>
            `;

            neomailAppContainer.appendChild(sidebar);
            neomailAppContainer.appendChild(viewer);
            document.body.appendChild(neomailAppContainer);













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

            // Store the raw server message count — used by updateTabCounts for the
            // "N messages on Neopets" display (distinct from thread count)
            serverInboxCount = liveMessages.length;

            allThreads = syncAndProcessThreads(liveMessages);
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

        function updateTabCounts() {
            const hnav = document.querySelector('.nui-hnav');
            if (!hnav) return;
            const inboxThreads = filterThreadsForTab('inbox');
            const unread = inboxThreads.filter(t => !t.isRead).length;
            const inboxPill = hnav.querySelector('[data-tab="inbox"]');
            if (inboxPill) {
                // serverInboxCount is the real count of individual messages in the
                // Neopets inbox (what the counter in the old nav would show).
                // unread is derived from our local thread state.
                let countStr = 'Inbox';
                if (serverInboxCount > 0) {
                    countStr = unread > 0
                        ? `Inbox (${unread} unread · ${serverInboxCount} msgs)`
                        : `Inbox (${serverInboxCount} msgs)`;
                } else if (unread > 0) {
                    countStr = `Inbox (${unread} unread)`;
                }
                inboxPill.textContent = countStr;
                inboxPill.style.color = unread > 0 ? 'var(--nui-accent)' : '';
                inboxPill.style.fontWeight = unread > 0 ? '800' : '';
            }
        }

        function renderSidebarList(tab) {
            const listContainer = document.getElementById('neomail-message-list'); listContainer.innerHTML = '';
            const filteredThreads = filterThreadsForTab(tab);
            updateTabCounts();
            if (filteredThreads.length === 0) { listContainer.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">\u{1F4ED}</span>No conversations found.</div>`; return; }

            filteredThreads.forEach(thread => {
                const item = document.createElement('div'); item.className = `nui-item nui-reset ${thread.isRead ? '' : 'is-unread'}`;
                if (!thread.isSent) applyVibeTint(item, thread.sender);

                // Display name: nickname if set, otherwise raw username
                const displayName = window.NickNames ? window.NickNames.display(thread.sender) : thread.sender;
                const hasNick = displayName !== thread.sender;

                let badges = '';
                if (thread.isFullyLocal) badges += `<span class="nui-badge nui-badge-warning">Local Archive</span> `;
                if (thread.messages.length > 1) badges += `<span class="nui-badge">${thread.messages.length} msgs</span>`;
                if (hasNick) badges += `<span class="nui-badge" style="opacity:0.6;">${escapeHTML(thread.sender)}</span>`;

                const avatarUrl = getAvatar(thread.sender);
                const avatarHTML = avatarUrl ? `<img class="nui-avatar" data-sender="${escapeHTML(thread.sender)}" src="${avatarUrl}" alt="" loading="lazy">` : `<div class="nui-avatar-fallback" data-sender="${escapeHTML(thread.sender)}">${escapeHTML(displayName.charAt(0).toUpperCase())}</div>`;

                if (bulkSelectMode) {
                    const isChecked = selectedThreadKeys.has(thread.key);
                    item.style.cssText = 'position: relative; cursor: pointer;';
                    if (isChecked) item.classList.add('is-active');
                    const checkSvg = isChecked
                        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--nui-accent-ink)" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
                        : '';
                    const checkBorder = isChecked ? 'var(--nui-accent)' : 'var(--nui-border)';
                    const checkBg = isChecked ? 'var(--nui-accent)' : 'transparent';
                    item.innerHTML = `
                        <div class="nui-avatar-wrapper">${avatarHTML}<div class="nui-dot"></div></div>
                        <div class="nui-item-main">
                            <div class="nui-item-top"><span class="nui-item-title">${escapeHTML(displayName)}</span><span class="nui-item-meta">${thread.latestDateStr}</span></div>
                            <div class="nui-item-bottom"><span class="nui-item-subtitle">${thread.baseSubject}</span><div>${badges}</div></div>
                        </div>
                        <div style="display:flex; align-items:center; justify-content:center; padding: 0 4px; flex-shrink:0;">
                            <div style="width:22px; height:22px; border-radius:6px; border:2px solid ${checkBorder}; background:${checkBg}; display:flex; align-items:center; justify-content:center; transition:all 0.1s;">${checkSvg}</div>
                        </div>
                    `;
                    item.addEventListener('click', () => {
                        if (selectedThreadKeys.has(thread.key)) {
                            selectedThreadKeys.delete(thread.key);
                        } else {
                            selectedThreadKeys.add(thread.key);
                        }
                        renderSidebarList(tab);
                        updateBulkActionBar(tab);
                    });
                } else {
                    item.innerHTML = `
                        <div class="nui-avatar-wrapper">${avatarHTML}<div class="nui-dot"></div></div>
                        <div class="nui-item-main">
                            <div class="nui-item-top"><span class="nui-item-title">${escapeHTML(displayName)}</span><span class="nui-item-meta">${thread.latestDateStr}</span></div>
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
                }
                listContainer.appendChild(item);
            });

            updateBulkActionBar(tab);
        }

        function updateBulkActionBar(tab) {
            const existing = document.getElementById('neomail-bulk-bar');
            if (!bulkSelectMode || selectedThreadKeys.size === 0) {
                if (existing) existing.remove();
                return;
            }
            if (existing) existing.remove();

            const bar = document.createElement('div');
            bar.id = 'neomail-bulk-bar';
            bar.style.cssText = 'position: sticky; bottom: 0; z-index: 9999; background: var(--nui-surface); border-top: 1px solid var(--nui-border); padding: var(--nui-space-3) var(--nui-space-4); display: flex; align-items: center; gap: var(--nui-space-3); box-shadow: 0 -4px 16px var(--nui-shadow);';
            const selCount = selectedThreadKeys.size;
            bar.innerHTML = `
                <span style="flex:1; font-size:13px; font-weight:700; color:var(--nui-text-muted);">${selCount} thread${selCount !== 1 ? 's' : ''} selected</span>
                <button type="button" class="nui-btn nui-btn-secondary nui-btn-sm" id="neomail-bulk-select-all">All</button>
                <button type="button" class="nui-btn nui-btn-danger nui-btn-sm" id="neomail-bulk-delete">Delete</button>
            `;

            bar.querySelector('#neomail-bulk-select-all').addEventListener('click', () => {
                filterThreadsForTab(tab).forEach(t => selectedThreadKeys.add(t.key));
                renderSidebarList(tab);
            });

            bar.querySelector('#neomail-bulk-delete').addEventListener('click', async () => {
                const filteredThreads = filterThreadsForTab(tab);
                const toDelete = filteredThreads.filter(t => selectedThreadKeys.has(t.key));
                const btn = bar.querySelector('#neomail-bulk-delete');
                btn.disabled = true; btn.textContent = 'Deleting...';

                for (const thread of toDelete) {
                    const serverMessages = thread.messages.filter(m => m.isOnServer);
                    if (serverMessages.length > 0) {
                        const payload = new URLSearchParams({ folder: 'Inbox', action: 'Delete Messages' });
                        serverMessages.forEach(m => payload.append('checkbox_arr[]', m.id));
                        await fetch('/modify_neomessages.phtml', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(() => {});
                    }
                }

                const deleteKeys = new Set(toDelete.map(t => t.key));
                let archive = getLocalArchive();
                archive = archive.filter(a => {
                    const k = a.isSent
                        ? `${a.recipient}::${a.baseSubject}`
                        : `${a.sender}::${a.baseSubject}`;
                    return !deleteKeys.has(k);
                });
                saveLocalArchive(archive);
                allThreads = allThreads.filter(t => !deleteKeys.has(t.key));

                selectedThreadKeys.clear();
                bulkSelectMode = false;
                const selectBtn = document.getElementById('neomail-select-btn');
                if (selectBtn) { selectBtn.textContent = 'Select'; selectBtn.style.background = ''; selectBtn.style.color = ''; }

                const activeItem = document.querySelector('.nui-item.is-active');
                if (activeItem) {
                    const wasActive = toDelete.some(t => {
                        const titleEl = activeItem.querySelector('.nui-item-title');
                        return titleEl && t.sender === titleEl.textContent.trim();
                    });
                    if (wasActive) {
                        document.getElementById('neomail-viewer-content').style.display = 'none';
                        const emptyViewer = document.getElementById('neomail-viewer-empty');
                        emptyViewer.style.display = 'block'; emptyViewer.innerHTML = '<span class="nui-empty-emoji">\uD83D\uDDD1\uFE0F</span>Threads deleted.';
                        const app = document.getElementById('neomail-app');
                        if (app) app.classList.remove('thread-open');
                    }
                }

                renderSidebarList(tab);
            });

            const listContainer = document.getElementById('neomail-message-list');
            if (listContainer) listContainer.appendChild(bar);
        }

                function createMessageNode(msg) {
            const msgNode = document.createElement('div');
            msgNode.className = `nui-bubble nui-reset ${msg.isSent ? 'is-mine' : 'is-theirs'}`;

            if (!msg.isSent) applyVibeTint(msgNode, msg.sender);

            let bodyHTML = msg.body;
            if (msg.isSent) {
                bodyHTML = msg.isScrapedHTML ? `<div>${msg.body}</div>` : `<div>${escapeHTML(msg.body)}</div>`;
            }

                        const displayName = msg.isSent ? getUsername() : msg.sender;
            const profileUrl = `/userlookup.phtml?user=${encodeURIComponent(displayName)}`;

            const avatarUrl = msg.isSent ? getAvatar(getUsername()) : getAvatar(msg.sender);
            const avatarHTML = avatarUrl
                ? `<img class="nui-avatar" style="width:24px;height:24px;" data-sender="${escapeHTML(displayName)}" src="${avatarUrl}" alt="" loading="lazy">`
                : `<div class="nui-avatar-fallback" style="width:24px;height:24px;font-size:12px;" data-sender="${escapeHTML(displayName)}">${escapeHTML(displayName.charAt(0).toUpperCase())}</div>`;

            // Wrap the avatar in a link that stops propagation so it doesn't trigger unintended card clicks
            const linkedAvatarHTML = `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" style="display:flex; text-decoration:none;">${avatarHTML}</a>`;

            msgNode.innerHTML = `
                <div class="nui-bubble-header">
                    <span class="nui-bubble-who">${linkedAvatarHTML}<span>${userLink(displayName)}</span></span>
                    <span style="display:flex; align-items:center; gap:8px;">
                        <span class="nui-date-text">${msg.date}</span>
                    </span>
                </div>
                <div class="nui-bubble-body">${(msg.isSent || msg.body) ? bodyHTML : '<span class="nui-text-muted" style="font-style:italic;">Loading...</span>'}</div>
            `;


            // Per-message delete button (all messages)
            {
                const headerRight = msgNode.querySelector('.nui-bubble-header > span:last-child');
                const delBtn = document.createElement('button');
                delBtn.type = 'button';
                delBtn.title = 'Delete this message';
                delBtn.style.cssText = 'cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; background:none; border:none; border-radius:50%; color:var(--nui-text-faint); font-size:14px; line-height:1; padding:0; transition:color 0.12s, background 0.12s;';
                delBtn.innerHTML = '×'; // ×
                delBtn.addEventListener('mouseenter', () => { delBtn.style.color = 'var(--nui-danger)'; delBtn.style.background = 'var(--nui-danger-soft)'; });
                delBtn.addEventListener('mouseleave', () => { delBtn.style.color = 'var(--nui-text-faint)'; delBtn.style.background = 'none'; });
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Remove from local archive
                    if (msg.id) {
                        let archive = getLocalArchive();
                        archive = archive.filter(a => a.id !== msg.id);
                        saveLocalArchive(archive);
                    }
                    // Remove from DOM with a quick fade
                    msgNode.style.transition = 'opacity 0.18s';
                    msgNode.style.opacity = '0';
                    setTimeout(() => msgNode.remove(), 180);
                });
                headerRight.appendChild(delBtn);
            }

            // Only add the vibe button to messages you received, not ones you sent
            if (!msg.isSent) {
                const headerRight = msgNode.querySelector('.nui-bubble-header > span:last-child');
                const vibeBtn = document.createElement('button');
                vibeBtn.type = 'button';
                vibeBtn.style.cssText = 'cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:2px; background:none; border:none; border-radius:50%; position:relative;';

                const p = msg.sender;
                const vibeKey = p.toLowerCase().trim();

                function updateVibeDot() {
                    const vibe = window.VibeRater.getVibe(p);
                    const c = vibe ? vibe.color : 'var(--nui-border)';
                    const op = vibe ? '1' : '0.4';
                    vibeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="6" fill="${c}" opacity="${op}"/>
                        <circle cx="9" cy="9" r="8" stroke="${c}" stroke-width="1.5" fill="none" opacity="${vibe ? '0.35' : '0.2'}"/>
                    </svg>`;
                    vibeBtn.title = vibe ? `Vibe: ${vibe.label} — tap to change` : 'Set vibe';
                }
                updateVibeDot();

                window.VibeRater.onChange(changed => {
                    if (changed === vibeKey || changed === '__all__') updateVibeDot();
                });

                vibeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.nui-vibe-pop').forEach(el => el.remove());

                    const pop = document.createElement('div');
                    pop.className = 'nui-vibe-pop';
                    pop.style.cssText = 'position:fixed; z-index:999999; background:var(--nui-surface); border:1px solid var(--nui-border); border-radius:var(--nui-radius-md); padding:8px; display:flex; flex-direction:column; gap:4px; box-shadow:0 4px 16px var(--nui-shadow); min-width:120px;';

                    window.VibeRater.PRESETS.forEach(preset => {
                        const opt = document.createElement('button');
                        opt.type = 'button';
                        opt.style.cssText = 'display:flex; align-items:center; gap:8px; width:100%; padding:5px 8px; border:none; border-radius:6px; background:none; cursor:pointer; font-size:12px; font-weight:700; color:var(--nui-text); text-align:left; transition:background 0.1s;';
                        opt.innerHTML = `<span style="width:10px; height:10px; border-radius:50%; background:${preset.color}; flex-shrink:0;"></span>${preset.label}`;
                        opt.addEventListener('mouseenter', () => { opt.style.background = preset.color + '22'; });
                        opt.addEventListener('mouseleave', () => { opt.style.background = 'none'; });
                        opt.addEventListener('click', () => { window.VibeRater.setVibe(p, preset.id); pop.remove(); });
                        pop.appendChild(opt);
                    });

                    const clearOpt = document.createElement('button');
                    clearOpt.type = 'button';
                    clearOpt.style.cssText = 'display:flex; align-items:center; gap:8px; width:100%; padding:5px 8px; border:none; border-radius:6px; background:none; cursor:pointer; font-size:12px; font-weight:700; color:var(--nui-danger); text-align:left; border-top:1px solid var(--nui-border); margin-top:2px; padding-top:7px; transition:background 0.1s;';
                    clearOpt.textContent = '✕  Clear vibe';
                    clearOpt.addEventListener('mouseenter', () => { clearOpt.style.background = 'var(--nui-danger-soft)'; });
                    clearOpt.addEventListener('mouseleave', () => { clearOpt.style.background = 'none'; });
                    clearOpt.addEventListener('click', () => { window.VibeRater.clearVibe(p); pop.remove(); });
                    pop.appendChild(clearOpt);

                    if (window.NickNames) {
                        const nickOpt = document.createElement('button');
                        nickOpt.type = 'button';
                        const currentNick = window.NickNames.getNick(p);
                        nickOpt.style.cssText = 'display:flex; align-items:center; gap:8px; width:100%; padding:5px 8px; border:none; border-radius:6px; background:none; cursor:pointer; font-size:12px; font-weight:700; color:var(--nui-text-muted); text-align:left; border-top:1px solid var(--nui-border); margin-top:2px; padding-top:7px; transition:background 0.1s;';
                        nickOpt.textContent = currentNick ? `✏️  Edit nick (${currentNick})` : '✏️  Set nickname';
                        nickOpt.addEventListener('mouseenter', () => { nickOpt.style.background = 'var(--nui-surface-2)'; });
                        nickOpt.addEventListener('mouseleave', () => { nickOpt.style.background = 'none'; });
                        nickOpt.addEventListener('click', (e) => {
                            e.stopPropagation();
                            pop.remove();
                            const input = prompt(`Nickname for "${p}" (leave blank to clear):`, currentNick || '');
                            if (input === null) return;
                            if (input.trim()) { window.NickNames.setNick(p, input.trim()); }
                            else { window.NickNames.clearNick(p); }
                            const activeTab = document.querySelector('.nui-pill.is-active[data-tab]');
                            if (activeTab) renderSidebarList(activeTab.getAttribute('data-tab'));
                        });
                        pop.appendChild(nickOpt);
                    }

                    document.body.appendChild(pop);
                    const btnRect = vibeBtn.getBoundingClientRect();
                    const popH = pop.offsetHeight || 200;
                    const spaceAbove = btnRect.top;
                    const spaceBelow = window.innerHeight - btnRect.bottom;
                    if (spaceAbove >= popH + 6 || spaceAbove > spaceBelow) {
                        pop.style.bottom = (window.innerHeight - btnRect.top + 6) + 'px';
                        pop.style.top = 'auto';
                    } else {
                        pop.style.top = (btnRect.bottom + 6) + 'px';
                        pop.style.bottom = 'auto';
                    }
                    pop.style.left = Math.min(btnRect.left, window.innerWidth - 136) + 'px';
                    const close = (ev) => { if (!pop.contains(ev.target) && ev.target !== vibeBtn) { pop.remove(); document.removeEventListener('click', close); } };
                    setTimeout(() => document.addEventListener('click', close), 0);
                });

                headerRight.appendChild(vibeBtn);
            }

            return msgNode;
        }


        async function loadThreadIntoViewer(thread, container) {
            const displayName = window.NickNames ? window.NickNames.display(thread.sender) : thread.sender;
            const hasNick = displayName !== thread.sender;
            const nickLabel = hasNick ? `${escapeHTML(displayName)} <span style="font-size:11px;opacity:0.6;">(${escapeHTML(thread.sender)})</span>` : escapeHTML(thread.sender);

            container.innerHTML = `
                <div class="neomail-viewer-header">
                    <button type="button" class="neomail-back-btn" id="neomail-back-btn"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>Back</button>
                    <div class="neomail-viewer-subject">${thread.baseSubject}</div>
                    <div class="neomail-viewer-meta" style="display:flex;align-items:center;gap:8px;">
                        Thread with <a href="/userlookup.phtml?user=${encodeURIComponent(thread.sender)}" target="_blank" rel="noopener noreferrer" style="color:var(--nui-accent);font-weight:700;">${nickLabel}</a>
                        <button type="button" id="neomail-nick-btn" title="Set nickname" style="font-size:11px;padding:2px 7px;border-radius:var(--nui-radius-pill);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-text-muted);cursor:pointer;">✏️ ${hasNick ? 'Edit nick' : 'Nickname'}</button>
                    </div>
                </div>
                <div class="neomail-thread-list" id="neomail-thread-list"></div>
                <div id="neomail-reply-container"></div>
            `;

            // Nickname button handler
            const nickBtn = container.querySelector('#neomail-nick-btn');
            if (nickBtn && window.NickNames) {
                nickBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const current = window.NickNames.getNick(thread.sender) || '';
                    const input = prompt(`Nickname for "${thread.sender}" (leave blank to clear):`, current);
                    if (input === null) return; // cancelled
                    if (input.trim()) {
                        window.NickNames.setNick(thread.sender, input.trim());
                    } else {
                        window.NickNames.clearNick(thread.sender);
                    }
                    // Re-render thread + sidebar to reflect change
                    loadThreadIntoViewer(thread, container);
                    const activeTab = document.querySelector('.nui-pill.is-active[data-tab]');
                    if (activeTab) renderSidebarList(activeTab.getAttribute('data-tab'));
                });
            }

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
                        <textarea name="message_body" rows="3" class="nui-textarea" placeholder="Write a reply..." required maxlength="2000" style="text-align: center;"></textarea>
                        <div class="nui-inline-reply-counter" style="text-align:right;font-size:11px;font-weight:800;color:var(--nui-text-muted);margin-top:-6px;width:100%;">0 / 2000</div>
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
            const inlineTA = form.querySelector('textarea[name="message_body"]');
            const inlineCounter = form.querySelector('.nui-inline-reply-counter');
            inlineTA.addEventListener('input', () => {
                const len = inlineTA.value.length;
                const pct = len / 2000;
                inlineCounter.textContent = `${len} / 2000`;
                inlineCounter.style.color = pct >= 1 ? 'var(--nui-danger)' : pct >= 0.85 ? 'var(--nui-warning)' : 'var(--nui-text-muted)';
            });

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
                document.getElementById('neomail-viewer-content').style.display = 'none';
                const emptyViewer = document.getElementById('neomail-viewer-empty');
                emptyViewer.style.display = 'block'; emptyViewer.innerHTML = '<span class="nui-empty-emoji">🗑️</span>Thread deleted.';
                const app = document.getElementById('neomail-app'); if (app) app.classList.remove('thread-open');
                const activeItem = document.querySelector('.nui-item.is-active'); if (activeItem) activeItem.remove();
            });
        }
    }
})();

// ==============================================================================
// MODULE 3: NEOUI WISHING WELL OPTIMIZER
// ==============================================================================

(function () {
    'use strict';

    if (/\/wishing\.phtml/.test(location.pathname)) {
        if (!window.NeoUI || !window.NeoUI.isModuleEnabled('wishing-well')) return;
        try { run(); } catch (err) { showFatalError(err); }
    }

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

        // 1-2. Scrape profile info (shared with every other module) BEFORE
        // destroying the DOM.
        const profile = NeoUI.scrapeLegacyProfile();
        const activeStats = { np: profile.np, nc: profile.nc };

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
        NeoUI.setProfileInfo(profile);

        // 5. Shared topbar (same markup/behavior on every NeoUI page)
        NeoUI.buildTopbar({ stats: activeStats, hasNotification: profile.hasNotification });

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
                    const headerStats = document.querySelector('#nui-topbar-stats b');
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

// ==============================================================================
// MODULE 4: ITEM TRANSFER LOG (NUKED & REBUILT)
// ==============================================================================

(function () {
    'use strict';

    if (!/\/items\/transfer_list\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('item-transfer')) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Transfer Log crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) { }
    }

    function run() {
        const NeoUI = window.NeoUI;
        if (!NeoUI || !NeoUI.__ready) { throw new Error('NeoUI Core Framework was not found.'); }

        // 1. Scrape profile info BEFORE touching the DOM
        const profile = NeoUI.scrapeLegacyProfile();

        // 2. Scrape Pagination State
        let maxPage = 1;
        let currentPage = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
        document.querySelectorAll('a[href*="transfer_list.phtml?page="]').forEach((a) => {
            const m = a.href.match(/page=(\d+)/);
            if (m) maxPage = Math.max(maxPage, parseInt(m[1], 10));
        });
        maxPage = Math.max(maxPage, currentPage);

        // 3. Scrape Forms and Item Data
        const scrapedForms = [];
        document.querySelectorAll('form').forEach(form => {
            const table = form.querySelector('table.itemTable');
            if (!table) return;

            const isNC = table.querySelector('.nc_gift_sel_radio') !== null;
            const hiddenInputs = Array.from(form.querySelectorAll('input[type="hidden"]')).map(inp => ({ name: inp.name, value: inp.value }));
            const action = form.getAttribute('action') || '';
            const method = form.getAttribute('method') || 'POST';

            const items = [];
            Array.from(table.querySelectorAll('tr')).slice(1).forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 5) return;

                let itemCell, acceptCell, rejectCell, discardCell, dateText, fromName, fromHref, itemName;

                if (isNC) {
                    const [textCell, itemCellRef, acceptCellRef, rejectCellRef, discardCellRef] = cells;
                    itemCell = itemCellRef; acceptCell = acceptCellRef; rejectCell = rejectCellRef; discardCell = discardCellRef;
                    const bTag = textCell.querySelector('b');
                    itemName = bTag ? bTag.textContent.trim() : "Neocash Item";
                    fromName = "NC Gift"; dateText = "Pending"; fromHref = null;
                } else {
                    const [dateCellRef, fromCellRef, itemCellRef, acceptCellRef, rejectCellRef] = cells;
                    itemCell = itemCellRef; acceptCell = acceptCellRef; rejectCell = rejectCellRef; discardCell = null;
                    dateText = dateCellRef.textContent.trim();
                    const fromLink = fromCellRef.querySelector('a');
                    fromName = fromLink ? fromLink.textContent.trim() : fromCellRef.textContent.trim();
                    fromHref = fromLink ? fromLink.getAttribute('href') : null;
                    const itemNameEl = itemCell.querySelector('b');
                    itemName = itemNameEl ? itemNameEl.textContent.trim() : itemCell.textContent.trim();
                }

                const img = itemCell.querySelector('img');
                const imgSrc = img ? img.src : 'https://images.neopets.com/items/default.gif';

                const extractRadio = (cell) => {
                    const r = cell ? cell.querySelector('input[type="radio"]') : null;
                    return r ? { name: r.name, value: r.value, class: r.className } : null;
                };

                items.push({
                    itemName, fromName, fromHref, dateText, imgSrc,
                    accept: extractRadio(acceptCell),
                    reject: extractRadio(rejectCell),
                    discard: extractRadio(discardCell)
                });
            });

            if (items.length > 0) {
                scrapedForms.push({ action, method, hiddenInputs, items, isNC });
            }
        });

        // 4. NUKE THE DOM
        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        // 5. Initialize NeoUI
        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        // 6. Build the fresh Mobile UI
        const pageWrapper = document.createElement('div');
        pageWrapper.style.cssText = 'min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: calc(var(--nui-topbar-h) + var(--nui-space-5)) var(--nui-space-4) var(--nui-space-5); box-sizing: border-box;';
        document.body.appendChild(pageWrapper);

        const container = document.createElement('div');
        container.style.cssText = 'width: 100%; max-width: 700px; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        pageWrapper.appendChild(container);

        // Title
        container.innerHTML += `<div class="nui-text" style="font-family: var(--nui-font-display); font-size: 24px; font-weight: 800; text-align: center;">Item Transfer Log</div>`;

        // Pagination
        if (maxPage > 1) {
            const pager = document.createElement('div');
            pager.style.cssText = 'display: flex; gap: var(--nui-space-2); justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: var(--nui-space-2);';
            pager.innerHTML = `
                <button class="nui-btn nui-btn-secondary nui-btn-sm" ${currentPage <= 1 ? 'disabled' : ''} onclick="window.location.href='?page=${Math.max(1, currentPage - 1)}'">‹ Prev</button>
                <select class="nui-select" style="max-width: 160px; font-weight: 700; text-align: center;" onchange="window.location.href='?page=' + this.value">
                    ${Array.from({length: maxPage}, (_, i) => `<option value="${i+1}" ${i+1 === currentPage ? 'selected' : ''}>Page ${i+1} / ${maxPage}</option>`).join('')}
                </select>
                <button class="nui-btn nui-btn-secondary nui-btn-sm" ${currentPage >= maxPage ? 'disabled' : ''} onclick="window.location.href='?page=${Math.min(maxPage, currentPage + 1)}'">Next ›</button>
            `;
            container.appendChild(pager);
        }

        // Toolbar
        if (scrapedForms.length > 0) {
            const toolbar = document.createElement('div');
            toolbar.style.cssText = 'display: flex; gap: var(--nui-space-2); flex-wrap: wrap; justify-content: center; margin-bottom: var(--nui-space-3);';
            toolbar.innerHTML = `
                <button type="button" class="nui-btn nui-btn-secondary nui-btn-sm" id="btn-accept-all" style="flex: 1 1 auto;">Accept All</button>
                <button type="button" class="nui-btn nui-btn-secondary nui-btn-sm" id="btn-return-all" style="flex: 1 1 auto;">Return All</button>
                <button type="button" class="nui-btn nui-btn-danger nui-btn-sm" id="btn-accept-all-pages" style="flex: 1 1 auto; background: var(--nui-danger-soft); border-color: var(--nui-danger-soft); color: var(--nui-danger);">Accept All (All Pages)</button>
            `;
            container.appendChild(toolbar);
        } else {
            container.innerHTML += `<div class="nui-empty"><span class="nui-empty-emoji">📭</span>No pending transfers found.</div>`;
        }

        // Build Forms & Cards
        scrapedForms.forEach((sf, fIndex) => {
            const formEl = document.createElement('form');
            formEl.action = sf.action;
            formEl.method = sf.method;
            formEl.style.cssText = 'display: flex; flex-direction: column; gap: var(--nui-space-3);';

            // Re-inject hidden inputs
            sf.hiddenInputs.forEach(hi => {
                const input = document.createElement('input');
                input.type = 'hidden'; input.name = hi.name; input.value = hi.value;
                formEl.appendChild(input);
            });

            sf.items.forEach((item, iIndex) => {
                const card = document.createElement('div');
                card.className = 'nui-surface';
                card.style.cssText = 'border: 1px solid var(--nui-border); border-radius: var(--nui-radius-lg); padding: var(--nui-space-3) var(--nui-space-4); display: flex; flex-direction: column; gap: var(--nui-space-3); box-shadow: 0 4px 12px var(--nui-shadow);';

                const header = document.createElement('div');
                header.style.cssText = 'display: flex; gap: var(--nui-space-3); align-items: center;';
                header.innerHTML = `
                    <img src="${item.imgSrc}" style="width: 52px; height: 52px; border-radius: var(--nui-radius-md); background: var(--nui-surface-2); object-fit: cover; flex-shrink: 0;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 700; font-size: 15.5px; color: var(--nui-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.itemName}</div>
                        <div style="font-size: 13px; color: var(--nui-text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            From ${item.fromHref ? `<a href="${item.fromHref}" style="color: var(--nui-accent); font-weight: 700; text-decoration: none;">${item.fromName}</a>` : item.fromName} · ${item.dateText}
                        </div>
                    </div>
                `;
                card.appendChild(header);

                const actionsWrap = document.createElement('div');
                actionsWrap.style.cssText = 'display: flex; gap: var(--nui-space-2); width: 100%;';

                const createLabel = (radioData, labelText, activeClass) => {
                    if (!radioData) return '';
                    const radId = `radio-${fIndex}-${iIndex}-${radioData.value}`;
                    return `
                        <label for="${radId}" class="tlog-radio-label" data-active-bg="${activeClass}" style="flex: 1; text-align: center; padding: 9px 6px; font-size: 13px; font-weight: 700; border: 1px solid var(--nui-border); border-radius: var(--nui-radius-pill); background: var(--nui-surface-2); color: var(--nui-text-muted); cursor: pointer; transition: background var(--nui-dur-fast) var(--nui-ease), color var(--nui-dur-fast) var(--nui-ease), border-color var(--nui-dur-fast) var(--nui-ease); user-select: none;">
                            <input type="radio" id="${radId}" name="${radioData.name}" value="${radioData.value}" class="${radioData.class} hidden-radio" style="display:none;">
                            ${labelText}
                        </label>
                    `;
                };

                actionsWrap.innerHTML = `
                    ${createLabel(item.accept, 'Accept', 'var(--nui-success)')}
                    ${createLabel(item.reject, 'Return', 'var(--nui-danger)')}
                    ${createLabel(item.discard, 'Discard', 'var(--nui-text-muted)')}
                `;
                card.appendChild(actionsWrap);
                formEl.appendChild(card);
            });

            if (sf.items.length > 0) {
                const submitBtn = document.createElement('button');
                submitBtn.type = 'submit';
                submitBtn.className = 'nui-btn nui-btn-primary nui-btn-block';
                submitBtn.textContent = 'Process Transfers';
                formEl.appendChild(submitBtn);
            }

            container.appendChild(formEl);
        });

        // Event Delegation for Radio Buttons
        document.body.addEventListener('change', (e) => {
            if (e.target.classList.contains('hidden-radio')) {
                const wrap = e.target.closest('div');
                wrap.querySelectorAll('.tlog-radio-label').forEach(lbl => {
                    lbl.style.background = 'var(--nui-surface-2)';
                    lbl.style.borderColor = 'var(--nui-border)';
                    lbl.style.color = 'var(--nui-text-muted)';
                });
                const selectedLabel = e.target.closest('label');
                selectedLabel.style.background = selectedLabel.getAttribute('data-active-bg');
                selectedLabel.style.borderColor = selectedLabel.getAttribute('data-active-bg');
                selectedLabel.style.color = 'var(--nui-surface)';
            }
        });

        // Wire up Toolbar Actions
        const btnAcceptAll = document.getElementById('btn-accept-all');
        const btnReturnAll = document.getElementById('btn-return-all');
        const btnAcceptAllPages = document.getElementById('btn-accept-all-pages');

        if (btnAcceptAll) {
            btnAcceptAll.addEventListener('click', () => {
                document.querySelectorAll('.np_sel_radio, .nc_gift_sel_radio').forEach(r => {
                    r.checked = true;
                    r.dispatchEvent(new Event('change', { bubbles: true }));
                });
            });
        }
        if (btnReturnAll) {
            btnReturnAll.addEventListener('click', () => {
                document.querySelectorAll('.np_reject_all, .nc_gift_rej_radio').forEach(r => {
                    r.checked = true;
                    r.dispatchEvent(new Event('change', { bubbles: true }));
                });
            });
        }
        if (btnAcceptAllPages) {
            btnAcceptAllPages.addEventListener('click', () => {
                const confirmed = window.confirm('This will accept EVERY item across ALL forms and pages of your transfer log. Continue?');
                if (confirmed) {
                    btnAcceptAllPages.textContent = "Processing...";
                    btnAcceptAllPages.disabled = true;
                    runAutoAcceptInIframe();
                }
            });
        }
    }

    // Retained iframe loop for "Accept All Pages"
    let autoAcceptCancelled = false;
    function runAutoAcceptInIframe() {
        let formsProcessed = 0;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(iframe);

        function cleanup() { iframe.remove(); }
        function step() {
            if (autoAcceptCancelled || formsProcessed >= 250) {
                alert(autoAcceptCancelled ? 'Auto-accept stopped.' : 'Safety limit reached (250 forms).');
                cleanup(); return;
            }
            let doc;
            try { doc = iframe.contentDocument || iframe.contentWindow.document; }
            catch (e) { cleanup(); return; }

            const acceptRadios = doc.querySelectorAll('input.np_sel_radio, input.nc_gift_sel_radio');
            if (acceptRadios.length === 0) {
                alert(`Done — accepted items across ${formsProcessed} form(s).`);
                cleanup(); window.location.reload(); return;
            }

            const formToSubmit = acceptRadios[0].closest('form');
            formToSubmit.querySelectorAll('input.np_sel_radio, input.nc_gift_sel_radio').forEach(r => r.checked = true);
            formsProcessed += 1;

            iframe.addEventListener('load', onIframeLoaded, { once: true });
            setTimeout(() => formToSubmit.submit(), 500);
        }

        function onIframeLoaded() { setTimeout(step, 150); }
        iframe.addEventListener('load', onIframeLoaded, { once: true });
        iframe.src = '/items/transfer_list.phtml';
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try { run(); } catch (err) { showFatalError(err); }
    } else {
        document.addEventListener('DOMContentLoaded', () => { try { run(); } catch (err) { showFatalError(err); } });
    }
})();

// ==============================================================================
// MODULE 5: ALLEVENTS (COMPACT IFRAME UI)
// ==============================================================================

(function () {
    'use strict';

    if (!/\/allevents\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('allevents')) return;

    function run() {
        const NeoUI = window.NeoUI;
        if (!NeoUI || !NeoUI.__ready) { throw new Error('NeoUI Core Framework missing.'); }

        // 1. Scrape the legacy events table
        const events = [];
        const eventForm = document.querySelector('form[name="eventform"]');

        if (eventForm) {
            const rows = Array.from(eventForm.querySelectorAll('tr'));
            for (let i = 1; i < rows.length - 1; i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length < 4) continue;

                events.push({
                    time: cells[0].textContent.trim().replace(/\s+/g, ' '),
                    actionUrl: cells[1].querySelector('a') ? cells[1].querySelector('a').href : '#',
                    imgSrc: cells[1].querySelector('img') ? cells[1].querySelector('img').src : '',
                    type: cells[1].querySelector('b') ? cells[1].querySelector('b').textContent.trim() : 'Event',
                    descHtml: cells[2].innerHTML.trim(),
                    delName: cells[3].querySelector('input') ? cells[3].querySelector('input').name : null
                });
            }
        }

        // 2. Nuke the DOM & Reset
        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-surface)';
        document.body.style.background = 'var(--nui-surface)';
        document.body.style.padding = '0';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden'; // Prevent double scrollbars

        // 3. Initialize NeoUI

        NeoUI.init({ showNeoGoButton: false });

        // 4. Build the App Wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; flex-direction: column; height: 100vh; width: 100%;';
        document.body.appendChild(wrapper);

        // --- HEADER ---
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: var(--nui-space-4); background: linear-gradient(135deg, var(--nui-accent-soft), var(--nui-surface-2)); border-bottom: 2px solid var(--nui-border); flex-shrink: 0;';

        const title = document.createElement('div');
        title.className = 'nui-text';
        title.style.cssText = 'font-weight: 800; font-size: 20px; font-family: var(--nui-font-display); line-height: 1.1;';
        title.textContent = `Notifications (${events.length})`;
        header.appendChild(title);

        if (events.length > 0) {
            const clearAllBtn = document.createElement('button');
            clearAllBtn.className = 'nui-btn nui-btn-sm';
            clearAllBtn.style.cssText = 'background: var(--nui-danger-soft); color: var(--nui-danger); border: 1px solid var(--nui-danger-soft); font-size: 12px; padding: 6px 12px;';
            clearAllBtn.textContent = 'Clear All';

            clearAllBtn.addEventListener('click', () => {
                if (window.confirm('Clear all notifications?')) {
                    const wipeForm = document.createElement('form');
                    wipeForm.action = 'process_allevents.phtml';
                    wipeForm.method = 'POST';
                    wipeForm.innerHTML = `<input type="hidden" name="type" value="all">`;
                    document.body.appendChild(wipeForm);
                    wipeForm.submit();
                }
            });
            header.appendChild(clearAllBtn);
        }
        wrapper.appendChild(header);

        // --- CONTENT AREA ---
        if (events.length > 0) {
            const form = document.createElement('form');
            form.action = 'process_allevents.phtml';
            form.method = 'POST';
            form.style.cssText = 'display: flex; flex-direction: column; flex: 1; overflow: hidden;';

            // Scrollable list container
            const scrollArea = document.createElement('div');
            scrollArea.style.cssText = 'flex: 1; overflow-y: auto; padding: var(--nui-space-3); display: flex; flex-direction: column; gap: var(--nui-space-2); -webkit-overflow-scrolling: touch;';

            events.forEach((ev, idx) => {
                // Using a <label> as the card makes the entire item clickable to check the box
                const item = document.createElement('label');
                item.className = 'nui-item nui-reset';
                item.style.cssText = 'margin: 0; padding: var(--nui-space-3); display: flex; gap: var(--nui-space-3); align-items: flex-start; text-align: left; cursor: pointer; transition: transform 0.1s, border-color 0.2s;';

                                item.innerHTML = `
                    <a href="${ev.actionUrl}" target="_parent" style="width: 42px; height: 42px; border-radius: var(--nui-radius-sm); background: var(--nui-surface-2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--nui-border); text-decoration: none;">
                        <img src="${ev.imgSrc}" style="max-width: 32px; max-height: 32px; object-fit: contain;">
                    </a>
                    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;">
                        <a href="${ev.actionUrl}" target="_parent" style="font-weight: 800; font-size: 15px; color: var(--nui-text); text-decoration: none;">${ev.type}</a>
                        <div class="nui-text-muted" style="font-size: 13.5px; line-height: 1.4; white-space: normal;">${ev.descHtml}</div>
                        <div style="font-size: 11px; color: var(--nui-text-faint); font-weight: 700; margin-top: 2px;">${ev.time}</div>
                    </div>
                    <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin-top: 8px;">
                        <input type="checkbox" id="del-${idx}" name="${ev.delName}" style="width: 18px; height: 18px; accent-color: var(--nui-danger); cursor: pointer;">
                    </div>
                `;


                // Ensure links inside the description open in the main window, not the iframe
                item.querySelectorAll('a').forEach(a => {
                    a.style.color = 'var(--nui-accent)';
                    a.style.fontWeight = 'bold';
                    a.style.textDecoration = 'none';
                    a.setAttribute('target', '_parent');
                    // Stop link clicks from toggling the checkbox
                    a.addEventListener('click', (e) => e.stopPropagation());
                });

                // Visual feedback when checking the box
                const checkbox = item.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        item.style.borderColor = 'var(--nui-danger)';
                        item.style.background = 'var(--nui-danger-soft)';
                    } else {
                        item.style.borderColor = 'var(--nui-border)';
                        item.style.background = 'var(--nui-surface)';
                    }
                });

                scrollArea.appendChild(item);
            });
            form.appendChild(scrollArea);

            // Sticky Bottom Footer
            const footer = document.createElement('div');
            footer.style.cssText = 'padding: var(--nui-space-4); border-top: 1px solid var(--nui-border); background: var(--nui-surface); flex-shrink: 0; box-shadow: 0 -4px 12px var(--nui-shadow);';

            const submitBtn = document.createElement('button');
            submitBtn.type = 'submit';
            submitBtn.className = 'nui-btn nui-btn-secondary nui-btn-block';
            submitBtn.textContent = 'Clear Selected';
            footer.appendChild(submitBtn);

            form.appendChild(footer);
            wrapper.appendChild(form);

        } else {
            wrapper.innerHTML += `
                <div class="nui-empty" style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 20vh;">
                    <span class="nui-empty-emoji">✨</span>
                    <span style="font-weight: 700; color: var(--nui-text-muted);">All caught up!</span>
                </div>
            `;
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        run();
    } else {
        document.addEventListener('DOMContentLoaded', run);
    }
})();
// ==============================================================================
// MODULE 6: THE COINCIDENCE (TRUE SPA + CUSTOM SSW MODAL)
// ==============================================================================

(function () {
    'use strict';

    if (!/\/space\/coincidence\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('coincidence')) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Coincidence crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) { }
    }

    const NeoUI = window.NeoUI;

    // Profile is scraped once from the live DOM on first render (when the
    // Neopets chrome is still visible). On subsequent re-renders triggered by
    // reloadSPA() the live DOM has been nuked, so we fall back to this cache.
    let _cachedProfile = null;

    // --- Custom SSW Modal ---
    function openCustomSSW(itemName) { if (window.NeoUI && window.NeoUI.openSSW) window.NeoUI.openSSW(itemName); }

    // --- Dynamic RE Catcher (For AJAX injected events) ---
    function observeInjectedREs() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.classList && (node.classList.contains('randomEvent') || node.classList.contains('re-container') || node.id === 'randomEvents')) {
                            injectRECard(node.innerHTML);
                            node.style.display = 'none';
                        }
                    }
                });
            });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    function injectRECard(htmlContent) {
        const container = document.getElementById('coincidence-app-wrapper');
        if (!container) return;

        let reCard = document.getElementById('nui-re-card');
        if (!reCard) {
            reCard = document.createElement('div');
            reCard.id = 'nui-re-card';
            reCard.className = 'nui-surface';
            reCard.style.cssText = 'border-radius: var(--nui-radius-lg); border: 2px solid var(--nui-accent); padding: var(--nui-space-4); box-shadow: 0 4px 16px var(--nui-shadow); text-align: center; font-size: 15px; color: var(--nui-text); background: var(--nui-surface-2);';

            // Insert it below the title
            container.insertBefore(reCard, container.children[1]);
        }

        reCard.innerHTML = `
            <div style="font-family: var(--nui-font-display); font-size: 22px; font-weight: 800; color: var(--nui-accent); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 26px;">⚡</span> Event Result! <span style="font-size: 26px;">⚡</span>
            </div>
            <hr style="border: 0; border-bottom: 1px solid var(--nui-border); margin: 16px 0;">
            ${htmlContent}
        `;
    }

    // --- SPA State Manager ---
    async function reloadSPA(actionUrl, options = {}) {
        const wrapper = document.getElementById('coincidence-app-wrapper');
        if (wrapper) {
            wrapper.style.opacity = '0.5';
            wrapper.style.pointerEvents = 'none';
        }

        try {
            let res;
            if (actionUrl) {
                res = await fetch(actionUrl, options);
            } else {
                res = await fetch('/space/coincidence.phtml');
            }

            const html = await res.text();
            const newDoc = new DOMParser().parseFromString(html, 'text/html');

            if (wrapper) {
                wrapper.style.opacity = '';
                wrapper.style.pointerEvents = '';
            }

            renderCoincidence(newDoc);
        } catch (err) {
            if (wrapper) { wrapper.style.opacity = ''; wrapper.style.pointerEvents = ''; }
            showFatalError(err);
        }
    }

    function renderCoincidence(doc) {
        // Use the live DOM profile on first call; fall back to cache on refreshes
        // (the Neopets chrome is hidden after the first render so scraping would return empty data)
        const freshProfile = NeoUI.scrapeLegacyProfile();
        const profile = (freshProfile && freshProfile.np) ? freshProfile : (_cachedProfile || freshProfile);
        if (freshProfile && freshProfile.np) _cachedProfile = freshProfile;

        // 1. Scrape Quest Items
        const items = [];
        const questTable = doc.getElementById('questItems');
        if (questTable) {
            questTable.querySelectorAll('td').forEach(td => {
                const img = td.querySelector('img');
                const b = td.querySelector('b');
                if (!img || !b) return;
                let itemName = '';
                td.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) itemName = node.nodeValue.trim();
                });
                items.push({ name: itemName, qty: b.textContent.trim(), imgSrc: img.src });
            });
        }

        // 2. Scrape Story/Status Text
        const messages = [];
        doc.querySelectorAll('td.content > p').forEach(p => {
            const text = p.textContent.trim();
            if (text && !text.includes('RESEARCH COMPLETE IN:')) messages.push(p.innerHTML);
        });

                // 3. Static RE Scrape (From the POST response DOM)
        const staticREs = [];
        doc.querySelectorAll('.randomEvent, #randomEvents, .re-container').forEach(re => {
            if (re.textContent.trim().length > 0) {
                staticREs.push(re.innerHTML);
            }
        });

        // Catch Coincidence-specific centered results if they aren't marked as standard REs
        doc.querySelectorAll('.content > div[align="center"], td.content > div[align="center"], .content > center, td.content > center').forEach(div => {
            const html = div.innerHTML;
            // Exclude the timer, main UI images, and quest tables. Catch only the results/dialogue.
            if (!html.includes('RESEARCH COMPLETE IN') &&
                !html.includes('id="countdownClock"') &&
                !html.includes('questItems') &&
                !html.includes('coincidence_machine') &&
                div.textContent.trim().length > 0) {
                staticREs.push(html);
            }
        });


        // 4. Scrape Timer (If active)
        let cooldown = null;
        doc.querySelectorAll('script').forEach(script => {
            const match = script.textContent.match(/hours:\s*(\d+),\s*minutes:\s*(\d+),\s*seconds:\s*(\d+)/);
            if (match) {
                cooldown = { h: parseInt(match[1], 10), m: parseInt(match[2], 10), s: parseInt(match[3], 10) };
            }
        });

        // 5. Scrape and Translate Legacy Buttons
        const actionButtons = [];
        doc.querySelectorAll('div[class*="shipButton"]').forEach(btn => {
            const className = Array.from(btn.classList).find(c => c.startsWith('shipButton') && c !== 'shipButton');
            if (!className) return;

            let btnConfig = null;
            if (className === 'shipButtonCancelQuest' || className === 'shipButtonNoCancel') {
                btnConfig = { text: 'Cancel Quest', class: 'nui-btn-danger', action: 'cancel' };
            } else if (className === 'shipButtonReturn' || className === 'shipButtonLater' || className === 'shipButtonYesLater' || className === 'shipButtonNoCreep') {
                btnConfig = { text: 'Leave Ship', class: 'nui-btn-secondary', action: 'link', href: '/explore.phtml' };
            } else if (className === 'shipButtonHelp' || className === 'shipButtonYesAsk' || className === 'shipButtonYesBoldly' || className === 'shipButtonSure') {
                btnConfig = { text: 'Accept / Fire Machine', class: 'nui-btn-primary', action: 'submit_form' };
            } else if (className === 'shipButtonDoIt') {
                btnConfig = { text: 'Complete Quest', class: 'nui-btn-primary', action: 'submit_form' };
            }

            if (btnConfig) {
                btnConfig.legacyForm = btn.closest('form') || doc.getElementById('shipCombine') || doc.getElementById('shipQuest');
                actionButtons.push(btnConfig);
            }
        });

        const uniqueActions = [];
        const seenTexts = new Set();
        actionButtons.forEach(btn => {
            if (!seenTexts.has(btn.text)) {
                seenTexts.add(btn.text);
                uniqueActions.push(btn);
            }
        });

        // 6. Safely Hide Legacy DOM and init shell — only on first render
        const alreadyInitialized = !!document.getElementById('coincidence-main-wrapper');
        if (!alreadyInitialized) {
            Array.from(document.body.children).forEach(child => {
                const tag = child.tagName.toLowerCase();
                if (['script', 'style', 'link'].includes(tag)) return;
                if (['panelPopups', 'neoFade', 'colorbox', 'cboxOverlay', 'cboxWrapper'].includes(child.id)) return;
                child.style.display = 'none';
            });

            document.body.className = 'nui-reset';
            document.documentElement.style.background = 'var(--nui-bg)';
            document.body.style.background = 'var(--nui-bg)';

            if (!NeoUI.isInitialized) NeoUI.init();
            NeoUI.setProfileInfo(profile);
            NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });
        }

        // 7. Build the UI
        let pageWrapper = document.getElementById('coincidence-main-wrapper');
        if (!pageWrapper) {
            pageWrapper = document.createElement('div');
            pageWrapper.id = 'coincidence-main-wrapper';
            pageWrapper.style.cssText = 'min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5); box-sizing: border-box;';
            document.body.appendChild(pageWrapper);
        } else {
            pageWrapper.innerHTML = '';
        }

        const container = document.createElement('div');
        container.id = 'coincidence-app-wrapper';
        container.style.cssText = 'width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        pageWrapper.appendChild(container);

        // Banner card
        const coincidenceBanner = document.createElement('div');
        coincidenceBanner.className = 'nui-surface';
        coincidenceBanner.style.cssText = 'border-radius:var(--nui-radius-lg);border:1px solid var(--nui-border);overflow:hidden;box-shadow:0 4px 12px var(--nui-shadow);';
        coincidenceBanner.innerHTML = `
            <div style="position:relative;width:100%;height:110px;overflow:hidden;background:linear-gradient(135deg,var(--nui-bg) 0%,var(--nui-surface-2) 100%);">
                <img src="//images.neopets.com/space/station_bg.gif"
                     style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.25;"
                     onerror="this.style.display='none'">
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 var(--nui-space-4);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <img src="//images.neopets.com/space/coincidence_small.gif"
                             style="width:64px;height:64px;border-radius:var(--nui-radius-md);border:2px solid var(--nui-border);object-fit:cover;flex-shrink:0;filter:drop-shadow(0 2px 6px var(--nui-shadow));"
                             onerror="this.style.display='none'">
                        <div>
                            <div style="font-family:var(--nui-font-display);font-weight:800;font-size:26px;color:var(--nui-accent);text-shadow:0 2px 6px var(--nui-shadow);line-height:1.1;">The Coincidence</div>
                            <div style="font-size:12px;color:var(--nui-text-muted);font-weight:600;margin-top:2px;">Dr. Landelbrot's Lab</div>
                        </div>
                    </div>
                    <button type="button" id="nui-coincidence-refresh-btn" class="nui-btn nui-btn-secondary nui-btn-sm" style="flex-shrink:0;display:flex;align-items:center;gap:6px;" title="Refresh quest status">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Refresh
                    </button>
                </div>
            </div>
        `;
        container.appendChild(coincidenceBanner);

        // Wire the refresh button
        const refreshBtn = coincidenceBanner.querySelector('#nui-coincidence-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="animation:nui-spin 1s linear infinite"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refreshing...';
                if (!document.getElementById('nui-spin-style')) {
                    const s = document.createElement('style');
                    s.id = 'nui-spin-style';
                    s.textContent = '@keyframes nui-spin { to { transform: rotate(360deg); } }';
                    document.head.appendChild(s);
                }
                reloadSPA(null).catch(() => {}).finally(() => {
                    if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refresh'; }
                });
            });
        }

        // Render Static REs if caught on load
        if (staticREs.length > 0) {
            injectRECard(staticREs.join('<hr style="border: 0; border-bottom: 1px solid var(--nui-border); margin: 16px 0;">'));
        }

        // Narrative Text Card
        if (messages.length > 0) {
            const msgCard = document.createElement(items.length > 0 ? 'details' : 'div');
            msgCard.className = 'nui-surface';
            msgCard.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-3) var(--nui-space-4); box-shadow: 0 4px 12px var(--nui-shadow); font-size: 14px; line-height: 1.5; color: var(--nui-text);';
            if (items.length > 0) {
                msgCard.innerHTML = `<summary style="font-weight: 800; cursor: pointer; color: var(--nui-text-muted); outline: none;">Dr. Landelbrot says...</summary><div style="margin-top: 12px;">${messages.join('<br><br>')}</div>`;
            } else {
                msgCard.innerHTML = messages.join('<br><br>');
            }
            container.appendChild(msgCard);
        }

        // Custom Timer UI
        if (cooldown) {
            const timerCard = document.createElement('div');
            timerCard.className = 'nui-surface';
            timerCard.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-5) var(--nui-space-4); box-shadow: 0 4px 12px var(--nui-shadow); display: flex; flex-direction: column; align-items: center; gap: 12px;';

            timerCard.innerHTML = `
                <div style="font-weight: 800; color: var(--nui-text-muted); font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Research Complete In</div>
                <div id="nui-ship-timer" style="font-family: var(--nui-font-display); font-size: 42px; font-weight: 800; color: var(--nui-accent); line-height: 1; text-shadow: 0 2px 4px var(--nui-shadow);">
                    --:--:--
                </div>
            `;
            container.appendChild(timerCard);

            let totalSeconds = (cooldown.h * 3600) + (cooldown.m * 60) + cooldown.s;
            const timerDisplay = timerCard.querySelector('#nui-ship-timer');

            const tick = setInterval(() => {
                if (totalSeconds <= 0) {
                    clearInterval(tick);
                    timerDisplay.textContent = "Ready!";
                    reloadSPA();
                    return;
                }
                totalSeconds--;
                const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
                const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
                const s = (totalSeconds % 60).toString().padStart(2, '0');
                timerDisplay.textContent = `${h}:${m}:${s}`;
            }, 1000);

            const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${h}:${m}:${s}`;
        }

        // Quest Items List
        if (items.length > 0) {
            const itemsWrap = document.createElement('div');
            itemsWrap.style.cssText = 'display: flex; flex-direction: column; gap: var(--nui-space-3);';

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'nui-surface';
                card.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-3); display: flex; align-items: center; gap: var(--nui-space-3); box-shadow: 0 2px 6px var(--nui-shadow); flex-wrap: wrap;';

                card.innerHTML = `
                    <div style="width: 56px; height: 56px; border-radius: var(--nui-radius-md); background: var(--nui-surface-2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--nui-border);">
                        <img src="${item.imgSrc}" style="max-width: 48px; max-height: 48px; object-fit: contain;">
                    </div>
                    <div style="flex: 1; min-width: 120px;">
                        <div style="font-weight: 800; font-size: 15px; color: var(--nui-text);">${item.name}</div>
                        <div class="nui-badge" style="display: inline-block; margin-top: 4px; background: var(--nui-accent-soft); color: var(--nui-accent);">Needed: ${item.qty}</div>
                    </div>
                `;

                const actionsWrap = document.createElement('div');
                actionsWrap.style.cssText = 'display: flex; gap: 8px; align-items: center; margin-left: auto;';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'nui-btn nui-btn-secondary nui-btn-sm';
                copyBtn.style.padding = '8px 12px';
                copyBtn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(item.name);
                    copyBtn.style.color = 'var(--nui-success)';
                    setTimeout(() => copyBtn.style.color = '', 2000);
                });

                const sswBtn = document.createElement('button');
                sswBtn.className = 'nui-btn nui-btn-primary nui-btn-sm';
                sswBtn.style.padding = '8px 16px';
                sswBtn.textContent = 'SSW';
                sswBtn.addEventListener('click', () => openCustomSSW(item.name));

                actionsWrap.appendChild(copyBtn);
                actionsWrap.appendChild(sswBtn);
                card.appendChild(actionsWrap);
                itemsWrap.appendChild(card);
            });
            container.appendChild(itemsWrap);
        }

        if (uniqueActions.length > 0) {
            const btnWrap = document.createElement('div');
            btnWrap.style.cssText = 'display: flex; flex-direction: column; gap: var(--nui-space-3); margin-top: var(--nui-space-2); width: 100%;';

            uniqueActions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = `nui-btn ${action.class} nui-btn-block`;
                btn.textContent = action.text;

                                btn.addEventListener('click', () => {
                    if (action.action === 'link') {
                        window.location.href = action.href;
                    } else if (action.action === 'cancel') {
                        if (window.confirm('Are you sure you want to cancel? You will forfeit your quest for the day.')) {
                            const refMatch = doc.documentElement.innerHTML.match(/_ref_ck:\s*["']([^"']+)["']/);
                            const fd = new URLSearchParams();
                            if (refMatch) fd.append('_ref_ck', refMatch[1]);

                            const wrapper = document.getElementById('coincidence-app-wrapper');
                            if (wrapper) wrapper.innerHTML = `<div class="nui-empty" style="padding-top: 50px;"><span class="nui-empty-emoji">🚀</span><br>Cancelling quest...</div>`;

                            // Use fetch for the silent cancellation, then force a native reload to stay in sync
                            fetch('/magma/portal/ajax/cancelQuest.php', { method: 'POST', body: fd, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                                .then(() => window.location.href = '/space/coincidence.phtml');
                        }
                    } else if (action.action === 'submit_form') {
                        const wrapper = document.getElementById('coincidence-app-wrapper');
                        if (wrapper) wrapper.innerHTML = `<div class="nui-empty" style="padding-top: 50px;"><span class="nui-empty-emoji">🚀</span><br>Communicating with the ship...</div>`;

                        if (action.legacyForm) {
                            // Native submission bypasses SPA routing to ensure hidden Neopets inputs process correctly
                            action.legacyForm.submit();
                        } else {
                            window.location.href = '/space/coincidence.phtml';
                        }
                    }
                });

                btnWrap.appendChild(btn);
            });
            container.appendChild(btnWrap);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try {
            observeInjectedREs();
            renderCoincidence(document);
        } catch (err) { showFatalError(err); }
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                observeInjectedREs();
                renderCoincidence(document);
            } catch (err) { showFatalError(err); }
        });
    }
})();

// ==============================================================================
// MODULE 7: QUICKREF OVERHAUL
// ==============================================================================

(function () {
    'use strict';

    if (!/\/quickref\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('quickref')) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Quickref crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) { }
    }

    function run() {
        const NeoUI = window.NeoUI;
        if (!NeoUI || !NeoUI.__ready) { throw new Error('NeoUI Core Framework was not found.'); }

        // 1. Scrape Global Profile Info BEFORE nuking the DOM
        const profile = NeoUI.scrapeLegacyProfile();

        // 2. Precision Scraper based on the provided Quickref DOM
        function scrapeQuickref() {
            const pets = [];

            // The safest place to pull pet data is the hidden/visible contentModule details blocks
            document.querySelectorAll('.contentModule').forEach(module => {
                if (!module.id || !module.id.endsWith('_details')) return;

                const petName = module.id.replace('_details', '');
                // Active pets use 'contentModuleHeader', inactive use 'contentModuleHeaderAlt'
                const isActive = !!module.querySelector('th.contentModuleHeader');

                // Extract the high-res image from the background-image style
                const imageDiv = module.querySelector('.pet_image');
                let imgSrc = 'https://images.neopets.com/themes/h5/basic/images/mystery-icon.png';
                if (imageDiv && imageDiv.style.backgroundImage) {
                    const match = imageDiv.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                    if (match) {
                        let src = match[1];
                        if (src.startsWith('//')) src = 'https:' + src;
                        imgSrc = src;
                    }
                }

                // Scrape the stats table
                const rawStats = {};
                module.querySelectorAll('.pet_stats tr').forEach(row => {
                    const th = row.querySelector('th');
                    const td = row.querySelector('td');
                    if (th && td) {
                        const key = th.textContent.replace(':', '').trim().toLowerCase();
                        rawStats[key] = td.innerHTML.trim();
                    }
                });

                // Helper to strip HTML tags (like <font color="red">) and get raw text
                const getText = (htmlStr) => {
                    if (!htmlStr) return '-';
                    const tmp = document.createElement('div');
                    tmp.innerHTML = htmlStr;
                    return tmp.textContent.trim();
                };

                // Look for Petpets/P3s in the bottom spanned row
                const petpets = [];
                const lastRow = module.querySelector('.pet_stats tr:last-child td[colspan="2"]');
                if (lastRow) {
                    lastRow.querySelectorAll('img').forEach(img => {
                        let pSrc = img.getAttribute('src');
                        if (pSrc.startsWith('//')) pSrc = 'https:' + pSrc; else if (pSrc.startsWith('/')) pSrc = 'https://images.neopets.com' + pSrc;
                        petpets.push(pSrc);
                    });
                }

                // Header text contains the petpet names (e.g. "din0sauring with Mazzhew the Mazzew...")
                const headerEl = module.querySelector('th a');
                const fullHeaderText = headerEl ? headerEl.parentNode.textContent : '';
                let companionText = '';
                if (fullHeaderText.includes(' with ')) {
                    companionText = fullHeaderText.split(' with ')[1].trim();
                }

                // Check for Neolodge or other notices
                const noticesContainer = module.querySelector('.pet_notices');
                let noticeHtml = '';
                if (noticesContainer && noticesContainer.textContent.trim().length > 0) {
                    // Extract just the text from the SF div, removing the raw HTML button
                    const sfDiv = noticesContainer.querySelector('.sf');
                    if (sfDiv) {
                        noticeHtml = sfDiv.innerHTML.split('<br>')[0].trim();
                    }
                }

                pets.push({
                    name: petName,
                    isActive,
                    imgSrc,
                    species: getText(rawStats.species),
                    color: getText(rawStats.colour),
                    gender: getText(rawStats.gender),
                    age: getText(rawStats.age),
                    lvl: getText(rawStats.level),
                    hp: getText(rawStats.health),
                    mood: getText(rawStats.mood),
                    hunger: getText(rawStats.hunger),
                    str: getText(rawStats.strength),
                    def: getText(rawStats.defence),
                    mov: getText(rawStats.move),
                    int: getText(rawStats.intelligence),
                    companionText,
                    petpets,
                    noticeHtml
                });
            });

            // Sort so the active pet is always at the top of the array
            pets.sort((a, b) => (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1);
            return pets;
        }

        const petsData = scrapeQuickref();

        // 3. Nuke the legacy DOM safely
        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        // 4. Initialize NeoUI
        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        // 5. Build Main App Container
        const pageWrapper = document.createElement('div');
        pageWrapper.style.cssText = 'min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: calc(var(--nui-topbar-h) + var(--nui-space-5)) var(--nui-space-4) var(--nui-space-5); box-sizing: border-box;';
        document.body.appendChild(pageWrapper);

        const container = document.createElement('div');
        container.style.cssText = 'width: 100%; max-width: 650px; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        pageWrapper.appendChild(container);

        // Header
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div class="nui-text" style="font-family: var(--nui-font-display); font-size: 26px; font-weight: 800;">Quick Reference</div>
            </div>
        `;

        if (petsData.length === 0) {
            container.innerHTML += `<div class="nui-empty"><span class="nui-empty-emoji">🐾</span><br>No Neopets found.</div>`;
            return;
        }

        // ── Track which pet card is expanded ──
        let expandedPet = petsData.find(p => p.isActive)?.name || null;

        // ── Build and inject all cards, wired for expand/collapse ──
        function renderAllCards(pets, activePetName) {
            container.querySelectorAll('.nui-qr-card').forEach(c => c.remove());

            pets.forEach(pet => {
                const isSelected = pet.name === activePetName;

                const card = document.createElement('div');
                card.className = 'nui-surface nui-qr-card';
                card.setAttribute('data-pet', pet.name);

                const borderStyle = pet.isActive
                    ? 'border: 2px solid var(--nui-accent); box-shadow: 0 0 0 4px var(--nui-accent-soft), 0 4px 16px var(--nui-shadow);'
                    : 'border: 1px solid var(--nui-border); box-shadow: 0 2px 8px var(--nui-shadow);';
                card.style.cssText = `border-radius: var(--nui-radius-lg); overflow: hidden; ${borderStyle} display: flex; flex-direction: column; transition: box-shadow 0.2s;`;

                let genderIcon = '';
                if (pet.gender.toLowerCase() === 'male') genderIcon = '<span style="color:#3b82f6;font-weight:800;">♂</span>';
                else if (pet.gender.toLowerCase() === 'female') genderIcon = '<span style="color:#ec4899;font-weight:800;">♀</span>';

                // ── Compact row (always visible) ──
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px var(--nui-space-4);cursor:pointer;user-select:none;';
                row.innerHTML = `
                    <div style="width:52px;height:52px;border-radius:var(--nui-radius-md);background:var(--nui-surface-2);border:1px solid var(--nui-border);overflow:hidden;flex-shrink:0;">
                        <img src="${pet.imgSrc}" style="width:100%;height:100%;object-fit:cover;">
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-family:var(--nui-font-display);font-weight:800;font-size:17px;color:var(--nui-text);display:flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                            ${pet.name} ${genderIcon}
                            ${pet.isActive ? '<span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;background:var(--nui-accent);color:var(--nui-accent-ink);border-radius:4px;padding:2px 6px;margin-left:4px;">Active</span>' : ''}
                        </div>
                        <div style="font-size:12px;color:var(--nui-text-muted);font-weight:600;margin-top:2px;">${pet.color} ${pet.species}${pet.companionText ? ` <span style="color:var(--nui-text-faint);">· 🐾 ${pet.companionText.split(' the ')[0]}</span>` : ''}</div>
                    </div>
                    <div style="display:flex;gap:5px;align-items:center;flex-shrink:0;">
                        <span class="nui-badge ${pet.hunger.toLowerCase().includes('starv') ? 'nui-badge-danger' : 'nui-badge-success'}" style="font-size:11px;">${pet.hunger}</span>
                        <svg style="color:var(--nui-text-faint);transition:transform 0.2s;flex-shrink:0;" class="nui-qr-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>
                    </div>
                `;
                card.appendChild(row);

                // ── Expanded detail panel ──
                const detail = document.createElement('div');
                detail.className = 'nui-qr-detail';
                detail.style.cssText = 'overflow:hidden;transition:max-height 0.3s ease,opacity 0.3s ease;';

                let petpetHtml = '';
                if (pet.petpets.length > 0) {
                    const ppImages = pet.petpets.map(src => `<img src="${src}" style="width:34px;height:34px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);background:var(--nui-surface-2);object-fit:contain;">`).join('');
                    petpetHtml = `
                        <div style="display:flex;align-items:center;gap:10px;margin-top:14px;padding-top:12px;border-top:1px dashed var(--nui-border);">
                            <div style="display:flex;gap:4px;">${ppImages}</div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-size:11px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;letter-spacing:0.5px;">Companions</div>
                                <div style="font-size:13px;font-weight:600;color:var(--nui-text);line-height:1.3;">${pet.companionText}</div>
                            </div>
                        </div>
                    `;
                }

                const noticeBlock = pet.noticeHtml ? `
                    <div style="margin-top:12px;padding:10px 12px;border-radius:var(--nui-radius-sm);background:var(--nui-warning-soft);color:var(--nui-warning);font-size:13px;font-weight:600;border:1px solid var(--nui-warning);display:flex;align-items:center;gap:8px;">
                        <span style="font-size:16px;">🏨</span> ${pet.noticeHtml}
                    </div>
                ` : '';

                detail.innerHTML = `
                    <div style="padding:0 var(--nui-space-4) var(--nui-space-3);border-top:1px solid var(--nui-border);">
                        <div style="margin-top:14px;background:var(--nui-surface-2);border-radius:var(--nui-radius-md);padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                            <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:10px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Lvl</span><span style="font-size:14px;font-weight:700;color:var(--nui-text);">${pet.lvl}</span></div>
                            <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:10px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">HP</span><span style="font-size:14px;font-weight:800;color:var(--nui-success);">${pet.hp}</span></div>
                            <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:10px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Str</span><span style="font-size:13px;font-weight:700;color:var(--nui-danger);overflow:hidden;text-overflow:ellipsis;">${pet.str}</span></div>
                            <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:10px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Def</span><span style="font-size:13px;font-weight:700;color:var(--nui-accent-2);overflow:hidden;text-overflow:ellipsis;">${pet.def}</span></div>
                            <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:10px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Spd</span><span style="font-size:13px;font-weight:700;color:var(--nui-text);overflow:hidden;text-overflow:ellipsis;">${pet.mov}</span></div>
                            <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:10px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Int</span><span style="font-size:13px;font-weight:700;color:var(--nui-accent);overflow:hidden;text-overflow:ellipsis;">${pet.int}</span></div>
                        </div>
                        ${petpetHtml}
                        ${noticeBlock}
                    </div>
                    <div style="padding:10px var(--nui-space-4);background:var(--nui-surface-2);border-top:1px solid var(--nui-border);display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;">
                        ${!pet.isActive ? `<button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-make-active" data-pet="${pet.name}" style="flex-shrink:0;padding:8px 16px;">Make Active</button>` : ''}
                        <a href="/customise/?view=${encodeURIComponent(pet.name)}" class="nui-btn nui-btn-secondary nui-btn-sm" style="flex-shrink:0;text-decoration:none;padding:8px 14px;">Customise</a>
                        <a href="/petlookup.phtml?pet=${encodeURIComponent(pet.name)}" class="nui-btn nui-btn-secondary nui-btn-sm" style="flex-shrink:0;text-decoration:none;padding:8px 14px;">Lookup</a>
                        <a href="/abilities.phtml?pet_name=${encodeURIComponent(pet.name)}" class="nui-btn nui-btn-secondary nui-btn-sm" style="flex-shrink:0;text-decoration:none;padding:8px 14px;">Abilities</a>
                        <a href="/battledome/battledome.phtml?type=equip" class="nui-btn nui-btn-secondary nui-btn-sm" style="flex-shrink:0;text-decoration:none;padding:8px 14px;">Equip</a>
                        ${pet.petpets.length > 0 ? `<button type="button" class="nui-btn nui-btn-secondary nui-btn-sm btn-toggle-petpet" data-pet="${pet.name}" style="flex-shrink:0;padding:8px 14px;">🐾 Petpet</button>` : ''}
                    </div>
                    <!-- Inline Petpet Panel (SPA) -->
                    ${pet.petpets.length > 0 ? `
                    <div class="nui-petpet-panel" data-pet="${pet.name}" style="display:none;border-top:1px solid var(--nui-border);padding:var(--nui-space-3) var(--nui-space-4);display:none;flex-direction:column;gap:var(--nui-space-3);">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <img src="${pet.petpets[0]}" style="width:48px;height:48px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);background:var(--nui-surface-2);object-fit:contain;flex-shrink:0;">
                            ${pet.petpets[1] ? `<img src="${pet.petpets[1]}" style="width:36px;height:36px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);background:var(--nui-surface-2);object-fit:contain;flex-shrink:0;">` : ''}
                            <div style="flex:1;min-width:0;">
                                <div class="nui-petpet-name" style="font-family:var(--nui-font-display);font-weight:800;font-size:16px;color:var(--nui-text);">${pet.companionText.split(' the ')[0] || 'Petpet'}</div>
                                <div style="font-size:12px;color:var(--nui-text-muted);font-weight:600;">${pet.companionText.split(' the ')[1] || ''}</div>
                            </div>
                        </div>
                        <!-- Result message area -->
                        <div class="nui-petpet-result" style="display:none;padding:10px 12px;border-radius:var(--nui-radius-sm);background:var(--nui-success-soft);color:var(--nui-success);font-size:13px;font-weight:600;border:1px solid var(--nui-success);"></div>
                        <!-- Talk -->
                        <div style="display:flex;flex-direction:column;gap:6px;">
                            <div style="font-size:11px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;letter-spacing:0.5px;">Say something</div>
                            <div style="display:flex;gap:8px;">
                                <input type="text" class="nui-petpet-talk-input" maxlength="50" placeholder="Say hi..." style="flex:1;padding:8px 12px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-text);font-size:14px;min-width:0;">
                                <button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-petpet-talk" data-pet="${pet.name}" style="flex-shrink:0;padding:8px 14px;">Go!</button>
                            </div>
                        </div>
                        <!-- Rename -->
                        <div style="display:flex;flex-direction:column;gap:6px;">
                            <div style="font-size:11px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;letter-spacing:0.5px;">Rename</div>
                            <div style="display:flex;gap:8px;">
                                <input type="text" class="nui-petpet-rename-input" maxlength="20" placeholder="${pet.companionText.split(' the ')[0] || 'New name'}" style="flex:1;padding:8px 12px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);background:var(--nui-surface-2);color:var(--nui-text);font-size:14px;min-width:0;">
                                <button type="button" class="nui-btn nui-btn-secondary nui-btn-sm btn-petpet-rename" data-pet="${pet.name}" style="flex-shrink:0;padding:8px 14px;">Rename</button>
                            </div>
                        </div>
                    </div>` : ''}
                `;
                card.appendChild(detail);

                // ── Expand/collapse logic ──
                function setExpanded(open, animate) {
                    const chevron = row.querySelector('.nui-qr-chevron');
                    if (open) {
                        detail.style.maxHeight = detail.scrollHeight + 600 + 'px'; // generous for safety
                        detail.style.opacity = '1';
                        chevron.style.transform = 'rotate(90deg)';
                    } else {
                        detail.style.maxHeight = '0';
                        detail.style.opacity = '0';
                        chevron.style.transform = 'rotate(0deg)';
                    }
                }

                // Start in correct state (no animation on initial render)
                setExpanded(isSelected, false);

                row.addEventListener('click', () => {
                    const isOpen = detail.style.maxHeight !== '0px' && detail.style.maxHeight !== '';
                    // Collapse all others
                    container.querySelectorAll('.nui-qr-card').forEach(otherCard => {
                        if (otherCard === card) return;
                        const otherDetail = otherCard.querySelector('.nui-qr-detail');
                        const otherChevron = otherCard.querySelector('.nui-qr-chevron');
                        if (otherDetail) { otherDetail.style.maxHeight = '0'; otherDetail.style.opacity = '0'; }
                        if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
                    });
                    // Toggle this one
                    setExpanded(!isOpen, true);
                    expandedPet = !isOpen ? pet.name : null;
                });

                container.appendChild(card);
            });

            // ── Wire Petpet panel toggle ──
            container.querySelectorAll('.btn-toggle-petpet').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const petName = btn.getAttribute('data-pet');
                    const card = btn.closest('.nui-qr-card');
                    const panel = card && card.querySelector('.nui-petpet-panel');
                    if (!panel) return;
                    const isOpen = panel.style.display === 'flex';
                    panel.style.display = isOpen ? 'none' : 'flex';
                    btn.textContent = isOpen ? '🐾 Petpet' : '✕ Petpet';
                });
            });

            // ── Helper: scrape _ref_ck from page source ──
            function getRefCk() {
                const m = document.documentElement.innerHTML.match(/_ref_ck['":\s]+['"]([a-f0-9]{32})['"]/);
                return m ? m[1] : '';
            }

            // ── Helper: show petpet result message ──
            function showPetpetResult(panel, msg, isError) {
                const el = panel.querySelector('.nui-petpet-result');
                if (!el) return;
                el.style.display = 'block';
                el.style.background = isError ? 'var(--nui-danger-soft)' : 'var(--nui-success-soft)';
                el.style.color = isError ? 'var(--nui-danger)' : 'var(--nui-success)';
                el.style.borderColor = isError ? 'var(--nui-danger)' : 'var(--nui-success)';
                el.innerHTML = msg;
                setTimeout(() => { el.style.display = 'none'; }, 4000);
            }

            // ── Wire Talk buttons ──
            container.querySelectorAll('.btn-petpet-talk').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const petName = btn.getAttribute('data-pet');
                    const panel = btn.closest('.nui-petpet-panel');
                    const input = panel && panel.querySelector('.nui-petpet-talk-input');
                    const text = input ? input.value.trim() : '';
                    if (!text) return;
                    btn.textContent = '...';
                    btn.disabled = true;
                    try {
                        const fd = new FormData();
                        fd.append('neopet_name', petName);
                        fd.append('type', 'talk');
                        fd.append('text', text);
                        fd.append('_ref_ck', getRefCk());
                        const res = await fetch('/np-templates/ajax/process_neopetpet.php', {
                            method: 'POST',
                            headers: { 'x-requested-with': 'XMLHttpRequest' },
                            body: fd
                        });
                        const data = await res.json();
                        showPetpetResult(panel, data.message, !data.success);
                        if (data.success && input) input.value = '';
                    } catch (err) {
                        showPetpetResult(panel, 'Error: ' + err.message, true);
                    } finally {
                        btn.textContent = 'Go!';
                        btn.disabled = false;
                    }
                });
            });

            // ── Wire Rename buttons ──
            container.querySelectorAll('.btn-petpet-rename').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const petName = btn.getAttribute('data-pet');
                    const panel = btn.closest('.nui-petpet-panel');
                    const input = panel && panel.querySelector('.nui-petpet-rename-input');
                    const newName = input ? input.value.trim() : '';
                    if (!newName) return;
                    btn.textContent = '...';
                    btn.disabled = true;
                    try {
                        const fd = new FormData();
                        fd.append('neopet_name', petName);
                        fd.append('pet_name', newName);
                        fd.append('_ref_ck', getRefCk());
                        const res = await fetch('/np-templates/ajax/process_neopetpet.php', {
                            method: 'POST',
                            headers: { 'x-requested-with': 'XMLHttpRequest' },
                            body: fd
                        });
                        const data = await res.json();
                        showPetpetResult(panel, data.success ? `Renamed to ${newName}!` : data.message, !data.success);
                        if (data.success) {
                            // Update the displayed name in the panel and compact row
                            const nameEl = panel.querySelector('.nui-petpet-name');
                            if (nameEl) nameEl.textContent = newName;
                            if (input) input.value = '';
                        }
                    } catch (err) {
                        showPetpetResult(panel, 'Error: ' + err.message, true);
                    } finally {
                        btn.textContent = 'Rename';
                        btn.disabled = false;
                    }
                });
            });

            // ── Wire Make Active buttons — SPA, no reload ──
            container.querySelectorAll('.btn-make-active').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation(); // don't toggle collapse
                    const pName = btn.getAttribute('data-pet');
                    btn.textContent = 'Switching...';
                    btn.disabled = true;

                    try {
                        await fetch(`/process_changepet.phtml?new_active_pet=${encodeURIComponent(pName)}`);

                        // Fetch the quickref page, re-scrape, re-render — no reload
                        const res = await fetch('/quickref.phtml', { credentials: 'include' });
                        const html = await res.text();
                        const doc = new DOMParser().parseFromString(html, 'text/html');

                        // Re-scrape using the fetched DOM
                        const newPets = [];
                        doc.querySelectorAll('.contentModule').forEach(module => {
                            if (!module.id || !module.id.endsWith('_details')) return;
                            const petName = module.id.replace('_details', '');
                            const isActive = !!module.querySelector('th.contentModuleHeader');
                            const imageDiv = module.querySelector('.pet_image');
                            let imgSrc = 'https://images.neopets.com/themes/h5/basic/images/mystery-icon.png';
                            if (imageDiv && imageDiv.style.backgroundImage) {
                                const match = imageDiv.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                                if (match) { let src = match[1]; if (src.startsWith('//')) src = 'https:' + src; imgSrc = src; }
                            }
                            const rawStats = {};
                            module.querySelectorAll('.pet_stats tr').forEach(row => {
                                const th = row.querySelector('th'), td = row.querySelector('td');
                                if (th && td) rawStats[th.textContent.replace(':','').trim().toLowerCase()] = td.innerHTML.trim();
                            });
                            const getText = (h) => { if (!h) return '-'; const t = doc.createElement('div'); t.innerHTML = h; return t.textContent.trim(); };
                            const petpets = [];
                            const lastRow = module.querySelector('.pet_stats tr:last-child td[colspan="2"]');
                            if (lastRow) lastRow.querySelectorAll('img').forEach(img => {
                                let s = img.getAttribute('src');
                                if (s.startsWith('//')) s = 'https:' + s; else if (s.startsWith('/')) s = 'https://images.neopets.com' + s;
                                petpets.push(s);
                            });
                            const headerEl = module.querySelector('th a');
                            const fullHeaderText = headerEl ? headerEl.parentNode.textContent : '';
                            let companionText = '';
                            if (fullHeaderText.includes(' with ')) companionText = fullHeaderText.split(' with ')[1].trim();
                            const noticesContainer = module.querySelector('.pet_notices');
                            let noticeHtml = '';
                            if (noticesContainer && noticesContainer.textContent.trim().length > 0) {
                                const sfDiv = noticesContainer.querySelector('.sf');
                                if (sfDiv) noticeHtml = sfDiv.innerHTML.split('<br>')[0].trim();
                            }
                            newPets.push({ name: petName, isActive, imgSrc,
                                species: getText(rawStats.species), color: getText(rawStats.colour),
                                gender: getText(rawStats.gender), age: getText(rawStats.age),
                                lvl: getText(rawStats.level), hp: getText(rawStats.health),
                                mood: getText(rawStats.mood), hunger: getText(rawStats.hunger),
                                str: getText(rawStats.strength), def: getText(rawStats.defence),
                                mov: getText(rawStats.move), int: getText(rawStats.intelligence),
                                companionText, petpets, noticeHtml
                            });
                        });
                        newPets.sort((a, b) => (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1);

                        // Slide out, swap, slide in
                        container.style.transition = 'opacity 0.18s ease';
                        container.style.opacity = '0';
                        setTimeout(() => {
                            expandedPet = pName;
                            renderAllCards(newPets, pName);
                            container.style.opacity = '1';
                        }, 180);

                    } catch (err) {
                        btn.textContent = 'Error';
                        btn.className = 'nui-btn nui-btn-danger nui-btn-sm';
                        setTimeout(() => { btn.textContent = 'Make Active'; btn.disabled = false; btn.className = 'nui-btn nui-btn-primary nui-btn-sm btn-make-active'; }, 2000);
                    }
                });
            });
        }

        // 6. Initial render — active pet pre-expanded
        renderAllCards(petsData, expandedPet);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try { run(); } catch (err) { showFatalError(err); }
    } else {
        document.addEventListener('DOMContentLoaded', () => { try { run(); } catch (err) { showFatalError(err); } });
    }
})();

// ==============================================================================
// MODULE 8: NEOBOARDS SPA (TABBED MULTI-THREADING & QUICK REPLY)
// ==============================================================================

(function () {
    'use strict';

    const path = location.pathname;
    // Use startsWith('/neoboards/') to avoid matching other pages whose paths
    // happen to contain "index.phtml" (e.g. /community/index.phtml, /guilds/index.phtml).
    // This was causing the SPA shell to fire on unrelated pages, load the board
    // index via fetch, and render a blank neoboard thread over the actual page.
    const isIndex = path === '/neoboards/' || path === '/neoboards/index.phtml';
    const isBoardList = path.startsWith('/neoboards/') && path.includes('boardlist.phtml');
    const isCreateTopic = path.startsWith('/neoboards/') && path.includes('create_topic.phtml');
    // NOTE: 'topic.phtml' is a substring of 'create_topic.phtml', so isCreateTopic
    // must be excluded here or this page gets misrouted into the thread viewer
    // (which looks for #boardTopic — create_topic.phtml uses #boardCreateTopic —
    // and renders "Thread not found or deleted.").
    const isTopic = path.startsWith('/neoboards/') && path.includes('topic.phtml') && !isCreateTopic;

    if (!isIndex && !isBoardList && !isTopic && !isCreateTopic) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('neoboards')) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Neoboards SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) { }
    }

    function escapeHTML(str) { const div = document.createElement('div'); div.textContent = String(str || ''); return div.innerHTML; }

    const NeoUI = window.NeoUI;

    // --- State Management ---
    let openThreads = []; // Array of { id, title, url, htmlCache }
    let activeTabId = 'board'; // 'board', 'create', or a thread ID
    // Restore the last-visited board URL so a refresh lands back where you were
    const _savedBoardUrl = localStorage.getItem('nui_last_board_url');
    let currentBoardUrl = (_savedBoardUrl && _savedBoardUrl.includes('neopets.com')) ? _savedBoardUrl : window.location.href;
    let newTopicUrl = null; // scraped from the board list's "createTopicButton" link

    let favThreads = JSON.parse(localStorage.getItem('nui_fav_threads') || '[]');
    let recentThreads = JSON.parse(localStorage.getItem('nui_recent_threads') || '[]');
    let favBoards = JSON.parse(localStorage.getItem('nui_fav_boards') || '[]'); // [{id, title, url, iconUrl}] — whole boards (Avatar Chat, Site Games...), not individual topics

    // Restore open tabs and active tab from this browser session (cleared on tab close)
    restoreSessionState();

    // --- Per-board pen state (NES parity) ---
    // perBoardPen: when true, pen preference and mode are stored separately per
    // board number (scraped from the breadcrumb URL) instead of globally.
    // Storage keys: nui_pen_mode[_<boardNum>], nui_pen_val[_<boardNum>]
    let perBoardPen = localStorage.getItem('nui_per_board_pen') === 'true';

    function getBoardNumFromUrl(url) {
        const m = (url || '').match(/[?&]board=(\d+)/);
        return m ? m[1] : null;
    }
    function resolveBoardListUrl(doc, pageUrl) {
        // Direct-load thread/create-topic pages never run loadBoardList(), so
        // currentBoardUrl is left pointing at the thread/create-topic URL
        // itself unless we resolve the real parent board here — clicking the
        // Board tab afterward would otherwise fetch that same non-board page
        // and try (and fail) to render it as a board list.
        const links = doc.querySelectorAll('.topicNavTop .breadcrumbs a, .breadcrumbs a');
        for (const a of links) {
            if (a.href && a.href.includes('boardlist.phtml')) return a.href;
        }
        const boardNum = getBoardNumFromUrl(pageUrl);
        if (boardNum) {
            try { return new URL('boardlist.phtml?board=' + boardNum, pageUrl).href; } catch (e) { }
        }
        return null;
    }
    function getCurrentBoardNum() {
        // Try the live breadcrumb first, then fall back to currentBoardUrl
        const crumb = document.querySelector('.topicNavTop .breadcrumbs a');
        if (crumb && crumb.nextElementSibling && crumb.nextElementSibling.href) {
            const n = getBoardNumFromUrl(crumb.nextElementSibling.href);
            if (n) return n;
        }
        return getBoardNumFromUrl(currentBoardUrl);
    }
    function penKey(base) {
        if (perBoardPen) {
            const n = getCurrentBoardNum();
            if (n) return base + '_' + n;
        }
        return base;
    }
    function loadPenState() {
        penMode = localStorage.getItem(penKey('nui_pen_mode')) || '__remember__';
        savedPenVal = localStorage.getItem(penKey('nui_pen_val')) || '0';
    }
    let penMode = '__remember__';
    let savedPenVal = '0';
    loadPenState();

    // --- Emoticon list ---
    // The full smiley picker on Neoboards is injected client-side by a different
    // userscript, not present in the raw HTML this module fetches with fetch().
    // So instead of scraping it, we ship the full code->file map directly.
    const SMILEY_BASE = 'https://images.neopets.com/neoboards/smilies/';
    function starWrap(names) { return names.map(n => ({ code: `*${n}*`, file: `${n}.gif` })); }

    const NEOBOARD_SMILIES = [
        ...starWrap(['aaa', 'abigail', 'angrylawyerbot', 'awakened', 'boatswain', 'brutes', 'brynn', 'cabinboy', 'capn3legs', 'dreamy', 'coltzan', 'cook', 'fyora', 'gunner', 'hanso', 'happiness', 'illusen', 'jazan', 'jhudora', 'lawyerbot', 'lulu', 'mate', 'mipsy', 'mrcoconut', 'nabile', 'nox', 'order', 'quartermaster', 'rigger', 'rohane', 'rower', 'seekers', 'shopwiz', 'sloth', 'snowager', 'swabbie', 'sway', 'talinia', 'techomaster', 'thieves', 'turmaculus', 'velm', 'wizard']),
        ...starWrap(['acara', 'aisha', 'blumaroo', 'bori', 'bruce', 'buzz', 'chia', 'chomby', 'cybunny', 'draik', 'elephante', 'eyrie', 'flotsam', 'gelert', 'gnorbu', 'grarrl', 'grundo', 'hissi', 'ixi', 'jetsam', 'jubjub', 'kacheek', 'kau', 'kiko', 'koi', 'korbat', 'kougra', 'krawk', 'kyrii', 'lenny', 'lupe', 'lutari', 'meerca', 'moehog', 'mynci', 'nimmo', 'ogrin', 'peophin', 'poogle', 'pteri', 'quiggle', 'ruki', 'scorchio', 'shoyru', 'skeith', 'techo', 'tonu', 'tuskaninny', 'uni', 'usul', 'vandagyre', 'wocky', 'xweetok', 'yurble', 'zafara']),
        ...starWrap(['angelpuss', 'feepit', 'jellykacheek', 'jimmi', 'jinjah', 'kadoatery', 'kadoatie', 'larnikin', 'meepit', 'meowclops', 'mootix', 'niptor', 'noil', 'pinchit', 'plumpy', 'purplebug', 'slorg', 'snowbunny', 'spyder', 'swipe', 'warf', 'weewoo', 'woogy', 'yooyu', 'zomutt']),
        ...starWrap(['babypb', 'bacon', 'baf', 'battleduck', 'bdf', 'bef', 'bff', 'bgc', 'blf', 'bluesand', 'blurf', 'book', 'bwf', 'codestone', 'cookie', 'cupcake', 'dariganpb', 'dbd', 'dubloon', 'eventidepb', 'eventidepppb', 'faeriepb', 'greensand', 'icecream', 'islandpb', 'jelly', 'maractitepb', 'mspp', 'omelette', 'orangesand', 'pie', 'pinksand', 'piratepb', 'popcorn', 'scroll', 'sock', 'starberry', 'stonepie', 'suap', 'tigerfruit', 'twirlyfruit', 'ummagine', 'woodlandpb', 'wraithpb']),
        ...starWrap(['aishadow', 'angrynegg', 'bauble', 'bballoon', 'brownleaf', 'candle', 'candycane', 'creepyspyder', 'eekeek', 'fence', 'festivalnegg', 'firecrackers', 'fishnegg', 'flower', 'gballoon', 'ghost', 'happynegg', 'heart', 'holly', 'jackolantern', 'leafleft', 'leafright', 'luckydraik', 'mistletoe', 'negg', 'paperlantern', 'present', 'pumpkin', 'rballoon', 'redleaf', 'rednose', 'roses', 'santa', 'shamrock', 'snowflake', 'snowman', 'spyder', 'tombstone', 'web', 'xmastree', 'yballoon', 'yellowleaf']),
        { code: '*witch*', file: 'witchhat.gif' },
        ...starWrap(['altador', 'brightvale', 'dacardia', 'darigan', 'faerieland', 'haunted', 'kikolake', 'krawkisland', 'kreludor', 'lostdesert', 'maraqua', 'meridell', 'mystery', 'moltara', 'rooisland', 'shenkuu', 'terror', 'tyrannia', 'virtupets', 'air', 'dark', 'earth', 'fire', 'light', 'physical', 'water', 'carrot', 'catfish', 'cloud', 'rainbow', 'coffee', 'dung', 'genie', 'indubitably', 'kqdoor', 'kqkey', 'map', 'moneybag', 'monocle', 'moon', 'raincloud', 'star', 'sun', 'tea', 'tophat', 'yarn']),
        { code: '*0.o.0*', file: '0.o.0.gif' },
        { code: ':)', file: 'smiley.gif' },
        { code: '0:-)', file: 'angel.gif' },
        { code: ':o', file: 'oh.gif' },
        { code: ':(', file: 'sad.gif' },
        { code: ':D', file: 'grin.gif' },
        { code: 'B)', file: 'sunglasses.gif' },
        { code: ':P', file: 'tongue.gif' },
        { code: ':K', file: 'vampire.gif' },
        { code: ';)', file: 'winking.gif' },
        { code: '*yarr*', file: 'yarr.gif' },
        { code: ':*', file: 'kisskiss.gif' },
        { code: '*angry*', file: 'angry.gif' },
        { code: '*complain*', file: 'complain.gif' },
        { code: '*facepalm*', file: 'facepalm.gif' },
        { code: '*cough*', file: 'cough.gif' },
        { code: '*lol*', file: 'lol.gif' },
        { code: '*unsure*', file: 'unsure.gif' },
        { code: '*cry*', file: 'cry.gif' },
        { code: '*clap*', file: 'clap.gif' },
        { code: '*violin*', file: 'violin.gif' }
    ].map(s => ({ code: s.code, src: SMILEY_BASE + s.file }));

    // Category slices match NES script insertion order:
    // Characters(43), Pets(55), Petpets(25), Items(44), Holidays(43), Misc(48), Faces(20)
    const SMILEY_CATEGORIES = [
        { label: '🧙 Chars',    emoji: '🧙', start: 0,   count: 43 },
        { label: '🐾 Pets',     emoji: '🐾', start: 43,  count: 55 },
        { label: '🐱 Petpets', emoji: '🐱', start: 98,  count: 25 },
        { label: '📦 Items',   emoji: '📦', start: 123, count: 44 },
        { label: '🎃 Events',  emoji: '🎃', start: 167, count: 43 },
        { label: '🌙 Misc',    emoji: '🌙', start: 210, count: 48 },
        { label: '😊 Faces',   emoji: '😊', start: 258, count: 20 },
    ];

    const SESSION_STATE_KEY = 'nui_boards_session';

    function saveState() {
        localStorage.setItem('nui_fav_threads', JSON.stringify(favThreads));
        localStorage.setItem('nui_recent_threads', JSON.stringify(recentThreads));
        localStorage.setItem('nui_fav_boards', JSON.stringify(favBoards));
        localStorage.setItem(penKey('nui_pen_mode'), penMode);
        localStorage.setItem(penKey('nui_pen_val'), savedPenVal);
        // Session state: open tabs and active board, cleared when browser session ends
        try {
            sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify({
                openThreads: openThreads.map(t => ({ id: t.id, title: t.title, url: t.url })),
                activeTabId: activeTabId,
                currentBoardUrl: currentBoardUrl,
            }));
        } catch (e) {}
    }

    function restoreSessionState() {
        try {
            const raw = sessionStorage.getItem(SESSION_STATE_KEY);
            if (!raw) return;
            const state = JSON.parse(raw);
            if (state.currentBoardUrl) currentBoardUrl = state.currentBoardUrl;
            if (Array.isArray(state.openThreads)) {
                // Restore tabs without htmlCache — content will be refetched on switch
                openThreads = state.openThreads.map(t => ({ id: t.id, title: t.title, url: t.url, htmlCache: null }));
            }
            if (state.activeTabId) activeTabId = state.activeTabId;
        } catch (e) {}
    }

    function getTopicId(url) {
        const match = url.match(/topic=(\d+)/);
        return match ? match[1] : null;
    }

    // --- App Shell & Routing ---
    function initAppShell() {
        if (document.getElementById('nui-neoboards-app')) return document.getElementById('nui-neoboards-app');

        const profile = NeoUI.scrapeLegacyProfile();

        Array.from(document.body.children).forEach(child => {
            const tag = child.tagName.toLowerCase();
            if (['script', 'style', 'link'].includes(tag)) return;
            if (['panelPopups', 'neoFade', 'colorbox', 'cboxOverlay', 'cboxWrapper'].includes(child.id)) return;
            child.style.display = 'none';
        });

        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        if (!NeoUI.isInitialized) NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        // --- Neoboards settings sections ---
        NeoUI.registerSettingsSection({
            id: 'neoboards_pen',
            title: 'Pen Options',
            render: function (container) {
                function renderPenSettings() {
                    const isPerBoard = localStorage.getItem('nui_per_board_pen') === 'true';
                    container.innerHTML = `
                        <details class="nui-drawer-section">
                            <summary class="nui-drawer-section-title" style="cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
                                Pen Options <span style="font-size:10px; opacity:0.5;">▼</span>
                            </summary>
                            <div style="margin-top:10px; display:flex; flex-direction:column; gap:14px;">
                                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                                    <input type="checkbox" id="nui-per-board-pen" ${isPerBoard ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer; accent-color:var(--nui-accent);">
                                    <span style="font-size:13px; font-weight:700; color:var(--nui-text);">Per-board pen memory</span>
                                </label>
                                <div style="font-size:12px; color:var(--nui-text-muted); line-height:1.5; margin-top:-8px;">
                                    When enabled, your pen choice and mode (Remember / Random) are saved separately for each board.
                                </div>
                                <button type="button" class="nui-btn nui-btn-primary nui-btn-block" id="nui-pen-save">Save</button>
                                <span id="nui-pen-status" style="font-size:12px; text-align:center; color:var(--nui-text-muted); display:block;"></span>
                            </div>
                        </details>
                    `;

                    container.querySelector('#nui-pen-save').addEventListener('click', () => {
                        const checked = container.querySelector('#nui-per-board-pen').checked;
                        localStorage.setItem('nui_per_board_pen', String(checked));
                        perBoardPen = checked;
                        loadPenState();
                        const st = container.querySelector('#nui-pen-status');
                        st.style.color = 'var(--nui-success)';
                        st.textContent = 'Saved! Reload a thread to apply.';
                        setTimeout(() => { st.textContent = ''; }, 3500);
                    });
                }
                renderPenSettings();
            }
        });

        NeoUI.registerSettingsSection({
            id: 'neoboards_vibe',
            title: 'Vibe Rater',
            render: function (container) {
                function renderVibeSettings() {
                    const vibes = window.VibeRater.getAllVibes();
                    const keys = Object.keys(vibes);
                    const presets = window.VibeRater.PRESETS;

                    // Preserve open state of the details wrapper if it already exists
                    const existingDetails = container.querySelector('details.nui-drawer-section');
                    const wasOpen = existingDetails ? existingDetails.open : false;

                    // Assigned Users List
                    const rows = keys.length === 0
                        ? '<div style="font-size:13px; color:var(--nui-text-muted); padding:8px 0;">No vibes assigned yet.</div>'
                        : keys.map(u => {
                            const v = vibes[u];
                            return '<div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--nui-border);">' +
                                '<div style="width:12px; height:12px; border-radius:50%; background:' + v.color + '; flex-shrink:0;"></div>' +
                                '<span style="flex:1; font-size:13px; font-weight:700; color:var(--nui-text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + u + '</span>' +
                                '<span style="font-size:11px; color:var(--nui-text-muted); font-weight:600;">' + v.label + '</span>' +
                                '<button type="button" data-vr="' + u + '" style="font-size:11px; padding:2px 8px; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); background:var(--nui-surface-2); color:var(--nui-danger); cursor:pointer;">✕</button>' +
                            '</div>';
                        }).join('');

                    // Custom Presets List
                    const presetList = presets.map((p, idx) => `
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                            <input type="color" data-preset-idx="${idx}" value="${p.color}" style="width:24px; height:24px; border:none; padding:0; cursor:pointer; background:none;">
                            <input type="text" data-preset-label="${idx}" value="${p.label}" class="nui-input" style="padding:4px 8px; font-size:12px; flex:1;">
                            <button type="button" data-preset-del="${idx}" style="background:none; border:none; color:var(--nui-danger); cursor:pointer; font-weight:bold;">✕</button>
                        </div>
                    `).join('');

                    container.innerHTML = `
                        <details class="nui-drawer-section"${wasOpen ? ' open' : ''}>
                            <summary class="nui-drawer-section-title" style="cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
                                Vibe Rater <span style="font-size:10px; opacity:0.5;">▼</span>
                            </summary>
                            <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 16px;">
                                <div>
                                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--nui-text-faint); letter-spacing:0.5px; margin-bottom:6px;">Presets</div>
                                    <div style="font-size:12px; color:var(--nui-text-muted); margin-bottom: 10px; line-height:1.5;">Customize your vibe options. Edits are saved automatically.</div>
                                    <div id="nui-vibe-presets-container">
                                        ${presetList}
                                        <button type="button" id="nui-add-preset" class="nui-btn nui-btn-secondary nui-btn-sm nui-btn-block" style="margin-top:8px;">+ Add New Vibe</button>
                                    </div>
                                </div>
                                <div>
                                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--nui-text-faint); letter-spacing:0.5px; margin-bottom:6px;">Assigned Users</div>
                                    <div>${rows}</div>
                                    ${keys.length > 0 ? '<button type="button" id="nui-vr-clear-all" class="nui-btn nui-btn-danger nui-btn-block" style="margin-top:10px;">Clear All Assigned</button>' : ''}
                                </div>
                            </div>
                        </details>
                    `;

                    // Preset Editing Logic
                    const updatePresets = () => {
                        const newPresets = [];
                        container.querySelectorAll('[data-preset-idx]').forEach(colorInput => {
                            const idx = colorInput.getAttribute('data-preset-idx');
                            const labelInput = container.querySelector(`[data-preset-label="${idx}"]`);
                            const id = labelInput.value.toLowerCase().replace(/[^a-z0-9]/g, '_') || `vibe_${idx}`;
                            newPresets.push({ id, label: labelInput.value || 'Custom', color: colorInput.value });
                        });
                        window.VibeRater.saveCustomPresets(newPresets);
                    };

                    container.querySelectorAll('[data-preset-idx], [data-preset-label]').forEach(input => {
                        input.addEventListener('change', updatePresets);
                    });

                    container.querySelectorAll('[data-preset-del]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            btn.parentElement.remove();
                            updatePresets();
                            renderVibeSettings();
                        });
                    });

                    container.querySelector('#nui-add-preset').addEventListener('click', (e) => {
                        e.stopPropagation();
                        const current = window.VibeRater.PRESETS;
                        current.push({ id: `new_${Date.now()}`, label: 'New Vibe', color: '#888888' });
                        window.VibeRater.saveCustomPresets(current);
                        renderVibeSettings();
                    });
                    container.querySelector('#nui-add-preset').addEventListener('touchend', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const current = window.VibeRater.PRESETS;
                        current.push({ id: `new_${Date.now()}`, label: 'New Vibe', color: '#888888' });
                        window.VibeRater.saveCustomPresets(current);
                        renderVibeSettings();
                    });

                    // User Assignment Logic
                    container.querySelectorAll('[data-vr]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            window.VibeRater.clearVibe(btn.getAttribute('data-vr'));
                            renderVibeSettings();
                        });
                    });

                    const clearAll = container.querySelector('#nui-vr-clear-all');
                    if (clearAll) clearAll.addEventListener('click', (e) => { e.stopPropagation(); window.VibeRater.clearAll(); renderVibeSettings(); });
                }

                renderVibeSettings();
                // Ensure UI updates if vibes are changed elsewhere (e.g. from the popup)
                window.VibeRater.onChange((changed) => {
                    if (changed === '__all__' || changed === '__presets__') renderVibeSettings();
                });
            }
        });

        const appWrapper = document.createElement('div');
        appWrapper.id = 'nui-neoboards-app';
        appWrapper.style.cssText = 'display: flex; flex-direction: column; height: 100vh; padding-top: var(--nui-topbar-h); box-sizing: border-box;';

        // Top row holds the thread tabs (scrollable) plus fave/refresh (pinned to
        // the right, always visible without scrolling) — shown only while a
        // thread tab is open.
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display: flex; align-items: center; background: var(--nui-surface-2); border-bottom: 1px solid var(--nui-border); flex-shrink: 0;';

        const tabBar = document.createElement('div');
        tabBar.id = 'nui-thread-tabs';
        tabBar.style.cssText = 'display: flex; gap: 4px; overflow-x: auto; padding: 8px 12px; scrollbar-width: none; flex: 1; min-width: 0; -webkit-overflow-scrolling: touch;';
        topRow.appendChild(tabBar);

        const actionBar = document.createElement('div');
        actionBar.id = 'nui-thread-actionbar';
        actionBar.style.cssText = 'display: none; gap: 8px; padding: 8px 12px; flex-shrink: 0;';
        actionBar.innerHTML = `
            <button type="button" id="nui-fav-btn-top" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            </button>
            <button type="button" id="nui-thread-refresh-top" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
        `;
        topRow.appendChild(actionBar);

        appWrapper.appendChild(topRow);

        const contentArea = document.createElement('div');
        contentArea.id = 'nui-content-area';
        contentArea.style.cssText = 'flex: 1; min-height: 0; overflow-y: auto; padding: var(--nui-space-4); display: flex; flex-direction: column; align-items: center; -webkit-overflow-scrolling: touch;';
        appWrapper.appendChild(contentArea);

        document.body.appendChild(appWrapper);
        return appWrapper;
    }

    function renderTabs() {
        const tabBar = document.getElementById('nui-thread-tabs');
        if (!tabBar) return;
        tabBar.innerHTML = '';

        const boardTab = document.createElement('button');
        boardTab.className = `nui-pill ${activeTabId === 'board' ? 'is-active' : ''}`;
        boardTab.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: none; cursor: pointer; flex-shrink: 0;';
        boardTab.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> Board`;
        boardTab.addEventListener('click', () => switchTab('board'));
        tabBar.appendChild(boardTab);

        if (activeTabId === 'create') {
            const createTab = document.createElement('div');
            createTab.className = 'nui-pill is-active';
            createTab.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 6px 8px 6px 12px; border: none; cursor: pointer; flex-shrink: 0;';
            createTab.innerHTML = `<span style="font-size:12px;">✏️ New Topic</span>`;
            const closeBtn = document.createElement('div');
            closeBtn.style.cssText = 'width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,0,0,0.1); color: inherit; font-size: 14px; line-height: 1;';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', (e) => { e.stopPropagation(); switchTab('board'); });
            createTab.appendChild(closeBtn);
            tabBar.appendChild(createTab);
        }

        openThreads.forEach(thread => {
            const tTab = document.createElement('div');
            tTab.className = `nui-pill ${activeTabId === thread.id ? 'is-active' : ''}`;
            tTab.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 6px 8px 6px 12px; border: none; cursor: pointer; flex-shrink: 0; max-width: 180px;';

            const titleSpan = document.createElement('span');
            titleSpan.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px;';
            titleSpan.innerHTML = thread.title;
            titleSpan.addEventListener('click', () => switchTab(thread.id));

            const closeBtn = document.createElement('div');
            closeBtn.style.cssText = 'width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,0,0,0.1); color: inherit; font-size: 14px; line-height: 1;';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeThread(thread.id);
            });

            tTab.appendChild(titleSpan);
            tTab.appendChild(closeBtn);
            tabBar.appendChild(tTab);
        });
    }

   function switchTab(id) {
        activeTabId = id;
        renderTabs();

        const contentArea = document.getElementById('nui-content-area');
        contentArea.innerHTML = '';

        if (id === 'board') {
            const actionBar = document.getElementById('nui-thread-actionbar');
            if (actionBar) actionBar.style.display = 'none';

            // Update address bar to the board URL
            if (currentBoardUrl) window.history.replaceState(null, '', currentBoardUrl);

            loadBoardList(currentBoardUrl, contentArea);
        } else if (id === 'create') {
            const url = newTopicUrl || currentBoardUrl;
            loadCreateTopicView(url, contentArea);
        } else {
            const thread = openThreads.find(t => t.id === id);
            if (thread) {
                // Update address bar to the thread URL so the Referer header is correct
                window.history.replaceState(null, '', thread.url);

                if (thread.htmlCache) {
                    renderThreadUI(thread.htmlCache, contentArea, thread.url, thread.id);
                } else {
                    fetchThread(thread.url, thread.id, contentArea);
                }
            }
        }
    }
    function closeThread(id) {
        openThreads = openThreads.filter(t => t.id !== id);
        if (activeTabId === id) switchTab('board');
        else renderTabs();
    }

    async function fetchThread(url, id, container, preserveScroll = false) {
        const savedScroll = container.scrollTop;

        // If we're refreshing, don't wipe the screen. Just dim it slightly.
        if (!preserveScroll) {
            container.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">📡</span><br>Fetching thread...</div>`;
        } else {
            container.style.opacity = '0.6';
            container.style.pointerEvents = 'none';
        }

        try {
            const res = await fetch(url);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const thread = openThreads.find(t => t.id === id);
            if (thread) thread.htmlCache = doc;

            if (activeTabId === id) {
                renderThreadUI(doc, container, url, id);

                // Restore scroll if requested, otherwise snap to top
                if (preserveScroll) {
                    container.scrollTop = savedScroll;
                } else {
                    container.scrollTop = 0;
                }
            }
        } catch (err) {
            container.innerHTML = `<div class="nui-empty" style="color: var(--nui-danger);">Failed to load thread.<br><pre style="font-size:10px; white-space:pre-wrap; word-break:break-all;">${err && err.stack ? err.stack : String(err)}</pre></div>`;
        } finally {
            // Always restore opacity/clicks when done
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        }
    }


    // --------------------------------------------------------------------------
    // THREAD UI & QUICK REPLY (PHASE 3)
    // --------------------------------------------------------------------------
    function renderThreadUI(doc, container, currentUrl, threadId) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width: 100%; max-width: 850px; display: flex; flex-direction: column; gap: var(--nui-space-3); padding-bottom: 40px;';
        container.appendChild(wrapper);

        let topicTitleHtml = 'Thread';
        let paginationHtml = '';
        let replyFormData = null;
        const posts = [];
        const smilies = [];

        const boardTopic = doc.getElementById('boardTopic');
        if (!boardTopic) {
            wrapper.innerHTML = `<div class="nui-empty">Thread not found or deleted.</div>`;
            return;
        }

        const titleEl = boardTopic.querySelector('.topicTitle h1');
        if (titleEl) topicTitleHtml = titleEl.innerHTML.replace(/^Topic:\s*/i, '');

        const safeTitleStr = topicTitleHtml.replace(/<[^>]+>/g, '').trim();
        recentThreads = recentThreads.filter(t => t.id !== threadId);
        recentThreads.unshift({ id: threadId, title: safeTitleStr, url: currentUrl });
        if (recentThreads.length > 15) recentThreads.pop();
        saveState();

        const pageNav = boardTopic.querySelector('.pageNav');
        if (pageNav) {
            const clones = Array.from(pageNav.childNodes).map(n => n.cloneNode(true));
            const tempDiv = document.createElement('div');
            clones.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.tagName === 'A') {
                        node.className = 'nui-pill nui-ajax-page';
                        node.style.padding = '6px 12px';
                    } else if (node.tagName === 'SPAN' && node.className === 'boardPageButton-active') {
                        node.className = 'nui-pill is-active';
                        node.style.padding = '6px 12px';
                    }
                }
                tempDiv.appendChild(node);
            });
            paginationHtml = tempDiv.innerHTML;
        }

        boardTopic.querySelectorAll('li').forEach(li => {
            if (!li.querySelector('.boardPostByline')) return;

            // Neoboard avatar (.postAuthorIcon img) — robust fallback for new layouts
            const avatarImgEl = li.querySelector('.postAuthorIcon img, .authorIcon img');
            const avatarDivEl = li.querySelector('.postAuthorIcon, .authorIcon');
            let avatarUrl = 'https://images.neopets.com/neoboards/avatars/default.gif';

            if (avatarImgEl && avatarImgEl.getAttribute('src')) {
                let src = avatarImgEl.getAttribute('src');
                if (src.startsWith('//')) src = 'https:' + src; else if (src.startsWith('/')) src = 'https://images.neopets.com' + src;
                avatarUrl = src;
            } else if (avatarDivEl && avatarDivEl.style.backgroundImage) {
                const match = avatarDivEl.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (match) {
                    let src = match[1];
                    if (src.startsWith('//')) src = 'https:' + src; else if (src.startsWith('/')) src = 'https://images.neopets.com' + src;
                    avatarUrl = src;
                }
            }

            // Active pet icon (.postAuthorPetIcon img) — shown alongside avatar
            const petIconEl = li.querySelector('.postAuthorPetIcon img');
            let petIconUrl = '';
            if (petIconEl && petIconEl.getAttribute('src')) {
                let psrc = petIconEl.getAttribute('src');
                if (psrc.startsWith('//')) psrc = 'https:' + psrc; else if (psrc.startsWith('/')) psrc = 'https://images.neopets.com' + psrc;
                petIconUrl = psrc;
            }

            const authorNameEl = li.querySelector('.postAuthorName');
            const authorName = authorNameEl ? authorNameEl.textContent.trim() : 'Unknown';

            const authorInfoPs = li.querySelectorAll('.postAuthorInfo p, .authorInfo p');
            const authorMetaArray = Array.from(authorInfoPs)
                .map(p => p.textContent.trim())
                .filter(t => t.length > 0);

            const authorMetaStr = authorMetaArray.join(' &middot; ');

            const dateEl = li.querySelector('.boardPostDate');
            const dateStr = dateEl ? dateEl.textContent.trim() : '';
            const messageEl = li.querySelector('.boardPostMessage');
            const messageHtml = messageEl ? messageEl.innerHTML : '';

            posts.push({ avatarUrl, petIconUrl, authorName, authorMetaStr, dateStr, messageHtml });
        });
        smilies.push(...NEOBOARD_SMILIES);

        const formEl = doc.querySelector('form[name="message_form"]');
        if (formEl) {
            // Remove any previously attached hidden forms to prevent duplicates
            document.querySelectorAll('form.nui-hidden-native-form').forEach(f => f.remove());

            // Append the actual native Neopets form from the fetched thread to the LIVE document
            formEl.classList.add('nui-hidden-native-form');
            formEl.style.display = 'none';
            document.body.appendChild(formEl);

            const resolvedAction = formEl.getAttribute('action') || 'process_topic.phtml';
            replyFormData = {
                action: resolvedAction,
                hiddenInputs: [], // Kept as empty array so the quick reply UI mapping doesn't break
                pens: Array.from(formEl.querySelectorAll('.neoboardPen')).map(pen => {
                    const labelEl = pen.querySelector('label');
                    const inputEl = pen.querySelector('input');
                    if (!labelEl || !inputEl) return null;
                    return { label: labelEl.textContent.trim(), val: inputEl.value };
                }).filter(Boolean)
            };
        }

        const isFav = favThreads.some(t => t.id === threadId);
        const headerCard = document.createElement('div');
        headerCard.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--nui-space-2);';

        let displayTitleHtml = topicTitleHtml.replace(/<img/g, '<img style="vertical-align: middle; max-height: 24px; width: auto;"');

        headerCard.innerHTML = `
            <div class="nui-text" style="font-family: var(--nui-font-display); font-size: 22px; font-weight: 800; line-height: 1.3; flex: 1; min-width: 0;">${displayTitleHtml}</div>
        `;
        wrapper.appendChild(headerCard);

        const actionBar = document.getElementById('nui-thread-actionbar');
        if (actionBar) {
            actionBar.style.display = 'flex';

            const favBtn = actionBar.querySelector('#nui-fav-btn-top');
            const refreshBtn = actionBar.querySelector('#nui-thread-refresh-top');

            function setFavBtnState(el, active) {
                el.className = `nui-btn nui-btn-sm ${active ? 'nui-btn-primary' : 'nui-btn-secondary'}`;
                el.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
            }
            setFavBtnState(favBtn, isFav);

            const newFavBtn = favBtn.cloneNode(true);
            favBtn.parentNode.replaceChild(newFavBtn, favBtn);
            newFavBtn.addEventListener('click', () => {
                const exists = favThreads.some(t => t.id === threadId);
                if (exists) {
                    favThreads = favThreads.filter(t => t.id !== threadId);
                } else {
                    favThreads.push({ id: threadId, title: safeTitleStr, url: currentUrl });
                }
                setFavBtnState(newFavBtn, !exists);
                saveState();
            });

            const newRefreshBtn = refreshBtn.cloneNode(true);
            refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
            newRefreshBtn.addEventListener('click', () => fetchThread(currentUrl, threadId, container, true));
        }

        if (paginationHtml) {
            const topPager = document.createElement('div');
            topPager.style.cssText = 'display: flex; gap: 6px; align-items: center; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch; font-weight: 700; color: var(--nui-text-muted); font-size: 13px; white-space: nowrap;';
            topPager.innerHTML = paginationHtml;
            wrapper.appendChild(topPager);
        }

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'nui-surface nui-reset';
            postCard.style.cssText = 'border: 1px solid var(--nui-border); border-radius: var(--nui-radius-md); display: flex; flex-direction: column; box-shadow: 0 2px 4px var(--nui-shadow);';

            const petIconHtml = post.petIconUrl
                ? `<img src="${post.petIconUrl}" alt="pet" style="width:50px; height:50px; object-fit:contain; flex-shrink:0; filter:drop-shadow(0 1px 3px var(--nui-shadow));">`
                : '';

            const postDisplayName = window.NickNames ? window.NickNames.display(post.authorName) : post.authorName;
            const postHasNick = postDisplayName !== post.authorName;
            const postNameHtml = postHasNick
                ? `${escapeHTML(postDisplayName)} <span style="font-size:11px;opacity:0.5;font-weight:600;">(${escapeHTML(post.authorName)})</span>`
                : escapeHTML(post.authorName);

            postCard.innerHTML = `
                <div data-post-header style="display: flex; flex-wrap: wrap; background: var(--nui-surface-2); border-bottom: 1px solid var(--nui-border); border-radius: calc(var(--nui-radius-md) - 1px) calc(var(--nui-radius-md) - 1px) 0 0;">
                    <div style="padding: 12px 16px; display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                        <a href="/userlookup.phtml?user=${encodeURIComponent(post.authorName)}" target="_blank" rel="noopener" style="display: block; width: 50px; height: 50px; background: var(--nui-surface) url('${post.avatarUrl}') center/cover no-repeat; flex-shrink: 0; text-decoration: none;"></a>
                        <div style="display: flex; flex-direction: column; justify-content: center; flex: 1; min-width: 0;">
                            <a href="/userlookup.phtml?user=${encodeURIComponent(post.authorName)}" target="_blank" rel="noopener" style="font-weight: 800; font-size: 16px; color: var(--nui-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-decoration: none;">
                                ${postNameHtml}
                            </a>
                            <div style="font-size: 12px; color: var(--nui-text-muted); font-weight: 600; line-height: 1.4; margin-top: 2px;">
                                ${post.authorMetaStr}
                            </div>
                        </div>
                        ${petIconHtml}
                    </div>
                    <div style="padding: 12px 16px; display: flex; align-items: center; justify-content: flex-end; font-size: 11.5px; font-weight: 700; color: var(--nui-text-faint); flex-shrink: 0;">
                        ${post.dateStr}
                    </div>
                </div>
                <div style="padding: var(--nui-space-4); font-size: 14px; line-height: 1.6; color: #000000; background: #FFFFFF; overflow-wrap: break-word; word-wrap: break-word;">
                    ${post.messageHtml}
                </div>
            `;

            postCard.querySelectorAll('.boardPostMessage img').forEach(img => { img.style.maxWidth = '100%'; img.style.height = 'auto'; });
            postCard.querySelectorAll('.boardPostMessage p, .boardPostMessage div').forEach(el => { el.style.maxWidth = '100%'; el.style.overflowWrap = 'break-word'; });

            const actionsRow = document.createElement('div');
            actionsRow.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px 16px 10px; border-top: 1px solid var(--nui-border); background: var(--nui-surface-2);';

            const iconStyle = 'height: 18px; width: 18px; vertical-align: middle; opacity: 0.75; transition: opacity 0.15s, transform 0.15s;';
            const btnStyle = 'cursor: pointer; display: inline-flex; align-items: center; padding: 3px; border-radius: 4px; background: none; border: none; transition: transform 0.15s;';
            const p = post.authorName;

            const actionLinks = [
                { href: `/neomessages.phtml?type=send&recipient=${p}`,                             src: 'https://images.neopets.com/themes/h5/basic/images/v3/neomail-icon.svg',  title: 'Send Neomail' },
                { href: `/island/tradingpost.phtml?type=browse&criteria=owner&search_string=${p}`, src: 'https://images.neopets.com/themes/h5/basic/images/tradingpost-icon.png', title: 'Trading Post' },
                { href: `/genie.phtml?type=find_user&auction_username=${p}`,                       src: 'https://images.neopets.com/themes/h5/basic/images/auction-icon.png',      title: 'Auctions' },
                { href: `/browseshop.phtml?owner=${p}`,                                            src: 'https://images.neopets.com/themes/h5/basic/images/myshop-icon.png',       title: 'Shop' },
                { href: `/gallery/index.phtml?gu=${p}`,                                            src: 'https://images.neopets.com/themes/h5/basic/images/v3/gallery-icon.svg',  title: 'Gallery' },
            ];

            actionLinks.forEach(({ href, src, title: ttl }) => {
                const a = document.createElement('a');
                a.href = href; a.title = ttl; a.style.cssText = btnStyle;
                a.innerHTML = `<img src="${src}" alt="${ttl}" title="${ttl}" style="${iconStyle}">`;
                a.addEventListener('mouseenter', () => { a.querySelector('img').style.opacity = '1'; a.style.transform = 'translateY(-1px)'; });
                a.addEventListener('mouseleave', () => { a.querySelector('img').style.opacity = '0.75'; a.style.transform = ''; });
                actionsRow.appendChild(a);
            });

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button'; copyBtn.title = `Copy "${p}"`; copyBtn.style.cssText = btnStyle;
            copyBtn.innerHTML = `<img src="https://images.neopets.com/themes/h5/basic/images/v3/profile-icon.svg" alt="Copy" style="${iconStyle}">`;
            copyBtn.addEventListener('mouseenter', () => { copyBtn.querySelector('img').style.opacity = '1'; copyBtn.style.transform = 'translateY(-1px)'; });
            copyBtn.addEventListener('mouseleave', () => { copyBtn.querySelector('img').style.opacity = '0.75'; copyBtn.style.transform = ''; });
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(p).then(() => {
                    copyBtn.title = 'Copied!'; setTimeout(() => { copyBtn.title = `Copy "${p}"`; }, 1500);
                }).catch(() => {});
            });
            actionsRow.appendChild(copyBtn);

            const postHeader = postCard.querySelector('[data-post-header]');
            const vibeKey = p.toLowerCase().trim();

            function applyPostVibeTint() {
                if (!postHeader) return;
                const vibe = window.VibeRater.getVibe(p);
                if (vibe) {
                    postHeader.style.borderLeft = `4px solid ${vibe.color}`;
                    postHeader.style.background = `linear-gradient(90deg, ${vibe.color}18 0%, var(--nui-surface-2) 80%)`;
                } else {
                    postHeader.style.borderLeft = '';
                    postHeader.style.background = '';
                }
            }
            applyPostVibeTint();
            window.VibeRater.onChange(changed => {
                if (changed === vibeKey || changed === '__all__') applyPostVibeTint();
            });

            const vibeBtn = document.createElement('button');
            vibeBtn.type = 'button'; vibeBtn.style.cssText = btnStyle + ' position: relative;';

            function updateVibeDot() {
                const vibe = window.VibeRater.getVibe(p);
                const c = vibe ? vibe.color : 'var(--nui-border)';
                const op = vibe ? '1' : '0.4';
                vibeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="6" fill="${c}" opacity="${op}"/>
                    <circle cx="9" cy="9" r="8" stroke="${c}" stroke-width="1.5" fill="none" opacity="${vibe ? '0.35' : '0.2'}"/>
                </svg>`;
                vibeBtn.title = vibe ? `Vibe: ${vibe.label} — tap to change` : 'Set vibe';
            }
            updateVibeDot();
            window.VibeRater.onChange(changed => {
                if (changed === vibeKey || changed === '__all__') updateVibeDot();
            });

            vibeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.nui-vibe-pop').forEach(el => el.remove());

                const pop = document.createElement('div');
                pop.className = 'nui-vibe-pop';
                pop.style.cssText = 'position: fixed; z-index: 999999; background: var(--nui-surface); border: 1px solid var(--nui-border); border-radius: var(--nui-radius-md); padding: 8px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 4px 16px var(--nui-shadow); min-width: 120px;';

                window.VibeRater.PRESETS.forEach(preset => {
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.style.cssText = 'display: flex; align-items: center; gap: 8px; width: 100%; padding: 5px 8px; border: none; border-radius: 6px; background: none; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--nui-text); text-align: left; transition: background 0.1s;';
                    opt.innerHTML = `<span style="width:10px; height:10px; border-radius:50%; background:${preset.color}; flex-shrink:0;"></span>${preset.label}`;
                    opt.addEventListener('mouseenter', () => { opt.style.background = preset.color + '22'; });
                    opt.addEventListener('mouseleave', () => { opt.style.background = 'none'; });
                    opt.addEventListener('click', () => { window.VibeRater.setVibe(p, preset.id); pop.remove(); });
                    pop.appendChild(opt);
                });

                const clearOpt = document.createElement('button');
                clearOpt.type = 'button';
                clearOpt.style.cssText = 'display: flex; align-items: center; gap: 8px; width: 100%; padding: 5px 8px; border: none; border-radius: 6px; background: none; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--nui-danger); text-align: left; border-top: 1px solid var(--nui-border); margin-top: 2px; padding-top: 7px; transition: background 0.1s;';
                clearOpt.textContent = '✕  Clear vibe';
                clearOpt.addEventListener('mouseenter', () => { clearOpt.style.background = 'var(--nui-danger-soft)'; });
                clearOpt.addEventListener('mouseleave', () => { clearOpt.style.background = 'none'; });
                clearOpt.addEventListener('click', () => { window.VibeRater.clearVibe(p); pop.remove(); });
                pop.appendChild(clearOpt);

                if (window.NickNames) {
                    const nickOpt = document.createElement('button');
                    nickOpt.type = 'button';
                    const currentNick = window.NickNames.getNick(p);
                    nickOpt.style.cssText = 'display: flex; align-items: center; gap: 8px; width: 100%; padding: 5px 8px; border: none; border-radius: 6px; background: none; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--nui-text-muted); text-align: left; border-top: 1px solid var(--nui-border); margin-top: 2px; padding-top: 7px; transition: background 0.1s;';
                    nickOpt.textContent = currentNick ? `✏️  Edit nick (${currentNick})` : '✏️  Set nickname';
                    nickOpt.addEventListener('mouseenter', () => { nickOpt.style.background = 'var(--nui-surface-2)'; });
                    nickOpt.addEventListener('mouseleave', () => { nickOpt.style.background = 'none'; });
                    nickOpt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        pop.remove();
                        const input = prompt(`Nickname for "${p}" (leave blank to clear):`, currentNick || '');
                        if (input === null) return;
                        if (input.trim()) { window.NickNames.setNick(p, input.trim()); }
                        else { window.NickNames.clearNick(p); }
                        // Only reload the board list if we're actually in board view — never from a thread
                        if (activeTabId === 'board') {
                            const contentArea = document.getElementById('nui-content-area');
                            if (contentArea && currentBoardUrl) loadBoardList(currentBoardUrl, contentArea);
                        }
                    });
                    pop.appendChild(nickOpt);
                }

                document.body.appendChild(pop);
                const btnRect = vibeBtn.getBoundingClientRect();
                const popH = pop.offsetHeight || 200;
                const spaceAbove = btnRect.top;
                const spaceBelow = window.innerHeight - btnRect.bottom;
                if (spaceAbove >= popH + 6 || spaceAbove > spaceBelow) {
                    pop.style.bottom = (window.innerHeight - btnRect.top + 6) + 'px';
                    pop.style.top = 'auto';
                } else {
                    pop.style.top = (btnRect.bottom + 6) + 'px';
                    pop.style.bottom = 'auto';
                }
                pop.style.left = Math.min(btnRect.left, window.innerWidth - 136) + 'px';
                const close = (ev) => { if (!pop.contains(ev.target) && ev.target !== vibeBtn) { pop.remove(); document.removeEventListener('click', close); } };
                setTimeout(() => document.addEventListener('click', close), 0);
            });
            actionsRow.appendChild(vibeBtn);

            const replyBtn = document.createElement('button');
            replyBtn.type = 'button'; replyBtn.title = `Reply to ${p}`;
            replyBtn.style.cssText = 'cursor: pointer; margin-left: auto; font-size: 11px; font-weight: 700; color: var(--nui-text-muted); background: none; border: none; padding: 3px 6px; border-radius: 4px; transition: color 0.15s, transform 0.15s; letter-spacing: 0.2px; text-transform: uppercase;';
            replyBtn.textContent = `@ ${p}`;
            replyBtn.addEventListener('mouseenter', () => { replyBtn.style.color = 'var(--nui-accent)'; replyBtn.style.transform = 'translateY(-1px)'; });
            replyBtn.addEventListener('mouseleave', () => { replyBtn.style.color = 'var(--nui-text-muted)'; replyBtn.style.transform = ''; });
            replyBtn.addEventListener('click', () => {
                const ta = document.querySelector('#nui-quick-reply textarea[name="message"]');
                if (ta) {
                    ta.focus();
                    const ins = `@${p} `;
                    const s = ta.selectionStart || ta.value.length;
                    const e2 = ta.selectionEnd || ta.value.length;
                    ta.value = ta.value.substring(0, s) + ins + ta.value.substring(e2);
                    ta.selectionStart = ta.selectionEnd = s + ins.length;
                    ta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
            actionsRow.appendChild(replyBtn);
            postCard.appendChild(actionsRow);

            const impressPattern = /(https?:\/\/)?(impress(?:-2020)?\.openneo\.net\/(?:user\S*?\/(?:closet|lists)|outfits\/\d+))/g;
            Array.from(postCard.querySelectorAll('div')).filter(d => impressPattern.test(d.innerHTML)).forEach(node => {
                impressPattern.lastIndex = 0;
                node.innerHTML = node.innerHTML.replace(impressPattern, (match, proto, path2) =>
                    `<a href="https://${path2}" target="_blank" rel="noopener" style="color: var(--nui-accent); font-weight: 700; text-decoration: none;">${match}</a>`
                );
            });

            wrapper.appendChild(postCard);
        });

        if (paginationHtml) {
            const bottomPager = document.createElement('div');
            bottomPager.style.cssText = 'display: flex; gap: 6px; align-items: center; overflow-x: auto; padding-top: var(--nui-space-2); scrollbar-width: none; -webkit-overflow-scrolling: touch; font-weight: 700; color: var(--nui-text-muted); font-size: 13px; white-space: nowrap;';
            bottomPager.innerHTML = paginationHtml;
            wrapper.appendChild(bottomPager);
        }

        wrapper.querySelectorAll('.nui-ajax-page').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                fetchThread(btn.href, threadId, container);
            });
        });

        if (replyFormData) {
            const replyWrap = document.createElement('div');
            replyWrap.className = 'nui-surface';
            replyWrap.style.cssText = 'margin-top: var(--nui-space-4); border: 2px solid var(--nui-accent-soft); border-radius: var(--nui-radius-lg); padding: var(--nui-space-4); box-shadow: 0 4px 16px var(--nui-shadow);';

            if (replyFormData.pens.length > 0 && !replyFormData.pens.some(p => p.val === savedPenVal)) {
                savedPenVal = replyFormData.pens[0].val;
                saveState();
            }

            const modeHtml = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--nui-text-faint); flex-shrink: 0;">Mode</span>
                    <button type="button" class="nui-pen-mode" data-mode="__remember__"
                        style="padding: 4px 12px; border-radius: var(--nui-radius-pill); border: 1px solid var(--nui-border); font-size: 11px; font-weight: 700; cursor: pointer; transition: background 0.1s;
                        background: ${penMode === '__remember__' ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)'};
                        color: ${penMode === '__remember__' ? 'var(--nui-accent)' : 'var(--nui-text-muted)'};">
                        Remember
                    </button>
                    <button type="button" class="nui-pen-mode" data-mode="__random__"
                        style="padding: 4px 12px; border-radius: var(--nui-radius-pill); border: 1px solid var(--nui-border); font-size: 11px; font-weight: 700; cursor: pointer; transition: background 0.1s;
                        background: ${penMode === '__random__' ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)'};
                        color: ${penMode === '__random__' ? 'var(--nui-accent)' : 'var(--nui-text-muted)'};">
                        Random
                    </button>
                </div>
            `;

            const penStripHtml = replyFormData.pens.length > 0 ? `
                <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none; -webkit-overflow-scrolling: touch;">
                    ${replyFormData.pens.map(pen => `
                        <button type="button" class="nui-pen-opt" data-val="${pen.val}"
                            style="flex-shrink: 0; padding: 6px 12px; border-radius: var(--nui-radius-pill); border: 1px solid var(--nui-border); font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.1s;
                            background: ${(penMode !== '__remember__' && penMode !== '__random__' && penMode === pen.val) || (penMode === '__remember__' && savedPenVal === pen.val) ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)'};
                            color: ${(penMode !== '__remember__' && penMode !== '__random__' && penMode === pen.val) || (penMode === '__remember__' && savedPenVal === pen.val) ? 'var(--nui-accent)' : 'var(--nui-text-muted)'};">
                            ${pen.label}
                        </button>
                    `).join('')}
                </div>
            ` : '';

            const pensHtml = modeHtml + penStripHtml;

            let smiliesHtml = '';
            if (smilies.length > 0) {
                const panelsHtml = SMILEY_CATEGORIES.map((cat, ci) => {
                    const slice = smilies.slice(cat.start, cat.start + cat.count);
                    const imgs = slice.map(s =>
                        `<img src="${s.src}" data-code="${s.code.replace(/"/g, '&quot;')}" class="nui-smiley-btn" title="${s.code.replace(/"/g, '&quot;')}" style="cursor:pointer; width:20px; height:20px; transition:transform 0.1s;">`
                    ).join('');
                    return `<div class="nui-smiley-panel" data-cat="${ci}" style="display:${ci === 0 ? 'flex' : 'none'}; flex-wrap:wrap; gap:5px; padding:8px;">${imgs}</div>`;
                }).join('');

                const tabsHtml = SMILEY_CATEGORIES.map((cat, ci) =>
                    `<button type="button" class="nui-smiley-tab" data-tab="${ci}" style="flex-shrink:0; padding:5px 9px; font-size:12px; font-weight:700; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); cursor:pointer; transition:background 0.1s; background:${ci === 0 ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)'}; color:${ci === 0 ? 'var(--nui-accent)' : 'var(--nui-text-muted)'};">${cat.label}</button>`
                ).join('');

                smiliesHtml = `
                    <div style="margin-bottom:12px;">
                        <button type="button" id="nui-smiley-toggle" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 10px; font-size:12px; margin-bottom:8px;">
                            😊 Emoticons
                        </button>
                        <div id="nui-smiley-drawer" style="display:none; flex-direction:column; border:1px solid var(--nui-border); border-radius:var(--nui-radius-md); background:var(--nui-surface-2); overflow:hidden;">
                            <div style="display:flex; gap:4px; overflow-x:auto; padding:8px 8px 0; scrollbar-width:none; -webkit-overflow-scrolling:touch;">
                                ${tabsHtml}
                            </div>
                            <div id="nui-smiley-panels" style="max-height:140px; overflow-y:auto;">
                                ${panelsHtml}
                            </div>
                        </div>
                    </div>
                `;
            }

            replyWrap.innerHTML = `
                <div style="font-weight: 800; font-size: 16px; margin-bottom: 12px; color: var(--nui-text);">Quick Reply</div>
                <form id="nui-quick-reply" action="${replyFormData.action}" method="POST" style="display: flex; flex-direction: column; gap: 4px;">
                    ${replyFormData.hiddenInputs.map(inp => `<input type="hidden" name="${inp.name}" value="${inp.value}">`).join('')}
                    ${pensHtml}
                    ${smiliesHtml}
                    <textarea name="message" class="nui-textarea" rows="4" placeholder="Write your reply here..." required maxlength="500" style="resize: vertical; margin-bottom: 4px;"></textarea>
                    <div style="text-align:right;font-size:11px;font-weight:800;color:var(--nui-text-muted);margin-bottom:8px;" class="nui-reply-counter">0 / 500</div>
                    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px;">
                        <span id="nui-reply-status" style="font-size: 13px; font-weight: 700; color: var(--nui-text-muted);"></span>
                        <button type="submit" class="nui-btn nui-btn-primary">Post Reply</button>
                    </div>
                </form>
            `;

            const textarea = replyWrap.querySelector('textarea');
            const replyCounter = replyWrap.querySelector('.nui-reply-counter');
            textarea.addEventListener('input', () => {
                const len = textarea.value.length;
                const pct = len / 500;
                replyCounter.textContent = `${len} / 500`;
                replyCounter.style.color = pct >= 1 ? 'var(--nui-danger)' : pct >= 0.85 ? 'var(--nui-warning)' : 'var(--nui-text-muted)';
            });

            const smileyToggle = replyWrap.querySelector('#nui-smiley-toggle');
            const smileyDrawer = replyWrap.querySelector('#nui-smiley-drawer');
            if (smileyToggle && smileyDrawer) {
                smileyToggle.addEventListener('click', () => {
                    const open = smileyDrawer.style.display !== 'none';
                    smileyDrawer.style.display = open ? 'none' : 'flex';
                });

                replyWrap.querySelectorAll('.nui-smiley-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        const ci = tab.getAttribute('data-tab');
                        replyWrap.querySelectorAll('.nui-smiley-tab').forEach(t => {
                            const active = t.getAttribute('data-tab') === ci;
                            t.style.background = active ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)';
                            t.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                        });
                        replyWrap.querySelectorAll('.nui-smiley-panel').forEach(p => {
                            p.style.display = p.getAttribute('data-cat') === ci ? 'flex' : 'none';
                        });
                    });
                });
            }

            replyWrap.querySelectorAll('.nui-smiley-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    textarea.value += btn.getAttribute('data-code');
                    textarea.focus();
                });
            });

            replyWrap.querySelectorAll('.nui-pen-mode').forEach(btn => {
                btn.addEventListener('click', () => {
                    penMode = btn.getAttribute('data-mode');
                    replyWrap.querySelectorAll('.nui-pen-mode').forEach(b => {
                        const active = b.getAttribute('data-mode') === penMode;
                        b.style.background = active ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)';
                        b.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                    });
                    saveState();
                });
            });

            replyWrap.querySelectorAll('.nui-pen-opt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.getAttribute('data-val');
                    savedPenVal = val;
                    penMode = '__remember__';
                    replyWrap.querySelectorAll('.nui-pen-mode').forEach(b => {
                        const active = b.getAttribute('data-mode') === '__remember__';
                        b.style.background = active ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)';
                        b.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                    });
                    replyWrap.querySelectorAll('.nui-pen-opt').forEach(b => {
                        const active = b.getAttribute('data-val') === val;
                        b.style.background = active ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)';
                        b.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                    });
                    saveState();
                });
            });

            const form = replyWrap.querySelector('form');

            form.addEventListener('submit', async (e) => {
                // Prevent any native navigation — POST via fetch and re-render in-place
                e.preventDefault();

                const submitBtn = form.querySelector('button[type="submit"]');
                const statusEl = form.querySelector('#nui-reply-status');
                submitBtn.disabled = true;
                if (statusEl) { statusEl.style.color = 'var(--nui-text-muted)'; statusEl.textContent = 'Posting…'; }

                const realPens = replyFormData.pens.map(p => p.val);
                let finalPenVal = savedPenVal;
                if (penMode === '__random__') {
                    if (realPens.length > 0) finalPenVal = realPens[Math.floor(Math.random() * realPens.length)];
                } else if (penMode === '__remember__') {
                    finalPenVal = savedPenVal;
                } else if (realPens.includes(penMode)) {
                    finalPenVal = penMode;
                }

                // Build FormData from the hidden native form (captures _ref_ck + all Neopets fields)
                const nativeForm = document.querySelector('form.nui-hidden-native-form');
                if (!nativeForm) {
                    if (statusEl) { statusEl.style.color = 'var(--nui-danger)'; statusEl.textContent = 'Error: form missing.'; }
                    submitBtn.disabled = false;
                    return;
                }

                const fd = new FormData(nativeForm);
                fd.set('message', form.querySelector('textarea[name="message"]').value);
                fd.set('select_pen', finalPenVal);
                // Neopets expects the submit button name in the payload
                fd.set('message_reply', '1');

                const action = nativeForm.getAttribute('action') || 'process_topic.phtml';
                // Resolve properly against the thread's own URL — action is a bare
                // relative path ("process_topic.phtml"), which HTML resolves against
                // the page's directory (/neoboards/), not the site root. Naively
                // prepending '/' sent every reply to /process_topic.phtml (wrong,
                // root-level, doesn't exist) instead of /neoboards/process_topic.phtml.
                const postUrl = new URL(action, currentUrl).href;

                try {
                    const res = await fetch(postUrl, { method: 'POST', body: fd });
                    if (!res.ok) throw new Error('HTTP ' + res.status);

                    const html = await res.text();
                    const newDoc = new DOMParser().parseFromString(html, 'text/html');

                    // Update the cached doc so the tab title survives the re-render
                    const thread = openThreads.find(t => t.id === threadId);
                    if (thread) {
                        thread.htmlCache = newDoc;
                        // Promote "Current Thread" placeholder to the real title now that we have the fresh DOM
                        if (thread.title === 'Current Thread') {
                            const titleEl = newDoc.querySelector('#boardTopic .topicTitle h1');
                            if (titleEl) {
                                thread.title = titleEl.textContent.replace(/^Topic:\s*/i, '').trim();
                                renderTabs();
                            }
                        }
                    }

                    // Re-render in-place — no page navigation, no SPA reset
                    const contentArea = document.getElementById('nui-content-area');
                    renderThreadUI(newDoc, contentArea, currentUrl, threadId);

                } catch (err) {
                    if (statusEl) { statusEl.style.color = 'var(--nui-danger)'; statusEl.textContent = 'Failed to post.'; }
                    submitBtn.disabled = false;
                }
            });

            wrapper.appendChild(replyWrap);
        }
    }

    // --------------------------------------------------------------------------
    // INDEX & BOARD LIST VIEWER (PHASE 1 & 2)
    // --------------------------------------------------------------------------
    function loadBoardList(url, container) {
        currentBoardUrl = url;
        try { localStorage.setItem('nui_last_board_url', url); } catch (e) {}
        container.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">📡</span><br>Fetching board...</div>`;

        fetch(url).then(res => res.text()).then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            if (url.includes('index.phtml') || url.endsWith('/neoboards/')) {
                renderIndexUI(doc, container);
            } else {
                renderBoardListUI(doc, container);
            }
            container.scrollTop = 0;
        }).catch(err => {
            container.innerHTML = `<div class="nui-empty" style="color: var(--nui-danger);">Failed to load board.</div>`;
        });
    }

    function renderIndexUI(doc, container) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        container.appendChild(wrapper);

        wrapper.innerHTML += `<div class="nui-text" style="font-family: var(--nui-font-display); font-size: 26px; font-weight: 800; text-align: center; margin-bottom: -6px;">Neoboard Directory</div>`;

        // Scrape categories/boards up front — the favorites grid needs to
        // resolve full board info (icon, live topic/post counts) by matching
        // favBoards ids against what's actually on the page right now.
        const categories = [];
        let currentCategory = null;
        const boardIndex = doc.getElementById('boardIndex');

        if (boardIndex) {
            const ul = boardIndex.querySelector('ul');
            if (ul) {
                Array.from(ul.children).forEach(child => {
                    if (child.tagName === 'H3') {
                        currentCategory = { title: child.textContent.trim(), boards: [] };
                        categories.push(currentCategory);
                    } else if (child.tagName === 'LI' && currentCategory) {
                        const linkEl = child.querySelector('.boardDesc a');
                        if (!linkEl) return;

                        const title = linkEl.querySelector('h4') ? linkEl.querySelector('h4').textContent.trim() : linkEl.textContent.trim();
                        const url = linkEl.href;
                        const descEl = child.querySelector('.boardDesc-sub');
                        const desc = descEl ? descEl.textContent.trim() : '';

                        const iconDiv = child.querySelector('.boardIcon');
                        let iconUrl = 'https://images.neopets.com/neoboards/boardIcons/general-discussion-board-icon.png';
                        if (iconDiv && iconDiv.style.backgroundImage) {
                            const match = iconDiv.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                            if (match) iconUrl = match[1];
                        }

                        const topics = child.querySelector('.topics') ? child.querySelector('.topics').textContent.trim() : '0';
                        const comments = child.querySelector('.comments') ? child.querySelector('.comments').textContent.trim() : '0';
                        const recent = child.querySelector('.recent') ? child.querySelector('.recent').textContent.trim() : 'Never';

                        const id = getBoardNumFromUrl(url);
                        currentCategory.boards.push({ id, title, url, desc, iconUrl, topics, comments, recent });
                    }
                });
            }
        }

        // ---- Favorite Boards (pinned, always first) ----
        const allBoards = categories.flatMap(c => c.boards);
        const favBoardTile = (board) => `
            <a href="${board.url}" class="nui-item nui-reset nui-board-link nui-fav-board-tile" data-id="${board.id}"
                style="text-decoration: none; margin: 0; padding: 16px 12px 12px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; border: 1px solid var(--nui-border); border-radius: var(--nui-radius-lg); position: relative; background: var(--nui-surface);">
                <button type="button" class="nui-board-fav-toggle" data-id="${board.id}" data-title="${(board.title || '').replace(/"/g, '&quot;')}" data-url="${board.url}" data-icon="${board.iconUrl}"
                    style="position: absolute; top: 8px; right: 8px; background: none; border: none; padding: 2px; cursor: pointer; line-height: 0; color: var(--nui-accent);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </button>
                <div style="width: 52px; height: 52px; border-radius: var(--nui-radius-md); overflow: hidden; flex-shrink: 0; background: var(--nui-surface-2); border: 1px solid var(--nui-border); display: flex; align-items: center; justify-content: center;">
                    <img src="${board.iconUrl}" style="max-width: 40px; max-height: 40px; object-fit: contain;">
                </div>
                <div style="font-weight: 800; font-size: 13px; color: var(--nui-accent); line-height: 1.3; width: 100%; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${board.title}</div>
            </a>`;


        if (favBoards.length > 0) {
            // Resolve each saved favorite against what's on the page right now
            // (fresh icon/title), falling back to the saved snapshot if a board
            // ever disappears from the index for some reason.
            const resolved = favBoards.map(fb => allBoards.find(b => b.id === fb.id) || fb);

            const favCard = document.createElement('div');
            favCard.id = 'nui-fav-boards-card';
            favCard.style.cssText = 'display: flex; flex-direction: column; gap: 10px; border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-accent); background: var(--nui-accent-soft); padding: var(--nui-space-3);';
            favCard.innerHTML = `
                <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--nui-accent); display: flex; align-items: center; gap: 6px;">⭐ Your Boards</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;">
                    ${resolved.map(favBoardTile).join('')}
                </div>
            `;
            wrapper.appendChild(favCard);
        }

        // ---- Saved & Recent threads hub ----
        if (favThreads.length > 0 || recentThreads.length > 0) {
            const historyCard = document.createElement('div');
            historyCard.className = 'nui-surface';
            historyCard.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); box-shadow: 0 2px 4px var(--nui-shadow); overflow: hidden;';

            let html = '';
            if (favThreads.length > 0) {
                html += `<div style="padding: 10px 14px; background: var(--nui-surface-2); font-weight: 800; font-size: 13px; text-transform: uppercase; color: var(--nui-text); border-bottom: 1px solid var(--nui-border); display: flex; align-items: center; justify-content: space-between;">
                    <span>🧵 Starred Threads</span>
                    <button type="button" id="nui-clear-fav" style="font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: var(--nui-radius-pill); border: 1px solid var(--nui-border); background: var(--nui-surface); color: var(--nui-text-muted); cursor: pointer; min-height: 36px; display: flex; align-items: center; justify-content: center;">Clear</button>
                </div><div style="display: flex; flex-direction: column;">`;
                favThreads.forEach(t => {
                    html += `<div style="display: flex; align-items: center; border-bottom: 1px solid var(--nui-border);">
                        <a href="${t.url}" class="nui-thread-link" data-id="${t.id}" data-title="${t.title}" style="flex: 1; min-width: 0; padding: 12px 14px; text-decoration: none; color: var(--nui-accent); font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${t.title}</a>
                        <button type="button" class="nui-hub-remove-fav" data-id="${t.id}" style="flex-shrink: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--nui-text-faint); font-size: 18px; cursor: pointer;">&times;</button>
                    </div>`;
                });
                html += `</div>`;
            }
            if (recentThreads.length > 0) {
                html += `<div style="padding: 10px 14px; background: var(--nui-surface-2); font-weight: 800; font-size: 13px; text-transform: uppercase; color: var(--nui-text); border-bottom: 1px solid var(--nui-border); display: flex; align-items: center; justify-content: space-between;">
                    <span>🕒 Recently Read</span>
                    <button type="button" id="nui-clear-recent" style="font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: var(--nui-radius-pill); border: 1px solid var(--nui-border); background: var(--nui-surface); color: var(--nui-text-muted); cursor: pointer; min-height: 36px; display: flex; align-items: center; justify-content: center;">Clear</button>
                </div><div style="display: flex; flex-direction: column;">`;
                recentThreads.slice(0, 5).forEach(t => {
                    html += `<div style="display: flex; align-items: center; border-bottom: 1px solid var(--nui-border);">
                        <a href="${t.url}" class="nui-thread-link" data-id="${t.id}" data-title="${t.title}" style="flex: 1; min-width: 0; padding: 12px 14px; text-decoration: none; color: var(--nui-text); font-weight: 600; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${t.title}</a>
                        <button type="button" class="nui-hub-remove-recent" data-id="${t.id}" style="flex-shrink: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--nui-text-faint); font-size: 18px; cursor: pointer;">&times;</button>
                    </div>`;
                });
                html += `</div>`;
            }
            historyCard.innerHTML = html;

            function rerenderHub() {
                historyCard.remove();
                renderIndexUI(doc, container);
            }

            const clearFavBtn = historyCard.querySelector('#nui-clear-fav');
            if (clearFavBtn) {
                clearFavBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    favThreads = [];
                    saveState();
                    rerenderHub();
                });
            }

            historyCard.querySelectorAll('.nui-hub-remove-fav').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    favThreads = favThreads.filter(t => t.id !== btn.getAttribute('data-id'));
                    saveState();
                    rerenderHub();
                });
            });

            historyCard.querySelectorAll('.nui-hub-remove-recent').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    recentThreads = recentThreads.filter(t => t.id !== btn.getAttribute('data-id'));
                    saveState();
                    rerenderHub();
                });
            });

            const clearRecentBtn = historyCard.querySelector('#nui-clear-recent');
            if (clearRecentBtn) {
                clearRecentBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    recentThreads = [];
                    saveState();
                    rerenderHub();
                });
            }

            wrapper.appendChild(historyCard);
        }

        // ---- Categories: collapsible, boards in a responsive tile grid ----
        if (categories.length > 0) {
            categories.forEach((category, ci) => {
                if (category.boards.length === 0) return;

                const details = document.createElement('details');
                details.className = 'nui-index-category';
                details.open = true;
                details.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); background: var(--nui-surface); overflow: hidden;';

                const summary = document.createElement('summary');
                summary.style.cssText = 'list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--nui-surface-2); font-weight: 800; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--nui-text);';
                summary.innerHTML = `
                    <span>${category.title}</span>
                    <span style="display:flex; align-items:center; gap:8px;">
                        <span class="nui-badge" style="background: var(--nui-surface); color: var(--nui-text-muted);">${category.boards.length}</span>
                        <svg class="nui-index-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="transition: transform 0.15s;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"></path></svg>
                    </span>
                `;
                summary.addEventListener('click', () => {
                    // Let the native <details> toggle happen, then sync the chevron next frame
                    requestAnimationFrame(() => {
                        const chev = summary.querySelector('.nui-index-chevron');
                        if (chev) chev.style.transform = details.open ? 'rotate(180deg)' : 'rotate(0deg)';
                    });
                });
                details.appendChild(summary);
                const chevInit = summary.querySelector('.nui-index-chevron');
                if (chevInit) chevInit.style.transform = 'rotate(180deg)';

                const grid = document.createElement('div');
                grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; padding: var(--nui-space-3);';

                category.boards.forEach(board => {
                    const boardCard = document.createElement('a');
                    boardCard.href = board.url;
                    boardCard.className = 'nui-item nui-reset nui-board-link';
                    boardCard.setAttribute('data-id', board.id);
                    boardCard.style.cssText = 'text-decoration: none; margin: 0; align-items: stretch; border: 1px solid var(--nui-border); border-radius: var(--nui-radius-lg); position: relative;';

                    const isFav = board.id && favBoards.some(b => b.id === board.id);

                    boardCard.innerHTML = `
                        <div style="width: 50px; height: 50px; border-radius: var(--nui-radius-md); overflow: hidden; flex-shrink: 0; background: var(--nui-surface-2); border: 1px solid var(--nui-border); display: flex; align-items: center; justify-content: center;">
                            <img src="${board.iconUrl}" style="max-width: 40px; max-height: 40px; object-fit: contain;">
                        </div>
                        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; padding-top: 2px;">
                            <div style="display: flex; align-items: flex-start; gap: 6px;">
                                <div style="flex: 1; min-width: 0; font-weight: 800; font-size: 15.5px; color: var(--nui-accent); line-height: 1.2;">${board.title}</div>
                                <button type="button" class="nui-board-fav-toggle" data-id="${board.id}" data-title="${(board.title || '').replace(/"/g, '&quot;')}" data-url="${board.url}" data-icon="${board.iconUrl}"
                                    style="flex-shrink: 0; background: none; border: none; padding: 2px; cursor: pointer; line-height: 0; margin-top: -2px; color: ${isFav ? 'var(--nui-accent)' : 'var(--nui-text-faint)'};">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                                </button>
                            </div>
                            <div class="nui-text-muted" style="font-size: 12.5px; line-height: 1.35; white-space: normal;">${board.desc}</div>
                            <div style="display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
                                <span class="nui-badge">${board.topics} Topics</span>
                                <span class="nui-badge">${board.comments} Posts</span>
                                <span class="nui-badge" style="background: var(--nui-surface-2); color: var(--nui-text-faint);">Active: ${board.recent}</span>
                            </div>
                        </div>
                    `;
                    grid.appendChild(boardCard);
                });

                details.appendChild(grid);
                wrapper.appendChild(details);
            });

            wrapper.querySelectorAll('.nui-board-fav-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    if (!id) return;
                    const exists = favBoards.some(b => b.id === id);
                    if (exists) {
                        favBoards = favBoards.filter(b => b.id !== id);
                    } else {
                        favBoards.push({ id, title: btn.getAttribute('data-title'), url: btn.getAttribute('data-url'), iconUrl: btn.getAttribute('data-icon') });
                    }
                    saveState();
                    const favCardEl = document.getElementById('nui-fav-boards-card');
                    if (favCardEl) favCardEl.remove();
                    renderIndexUI(doc, container);
                });
            });
        } else {
            wrapper.innerHTML += `<div class="nui-empty"><span class="nui-empty-emoji">📝</span><br>Could not load Neoboards index.</div>`;
        }
    }


    function renderBoardListUI(doc, container) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        container.appendChild(wrapper);

        const topics = [];
        let boardTitle = 'Neoboards';
        let createTopicUrl = '#';
        let paginationHtml = '';

        const boardList = doc.getElementById('boardList');
        if (boardList) {
            const h1 = boardList.querySelector('h1');
            if (h1) boardTitle = h1.textContent.trim();

            const createLink = boardList.querySelector('.createTopicButton a');
            if (createLink) { createTopicUrl = createLink.href; newTopicUrl = createLink.href; }

            const pageNav = boardList.querySelector('.boardNavBottom .pageNav');
            if (pageNav) {
                const clones = Array.from(pageNav.childNodes).map(n => n.cloneNode(true));
                const tempDiv = document.createElement('div');
                clones.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'A') {
                            node.className = 'nui-pill nui-board-pager';
                            node.style.padding = '6px 12px';
                        } else if (node.tagName === 'SPAN' && node.className === 'boardPageButton-active') {
                            node.className = 'nui-pill is-active';
                            node.style.padding = '6px 12px';
                        }
                    }
                    tempDiv.appendChild(node);
                });
                paginationHtml = tempDiv.innerHTML;
            }

            const listItems = boardList.querySelectorAll('ul > li:not(.boardNavTop)');
            listItems.forEach(li => {
                const titleEl = li.querySelector('.boardTopicTitle a');
                if (!titleEl) return;

                const titleSpan = titleEl.querySelector('span');
                const titleHtml = titleSpan ? titleSpan.innerHTML : titleEl.innerHTML;
                const url = titleEl.href;
                const authorEl = li.querySelector('.author a');
                const author = authorEl ? authorEl.textContent.trim() : 'Unknown';
                const repliesEl = li.querySelector('.replies');
                const replies = repliesEl ? repliesEl.textContent.trim() : '0';
                const lastEl = li.querySelector('.last');
                const lastHtml = lastEl ? lastEl.innerHTML.trim() : '';

                topics.push({ titleHtml, url, author, replies, lastHtml });
            });
        }

        const headerCard = document.createElement('div');
        headerCard.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
        headerCard.innerHTML = `
            <a href="/neoboards/index.phtml" class="nui-index-link" style="color: var(--nui-text-muted); text-decoration: none; font-weight: 700; font-size: 13.5px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                Back to Index
            </a>
            <div class="nui-text" style="font-family: var(--nui-font-display); font-size: 26px; font-weight: 800;">${boardTitle}</div>
        `;
        wrapper.appendChild(headerCard);

        headerCard.querySelector('.nui-index-link').addEventListener('click', (e) => {
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                loadBoardList('/neoboards/index.phtml', container);
            }
        });

        if (paginationHtml) {
            const topPager = document.createElement('div');
            topPager.style.cssText = 'display: flex; gap: 6px; align-items: center; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch; font-weight: 700; color: var(--nui-text-muted); font-size: 13px; white-space: nowrap;';
            topPager.innerHTML = paginationHtml;
            wrapper.appendChild(topPager);
        }

        if (topics.length > 0) {
            const listWrap = document.createElement('div');
            listWrap.style.cssText = 'display: flex; flex-direction: column; gap: var(--nui-space-2);';

            topics.forEach(topic => {
                const card = document.createElement('a');
                card.className = 'nui-item nui-reset nui-thread-link';
                card.href = topic.url;
                const tId = getTopicId(topic.url);
                card.setAttribute('data-id', tId);
                const safeTitleStr = topic.titleHtml.replace(/<[^>]+>/g, '').trim();
                card.setAttribute('data-title', safeTitleStr);

                card.style.cssText = 'display: flex; flex-direction: column; text-decoration: none; margin: 0; border: 1px solid var(--nui-border); border-radius: var(--nui-radius-md); padding: var(--nui-space-3); transition: transform 0.1s, background 0.1s;';

                let safeTitleHtml = topic.titleHtml.replace(/<img/g, '<img style="vertical-align: middle; max-height: 18px; width: auto;"');
                let safeLastHtml = topic.lastHtml.replace(/<a/g, '<a style="color: inherit; text-decoration: none;"');

                const isFav = tId && favThreads.some(t => t.id === tId);

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                        <div style="display: flex; align-items: flex-start; gap: 8px; width: 100%;">
                            <div style="flex: 1; min-width: 0; font-weight: 800; font-size: 15px; color: var(--nui-text); line-height: 1.3; overflow-wrap: anywhere;">
                                ${safeTitleHtml}
                            </div>
                            <button type="button" class="nui-board-fav-btn" data-id="${tId}" data-title="${safeTitleStr.replace(/"/g, '&quot;')}" data-url="${topic.url}"
                                style="flex-shrink: 0; background: none; border: none; padding: 2px; cursor: pointer; line-height: 0; color: ${isFav ? 'var(--nui-accent)' : 'var(--nui-text-faint)'};">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                            </button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; font-size: 12px; font-weight: 600; color: var(--nui-text-muted);">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span>By <span style="color: var(--nui-accent);">${topic.author}</span></span>
                                <span>${topic.replies} Replies</span>
                            </div>
                            <div style="text-align: right; color: var(--nui-text-faint);">
                                ${safeLastHtml}
                            </div>
                        </div>
                    </div>
                `;
                listWrap.appendChild(card);
            });
            wrapper.appendChild(listWrap);

            wrapper.querySelectorAll('.nui-board-fav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    if (!id) return;
                    const exists = favThreads.some(t => t.id === id);
                    if (exists) {
                        favThreads = favThreads.filter(t => t.id !== id);
                    } else {
                        favThreads.push({ id, title: btn.getAttribute('data-title'), url: btn.getAttribute('data-url') });
                    }
                    saveState();
                    const nowFav = !exists;
                    btn.style.color = nowFav ? 'var(--nui-accent)' : 'var(--nui-text-faint)';
                    const svg = btn.querySelector('svg');
                    svg.setAttribute('fill', nowFav ? 'currentColor' : 'none');
                });
            });

            wrapper.querySelectorAll('.nui-board-pager').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadBoardList(btn.href, container);
                });
            });

        } else {
            wrapper.innerHTML += `<div class="nui-empty"><span class="nui-empty-emoji">🏜️</span><br>It's quiet in here...</div>`;
        }

        if (paginationHtml) {
            const bottomPager = document.createElement('div');
            bottomPager.style.cssText = 'display: flex; gap: 6px; align-items: center; overflow-x: auto; padding-top: var(--nui-space-2); scrollbar-width: none; -webkit-overflow-scrolling: touch; font-weight: 700; color: var(--nui-text-muted); font-size: 13px; white-space: nowrap;';
            bottomPager.innerHTML = paginationHtml;
            wrapper.appendChild(bottomPager);

            bottomPager.querySelectorAll('.nui-board-pager').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadBoardList(btn.href, container);
                });
            });
        }

        if (createTopicUrl && createTopicUrl !== '#') {
            const fabWrap = document.createElement('div');
            fabWrap.style.cssText = 'position: fixed; bottom: calc(var(--nui-space-4) + 25px); right: var(--nui-space-4); z-index: 99;';
            fabWrap.innerHTML = `
                <a href="${createTopicUrl}" class="nui-btn nui-btn-primary nui-new-topic-link" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; border-radius: 30px; box-shadow: 0 4px 16px var(--nui-shadow); text-decoration: none;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                    New Topic
                </a>
            `;
            wrapper.appendChild(fabWrap);
        }
    }

    // --------------------------------------------------------------------------
    // CREATE TOPIC VIEW
    // --------------------------------------------------------------------------
    // Fetches the legacy create_topic.phtml form and re-renders it as a NeoUI
    // form (board picker, title, message, pens, smilies), submitting via
    // fetch() the same way Quick Reply does — no full page navigation, and the
    // resulting thread opens in-place as a new tab.
    function loadCreateTopicView(url, container) {
        activeTabId = 'create';
        renderTabs();
        const actionBar = document.getElementById('nui-thread-actionbar');
        if (actionBar) actionBar.style.display = 'none';

        window.history.replaceState(null, '', url);
        container.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">📡</span><br>Loading form...</div>`;

        fetch(url).then(res => res.text()).then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            renderCreateTopicUI(doc, container, url);
            container.scrollTop = 0;
        }).catch(err => {
            container.innerHTML = `<div class="nui-empty" style="color: var(--nui-danger);">Failed to load the New Topic form.</div>`;
        });
    }

    function renderCreateTopicUI(doc, container, formUrl) {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width: 100%; max-width: 700px; display: flex; flex-direction: column; gap: var(--nui-space-3); padding-bottom: 40px;';
        container.appendChild(wrapper);

        const nativeForm = doc.querySelector('form[name="message_form"]');
        if (!nativeForm) {
            wrapper.innerHTML = `<div class="nui-empty">Could not load the New Topic form.</div>`;
            return;
        }

        const boardSelect = nativeForm.querySelector('select[name="board_id"]');
        const boardOptions = boardSelect
            ? Array.from(boardSelect.querySelectorAll('option')).map(o => ({ value: o.value, label: o.textContent.trim(), selected: o.selected }))
            : [];

        const pens = Array.from(nativeForm.querySelectorAll('.neoboardPen')).map(pen => {
            const labelEl = pen.querySelector('label');
            const inputEl = pen.querySelector('input');
            if (!labelEl || !inputEl) return null;
            return { label: labelEl.textContent.trim(), val: inputEl.value, checked: inputEl.checked };
        }).filter(Boolean);

        // Stash the real native form (with its hidden fields, e.g. board_id
        // when preselected via ?board=) in the live document so FormData can
        // pick up everything Neopets expects on submit.
        // NOTE: uses its own class (nui-hidden-ct-form), separate from Quick
        // Reply's nui-hidden-native-form — both scrape a form literally named
        // "message_form", so sharing a class meant opening one tab would
        // delete the other tab's mounted form out from under it.
        document.querySelectorAll('form.nui-hidden-ct-form').forEach(f => f.remove());
        nativeForm.classList.add('nui-hidden-ct-form');
        nativeForm.style.display = 'none';
        document.body.appendChild(nativeForm);

        const smiliesHtml = (() => {
            const panelsHtml = SMILEY_CATEGORIES.map((cat, ci) => {
                const slice = NEOBOARD_SMILIES.slice(cat.start, cat.start + cat.count);
                const imgs = slice.map(s =>
                    `<img src="${s.src}" data-code="${s.code.replace(/"/g, '&quot;')}" class="nui-smiley-btn" title="${s.code.replace(/"/g, '&quot;')}" style="cursor:pointer; width:20px; height:20px; transition:transform 0.1s;">`
                ).join('');
                return `<div class="nui-smiley-panel" data-cat="${ci}" style="display:${ci === 0 ? 'flex' : 'none'}; flex-wrap:wrap; gap:5px; padding:8px;">${imgs}</div>`;
            }).join('');
            const tabsHtml = SMILEY_CATEGORIES.map((cat, ci) =>
                `<button type="button" class="nui-smiley-tab" data-tab="${ci}" style="flex-shrink:0; padding:5px 9px; font-size:12px; font-weight:700; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); cursor:pointer; background:${ci === 0 ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)'}; color:${ci === 0 ? 'var(--nui-accent)' : 'var(--nui-text-muted)'};">${cat.label}</button>`
            ).join('');
            return `
                <div style="margin-bottom:12px;">
                    <button type="button" id="nui-ct-smiley-toggle" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 10px; font-size:12px; margin-bottom:8px;">😊 Emoticons</button>
                    <div id="nui-ct-smiley-drawer" style="display:none; flex-direction:column; border:1px solid var(--nui-border); border-radius:var(--nui-radius-md); background:var(--nui-surface-2); overflow:hidden;">
                        <div style="display:flex; gap:4px; overflow-x:auto; padding:8px 8px 0; scrollbar-width:none; -webkit-overflow-scrolling:touch;">${tabsHtml}</div>
                        <div id="nui-ct-smiley-panels" style="max-height:140px; overflow-y:auto;">${panelsHtml}</div>
                    </div>
                </div>
            `;
        })();

        wrapper.innerHTML = `
            <a href="/neoboards/index.phtml" class="nui-index-link" style="color: var(--nui-text-muted); text-decoration: none; font-weight: 700; font-size: 13.5px; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                Back to Boards
            </a>
            <div class="nui-text" style="font-family: var(--nui-font-display); font-size: 24px; font-weight: 800; margin-bottom: 4px;">Create a Topic</div>
            <form id="nui-create-topic-form" class="nui-surface" style="border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-4); box-shadow: 0 4px 12px var(--nui-shadow); display: flex; flex-direction: column; gap: 14px;">
                <label style="display:flex; flex-direction:column; gap:6px;">
                    <span style="font-size:12px; font-weight:800; color:var(--nui-text-muted); text-transform:uppercase; letter-spacing:0.5px;">Board</span>
                    <select name="board_id" class="nui-input" style="padding:10px 12px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface); color:var(--nui-text);">
                        ${boardOptions.map(o => `<option value="${o.value}" ${o.selected ? 'selected' : ''}>${o.label}</option>`).join('')}
                    </select>
                </label>
                <label style="display:flex; flex-direction:column; gap:6px;">
                    <span style="font-size:12px; font-weight:800; color:var(--nui-text-muted); text-transform:uppercase; letter-spacing:0.5px;">Topic Title</span>
                    <input type="text" name="topic_title" maxlength="80" required class="nui-input" style="padding:10px 12px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); background:var(--nui-surface); color:var(--nui-text);">
                </label>
                ${pens.length > 0 ? `
                <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; -webkit-overflow-scrolling:touch;">
                    ${pens.map(pen => `
                        <button type="button" class="nui-ct-pen-opt" data-val="${pen.val}"
                            style="flex-shrink:0; padding:6px 12px; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); font-size:12px; font-weight:700; cursor:pointer;
                            background:${pen.checked ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)'};
                            color:${pen.checked ? 'var(--nui-accent)' : 'var(--nui-text-muted)'};">${pen.label}</button>
                    `).join('')}
                </div>` : ''}
                ${smiliesHtml}
                <label style="display:flex; flex-direction:column; gap:6px;">
                    <span style="font-size:12px; font-weight:800; color:var(--nui-text-muted); text-transform:uppercase; letter-spacing:0.5px;">Message</span>
                    <textarea name="message" maxlength="500" required class="nui-textarea" rows="8" style="resize:vertical;"></textarea>
                    <div id="nui-newtopic-counter" style="text-align:right;font-size:11px;font-weight:800;color:var(--nui-text-muted);margin-top:3px;">0 / 500</div>
                </label>
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px;">
                    <span id="nui-ct-status" style="font-size: 13px; font-weight: 700; color: var(--nui-text-muted);"></span>
                    <button type="submit" class="nui-btn nui-btn-primary">Create Topic</button>
                </div>
            </form>
        `;

        wrapper.querySelector('.nui-index-link').addEventListener('click', (e) => {
            if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); switchTab('board'); }
        });

        const form = wrapper.querySelector('#nui-create-topic-form');
        const textarea = form.querySelector('textarea[name="message"]');
        const topicCounter = form.querySelector('#nui-newtopic-counter');
        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            const pct = len / 500;
            topicCounter.textContent = `${len} / 500`;
            topicCounter.style.color = pct >= 1 ? 'var(--nui-danger)' : pct >= 0.85 ? 'var(--nui-warning)' : 'var(--nui-text-muted)';
        });
        let selectedPen = pens.find(p => p.checked) ? pens.find(p => p.checked).val : (pens[0] ? pens[0].val : '0');

        const smileyToggle = wrapper.querySelector('#nui-ct-smiley-toggle');
        const smileyDrawer = wrapper.querySelector('#nui-ct-smiley-drawer');
        if (smileyToggle && smileyDrawer) {
            smileyToggle.addEventListener('click', () => {
                smileyDrawer.style.display = smileyDrawer.style.display !== 'none' ? 'none' : 'flex';
            });
            wrapper.querySelectorAll('.nui-smiley-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const ci = tab.getAttribute('data-tab');
                    wrapper.querySelectorAll('.nui-smiley-tab').forEach(t => {
                        const active = t.getAttribute('data-tab') === ci;
                        t.style.background = active ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)';
                        t.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                    });
                    wrapper.querySelectorAll('.nui-smiley-panel').forEach(p => { p.style.display = p.getAttribute('data-cat') === ci ? 'flex' : 'none'; });
                });
            });
        }
        wrapper.querySelectorAll('.nui-smiley-btn').forEach(btn => {
            btn.addEventListener('click', () => { textarea.value += btn.getAttribute('data-code'); textarea.focus(); });
        });
        wrapper.querySelectorAll('.nui-ct-pen-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedPen = btn.getAttribute('data-val');
                wrapper.querySelectorAll('.nui-ct-pen-opt').forEach(b => {
                    const active = b.getAttribute('data-val') === selectedPen;
                    b.style.background = active ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)';
                    b.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                });
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const statusEl = form.querySelector('#nui-ct-status');
            submitBtn.disabled = true;
            if (statusEl) { statusEl.style.color = 'var(--nui-text-muted)'; statusEl.textContent = 'Posting…'; }

            const liveNativeForm = document.querySelector('form.nui-hidden-ct-form');
            if (!liveNativeForm) {
                if (statusEl) { statusEl.style.color = 'var(--nui-danger)'; statusEl.textContent = 'Error: form missing.'; }
                submitBtn.disabled = false;
                return;
            }

            const fd = new FormData(liveNativeForm);
            fd.set('board_id', form.querySelector('select[name="board_id"]').value);
            fd.set('topic_title', form.querySelector('input[name="topic_title"]').value);
            fd.set('message', textarea.value);
            if (pens.length > 0) fd.set('select_pen', selectedPen);

            const action = liveNativeForm.getAttribute('action') || 'process_topic.phtml';
            // See the identical fix in Quick Reply's submit handler — relative
            // actions resolve against the page directory, not the site root.
            const postUrl = new URL(action, formUrl).href;

            try {
                const res = await fetch(postUrl, { method: 'POST', body: fd });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const html = await res.text();
                const newDoc = new DOMParser().parseFromString(html, 'text/html');

                // A successful create redirects to the new topic's thread page,
                // which fetch() follows transparently — res.url is the final URL.
                const newBoardTopic = newDoc.getElementById('boardTopic');
                if (newBoardTopic && res.url) {
                    const newId = getTopicId(res.url);
                    const titleEl = newBoardTopic.querySelector('.topicTitle h1');
                    const title = titleEl ? titleEl.textContent.replace(/^Topic:\s*/i, '').trim() : (form.querySelector('input[name="topic_title"]').value || 'New Topic');
                    if (newId) {
                        openThreads.push({ id: newId, title, url: res.url, htmlCache: newDoc });
                        switchTab(newId);
                        return;
                    }
                }

                // Fallback: couldn't confirm the new thread — go back to the board list.
                switchTab('board');
            } catch (err) {
                if (statusEl) { statusEl.style.color = 'var(--nui-danger)'; statusEl.textContent = 'Failed to post.'; }
                submitBtn.disabled = false;
            }
        });
    }

    // --------------------------------------------------------------------------
    // GLOBAL CLICK INTERCEPTOR
    // --------------------------------------------------------------------------
    document.body.addEventListener('click', e => {
        // Handle Thread Clicks (Opens in Tab)
        const threadLink = e.target.closest('.nui-thread-link');
        if (threadLink && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const url = threadLink.href;
            const id = threadLink.getAttribute('data-id') || getTopicId(url);
            const title = threadLink.getAttribute('data-title') || 'Thread';

            if (id) {
                if (!openThreads.some(t => t.id === id)) {
                    openThreads.push({ id, title, url, htmlCache: null });
                }
                switchTab(id);
            }
            return;
        }

        // Handle Board Category Clicks (Updates Main Tab)
        const boardLink = e.target.closest('.nui-board-link');
        if (boardLink && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const contentArea = document.getElementById('nui-content-area');
            loadBoardList(boardLink.href, contentArea);
        }

        // Handle New Topic FAB
        const newTopicLink = e.target.closest('.nui-new-topic-link');
        if (newTopicLink && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            newTopicUrl = newTopicLink.href;
            switchTab('create');
        }
    });

    // --------------------------------------------------------------------------
    // INITIALIZATION ROUTER
    // --------------------------------------------------------------------------
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try {
            const app = initAppShell();
            if (isCreateTopic) {
                const resolvedBoard = resolveBoardListUrl(document, window.location.href);
                if (resolvedBoard) { currentBoardUrl = resolvedBoard; try { localStorage.setItem('nui_last_board_url', resolvedBoard); } catch (e) {} }
                activeTabId = 'create';
                newTopicUrl = window.location.href;
                renderTabs();
                renderCreateTopicUI(document, document.getElementById('nui-content-area'), window.location.href);
            } else if (isTopic) {
                const resolvedBoard = resolveBoardListUrl(document, window.location.href);
                if (resolvedBoard) { currentBoardUrl = resolvedBoard; try { localStorage.setItem('nui_last_board_url', resolvedBoard); } catch (e) {} }
                const id = getTopicId(window.location.href);
                // Try to scrape the real title from the page DOM before falling back to placeholder
                let initTitle = 'Thread';
                const initTitleEl = document.querySelector('#boardTopic .topicTitle h1');
                if (initTitleEl) initTitle = initTitleEl.textContent.replace(/^Topic:\s*/i, '').trim();
                openThreads.push({ id: id, title: initTitle || 'Thread', url: window.location.href, htmlCache: document });
                switchTab(id);
            } else {
                switchTab('board');
            }
        } catch (err) { showFatalError(err); }
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                const app = initAppShell();
                if (isCreateTopic) {
                    const resolvedBoard = resolveBoardListUrl(document, window.location.href);
                    if (resolvedBoard) { currentBoardUrl = resolvedBoard; try { localStorage.setItem('nui_last_board_url', resolvedBoard); } catch (e) {} }
                    activeTabId = 'create';
                    newTopicUrl = window.location.href;
                    renderTabs();
                    renderCreateTopicUI(document, document.getElementById('nui-content-area'), window.location.href);
                } else if (isTopic) {
                    const resolvedBoard = resolveBoardListUrl(document, window.location.href);
                    if (resolvedBoard) { currentBoardUrl = resolvedBoard; try { localStorage.setItem('nui_last_board_url', resolvedBoard); } catch (e) {} }
                    const id = getTopicId(window.location.href);
                    let initTitle = 'Thread';
                    const initTitleEl = document.querySelector('#boardTopic .topicTitle h1');
                    if (initTitleEl) initTitle = initTitleEl.textContent.replace(/^Topic:\s*/i, '').trim();
                    openThreads.push({ id: id, title: initTitle || 'Thread', url: window.location.href, htmlCache: document });
                    switchTab(id);
                } else {
                    switchTab('board');
                }
            } catch (err) { showFatalError(err); }
        });
    }
})();
// ==============================================================================
// MODULE 9: MYSTERY ISLAND TRAINING SCHOOL (FULL SPA)
// ==============================================================================

(function () {
    'use strict';

    if (!/\/island\/training\.phtml/.test(location.pathname) && !/\/island\/process_training\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('training-mi')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Training SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    const COURSE_TIERS = [
        { name: 'Grasshopper', maxLevel: 20,  stones: 1, hours: 2  },
        { name: 'Basic',       maxLevel: 40,  stones: 2, hours: 3  },
        { name: 'Intermediate',maxLevel: 80,  stones: 3, hours: 4  },
        { name: 'Adept',       maxLevel: 100, stones: 4, hours: 6  },
        { name: 'Advanced',    maxLevel: 120, stones: 5, hours: 8  },
        { name: 'Expert',      maxLevel: 150, stones: 6, hours: 12 },
        { name: 'Master',      maxLevel: 200, stones: 7, hours: 18 },
        { name: 'Grand Master',maxLevel: 250, stones: 8, hours: 24 },
    ];

    function tierForLevel(lvl) {
        return COURSE_TIERS.find(t => lvl <= t.maxLevel) || COURSE_TIERS[COURSE_TIERS.length - 1];
    }

    // --- Custom SSW Modal (Ported from Coincidence) ---
    function openCustomSSW(itemName) { if (window.NeoUI && window.NeoUI.openSSW) window.NeoUI.openSSW(itemName); }


    function scrapeStatus(doc) {
        const pets = [];
        const rows = doc.querySelectorAll('table[align="center"] tr');
        let i = 0;

        while (i < rows.length) {
            const headerTd = rows[i] && rows[i].querySelector('td[bgcolor="#efefef"]');
            if (!headerTd) { i++; continue; }

            const headerText = headerTd.textContent.trim();
            const headerMatch = headerText.match(/^(.+?)\s+\(Level\s+(\d+)\)\s+(.*)/);
            if (!headerMatch) { i++; continue; }

            const name = headerMatch[1].trim();
            const level = parseInt(headerMatch[2]);
            const statusText = headerMatch[3].trim();
            const onCourse = statusText.startsWith('is currently studying');
            const courseSubject = onCourse ? statusText.replace('is currently studying', '').trim() : null;

            const dataRow = rows[i + 1];
            let imgSrc = `//pets.neopets.com/cpn/${encodeURIComponent(name)}/2/2.png`;
            let lvl = level, str = '-', def = '-', mov = '-', hp = '-';
            let courseFinished = false;
            let totalSeconds = 0;
            let codestonesNeeded = [];

            if (dataRow) {
                const img = dataRow.querySelector('img[src*="/cpn/"]');
                if (img) imgSrc = img.getAttribute('src');

                const tdText = dataRow.querySelector('td:first-child') ? dataRow.querySelector('td:first-child').innerHTML : '';
                const lvlM = tdText.match(/Lvl\s*:\s*<[^>]*>(\d+)/);
                const strM = tdText.match(/Str\s*:\s*<[^>]*>(\d+)/);
                const defM = tdText.match(/Def\s*:\s*<[^>]*>(\d+)/);
                const movM = tdText.match(/Mov\s*:\s*<[^>]*>(\d+)/);
                const hpM  = tdText.match(/Hp\s*:\s*<[^>]*>([\d\s\/]+)</);
                if (lvlM) lvl = parseInt(lvlM[1]);
                if (strM) str = strM[1];
                if (defM) def = defM[1];
                if (movM) mov = movM[1];
                if (hpM)  hp  = hpM[1].trim();

                const actionTd = dataRow.querySelectorAll('td')[1];
                if (actionTd) {
                    const actionText = actionTd.textContent.trim();
                    if (actionText.includes('Course Finished')) courseFinished = true;

                    const timeMatch = actionText.match(/(\d+)\s*hrs?,?\s*(\d+)\s*minutes?,?\s*(\d+)\s*seconds?/i);
                    if (timeMatch) {
                        totalSeconds = (parseInt(timeMatch[1]) * 3600) + (parseInt(timeMatch[2]) * 60) + parseInt(timeMatch[3]);
                    }

                    actionTd.querySelectorAll('b').forEach(b => {
                        if (b.textContent.includes('Codestone')) codestonesNeeded.push(b.textContent.trim());
                    });
                }
            }

            pets.push({ name, level: lvl, str, def, mov, hp, imgSrc, onCourse, courseSubject, courseFinished, totalSeconds, codestonesNeeded });
            i += 2;
        }

        // Sort: Finished > Needs Payment > Training > Idle
        pets.sort((a, b) => {
            const score = p => p.courseFinished ? 4 : (p.codestonesNeeded.length > 0 ? 3 : (p.onCourse ? 2 : 1));
            return score(b) - score(a);
        });

        return pets;
    }

    function scrapeCoursesOptions(doc) {
        const map = {};
        doc.querySelectorAll('select[name="pet_name"] option').forEach(opt => {
            if (!opt.value) return;
            const m = opt.textContent.match(/^(.+?)\s+-\s+(\w[\w\s]*?)\s+\((\d+)\s+codestone/i);
            if (m) map[m[1].trim()] = { tier: m[2].trim(), stones: parseInt(m[3]) };
        });
        return map;
    }

    async function fetchTraining(type) {
        const res = await fetch(`/island/training.phtml?type=${type}`, { credentials: 'include' });
        const html = await res.text();
        return { doc: new DOMParser().parseFromString(html, 'text/html'), raw: html };
    }

    async function processTraining(type, petName, courseType) {
        const fd = new FormData();
        fd.append('type', type);
        fd.append('pet_name', petName);
        if (courseType) fd.append('course_type', courseType);

        const res = await fetch('/island/process_training.phtml', { method: 'POST', credentials: 'include', body: fd });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const contentTd = doc.querySelector('td.content');

        if (!contentTd) return { ok: true, message: 'Done!' };

        const clone = contentTd.cloneNode(true);
        clone.querySelectorAll('center a, br').forEach(el => { if (el.tagName === 'BR') el.replaceWith(' '); });

        const text = clone.textContent.replace(/\s+/g, ' ').trim();
        const isError = /error|invalid|cannot|already|not enough|too many/i.test(text);
        return { ok: !isError, message: text.substring(0, 300) };
    }

    async function init() {
        const profile = NeoUI.scrapeLegacyProfile();

        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        const wrapper = document.createElement('div');
        wrapper.className = 'nui-reset';
        wrapper.style.cssText = 'padding: calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5); max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--nui-space-4);';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:var(--nui-space-2);';
        header.innerHTML = `
            <img src="//images.neopets.com/island/judo5.gif" style="width:52px;height:52px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);object-fit:cover;flex-shrink:0;">
            <div>
                <div style="font-family:var(--nui-font-display);font-weight:800;font-size:22px;color:var(--nui-text);">Mystery Island Training</div>
                <div style="font-size:13px;color:var(--nui-text-muted);font-weight:600;">Codestones accepted here</div>
            </div>
        `;

        const tabs = document.createElement('div');
        tabs.style.cssText = 'display:flex;gap:6px;margin-bottom:var(--nui-space-3);border-bottom:2px solid var(--nui-border);padding-bottom:0;';

        const TABS = [
            { id: 'status',  label: '📋 Status'  },
            { id: 'courses', label: '📚 Courses'  },
            { id: 'wisdom',  label: '🥋 Wisdom'   },
        ];

        const startTab = new URLSearchParams(location.search).get('type') || 'status';
        let activeTab = TABS.find(t => t.id === startTab) ? startTab : 'status';

        const tabEls = {};
        TABS.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = t.label;
            btn.style.cssText = `padding:8px 14px;border:none;cursor:pointer;font-weight:700;font-size:13px;border-radius:var(--nui-radius-sm) var(--nui-radius-sm) 0 0;background:transparent;color:var(--nui-text-muted);border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.15s;`;
            tabEls[t.id] = btn;
            tabs.appendChild(btn);
        });

        const content = document.createElement('div');
        content.className = 'nui-surface';
        content.style.cssText = 'border-radius:var(--nui-radius-lg);overflow:hidden;min-height:200px; box-shadow: 0 4px 12px var(--nui-shadow); border: 1px solid var(--nui-border);';

        const contentInner = document.createElement('div');
        contentInner.style.cssText = 'padding:var(--nui-space-4);';
        content.appendChild(contentInner);

        wrapper.appendChild(header);
        wrapper.appendChild(tabs);
        wrapper.appendChild(content);
        document.body.appendChild(wrapper);

        let timerIntervals = [];
        function clearAllTimers() {
            timerIntervals.forEach(t => clearInterval(t));
            timerIntervals = [];
        }

        function showToast(msg, isError) {
            const toast = document.createElement('div');
            toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 18px;border-radius:var(--nui-radius-md);font-size:14px;font-weight:700;max-width:90vw;text-align:center;box-shadow:0 4px 16px var(--nui-shadow);background:${isError ? 'var(--nui-danger)' : 'var(--nui-success)'};color:#fff;transition:opacity 0.3s;`;
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
        }

        async function switchTab(id) {
            activeTab = id;
            clearAllTimers();
            Object.entries(tabEls).forEach(([tid, btn]) => {
                const active = tid === id;
                btn.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                btn.style.borderBottomColor = active ? 'var(--nui-accent)' : 'transparent';
                btn.style.background = active ? 'var(--nui-surface-2)' : 'transparent';
            });
            contentInner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--nui-text-faint);">Loading...</div>';
            try {
                if (id === 'status') await renderStatus();
                else if (id === 'courses') await renderCourses();
                else if (id === 'wisdom') await renderWisdom();
            } catch (err) {
                contentInner.innerHTML = `<div style="color:var(--nui-danger);font-weight:600;text-align:center;">Failed to load: ${err.message}</div>`;
            }
        }

        TABS.forEach(t => { tabEls[t.id].addEventListener('click', () => switchTab(t.id)); });

        // ── STATUS VIEW ───────────────────────────────────────────────────────────
        async function renderStatus() {
            const { doc } = await fetchTraining('status');
            const pets = scrapeStatus(doc);

            if (!pets.length) {
                contentInner.innerHTML = '<div style="color:var(--nui-text-muted);text-align:center;padding:40px;">No pets found in training logs.</div>';
                return;
            }

            contentInner.innerHTML = '';

            const training = pets.filter(p => p.onCourse);
            const finished = pets.filter(p => p.courseFinished);
            if (training.length || finished.length) {
                const bar = document.createElement('div');
                bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:var(--nui-space-3);';
                if (finished.length) bar.innerHTML += `<span class="nui-badge nui-badge-success">🎉 ${finished.length} course${finished.length>1?'s':''} finished!</span>`;
                if (training.length) bar.innerHTML += `<span class="nui-badge">${training.length} in training</span>`;
                contentInner.appendChild(bar);
            }

            pets.forEach((pet, i) => {
                const card = document.createElement('div');
                card.style.cssText = `margin-bottom:12px;border-radius:var(--nui-radius-md);overflow:hidden;border:${pet.courseFinished || pet.codestonesNeeded.length > 0 ? '2px solid var(--nui-accent)' : '1px solid var(--nui-border)'};background:var(--nui-surface-2);`;

                let statusBadge = '';
                if (pet.courseFinished) statusBadge = '<span class="nui-badge nui-badge-success">Course Finished!</span>';
                else if (pet.codestonesNeeded.length > 0) statusBadge = '<span class="nui-badge nui-badge-warning">Awaiting Payment</span>';
                else if (pet.onCourse) statusBadge = `<span class="nui-badge">📚 ${pet.courseSubject} · <span id="nui-timer-${i}">Loading...</span></span>`;
                else statusBadge = '<span class="nui-badge" style="opacity:0.5;">Not enrolled</span>';

                card.innerHTML = `
                    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;">
                        <img src="${pet.imgSrc}" style="width:48px;height:48px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);object-fit:cover;flex-shrink:0;">
                        <div style="flex:1;min-width:0;">
                            <div style="font-family:var(--nui-font-display);font-weight:800;font-size:16px;color:var(--nui-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pet.name}</div>
                            <div style="font-size:12px;color:var(--nui-text-muted);font-weight:600;margin-top:2px;">${statusBadge}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;flex-shrink:0;">
                            ${[['Lvl',pet.level,'var(--nui-text)'],['Str',pet.str,'var(--nui-danger)'],['Def',pet.def,'var(--nui-accent-2)'],['Spd',pet.mov,'var(--nui-text)'],['HP',pet.hp,'var(--nui-success)']].map(([label,val,color])=>`
                            <div style="display:flex;flex-direction:column;gap:1px;">
                                <span style="font-size:9px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">${label}</span>
                                <span style="font-size:12px;font-weight:700;color:${color};">${val}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                `;

                // Handle live countdown
                if (pet.onCourse && pet.totalSeconds > 0) {
                    let secs = pet.totalSeconds;
                    const updateDisplay = () => {
                        const el = card.querySelector(`#nui-timer-${i}`);
                        if (!el) return;
                        if (secs <= 0) { el.textContent = 'Ready!'; return; }
                        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
                        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
                        const s = (secs % 60).toString().padStart(2, '0');
                        el.textContent = `${h}:${m}:${s}`;
                    };
                    updateDisplay();
                    const interval = setInterval(() => { secs--; updateDisplay(); }, 1000);
                    timerIntervals.push(interval);
                } else if (pet.onCourse) {
                    const el = card.querySelector(`#nui-timer-${i}`);
                    if (el) el.textContent = 'Ready!';
                }

                // Footers
                if (pet.courseFinished) {
                    const footer = document.createElement('div');
                    footer.style.cssText = 'padding:8px 12px;border-top:1px solid var(--nui-border);background:var(--nui-success-soft);';
                    footer.innerHTML = `<button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-complete" data-pet="${pet.name}" style="width:100%;padding:8px;background:var(--nui-success);color:var(--nui-surface);">✓ Complete Course</button>`;
                    card.appendChild(footer);
                } else if (pet.codestonesNeeded.length > 0) {
                    const footer = document.createElement('div');
                    footer.style.cssText = 'padding:12px;border-top:1px solid var(--nui-border);background:var(--nui-warning-soft); display: flex; flex-direction: column; gap: 8px;';

                    const payRow = document.createElement('div');
                    payRow.style.cssText = 'display: flex; gap: 8px; justify-content: space-between; align-items: center;';
                    payRow.innerHTML = `
                        <div style="font-size: 12px; font-weight: 800; color: var(--nui-warning); text-transform: uppercase;">Required Codestones</div>
                        <div style="display: flex; gap: 6px;">
                            <button type="button" class="nui-btn nui-btn-danger nui-btn-sm btn-cancel" data-pet="${pet.name}" style="padding: 6px 12px; font-size: 11px;">Cancel</button>
                            <button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-pay" data-pet="${pet.name}" style="padding: 6px 12px; font-size: 11px;">Pay All</button>
                        </div>
                    `;
                    footer.appendChild(payRow);

                    const stonesList = document.createElement('div');
                    stonesList.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
                    pet.codestonesNeeded.forEach(stoneName => {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--nui-surface); border:1px solid var(--nui-border); padding:6px 10px; border-radius:var(--nui-radius-sm);';
                        row.innerHTML = `
                            <span style="font-size:13px; font-weight:700; color:var(--nui-text);">${stoneName}</span>
                            <div style="display:flex; gap:6px;">
                                <button type="button" class="nui-btn nui-btn-secondary nui-btn-sm btn-ssw" style="padding:4px 8px; font-size:11px;">SSW</button>
                                <a href="/market.phtml?type=wizard&string=${encodeURIComponent(stoneName)}" target="_blank" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 8px; font-size:11px; text-decoration:none;">SW</a>
                                <a href="/safetydeposit.phtml?obj_name=${encodeURIComponent(stoneName)}&category=0" target="_blank" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 8px; font-size:11px; text-decoration:none;">SDB</a>
                            </div>
                        `;
                        row.querySelector('.btn-ssw').addEventListener('click', () => openCustomSSW(stoneName));
                        stonesList.appendChild(row);
                    });

                    footer.appendChild(stonesList);
                    card.appendChild(footer);
                }

                contentInner.appendChild(card);
            });

            // Action Listeners
            contentInner.querySelectorAll('.btn-complete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const petName = btn.getAttribute('data-pet');
                    btn.textContent = 'Processing...'; btn.disabled = true;
                    const result = await processTraining('complete', petName);
                    showToast(result.ok ? `${petName}'s course complete! 🎉` : result.message, !result.ok);
                    if (result.ok) await renderStatus();
                });
            });

            contentInner.querySelectorAll('.btn-pay').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const petName = btn.getAttribute('data-pet');
                    btn.textContent = 'Paying...'; btn.disabled = true;
                    const result = await processTraining('pay', petName);
                    showToast(result.ok ? `Paid for ${petName}'s course!` : result.message, !result.ok);
                    if (result.ok) await renderStatus();
                    else { btn.textContent = 'Pay All'; btn.disabled = false; }
                });
            });

            contentInner.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const petName = btn.getAttribute('data-pet');
                    btn.textContent = '...'; btn.disabled = true;
                    const result = await processTraining('cancel', petName);
                    showToast(result.ok ? `Cancelled ${petName}'s course.` : result.message, !result.ok);
                    if (result.ok) await renderStatus();
                    else { btn.textContent = 'Cancel'; btn.disabled = false; }
                });
            });
        }

        // ── COURSES VIEW ──────────────────────────────────────────────────────────
        async function renderCourses() {
            const [statusFetch, coursesFetch] = await Promise.all([
                fetchTraining('status'),
                fetchTraining('courses')
            ]);
            const pets = scrapeStatus(statusFetch.doc);
            const tierMap = scrapeCoursesOptions(coursesFetch.doc);

            contentInner.innerHTML = '';

            const eligible = pets.filter(p => !p.onCourse && !p.courseFinished && p.codestonesNeeded.length === 0 && p.level < 250);

            if (!eligible.length) {
                const note = document.createElement('div');
                note.style.cssText = 'text-align:center;padding:40px;color:var(--nui-text-muted);';
                note.textContent = 'All your pets are currently in training or awaiting payment!';
                contentInner.appendChild(note);
                return;
            }

            const courseTypes = ['Strength', 'Defence', 'Agility', 'Endurance', 'Level'];
            const ctrlRow = document.createElement('div');
            ctrlRow.style.cssText = 'display:flex;gap:8px;margin-bottom:var(--nui-space-4);align-items:center;flex-wrap:wrap;';
            ctrlRow.innerHTML = `
                <span style="font-size:12px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Course Type</span>
                <select class="nui-select" id="nui-course-type" style="flex:1;min-width:120px;max-width:200px;font-weight:700;">
                    ${courseTypes.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            `;
            contentInner.appendChild(ctrlRow);

            const listWrap = document.createElement('div');
            listWrap.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--nui-space-3);';

            eligible.forEach(pet => {
                const info = tierMap[pet.name] || { tier: tierForLevel(pet.level).name, stones: tierForLevel(pet.level).stones };
                const tier = tierForLevel(pet.level);

                const card = document.createElement('div');
                card.style.cssText = 'display:flex; flex-direction:column; align-items:center; text-align:center; padding: 12px; border: 1px solid var(--nui-border); border-radius: var(--nui-radius-md); background: var(--nui-surface-2);';

                card.innerHTML = `
                    <img src="${pet.imgSrc}" style="width:54px; height:54px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border); object-fit:cover; margin-bottom:8px;">
                    <div style="font-weight:800; font-size:15px; color:var(--nui-text); width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pet.name}</div>
                    <div style="font-size:12px; color:var(--nui-text-muted); margin-top:2px; margin-bottom:12px;">Lvl ${pet.level} · ${info.stones} stone${info.stones>1?'s':''}</div>
                    <button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-start" data-pet="${pet.name}" style="width: 100%;">Start Course</button>
                `;
                listWrap.appendChild(card);
            });

            contentInner.appendChild(listWrap);

            contentInner.querySelectorAll('.btn-start').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const petName = btn.getAttribute('data-pet');
                    const courseType = document.getElementById('nui-course-type').value;
                    btn.textContent = '...'; btn.disabled = true;
                    const result = await processTraining('start', petName, courseType);
                    showToast(result.ok ? `${petName} started ${courseType}!` : result.message, !result.ok);
                    if (result.ok) await switchTab('status');
                    else { btn.textContent = 'Start'; btn.disabled = false; }
                });
            });
        }

        // ── WISDOM VIEW ───────────────────────────────────────────────────────────
        async function renderWisdom() {
            const { raw } = await fetchTraining('wisdom');

            // Raw HTML regex match prevents fragile DOM traversal issues
            const quoteMatch = raw.match(/The Techo Master says '<b>(.*?)<\/b>'/i);
            const quote = quoteMatch ? quoteMatch[1] : 'The Techo Master has no wisdom for you today.';

            contentInner.innerHTML = `
                <div style="text-align:center;padding:var(--nui-space-4);">
                    <img src="//images.neopets.com/island/techomaster.gif" style="width:80px;height:80px;border-radius:50%;border:2px solid var(--nui-border);object-fit:cover;margin-bottom:16px;">
                    <div style="font-size:13px;color:var(--nui-text-faint);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">The Techo Master says...</div>
                    <blockquote style="font-size:15px;font-weight:600;color:var(--nui-text);font-style:italic;line-height:1.6;max-width:480px;margin:0 auto;padding:16px;border-radius:var(--nui-radius-md);background:var(--nui-surface-2);border-left:3px solid var(--nui-accent);">"${quote}"</blockquote>
                    <button type="button" class="nui-btn nui-btn-secondary nui-btn-sm" style="margin-top:14px;" id="nui-new-wisdom">New Wisdom</button>
                </div>
            `;

            contentInner.querySelector('#nui-new-wisdom').onclick = async () => {
                contentInner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--nui-text-faint);">Consulting the master...</div>';
                await renderWisdom();
            };
        }

        // ── Boot ──────────────────────────────────────────────────────────────────
        switchTab(activeTab);
    }

    let booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        init().catch(showFatalError);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        boot();
    } else {
        document.addEventListener('DOMContentLoaded', boot);
    }

})();
// ==============================================================================
// MODULE 10: FOOD CLUB (FULL SPA)
// ==============================================================================
// Activates on: /pirates/foodclub.phtml (all ?type= subpages)
//
// Features:
//   • Pirates tab   — stat table with win-rate bars and sort
//   • Bet tab       — 5-arena dropdowns, live odds calc, max-bet enforced
//   • My Bets tab   — current round bets with odds breakdown
//   • Collect tab   — collect winnings form
//   • History tab   — lifetime bet history stats
//   • NeoFoodClub bet-string importer — paste an NFC URL/string to generate
//     a 10-bet auto-capped queue and submit them sequentially.
// ==============================================================================

(function () {
    'use strict';

    if (!/\/pirates\/foodclub\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('foodclub')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI) return;

    // ─────────────────────────────────────────────────────────────────────────
    // FATAL ERROR BOX
    // ─────────────────────────────────────────────────────────────────────────
    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Food Club SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    const ARENAS = ['Shipwreck', 'Lagoon', 'Treasure Island', 'Hidden Cove', "Harpoon Harry's"];
    const MAX_WIN = 1000000;

    // ─────────────────────────────────────────────────────────────────────────
    // FETCH HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    async function fetchFC(type) {
        const res = await fetch(`/pirates/foodclub.phtml?type=${type}`, { credentials: 'include' });
        const html = await res.text();
        return { doc: new DOMParser().parseFromString(html, 'text/html'), raw: html };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCRAPERS
    // ─────────────────────────────────────────────────────────────────────────
    function scrapePirates(doc) {
        const pirates = [];
        const rows = doc.querySelectorAll("tr");
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 6) return;
            const link = cells[0].querySelector('a');
            if (!link) return;
            const href = link.getAttribute('href') || '';
            const idMatch = href.match(/id=(\d+)/);
            if (!idMatch) return;
            pirates.push({
                id: parseInt(idMatch[1]),
                name: link.textContent.trim(),
                strength: parseInt(cells[1].textContent) || 0,
                weight: parseInt(cells[2].textContent) || 0,
                wins: parseInt(cells[3].textContent.replace(/,/g, '')) || 0,
                losses: parseInt(cells[4].textContent.replace(/,/g, '')) || 0,
                pct: parseInt(cells[5].textContent) || 0,
            });
        });
        return pirates;
    }
    function scrapeBetForm(doc) {
        const raw = doc.documentElement.innerHTML;

        // 1. Scrape Max Bet Amount safely from the text string or JS fallback
        let maxBet = 0;
        const textMatch = raw.match(/up to <b>(\d+)<\/b> NeoPoints/i);
        const jsMatch = raw.match(/max_bet\s*=\s*(\d+)/i);

        if (textMatch) {
            maxBet = parseInt(textMatch[1], 10);
        } else if (jsMatch) {
            maxBet = parseInt(jsMatch[1], 10);
        }

        // 2. Scrape Pirate Odds
        const oddsMap = {};
        const oddsRe = /pirate_odds\[(\d+)\]\s*=\s*(\d+)/g;
        let m;
        while ((m = oddsRe.exec(raw)) !== null) {
            oddsMap[parseInt(m[1], 10)] = parseInt(m[2], 10);
        }

        // 3. Map Arenas and Pirates
        const arenas = [];
        const betTable = doc.querySelector("form[name='bet_form'] table");
        if (!betTable) return { maxBet, arenas };

        const rows = betTable.querySelectorAll('tr');
        rows.forEach(row => {
            const cbInput = row.querySelector('input[type="checkbox"][name="matches[]"]');
            if (!cbInput) return;
            const arenaIndex = parseInt(cbInput.value, 10) - 1;
            const arenaName = ARENAS[arenaIndex] || `Arena ${arenaIndex + 1}`;
            const select = row.querySelector('select');
            if (!select) return;

            const pirates = [];
            select.querySelectorAll('option').forEach(opt => {
                if (!opt.value) return;
                const id = parseInt(opt.value, 10);
                const oddsVal = oddsMap[id] || 1;
                const txt = opt.textContent.trim();
                const nameMatch = txt.match(/^(.+?)\s+\(/);
                const name = nameMatch ? nameMatch[1].trim() : txt;
                pirates.push({ id, name, odds: oddsVal });
            });

            arenas.push({ name: arenaName, arenaIndex, pirates });
        });

        return { maxBet, arenas };
    }


    function scrapeCurrentBets(doc) {
        const bets = [];
        const rows = doc.querySelectorAll("tr");
        let dataRows = 0;
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 5 && cells[0].textContent.trim() !== 'Round' && cells[0].textContent.trim() !== '') {
                const betInfo = cells[1].innerHTML.trim();
                const amount = cells[2].textContent.trim();
                const odds = cells[3].textContent.trim();
                const winnings = cells[4].textContent.trim();
                bets.push({ betInfo, amount, odds, winnings });
                dataRows++;
            }
        });

        if (dataRows === 0) {
            const emptyCell = doc.querySelector("td[colspan='5']");
            if (emptyCell && emptyCell.textContent.includes('You do not have any bets placed')) return null;
        }

        return bets;
    }

    function scrapeCollect(doc) {
        const formAction = 'process_foodclub.phtml';
        const rows = [];
        const trs = doc.querySelectorAll("tr");
        trs.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 5 && cells[0].textContent.trim() !== 'Round' && cells[0].textContent.trim() !== '') {
                rows.push({
                    round: cells[0].textContent.trim(),
                    betInfo: cells[1].innerHTML.trim(),
                    amount: cells[2].textContent.trim(),
                    odds: cells[3].textContent.trim(),
                    winnings: cells[4].textContent.trim(),
                });
            }
        });

        let emptyCheck = false;
        trs.forEach(row => {
            const td = row.querySelector("td[colspan='5']");
            if (td && td.textContent.includes("You do not have any winning bets")) emptyCheck = true;
        });

        const hasWinnings = rows.length > 0 && !emptyCheck;
        return { hasWinnings, rows, formAction };
    }

    function scrapeHistory(doc) {
        const tables = doc.querySelectorAll('table');
        let historyData = null;
        tables.forEach(table => {
            if (table.textContent.includes('Bets Placed') && table.textContent.includes('Bet Total')) {
                const rows = table.querySelectorAll('tr');
                if (rows.length >= 3) {
                    const cells = rows[2].querySelectorAll('td');
                    if (cells.length >= 4) {
                        historyData = {
                            betsPlaced: cells[0].textContent.trim(),
                            betTotal: cells[1].textContent.trim(),
                            winTotal: cells[2].textContent.trim(),
                            differenceHtml: cells[3].innerHTML.trim()
                        };
                    }
                }
            }
        });
        return historyData;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST A SINGLE BET
    // ─────────────────────────────────────────────────────────────────────────
    async function postBet(row, amount) {
        const fd = new FormData();
        fd.append('type', 'bet');
        fd.append('bet_amount', String(amount));

        row.forEach((pid, arenaIdx) => {
            if (!pid) return;
            fd.append('matches[]', String(arenaIdx + 1));
            fd.append(`winner${arenaIdx + 1}`, String(pid));
        });

        const res = await fetch('/pirates/process_foodclub.phtml', {
            method: 'POST',
            credentials: 'include',
            body: fd,
        });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Neopets shows actual errors in .errorMessage / #errorMessage / p.error elements.
        // A successful bet redirects to the current-bets page — which is a normal FC page
        // with pirate tables in it. Don't scan the whole page text for keywords since
        // words like "please" and "already" appear in navigation and bet tables on success.
        const errorEl = doc.querySelector('.errorMessage, #errorMessage, .error_msg, p.error, .neopets-error');
        if (errorEl) {
            const msg = errorEl.textContent.replace(/\s+/g, ' ').trim();
            return { ok: false, message: msg.slice(0, 200) };
        }

        // Also catch the specific "you cannot bet" / "oops" patterns that appear
        // as plain paragraphs rather than in error-classed elements
        const content = doc.querySelector('td.content');
        if (content) {
            const text = content.textContent.replace(/\s+/g, ' ').trim();
            // Only flag as error if the page starts with or prominently features
            // a hard error phrase — not just contains common words
            if (/^(oops|sorry|error|you cannot|you can't|you do not|you don't|unable to|invalid)/i.test(text) ||
                /you (cannot|can't|do not have enough|already (have|placed)|have reached the maximum)/i.test(text)) {
                return { ok: false, message: text.slice(0, 200) };
            }
        }

        // No error found — the response is the updated current-bets page, which is correct
        return { ok: true, message: 'Bet placed!' };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────────────────────
    async function init() {
        const profile = NeoUI.scrapeLegacyProfile();

        const nextMatchEl = document.querySelector('center');
        const nextMatchText = nextMatchEl ? nextMatchEl.textContent.trim() : '';

        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        const wrapper = document.createElement('div');
        wrapper.className = 'nui-reset';
        wrapper.style.cssText = 'padding: calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5); max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--nui-space-4);';

        // Banner card
        const bannerCard = document.createElement('div');
        bannerCard.className = 'nui-surface';
        bannerCard.style.cssText = 'border-radius:var(--nui-radius-lg);border:1px solid var(--nui-border);overflow:hidden;box-shadow:0 4px 12px var(--nui-shadow);position:relative;';
        bannerCard.innerHTML = `
            <div style="position:relative;width:100%;height:120px;overflow:hidden;background:linear-gradient(135deg,#2B1A0A 0%,#4A2E12 50%,#2B1A0A 100%);">
                <img src="//images.neopets.com/pirates/fc/foodclub_bg.gif"
                     style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.45;"
                     onerror="this.style.display='none'">
                <div style="position:absolute;inset:0;display:flex;align-items:center;gap:14px;padding:0 var(--nui-space-4);">
                    <img src="//images.neopets.com/pirates/fc/bookie.gif"
                         style="width:72px;height:72px;border-radius:var(--nui-radius-md);border:2px solid rgba(255,255,255,0.25);object-fit:cover;flex-shrink:0;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));"
                         onerror="this.style.display='none'">
                    <div>
                        <div style="font-family:var(--nui-font-display);font-weight:800;font-size:28px;color:#FFD060;text-shadow:0 2px 8px rgba(0,0,0,0.6);line-height:1.1;">Food Club</div>
                        <div id="nui-fc-next" style="font-size:13px;color:rgba(255,220,120,0.9);font-weight:600;margin-top:3px;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${nextMatchText}</div>
                    </div>
                </div>
            </div>
        `;
        wrapper.appendChild(bannerCard);

        const tabBar = document.createElement('div');
        tabBar.style.cssText = 'display:flex;gap:6px;border-bottom:2px solid var(--nui-border);padding-bottom:0;overflow-x:auto;scrollbar-width:none;';

        const TABS = [
            { id: 'pirates',  label: '🏴‍☠️ Pirates'  },
            { id: 'bet',      label: '🎰 Place Bet'  },
            { id: 'mybets',   label: '📋 My Bets'    },
            { id: 'collect',  label: '💰 Collect'    },
            { id: 'history',  label: '📜 History'    },
        ];

        const urlType = new URLSearchParams(location.search).get('type') || '';
        const startTab = urlType === 'current_bets' ? 'mybets'
                       : urlType === 'collect'       ? 'collect'
                       : urlType === 'bet'           ? 'bet'
                       : urlType === 'history'       ? 'history'
                       : 'pirates';

        let activeTab = startTab;
        const tabEls = {};

        TABS.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = t.label;
            btn.style.cssText = 'padding:8px 14px;border:none;cursor:pointer;font-weight:700;font-size:13px;border-radius:var(--nui-radius-sm) var(--nui-radius-sm) 0 0;background:transparent;color:var(--nui-text-muted);border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.15s;white-space:nowrap;flex-shrink:0;';
            tabEls[t.id] = btn;
            tabBar.appendChild(btn);
        });
        wrapper.appendChild(tabBar);

        const contentPanel = document.createElement('div');
        contentPanel.className = 'nui-surface';
        contentPanel.style.cssText = 'border-radius:var(--nui-radius-lg);overflow:hidden;min-height:200px;box-shadow:0 4px 12px var(--nui-shadow);border:1px solid var(--nui-border);';

        const contentInner = document.createElement('div');
        contentInner.style.cssText = 'padding:var(--nui-space-4);';
        contentPanel.appendChild(contentInner);
        wrapper.appendChild(contentPanel);

        document.body.appendChild(wrapper);

        function showToast(msg, isError) {
            const toast = document.createElement('div');
            toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 18px;border-radius:var(--nui-radius-md);font-size:14px;font-weight:700;max-width:90vw;text-align:center;box-shadow:0 4px 16px var(--nui-shadow);background:${isError ? 'var(--nui-danger)' : 'var(--nui-success)'};color:#fff;transition:opacity 0.3s;`;
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
        }

        async function switchTab(id, extraState) {
            activeTab = id;
            Object.entries(tabEls).forEach(([tid, btn]) => {
                const on = tid === id;
                btn.style.color = on ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                btn.style.borderBottomColor = on ? 'var(--nui-accent)' : 'transparent';
                btn.style.background = on ? 'var(--nui-surface-2)' : 'transparent';
            });
            contentInner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--nui-text-faint);">Loading...</div>';
            try {
                if      (id === 'pirates') await renderPirates();
                else if (id === 'bet')     await renderBet(extraState);
                else if (id === 'mybets')  await renderMyBets();
                else if (id === 'collect') await renderCollect();
                else if (id === 'history') await renderHistory();
            } catch (err) {
                contentInner.innerHTML = `<div style="color:var(--nui-danger);font-weight:600;text-align:center;padding:var(--nui-space-4);">Failed to load: ${err.message}</div>`;
            }
        }

        TABS.forEach(t => { tabEls[t.id].addEventListener('click', () => switchTab(t.id)); });

        // ─────────────────────────────────────────────────────────────────────
        // RENDER: PIRATES TAB
        // ─────────────────────────────────────────────────────────────────────
        async function renderPirates() {
            const { doc } = await fetchFC('pirates');
            const pirates = scrapePirates(doc);

            contentInner.innerHTML = '';

            if (!pirates.length) {
                contentInner.innerHTML = '<div class="nui-empty"><span class="nui-empty-emoji">🏴‍☠️</span>No pirate data found.</div>';
                return;
            }

            let sortKey = 'pct';
            let sortDir = -1;

            function renderTable() {
                contentInner.innerHTML = '';

                const sorted = [...pirates].sort((a, b) => {
                    const av = a[sortKey], bv = b[sortKey];
                    return typeof av === 'number' ? (bv - av) * sortDir : sortDir * String(av).localeCompare(String(bv));
                });

                const sortRow = document.createElement('div');
                sortRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:var(--nui-space-3);align-items:center;';
                sortRow.innerHTML = '<span style="font-size:12px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Sort by</span>';

                [['name','Name'],['pct','Win%'],['wins','Wins'],['strength','Str'],['weight','Wt']].forEach(([key, label]) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.style.cssText = `padding:4px 10px;border-radius:var(--nui-radius-pill);border:1px solid var(--nui-border);font-size:12px;font-weight:700;cursor:pointer;transition:all 0.1s;background:${sortKey===key?'var(--nui-accent-soft)':'var(--nui-surface-2)'};color:${sortKey===key?'var(--nui-accent)':'var(--nui-text-muted)'};`;
                    btn.textContent = label + (sortKey === key ? (sortDir === -1 ? ' ↓' : ' ↑') : '');
                    btn.addEventListener('click', () => {
                        if (sortKey === key) sortDir *= -1;
                        else { sortKey = key; sortDir = -1; }
                        renderTable();
                    });
                    sortRow.appendChild(btn);
                });
                contentInner.appendChild(sortRow);

                const grid = document.createElement('div');
                grid.style.cssText = 'display:flex;flex-direction:column;gap:var(--nui-space-2);';

                sorted.forEach(p => {
                    const card = document.createElement('div');
                    card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);padding:10px 14px;background:var(--nui-surface-2);display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;';

                    const total = p.wins + p.losses;
                    const barW = total > 0 ? Math.round((p.wins / total) * 100) : 0;
                    const barColor = p.pct >= 50 ? 'var(--nui-success)' : p.pct >= 25 ? 'var(--nui-warning)' : 'var(--nui-danger)';

                    card.innerHTML = `
                        <div style="min-width:0;">
                            <div style="font-weight:800;font-size:15px;color:var(--nui-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                <a href="/pirates/foodclub.phtml?type=pirates&id=${p.id}" style="color:var(--nui-accent);text-decoration:none;">${p.name}</a>
                            </div>
                            <div style="font-size:12px;color:var(--nui-text-muted);font-weight:600;margin-top:3px;">
                                Str <b style="color:var(--nui-text);">${p.strength}</b> &nbsp;·&nbsp;
                                Wt <b style="color:var(--nui-text);">${p.weight}</b> &nbsp;·&nbsp;
                                ${p.wins.toLocaleString()} W / ${p.losses.toLocaleString()} L
                            </div>
                            <div style="margin-top:6px;height:5px;background:var(--nui-surface);border-radius:3px;overflow:hidden;">
                                <div style="height:100%;width:${barW}%;background:${barColor};border-radius:3px;transition:width 0.3s;"></div>
                            </div>
                        </div>
                        <div style="text-align:center;flex-shrink:0;">
                            <div style="font-family:var(--nui-font-display);font-size:22px;font-weight:800;color:${barColor};">${p.pct}%</div>
                            <div style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Win Rate</div>
                        </div>
                    `;

                    grid.appendChild(card);
                });

                contentInner.appendChild(grid);
            }

            renderTable();
        }

        // ─────────────────────────────────────────────────────────────────────
        // RENDER: BET TAB (WITH MULTIPLE BET QUEUE AND CAPPING)
        // ─────────────────────────────────────────────────────────────────────
        async function renderBet(extraState) {
            const { doc } = await fetchFC('bet');
            const { maxBet, arenas } = scrapeBetForm(doc);
            const globalOddsMap = {};
            arenas.forEach(a => a.pirates.forEach(p => { globalOddsMap[p.id] = p.odds; }));

            contentInner.innerHTML = '';

            if (!arenas.length) {
                contentInner.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">🎰</span>Betting is not currently available.</div>`;
                return;
            }

            // --- Top Importer Row (Always visible) ---
            const importRow = document.createElement('div');
            importRow.style.cssText = 'display:flex;gap:8px;margin-bottom:var(--nui-space-4);align-items:flex-start;flex-wrap:wrap;';
            importRow.innerHTML = `
                <div style="flex:1;min-width:180px;">
                    <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--nui-text-faint);letter-spacing:0.5px;margin-bottom:4px;">NeoFoodClub Import</div>
                    <input class="nui-input" id="nui-fc-nfc-input" type="text" placeholder="Paste NFC URL or bet string…" style="font-size:13px;padding:9px 12px;">
                </div>
                <button type="button" class="nui-btn nui-btn-secondary nui-btn-sm" id="nui-fc-nfc-btn" style="align-self:flex-end;white-space:nowrap;">Load Bets</button>
            `;
            contentInner.appendChild(importRow);

            // Container for shifting between Queue View and Single View
            const viewContainer = document.createElement('div');
            contentInner.appendChild(viewContainer);

            // Import Button Listener
            importRow.querySelector('#nui-fc-nfc-btn').addEventListener('click', () => {
                const val = importRow.querySelector('#nui-fc-nfc-input').value.trim();
                if (!val) { showToast('Paste an NFC URL or bet string first.', true); return; }

                const hashIdx = val.indexOf('#');
                const fragment = hashIdx !== -1 ? val.slice(hashIdx + 1) : val;
                const params = new URLSearchParams(fragment);

                let parsedBets = [];
                let parsedAmounts = [];

                if (params.has('b')) {
                    const alphabet = "abcdefghijklmnopqrstuvwxy";
                    const nums = params.get('b').replace(/[^a-y]/g, "").split("").map(c => alphabet.indexOf(c));

                    const flat = [];
                    for (let i = 0; i < nums.length; i++) {
                        flat.push(Math.floor(nums[i] / 5));
                        flat.push(nums[i] % 5);
                    }

                    const betArrays = [];
                    for (let i = 0; i < flat.length; i += 5) {
                        const chunk = flat.slice(i, i + 5);
                        if (chunk.length === 5) betArrays.push(chunk);
                    }

                    parsedBets = betArrays.map(betRow => {
                        const arenaSelections = [null, null, null, null, null];
                        betRow.forEach((pirateIdx, arenaIdx) => {
                            if (pirateIdx === 0) return;
                            const arena = arenas[arenaIdx];
                            if (arena && arena.pirates[pirateIdx - 1]) {
                                arenaSelections[arenaIdx] = arena.pirates[pirateIdx - 1].id;
                            }
                        });
                        return arenaSelections;
                    });
                }

                if (params.has('a')) {
                    const aStr = params.get('a');
                    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                    const chunks = aStr.replace(/[^a-zA-Z]/g, "").match(/.{1,3}/g) || [];
                    parsedAmounts = chunks.map(chunk => {
                        let v = 0;
                        for (let i = 0; i < chunk.length; i++) {
                            v *= 52;
                            v += alphabet.indexOf(chunk[i]);
                        }
                        return v - 70304;
                    });
                }

                if (!parsedBets || !parsedBets.length) {
                    showToast('Could not parse NFC string. Make sure it contains a b= parameter.', true);
                    return;
                }

                // Map into Queue Format
                const betQueue = parsedBets.map((arenaSelections, i) => {
                    let amt = null;
                    if (parsedAmounts && parsedAmounts[i]) {
                        amt = parsedAmounts[i];
                    } else if (parsedAmounts && parsedAmounts.length > 0) {
                        amt = parsedAmounts[0];
                    }
                    return { arenaSelections, amount: amt };
                });

                showToast(`Loaded ${betQueue.length} bet(s).`, false);
                switchTab('bet', { betQueue });
            });


            // --- QUEUE VIEW (If array of bets is passed) ---
            if (extraState && extraState.betQueue) {
                const queueCard = document.createElement('div');
                queueCard.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

                let totalCost = 0;
                const rowsData = [];

                const table = document.createElement('div');
                table.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

                extraState.betQueue.forEach((bet, i) => {
                    let totalOdds = 1;
                    let hasPirate = false;
                    let pirateNames = [];

                    bet.arenaSelections.forEach((pid, aIdx) => {
                        if (pid) {
                            hasPirate = true;
                            totalOdds *= (globalOddsMap[pid] || 1);
                            const pName = arenas[aIdx]?.pirates.find(p => p.id === pid)?.name || 'Unknown';
                            pirateNames.push(pName);
                        }
                    });

                    if (!hasPirate) totalOdds = 0;

                                        // Cap Logic Enforcement
                    let finalAmt = bet.amount || maxBet;
                    if (totalOdds > 0) {
                        const maxPayoutCap = Math.floor(MAX_WIN / totalOdds);

                        // Compare the intended amount against both limits
                        finalAmt = Math.min(finalAmt, maxBet, maxPayoutCap);

                        // Neopets hard-coded minimum bet is 50 NP
                        finalAmt = Math.max(50, finalAmt);
                    }


                    totalCost += finalAmt;
                    const payout = totalOdds * finalAmt;

                    const row = document.createElement('div');
                    row.className = 'nui-surface-2';
                    row.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-sm);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;';
                    row.innerHTML = `
                        <div style="flex:1;font-size:12px;color:var(--nui-text);">${pirateNames.join(', ')}</div>
                        <div style="display:flex;gap:12px;font-size:12px;font-weight:700;text-align:right;align-items:center;">
                            <div style="width:40px;color:var(--nui-text-muted);">${totalOdds}:1</div>
                            <div style="width:60px;color:var(--nui-text);">${finalAmt.toLocaleString()}</div>
                            <div style="width:70px;color:var(--nui-success);">${payout.toLocaleString()}</div>
                            <div id="q-status-${i}" style="width:60px;color:var(--nui-text-faint);text-align:center;">Ready</div>
                        </div>
                    `;
                    table.appendChild(row);
                    rowsData.push({ selections: bet.arenaSelections, amt: finalAmt, idx: i, odds: totalOdds });
                });

                const summary = document.createElement('div');
                summary.style.cssText = 'padding:12px;background:var(--nui-surface-2);border-radius:var(--nui-radius-md);margin-bottom:8px;font-weight:800;display:flex;justify-content:space-between;border:1px solid var(--nui-border);';
                summary.innerHTML = `
                    <span style="color:var(--nui-text-muted);">Bets: <b style="color:var(--nui-text);">${extraState.betQueue.length}</b></span>
                    <span style="color:var(--nui-text-muted);">Max Bet: <b style="color:var(--nui-accent);">${maxBet.toLocaleString()} NP</b></span>
                    <span style="color:var(--nui-text-muted);">Total Cost: <b style="color:var(--nui-danger);">${totalCost.toLocaleString()} NP</b></span>
                `;

                const placeBtn = document.createElement('button');
                placeBtn.className = 'nui-btn nui-btn-primary nui-btn-block';
                placeBtn.textContent = 'Place All Bets';
                placeBtn.addEventListener('click', async () => {
                    placeBtn.disabled = true;
                    for (const r of rowsData) {
                        if (r.odds === 0) continue;
                        const st = document.getElementById('q-status-' + r.idx);
                        st.textContent = '...';
                        st.style.color = 'var(--nui-warning)';

                        const res = await postBet(r.selections, r.amt);
                        if (res.ok) {
                            st.textContent = 'Placed!';
                            st.style.color = 'var(--nui-success)';
                        } else {
                            st.textContent = 'Error';
                            st.style.color = 'var(--nui-danger)';
                            st.title = res.message;
                        }
                        await new Promise(resolve => setTimeout(resolve, 600)); // Be nice to the servers
                    }
                    placeBtn.textContent = 'Finished!';
                });

                const backBtn = document.createElement('button');
                backBtn.className = 'nui-btn nui-btn-secondary nui-btn-block';
                backBtn.textContent = 'Cancel / Back to Single Bet';
                backBtn.style.marginTop = '8px';
                backBtn.addEventListener('click', () => switchTab('bet'));

                queueCard.appendChild(summary);
                queueCard.appendChild(table);
                queueCard.appendChild(placeBtn);
                queueCard.appendChild(backBtn);

                viewContainer.appendChild(queueCard);
                return;
            }


            // --- SINGLE VIEW (Default) ---
            const infoRow = document.createElement('div');
            infoRow.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:var(--nui-space-3);';
            infoRow.innerHTML = `
                <span class="nui-badge" style="background:var(--nui-accent-soft);color:var(--nui-accent);">Max Bet: <b>${maxBet.toLocaleString()} NP</b></span>
                <span class="nui-badge">Check up to 5 arenas</span>
            `;
            viewContainer.appendChild(infoRow);

            const betState = {
                checked: [false, false, false, false, false],
                selected: [null, null, null, null, null],
                amount: 0,
            };

            const form = document.createElement('form');
            form.method = 'post';
            form.action = 'process_foodclub.phtml';
            form.style.cssText = 'display:flex;flex-direction:column;gap:var(--nui-space-3);';
            form.innerHTML = '<input type="hidden" name="type" value="bet">';

            const oddsCard = document.createElement('div');
            oddsCard.style.cssText = 'background:var(--nui-surface-2);border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);padding:12px 16px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;';
            oddsCard.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;">
                    <div id="nui-fc-total-odds" style="font-family:var(--nui-font-display);font-size:26px;font-weight:800;color:var(--nui-accent);">0</div>
                    <div style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Odds</div>
                </div>
                <div style="flex:1;min-width:120px;">
                    <label style="font-size:12px;font-weight:700;color:var(--nui-text-muted);display:block;margin-bottom:4px;">Bet Amount (NP)</label>
                    <div style="display:flex;gap:8px;">
                        <input class="nui-input" id="nui-fc-bet-amount" type="number" min="50" max="${maxBet}" value="" placeholder="Enter NP…" style="font-size:14px;padding:8px 12px;flex:1;">
                        <button type="button" class="nui-btn nui-btn-secondary" id="nui-fc-max-btn" style="padding:8px 12px;font-size:12px;">Max</button>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;">
                    <div id="nui-fc-payoff" style="font-family:var(--nui-font-display);font-size:22px;font-weight:800;color:var(--nui-success);">0</div>
                    <div style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Potential Payoff</div>
                </div>
            `;

            const arenaContainer = document.createElement('div');
            arenaContainer.style.cssText = 'display:flex;flex-direction:column;gap:10px;';

            arenas.forEach((arena, idx) => {
                const cbWrap = document.createElement('div');
                cbWrap.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);padding:10px 14px;background:var(--nui-surface);transition:border-color 0.15s;display:flex;flex-direction:column;gap:8px;';

                const topRow = document.createElement('div');
                topRow.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.name = 'matches[]';
                cb.value = String(idx + 1);
                cb.style.cssText = 'width:18px;height:18px;accent-color:var(--nui-accent);cursor:pointer;flex-shrink:0;';
                cb.checked = betState.checked[idx];

                const arenaLabel = document.createElement('span');
                arenaLabel.style.cssText = 'font-weight:800;font-size:15px;color:var(--nui-text);flex:1;';
                arenaLabel.textContent = arena.name;

                const oddsChip = document.createElement('span');
                oddsChip.id = `nui-fc-arena-odds-${idx}`;
                oddsChip.className = 'nui-badge';
                oddsChip.style.cssText = 'font-size:12px;';
                oddsChip.textContent = '—';

                topRow.appendChild(cb);
                topRow.appendChild(arenaLabel);
                topRow.appendChild(oddsChip);
                cbWrap.appendChild(topRow);

                const pillsRow = document.createElement('div');
                pillsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding-left:28px;';

                const hiddenSelect = document.createElement('select');
                hiddenSelect.name = `winner${idx + 1}`;
                hiddenSelect.style.display = 'none';

                const blankOpt = document.createElement('option');
                blankOpt.value = '';
                hiddenSelect.appendChild(blankOpt);

                arena.pirates.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = String(p.id);
                    opt.textContent = p.name;
                    hiddenSelect.appendChild(opt);

                    const pill = document.createElement('button');
                    pill.type = 'button';
                    pill.setAttribute('data-pid', p.id);
                    pill.style.cssText = 'padding:5px 11px;border-radius:var(--nui-radius-pill);border:1px solid var(--nui-border);font-size:12px;font-weight:700;cursor:pointer;transition:all 0.1s;background:var(--nui-surface-2);color:var(--nui-text-muted);display:flex;align-items:center;gap:5px;';
                    pill.innerHTML = `${p.name} <span style="background:var(--nui-surface);border-radius:4px;padding:1px 5px;font-size:11px;color:var(--nui-text-faint);">${p.odds}:1</span>`;

                    pill.addEventListener('click', () => {
                        if (betState.selected[idx] === p.id) {
                            betState.selected[idx] = null;
                            hiddenSelect.value = '';
                        } else {
                            betState.selected[idx] = p.id;
                            hiddenSelect.value = String(p.id);
                        }
                        if (betState.selected[idx]) betState.checked[idx] = true;
                        cb.checked = betState.checked[idx];

                        pillsRow.querySelectorAll('button[data-pid]').forEach(btn => {
                            const isActive = parseInt(btn.getAttribute('data-pid')) === betState.selected[idx];
                            btn.style.background = isActive ? 'var(--nui-accent-soft)' : 'var(--nui-surface-2)';
                            btn.style.color = isActive ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                            btn.style.borderColor = isActive ? 'var(--nui-accent)' : 'var(--nui-border)';
                        });

                        updateOdds();
                    });

                    pillsRow.appendChild(pill);
                });

                cbWrap.appendChild(pillsRow);
                cbWrap.appendChild(hiddenSelect);
                arenaContainer.appendChild(cbWrap);

                cb.addEventListener('change', () => {
                    betState.checked[idx] = cb.checked;
                    cbWrap.style.borderColor = cb.checked ? 'var(--nui-accent)' : 'var(--nui-border)';
                    if (!cb.checked) {
                        betState.selected[idx] = null;
                        hiddenSelect.value = '';
                        pillsRow.querySelectorAll('button[data-pid]').forEach(btn => {
                            btn.style.background = 'var(--nui-surface-2)';
                            btn.style.color = 'var(--nui-text-muted)';
                            btn.style.borderColor = 'var(--nui-border)';
                        });
                    }
                    updateOdds();
                });

                if (betState.checked[idx]) cbWrap.style.borderColor = 'var(--nui-accent)';

                function updateArenaChip() {
                    const sel = betState.selected[idx];
                    const chip = document.getElementById(`nui-fc-arena-odds-${idx}`);
                    if (!chip) return;
                    if (sel && betState.checked[idx]) {
                        const o = globalOddsMap[sel] || 1;
                        chip.textContent = `${o}:1`;
                        chip.style.background = 'var(--nui-accent-soft)';
                        chip.style.color = 'var(--nui-accent)';
                    } else {
                        chip.textContent = '—';
                        chip.style.background = '';
                        chip.style.color = '';
                    }
                }

                cbWrap._updateChip = updateArenaChip;
                if (betState.checked[idx] && betState.selected[idx]) updateArenaChip();
            });

            function updateOdds() {
                let totalOdds = 0;
                arenas.forEach((arena, idx) => {
                    if (!betState.checked[idx] || !betState.selected[idx]) return;
                    const o = globalOddsMap[betState.selected[idx]] || 1;
                    totalOdds = totalOdds === 0 ? o : totalOdds * o;
                });

                const oddsEl = document.getElementById('nui-fc-total-odds');
                const payEl = document.getElementById('nui-fc-payoff');
                if (oddsEl) oddsEl.textContent = totalOdds > 0 ? `${totalOdds}:1` : '0';

                const amtInput = document.getElementById('nui-fc-bet-amount');
                const amt = amtInput ? Math.min(parseInt(amtInput.value) || 0, maxBet) : 0;
                const payoff = Math.min(totalOdds * amt, MAX_WIN);
                if (payEl) payEl.textContent = payoff > 0 ? payoff.toLocaleString() + ' NP' : '0';

                arenaContainer.childNodes.forEach(node => node._updateChip && node._updateChip());
            }

            oddsCard.querySelector('#nui-fc-bet-amount').addEventListener('input', updateOdds);

            oddsCard.querySelector('#nui-fc-max-btn').addEventListener('click', () => {
                let currentOdds = 0;
                arenas.forEach((arena, idx) => {
                    if (!betState.checked[idx] || !betState.selected[idx]) return;
                    const o = globalOddsMap[betState.selected[idx]] || 1;
                    currentOdds = currentOdds === 0 ? o : currentOdds * o;
                });

                let amt = maxBet;
                if (currentOdds > 0) {
                    const cap = Math.floor(MAX_WIN / currentOdds);
                    amt = Math.min(amt, maxBet, cap);
                    amt = Math.max(50, amt);
                }
                document.getElementById('nui-fc-bet-amount').value = amt;
                updateOdds();
            });

            const submitBtn = document.createElement('button');
            submitBtn.type = 'submit';
            submitBtn.className = 'nui-btn nui-btn-primary nui-btn-block';
            submitBtn.textContent = 'Place This Bet!';
            submitBtn.style.marginTop = 'var(--nui-space-2)';

            submitBtn.addEventListener('click', (e) => {
                const anyChecked = betState.checked.some((c, i) => c && betState.selected[i]);
                if (!anyChecked) {
                    e.preventDefault();
                    showToast('Check at least one arena and pick a pirate!', true);
                    return;
                }
                const amt = parseInt(document.getElementById('nui-fc-bet-amount').value) || 0;
                if (amt < 1) {
                    e.preventDefault();
                    showToast('Enter a bet amount!', true);
                    return;
                }
                if (amt > maxBet) {
                    e.preventDefault();
                    showToast(`Max bet is ${maxBet.toLocaleString()} NP!`, true);
                    return;
                }
                let amtInput = form.querySelector('input[name="bet_amount"]');
                if (!amtInput) {
                    amtInput = document.createElement('input');
                    amtInput.type = 'hidden';
                    amtInput.name = 'bet_amount';
                    form.appendChild(amtInput);
                }
                amtInput.value = String(amt);
            });

            form.appendChild(oddsCard);
            form.appendChild(arenaContainer);
            form.appendChild(submitBtn);
            viewContainer.appendChild(form);

            updateOdds();
        }

        // ─────────────────────────────────────────────────────────────────────
        // RENDER: MY BETS TAB
        // ─────────────────────────────────────────────────────────────────────
        async function renderMyBets() {
            const { doc } = await fetchFC('current_bets');
            const bets = scrapeCurrentBets(doc);

            contentInner.innerHTML = '';

            if (bets === null || bets.length === 0) {
                contentInner.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">📋</span>No bets placed for this round yet.</div>`;
                return;
            }

            const heading = document.createElement('div');
            heading.style.cssText = 'font-family:var(--nui-font-display);font-size:18px;font-weight:800;color:var(--nui-text);margin-bottom:var(--nui-space-3);';
            heading.textContent = `Current Bets (${bets.length})`;
            contentInner.appendChild(heading);

            bets.forEach(bet => {
                const card = document.createElement('div');
                card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);padding:12px 14px;background:var(--nui-surface-2);margin-bottom:10px;display:flex;flex-direction:column;gap:6px;';

                card.innerHTML = `
                    <div style="font-size:13px;color:var(--nui-text-muted);">${bet.betInfo}</div>
                    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                        <div style="display:flex;flex-direction:column;align-items:center;">
                            <span style="font-family:var(--nui-font-display);font-size:18px;font-weight:800;color:var(--nui-text);">${bet.amount}</span>
                            <span style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Bet</span>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;">
                            <span style="font-family:var(--nui-font-display);font-size:18px;font-weight:800;color:var(--nui-accent);">${bet.odds}</span>
                            <span style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Odds</span>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;">
                            <span style="font-family:var(--nui-font-display);font-size:18px;font-weight:800;color:var(--nui-success);">${bet.winnings}</span>
                            <span style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Potential Win</span>
                        </div>
                    </div>
                `;

                contentInner.appendChild(card);
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // RENDER: COLLECT TAB
        // ─────────────────────────────────────────────────────────────────────
        async function renderCollect() {
            const { doc } = await fetchFC('collect');
            const { hasWinnings, rows } = scrapeCollect(doc);

            contentInner.innerHTML = '';

            if (!hasWinnings) {
                contentInner.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">💰</span>No winning bets to collect right now.</div>`;
                return;
            }

            const heading = document.createElement('div');
            heading.style.cssText = 'font-family:var(--nui-font-display);font-size:18px;font-weight:800;color:var(--nui-text);margin-bottom:var(--nui-space-3);';
            heading.textContent = `Winnings Available!`;
            contentInner.appendChild(heading);

            let totalWin = 0;
            rows.forEach(r => {
                const n = parseInt((r.winnings || '').replace(/[^0-9]/g, ''));
                if (!isNaN(n)) totalWin += n;
            });

            if (totalWin > 0) {
                const totalBadge = document.createElement('div');
                totalBadge.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:var(--nui-success-soft);border:1px solid var(--nui-success);border-radius:var(--nui-radius-pill);font-weight:800;color:var(--nui-success);font-size:15px;margin-bottom:var(--nui-space-3);';
                totalBadge.innerHTML = `🎉 Total: ${totalWin.toLocaleString()} NP`;
                contentInner.appendChild(totalBadge);
            }

            rows.forEach(r => {
                const card = document.createElement('div');
                card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);padding:12px 14px;background:var(--nui-surface-2);margin-bottom:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
                card.innerHTML = `
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:12px;color:var(--nui-text-faint);font-weight:700;margin-bottom:3px;">Round ${r.round}</div>
                        <div style="font-size:13px;color:var(--nui-text-muted);">${r.betInfo}</div>
                    </div>
                    <div style="display:flex;gap:12px;align-items:center;">
                        <div style="text-align:center;">
                            <div style="font-weight:800;color:var(--nui-text);font-size:15px;">${r.amount}</div>
                            <div style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Bet</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-weight:800;color:var(--nui-accent);font-size:15px;">${r.odds}</div>
                            <div style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Odds</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-weight:800;color:var(--nui-success);font-size:18px;">${r.winnings}</div>
                            <div style="font-size:10px;font-weight:700;color:var(--nui-text-faint);text-transform:uppercase;">Won</div>
                        </div>
                    </div>
                `;
                contentInner.appendChild(card);
            });

            const collectBtn = document.createElement('button');
collectBtn.type = 'button';
collectBtn.className = 'nui-btn nui-btn-primary nui-btn-block';
collectBtn.style.marginTop = 'var(--nui-space-3)';
collectBtn.textContent = 'Collect All Winnings';
collectBtn.addEventListener('click', async () => {
    collectBtn.disabled = true;
    collectBtn.textContent = 'Collecting…';
    const fd = new FormData();
    fd.append('type', 'collect');
    try {
        const res = await fetch('/pirates/process_foodclub.phtml', {
            method: 'POST',
            credentials: 'include',
            body: fd,
        });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('td.content');
        const text = content ? content.textContent.replace(/\s+/g, ' ').trim() : '';
        const isError = /error|invalid|cannot|failed/i.test(text);
        collectBtn.textContent = isError ? '⚠ ' + text.slice(0, 80) : '✓ Collected!';
        collectBtn.className = isError ? 'nui-btn nui-btn-danger nui-btn-block' : 'nui-btn nui-btn-success nui-btn-block';
        if (!isError) setTimeout(() => renderCollect(), 1500);
    } catch (e) {
        collectBtn.textContent = '⚠ Network error';
        collectBtn.className = 'nui-btn nui-btn-danger nui-btn-block';
    }
});
contentInner.appendChild(collectBtn);
        }

        // ─────────────────────────────────────────────────────────────────────
        // RENDER: HISTORY TAB
        // ─────────────────────────────────────────────────────────────────────
        async function renderHistory() {
            const { doc } = await fetchFC('history');
            const historyData = scrapeHistory(doc);

            contentInner.innerHTML = '';

            if (!historyData) {
                contentInner.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">📜</span>No bet history found.</div>`;
                return;
            }

            const heading = document.createElement('div');
            heading.style.cssText = 'font-family:var(--nui-font-display);font-size:18px;font-weight:800;color:var(--nui-text);margin-bottom:var(--nui-space-3);';
            heading.textContent = `Bet History`;
            contentInner.appendChild(heading);

            const card = document.createElement('div');
            card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);padding:16px 20px;background:var(--nui-surface-2);display:flex;gap:16px;justify-content:space-around;flex-wrap:wrap;text-align:center;';

            const diffText = historyData.differenceHtml.replace(/<[^>]+>/g, '');
            const diffVal = parseInt(diffText.replace(/,/g, '')) || 0;
            const diffColor = diffVal >= 0 ? 'var(--nui-success)' : 'var(--nui-danger)';

            card.innerHTML = `
                <div>
                    <div style="font-size:11px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Bets Placed</div>
                    <div style="font-family:var(--nui-font-display);font-size:22px;font-weight:800;color:var(--nui-text);">${historyData.betsPlaced}</div>
                </div>
                <div>
                    <div style="font-size:11px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Bet Total</div>
                    <div style="font-family:var(--nui-font-display);font-size:22px;font-weight:800;color:var(--nui-text);">${historyData.betTotal}</div>
                </div>
                <div>
                    <div style="font-size:11px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Win Total</div>
                    <div style="font-family:var(--nui-font-display);font-size:22px;font-weight:800;color:var(--nui-accent);">${historyData.winTotal}</div>
                </div>
                <div>
                    <div style="font-size:11px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Difference</div>
                    <div style="font-family:var(--nui-font-display);font-size:22px;font-weight:800;color:${diffColor};">${diffText}</div>
                </div>
            `;

            contentInner.appendChild(card);
        }

        switchTab(activeTab);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ENTRY POINT
    // ─────────────────────────────────────────────────────────────────────────
    let booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        init().catch(showFatalError);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        boot();
    } else {
        document.addEventListener('DOMContentLoaded', boot);
    }

})();
// ==============================================================================
// MODULE 11: NEOPIAN TIMES (SPA OVERHAUL WITH BOOKMARKS)
// ==============================================================================

(function () {
    'use strict';

    if (!/\/ntimes\//.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('ntimes')) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Neopian Times crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    function run() {
        const NeoUI = window.NeoUI;
        if (!NeoUI || !NeoUI.__ready) { throw new Error('NeoUI Core Framework was not found.'); }

        // 1. Scrape profile info using the cache-fallback wrapper
        const profile = NeoUI.scrapeLegacyProfile();

        const weekMatch = document.body.innerHTML.match(/Issue:\s*(\d+)/i) || document.body.innerHTML.match(/week=(\d+)/i);
        const currentWeek = weekMatch ? weekMatch[1] : '';

        // 2. Local Storage Bookmarks State
        let bookmarks = [];
        try {
            bookmarks = JSON.parse(localStorage.getItem('nui_nt_bookmarks') || '[]');
        } catch (e) { bookmarks = []; }

        function saveBookmarks() {
            try { localStorage.setItem('nui_nt_bookmarks', JSON.stringify(bookmarks)); } catch (e) {}
        }

        // 3. Nuke the legacy DOM layout safely
        Array.from(document.body.children).forEach(child => {
            const tag = child.tagName.toLowerCase();
            if (['script', 'style', 'link'].includes(tag)) return;
            if (['panelPopups', 'neoFade', 'colorbox', 'cboxOverlay', 'cboxWrapper'].includes(child.id)) return;
            child.style.display = 'none';
        });

        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';
        document.documentElement.style.webkitTextSizeAdjust = '100%';
        document.documentElement.style.textSizeAdjust = '100%';

        // 4. Initialize NeoUI & Topbar
        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        // 5. Build App View layout
        //
        // Previous versions built this as a fixed, inset:0 shell with a
        // single internal overflow-y:auto scroll box (contentArea), on the
        // theory that pinning the page and giving it exactly one scrollable
        // region would be the most reliable setup. In practice, across
        // several different sizing strategies (flex-basis, then explicit
        // absolute positioning) touch events reached contentArea fine but
        // never actually scrolled it on at least one real engine (Android
        // Firefox) — so the nested-scroll-container approach itself is what
        // isn't cooperating, not any particular sizing method.
        //
        // Simpler and more robust: don't fight the browser for a custom
        // scroll region at all. appWrapper is a normal, in-flow block;
        // contentArea sizes to its content (no overflow-y, no fixed height);
        // and the actual document (html/body) scrolls the ordinary way,
        // same as any other webpage. topRow uses position:sticky so the tab
        // bar still stays put under the global topbar while you scroll,
        // keeping the app-like feel without needing an internal scroller.
        const appWrapper = document.createElement('div');
        appWrapper.id = 'nui-nt-app';
        appWrapper.style.cssText = 'padding-top: var(--nui-topbar-h); box-sizing: border-box; min-height: 100vh;';

        const topRow = document.createElement('div');
        topRow.style.cssText = 'display: flex; align-items: center; background: var(--nui-surface-2); border-bottom: 1px solid var(--nui-border); position: sticky; top: var(--nui-topbar-h); z-index: 10;';

        const tabBar = document.createElement('div');
        tabBar.id = 'nui-nt-tabs';
        tabBar.style.cssText = 'display: flex; gap: 4px; overflow-x: auto; padding: 8px 12px; scrollbar-width: none; flex: 1; min-width: 0; -webkit-overflow-scrolling: touch;';
        topRow.appendChild(tabBar);

        const actionBar = document.createElement('div');
        actionBar.id = 'nui-nt-actionbar';
        actionBar.style.cssText = 'display: none; gap: 8px; padding: 8px 12px; flex-shrink: 0;';
        actionBar.innerHTML = `
            <button type="button" id="nui-nt-bookmark-btn" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding: 6px 10px; display: flex; align-items: center; gap: 4px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            </button>
        `;
        topRow.appendChild(actionBar);
        appWrapper.appendChild(topRow);

        const contentArea = document.createElement('div');
        contentArea.id = 'nui-content-area';
        // No overflow-y, no explicit height — this box is exactly as tall
        // as its content and the page itself scrolls past it. Bottom
        // padding (plus the iOS home-indicator safe area) keeps the last
        // item off the very edge of the screen.
        contentArea.style.cssText = 'padding: var(--nui-space-4); padding-bottom: calc(var(--nui-space-5) + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; align-items: center;';
        appWrapper.appendChild(contentArea);

        document.body.appendChild(appWrapper);


        // 6. Section Configurations
        const SECTIONS = [
            { id: 'home', label: '🏠 Home', path: `/ntimes/index.phtml${currentWeek ? '?week='+currentWeek : ''}` },
            { id: 'articles', label: '📰 Articles', path: `/ntimes/index.phtml?section=articles${currentWeek ? '&week='+currentWeek : ''}` },
            { id: 'editorial', label: '🗣️ Editorial', path: `/ntimes/index.phtml?section=editorial${currentWeek ? '&week='+currentWeek : ''}` },
            { id: 'shorts', label: '📖 Shorts', path: `/ntimes/index.phtml?section=shorts${currentWeek ? '&week='+currentWeek : ''}` },
            { id: 'comics', label: '🎨 Comics', path: `/ntimes/index.phtml?section=comics${currentWeek ? '&week='+currentWeek : ''}` },
            { id: 'series', label: '📚 New Series', path: `/ntimes/index.phtml?section=series${currentWeek ? '&week='+currentWeek : ''}` },
            { id: 'cont', label: '⏭️ Continued', path: `/ntimes/index.phtml?section=cont${currentWeek ? '&week='+currentWeek : ''}` },
            { id: 'poetry', label: '✒️ Poetry', path: `/ntimes/index.phtml?section=poetry${currentWeek ? '&week='+currentWeek : ''}` },
            { id: 'bookmarks', label: '🔖 Bookmarks', path: '#bookmarks' }
        ];

        function renderNav(activeUrl) {
            tabBar.innerHTML = '';
            let activeId = 'home';

            if (activeUrl === '#bookmarks') {
                activeId = 'bookmarks';
            } else if (activeUrl.match(/[?&]section=\d+/)) {
                activeId = null;
            } else {
                const match = activeUrl.match(/[?&]section=([a-z_]+)/i);
                if (match) {
                    const sec = SECTIONS.find(s => s.id === match[1]);
                    if (sec) activeId = sec.id;
                }
            }

            SECTIONS.forEach(sec => {
                const btn = document.createElement('a');
                btn.href = sec.path;
                btn.className = `nui-pill ${activeId === sec.id ? 'is-active' : ''}`;
                btn.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 6px 12px; text-decoration: none; flex-shrink: 0;';
                btn.textContent = sec.label;

                btn.addEventListener('click', e => {
                    e.preventDefault();
                    loadPage(sec.path);
                });

                tabBar.appendChild(btn);
            });
        }

        // 7. Parsers & Layout Engines
        function renderArticle(contentTd) {
            let title = 'The Neopian Times';
            let author = '';
            let bodyHtml = '';

            const h1 = contentTd.querySelector('h1');
            if (h1) title = h1.innerHTML;

            const byMatch = contentTd.innerHTML.match(/by\s+<a[^>]+>([^<]+)<\/a>/i);
            if (byMatch) author = byMatch[1];

            if (contentTd.innerHTML.includes('<!-- BEGIN ARTICLE CONTENT -->')) {
                bodyHtml = contentTd.innerHTML.split('<!-- BEGIN ARTICLE CONTENT -->')[1];
            } else if (contentTd.innerHTML.includes('--------<BR><BR>')) {
                bodyHtml = contentTd.innerHTML.split('--------<BR><BR>')[1];
            } else {
                const imgs = Array.from(contentTd.querySelectorAll('img:not(.story_img)'));
                if (imgs.length > 0) {
                    bodyHtml = imgs.map(img => `<img src="${img.src}" style="max-width:100%; border-radius:var(--nui-radius-sm); margin:0 auto; display:block; box-shadow:0 4px 12px var(--nui-shadow);">`).join('<br><br>');
                } else {
                    bodyHtml = contentTd.innerHTML;
                }
            }

            return `
                <div class="nui-surface" style="border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-5); box-shadow: 0 4px 12px var(--nui-shadow); width: 100%; max-width: 800px;">
                    <div style="font-family: var(--nui-font-display); font-size: 26px; font-weight: 800; color: var(--nui-text); line-height: 1.2;">
                        ${title}
                    </div>
                    ${author ? `<div style="font-size: 14px; font-weight: 700; color: var(--nui-accent); margin-top: 8px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--nui-surface-2);">By ${author}</div>` : ''}
                    <div style="font-size: 15px; line-height: 1.6; color: var(--nui-text); overflow-wrap: break-word;">
                        ${bodyHtml}
                    </div>
                </div>
            `;
        }

        function renderList(contentTd) {
            let html = '<div style="width: 100%; max-width: 800px; display: flex; flex-direction: column;">';

            const h2 = contentTd.querySelector('h2');
            if (h2) {
                html += `<div class="nui-text" style="font-family: var(--nui-font-display); font-size: 24px; font-weight: 800; margin-bottom: 16px;">${h2.textContent}</div>`;
            }

            const items = [];
            contentTd.querySelectorAll('table tr').forEach(tr => {
                const tds = tr.querySelectorAll('td');
                if (tds.length < 2) return;

                const img = tds[0].querySelector('img.story_img');
                const link = tds[1].querySelector('a');
                if (!link) return;

                const title = link.innerHTML;
                const url = link.href;
                const authorMatch = tds[1].innerHTML.match(/by\s+<a[^>]+>([^<]+)<\/a>/i);
                const author = authorMatch ? authorMatch[1] : '';

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = tds[1].innerHTML;
                tempDiv.querySelectorAll('a, b, br, p').forEach(el => el.remove());
                const blurb = tempDiv.textContent.trim().replace(/^by\s+/i, '');

                items.push({ title, url, author, blurb, imgSrc: img ? img.src : '' });
            });

            html += `<div style="display:flex; flex-direction:column; gap:var(--nui-space-3);">`;
            items.forEach(item => {
                html += `
                    <a href="${item.url}" class="nui-item nui-reset" style="text-decoration:none; margin:0; border:1px solid var(--nui-border); border-radius:var(--nui-radius-md); padding:var(--nui-space-3); transition: transform 0.1s; display:flex; gap:16px; align-items:center;">
                        ${item.imgSrc ? `<div style="width:70px; height:70px; border-radius:var(--nui-radius-sm); overflow:hidden; flex-shrink:0; background:var(--nui-surface-2); border:1px solid var(--nui-border); display:flex; align-items:center; justify-content:center;"><img src="${item.imgSrc}" style="width:100%; height:100%; object-fit:cover;"></div>` : ''}
                        <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px;">
                            <div style="font-weight:800; font-size:16px; color:var(--nui-accent); line-height: 1.2;">${item.title}</div>
                            ${item.author ? `<div style="font-size:12px; font-weight:700; color:var(--nui-text-muted);">By <span style="color:var(--nui-text);">${item.author}</span></div>` : ''}
                            ${item.blurb ? `<div class="nui-text-muted" style="font-size:13.5px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-top:2px;">${item.blurb}</div>` : ''}
                        </div>
                    </a>
                `;
            });
            html += `</div></div>`;
            return html;
        }

                        function renderHome(doc) {
            let html = '<div style="width: 100%; max-width: 800px; display: flex; flex-direction: column;">';
            html += `<div class="nui-text" style="font-family: var(--nui-font-display); font-size: 24px; font-weight: 800; margin-bottom: 16px; text-align: center;">Issue ${currentWeek} Highlights</div>`;
            html += `<div style="display:flex; flex-direction:column; gap:8px;">`; // List container

            const seenUrls = new Set();
            const articles = [];

            // A. Scrape Main Content
            const mainContent = doc.querySelector('td.content');
            if (mainContent) {
                mainContent.querySelectorAll('a').forEach(link => {
                    if (!link.textContent.includes('More')) return;
                    const url = link.href;
                    if (seenUrls.has(url) || !url.match(/[?&]section=\d+/)) return;
                    seenUrls.add(url);
                    const container = link.closest('td');
                    if (!container) return;

                    const h1 = container.querySelector('h1');
                    const b = container.querySelector('b');
                    const title = h1 ? h1.textContent.trim() : (b ? b.textContent.replace(/"/g, '').trim() : 'Story');
                    const authorMatch = container.innerHTML.match(/by\s+<a[^>]+>([^<]+)<\/a>/i);
                    const author = authorMatch ? authorMatch[1].trim() : '';
                    const img = container.querySelector('img.story_img');

                    articles.push({ url, title, author, imgSrc: img ? img.src : '', isComic: !!img });
                });
            }

            // B. Scrape Sidebar ("Great Stories")
            const rightBar = doc.querySelector('td.rightBar');
            if (rightBar) {
                rightBar.querySelectorAll('table td').forEach(td => {
                    const titleLink = Array.from(td.querySelectorAll('a')).find(a => a.querySelector('b'));
                    if (!titleLink) return;
                    const url = titleLink.href;
                    if (seenUrls.has(url)) return;
                    seenUrls.add(url);
                    articles.push({
                        url,
                        title: titleLink.textContent.trim(),
                        author: td.querySelector('a[href*="randomfriend"]')?.textContent.trim() || '',
                        imgSrc: td.querySelector('img')?.src || '',
                        isComic: false
                    });
                });
            }

            // C. Build Compact List
            articles.forEach(art => {
                html += `
                    <a href="${art.url}" class="nui-item nui-reset" style="text-decoration:none; margin:0; border:1px solid var(--nui-border); border-radius:var(--nui-radius-md); padding:10px; display:flex; gap:12px; align-items:center; background:var(--nui-surface);">
                        <div style="width:50px; height:50px; border-radius:var(--nui-radius-sm); overflow:hidden; flex-shrink:0; background:var(--nui-surface-2); border:1px solid var(--nui-border); display:flex; align-items:center; justify-content:center;">
                            ${art.imgSrc ? `<img src="${art.imgSrc}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:20px;">📰</span>`}
                        </div>
                        <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:2px;">
                            <div style="font-weight:800; font-size:14px; color:var(--nui-accent); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${art.title}</div>
                            ${art.author ? `<div style="font-size:11px; font-weight:700; color:var(--nui-text-muted);">By <span style="color:var(--nui-text);">${art.author}</span></div>` : ''}
                        </div>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:var(--nui-text-faint);"><path d="M9 5l7 7-7 7"/></svg>
                    </a>
                `;
            });

            html += `</div></div>`;
            return html;
        }




        function renderBookmarksView() {
            let html = '<div style="width: 100%; max-width: 800px; display: flex; flex-direction: column;">';
            html += `<div class="nui-text" style="font-family: var(--nui-font-display); font-size: 24px; font-weight: 800; margin-bottom: 16px;">🔖 Saved Bookmarks</div>`;

            if (bookmarks.length === 0) {
                html += `<div class="nui-empty"><span class="nui-empty-emoji">🔖</span>Your bookmarks ledger is clean.</div>`;
            } else {
                html += `<div style="display:flex; flex-direction:column; gap:var(--nui-space-3);">`;
                bookmarks.forEach((bm, index) => {
                    html += `
                        <div class="nui-item nui-reset" style="margin:0; border:1px solid var(--nui-border); border-radius:var(--nui-radius-md); padding:var(--nui-space-3); display:flex; gap:16px; align-items:center;">
                            <a href="${bm.url}" class="nui-spa-link" style="flex:1; display:flex; flex-direction:column; gap:4px; text-decoration:none;">
                                <div style="font-weight:800; font-size:16px; color:var(--nui-accent); line-height:1.2;">${bm.title}</div>
                                <div style="font-size:12px; font-weight:700; color:var(--nui-text-muted);">${bm.meta || 'Saved Article'}</div>
                            </a>
                            <button type="button" class="nui-btn nui-btn-danger nui-btn-sm btn-del-bookmark" data-index="${index}" style="padding:6px 12px; font-size:11px;">Remove</button>
                        </div>
                    `;
                });
                html += `</div>`;
            }
            html += `</div>`;

            contentArea.innerHTML = html;

            contentArea.querySelectorAll('.btn-del-bookmark').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.getAttribute('data-index'), 10);
                    bookmarks.splice(index, 1);
                    saveBookmarks();
                    renderBookmarksView();
                });
            });
        }

        // Strips inline properties from raw, scraped Neopets markup that can
        // hijack scrolling once it's dropped into our full-page contentArea
        // (leftover overflow/height/position rules from Neopets' own table
        // layout, e.g. the little fixed-height scroll boxes the Editorial
        // section normally lives in). Now that the page itself scrolls
        // rather than an internal contentArea scroll box, this mostly
        // guards against those leftover rules distorting layout (e.g. a
        // stray position:absolute/fixed nested element) rather than
        // fighting for scroll ownership.
        //
        // Also strips inline on* event-handler attributes (onmousedown,
        // ontouchstart, onclick, etc.) — old right-click/drag protection
        // and lightbox hooks Neopets leaves on comic <img>/<a> tags. Unlike
        // <script> tags, on* attributes DO go live the moment they're set
        // via innerHTML, so they're worth clearing out regardless.
        function sanitizeLegacyMarkup(root) {
            root.querySelectorAll('*').forEach(el => {
                el.getAttributeNames().forEach(attr => {
                    if (attr.startsWith('on')) el.removeAttribute(attr);
                });
            });
            root.querySelectorAll('[style]').forEach(el => {
                el.style.removeProperty('overflow');
                el.style.removeProperty('overflow-x');
                el.style.removeProperty('overflow-y');
                el.style.removeProperty('height');
                el.style.removeProperty('max-height');
                el.style.removeProperty('min-height');
                const pos = el.style.position;
                if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') {
                    el.style.removeProperty('position');
                }
            });
            root.querySelectorAll('script, style').forEach(el => el.remove());
        }

        // 8. Core Router Engine
        async function loadPage(url) {
            const isReadingView = !!url.match(/[?&]section=\d+/);
            actionBar.style.display = isReadingView ? 'flex' : 'none';

            if (url === '#bookmarks') {
                renderNav(url);
                renderBookmarksView();
                window.scrollTo(0, 0);
                window.history.pushState({ path: url }, '', url);
                return;
            }

            contentArea.innerHTML = `<div class="nui-empty"><span class="nui-empty-emoji">📰</span><br>Fetching the presses...</div>`;
            renderNav(url);

            try {
                let doc;
                if (url === window.location.href && document.querySelector('td.content')) {
                    doc = document;
                } else {
                    const res = await fetch(url);
                    const html = await res.text();
                    doc = new DOMParser().parseFromString(html, 'text/html');
                }

                const contentTd = doc.querySelector('td.content');
                if (!contentTd) throw new Error("NT content slot not isolated");

                let viewHtml = '';

                if (url.includes('section=editorial')) {
                    contentTd.querySelectorAll('table').forEach(t => t.style.backgroundColor = 'transparent');
                    viewHtml = `<div class="nui-surface" style="border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-5); box-shadow: 0 4px 12px var(--nui-shadow); width: 100%; max-width: 800px; font-size: 15px; line-height: 1.6; color: var(--nui-text);">${contentTd.innerHTML}</div>`;
                } else if (isReadingView) {
                    viewHtml = renderArticle(contentTd);

                    const h1 = contentTd.querySelector('h1');
                    const rawTitle = h1 ? h1.textContent.trim() : 'Neopian Times Piece';
                    const issueMatch = url.match(/[?&]issue=(\d+)/) || currentWeek;
                    const metaLabel = `Issue ${issueMatch ? (Array.isArray(issueMatch) ? issueMatch[1] : issueMatch) : 'Archives'}`;

                    const bmBtn = actionBar.querySelector('#nui-nt-bookmark-btn');
                    const refreshBtnState = () => {
                        const saved = bookmarks.some(b => b.url === url);
                        bmBtn.className = `nui-btn nui-btn-sm ${saved ? 'nui-btn-primary' : 'nui-btn-secondary'}`;
                        bmBtn.querySelector('svg').setAttribute('fill', saved ? 'currentColor' : 'none');
                    };
                    refreshBtnState();

                    const newBmBtn = bmBtn.cloneNode(true);
                    bmBtn.parentNode.replaceChild(newBmBtn, bmBtn);
                    newBmBtn.addEventListener('click', () => {
                        const exists = bookmarks.findIndex(b => b.url === url);
                        if (exists > -1) {
                            bookmarks.splice(exists, 1);
                        } else {
                            bookmarks.push({ title: rawTitle, url: url, meta: metaLabel });
                        }
                        saveBookmarks();
                        const saved = bookmarks.some(b => b.url === url);
                        newBmBtn.className = `nui-btn nui-btn-sm ${saved ? 'nui-btn-primary' : 'nui-btn-secondary'}`;
                        newBmBtn.querySelector('svg').setAttribute('fill', saved ? 'currentColor' : 'none');
                    });

                } else if (url.includes('section=')) {
                    viewHtml = renderList(contentTd);
                } else {
                    viewHtml = renderHome(doc);
                }

                contentArea.innerHTML = viewHtml;

                // Articles/comics/editorials inject raw scraped Neopets markup
                // (contentTd.innerHTML / bodyHtml) straight into contentArea.
                // That legacy HTML carries its own inline overflow/height/
                // position rules from Neopets' old table layout (the Editorial
                // section in particular is normally boxed into a small
                // fixed-height scrolling cell on the real site). Left in place,
                // those hijack the touch-scroll gesture on a nested element
                // before it ever reaches contentArea's own overflow-y:auto,
                // which reads as "the page won't scroll." List/home views never
                // hit this because they're built fresh from scraped text with
                // no legacy markup passed through. Strip the offending inline
                // properties (and any embedded <script>/<style>) from whatever
                // was just injected. contentArea itself no longer scrolls (the
                // page does), but leftover inline height/position rules can
                // still distort layout, so this stays in place.
                sanitizeLegacyMarkup(contentArea);

                contentArea.querySelectorAll('img').forEach(img => {
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = 'var(--nui-radius-sm)';
                });

                window.scrollTo(0, 0);

                if (url !== window.location.href) {
                    window.history.pushState({ path: url }, '', url);
                }

            } catch (err) {
                contentArea.innerHTML = `<div class="nui-empty" style="color: var(--nui-danger);">Failed to load page.</div>`;
            }
        }

        // 9. Event Interceptors
        document.body.addEventListener('click', e => {
            const link = e.target.closest('a');
            if (link && link.href.includes('/ntimes/') && !link.href.includes('submit') && !e.ctrlKey && !e.metaKey && link.target !== '_blank') {
                e.preventDefault();
                loadPage(link.href);
            }
        });

        window.addEventListener('popstate', () => {
            loadPage(window.location.href);
        });

        // Initialize view routing execution
        loadPage(window.location.href);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try { run(); } catch (err) { showFatalError(err); }
    } else {
        document.addEventListener('DOMContentLoaded', () => { try { run(); } catch (err) { showFatalError(err); } });
    }
})();
// ==============================================================================
// MODULE 11: STOCK MARKET (BARGAIN DASHBOARD & QUICK SELL)
// ==============================================================================

(function () {
    'use strict';

    if (!/\/stockmarket\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('stockmarket')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Stock Market SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    // --- State & Settings ---
    let activeTabId = 'portfolio';
    let portfolioData = [];
    let liveStocksData = [];
    let securityToken = '';
    let summaryStats = { holdings: '0', paid: '0', mktValue: '0', pctChange: '0.00%', isPos: false, isNeg: false };

    let sellPoint = parseInt(localStorage.getItem('nui_stock_sell_point'), 10) || 60;
    let bargainPrice = parseInt(localStorage.getItem('nui_stock_bargain_price'), 10) || 15;
    let currentSort = localStorage.getItem('nui_stock_sort') || 'ticker';

    // --- Scraping Logic ---
    function scrapeStocks(doc) {
        // Only clear portfolio if we actually find a portfolio table, otherwise keep existing data
        // (Useful if scraping the background 'buy' page which only has the marquee)
        const isPortfolioPage = doc.querySelector('.stock-table') || doc.querySelector('#postForm table');
        if (isPortfolioPage) portfolioData = [];

        liveStocksData = [];

        // 1. Scrape Security Token
        const refInput = doc.querySelector('input[name="_ref_ck"]');
        if (refInput) securityToken = refInput.value;

        // 2. Scrape Live Prices from Marquee
        const marqueeLinks = doc.querySelectorAll('marquee a');
        marqueeLinks.forEach(a => {
            const text = a.textContent.trim();
            const parts = text.split(' ');
            if (parts.length >= 3) {
                liveStocksData.push({
                    ticker: parts[0],
                    price: parseInt(parts[1], 10),
                    change: parts[2]
                });
            }
        });

        // 3. Scrape Portfolio Holdings (if present)
        const rows = doc.querySelectorAll('#postForm table tr');
        let currentStock = null;

        rows.forEach(row => {
            if (row.hasAttribute('bgcolor') && (row.getAttribute('bgcolor') === '#EEEEFF' || row.getAttribute('bgcolor') === '#FFFFFF')) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 9) {
                    const imgEl = cells[0].querySelector('img[src*=".gif"]');
                    const tickerEl = cells[1].querySelector('a');

                    if (imgEl && tickerEl) {
                        const pctText = cells[8].textContent.trim();
                        currentStock = {
                            ticker: tickerEl.textContent.trim(),
                            icon: imgEl.src,
                            open: parseInt(cells[2].textContent.trim(), 10) || 0,
                            currPrice: parseInt(cells[3].textContent.trim(), 10) || 0,
                            qty: parseInt(cells[5].textContent.replace(/,/g, '').trim(), 10) || 0,
                            paid: cells[6].textContent.trim(),
                            mktValue: cells[7].textContent.trim(),
                            pctChange: pctText,
                            rawPct: parseFloat(pctText.replace(/[%+,]/g, '')),
                            isPos: pctText.includes('+'),
                            isNeg: pctText.includes('-'),
                            lots: []
                        };
                        portfolioData.push(currentStock);
                    }
                }
            } else if (row.hasAttribute('id') && row.style.display === 'none') {
                if (currentStock) {
                    const lotRows = row.querySelectorAll('table tr');
                    for (let i = 1; i < lotRows.length; i++) {
                        const input = lotRows[i].querySelector('input[type="text"]');
                        const cells = lotRows[i].querySelectorAll('td');
                        if (input && input.name && cells.length > 0) {
                            const qtyStr = cells[0].textContent.replace(/,/g, '').trim();
                            currentStock.lots.push({
                                name: input.name,
                                qty: parseInt(qtyStr, 10)
                            });
                        }
                    }
                }
            } else if (row.getAttribute('bgcolor') === '#BBBBBB') {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 5) {
                    const pctText = cells[4].textContent.trim();
                    summaryStats = {
                        holdings: cells[1].textContent.trim(),
                        paid: cells[2].textContent.trim(),
                        mktValue: cells[3].textContent.trim(),
                        pctChange: pctText,
                        isPos: pctText.includes('+'),
                        isNeg: pctText.includes('-')
                    };
                }
            }
        });
    }

    // --- API Calls ---
    async function buyStock(ticker, amount) {
        if (!securityToken) throw new Error('Missing security token.');
        const fd = new URLSearchParams();
        fd.append('_ref_ck', securityToken);
        fd.append('type', 'buy');
        fd.append('ticker_symbol', ticker);
        fd.append('amount_shares', amount);

        const res = await fetch('/process_stockmarket.phtml', { method: 'POST', body: fd });
        const html = await res.text();

        // Scan the raw HTML for success instead of relying on brittle elements
        if (html.toLowerCase().includes('success')) {
            return { ok: true, msg: `Successfully bought ${amount} shares of ${ticker}!` };
        } else {
            return { ok: false, msg: 'Transaction failed. You may have hit your daily limit.' };
        }
    }

    async function sellStock(stock, amountToSell) {
        if (!securityToken) throw new Error('Missing security token.');
        const fd = new URLSearchParams();
        fd.append('_ref_ck', securityToken);
        fd.append('type', 'sell');

        let remaining = amountToSell;
        for (const lot of stock.lots) {
            if (remaining <= 0) break;
            const toSell = Math.min(lot.qty, remaining);
            fd.append(lot.name, toSell);
            remaining -= toSell;
        }

        const res = await fetch('/process_stockmarket.phtml', { method: 'POST', body: fd });
        const html = await res.text();

        // Scan the raw HTML for success
        if (html.toLowerCase().includes('success')) {
            return { ok: true, msg: `Successfully sold ${amountToSell} shares of ${stock.ticker}!` };
        } else {
            return { ok: false, msg: 'Transaction failed.' };
        }
    }

    // Forces a background fetch of the portfolio page specifically, since it holds ALL data (marquee + lots)
    async function refreshData(container) {
        if (container) { container.style.opacity = '0.5'; container.style.pointerEvents = 'none'; }
        try {
            const res = await fetch('/stockmarket.phtml?type=portfolio');
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            scrapeStocks(doc);
            switchTab(activeTabId, false);
        } catch (e) {
            showFatalError(e);
        } finally {
            if (container) { container.style.opacity = '1'; container.style.pointerEvents = 'auto'; }
        }
    }

    // --- Toast Notification ---
    function showToast(msg, isError) {
        const toast = document.createElement('div');
        toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 18px;border-radius:var(--nui-radius-md);font-size:14px;font-weight:700;max-width:90vw;text-align:center;box-shadow:0 4px 16px var(--nui-shadow);background:${isError ? 'var(--nui-danger)' : 'var(--nui-success)'};color:#fff;transition:opacity 0.3s;`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
    }

    // --- UI Builders ---
    function initAppShell() {
        const profile = NeoUI.scrapeLegacyProfile();

        Array.from(document.body.children).forEach(child => {
            if (['script', 'style', 'link'].includes(child.tagName.toLowerCase())) return;
            child.style.display = 'none';
        });

        document.body.className = 'nui-reset nui-spa-active';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        // --- Settings Drawer Injection ---
        NeoUI.registerSettingsSection({
            id: 'stocks',
            title: 'Stock Market',
            render: function (container) {
                container.innerHTML = `
                    <details class="nui-drawer-section">
                        <summary class="nui-drawer-section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                            Stock Market <span style="font-size:10px; opacity:0.5;">▼</span>
                        </summary>
                        <div style="margin-top:10px; display:flex; flex-direction:column; gap:14px;">
                            <label style="display:flex; flex-direction:column; gap:4px; font-size:12px; font-weight:700; color:var(--nui-text);">
                                Bargain Buy Price
                                <div style="font-size:11px; font-weight:400; color:var(--nui-text-muted);">The maximum price shown in your daily bargain feed (Default: 15).</div>
                                <input type="number" id="nui-stk-bargain" class="nui-input" value="${bargainPrice}" style="padding:6px;">
                            </label>
                            <label style="display:flex; flex-direction:column; gap:4px; font-size:12px; font-weight:700; color:var(--nui-text);">
                                Target Sell Point
                                <div style="font-size:11px; font-weight:400; color:var(--nui-text-muted);">Stocks at or above this price will turn gold in your portfolio grid.</div>
                                <input type="number" id="nui-stk-sell" class="nui-input" value="${sellPoint}" style="padding:6px;">
                            </label>
                            <button type="button" class="nui-btn nui-btn-primary nui-btn-block" id="nui-stk-save">Save Settings</button>
                            <span id="nui-stk-status" style="font-size:12px; text-align:center; color:var(--nui-success); display:block;"></span>
                        </div>
                    </details>
                `;
                container.querySelector('#nui-stk-save').addEventListener('click', () => {
                    const bVal = parseInt(container.querySelector('#nui-stk-bargain').value, 10) || 15;
                    const sVal = parseInt(container.querySelector('#nui-stk-sell').value, 10) || 60;
                    localStorage.setItem('nui_stock_bargain_price', bVal);
                    localStorage.setItem('nui_stock_sell_point', sVal);
                    bargainPrice = bVal;
                    sellPoint = sVal;
                    const st = container.querySelector('#nui-stk-status');
                    st.textContent = 'Saved! Settings applied immediately.';
                    setTimeout(() => st.textContent = '', 3500);
                    switchTab(activeTabId, false); // Re-render current view with new settings
                });
            }
        });

        const appWrapper = document.createElement('div');
        appWrapper.id = 'nui-stocks-app';
        appWrapper.style.cssText = 'display: flex; flex-direction: column; height: 100vh; padding-top: var(--nui-topbar-h); box-sizing: border-box;';

        const topRow = document.createElement('div');
        topRow.style.cssText = 'display: flex; align-items: center; background: var(--nui-surface-2); border-bottom: 1px solid var(--nui-border); flex-shrink: 0;';

        const tabBar = document.createElement('div');
        tabBar.id = 'nui-stocks-tabs';
        tabBar.style.cssText = 'display: flex; gap: 4px; overflow-x: auto; padding: 8px 12px; scrollbar-width: none; flex: 1; min-width: 0; -webkit-overflow-scrolling: touch;';

        const tabs = [
            { id: 'portfolio', label: '💼 Portfolio' },
            { id: 'bargains', label: '📈 Buy Bargains' }
        ];

        tabs.forEach(t => {
            const btn = document.createElement('button');
            btn.className = `nui-pill ${activeTabId === t.id ? 'is-active' : ''}`;
            btn.setAttribute('data-tab', t.id);
            btn.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; cursor: pointer; flex-shrink: 0;';
            btn.innerHTML = t.label;
            btn.addEventListener('click', () => switchTab(t.id, true));
            tabBar.appendChild(btn);
        });

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'nui-btn nui-btn-secondary nui-btn-sm';
        refreshBtn.style.cssText = 'margin-right: 12px; padding: 6px 10px; display: flex; align-items: center; gap: 4px;';
        refreshBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
        refreshBtn.addEventListener('click', () => refreshData(document.getElementById('nui-stocks-content')));

        topRow.appendChild(tabBar);
        topRow.appendChild(refreshBtn);
        appWrapper.appendChild(topRow);

        const contentArea = document.createElement('div');
        contentArea.id = 'nui-stocks-content';
        contentArea.style.cssText = 'flex: 1; min-height: 0; overflow-y: auto; padding: var(--nui-space-4); display: flex; flex-direction: column; align-items: center; -webkit-overflow-scrolling: touch;';
        appWrapper.appendChild(contentArea);

        document.body.appendChild(appWrapper);
        return appWrapper;
    }

    function switchTab(id, updateUrl = true) {
        activeTabId = id;

        const tabBar = document.getElementById('nui-stocks-tabs');
        if (tabBar) {
            tabBar.querySelectorAll('.nui-pill').forEach(btn => {
                if (btn.getAttribute('data-tab') === id) btn.classList.add('is-active');
                else btn.classList.remove('is-active');
            });
        }

        const contentArea = document.getElementById('nui-stocks-content');
        if (!contentArea) return;

        if (updateUrl) {
            const path = id === 'portfolio' ? '/stockmarket.phtml?type=portfolio' : '/stockmarket.phtml?type=buy';
            window.history.replaceState(null, '', path);
        }

        contentArea.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: var(--nui-space-4); padding-bottom: 40px;';
        contentArea.appendChild(wrapper);

        // If they navigate directly to 'buy' page, the portfolio data won't exist in memory yet.
        // We trigger a silent refresh so both tabs function seamlessly.
        if (id === 'portfolio' && portfolioData.length === 0 && securityToken) {
            refreshData(contentArea);
            return;
        }

        if (id === 'portfolio') {
            renderPortfolio(wrapper, contentArea);
        } else if (id === 'bargains') {
            renderBargains(wrapper, contentArea);
        }
    }

    function renderPortfolio(wrapper, container) {
        const header = document.createElement('div');
        header.className = 'nui-surface';
        header.style.cssText = 'border: 1px solid var(--nui-border); border-radius: var(--nui-radius-lg); padding: var(--nui-space-4); box-shadow: 0 4px 12px var(--nui-shadow); display: flex; justify-content: space-between; align-items: center;';

        const changeColor = summaryStats.isPos ? 'var(--nui-success)' : summaryStats.isNeg ? 'var(--nui-danger)' : 'var(--nui-text-muted)';

        header.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="font-family: var(--nui-font-display); font-size: 22px; font-weight: 800; color: var(--nui-text);">My Portfolio</div>
                <div style="font-size: 13px; font-weight: 600; color: var(--nui-text-muted);">${summaryStats.holdings} Total Shares</div>
            </div>
            <div style="text-align: right; display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 18px; font-weight: 800; color: var(--nui-text);">${summaryStats.mktValue} NP</div>
                <div style="font-size: 13px; font-weight: 800; color: ${changeColor};">${summaryStats.pctChange}</div>
            </div>
        `;
        wrapper.appendChild(header);

        if (portfolioData.length === 0) {
            wrapper.innerHTML += `<div class="nui-empty"><span class="nui-empty-emoji">🕸️</span><br>Your portfolio is currently empty.</div>`;
            return;
        }

        // --- Sort Controls ---
        const controlsRow = document.createElement('div');
        controlsRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0 4px;';
        controlsRow.innerHTML = `
            <span style="font-size: 13px; font-weight: 700; color: var(--nui-text-muted);">Sort By:</span>
            <select class="nui-input" style="width: auto; padding: 4px 8px; font-size: 13px; font-weight: 700;" id="stk-sort-select">
                <option value="ticker" ${currentSort === 'ticker' ? 'selected' : ''}>Ticker (A-Z)</option>
                <option value="price_desc" ${currentSort === 'price_desc' ? 'selected' : ''}>Current Price (High-Low)</option>
                <option value="pct_desc" ${currentSort === 'pct_desc' ? 'selected' : ''}>% Change (High-Low)</option>
                <option value="qty_desc" ${currentSort === 'qty_desc' ? 'selected' : ''}>Total Shares (High-Low)</option>
            </select>
        `;
        wrapper.appendChild(controlsRow);

        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--nui-space-3); width: 100%;';

        const sortData = (data, type) => {
            return [...data].sort((a, b) => {
                if (type === 'price_desc') return b.currPrice - a.currPrice;
                if (type === 'pct_desc') return (b.isNeg ? -b.rawPct : b.rawPct) - (a.isNeg ? -a.rawPct : a.rawPct);
                if (type === 'qty_desc') return b.qty - a.qty;
                return a.ticker.localeCompare(b.ticker);
            });
        };

        const renderGrid = () => {
            grid.innerHTML = '';
            const sorted = sortData(portfolioData, currentSort);

            sorted.forEach(stock => {
                const card = document.createElement('div');
                card.className = 'nui-surface';

                let borderColor = 'var(--nui-border)';
                let priceColor = 'var(--nui-text)';

                if (stock.currPrice >= sellPoint) {
                    borderColor = 'var(--nui-accent)';
                    priceColor = 'var(--nui-accent)';
                } else if (stock.isPos) {
                    borderColor = 'var(--nui-success)';
                    priceColor = 'var(--nui-success)';
                } else if (stock.isNeg) {
                    borderColor = 'var(--nui-danger)';
                    priceColor = 'var(--nui-danger)';
                }

                card.style.cssText = `
                    border: 2px solid ${borderColor};
                    border-radius: var(--nui-radius-lg);
                    background: var(--nui-surface);
                    padding: var(--nui-space-3);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: transform 0.1s, box-shadow 0.1s;
                    box-shadow: 0 2px 4px var(--nui-shadow);
                `;

                card.innerHTML = `
                    <div style="font-size: 24px; font-family: var(--nui-font-display); font-weight: 800; color: var(--nui-text);">${stock.ticker}</div>
                    <div style="font-size: 20px; font-weight: 800; color: ${priceColor};">${stock.currPrice}</div>
                    <div style="font-size: 12px; font-weight: 700; color: ${stock.isNeg ? 'var(--nui-danger)' : 'var(--nui-success)'}; margin-top: 2px;">${stock.pctChange}</div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--nui-text-muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${stock.qty.toLocaleString()} Shares</div>

                    <div class="nui-stk-expand" style="display: none; width: 100%; margin-top: 12px; padding-top: 12px; border-top: 1px solid ${borderColor}; flex-direction: column; gap: 6px;">
                        <input type="number" class="nui-input" value="${stock.qty}" min="1" max="${stock.qty}" style="width: 100%; text-align: center; padding: 6px; font-size: 13px;">
                        <button type="button" class="nui-btn nui-btn-primary nui-btn-block btn-sell" style="padding: 6px;">Sell</button>
                    </div>
                `;

                // Hover Effects
                card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 6px 12px var(--nui-shadow)'; });
                card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = '0 2px 4px var(--nui-shadow)'; });

                // Tap-to-Expand Logic
                const expandArea = card.querySelector('.nui-stk-expand');
                const sellBtn = card.querySelector('.btn-sell');
                const inputEl = card.querySelector('input');

                card.addEventListener('click', (e) => {
                    if (e.target === sellBtn || e.target === inputEl) return;

                    const isExpanded = expandArea.style.display === 'flex';
                    // Collapse all others first for cleanliness
                    grid.querySelectorAll('.nui-stk-expand').forEach(el => el.style.display = 'none');

                    if (!isExpanded) expandArea.style.display = 'flex';
                });

                // Execute Sell
                sellBtn.addEventListener('click', async () => {
                    const amount = parseInt(inputEl.value, 10);
                    if (isNaN(amount) || amount <= 0 || amount > stock.qty) {
                        showToast('Invalid sell amount.', true);
                        return;
                    }
                    sellBtn.textContent = '...';
                    sellBtn.disabled = true;

                    try {
                        const result = await sellStock(stock, amount);
                        showToast(result.msg, !result.ok);
                        if (result.ok) await refreshData(container);
                        else { sellBtn.textContent = 'Sell'; sellBtn.disabled = false; }
                    } catch (err) {
                        showToast('Network error.', true);
                        sellBtn.textContent = 'Sell'; sellBtn.disabled = false;
                    }
                });

                grid.appendChild(card);
            });
        };

        renderGrid();
        wrapper.appendChild(grid);

        // Bind Sort Change
        controlsRow.querySelector('#stk-sort-select').addEventListener('change', (e) => {
            currentSort = e.target.value;
            localStorage.setItem('nui_stock_sort', currentSort);
            renderGrid();
        });
    }

    function renderBargains(wrapper, container) {
        const header = document.createElement('div');
        header.className = 'nui-text';
        header.style.cssText = 'font-family: var(--nui-font-display); font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 8px;';
        header.textContent = 'Daily Bargains';
        wrapper.appendChild(header);

        // Filter based on the Custom Bargain Settings
        const bargains = liveStocksData.filter(s => s.price >= 10 && s.price <= bargainPrice).sort((a, b) => a.price - b.price);

        if (bargains.length === 0) {
            wrapper.innerHTML += `<div class="nui-empty"><span class="nui-empty-emoji">📉</span><br>No stocks currently priced at or below ${bargainPrice} NP.</div>`;
            return;
        }

        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--nui-space-3);';

        bargains.forEach(b => {
            const card = document.createElement('div');
            card.className = 'nui-surface';
            card.style.cssText = 'border: 1px solid var(--nui-border); border-radius: var(--nui-radius-md); padding: var(--nui-space-4); display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 6px var(--nui-shadow);';

            const changeColor = b.change.includes('+') ? 'var(--nui-success)' : b.change.includes('-') ? 'var(--nui-danger)' : 'var(--nui-text-muted)';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-family: var(--nui-font-display); font-size: 24px; font-weight: 800; color: var(--nui-text);">${b.ticker}</div>
                    <div style="text-align: right;">
                        <div style="font-size: 18px; font-weight: 800; color: var(--nui-text);">${b.price} NP</div>
                        <div style="font-size: 12px; font-weight: 800; color: ${changeColor};">${b.change}</div>
                    </div>
                </div>
                <button type="button" class="nui-btn nui-btn-secondary nui-btn-block btn-buy">Buy 1,000 (${(b.price * 1000).toLocaleString()} NP)</button>
            `;

            const buyBtn = card.querySelector('.btn-buy');
            buyBtn.addEventListener('click', async () => {
                buyBtn.textContent = 'Buying...';
                buyBtn.disabled = true;

                try {
                    const result = await buyStock(b.ticker, 1000);
                    showToast(result.msg, !result.ok);
                    if (result.ok) {
                        buyBtn.style.background = 'var(--nui-success)';
                        buyBtn.style.color = '#fff';
                        buyBtn.textContent = 'Purchased!';
                    } else {
                        buyBtn.textContent = `Buy 1,000 (${(b.price * 1000).toLocaleString()} NP)`;
                        buyBtn.disabled = false;
                    }
                } catch (err) {
                    showToast('Network error.', true);
                    buyBtn.textContent = `Buy 1,000 (${(b.price * 1000).toLocaleString()} NP)`;
                    buyBtn.disabled = false;
                }
            });

            grid.appendChild(card);
        });

        wrapper.appendChild(grid);
    }

    // --- Boot ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try {
            scrapeStocks(document);
            const app = initAppShell();
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('type') === 'buy') switchTab('bargains', false);
            else switchTab('portfolio', false);
        } catch (err) { showFatalError(err); }
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                scrapeStocks(document);
                const app = initAppShell();
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('type') === 'buy') switchTab('bargains', false);
                else switchTab('portfolio', false);
            } catch (err) { showFatalError(err); }
        });
    }

})();
// ==============================================================================
// MODULE 12: COCONUT SHY (HEADLESS SPA WRAPPER)
// ==============================================================================

(function () {
    'use strict';

    if (!/\/halloween\/coconutshy\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('coconut-shy')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Coconut Shy SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    let throwCount = 0;

    // Inject custom animation styles for the throw
    const style = document.createElement('style');
    style.textContent = `
        @keyframes nui-shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .nui-shake { animation: nui-shake 0.3s cubic-bezier(.36,.07,.19,.97) both; animation-iteration-count: infinite; }
    `;
    document.head.appendChild(style);

    // --- API Calls ---
    async function throwCoconut() {
        const coconutId = Math.floor(Math.random() * 5) + 1;
        const url = `/halloween/process_cocoshy.phtml?coconut=${coconutId}&_=${Date.now()}`;

        const res = await fetch(url, { method: 'POST' });
        const text = await res.text();
        const params = new URLSearchParams(text);

        return {
            points: parseInt(params.get('points') || '0', 10),
            totalNp: params.get('totalnp') || null,
            success: params.get('success') === '1',
            error: params.get('error') || '',
            item: params.get('item') || null
        };
    }

    function updateLiveNP(newNpStr) {
        if (!newNpStr) return;
        const npNum = parseInt(newNpStr, 10);
        if (isNaN(npNum)) return;

        const npElements = document.querySelectorAll('.nui-topbar-stats span, #npanchor, .nui-badge');
        npElements.forEach(el => {
            if (el.textContent.includes('NP') || !isNaN(parseInt(el.textContent.replace(/,/g, '')))) {
                if (!el.innerHTML.includes('<')) {
                    el.textContent = npNum.toLocaleString();
                }
            }
        });
    }

    // --- UI Builders ---
    function initAppShell() {
        const profile = NeoUI.scrapeLegacyProfile();

        Array.from(document.body.children).forEach(child => {
            if (['script', 'style', 'link'].includes(child.tagName.toLowerCase())) return;
            child.style.display = 'none';
        });

        document.body.className = 'nui-reset nui-spa-active';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        const appWrapper = document.createElement('div');
        appWrapper.id = 'nui-cocoshy-app';
        appWrapper.style.cssText = 'display: flex; flex-direction: column; height: 100vh; padding-top: var(--nui-topbar-h); box-sizing: border-box; align-items: center; background: var(--nui-bg); overflow-y: auto;';

        const contentArea = document.createElement('div');
        contentArea.style.cssText = 'width: 100%; max-width: 600px; padding: var(--nui-space-4); display: flex; flex-direction: column; gap: var(--nui-space-4);';

        appWrapper.appendChild(contentArea);
        document.body.appendChild(appWrapper);
        return contentArea;
    }

    function renderDashboard(container) {
        const dashboard = document.createElement('div');
        dashboard.className = 'nui-surface';
        dashboard.style.cssText = 'border: 1px solid var(--nui-border); border-radius: var(--nui-radius-lg); overflow: hidden; box-shadow: 0 4px 16px var(--nui-shadow); text-align: center; display: flex; flex-direction: column; align-items: center; background: var(--nui-surface);';

        dashboard.innerHTML = `
            <div id="coco-stage" style="width: 100%; height: 150px; border-bottom: 2px solid var(--nui-border); background: var(--nui-surface-2);">
                <img src="https://images.neopets.com/games/clicktoplay/screenshot_fullsize_490_1_v1.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%;">
            </div>



                <div style="font-family: var(--nui-font-display); font-size: 32px; font-weight: 800; color: var(--nui-text);">Coconut Shy</div>
                <div style="font-size: 14px; color: var(--nui-text-muted); font-weight: 600; margin-bottom: 12px;">100 NP per throw. Knock one down to win a prize!</div>

                <div id="coco-result-box" style="width: 80%; min-height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--nui-radius-md); background: var(--nui-surface-2); border: 1px solid var(--nui-border); font-size: 15px; font-weight: 700; color: var(--nui-text-muted); padding: 12px; transition: all 0.2s;">
                    <span>Ready to throw.</span>
                </div>

                <button type="button" id="btn-throw" class="nui-btn nui-btn-primary" style="font-size: 18px; padding: 16px 32px; border-radius: 30px; width: 100%; max-width: 300px; margin-top: 16px; box-shadow: 0 4px 12px var(--nui-shadow);">
                    Throw (100 NP)
                </button>
                <div id="throw-counter" style="margin-top: 12px; font-size: 12px; color: var(--nui-text-faint); font-weight: 700;">Throws this session: 0</div>
            </div>
        `;

        container.appendChild(dashboard);

        const btnThrow = dashboard.querySelector('#btn-throw');
        const resultBox = dashboard.querySelector('#coco-result-box');
        const cocoStage = dashboard.querySelector('#coco-stage');
        const counterEl = dashboard.querySelector('#throw-counter');

        btnThrow.addEventListener('click', async () => {
            btnThrow.disabled = true;
            btnThrow.textContent = 'Aiming...';


            resultBox.style.background = 'var(--nui-surface-2)';
            resultBox.style.borderColor = 'var(--nui-border)';
            resultBox.style.color = 'var(--nui-text-muted)';
            resultBox.innerHTML = `<span>Winding up...</span>`;

            try {
                const res = await throwCoconut();

                if (res.totalNp) updateLiveNP(res.totalNp);


                if (res.error) {
                    cocoStage.style.borderColor = 'var(--nui-danger)';
                    resultBox.style.background = 'rgba(239, 68, 68, 0.05)';
                    resultBox.style.borderColor = 'var(--nui-danger)';
                    resultBox.style.color = 'var(--nui-danger)';
                    resultBox.innerHTML = `<span>${res.error}</span>`;

                    if (res.error.toLowerCase().includes('no more') || res.error.toLowerCase().includes('had yer lot')) {
                        btnThrow.textContent = 'Out of Throws';
                        btnThrow.style.background = 'var(--nui-surface-2)';
                        btnThrow.style.color = 'var(--nui-text-muted)';
                        // Sync timer to midnight NST (approximate: next midnight PST)
                        try {
                            const now = new Date();
                            const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
                            const msTilMidnight = ((23 - pst.getHours()) * 3600 + (59 - pst.getMinutes()) * 60 + (60 - pst.getSeconds())) * 1000;
                            window.NeoUI.syncDailyTimer('coconut-shy', msTilMidnight);
                        } catch (e) {}
                        return;
                    }
                } else if (res.points === 10000) {
                    cocoStage.style.borderColor = 'var(--nui-success)';
                    cocoStage.style.background = 'rgba(16, 185, 129, 0.1)';

                    resultBox.style.background = 'rgba(16, 185, 129, 0.1)';
                    resultBox.style.borderColor = 'var(--nui-success)';
                    resultBox.style.color = 'var(--nui-success)';

                    let winText = `JACKPOT! You exploded the coconut!<br>Won 10,000 NP`;
                    if (res.item) winText += `<br><span style="color: var(--nui-text); font-size: 13px;">Also received: ${res.item}</span>`;

                    resultBox.innerHTML = winText;

                } else if (res.points === 300) {
                    cocoStage.style.borderColor = 'var(--nui-success)';
                    resultBox.style.background = 'rgba(16, 185, 129, 0.05)';
                    resultBox.style.borderColor = 'var(--nui-success)';
                    resultBox.style.color = 'var(--nui-success)';
                    resultBox.innerHTML = `<span>You knocked it down! Won 300 NP.</span>`;

                } else if (res.points === 50) {
                    cocoStage.style.borderColor = 'var(--nui-accent)';
                    resultBox.style.color = 'var(--nui-accent)';
                    resultBox.innerHTML = `<span>You hit it, but it just wobbled. Won 50 NP.</span>`;

                } else {
                    cocoStage.style.borderColor = 'var(--nui-border)';
                    resultBox.style.color = 'var(--nui-text)';
                    resultBox.innerHTML = `<span>You completely missed!</span>`;
                }

                throwCount++;
                counterEl.textContent = `Throws this session: ${throwCount}`;
                btnThrow.textContent = 'Throw Again (100 NP)';
                btnThrow.disabled = false;

            } catch (err) {
                cocoStage.style.borderColor = 'var(--nui-danger)';
                resultBox.style.borderColor = 'var(--nui-danger)';
                resultBox.style.color = 'var(--nui-danger)';
                resultBox.innerHTML = `<span>Network error. Try again.</span>`;
                btnThrow.textContent = 'Throw (100 NP)';
                btnThrow.disabled = false;
            }
        });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try { const container = initAppShell(); renderDashboard(container); } catch (err) { showFatalError(err); }
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            try { const container = initAppShell(); renderDashboard(container); } catch (err) { showFatalError(err); }
        });
    }

})();
// ==============================================================================
// MODULE 13: BURIED TREASURE (HEADLESS SPA WRAPPER)
// ==============================================================================
// Activates on: /pirates/buriedtreasure/index.phtml and
//               /pirates/buriedtreasure/buriedtreasure.phtml
//
// The legacy flow spans four different server-rendered states glued together
// by a plain HTML ISMAP: an intro/story screen with a "Play" button, a
// pick-a-spot map, a post-dig cooldown screen, and (unsampled here, but
// certain to exist) a win/lose result screen. All four are scraped from
// whatever `document`/fetch response is on hand and re-rendered as one
// mobile-forward card, with the whole loop — Play, pick a spot, get a
// result — staying inside the SPA via fetch() instead of full page loads.
// ==============================================================================

(function () {
    'use strict';

    if (!/\/pirates\/buriedtreasure\//.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('buried-treasure')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Buried Treasure SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    const DAILY_TIMERS_KEY = 'neoui_daily_timers_v1';
    const TIMER_ID = 'buried-treasure';

    // ─────────────────────────────────────────────────────────────────────────
    // Keep the shared Daily Timer Hub in sync with the real server cooldown,
    // instead of relying on the person remembering to tap "done" over there
    // too — we already know the exact minutes remaining from this page.
    // ─────────────────────────────────────────────────────────────────────────
    function syncTimer(msFromNow) {
        try {
            const raw = localStorage.getItem(DAILY_TIMERS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(parsed) ? parsed : [];
            let entry = list.find(function (item) { return item && item.id === TIMER_ID; });
            if (!entry) { entry = { id: TIMER_ID }; list.push(entry); }
            entry.nextAt = Date.now() + msFromNow;
            localStorage.setItem(DAILY_TIMERS_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    function formatClock(msLeft) {
        const totalSec = Math.max(0, Math.ceil(msLeft / 1000));
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = function (n) { return String(n).padStart(2, '0'); };
        return pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCRAPERS — figure out which of the four server states `doc` holds
    // ─────────────────────────────────────────────────────────────────────────
    function scrapeState(doc, baseUrl) {
        const content = doc.querySelector('td.content') || doc.body;
        const raw = content.innerHTML;
        const jackpotMatch = raw.match(/Cumulative Jackpot[^0-9]*([\d,]+)\s*NP/i);
        const jackpot = jackpotMatch ? jackpotMatch[1] : null;

        // Cooldown: "Sorry, you have to wait NNN minutes to play again"
        const waitMatch = raw.match(/wait another\s*(\d+)\s*minutes/i);
        if (waitMatch) {
            const petImg = content.querySelector('img[src*="/cpn/"]') || content.querySelector('img');
            return {
                type: 'cooldown',
                minutes: parseInt(waitMatch[1], 10),
                petImage: petImg ? new URL(petImg.getAttribute('src'), baseUrl).href : null,
            };
        }

        // Ready state: the intro story + "Click to Play!" submit button
        const playForm = Array.prototype.find.call(content.querySelectorAll('form'), function (f) {
            return /buriedtreasure\.phtml/i.test(f.getAttribute('action') || '');
        });
        if (playForm) {
            const submitBtn = playForm.querySelector('input[type="submit"]');
            if (submitBtn && /click to play/i.test(submitBtn.value || '')) {
                return {
                    type: 'ready',
                    playAction: new URL(playForm.getAttribute('action'), baseUrl).href,
                };
            }
        }

        // Map state: an ISMAP image wrapped in an <a>
        const mapAnchor = Array.prototype.find.call(content.querySelectorAll('a'), function (a) {
            return a.querySelector('img[ismap], img[ISMAP]');
        });
        if (mapAnchor) {
            const img = mapAnchor.querySelector('img');
            return {
                type: 'map',
                jackpot: jackpot,
                mapImg: new URL(img.getAttribute('src'), baseUrl).href,
                mapAction: new URL(mapAnchor.getAttribute('href'), baseUrl).href,
                naturalWidth: parseInt(img.getAttribute('width'), 10) || 540,
                naturalHeight: parseInt(img.getAttribute('height'), 10) || 550,
            };
        }

       // Result state: a "[pet] pulls out a ticket... and..." narration line,
// then a table whose first row holds the win/lose headline (e.g. "You
// Won Nothing :(" or "You Won 5,000 NP!") spanning both columns, and a
// second row with the pet's picture next to the prize (or blank scroll)
// picture. A closing italic line offers encouragement either way.
const table = content.querySelector('table');
const scope = table || content;
const images = Array.prototype.map.call(scope.querySelectorAll('img'), function (img) {
    return {
        src: new URL(img.getAttribute('src'), baseUrl).href,
        alt: (img.getAttribute('alt') || '').trim(),
    };
});
const headlineCell = table ? table.querySelector('td[colspan], td[bgcolor], th') : null;
const headline = headlineCell ? headlineCell.textContent.replace(/\s+/g, ' ').trim() : null;
const narrationP = Array.prototype.find.call(content.querySelectorAll('p'), function (p) {
    return /pulls out a ticket/i.test(p.textContent);
});
const narration = narrationP ? narrationP.textContent.replace(/\s+/g, ' ').trim() : null;
const flavorEl = content.querySelector('i');
const flavor = flavorEl ? flavorEl.textContent.replace(/\s+/g, ' ').trim() : null;

return {
    type: 'result',
    narration: narration,
    headline: headline,
    flavor: flavor,
    images: images,
};
    }

    async function fetchState(url) {
        const res = await fetch(url, { credentials: 'include' });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return scrapeState(doc, url);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHARED CHROME — hero banner reused across every state
    // ─────────────────────────────────────────────────────────────────────────
    function buildBanner() {
        const banner = document.createElement('div');
        banner.className = 'nui-surface';
        banner.style.cssText = 'border-radius:var(--nui-radius-lg);border:1px solid var(--nui-border);overflow:hidden;box-shadow:0 4px 12px var(--nui-shadow);position:relative;';
        banner.innerHTML = `
            <div style="position:relative;width:100%;height:110px;overflow:hidden;background:linear-gradient(135deg,#0B2B2E 0%,#124A44 50%,#0B2B2E 100%);display:flex;align-items:center;gap:14px;padding:0 var(--nui-space-4);">
                <img src="https://images.neopets.com/pirates/map_frontpg.gif"
                     style="width:74px;height:74px;border-radius:var(--nui-radius-md);border:2px solid rgba(255,255,255,0.25);object-fit:cover;flex-shrink:0;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));background:#fff;"
                     onerror="this.style.display='none'">
                <div>
                    <div style="font-family:var(--nui-font-display);font-weight:800;font-size:26px;color:#FFD060;text-shadow:0 2px 8px rgba(0,0,0,0.6);line-height:1.1;">Buried Treasure</div>
                    <div style="font-size:12.5px;color:rgba(180,255,225,0.9);font-weight:600;margin-top:3px;text-shadow:0 1px 3px rgba(0,0,0,0.5);">Treasure of the Black Pawkeet · once every 3 hours</div>
                </div>
            </div>
        `;
        return banner;
    }

    function backToKrawkButton() {
        const btn = document.createElement('a');
        btn.href = '/pirates/index.phtml';
        btn.className = 'nui-btn nui-btn-secondary nui-btn-block';
        btn.style.cssText = 'text-decoration:none;display:block;box-sizing:border-box;';
        btn.textContent = '← Back to Krawk Island';
        return btn;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE RENDERERS
    // ─────────────────────────────────────────────────────────────────────────
    let clockInterval = null;
    function clearClock() {
        if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
    }

    function renderReady(wrapper, state) {
        clearClock();
        wrapper.innerHTML = '';
        wrapper.appendChild(buildBanner());

        const card = document.createElement('div');
        card.className = 'nui-surface';
        card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-lg);padding:var(--nui-space-5) var(--nui-space-4);box-shadow:0 4px 12px var(--nui-shadow);text-align:center;display:flex;flex-direction:column;align-items:center;gap:var(--nui-space-3);';
        card.innerHTML = `
            <div style="font-size:15px;color:var(--nui-text-muted);line-height:1.5;max-width:420px;">
                Somewhere on Krawk Island, the old pirate Bloodhook's treasure is
                still waiting for someone to dig it up. Pick a square on the map
                and see if fortune's on your side.
            </div>
            <button type="button" id="bt-play-btn" class="nui-btn nui-btn-primary" style="font-size:16px;padding:14px 28px;border-radius:30px;width:100%;max-width:300px;box-shadow:0 4px 12px var(--nui-shadow);">
                Dig for Treasure (300 NP)
            </button>
        `;
        wrapper.appendChild(card);
        wrapper.appendChild(backToKrawkButton());

        card.querySelector('#bt-play-btn').addEventListener('click', async function () {
            const btn = this;
            btn.disabled = true;
            btn.textContent = 'Setting sail...';
            try {
                const next = await fetchState(state.playAction);
                renderState(wrapper, next);
            } catch (err) {
                showFatalError(err);
                btn.disabled = false;
                btn.textContent = 'Dig for Treasure (300 NP)';
            }
        });
    }

    function renderMap(wrapper, state) {
        clearClock();
        wrapper.innerHTML = '';
        wrapper.appendChild(buildBanner());

        const card = document.createElement('div');
        card.className = 'nui-surface';
        card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-lg);padding:var(--nui-space-4);box-shadow:0 4px 12px var(--nui-shadow);display:flex;flex-direction:column;align-items:center;gap:var(--nui-space-3);';

        const jackpotHtml = state.jackpot
            ? '<span class="nui-badge nui-badge-accent" style="font-size:12px;padding:5px 12px;">💰 Jackpot: ' + state.jackpot + ' NP</span>'
            : '';

        card.innerHTML = `
            ${jackpotHtml}
            <div style="font-size:14px;font-weight:700;color:var(--nui-text);text-align:center;">Where do <em>you</em> think it's buried?</div>
            <div id="bt-map-wrap" style="position:relative;width:100%;max-width:480px;border-radius:var(--nui-radius-md);overflow:hidden;border:1px solid var(--nui-border);cursor:crosshair;">
                <img id="bt-map-img" src="${state.mapImg}" style="display:block;width:100%;height:auto;">
            </div>
            <div style="font-size:12px;color:var(--nui-text-faint);">Tap anywhere on the map to dig there.</div>
        `;
        wrapper.appendChild(card);
        wrapper.appendChild(backToKrawkButton());

        const mapImg = card.querySelector('#bt-map-img');
        const mapWrap = card.querySelector('#bt-map-wrap');
        let locked = false;

        mapImg.addEventListener('click', async function (e) {
            if (locked) return;
            locked = true;

            const rect = mapImg.getBoundingClientRect();
            const scaleX = state.naturalWidth / rect.width;
            const scaleY = state.naturalHeight / rect.height;
            const x = Math.round((e.clientX - rect.left) * scaleX);
            const y = Math.round((e.clientY - rect.top) * scaleY);

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;';
            overlay.textContent = 'Digging...';
            mapWrap.style.position = 'relative';
            mapWrap.appendChild(overlay);

            try {
                const digUrl = state.mapAction + '?' + x + ',' + y;
                const next = await fetchState(digUrl);
                renderState(wrapper, next);
            } catch (err) {
                overlay.remove();
                locked = false;
                showFatalError(err);
            }
        });
    }

    function renderCooldown(wrapper, state) {
        clearClock();
        wrapper.innerHTML = '';
        wrapper.appendChild(buildBanner());

        const targetAt = Date.now() + state.minutes * 60 * 1000;
        syncTimer(state.minutes * 60 * 1000);

        const card = document.createElement('div');
        card.className = 'nui-surface';
        card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-lg);padding:var(--nui-space-5) var(--nui-space-4);box-shadow:0 4px 12px var(--nui-shadow);text-align:center;display:flex;flex-direction:column;align-items:center;gap:var(--nui-space-3);';
        card.innerHTML = `
            ${state.petImage ? '<img src="' + state.petImage + '" style="width:120px;height:120px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);object-fit:cover;">' : ''}
            <div style="font-size:15px;font-weight:700;color:var(--nui-text);">You've already tried your luck this round.</div>
            <div id="bt-clock" style="font-family:var(--nui-font-display);font-size:32px;font-weight:800;color:var(--nui-accent);letter-spacing:1px;">${formatClock(targetAt - Date.now())}</div>
            <div style="font-size:12px;color:var(--nui-text-faint);">until you can dig again</div>
            <button type="button" id="bt-retry-btn" class="nui-btn nui-btn-secondary" style="width:100%;max-width:260px;" disabled>Not ready yet</button>
        `;
        wrapper.appendChild(card);
        wrapper.appendChild(backToKrawkButton());

        const clockEl = card.querySelector('#bt-clock');
        const retryBtn = card.querySelector('#bt-retry-btn');

        clockInterval = setInterval(function () {
            const remaining = targetAt - Date.now();
            if (remaining <= 0) {
                clockEl.textContent = '00:00:00';
                retryBtn.disabled = false;
                retryBtn.textContent = 'Check Again';
                clearClock();
                return;
            }
            clockEl.textContent = formatClock(remaining);
        }, 1000);

        retryBtn.addEventListener('click', async function () {
            retryBtn.disabled = true;
            retryBtn.textContent = 'Checking...';
            try {
                const next = await fetchState(new URL('index.phtml', location.href).href);
                renderState(wrapper, next);
            } catch (err) {
                showFatalError(err);
                retryBtn.disabled = false;
                retryBtn.textContent = 'Check Again';
            }
        });
    }

    function renderResult(wrapper, state) {
    clearClock();
    wrapper.innerHTML = '';
    wrapper.appendChild(buildBanner());

    const headline = state.headline || 'The tide has come in — check back later.';
    const isWin = !/nothing/i.test(headline);
    const images = state.images || [];

    const imagesHtml = images.length
        ? '<div style="display:flex;gap:var(--nui-space-3);justify-content:center;flex-wrap:wrap;">' +
            images.map(function (im) {
                return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">' +
                    '<img src="' + im.src + '" style="width:110px;height:110px;object-fit:contain;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);background:var(--nui-surface-alt,#f4f4f4);">' +
                    (im.alt ? '<div style="font-size:11px;color:var(--nui-text-faint);max-width:110px;text-align:center;">' + im.alt + '</div>' : '') +
                    '</div>';
            }).join('') +
          '</div>'
        : '';

    const card = document.createElement('div');
    card.className = 'nui-surface';
    card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-lg);padding:var(--nui-space-5) var(--nui-space-4);box-shadow:0 4px 12px var(--nui-shadow);text-align:center;display:flex;flex-direction:column;align-items:center;gap:var(--nui-space-3);';
    card.innerHTML = `
        ${isWin ? '<span class="nui-badge nui-badge-success" style="font-size:12px;padding:5px 12px;">🎉 Treasure Found</span>' : '<span class="nui-badge" style="font-size:12px;padding:5px 12px;">🌊 Empty-Handed</span>'}
        ${state.narration ? '<div style="font-size:14px;font-weight:600;color:var(--nui-text-muted);line-height:1.5;">' + state.narration + '</div>' : ''}
        ${imagesHtml}
        <div style="font-family:var(--nui-font-display);font-size:19px;font-weight:800;color:${isWin ? 'var(--nui-success, #16a34a)' : 'var(--nui-text)'};line-height:1.4;">${headline}</div>
        ${state.flavor ? '<div style="font-size:13px;font-style:italic;color:var(--nui-text-faint);">' + state.flavor + '</div>' : ''}
        <button type="button" id="bt-refresh-btn" class="nui-btn nui-btn-secondary" style="width:100%;max-width:260px;">Refresh</button>
    `;
    wrapper.appendChild(card);
    wrapper.appendChild(backToKrawkButton());

    card.querySelector('#bt-refresh-btn').addEventListener('click', async function () {
        const btn = this;
        btn.disabled = true;
        btn.textContent = 'Refreshing...';
        try {
            const next = await fetchState(new URL('index.phtml', location.href).href);
            renderState(wrapper, next);
        } catch (err) {
            showFatalError(err);
            btn.disabled = false;
            btn.textContent = 'Refresh';
        }
    });
}

    function renderState(wrapper, state) {
        if (state.type === 'ready') return renderReady(wrapper, state);
        if (state.type === 'map') return renderMap(wrapper, state);
        if (state.type === 'cooldown') return renderCooldown(wrapper, state);
        return renderResult(wrapper, state);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────────────────────
    async function init() {
        const profile = NeoUI.scrapeLegacyProfile();
        const initialState = scrapeState(document, location.href);

        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        const wrapper = document.createElement('div');
        wrapper.className = 'nui-reset';
        wrapper.style.cssText = 'padding: calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5); max-width: 560px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        document.body.appendChild(wrapper);

        renderState(wrapper, initialState);
    }

    let booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        init().catch(showFatalError);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        boot();
    } else {
        document.addEventListener('DOMContentLoaded', boot);
    }

})();
// ==============================================================================
// MODULE 13: FAERIE QUEST WATCHER (SITEWIDE)
// ==============================================================================
// Neopets shows a "new_quest_pushdown" banner at the top of ANY page right
// after a faerie quest gets accepted (random event or a Fortune-Cookie
// guaranteed accept) — it's not tied to /quests.phtml. This watches for it
// wherever it appears and remembers what's being asked for, so the info is
// available even if you're nowhere near the Faerie Quests page when it fires.
(function () {
    'use strict';

    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('faerie-quests')) return;

    const STATE_KEY = 'neoui_faerie_quest_state';

    function saveState(state) {
        try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:999999;padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;max-width:90vw;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.3);background:#7a4fd6;color:#fff;transition:opacity 0.3s;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function () { toast.style.opacity = '0'; setTimeout(function () { toast.remove(); }, 300); }, 5000);
    }

    function parsePushdown(root) {
        if (!root) return null;
        const p = (root.classList && root.classList.contains('new_quest_pushdown')) ? root : (root.querySelector ? root.querySelector('.new_quest_pushdown') : null);
        if (!p) return null;
        // Strip the trading post / auction / SDB quick-search links before
        // reading the text, so they don't get mixed into the dialogue.
        const clone = p.cloneNode(true);
        const helper = clone.querySelector('.search-helper');
        if (helper) helper.remove();
        const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
        const itemEl = p.querySelector('b');
        const item = itemEl ? itemEl.textContent.trim() : '';
        if (!item) return null;
        // Dialogue reads like: "Hello." Iridesia says with a big, radiant
        // smile. "If you have a moment...` — pull the name out of `X says`.
        const nameMatch = text.match(/"\s*([A-Z][a-zA-Z' -]{1,30}?)\s+says\b/);
        const faerie = nameMatch ? nameMatch[1].trim() : 'A faerie';
        return { faerie: faerie, item: item };
    }

    function handleDetected(info) {
        try {
            const prevRaw = localStorage.getItem(STATE_KEY);
            const prev = prevRaw ? JSON.parse(prevRaw) : null;
            // The banner can re-render more than once for the same event;
            // don't re-toast for an identical detection moments apart.
            if (prev && prev.item === info.item && prev.faerie === info.faerie && (Date.now() - (prev.capturedAt || 0)) < 10000) return;
        } catch (e) {}
        saveState({ faerie: info.faerie, item: info.item, capturedAt: Date.now() });
        showToast('🧚 ' + info.faerie + ' wants: ' + info.item);
    }

    function start() {
        const observer = new MutationObserver(function (mutations) {
            for (let i = 0; i < mutations.length; i++) {
                const added = mutations[i].addedNodes;
                for (let j = 0; j < added.length; j++) {
                    const node = added[j];
                    if (node.nodeType !== 1) continue;
                    const info = parsePushdown(node);
                    if (info) { handleDetected(info); return; }
                }
            }
        });
        try { observer.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
        // Covers the case where it's already present the moment this runs.
        try {
            const info = parsePushdown(document.body);
            if (info) handleDetected(info);
        } catch (e) {}
    }

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
})();
// ==============================================================================
// MODULE 14: FAERIE QUESTS (HEADLESS ENHANCEMENT ON /quests.phtml)
// ==============================================================================
// Leaves the native quest panel and its Abandon/Complete buttons completely
// untouched (they already work fine and submit through the site's own
// #fq2_form) — this only adds a compact card above it with the item
// image(s), a link straight to a Safety Deposit Box search for the item, a
// Trading Post / Auction lookup, and a "copy name" button for pasting into a
// Neoboard post to ask around. Faerie quest items are NOT Shop Wizard or
// Super Shop Wizard searchable — Neopets blocks that lookup for quest items
// specifically — so no SW/SSW link is offered here; don't add one back in.
(function () {
    'use strict';

    if (!/^\/quests\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('faerie-quests')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;

    const STATE_KEY = 'neoui_faerie_quest_state';

    function saveState(state) {
        try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    function clearState() {
        try { localStorage.removeItem(STATE_KEY); } catch (e) {}
    }

    function buildSearchLinks(itemName) {
        const enc = encodeURIComponent(itemName);
        return [
            { label: 'My SDB', href: 'https://www.neopets.com/safetydeposit.phtml?obj_name=' + enc + '&category=0' },
            { label: 'Trading Post', href: 'https://www.neopets.com/island/tradingpost.phtml?type=browse&criteria=item_exact&search_string=' + enc },
            { label: 'Auction', href: 'https://www.neopets.com/genie.phtml?type=process_genie&criteria=exact&auctiongenie=' + enc }
        ];
    }

    function copyItemName(itemName, btn) {
        function done(ok) {
            const original = '📋 Copy name';
            btn.textContent = ok ? '✓ Copied' : '✗ Copy failed';
            setTimeout(function () { btn.textContent = original; }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(itemName).then(function () { done(true); }, function () { done(false); });
            return;
        }
        // Fallback for contexts without the async Clipboard API.
        try {
            const ta = document.createElement('textarea');
            ta.value = itemName;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            ta.remove();
            done(ok);
        } catch (e) { done(false); }
    }

    function run() {
        const fq2 = document.getElementById('fq2');
        if (!fq2 || document.getElementById('nui-faerie-quick')) return;

        const descTop = fq2.querySelector('.description_top');
        const itemCells = fq2.querySelectorAll('.images .item');
        const completeBtn = fq2.querySelector('#complete_faerie_quest');
        const isActive = !!(descTop && itemCells.length);

        if (!isActive) { clearState(); return; }

        const descText = (descTop.textContent || '').replace(/\s+/g, ' ').trim();
        const faerieMatch = descText.match(/quest for the ([^.]+?)\.?\s*(Return|You've|$)/);
        const faerie = faerieMatch ? faerieMatch[1].trim() : 'a faerie';
        const items = Array.prototype.map.call(itemCells, function (cell) {
            const b = cell.querySelector('b');
            const img = cell.querySelector('img');
            return { name: b ? b.textContent.trim() : 'Unknown item', icon: img ? img.src : '' };
        });

        saveState({ faerie: faerie, item: items.map(function (i) { return i.name; }).join(', '), readyToComplete: !!completeBtn, capturedAt: Date.now() });

        const card = document.createElement('div');
        card.id = 'nui-faerie-quick';
        card.style.cssText = 'max-width:600px; margin:12px auto; padding:14px 16px; border-radius:var(--nui-radius-lg); border:1px solid var(--nui-border); background:var(--nui-surface); box-shadow:0 2px 10px var(--nui-shadow);';
        let html = '<div style="font-weight:800; font-size:14px; margin-bottom:8px; color:var(--nui-text);">🧚 Quest for ' + faerie +
            (completeBtn ? ' <span style="color:var(--nui-success); font-weight:700; font-size:12px;">· ready to turn in</span>' : '') + '</div>';
        items.forEach(function (item) {
            const links = buildSearchLinks(item.name);
            html += '<div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-top:1px solid var(--nui-border); flex-wrap:wrap;">' +
                (item.icon ? '<img src="' + item.icon + '" style="width:32px; height:32px; border-radius:6px; flex-shrink:0;">' : '') +
                '<div style="flex:1; min-width:80px; font-weight:700; font-size:13px; color:var(--nui-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + item.name + '</div>' +
                links.map(function (l) { return '<a href="' + l.href + '" target="_blank" rel="noopener" style="font-size:11px; font-weight:700; padding:4px 8px; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); text-decoration:none; color:var(--nui-accent); white-space:nowrap;">' + l.label + '</a>'; }).join('') +
                '<button type="button" class="nui-faerie-copy-btn" data-copy-item="' + item.name.replace(/"/g, '&quot;') + '" style="font-size:11px; font-weight:700; padding:4px 8px; border-radius:var(--nui-radius-pill); border:1px solid var(--nui-border); background:var(--nui-accent-soft); color:var(--nui-accent); cursor:pointer; white-space:nowrap;">📋 Copy name</button>' +
                '</div>';
        });
        card.innerHTML = html;
        fq2.parentNode.insertBefore(card, fq2);
        card.querySelectorAll('[data-copy-item]').forEach(function (btn) {
            btn.addEventListener('click', function () { copyItemName(this.getAttribute('data-copy-item'), this); });
        });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        try { run(); } catch (e) {}
    } else {
        document.addEventListener('DOMContentLoaded', function () { try { run(); } catch (e) {} });
    }
})();
// ==============================================================================
// MODULE 15: NEOUI HOMEPAGE DASHBOARD (WITH EDITORS)
// ==============================================================================
(function () {
    'use strict';

    if (!/\/home\/(index\.phtml)?$/.test(location.pathname)) return;

    // Don't run if user is not logged in — let them see the normal login page
    const isLoggedIn = !!(
        document.getElementById('npanchor') ||
        document.querySelector('a[href^="/userlookup.phtml?user="]') ||
        document.querySelector('[id^="navprofiledropdown__"]')
    );
    if (!isLoggedIn) return;

    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('home')) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Homepage Dashboard crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    function isSnowagerAsleep() {
        const ptHour = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })).getHours();
        return ptHour === 6 || ptHour === 14 || ptHour === 22;
    }

    // --- GLOBAL ACTIONS ---
    window.nuiChangeActivePet = function(petName) {
        if (!petName) return;

        let refCk = '';
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const content = scripts[i].innerHTML;
            const ckMatch = content.match(/_ref_ck['"]?\s*:\s*['"]([a-f0-9]+)['"]/i) ||
                            content.match(/getCK\(\)\s*\{\s*return\s*['"]([a-f0-9]+)['"]/i);
            if (ckMatch) {
                refCk = ckMatch[1];
                break;
            }
        }

        if (!refCk) {
            alert('Could not find security token (_ref_ck).');
            return;
        }

        fetch('/np-templates/ajax/changepet.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: '_ref_ck=' + encodeURIComponent(refCk) + '&new_active_pet=' + encodeURIComponent(petName)
        }).then(res => res.json()).then(data => {
            if (data.status === 'success') window.location.reload();
            else alert('Failed to change pet: ' + (data.error || 'Unknown error'));
        }).catch(err => {
            console.error('Pet change error:', err);
            window.location.reload();
        });
    };

    // --- EDITOR MODAL SYSTEM ---
    window.nuiOpenLinkEditor = function(type) {
        const isDailies = type === 'dailies';
        const storageKey = isDailies ? 'neoui_home_dailies' : 'neoui_home_quicklinks';
        const title = isDailies ? 'Edit Dailies' : 'Edit Quick Links';

        const CURATED_DAILIES = [
            // — Freebies —
            { name: 'Anchor Management', url: '/pirates/anchormanagement.phtml', icon: '🦑', group: 'Freebies' },
            { name: 'Apple Bobbing', url: '/halloween/applebobbing.phtml', icon: '🍎', group: 'Freebies' },
            { name: 'Bank Interest', url: '/bank.phtml', icon: '🏦', group: 'Freebies' },
            { name: 'Buried Treasure', url: '/pirates/buriedtreasure/index.phtml', icon: '🗺️', group: 'Freebies' },
            { name: 'Coconut Shy', url: '/halloween/coconutshy.phtml', icon: '🥥', group: 'Freebies' },
            { name: 'Coltzan\'s Shrine', url: '/desert/shrine.phtml', icon: '🏜️', group: 'Freebies' },
            { name: 'Dark Cave', url: '/magma/darkcave.phtml', icon: '🌑', group: 'Freebies' },
            { name: 'Deserted Tomb', url: '/worlds/geraptiku/tomb.phtml', icon: '⚰️', group: 'Freebies' },
            { name: 'Faerie Crossword', url: '/games/crossword/index.phtml', icon: '📝', group: 'Freebies' },
            { name: 'Faerie Quests', url: '/quests.phtml', icon: '🧚', group: 'Freebies' },
            { name: 'Forgotten Shore', url: '/pirates/forgottenshore.phtml', icon: '🏖️', group: 'Freebies' },
            { name: 'Fruit Machine', url: '/desert/fruitmachine.phtml', icon: '🎰', group: 'Freebies' },
            { name: 'Giant Jelly', url: '/jelly/jelly.phtml', icon: '🍮', group: 'Freebies' },
            { name: 'Giant Omelette', url: '/prehistoric/omelette.phtml', icon: '🍳', group: 'Freebies' },
            { name: 'Grave Danger', url: '/halloween/gravedanger/', icon: '💀', group: 'Freebies' },
            { name: 'Grumpy Old King', url: '/medieval/grumpyking.phtml', icon: '👑', group: 'Freebies' },
            { name: 'Healing Springs', url: '/faerieland/springs.phtml', icon: '⛲', group: 'Freebies' },
            { name: 'Kiko Pop', url: '/worlds/kiko/kpop/', icon: '🎈', group: 'Freebies' },
            { name: 'Lab Ray', url: '/lab2.phtml', icon: '⚡', group: 'Freebies' },
            { name: 'Lunar Temple', url: '/shenkuu/lunar/', icon: '🌙', group: 'Freebies' },
            { name: 'Meteor', url: '/moon/meteor.phtml', icon: '☄️', group: 'Freebies' },
            { name: 'Moltara Quarry', url: '/magma/quarry.phtml', icon: '🪨', group: 'Freebies' },
            { name: 'Mysterious Negg Cave', url: '/shenkuu/neggcave/', icon: '🥚', group: 'Freebies' },
            { name: 'Petpet Lab Ray', url: '/petpetlab.phtml', icon: '🔬', group: 'Freebies' },
            { name: 'Rich Slorg', url: '/shop_of_offers.phtml?slorg_payout=yes', icon: '🐌', group: 'Freebies' },
            { name: 'Tombola', url: '/island/tombola.phtml', icon: '🎟️', group: 'Freebies' },
            { name: 'Trudy\'s Surprise', url: '/trudys_surprise.phtml', icon: '🎁', group: 'Freebies' },
            { name: 'Underwater Fishing', url: '/water/fishing.phtml', icon: '🎣', group: 'Freebies' },
            // — Wheels —
            { name: 'Wheel of Excitement', url: '/faerieland/wheel.phtml', icon: '🎡', group: 'Wheels' },
            { name: 'Wheel of Extravagance', url: '/desert/extravagance.phtml', icon: '🎡', group: 'Wheels' },
            { name: 'Wheel of Knowledge', url: '/medieval/knowledge.phtml', icon: '🎡', group: 'Wheels' },
            { name: 'Wheel of Mediocrity', url: '/prehistoric/mediocrity.phtml', icon: '🎡', group: 'Wheels' },
            { name: 'Wheel of Misfortune', url: '/halloween/wheel/index.phtml', icon: '🎡', group: 'Wheels' },
            { name: 'Wheel of Monotony', url: '/prehistoric/monotony/monotony.phtml', icon: '🎡', group: 'Wheels' },
            { name: 'Wheel of Starlight (Premium)', url: '/premium/wheel.phtml', icon: '⭐', group: 'Wheels' },
            // — Training —
            { name: 'Mystery Island Training School', url: '/island/training.phtml', icon: '⚔️', group: 'Training' },
            { name: 'Secret Ninja Training School', url: '/island/fight_training.phtml', icon: '🥷', group: 'Training' },
            { name: 'Swashbuckling Academy', url: '/pirates/academy.phtml', icon: '⚓', group: 'Training' },
        ];

        let currentData = [];
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) currentData = JSON.parse(raw);
        } catch (e) {}

        // Fallbacks if empty
        if (!currentData || currentData.length === 0) {
            if (isDailies) {
                currentData = [
                    { name: 'Buried Treasure', url: '/pirates/buriedtreasure/index.phtml', icon: '🗺️' },
                    { name: 'Coconut Shy', url: '/halloween/coconutshy.phtml', icon: '🥥' },
                    { name: 'Faerie Quests', url: '/quests.phtml', icon: '🧚' },
                    { name: 'Lab Ray', url: '/lab2.phtml', icon: '⚡' },
                    { name: 'Trudy\'s Surprise', url: '/trudys_surprise.phtml', icon: '🎁' }
                ];
            } else {
                currentData = [
                    { name: 'Inventory', url: '/inventory.phtml', icon: '🎒' },
                    { name: 'Bank', url: '/bank.phtml', icon: '🏦' },
                    { name: 'Shop Wizard', url: '/market.phtml?type=wizard', icon: '🪄' },
                    { name: 'Neoboards', url: '/neoboards/index.phtml', icon: '💬' },
                    { name: 'Trading Post', url: '/island/tradingpost.phtml', icon: '📜' },
                    { name: 'Food Club', url: '/pirates/foodclub.phtml?type=bet', icon: '🍗' }
                ];
            }
        }

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px);';

        const modal = document.createElement('div');
        modal.className = 'nui-surface';
        modal.style.cssText = 'width:90%; max-width:600px; max-height:90vh; overflow-y:auto; border-radius:var(--nui-radius-lg); padding:var(--nui-space-4); display:flex; flex-direction:column; gap:var(--nui-space-3); border:1px solid var(--nui-border); box-shadow: 0 10px 25px rgba(0,0,0,0.2);';

        const titleEl = document.createElement('div');
        titleEl.style.cssText = 'font-size:20px; font-weight:800; border-bottom:1px solid var(--nui-border); padding-bottom:8px;';
        titleEl.textContent = title;
        modal.appendChild(titleEl);

        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'display:flex; flex-direction:column; gap:8px; margin-bottom:12px;';

        function renderList() {
            listContainer.innerHTML = '';
            currentData.forEach((item, index) => {
                const row = document.createElement('div');
                row.className = 'nui-edit-row';
                row.style.cssText = 'display:flex; gap:8px; align-items:center; background:var(--nui-surface-2); padding:8px; border-radius:var(--nui-radius-sm); border:1px solid var(--nui-border);';

                if (isDailies) {
                    // Curated Dailies just show the text and a delete button
                    row.innerHTML = `
                        <div style="width:30px; text-align:center; font-size:18px;">${item.icon || '📌'}</div>
                        <div style="flex:1; font-weight:700; color:var(--nui-text);">${item.name}</div>
                        <button class="nui-btn nui-btn-red nui-btn-sm" style="padding:4px 8px; background:var(--nui-danger-soft); color:var(--nui-danger); border:none;" onclick="this.parentElement.remove()">🗑️</button>
                    `;
                    row.setAttribute('data-icon', item.icon || '📌');
                    row.setAttribute('data-name', item.name);
                    row.setAttribute('data-url', item.url);
                } else {
                    // Quick Links get the free-text inputs
                    row.innerHTML = `
                        <input type="text" class="nui-input" value="${item.icon || ''}" placeholder="Emoji" style="width:50px; text-align:center;">
                        <input type="text" class="nui-input" value="${item.name || ''}" placeholder="Name" style="flex:1; min-width:100px;">
                        <input type="text" class="nui-input" value="${item.url || ''}" placeholder="/url.phtml" style="flex:2; min-width:150px;">
                        <button class="nui-btn nui-btn-red nui-btn-sm" style="padding:4px 8px; background:var(--nui-danger-soft); color:var(--nui-danger); border:none;" onclick="this.parentElement.remove()">🗑️</button>
                    `;
                }
                listContainer.appendChild(row);
            });
        }
        renderList();
        modal.appendChild(listContainer);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; gap:8px; justify-content:space-between; margin-top:8px; align-items:center;';

        if (isDailies) {
            const addWrap = document.createElement('div');
            addWrap.style.cssText = 'display:flex; gap:8px; flex:1;';

            const select = document.createElement('select');
            select.className = 'nui-select';
            select.style.flex = '1';

            const groups = {};
            CURATED_DAILIES.forEach((d, i) => {
                const g = d.group || 'Other';
                if (!groups[g]) groups[g] = [];
                groups[g].push({ d, i });
            });
            Object.entries(groups).forEach(([groupName, entries]) => {
                const og = document.createElement('optgroup');
                og.label = groupName;
                entries.forEach(({ d, i }) => {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = `${d.icon} ${d.name}`;
                    og.appendChild(opt);
                });
                select.appendChild(og);
            });

            const addBtn = document.createElement('button');
            addBtn.className = 'nui-btn nui-btn-secondary';
            addBtn.textContent = '+ Add';
            addBtn.onclick = () => {
                const selectedDaily = CURATED_DAILIES[select.value];
                const existing = Array.from(listContainer.children).find(row => row.getAttribute('data-name') === selectedDaily.name);
                if (!existing) {
                    currentData.push({ ...selectedDaily });
                    renderList();
                } else {
                    alert('This daily is already in your list!');
                }
            };

            addWrap.appendChild(select);
            addWrap.appendChild(addBtn);
            btnRow.appendChild(addWrap);
        } else {
            const addBtn = document.createElement('button');
            addBtn.className = 'nui-btn nui-btn-secondary';
            addBtn.textContent = '+ Add Custom Link';
            addBtn.onclick = () => {
                currentData.push({ icon: '🔗', name: 'New Link', url: '/' });
                renderList();
            };
            btnRow.appendChild(addBtn);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'display:flex; gap:8px;';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'nui-btn nui-btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => overlay.remove();

        const saveBtn = document.createElement('button');
        saveBtn.className = 'nui-btn nui-btn-primary';
        saveBtn.textContent = 'Save Changes';
        saveBtn.onclick = () => {
            const rows = listContainer.children;
            const newData = [];
            for (let i = 0; i < rows.length; i++) {
                if (isDailies) {
                    newData.push({
                        icon: rows[i].getAttribute('data-icon'),
                        name: rows[i].getAttribute('data-name'),
                        url: rows[i].getAttribute('data-url')
                    });
                } else {
                    const inputs = rows[i].querySelectorAll('input');
                    newData.push({
                        icon: inputs[0].value.trim(),
                        name: inputs[1].value.trim(),
                        url: inputs[2].value.trim()
                    });
                }
            }
            localStorage.setItem(storageKey, JSON.stringify(newData));
            overlay.remove();
            window.location.reload();
        };

        actionsDiv.appendChild(cancelBtn);
        actionsDiv.appendChild(saveBtn);
        btnRow.appendChild(actionsDiv);

        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    };

    // ── Smart greeting based on NST hour ─────────────────────────────────────
    function getGreeting(name) {
        const h = new Date().getHours();
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];

        // ~15% chance of a random Neopets wild card regardless of time
        if (Math.random() < 0.15) {
            return pick([
                `The Snowager is watching you, ${name}. 👁️`,
                `Fyora smiles upon you today, ${name}. 🧚`,
                `The Lab Ray is charged and ready, ${name}. ⚡`,
                `How about a trip to Kreludor, ${name}. 🌕`,
                `Don't forget your omelette, ${name}. 🍳`,
                `The Kadoaties are hungry, ${name}. 😿`,
                `Dr. Sloth has his eye on you, ${name}. 🧪`,
                `Coltzan's Shrine awaits, ${name}. ⛏️`,
                `A faerie quest could strike at any moment, ${name}. 🧚‍♀️`,
                `Today feels like a Wheel of Extravagance day, ${name}. 🎡`,
                `The Pant Devil is lurking, ${name}. 😈`,
                `Have you fed your Kadoatie today, ${name}? 🐱`,
                `The Coincidence has something for you, ${name}. 🔮`,
                `Meuka is somewhere in those woods, ${name}. 🤧`,
            ]);
        }

        if (h >= 0 && h < 4) return pick([
            `Up late, ${name}? 🌙`,
            `Still going, ${name}? 🦉`,
            `Burning the midnight oil, ${name}? 🕯️`,
            `Graveyard shift on Neopets, ${name}? 👻`,
        ]);

        if (h >= 4 && h < 7) return pick([
            `Early bird, ${name}! 🌅`,
            `You're up before the Neopets servers, ${name}. 🐓`,
            `Rise and shine, ${name}! ☀️`,
            `Beating the dailies rush, ${name}? 🏃`,
            `Up with the Pteris, ${name}! 🦅`,
        ]);

        if (h >= 7 && h < 12) return pick([
            `Good morning, ${name}! ☀️`,
            `Morning! Don't forget your dailies, ${name}. 📋`,
            `A fresh day in Neopia, ${name}! 🌄`,
            `The omelette's still warm, ${name}. 🍳`,
            `Good morning! Fyora's in a good mood today, ${name}. 🧚`,
        ]);

        if (h >= 12 && h < 14) return pick([
            `Good afternoon, ${name}! 🌤️`,
            `Lunchtime in Neopia, ${name}! 🍜`,
            `Halfway through the day, ${name}. Keep going! 💪`,
            `Afternoon! The Fruit Machine awaits, ${name}. 🎰`,
            `High noon in Neopia, ${name}! 🌞`,
        ]);

        if (h >= 14 && h < 18) return pick([
            `Hey there, ${name}! 👋`,
            `Afternoon slump? Neopets fixes that, ${name}. ☕`,
            `Welcome back, ${name}! 🏠`,
            `Good to see you, ${name}! ✨`,
            `The Battledome calls, ${name}! ⚔️`,
        ]);

        if (h >= 18 && h < 21) return pick([
            `Good evening, ${name}! 🌆`,
            `Evening! Did you grab your dailies, ${name}? 📅`,
            `The Haunted Woods are lovely this time of night, ${name}. 🎃`,
            `Winding down with Neopets, ${name}? 🌇`,
            `Evening in Neopia, ${name}. The best time to play. 🌙`,
        ]);

        return pick([
            `Winding down, ${name}? 🌙`,
            `Late night Neopets, ${name}? Classic. 🌌`,
            `Almost midnight in Neopia, ${name}. 🕚`,
            `Night owl energy, ${name}. 🦉`,
            `The Wheel of Monotony is still spinning somewhere, ${name}. 🎡`,
        ]);
    }

    // ── NST Clock helpers ────────────────────────────────────────────────────
    function getNSTDate() {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    }
    function formatNST(d) {
        const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 || 12;
        return `${hh}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ampm} NST`;
    }

    // ── Training scraper (inline, no module dependency) ──────────────────────
    function scrapeTrainingStatus(doc, school) {
        const pets = [];
        const rows = doc.querySelectorAll('table[align="center"] tr');
        let i = 0;
        while (i < rows.length) {
            const headerTd = rows[i] && rows[i].querySelector('td[bgcolor="#efefef"]');
            if (!headerTd) { i++; continue; }
            const headerText = headerTd.textContent.trim();
            const m = headerText.match(/^(.+?)\s+\(Level\s+(\d+)\)\s+(.*)/);
            if (!m) { i++; continue; }
            const name = m[1].trim();
            const statusText = m[3].trim();
            const onCourse = statusText.startsWith('is currently studying');
            const courseSubject = onCourse ? statusText.replace('is currently studying', '').trim() : null;
            let courseFinished = false, totalSeconds = 0, codestonesNeeded = [];
            const dataRow = rows[i + 1];
            if (dataRow) {
                const actionTd = dataRow.querySelectorAll('td')[1];
                if (actionTd) {
                    const txt = actionTd.textContent.trim();
                    if (txt.includes('Course Finished')) courseFinished = true;
                    const tm = txt.match(/(\d+)\s*hrs?,?\s*(\d+)\s*minutes?,?\s*(\d+)\s*seconds?/i);
                    if (tm) totalSeconds = (parseInt(tm[1]) * 3600) + (parseInt(tm[2]) * 60) + parseInt(tm[3]);
                    // Codestones OR dubloons (pirate academy uses dubloon coins)
                    actionTd.querySelectorAll('b').forEach(b => {
                        const t = b.textContent.trim();
                        if (t.includes('Codestone') || t.includes('Dubloon')) codestonesNeeded.push(t);
                    });
                }
            }
            pets.push({ name, onCourse, courseSubject, courseFinished, totalSeconds, codestonesNeeded, school: school || 'Mystery Island' });
            i += 2;
        }
        return pets;
    }

    // ── Card builder helper ──────────────────────────────────────────────────
    function nuiCard(extraStyle) {
        const el = document.createElement('div');
        el.className = 'nui-surface';
        el.style.cssText = 'border-radius: var(--nui-radius-lg); border: 1px solid var(--nui-border); padding: var(--nui-space-4); box-shadow: 0 4px 12px var(--nui-shadow); display: flex; flex-direction: column; gap: var(--nui-space-3);' + (extraStyle || '');
        return el;
    }
    function cardHeader(title, actionHtml) {
        return `<div style="font-family:var(--nui-font-display);font-size:20px;font-weight:800;color:var(--nui-text);border-bottom:1px solid var(--nui-border);padding-bottom:8px;display:flex;justify-content:space-between;align-items:center;"><span>${title}</span>${actionHtml || ''}</div>`;
    }
    function accordionWrap(summaryHtml, bodyHtml, open) {
        return `<details${open ? ' open' : ''} style="border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);overflow:hidden;"><summary style="cursor:pointer;padding:10px 12px;font-size:13px;font-weight:700;color:var(--nui-text-muted);user-select:none;list-style:none;display:flex;justify-content:space-between;align-items:center;background:var(--nui-surface-2);">${summaryHtml}<span style="font-size:11px;opacity:0.5;">▾</span></summary><div style="padding:10px 12px;display:flex;flex-direction:column;gap:8px;">${bodyHtml}</div></details>`;
    }
    function dailyRow(icon, name, subtitle, url, btnLabel, btnClass) {
        return `<a href="${url}" style="display:flex;align-items:center;justify-content:space-between;padding:9px 10px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);background:var(--nui-surface);text-decoration:none;color:var(--nui-text);transition:background var(--nui-dur-fast) var(--nui-ease);"><span style="display:flex;align-items:center;gap:10px;min-width:0;"><span style="font-size:18px;flex-shrink:0;">${icon}</span><span style="display:flex;flex-direction:column;gap:1px;min-width:0;"><span style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</span>${subtitle ? `<span style="font-size:11px;color:var(--nui-text-muted);">${subtitle}</span>` : ''}</span></span><span class="nui-btn ${btnClass || 'nui-btn-secondary'} nui-btn-sm" style="padding:4px 10px;font-size:11px;flex-shrink:0;pointer-events:none;">${btnLabel || 'Go'}</span></a>`;
    }

    // --- MAIN RUNNER ---
    async function run() {
        const NeoUI = window.NeoUI;
        if (!NeoUI || !NeoUI.__ready) {
            throw new Error('NeoUI Core Framework was not found.');
        }

        // 1. DATA SCRAPING — must happen before the DOM nuke
        // The home page is H5-converted; use scrapeLegacyProfile for user/NP/NC
        // (it reads navprofiledropdown__ and npanchor/ncanchor which H5 always has),
        // then scrape pet data from the H5 carousel data attributes.
        const profile = NeoUI.scrapeLegacyProfile();
        const username = profile.username || 'Neopian';
        const activeStats = { np: profile.np || '0', nc: profile.nc || '0' };

        const pets = [];
        // Try H5 carousel first (data-* attributes)
        document.querySelectorAll('.hp-carousel-pet, [data-name][data-species], [class*="carousel"] [data-petimage]').forEach(el => {
            const name = el.getAttribute('data-name');
            if (!name || pets.find(p => p.name === name)) return;
            pets.push({
                name,
                species: el.getAttribute('data-species') || '',
                color: el.getAttribute('data-color') || '',
                level: el.getAttribute('data-level') || '?',
                health: el.getAttribute('data-health') || '?',
                maxhealth: el.getAttribute('data-maxhealth') || '?',
                image: el.getAttribute('data-petimage') || profile.petImage,
                active: el.getAttribute('data-active') === 'true',
                petpet: el.getAttribute('data-petpet') || null,
                petpetimg: el.getAttribute('data-petpetimg') || null
            });
        });

        // Fallback: build a stub from the profile cache when carousel yields nothing
        if (!pets.length && profile.petname) {
            pets.push({
                name: profile.petname,
                species: '', color: '', level: '?', health: '?', maxhealth: '?',
                image: profile.petImage, active: true, petpet: null, petpetimg: null
            });
        }

        const activeNameEl = document.querySelector('[id^="navProfilePet__"] a, .profile-dropdown-link');
        const activePetName = activeNameEl ? activeNameEl.textContent.trim() : profile.petname;
        let activePet = pets.find(p => p.active) || pets.find(p => p.name === activePetName) || pets[0];
        const inactivePets = pets.filter(p => p.name !== (activePet ? activePet.name : ''));

        // Load stored data
        let savedDailies = [], quickLinks = [];
        try {
            const rawDailies = localStorage.getItem('neoui_home_dailies');
            if (rawDailies) savedDailies = JSON.parse(rawDailies);
            else savedDailies = [
                { name: 'Trudy\'s Surprise', url: '/trudys_surprise.phtml', icon: '🎁' },
                { name: 'Healing Springs', url: '/faerieland/springs.phtml', icon: '⛲' },
                { name: 'Giant Omelette', url: '/prehistoric/omelette.phtml', icon: '🍳' },
                { name: 'Giant Jelly', url: '/jelly/jelly.phtml', icon: '🍮' },
                { name: 'Faerie Crossword', url: '/games/crossword/index.phtml', icon: '📝' },
                { name: 'Lab Ray', url: '/lab2.phtml', icon: '⚡' },
                { name: 'Fruit Machine', url: '/desert/fruitmachine.phtml', icon: '🎰' },
                { name: 'Anchor Management', url: '/pirates/anchormanagement.phtml', icon: '🦑' },
                { name: 'Wheel of Excitement', url: '/faerieland/wheel.phtml', icon: '🎡' },
                { name: 'Wheel of Mediocrity', url: '/prehistoric/mediocrity.phtml', icon: '🎡' },
                { name: 'Wheel of Misfortune', url: '/halloween/wheel/index.phtml', icon: '🎡' }
            ];

            const rawLinks = localStorage.getItem('neoui_home_quicklinks');
            if (rawLinks) quickLinks = JSON.parse(rawLinks);
            else quickLinks = [
                { name: 'Quest Log', url: '/questlog/', icon: '📋' },
                { name: 'Bank', url: '/bank.phtml', icon: '🏦' },
                { name: 'Shop Wizard', url: '/market.phtml?type=wizard', icon: '🪄' },
                { name: 'Neoboards', url: '/neoboards/index.phtml', icon: '💬' },
                { name: 'Trading Post', url: '/island/tradingpost.phtml', icon: '📜' },
                { name: 'Food Club', url: '/pirates/foodclub.phtml?type=bet', icon: '🍗' }
            ];
        } catch (e) {}

        // 2. NUKE THE DOM
        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        // 3. INIT TOPBAR
        NeoUI.init();
        NeoUI.buildTopbar({ stats: activeStats, username: username, hasNotification: profile.hasNotification || false });
        NeoUI.setProfileInfo(profile);

        // 4. BUILD LAYOUT
        const pageWrapper = document.createElement('div');
        pageWrapper.id = 'nui-home-app';
        pageWrapper.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5);box-sizing:border-box;gap:var(--nui-space-4);';

        // ── Hero banner ──────────────────────────────────────────────────────
        const heroBanner = document.createElement('div');
        heroBanner.style.cssText = 'width:100%;max-width:960px;border-radius:var(--nui-radius-lg);background:linear-gradient(135deg,var(--nui-accent-soft),var(--nui-surface-2));border:1px solid var(--nui-border);padding:16px 20px;display:flex;flex-direction:column;gap:10px;box-shadow:0 4px 12px var(--nui-shadow);';

        const heroBannerTop = document.createElement('div');
        heroBannerTop.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;';
        heroBannerTop.innerHTML = `
            <div>
                <div style="font-family:var(--nui-font-display);font-size:22px;font-weight:800;color:var(--nui-text);line-height:1.2;">${getGreeting(username)}</div>
                <div id="nui-nst-clock" style="font-size:13px;color:var(--nui-text-muted);font-weight:600;margin-top:3px;font-variant-numeric:tabular-nums;">${formatNST(getNSTDate())}</div>
            </div>
        `;

        // Snowager alert inside hero if asleep
        const heroBannerAlerts = document.createElement('div');
        heroBannerAlerts.id = 'nui-hero-alerts';
        heroBannerAlerts.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

        if (isSnowagerAsleep()) {
            heroBannerAlerts.innerHTML += `<a href="/winter/snowager.phtml" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--nui-radius-sm);background:#e0f2fe;border:1px solid #bae6fd;text-decoration:none;"><span style="font-size:16px;">❄️</span><span style="flex:1;display:flex;flex-direction:column;"><span style="font-weight:700;font-size:13px;color:#0369a1;">The Snowager is asleep!</span><span style="font-size:11px;color:#0284c7;">Go steal something before he wakes up.</span></span><span style="font-size:11px;font-weight:700;color:#0369a1;flex-shrink:0;">Steal →</span></a>`;
        }

        // Training summary pill row — starts hidden, shown only when fetch resolves
        const trainingPillRow = document.createElement('div');
        trainingPillRow.id = 'nui-hero-training-pills';
        trainingPillRow.style.cssText = 'display:none;gap:6px;flex-wrap:wrap;';

        heroBanner.appendChild(heroBannerTop);
        heroBanner.appendChild(trainingPillRow);
        heroBanner.appendChild(heroBannerAlerts);
        pageWrapper.appendChild(heroBanner);

        // Start NST clock tick
        const clockEl = heroBannerTop.querySelector('#nui-nst-clock');
        const clockInterval = setInterval(() => {
            if (!document.body.contains(clockEl)) { clearInterval(clockInterval); return; }
            clockEl.textContent = formatNST(getNSTDate());
        }, 1000);

        // Kick off live training fetch — use captured references, never getElementById
        (async () => {
            try {
                // Fetch all three schools in parallel
                const schools = [
                    { url: '/island/training.phtml?type=status',  label: 'Mystery Island', icon: '⚔️',  link: '/island/training.phtml' },
                    { url: '/island/fight_training.phtml?type=status', label: 'Ninja',    icon: '🥷',  link: '/island/fight_training.phtml' },
                    { url: '/pirates/academy.phtml?type=status',  label: 'Pirate Academy', icon: '⚓', link: '/pirates/academy.phtml' },
                ];

                const results = await Promise.allSettled(
                    schools.map(s => fetch(s.url, { credentials: 'include' })
                        .then(r => r.text())
                        .then(html => ({ school: s, pets: scrapeTrainingStatus(new DOMParser().parseFromString(html, 'text/html'), s.label) }))
                    )
                );

                // Merge, deduplicating by pet name (a pet is only at one school at a time)
                const seenNames = new Set();
                const allPets = [];
                results.forEach(r => {
                    if (r.status !== 'fulfilled') return;
                    r.value.pets.forEach(pet => {
                        if (!seenNames.has(pet.name.toLowerCase())) {
                            seenNames.add(pet.name.toLowerCase());
                            pet._schoolLink = r.value.school.link;
                            pet._schoolIcon = r.value.school.icon;
                            allPets.push(pet);
                        }
                    });
                });

                const activePets = allPets.filter(p => p.onCourse || p.courseFinished || p.codestonesNeeded.length > 0);

                // Nothing in training — leave pill row hidden
                if (!activePets.length) return;

                // Build pills
                const timerIds = [];
                trainingPillRow.innerHTML = activePets.map(pet => {
                    const link = pet._schoolLink || '/island/training.phtml';
                    const icon = pet._schoolIcon || '⚔️';
                    let pillStyle = 'display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:var(--nui-radius-pill);font-size:12px;font-weight:700;border:1px solid;cursor:pointer;text-decoration:none;';
                    let label;
                    if (pet.courseFinished) {
                        label = `✅ ${pet.name} — Done!`;
                        pillStyle += `background:var(--nui-success)22;color:var(--nui-success);border-color:var(--nui-success);`;
                    } else if (pet.codestonesNeeded.length > 0) {
                        label = `💎 ${pet.name} — Pay now`;
                        pillStyle += `background:var(--nui-warning)22;color:var(--nui-warning);border-color:var(--nui-warning);`;
                    } else {
                        const timerId = 'nui-pill-timer-' + pet.name.replace(/\W/g, '');
                        const h = Math.floor(pet.totalSeconds / 3600), m = Math.floor((pet.totalSeconds % 3600) / 60);
                        label = `${icon} ${pet.name} — <span id="${timerId}">${h ? `${h}h ${m}m` : `${m}m`}</span>`;
                        timerIds.push({ id: timerId, seconds: pet.totalSeconds });
                        pillStyle += `background:var(--nui-accent-soft);color:var(--nui-accent);border-color:var(--nui-accent);`;
                    }
                    return `<a href="${link}" style="${pillStyle}">${label}</a>`;
                }).join('');
                trainingPillRow.style.display = 'flex';

                // Pill countdown timers
                timerIds.forEach(t => {
                    const span = trainingPillRow.querySelector('#' + t.id);
                    if (!span) return;
                    let secs = t.seconds;
                    const fmt = s => s <= 0 ? 'Done!' : (Math.floor(s/3600) ? `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s` : Math.floor(s/60) ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`);
                    const iv = setInterval(() => {
                        secs--;
                        if (!trainingPillRow.isConnected) { clearInterval(iv); return; }
                        span.innerHTML = fmt(secs);
                        if (secs <= 0) clearInterval(iv);
                    }, 1000);
                });

            } catch (e) {
                // Fetch failed silently — pill row stays hidden, no placeholder shown
            }
        })();

        // ── Main two-column grid ─────────────────────────────────────────────
        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = 'width:100%;max-width:960px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--nui-space-4);align-items:start;';

        // --- PET CARD ---
        const petCard = nuiCard();

        let petHtml = cardHeader('🐾 My Pets') + `
            <div style="display:flex;gap:var(--nui-space-3);align-items:center;">
                <div style="width:90px;height:90px;border-radius:var(--nui-radius-md);background:var(--nui-surface-2) url('${activePet ? activePet.image : ''}') no-repeat center/contain;border:1px solid var(--nui-border);flex-shrink:0;"></div>
                <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;">
                    <div style="font-size:18px;font-weight:800;color:var(--nui-accent);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${activePet ? activePet.name : 'No Pet'}</div>
                    <div style="font-size:12px;color:var(--nui-text-muted);font-weight:600;">${activePet ? activePet.color + ' ' + activePet.species : ''}</div>
                    <div style="display:flex;gap:6px;margin-top:2px;flex-wrap:wrap;">
                        <span class="nui-badge">Lvl ${activePet ? activePet.level : 0}</span>
                        <span class="nui-badge nui-badge-success">HP ${activePet ? activePet.health : 0}/${activePet ? activePet.maxhealth : 0}</span>
                    </div>
                </div>
            </div>
        `;

        if (activePet && activePet.petpet) {
            petHtml += `
            <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--nui-surface-2);border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);">
                <img src="${activePet.petpetimg}" style="width:36px;height:36px;object-fit:contain;">
                <div style="flex:1;font-size:12px;color:var(--nui-text);">
                    <div style="font-weight:700;">${activePet.petpet.split(' the ')[0]}</div>
                    <div style="color:var(--nui-text-muted);">${activePet.petpet.split(' the ')[1] || 'Petpet'}</div>
                </div>
                <a href="/petpetlab.phtml" class="nui-btn nui-btn-secondary nui-btn-sm" style="text-decoration:none;padding:4px 8px;font-size:11px;">Lab</a>
            </div>`;
        }

        petHtml += `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <a href="/customise/" class="nui-btn nui-btn-secondary nui-btn-sm" style="text-decoration:none;">🎨 Customise</a>
                <a href="/quickref.phtml" class="nui-btn nui-btn-secondary nui-btn-sm" style="text-decoration:none;">📋 Quickref</a>
            </div>
        `;

        if (inactivePets.length > 0) {
            let inactiveRows = inactivePets.map(p => `
                <div onclick="window.nuiChangeActivePet('${p.name}')" title="Make ${p.name} active" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px;border-radius:var(--nui-radius-sm);background:var(--nui-surface-2);border:1px solid var(--nui-border);transition:all 0.2s;min-width:60px;max-width:80px;">
                    <img src="${p.image}" style="width:44px;height:44px;border-radius:50%;border:1px solid var(--nui-border);object-fit:cover;background:var(--nui-bg);">
                    <span style="font-size:10px;font-weight:700;color:var(--nui-text);text-align:center;overflow:hidden;text-overflow:ellipsis;width:100%;white-space:nowrap;">${p.name}</span>
                </div>
            `).join('');
            petHtml += accordionWrap(
                `Other Pets`,
                `<div style="display:flex;overflow-x:auto;gap:10px;padding-bottom:4px;scrollbar-width:thin;">${inactiveRows}</div>`,
                false
            );
        }

        petCard.innerHTML = petHtml;
        gridContainer.appendChild(petCard);

        // --- DAILIES CARD ---
        const dailyCard = nuiCard();

        // Split dailies into wheels vs regular
        const wheels = savedDailies.filter(d => d.name && d.name.toLowerCase().includes('wheel'));
        const nonWheels = savedDailies.filter(d => !d.name || !d.name.toLowerCase().includes('wheel'));

        let dailiesBodyHtml = '';
        nonWheels.forEach(d => {
            dailiesBodyHtml += dailyRow(d.icon || '📌', d.name, '', d.url, 'Go');
        });

        let wheelsBodyHtml = '';
        wheels.forEach(d => {
            wheelsBodyHtml += dailyRow(d.icon || '🎡', d.name, '', d.url, 'Spin');
        });

        let dailyHtml = cardHeader('📅 My Dailies', `<button class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:2px 8px;font-size:11px;" onclick="window.nuiOpenLinkEditor('dailies')">Edit</button>`);

        // Dailies section — open by default
        dailyHtml += accordionWrap(
            `Dailies`,
            dailiesBodyHtml || '<div style="font-size:12px;color:var(--nui-text-muted);">No dailies added yet.</div>',
            true
        );

        // Wheels section — open by default if any wheels present
        if (wheels.length > 0) {
            dailyHtml += accordionWrap(
                `🎡 Wheels`,
                wheelsBodyHtml,
                true
            );
        }

        dailyCard.innerHTML = dailyHtml;
        gridContainer.appendChild(dailyCard);

        // --- QUICK LINKS CARD ---
        const linksCard = nuiCard('height:fit-content;');

        let linksBodyHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;">`;
        quickLinks.forEach(link => {
            linksBodyHtml += `<a href="${link.url}" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;background:var(--nui-surface-2);border:1px solid var(--nui-border);border-radius:var(--nui-radius-sm);text-decoration:none;color:var(--nui-text);font-weight:700;transition:background var(--nui-dur-fast) var(--nui-ease);text-align:center;">
                <span style="font-size:22px;">${link.icon}</span>
                <span style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">${link.name}</span>
            </a>`;
        });
        linksBodyHtml += '</div>';

        let linksHtml = cardHeader('⚡ Quick Links', `<button class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:2px 8px;font-size:11px;" onclick="window.nuiOpenLinkEditor('quicklinks')">Edit</button>`);
        linksHtml += accordionWrap(
            `Links`,
            linksBodyHtml,
            true
        );

        linksCard.innerHTML = linksHtml;
        gridContainer.appendChild(linksCard);

        pageWrapper.appendChild(gridContainer);
        document.body.appendChild(pageWrapper);
    }

    run().catch(err => showFatalError(err));
})();

// ==============================================================================
// MODULE 17: SECRET NINJA TRAINING SCHOOL
// ==============================================================================
// Activates on: /island/fight_training.phtml
// Mirrors the Mystery Island Training SPA. Uses Red Codestones. Level cap: 250.
// ==============================================================================
(function () {
    'use strict';

    if (!/\/island\/fight_training\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('training-ninja')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Ninja Training SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    function openCustomSSW(itemName) { if (window.NeoUI && window.NeoUI.openSSW) window.NeoUI.openSSW(itemName); }

    // ── SCRAPERS ─────────────────────────────────────────────────────────────────
    function scrapeStatus(doc) {
        const pets = [];
        const rows = doc.querySelectorAll('table[align="center"] tr');
        let i = 0;
        while (i < rows.length) {
            const headerTd = rows[i] && rows[i].querySelector('td[bgcolor="#efefef"]');
            if (!headerTd) { i++; continue; }
            const headerText = headerTd.textContent.trim();
            const m = headerText.match(/^(.+?)\s+is at Level\s+(\d+)/i) ||
                      headerText.match(/^(.+?)\s+\(Level\s+(\d+)\)/i);
            if (!m) { i++; continue; }
            const name = m[1].trim();
            const level = parseInt(m[2]) || 0;

            // Try to get pet image from a nearby img
            let imgSrc = `https://pets.neopets.com/cpn/${name.toLowerCase()}/1/1.png`;
            const imgEl = rows[i].querySelector('img[src*="neopets"]');
            if (imgEl) imgSrc = imgEl.src;

            // Scrape stats from the row — format: Str: N  Def: N  Mov: N  HP: N/N
            const statsText = headerText;
            const strMatch = statsText.match(/Str(?:ength)?[:\s]+(\d+)/i);
            const defMatch = statsText.match(/Def(?:ence)?[:\s]+(\d+)/i);
            const movMatch = statsText.match(/(?:Mov|Agility|Spd)[:\s]+(\d+)/i);
            const hpMatch  = statsText.match(/(?:HP|Endurance)[:\s]+(\d+)/i);

            let onCourse = false, courseSubject = null, courseFinished = false;
            let totalSeconds = 0, codestonesNeeded = [];

            const statusText = headerText;
            if (/is currently studying/i.test(statusText)) {
                onCourse = true;
                const subMatch = statusText.match(/studying\s+(.+?)(?:\s+and\s+will|\.|\s*$)/i);
                if (subMatch) courseSubject = subMatch[1].trim();
            }

            const dataRow = rows[i + 1];
            if (dataRow) {
                const actionTd = dataRow.querySelectorAll('td')[1] || dataRow.querySelector('td');
                if (actionTd) {
                    const txt = actionTd.textContent.trim();
                    if (/Course Finished/i.test(txt)) courseFinished = true;
                    const tm = txt.match(/(\d+)\s*hrs?,?\s*(\d+)\s*min(?:utes?)?,?\s*(\d+)\s*sec(?:onds?)?/i);
                    if (tm) totalSeconds = parseInt(tm[1]) * 3600 + parseInt(tm[2]) * 60 + parseInt(tm[3]);
                    actionTd.querySelectorAll('b').forEach(b => {
                        const t = b.textContent.trim();
                        if (/Codestone/i.test(t)) codestonesNeeded.push(t);
                    });
                }
            }

            pets.push({ name, level, str: strMatch ? strMatch[1] : '?', def: defMatch ? defMatch[1] : '?',
                mov: movMatch ? movMatch[1] : '?', hp: hpMatch ? hpMatch[1] : '?', imgSrc,
                onCourse, courseSubject, courseFinished, totalSeconds, codestonesNeeded });
            i += 2;
        }
        pets.sort((a, b) => {
            const score = p => p.courseFinished ? 4 : (p.codestonesNeeded.length > 0 ? 3 : (p.onCourse ? 2 : 1));
            return score(b) - score(a);
        });
        return pets;
    }

    async function fetchSchool(type) {
        const res = await fetch(`/island/fight_training.phtml?type=${type}`, { credentials: 'include' });
        const html = await res.text();
        return { doc: new DOMParser().parseFromString(html, 'text/html'), raw: html };
    }

    async function processSchool(type, petName, courseType) {
        const fd = new FormData();
        fd.append('type', type);
        fd.append('pet_name', petName);
        if (courseType) fd.append('course_type', courseType);
        const res = await fetch('/island/process_fight_training.phtml', { method: 'POST', credentials: 'include', body: fd });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const contentTd = doc.querySelector('td.content');
        if (!contentTd) return { ok: true, message: 'Done!' };
        const text = contentTd.textContent.replace(/\s+/g, ' ').trim();
        const isError = /error|invalid|cannot|already|not enough|too many/i.test(text);
        return { ok: !isError, message: text.substring(0, 300) };
    }

    // ── INIT ─────────────────────────────────────────────────────────────────────
    async function init() {
        const profile = NeoUI.scrapeLegacyProfile();

        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        const wrapper = document.createElement('div');
        wrapper.className = 'nui-reset';
        wrapper.style.cssText = 'padding: calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5); max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--nui-space-4);';

        wrapper.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <img src="//images.neopets.com/items/nin_smoke_bomb.gif" style="width:52px;height:52px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);object-fit:cover;flex-shrink:0;">
                <div>
                    <div style="font-family:var(--nui-font-display);font-weight:800;font-size:22px;color:var(--nui-text);">Secret Ninja Training School</div>
                    <div style="font-size:13px;color:var(--nui-text-muted);font-weight:600;">Red Codestones · Level 250 cap</div>
                </div>
            </div>
        `;

        const tabs = document.createElement('div');
        tabs.style.cssText = 'display:flex;gap:6px;border-bottom:2px solid var(--nui-border);padding-bottom:0;';
        const TABS = [{ id: 'status', label: '📋 Status' }, { id: 'courses', label: '📚 Courses' }];
        const startTab = new URLSearchParams(location.search).get('type') || 'status';
        let activeTab = TABS.find(t => t.id === startTab) ? startTab : 'status';
        const tabEls = {};
        TABS.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.textContent = t.label;
            btn.style.cssText = 'padding:8px 14px;border:none;cursor:pointer;font-weight:700;font-size:13px;border-radius:var(--nui-radius-sm) var(--nui-radius-sm) 0 0;background:transparent;color:var(--nui-text-muted);border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.15s;';
            tabEls[t.id] = btn; tabs.appendChild(btn);
        });

        const content = document.createElement('div');
        content.className = 'nui-surface';
        content.style.cssText = 'border-radius:var(--nui-radius-lg);overflow:hidden;min-height:200px;box-shadow:0 4px 12px var(--nui-shadow);border:1px solid var(--nui-border);';
        const contentInner = document.createElement('div');
        contentInner.style.cssText = 'padding:var(--nui-space-4);';
        content.appendChild(contentInner);
        wrapper.appendChild(tabs);
        wrapper.appendChild(content);
        document.body.appendChild(wrapper);

        let timerIntervals = [];
        function clearAllTimers() { timerIntervals.forEach(clearInterval); timerIntervals = []; }
        function showToast(msg, isError) {
            const t = document.createElement('div');
            t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 18px;border-radius:var(--nui-radius-md);font-size:14px;font-weight:700;max-width:90vw;text-align:center;box-shadow:0 4px 16px var(--nui-shadow);background:${isError ? 'var(--nui-danger)' : 'var(--nui-success)'};color:#fff;transition:opacity 0.3s;`;
            t.textContent = msg; document.body.appendChild(t);
            setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
        }

        async function switchTab(id) {
            activeTab = id; clearAllTimers();
            Object.entries(tabEls).forEach(([tid, btn]) => {
                const active = tid === id;
                btn.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                btn.style.borderBottomColor = active ? 'var(--nui-accent)' : 'transparent';
                btn.style.background = active ? 'var(--nui-surface-2)' : 'transparent';
            });
            contentInner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--nui-text-faint);">Loading...</div>';
            try {
                if (id === 'status') await renderStatus();
                else if (id === 'courses') await renderCourses();
            } catch (err) {
                contentInner.innerHTML = `<div style="color:var(--nui-danger);font-weight:600;text-align:center;">Failed to load: ${err.message}</div>`;
            }
        }

        TABS.forEach(t => { tabEls[t.id].addEventListener('click', () => switchTab(t.id)); });

        async function renderStatus() {
            const { doc } = await fetchSchool('status');
            const pets = scrapeStatus(doc);
            if (!pets.length) { contentInner.innerHTML = '<div style="color:var(--nui-text-muted);text-align:center;padding:40px;">No pets found.</div>'; return; }
            contentInner.innerHTML = '';

            pets.forEach((pet, i) => {
                const card = document.createElement('div');
                card.style.cssText = `margin-bottom:12px;border-radius:var(--nui-radius-md);overflow:hidden;border:${pet.courseFinished || pet.codestonesNeeded.length > 0 ? '2px solid var(--nui-accent)' : '1px solid var(--nui-border)'};background:var(--nui-surface-2);`;

                let statusBadge = '';
                if (pet.courseFinished) statusBadge = '<span class="nui-badge nui-badge-success">Course Finished!</span>';
                else if (pet.codestonesNeeded.length > 0) statusBadge = '<span class="nui-badge nui-badge-warning">Awaiting Payment</span>';
                else if (pet.onCourse) statusBadge = `<span class="nui-badge">📚 ${pet.courseSubject || 'Training'} · <span id="nui-ntimer-${i}">Loading...</span></span>`;
                else statusBadge = '<span class="nui-badge" style="opacity:0.5;">Not enrolled</span>';

                card.innerHTML = `
                    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;">
                        <img src="${pet.imgSrc}" style="width:48px;height:48px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);object-fit:cover;flex-shrink:0;" onerror="this.src='https://images.neopets.com/themes/h5/basic/images/mystery-icon.png'">
                        <div style="flex:1;min-width:0;">
                            <div style="font-family:var(--nui-font-display);font-weight:800;font-size:16px;color:var(--nui-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pet.name}</div>
                            <div style="font-size:12px;color:var(--nui-text-muted);margin-top:2px;">${statusBadge}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;flex-shrink:0;">
                            ${[['Lvl',pet.level,'var(--nui-text)'],['Str',pet.str,'var(--nui-danger)'],['Def',pet.def,'var(--nui-accent-2)'],['Spd',pet.mov,'var(--nui-text)'],['HP',pet.hp,'var(--nui-success)']].map(([l,v,c])=>`<div style="display:flex;flex-direction:column;gap:1px;"><span style="font-size:9px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">${l}</span><span style="font-size:12px;font-weight:700;color:${c};">${v}</span></div>`).join('')}
                        </div>
                    </div>
                `;

                if (pet.onCourse && pet.totalSeconds > 0) {
                    let secs = pet.totalSeconds;
                    const fmt = s => { const h = String(Math.floor(s/3600)).padStart(2,'0'), mi = String(Math.floor((s%3600)/60)).padStart(2,'0'), sc = String(s%60).padStart(2,'0'); return `${h}:${mi}:${sc}`; };
                    const el = card.querySelector(`#nui-ntimer-${i}`);
                    if (el) el.textContent = fmt(secs);
                    const iv = setInterval(() => { secs--; const e2 = card.querySelector(`#nui-ntimer-${i}`); if (!e2 || !card.isConnected) { clearInterval(iv); return; } e2.textContent = secs > 0 ? fmt(secs) : 'Ready!'; }, 1000);
                    timerIntervals.push(iv);
                }

                if (pet.courseFinished) {
                    const footer = document.createElement('div');
                    footer.style.cssText = 'padding:8px 12px;border-top:1px solid var(--nui-border);background:var(--nui-success-soft);';
                    footer.innerHTML = `<button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-complete" data-pet="${pet.name}" style="width:100%;padding:8px;background:var(--nui-success);color:var(--nui-surface);">✓ Complete Course</button>`;
                    card.appendChild(footer);
                } else if (pet.codestonesNeeded.length > 0) {
                    const footer = document.createElement('div');
                    footer.style.cssText = 'padding:12px;border-top:1px solid var(--nui-border);background:var(--nui-warning-soft);display:flex;flex-direction:column;gap:8px;';
                    const payRow = document.createElement('div');
                    payRow.style.cssText = 'display:flex;gap:8px;justify-content:space-between;align-items:center;';
                    payRow.innerHTML = `<div style="font-size:12px;font-weight:800;color:var(--nui-warning);text-transform:uppercase;">Red Codestones Required</div><div style="display:flex;gap:6px;"><button type="button" class="nui-btn nui-btn-danger nui-btn-sm btn-cancel" data-pet="${pet.name}" style="padding:6px 12px;font-size:11px;">Cancel</button><button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-pay" data-pet="${pet.name}" style="padding:6px 12px;font-size:11px;">Pay All</button></div>`;
                    footer.appendChild(payRow);
                    const stonesList = document.createElement('div');
                    stonesList.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
                    pet.codestonesNeeded.forEach(stoneName => {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:var(--nui-surface);border:1px solid var(--nui-border);padding:6px 10px;border-radius:var(--nui-radius-sm);';
                        row.innerHTML = `<span style="font-size:13px;font-weight:700;color:var(--nui-text);">${stoneName}</span><div style="display:flex;gap:6px;"><button type="button" class="nui-btn nui-btn-secondary nui-btn-sm btn-ssw" style="padding:4px 8px;font-size:11px;">SSW</button><a href="/market.phtml?type=wizard&string=${encodeURIComponent(stoneName)}" target="_blank" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 8px;font-size:11px;text-decoration:none;">SW</a><a href="/safetydeposit.phtml?obj_name=${encodeURIComponent(stoneName)}&category=0" target="_blank" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 8px;font-size:11px;text-decoration:none;">SDB</a></div>`;
                        row.querySelector('.btn-ssw').addEventListener('click', () => openCustomSSW(stoneName));
                        stonesList.appendChild(row);
                    });
                    footer.appendChild(stonesList);
                    card.appendChild(footer);
                }

                contentInner.appendChild(card);
            });

            contentInner.querySelectorAll('.btn-complete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'); btn.textContent = 'Processing...'; btn.disabled = true;
                    const r = await processSchool('complete', pn); showToast(r.ok ? `${pn}'s course complete! 🎉` : r.message, !r.ok);
                    if (r.ok) await renderStatus();
                });
            });
            contentInner.querySelectorAll('.btn-pay').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'); btn.textContent = 'Paying...'; btn.disabled = true;
                    const r = await processSchool('pay', pn); showToast(r.ok ? `Paid for ${pn}'s course!` : r.message, !r.ok);
                    if (r.ok) await renderStatus(); else { btn.textContent = 'Pay All'; btn.disabled = false; }
                });
            });
            contentInner.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'); btn.textContent = '...'; btn.disabled = true;
                    const r = await processSchool('cancel', pn); showToast(r.ok ? `Cancelled ${pn}'s course.` : r.message, !r.ok);
                    if (r.ok) await renderStatus(); else { btn.textContent = 'Cancel'; btn.disabled = false; }
                });
            });
        }

        async function renderCourses() {
            const { doc } = await fetchSchool('status');
            const pets = scrapeStatus(doc);
            contentInner.innerHTML = '';
            const eligible = pets.filter(p => !p.onCourse && !p.courseFinished && p.codestonesNeeded.length === 0 && p.level < 250);
            if (!eligible.length) { contentInner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--nui-text-muted);">All pets are currently training or awaiting payment.</div>'; return; }

            const courseTypes = ['Strength', 'Defence', 'Agility', 'Endurance', 'Level'];
            const ctrlRow = document.createElement('div');
            ctrlRow.style.cssText = 'display:flex;gap:8px;margin-bottom:var(--nui-space-4);align-items:center;flex-wrap:wrap;';
            ctrlRow.innerHTML = `<span style="font-size:12px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Course Type</span><select class="nui-select" id="nui-ncourse-type" style="flex:1;min-width:120px;max-width:200px;font-weight:700;">${courseTypes.map(c => `<option value="${c}">${c}</option>`).join('')}</select>`;
            contentInner.appendChild(ctrlRow);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--nui-space-3);';
            eligible.forEach(pet => {
                const card = document.createElement('div');
                card.style.cssText = 'display:flex;flex-direction:column;align-items:center;text-align:center;padding:12px;border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);background:var(--nui-surface-2);';
                card.innerHTML = `<img src="${pet.imgSrc}" style="width:54px;height:54px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);object-fit:cover;margin-bottom:8px;" onerror="this.src='https://images.neopets.com/themes/h5/basic/images/mystery-icon.png'"><div style="font-weight:800;font-size:15px;color:var(--nui-text);width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${pet.name}</div><div style="font-size:12px;color:var(--nui-text-muted);margin-top:2px;margin-bottom:12px;">Lvl ${pet.level} · Red Codestone</div><button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-start" data-pet="${pet.name}" style="width:100%;">Start Course</button>`;
                grid.appendChild(card);
            });
            contentInner.appendChild(grid);

            contentInner.querySelectorAll('.btn-start').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'), ct = document.getElementById('nui-ncourse-type').value;
                    btn.textContent = '...'; btn.disabled = true;
                    const r = await processSchool('start', pn, ct); showToast(r.ok ? `${pn} started ${ct}!` : r.message, !r.ok);
                    if (r.ok) await switchTab('status'); else { btn.textContent = 'Start'; btn.disabled = false; }
                });
            });
        }

        switchTab(activeTab);
    }

    let booted = false;
    function boot() { if (booted) return; booted = true; init().catch(showFatalError); }
    if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
    else document.addEventListener('DOMContentLoaded', boot);
})();

// ==============================================================================
// MODULE 18: SWASHBUCKLING ACADEMY (PIRATE TRAINING)
// ==============================================================================
// Activates on: /pirates/academy.phtml
// Uses Dubloons instead of Codestones. Level cap: 40.
// ==============================================================================
(function () {
    'use strict';

    if (!/\/pirates\/academy\.phtml/.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('training-pirate')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Swashbuckling Academy SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    function openCustomSSW(itemName) { if (window.NeoUI && window.NeoUI.openSSW) window.NeoUI.openSSW(itemName); }

    // ── SCRAPERS ─────────────────────────────────────────────────────────────────
    function scrapeStatus(doc) {
        const pets = [];
        const rows = doc.querySelectorAll('table[align="center"] tr');
        let i = 0;
        while (i < rows.length) {
            const headerTd = rows[i] && rows[i].querySelector('td[bgcolor="#efefef"]');
            if (!headerTd) { i++; continue; }
            const headerText = headerTd.textContent.trim();
            const m = headerText.match(/^(.+?)\s+is at Level\s+(\d+)/i) ||
                      headerText.match(/^(.+?)\s+\(Level\s+(\d+)\)/i);
            if (!m) { i++; continue; }
            const name = m[1].trim();
            const level = parseInt(m[2]) || 0;
            let imgSrc = `https://pets.neopets.com/cpn/${name.toLowerCase()}/1/1.png`;
            const imgEl = rows[i].querySelector('img[src*="neopets"]');
            if (imgEl) imgSrc = imgEl.src;

            const strMatch = headerText.match(/Str(?:ength)?[:\s]+(\d+)/i);
            const defMatch = headerText.match(/Def(?:ence)?[:\s]+(\d+)/i);
            const movMatch = headerText.match(/(?:Mov|Agility|Spd)[:\s]+(\d+)/i);
            const hpMatch  = headerText.match(/(?:HP|Endurance)[:\s]+(\d+)/i);

            let onCourse = false, courseSubject = null, courseFinished = false;
            let totalSeconds = 0, dubloonsNeeded = [];

            if (/is currently studying/i.test(headerText)) {
                onCourse = true;
                const subMatch = headerText.match(/studying\s+(.+?)(?:\s+and\s+will|\.|\s*$)/i);
                if (subMatch) courseSubject = subMatch[1].trim();
            }

            const dataRow = rows[i + 1];
            if (dataRow) {
                const actionTd = dataRow.querySelectorAll('td')[1] || dataRow.querySelector('td');
                if (actionTd) {
                    const txt = actionTd.textContent.trim();
                    if (/Course Finished/i.test(txt)) courseFinished = true;
                    const tm = txt.match(/(\d+)\s*hrs?,?\s*(\d+)\s*min(?:utes?)?,?\s*(\d+)\s*sec(?:onds?)?/i);
                    if (tm) totalSeconds = parseInt(tm[1]) * 3600 + parseInt(tm[2]) * 60 + parseInt(tm[3]);
                    // Pirate Academy uses Dubloons
                    actionTd.querySelectorAll('b').forEach(b => {
                        const t = b.textContent.trim();
                        if (/dubloon/i.test(t)) dubloonsNeeded.push(t);
                    });
                    // Also check for "X Dubloon Coin" text patterns
                    const dubMatch = txt.match(/(\d+-?\w*\s*Dubloon\s*Coin(?:s)?)/gi);
                    if (dubMatch) dubMatch.forEach(d => { if (!dubloonsNeeded.includes(d)) dubloonsNeeded.push(d); });
                }
            }

            pets.push({ name, level, str: strMatch ? strMatch[1] : '?', def: defMatch ? defMatch[1] : '?',
                mov: movMatch ? movMatch[1] : '?', hp: hpMatch ? hpMatch[1] : '?', imgSrc,
                onCourse, courseSubject, courseFinished, totalSeconds, dubloonsNeeded });
            i += 2;
        }
        pets.sort((a, b) => {
            const score = p => p.courseFinished ? 4 : (p.dubloonsNeeded.length > 0 ? 3 : (p.onCourse ? 2 : 1));
            return score(b) - score(a);
        });
        return pets;
    }

    async function fetchAcademy(type) {
        const res = await fetch(`/pirates/academy.phtml?type=${type}`, { credentials: 'include' });
        const html = await res.text();
        return { doc: new DOMParser().parseFromString(html, 'text/html'), raw: html };
    }

    async function processAcademy(type, petName, courseType) {
        const fd = new FormData();
        fd.append('type', type);
        fd.append('pet_name', petName);
        if (courseType) fd.append('course_type', courseType);
        const res = await fetch('/pirates/process_academy.phtml', { method: 'POST', credentials: 'include', body: fd });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const contentTd = doc.querySelector('td.content');
        if (!contentTd) return { ok: true, message: 'Done!' };
        const text = contentTd.textContent.replace(/\s+/g, ' ').trim();
        const isError = /error|invalid|cannot|already|not enough|too many/i.test(text);
        return { ok: !isError, message: text.substring(0, 300) };
    }

    // ── INIT ─────────────────────────────────────────────────────────────────────
    async function init() {
        const profile = NeoUI.scrapeLegacyProfile();

        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        const wrapper = document.createElement('div');
        wrapper.className = 'nui-reset';
        wrapper.style.cssText = 'padding: calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5); max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--nui-space-4);';

        wrapper.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <img src="//images.neopets.com/items/toy_pirate_cutlass.gif" style="width:52px;height:52px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);object-fit:cover;flex-shrink:0;">
                <div>
                    <div style="font-family:var(--nui-font-display);font-weight:800;font-size:22px;color:var(--nui-text);">Swashbuckling Academy</div>
                    <div style="font-size:13px;color:var(--nui-text-muted);font-weight:600;">Dubloons accepted · Level 40 cap</div>
                </div>
            </div>
        `;

        const tabs = document.createElement('div');
        tabs.style.cssText = 'display:flex;gap:6px;border-bottom:2px solid var(--nui-border);padding-bottom:0;';
        const TABS = [{ id: 'status', label: '📋 Status' }, { id: 'courses', label: '📚 Courses' }];
        const startTab = new URLSearchParams(location.search).get('type') || 'status';
        let activeTab = TABS.find(t => t.id === startTab) ? startTab : 'status';
        const tabEls = {};
        TABS.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.textContent = t.label;
            btn.style.cssText = 'padding:8px 14px;border:none;cursor:pointer;font-weight:700;font-size:13px;border-radius:var(--nui-radius-sm) var(--nui-radius-sm) 0 0;background:transparent;color:var(--nui-text-muted);border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.15s;';
            tabEls[t.id] = btn; tabs.appendChild(btn);
        });

        const content = document.createElement('div');
        content.className = 'nui-surface';
        content.style.cssText = 'border-radius:var(--nui-radius-lg);overflow:hidden;min-height:200px;box-shadow:0 4px 12px var(--nui-shadow);border:1px solid var(--nui-border);';
        const contentInner = document.createElement('div');
        contentInner.style.cssText = 'padding:var(--nui-space-4);';
        content.appendChild(contentInner);
        wrapper.appendChild(tabs);
        wrapper.appendChild(content);
        document.body.appendChild(wrapper);

        let timerIntervals = [];
        function clearAllTimers() { timerIntervals.forEach(clearInterval); timerIntervals = []; }
        function showToast(msg, isError) {
            const t = document.createElement('div');
            t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 18px;border-radius:var(--nui-radius-md);font-size:14px;font-weight:700;max-width:90vw;text-align:center;box-shadow:0 4px 16px var(--nui-shadow);background:${isError ? 'var(--nui-danger)' : 'var(--nui-success)'};color:#fff;transition:opacity 0.3s;`;
            t.textContent = msg; document.body.appendChild(t);
            setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
        }

        async function switchTab(id) {
            activeTab = id; clearAllTimers();
            Object.entries(tabEls).forEach(([tid, btn]) => {
                const active = tid === id;
                btn.style.color = active ? 'var(--nui-accent)' : 'var(--nui-text-muted)';
                btn.style.borderBottomColor = active ? 'var(--nui-accent)' : 'transparent';
                btn.style.background = active ? 'var(--nui-surface-2)' : 'transparent';
            });
            contentInner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--nui-text-faint);">Loading...</div>';
            try {
                if (id === 'status') await renderStatus();
                else if (id === 'courses') await renderCourses();
            } catch (err) {
                contentInner.innerHTML = `<div style="color:var(--nui-danger);font-weight:600;text-align:center;">Failed to load: ${err.message}</div>`;
            }
        }

        TABS.forEach(t => { tabEls[t.id].addEventListener('click', () => switchTab(t.id)); });

        async function renderStatus() {
            const { doc } = await fetchAcademy('status');
            const pets = scrapeStatus(doc);
            if (!pets.length) { contentInner.innerHTML = '<div style="color:var(--nui-text-muted);text-align:center;padding:40px;">No pets found.</div>'; return; }
            contentInner.innerHTML = '';

            pets.forEach((pet, i) => {
                const card = document.createElement('div');
                card.style.cssText = `margin-bottom:12px;border-radius:var(--nui-radius-md);overflow:hidden;border:${pet.courseFinished || pet.dubloonsNeeded.length > 0 ? '2px solid var(--nui-accent)' : '1px solid var(--nui-border)'};background:var(--nui-surface-2);`;

                let statusBadge = '';
                if (pet.courseFinished) statusBadge = '<span class="nui-badge nui-badge-success">Course Finished!</span>';
                else if (pet.dubloonsNeeded.length > 0) statusBadge = '<span class="nui-badge nui-badge-warning">Awaiting Payment</span>';
                else if (pet.onCourse) statusBadge = `<span class="nui-badge">⚓ ${pet.courseSubject || 'Training'} · <span id="nui-atimer-${i}">Loading...</span></span>`;
                else statusBadge = '<span class="nui-badge" style="opacity:0.5;">Not enrolled</span>';

                card.innerHTML = `
                    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;">
                        <img src="${pet.imgSrc}" style="width:48px;height:48px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);object-fit:cover;flex-shrink:0;" onerror="this.src='https://images.neopets.com/themes/h5/basic/images/mystery-icon.png'">
                        <div style="flex:1;min-width:0;">
                            <div style="font-family:var(--nui-font-display);font-weight:800;font-size:16px;color:var(--nui-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pet.name}</div>
                            <div style="font-size:12px;color:var(--nui-text-muted);margin-top:2px;">${statusBadge}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;flex-shrink:0;">
                            ${[['Lvl',pet.level,'var(--nui-text)'],['Str',pet.str,'var(--nui-danger)'],['Def',pet.def,'var(--nui-accent-2)'],['Spd',pet.mov,'var(--nui-text)'],['HP',pet.hp,'var(--nui-success)']].map(([l,v,c])=>`<div style="display:flex;flex-direction:column;gap:1px;"><span style="font-size:9px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">${l}</span><span style="font-size:12px;font-weight:700;color:${c};">${v}</span></div>`).join('')}
                        </div>
                    </div>
                `;

                if (pet.onCourse && pet.totalSeconds > 0) {
                    let secs = pet.totalSeconds;
                    const fmt = s => { const h = String(Math.floor(s/3600)).padStart(2,'0'), mi = String(Math.floor((s%3600)/60)).padStart(2,'0'), sc = String(s%60).padStart(2,'0'); return `${h}:${mi}:${sc}`; };
                    const el = card.querySelector(`#nui-atimer-${i}`);
                    if (el) el.textContent = fmt(secs);
                    const iv = setInterval(() => { secs--; const e2 = card.querySelector(`#nui-atimer-${i}`); if (!e2 || !card.isConnected) { clearInterval(iv); return; } e2.textContent = secs > 0 ? fmt(secs) : 'Ready!'; }, 1000);
                    timerIntervals.push(iv);
                }

                if (pet.courseFinished) {
                    const footer = document.createElement('div');
                    footer.style.cssText = 'padding:8px 12px;border-top:1px solid var(--nui-border);background:var(--nui-success-soft);';
                    footer.innerHTML = `<button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-complete" data-pet="${pet.name}" style="width:100%;padding:8px;background:var(--nui-success);color:var(--nui-surface);">✓ Complete Course</button>`;
                    card.appendChild(footer);
                } else if (pet.dubloonsNeeded.length > 0) {
                    const footer = document.createElement('div');
                    footer.style.cssText = 'padding:12px;border-top:1px solid var(--nui-border);background:var(--nui-warning-soft);display:flex;flex-direction:column;gap:8px;';
                    const payRow = document.createElement('div');
                    payRow.style.cssText = 'display:flex;gap:8px;justify-content:space-between;align-items:center;';
                    payRow.innerHTML = `<div style="font-size:12px;font-weight:800;color:var(--nui-warning);text-transform:uppercase;">Dubloons Required</div><div style="display:flex;gap:6px;"><button type="button" class="nui-btn nui-btn-danger nui-btn-sm btn-cancel" data-pet="${pet.name}" style="padding:6px 12px;font-size:11px;">Cancel</button><button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-pay" data-pet="${pet.name}" style="padding:6px 12px;font-size:11px;">Pay All</button></div>`;
                    footer.appendChild(payRow);
                    const dubList = document.createElement('div');
                    dubList.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
                    pet.dubloonsNeeded.forEach(dub => {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:var(--nui-surface);border:1px solid var(--nui-border);padding:6px 10px;border-radius:var(--nui-radius-sm);';
                        row.innerHTML = `<span style="font-size:13px;font-weight:700;color:var(--nui-text);">${dub}</span><div style="display:flex;gap:6px;"><button type="button" class="nui-btn nui-btn-secondary nui-btn-sm btn-ssw" style="padding:4px 8px;font-size:11px;">SSW</button><a href="/market.phtml?type=wizard&string=${encodeURIComponent(dub)}" target="_blank" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 8px;font-size:11px;text-decoration:none;">SW</a><a href="/safetydeposit.phtml?obj_name=${encodeURIComponent(dub)}&category=0" target="_blank" class="nui-btn nui-btn-secondary nui-btn-sm" style="padding:4px 8px;font-size:11px;text-decoration:none;">SDB</a></div>`;
                        row.querySelector('.btn-ssw').addEventListener('click', () => openCustomSSW(dub));
                        dubList.appendChild(row);
                    });
                    footer.appendChild(dubList);
                    card.appendChild(footer);
                }

                contentInner.appendChild(card);
            });

            contentInner.querySelectorAll('.btn-complete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'); btn.textContent = 'Processing...'; btn.disabled = true;
                    const r = await processAcademy('complete', pn); showToast(r.ok ? `${pn}'s course complete! 🎉` : r.message, !r.ok);
                    if (r.ok) await renderStatus();
                });
            });
            contentInner.querySelectorAll('.btn-pay').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'); btn.textContent = 'Paying...'; btn.disabled = true;
                    const r = await processAcademy('pay', pn); showToast(r.ok ? `Paid for ${pn}'s course!` : r.message, !r.ok);
                    if (r.ok) await renderStatus(); else { btn.textContent = 'Pay All'; btn.disabled = false; }
                });
            });
            contentInner.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'); btn.textContent = '...'; btn.disabled = true;
                    const r = await processAcademy('cancel', pn); showToast(r.ok ? `Cancelled ${pn}'s course.` : r.message, !r.ok);
                    if (r.ok) await renderStatus(); else { btn.textContent = 'Cancel'; btn.disabled = false; }
                });
            });
        }

        async function renderCourses() {
            const { doc } = await fetchAcademy('status');
            const pets = scrapeStatus(doc);
            contentInner.innerHTML = '';
            const eligible = pets.filter(p => !p.onCourse && !p.courseFinished && p.dubloonsNeeded.length === 0 && p.level < 40);
            if (!eligible.length) { contentInner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--nui-text-muted);">All pets are training or awaiting payment — or level 40+ (use MI Training).</div>'; return; }

            const courseTypes = ['Strength', 'Defence', 'Agility', 'Endurance', 'Level'];
            const ctrlRow = document.createElement('div');
            ctrlRow.style.cssText = 'display:flex;gap:8px;margin-bottom:var(--nui-space-4);align-items:center;flex-wrap:wrap;';
            ctrlRow.innerHTML = `<span style="font-size:12px;font-weight:800;color:var(--nui-text-faint);text-transform:uppercase;">Course Type</span><select class="nui-select" id="nui-acourse-type" style="flex:1;min-width:120px;max-width:200px;font-weight:700;">${courseTypes.map(c => `<option value="${c}">${c}</option>`).join('')}</select>`;
            contentInner.appendChild(ctrlRow);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--nui-space-3);';
            eligible.forEach(pet => {
                const card = document.createElement('div');
                card.style.cssText = 'display:flex;flex-direction:column;align-items:center;text-align:center;padding:12px;border:1px solid var(--nui-border);border-radius:var(--nui-radius-md);background:var(--nui-surface-2);';
                // Dubloon cost: level 1-10 = 1 dubloon, 11-20 = 2, 21-30 = 5, 31-40 = 10
                const dubCost = pet.level <= 10 ? '1 Dubloon' : pet.level <= 20 ? '2 Dubloons' : pet.level <= 30 ? '5 Dubloons' : '10 Dubloons';
                card.innerHTML = `<img src="${pet.imgSrc}" style="width:54px;height:54px;border-radius:var(--nui-radius-sm);border:1px solid var(--nui-border);object-fit:cover;margin-bottom:8px;" onerror="this.src='https://images.neopets.com/themes/h5/basic/images/mystery-icon.png'"><div style="font-weight:800;font-size:15px;color:var(--nui-text);width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${pet.name}</div><div style="font-size:12px;color:var(--nui-text-muted);margin-top:2px;margin-bottom:12px;">Lvl ${pet.level} · ${dubCost}</div><button type="button" class="nui-btn nui-btn-primary nui-btn-sm btn-start" data-pet="${pet.name}" style="width:100%;">Start Course</button>`;
                grid.appendChild(card);
            });
            contentInner.appendChild(grid);

            contentInner.querySelectorAll('.btn-start').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pn = btn.getAttribute('data-pet'), ct = document.getElementById('nui-acourse-type').value;
                    btn.textContent = '...'; btn.disabled = true;
                    const r = await processAcademy('start', pn, ct); showToast(r.ok ? `${pn} started ${ct}!` : r.message, !r.ok);
                    if (r.ok) await switchTab('status'); else { btn.textContent = 'Start'; btn.disabled = false; }
                });
            });
        }

        switchTab(activeTab);
    }

    let booted = false;
    function boot() { if (booted) return; booted = true; init().catch(showFatalError); }
    if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
    else document.addEventListener('DOMContentLoaded', boot);
})();

// ==============================================================================
// MODULE 16: GAMES ROOM + RUFFLE WRAPPER
// ==============================================================================
(function () {
    'use strict';

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;
    if (!NeoUI.isModuleEnabled('games')) return;

    const path = location.pathname;
    const params = new URLSearchParams(location.search);

    // ── Ruffle player wrapper ──────────────────────────────────────────────────
    if (/^\/games\/game\.phtml$/.test(path) && params.has('game_id')) {
        const initRuffleWrap = function () {
            // Scrape game metadata before nuking
            const titleEl = document.querySelector('h1, .game-title, #page_title, .content h2');
            const gameTitle = titleEl ? titleEl.textContent.trim() : 'Game';
            const scoreEl = document.querySelector('.game-score, #game_score, [id*="score"]');
            const scoreText = scoreEl ? scoreEl.textContent.trim() : null;

            // Preserve the Ruffle player element — it starts loading immediately
            const rufflePlayer = document.querySelector('ruffle-player');
            if (!rufflePlayer) return; // H5 or unknown — bail

            // Detach from DOM so we can rebuild around it
            const ruffleClone = rufflePlayer.parentNode ? rufflePlayer.parentNode.removeChild(rufflePlayer) : rufflePlayer;

            // Scrape the score submit form if present (outside the SWF)
            const submitForm = document.querySelector('form[action*="sendtoscore"], form[action*="score"], #submitForm');
            const submitFormClone = submitForm ? submitForm.parentNode.removeChild(submitForm) : null;

            // Nuke and rebuild
            document.body.innerHTML = '';
            document.documentElement.style.background = 'var(--nui-bg)';
            document.body.style.cssText = 'margin:0;padding:0;background:var(--nui-bg);';
            document.body.className = 'nui-reset';

            NeoUI.init();
            NeoUI.buildTopbar({ username: '' });

            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:calc(var(--nui-topbar-h) + 12px) 12px 24px;box-sizing:border-box;gap:12px;';

            // Game header
            const header = document.createElement('div');
            header.style.cssText = 'width:100%;max-width:700px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;';
            header.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;">
                    <a href="/games/" style="font-size:20px;text-decoration:none;color:var(--nui-text-muted);" title="Back to Games Room">🕹️</a>
                    <div style="font-family:var(--nui-font-display);font-size:20px;font-weight:800;color:var(--nui-text);">${gameTitle}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <a href="/games/hiscores.phtml?game_id=${params.get('game_id')}" class="nui-btn nui-btn-secondary nui-btn-sm" style="text-decoration:none;">🏆 Hi-Scores</a>
                </div>
            `;

            // Player container
            const playerWrap = document.createElement('div');
            playerWrap.style.cssText = 'width:100%;max-width:700px;border-radius:var(--nui-radius-lg);overflow:hidden;border:1px solid var(--nui-border);box-shadow:0 4px 24px var(--nui-shadow);background:#000;aspect-ratio:4/3;position:relative;';
            ruffleClone.style.cssText = 'width:100%;height:100%;display:block;';
            playerWrap.appendChild(ruffleClone);

            wrapper.appendChild(header);
            wrapper.appendChild(playerWrap);

            // Score submission form — reskin and append below player if present
            if (submitFormClone) {
                const formWrap = document.createElement('div');
                formWrap.className = 'nui-surface';
                formWrap.style.cssText = 'width:100%;max-width:700px;border-radius:var(--nui-radius-lg);border:1px solid var(--nui-border);padding:var(--nui-space-4);display:flex;flex-direction:column;gap:10px;';
                formWrap.innerHTML = `<div style="font-family:var(--nui-font-display);font-size:16px;font-weight:800;color:var(--nui-text);">Submit Score</div>`;
                // Style the submit button inside the form
                submitFormClone.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(btn => {
                    btn.className = 'nui-btn nui-btn-primary nui-btn-sm';
                    btn.style.cssText = 'margin-top:6px;';
                });
                formWrap.appendChild(submitFormClone);
                wrapper.appendChild(formWrap);
            }

            document.body.appendChild(wrapper);
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRuffleWrap);
        else initRuffleWrap();
        return;
    }

    // ── Games room index (all-games list) ─────────────────────────────────────
    // The /games/ root shows a showcase, not the full list. The real list lives
    // at /games/category.phtml: alphabetically grouped (a .gr-group-header per
    // letter, followed by sibling .ctp-med cards), paginated via ?page=N (a
    // windowed pagination table with no visible page-number text — just sprite
    // icons — so page numbers are inferred from each link's href, not scraped
    // text), with a premium-featured callout above it and four sort tabs
    // (A-Z / Newest / Difficulty / Popularity) baked into the server markup.
    //
    // Step 1 of this rebuild: get the full list loading correctly with working
    // pagination. Every page load — including the very first one — goes
    // through fetch() and a fresh DOMParser document rather than trusting the
    // live `document`, since by the time we'd scrape it we've already wiped
    // document.body to build the NeoUI shell.
    if (path === '/games/' || path === '/games/index.phtml' || path === '/games/category.phtml') {
        const initGamesRoom = function () {
            document.body.innerHTML = '';
            document.documentElement.style.background = 'var(--nui-bg)';
            document.body.style.cssText = 'margin:0;padding:0;background:var(--nui-bg);';
            document.body.className = 'nui-reset';
            NeoUI.init();
            NeoUI.buildTopbar({ username: '' });

            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'min-height:100vh;padding:calc(var(--nui-topbar-h) + 16px) 16px 32px;box-sizing:border-box;max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:16px;';

            const hdr = document.createElement('div');
            hdr.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
            hdr.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                    <div style="font-family:var(--nui-font-display);font-size:26px;font-weight:800;color:var(--nui-text);">🕹️ Games Room</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <a href="/games/favourites.phtml" class="nui-btn nui-btn-secondary nui-btn-sm" style="text-decoration:none;">⭐ Favourites</a>
                        <a href="/games/hiscores.phtml" class="nui-btn nui-btn-secondary nui-btn-sm" style="text-decoration:none;">🏆 Hi-Scores</a>
                    </div>
                </div>
                <div id="nui-games-sorttabs" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
                <input type="text" id="nui-games-search" placeholder="Filter this page…" class="nui-input" style="max-width:340px;padding:8px 12px;font-size:14px;">
            `;
            wrapper.appendChild(hdr);

            const loading = document.createElement('div');
            loading.style.cssText = 'display:flex;align-items:center;gap:10px;padding:32px 0;color:var(--nui-text-muted);font-size:14px;';
            loading.innerHTML = `<div style="width:20px;height:20px;border:3px solid var(--nui-border);border-top-color:var(--nui-accent);border-radius:50%;animation:spin 1s linear infinite;flex-shrink:0;"></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>Loading games…`;
            wrapper.appendChild(loading);
            document.body.appendChild(wrapper);

            const listBody = document.createElement('div');
            listBody.style.cssText = 'display:flex;flex-direction:column;gap:20px;';

            // ── Scraping ──────────────────────────────────────────────────────
            function scrapeSortTabs(doc, baseUrl) {
                const tabs = [];
                doc.querySelectorAll('#gr-category-list-main .navigation a.game-nav').forEach(function (a) {
                    tabs.push({
                        id: a.id,
                        href: new URL(a.getAttribute('href'), baseUrl).href,
                        active: /(^|\s)hovered(\s|$)/.test(a.className),
                    });
                });
                return tabs;
            }

            function scrapeFeatured(doc, baseUrl) {
                const el = doc.querySelector('#gr-ctp-premium-featured .ctp-premium-featured');
                if (!el) return null;
                const link = el.querySelector('a[href]');
                if (!link) return null;
                const img = el.querySelector('img');
                const titleEl = el.querySelector('.cont.title, .cont .title');
                return {
                    href: new URL(link.getAttribute('href'), baseUrl).href,
                    title: (titleEl ? titleEl.textContent : link.getAttribute('title') || '').trim(),
                    img: img ? new URL(img.getAttribute('src'), baseUrl).href : null,
                };
            }

            // Groups games by their alphabetical .gr-group-header, walking
            // direct children in document order (header, then its .ctp-med
            // siblings, repeat) rather than assuming any fixed count per group.
            function scrapeGroups(doc, baseUrl) {
                const midContent = doc.querySelector('#gr-category-list .mid-content');
                if (!midContent) return [];
                const groups = [];
                let current = null;
                Array.prototype.forEach.call(midContent.children, function (el) {
                    if (el.classList && el.classList.contains('gr-group-header')) {
                        const h2 = el.querySelector('h2');
                        current = { letter: h2 ? h2.textContent.trim() : '', games: [] };
                        groups.push(current);
                    } else if (el.classList && el.classList.contains('ctp-med')) {
                        if (!current) { current = { letter: '', games: [] }; groups.push(current); }
                        const link = el.querySelector('a[href]');
                        if (!link) return;
                        const img = el.querySelector('img');
                        const nameLink = el.querySelector('.name a');
                        current.games.push({
                            href: new URL(link.getAttribute('href'), baseUrl).href,
                            title: (nameLink ? nameLink.textContent : link.getAttribute('title') || '').trim(),
                            img: img ? new URL(img.getAttribute('src'), baseUrl).href : null,
                        });
                    }
                    // Anything else (br.clear, the pagination table, etc.) is
                    // a sibling here too — deliberately ignored by this walk.
                });
                return groups;
            }

            // The pagination table's page "numbers" are sprite-image divs with
            // no visible text, so page numbers come from each link's ?page=N
            // instead. The currently-viewed page has no link at all (just an
            // "inactive" marker div) — its number comes from the URL itself
            // (absent ?page= means page 0, matching how the site's own links
            // omit the param for page 0).
            // Discovers page numbers from each link's href rather than assuming
            // a fixed total, since the pagination window on any given page may
            // not expose the true last page.
            function scrapePagination(doc, baseUrl) {
                const table = doc.querySelector('#gr-category-list-pagination');
                const pages = new Set();
                if (table) {
                    table.querySelectorAll('a[href*="page="]').forEach(function (a) {
                        const m = a.getAttribute('href').match(/[?&]page=(\d+)/);
                        if (m) pages.add(parseInt(m[1], 10));
                    });
                }
                const u = new URL(baseUrl);
                const currentPage = u.searchParams.has('page') ? (parseInt(u.searchParams.get('page'), 10) || 0) : 0;
                pages.add(currentPage);
                return { currentPage: currentPage, pages: Array.from(pages).sort(function (a, b) { return a - b; }) };
            }

            function pageUrl(baseUrl, n) {
                const u = new URL(baseUrl);
                if (n > 0) u.searchParams.set('page', String(n));
                else u.searchParams.delete('page');
                return u.href;
            }

            // ── Rendering ─────────────────────────────────────────────────────
            function renderSortTabs(tabs) {
                const labels = { 'sort-name': 'A–Z', 'sort-newest': 'Newest', 'sort-difficulty': 'Difficulty', 'sort-popularity': 'Popularity' };
                const container = hdr.querySelector('#nui-games-sorttabs');
                container.innerHTML = '';
                tabs.forEach(function (t) {
                    const a = document.createElement('a');
                    a.href = t.href;
                    a.textContent = labels[t.id] || t.id;
                    a.className = 'nui-btn nui-btn-sm ' + (t.active ? 'nui-btn-primary' : 'nui-btn-secondary');
                    a.style.cssText = 'text-decoration:none;';
                    a.addEventListener('click', function (e) {
                        e.preventDefault();
                        loadPage(t.href);
                    });
                    container.appendChild(a);
                });
            }

            function renderFeatured(featured) {
                const existing = listBody.querySelector('#nui-games-featured');
                if (existing) existing.remove();
                if (!featured) return;
                const card = document.createElement('a');
                card.id = 'nui-games-featured';
                card.href = featured.href;
                card.className = 'nui-surface';
                card.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px;border-radius:var(--nui-radius-lg);border:1px solid var(--nui-border);text-decoration:none;color:var(--nui-text);box-shadow:0 4px 12px var(--nui-shadow);';
                card.innerHTML = `
                    ${featured.img ? '<img src="' + featured.img + '" style="width:64px;height:64px;object-fit:contain;border-radius:var(--nui-radius-md);background:var(--nui-surface-alt,#f4f4f4);flex-shrink:0;">' : ''}
                    <div>
                        <span class="nui-badge" style="font-size:11px;padding:3px 8px;">⭐ Featured</span>
                        <div style="font-weight:800;font-size:16px;margin-top:4px;">${featured.title}</div>
                    </div>
                `;
                listBody.insertBefore(card, listBody.firstChild);
            }

            function renderGroups(groups) {
                Array.prototype.forEach.call(listBody.querySelectorAll('.nui-games-group'), function (n) { n.remove(); });
                if (!groups.some(function (g) { return g.games.length; })) {
                    const empty = document.createElement('div');
                    empty.className = 'nui-games-group';
                    empty.style.cssText = 'padding:32px;text-align:center;color:var(--nui-text-muted);font-size:14px;';
                    empty.textContent = 'No games found on this page — Neopets may have updated their markup.';
                    listBody.appendChild(empty);
                    return;
                }
                groups.forEach(function (group) {
                    if (!group.games.length) return;
                    const sec = document.createElement('div');
                    sec.className = 'nui-games-group';
                    const secTitle = document.createElement('div');
                    secTitle.style.cssText = 'font-family:var(--nui-font-display);font-size:16px;font-weight:800;color:var(--nui-text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--nui-border);';
                    secTitle.textContent = group.letter || '#';
                    sec.appendChild(secTitle);

                    const grid = document.createElement('div');
                    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;';

                    group.games.forEach(function (g) {
                        const card = document.createElement('a');
                        card.href = g.href;
                        card.className = 'nui-surface nui-games-card';
                        card.setAttribute('data-title', g.title.toLowerCase());
                        card.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);text-decoration:none;color:var(--nui-text);text-align:center;transition:background var(--nui-dur-fast),transform var(--nui-dur-fast);';

                        const imgEl = document.createElement('div');
                        imgEl.style.cssText = 'width:60px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
                        if (g.img) {
                            const i = document.createElement('img');
                            i.src = g.img; i.alt = ''; i.loading = 'lazy';
                            i.style.cssText = 'width:60px;height:48px;object-fit:cover;border-radius:4px;';
                            i.onerror = function () { this.style.display = 'none'; };
                            imgEl.appendChild(i);
                        } else {
                            imgEl.textContent = '🎮';
                            imgEl.style.fontSize = '24px';
                        }

                        const label = document.createElement('span');
                        label.style.cssText = 'font-size:11px;font-weight:700;line-height:1.3;';
                        label.textContent = g.title;

                        card.appendChild(imgEl);
                        card.appendChild(label);
                        grid.appendChild(card);
                    });

                    sec.appendChild(grid);
                    listBody.appendChild(sec);
                });
            }

            function renderPagination(pagination, baseUrl) {
                const existing = listBody.querySelector('#nui-games-pagination');
                if (existing) existing.remove();
                const nav = document.createElement('div');
                nav.id = 'nui-games-pagination';
                nav.style.cssText = 'display:flex;justify-content:center;gap:6px;flex-wrap:wrap;padding-top:8px;';

                const maxPage = pagination.pages.length ? pagination.pages[pagination.pages.length - 1] : 0;
                const makeBtn = function (label, targetPage, disabled, primary) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = label;
                    b.className = 'nui-btn nui-btn-sm ' + (primary ? 'nui-btn-primary' : 'nui-btn-secondary');
                    b.disabled = !!disabled;
                    if (!disabled) {
                        b.addEventListener('click', function () { loadPage(pageUrl(baseUrl, targetPage)); });
                    }
                    return b;
                };

                nav.appendChild(makeBtn('← Prev', pagination.currentPage - 1, pagination.currentPage <= 0, false));
                pagination.pages.forEach(function (p) {
                    nav.appendChild(makeBtn(String(p + 1), p, false, p === pagination.currentPage));
                });
                nav.appendChild(makeBtn('Next →', pagination.currentPage + 1, pagination.currentPage >= maxPage, false));

                listBody.appendChild(nav);
            }

            function wireFilter() {
                const searchInput = hdr.querySelector('#nui-games-search');
                searchInput.value = '';
                searchInput.oninput = function () {
                    const q = this.value.toLowerCase().trim();
                    listBody.querySelectorAll('.nui-games-card').forEach(function (card) {
                        card.style.display = (!q || card.getAttribute('data-title').indexOf(q) !== -1) ? '' : 'none';
                    });
                    listBody.querySelectorAll('.nui-games-group').forEach(function (sec) {
                        const anyVisible = Array.prototype.some.call(sec.querySelectorAll('.nui-games-card'), function (c) { return c.style.display !== 'none'; });
                        sec.style.display = (anyVisible || !q) ? '' : 'none';
                    });
                };
            }

            function renderAll(doc, baseUrl) {
                if (loading.parentNode) loading.remove();
                if (!listBody.parentNode) wrapper.appendChild(listBody);
                listBody.style.opacity = '';
                renderSortTabs(scrapeSortTabs(doc, baseUrl));
                renderFeatured(scrapeFeatured(doc, baseUrl));
                renderGroups(scrapeGroups(doc, baseUrl));
                renderPagination(scrapePagination(doc, baseUrl), baseUrl);
                wireFilter();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            function loadPage(url) {
                if (listBody.parentNode) listBody.style.opacity = '0.5';
                else if (!loading.parentNode) wrapper.appendChild(loading);
                fetch(url, { credentials: 'include' })
                    .then(function (r) { return r.text(); })
                    .then(function (html) {
                        const doc = new DOMParser().parseFromString(html, 'text/html');
                        renderAll(doc, url);
                    })
                    .catch(function () {
                        listBody.style.opacity = '';
                        const err = document.createElement('div');
                        err.style.cssText = 'padding:16px;text-align:center;color:var(--nui-text-muted);';
                        err.textContent = 'Failed to load that page.';
                        listBody.appendChild(err);
                    });
            }

            // One page at a time — fetch fresh on every load (including the
            // first) since by this point document.body has already been
            // wiped to build the NeoUI shell, so the live `document` no
            // longer has anything to scrape even if we started out on
            // category.phtml ourselves.
            loadPage(path === '/games/category.phtml' ? location.href : '/games/category.phtml');
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGamesRoom);
        else initGamesRoom();
    }
})();

// MODULE 19: FRUIT MACHINE (HEADLESS SPA WRAPPER)
// ==============================================================================
// Activates on: /desert/fruit/index.phtml (and any sibling path under
//               /desert/fruit/).
//
// Mirrors the Buried Treasure module's approach: scrape whichever server-
// rendered state the page is currently in, rebuild it inside the shared
// NeoUI chrome, and drive the loop — spin, see the result, come back
// tomorrow — via fetch() instead of full page reloads.
//
// Only the "ready to spin" screen was available to sample, so that state is
// handled richly (matching the real markup: a form with a hidden spin=1
// field, a hidden ck token, and a submit button). The "already spun today"
// and "post-spin result" screens are unsampled — those scrapers match on
// plausible/common shapes and always keep a raw-HTML fallback, so the
// module degrades to "look mostly like the original page, just re-skinned"
// rather than rendering blank if Neopets' markup doesn't match what's
// guessed here. The actual spin submission always uses whatever hidden
// fields the live form contains (not just spin/ck), so if Neopets adds or
// changes fields later, nothing here needs to change to keep working.
// ==============================================================================

(function () {
    'use strict';

    if (!/\/desert\/fruit\//.test(location.pathname)) return;
    if (!window.NeoUI || !window.NeoUI.isModuleEnabled('fruit-machine')) return;

    const NeoUI = window.NeoUI;
    if (!NeoUI || !NeoUI.__ready) return;

    function showFatalError(err) {
        try {
            const box = document.createElement('div');
            box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee2e2;color:#7f1d1d;font:14px monospace;padding:15px;white-space:pre-wrap;max-height:50vh;overflow:auto;border-bottom:3px solid #dc2626;';
            box.textContent = 'Fruit Machine SPA crashed:\n' + (err && err.stack ? err.stack : String(err));
            document.body.insertBefore(box, document.body.firstChild);
        } catch (e2) {}
    }

    const DAILY_TIMERS_KEY = 'neoui_daily_timers_v1';
    const TIMER_ID = 'fruit-machine';

    // ─────────────────────────────────────────────────────────────────────────
    // Keep the shared Daily Timer Hub in sync, same as Buried Treasure does.
    // Fruit Machine is a once-a-day freebie rather than a fixed-minutes wait,
    // so when the server doesn't hand us an exact cooldown we fall back to
    // estimating time-to-reset from the page's own NST clock globals
    // (nh/nm/ns, set by Neopets' own inline clock script) rather than
    // fabricating a number.
    // ─────────────────────────────────────────────────────────────────────────
    function syncTimer(msFromNow) {
        try {
            const raw = localStorage.getItem(DAILY_TIMERS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(parsed) ? parsed : [];
            let entry = list.find(function (item) { return item && item.id === TIMER_ID; });
            if (!entry) { entry = { id: TIMER_ID }; list.push(entry); }
            entry.nextAt = Date.now() + msFromNow;
            localStorage.setItem(DAILY_TIMERS_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    function formatClock(msLeft) {
        const totalSec = Math.max(0, Math.ceil(msLeft / 1000));
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = function (n) { return String(n).padStart(2, '0'); };
        return pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    // Best-effort estimate of ms until the daily NST reset, using the same
    // nh/nm/ns globals Neopets' own inline clock script sets on every page.
    // Returns null (rather than guessing) if those globals aren't present.
    function msUntilMidnightNST() {
        try {
            if (typeof window.nh === 'number' && typeof window.nm === 'number' && typeof window.ns === 'number') {
                const secsLeft = (23 - window.nh) * 3600 + (59 - window.nm) * 60 + (60 - window.ns);
                if (secsLeft > 0 && secsLeft < 86400) return secsLeft * 1000;
            }
        } catch (e) {}
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCRAPERS — figure out which state `doc` holds
    // ─────────────────────────────────────────────────────────────────────────
    function scrapeState(doc, baseUrl) {
        const content = doc.querySelector('td.content') || doc.body;

        // Two real samples confirm div.result is the one container reused
        // across every sub-state: it holds the spin form when ready to
        // play, and plain, unwrapped text (no <b>/<strong>/<p>) when the
        // free spin's already been used for the day. We scope off it
        // directly rather than searching loosely across the whole page, so
        // whatever's actually inside it — including bare text — is what
        // gets shown, instead of silently falling back to a made-up message.
        const resultDiv = content.querySelector('div.result');
        const spinForm = resultDiv ? resultDiv.querySelector('form') : null;
        const hasSpinInput = spinForm && spinForm.querySelector('input[name="spin"][value="1"]');

        // Ready state: the sampled markup — a form holding a hidden
        // spin=1 field, a hidden ck token, and a submit button. Every hidden
        // field on the form is captured generically (not just spin/ck) so
        // the real POST body always matches whatever Neopets actually sends,
        // even if fields are added or renamed later.
        if (hasSpinInput) {
            const hidden = {};
            spinForm.querySelectorAll('input[type="hidden"]').forEach(function (inp) {
                const name = inp.getAttribute('name');
                if (name) hidden[name] = inp.value;
            });
            const submitBtn = spinForm.querySelector('input[type="submit"]');
            return {
                type: 'ready',
                action: spinForm.getAttribute('action') ? new URL(spinForm.getAttribute('action'), baseUrl).href : baseUrl,
                method: (spinForm.getAttribute('method') || 'post').toLowerCase(),
                hidden: hidden,
                submitLabel: submitBtn && submitBtn.value ? submitBtn.value : 'Spin, spin, spin!',
            };
        }

        // No form inside div.result: either the daily cooldown message
        // (sampled — plain text, e.g. "You've already had your free spin
        // for today. Please come back tomorrow and try again.") or a
        // post-spin result (unsampled). The exact text is always taken
        // straight from div.result — no generic placeholder — and a
        // phrasing check decides which of the two this is.
        if (resultDiv) {
            const resultText = resultDiv.textContent.replace(/\s+/g, ' ').trim();
            const isCooldown = /already\s+(?:had|used|taken|spun|played)[^.]{0,60}(?:spin|turn|go)|come back tomorrow|one\s+(?:free\s+)?spin\s+per\s+day/i.test(resultText);
            if (isCooldown) {
                return { type: 'cooldown', message: resultText };
            }

            // Result state (unsampled): best-effort scrape of a post-spin
            // outcome. Looks for a win/lose headline, any revealed fruit
            // images, and any prize table within div.result — but always
            // keeps div.result's raw HTML too, so the renderer can fall
            // back to "the original content, re-skinned" if none of the
            // guessed shapes actually match Neopets' markup.
            const fruitImgs = Array.prototype.map.call(
                resultDiv.querySelectorAll('img[src]'),
                function (img) { return new URL(img.getAttribute('src'), baseUrl).href; }
            );
            const prizeTableEl = resultDiv.querySelector('table.prizeCell, td.prizeCell')
                ? resultDiv.querySelector('table.prizeCell, td.prizeCell').closest('table')
                : null;
            const headlineEl = Array.prototype.find.call(resultDiv.querySelectorAll('b, strong'), function (el) {
                return /won|nothing|sorry|congrat/i.test(el.textContent);
            });

            return {
                type: 'result',
                headline: headlineEl ? headlineEl.textContent.replace(/\s+/g, ' ').trim() : null,
                fruitImgs: fruitImgs,
                prizeTableHtml: prizeTableEl ? prizeTableEl.outerHTML : null,
                rawHtml: resultDiv.innerHTML,
            };
        }

        // Completely unrecognized shape (no div.result at all): fall back
        // to scraping the whole content area rather than rendering nothing.
        const fruitImgsFallback = Array.prototype.map.call(
            content.querySelectorAll('#fruitMain img[src], .fruit img[src], img[src*="/desert/fruit/"]'),
            function (img) { return new URL(img.getAttribute('src'), baseUrl).href; }
        );
        const headlineElFallback = Array.prototype.find.call(content.querySelectorAll('b, strong'), function (el) {
            return /won|nothing|sorry|congrat/i.test(el.textContent);
        });
        return {
            type: 'result',
            headline: headlineElFallback ? headlineElFallback.textContent.replace(/\s+/g, ' ').trim() : null,
            fruitImgs: fruitImgsFallback,
            prizeTableHtml: null,
            rawHtml: content.innerHTML,
        };
    }

    async function fetchState(url, opts) {
        const res = await fetch(url, Object.assign({ credentials: 'include' }, opts || {}));
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return scrapeState(doc, url);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHARED CHROME — hero banner reused across every state
    // ─────────────────────────────────────────────────────────────────────────
    function buildBanner() {
        const banner = document.createElement('div');
        banner.className = 'nui-surface';
        banner.style.cssText = 'border-radius:var(--nui-radius-lg);border:1px solid var(--nui-border);overflow:hidden;box-shadow:0 4px 12px var(--nui-shadow);position:relative;';
        banner.innerHTML = `
            <div style="position:relative;width:100%;height:110px;overflow:hidden;background:linear-gradient(135deg,#5A3A1E 0%,#8C5A2A 50%,#5A3A1E 100%);display:flex;align-items:center;gap:14px;padding:0 var(--nui-space-4);">
                <img src="https://images.neopets.com/desert/fruit/fruit.png"
                     style="width:74px;height:56px;border-radius:var(--nui-radius-md);border:2px solid rgba(255,255,255,0.25);object-fit:contain;flex-shrink:0;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));background:#fff;"
                     onerror="this.style.display='none'">
                <div>
                    <div style="font-family:var(--nui-font-display);font-weight:800;font-size:26px;color:#FFD060;text-shadow:0 2px 8px rgba(0,0,0,0.6);line-height:1.1;">Fruit Machine</div>
                    <div style="font-size:12.5px;color:rgba(255,225,180,0.9);font-weight:600;margin-top:3px;text-shadow:0 1px 3px rgba(0,0,0,0.5);">Roll up, roll up! · once a day</div>
                </div>
            </div>
        `;
        return banner;
    }

    function backToSakhmetButton() {
        const btn = document.createElement('a');
        btn.href = '/desert/sakhmet.phtml';
        btn.className = 'nui-btn nui-btn-secondary nui-btn-block';
        btn.style.cssText = 'text-decoration:none;display:block;box-sizing:border-box;';
        btn.textContent = '← Return to Sakhmet';
        return btn;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE RENDERERS
    // ─────────────────────────────────────────────────────────────────────────
    let clockInterval = null;
    function clearClock() {
        if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
    }

    function renderReady(wrapper, state) {
        clearClock();
        wrapper.innerHTML = '';
        wrapper.appendChild(buildBanner());

        const card = document.createElement('div');
        card.className = 'nui-surface';
        card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-lg);padding:var(--nui-space-5) var(--nui-space-4);box-shadow:0 4px 12px var(--nui-shadow);text-align:center;display:flex;flex-direction:column;align-items:center;gap:var(--nui-space-3);';
        card.innerHTML = `
            <img src="https://images.neopets.com/desert/fruit/bg.jpg" style="width:100%;max-width:420px;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);" onerror="this.style.display='none'">
            <div style="font-size:15px;color:var(--nui-text-muted);line-height:1.5;max-width:420px;">
                It's the one and only Neopets Fruit Machine. Match the first two
                fruits for a prize, or all three for a really big prize.
            </div>
            <button type="button" id="fm-spin-btn" class="nui-btn nui-btn-primary" style="font-size:16px;padding:14px 28px;border-radius:30px;width:100%;max-width:300px;box-shadow:0 4px 12px var(--nui-shadow);">
                ${state.submitLabel}
            </button>
        `;
        wrapper.appendChild(card);
        wrapper.appendChild(backToSakhmetButton());

        card.querySelector('#fm-spin-btn').addEventListener('click', async function () {
            const btn = this;
            btn.disabled = true;
            btn.textContent = 'Spinning...';
            try {
                const body = new URLSearchParams(state.hidden);
                const next = await fetchState(state.action, {
                    method: state.method === 'get' ? 'GET' : 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: state.method === 'get' ? undefined : body.toString(),
                });
                renderState(wrapper, next);
            } catch (err) {
                showFatalError(err);
                btn.disabled = false;
                btn.textContent = state.submitLabel;
            }
        });
    }

    function renderCooldown(wrapper, state) {
        clearClock();
        wrapper.innerHTML = '';
        wrapper.appendChild(buildBanner());

        const knownMs = msUntilMidnightNST();
        const targetAt = knownMs != null ? Date.now() + knownMs : null;
        if (knownMs != null) syncTimer(knownMs);

        const card = document.createElement('div');
        card.className = 'nui-surface';
        card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-lg);padding:var(--nui-space-5) var(--nui-space-4);box-shadow:0 4px 12px var(--nui-shadow);text-align:center;display:flex;flex-direction:column;align-items:center;gap:var(--nui-space-3);';
        card.innerHTML = `
            <div style="font-size:15px;font-weight:700;color:var(--nui-text);">${state.message}</div>
            ${targetAt != null
                ? '<div id="fm-clock" style="font-family:var(--nui-font-display);font-size:32px;font-weight:800;color:var(--nui-accent);letter-spacing:1px;">' + formatClock(targetAt - Date.now()) + '</div><div style="font-size:12px;color:var(--nui-text-faint);">estimated time until your next free spin</div>'
                : '<div style="font-size:12px;color:var(--nui-text-faint);">Come back tomorrow for another free spin.</div>'}
            <button type="button" id="fm-retry-btn" class="nui-btn nui-btn-secondary" style="width:100%;max-width:260px;">Check Again</button>
        `;
        wrapper.appendChild(card);
        wrapper.appendChild(backToSakhmetButton());

        if (targetAt != null) {
            const clockEl = card.querySelector('#fm-clock');
            clockInterval = setInterval(function () {
                const remaining = targetAt - Date.now();
                if (remaining <= 0) {
                    clockEl.textContent = '00:00:00';
                    clearClock();
                    return;
                }
                clockEl.textContent = formatClock(remaining);
            }, 1000);
        }

        card.querySelector('#fm-retry-btn').addEventListener('click', async function () {
            const btn = this;
            btn.disabled = true;
            btn.textContent = 'Checking...';
            try {
                const next = await fetchState(new URL('index.phtml', location.href).href);
                renderState(wrapper, next);
            } catch (err) {
                showFatalError(err);
                btn.disabled = false;
                btn.textContent = 'Check Again';
            }
        });
    }

    function renderResult(wrapper, state) {
        clearClock();
        wrapper.innerHTML = '';
        wrapper.appendChild(buildBanner());

        const headline = state.headline;
        const isWin = headline ? !/nothing|sorry/i.test(headline) : null;
        const hasStructured = !!(headline || state.fruitImgs.length || state.prizeTableHtml);

        const fruitImgsHtml = state.fruitImgs.length
            ? '<div style="display:flex;gap:var(--nui-space-3);justify-content:center;flex-wrap:wrap;">' +
                state.fruitImgs.map(function (src) {
                    return '<img src="' + src + '" style="width:83px;height:62px;object-fit:contain;border-radius:var(--nui-radius-md);border:1px solid var(--nui-border);background:var(--nui-surface-alt,#f4f4f4);">';
                }).join('') +
              '</div>'
            : '';

        const card = document.createElement('div');
        card.className = 'nui-surface';
        card.style.cssText = 'border:1px solid var(--nui-border);border-radius:var(--nui-radius-lg);padding:var(--nui-space-5) var(--nui-space-4);box-shadow:0 4px 12px var(--nui-shadow);text-align:center;display:flex;flex-direction:column;align-items:center;gap:var(--nui-space-3);';

        if (hasStructured) {
            card.innerHTML = `
                ${isWin === true ? '<span class="nui-badge nui-badge-success" style="font-size:12px;padding:5px 12px;">🎉 Winner!</span>' : ''}
                ${isWin === false ? '<span class="nui-badge" style="font-size:12px;padding:5px 12px;">🍒 No Match</span>' : ''}
                ${fruitImgsHtml}
                ${headline ? '<div style="font-family:var(--nui-font-display);font-size:19px;font-weight:800;color:' + (isWin ? 'var(--nui-success, #16a34a)' : 'var(--nui-text)') + ';line-height:1.4;">' + headline + '</div>' : ''}
                ${state.prizeTableHtml ? '<div style="font-size:13px;color:var(--nui-text-muted);">' + state.prizeTableHtml + '</div>' : ''}
                <button type="button" id="fm-refresh-btn" class="nui-btn nui-btn-secondary" style="width:100%;max-width:260px;">Refresh</button>
            `;
        } else {
            // Safety net: none of the guessed shapes matched. Show the
            // original scraped content, re-skinned into the card, rather than
            // rendering nothing.
            card.innerHTML = `
                <div style="font-size:14px;color:var(--nui-text);line-height:1.6;text-align:left;width:100%;">${state.rawHtml}</div>
                <button type="button" id="fm-refresh-btn" class="nui-btn nui-btn-secondary" style="width:100%;max-width:260px;">Refresh</button>
            `;
        }

        wrapper.appendChild(card);
        wrapper.appendChild(backToSakhmetButton());

        card.querySelector('#fm-refresh-btn').addEventListener('click', async function () {
            const btn = this;
            btn.disabled = true;
            btn.textContent = 'Refreshing...';
            try {
                const next = await fetchState(new URL('index.phtml', location.href).href);
                renderState(wrapper, next);
            } catch (err) {
                showFatalError(err);
                btn.disabled = false;
                btn.textContent = 'Refresh';
            }
        });
    }

    function renderState(wrapper, state) {
        if (state.type === 'ready') return renderReady(wrapper, state);
        if (state.type === 'cooldown') return renderCooldown(wrapper, state);
        return renderResult(wrapper, state);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────────────────────
    async function init() {
        const profile = NeoUI.scrapeLegacyProfile();
        const initialState = scrapeState(document, location.href);

        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        document.documentElement.style.background = 'var(--nui-bg)';
        document.body.style.background = 'var(--nui-bg)';

        NeoUI.init();
        NeoUI.setProfileInfo(profile);
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc }, hasNotification: profile.hasNotification });

        const wrapper = document.createElement('div');
        wrapper.className = 'nui-reset';
        wrapper.style.cssText = 'padding: calc(var(--nui-topbar-h) + var(--nui-space-4)) var(--nui-space-4) var(--nui-space-5); max-width: 560px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--nui-space-4);';
        document.body.appendChild(wrapper);

        renderState(wrapper, initialState);
    }

    let booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        init().catch(showFatalError);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        boot();
    } else {
        document.addEventListener('DOMContentLoaded', boot);
    }

})();
