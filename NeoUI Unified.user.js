// ==UserScript==
// @name         NeoUI: Unified Suite
// @namespace    ext1nct
// @version      1.0.1
// @description  Mobile-forward Neopets overhaul suite (Core design system + Neomail + Wishing Well + Item Transfer Log) bundled as a single script. Each module self-activates only on its own page.
// @author       ext1nct
// @match        *://*.neopets.com/*
// @grant        none
// @run-at       document-end
// @license      MIT
// ==/UserScript==

/*
 * ============================================================================
 * NEOUI: UNIFIED SUITE
 * ----------------------------------------------------------------------------
 * This file bundles four previously-separate userscripts into one so there's
 * a single install/update instead of juggling @require URLs:
 *
 *   1. NeoUI Core Framework   - design tokens, component CSS, window.NeoUI
 *                               runtime, PLUS shared scrapeLegacyProfile()
 *                               and buildTopbar() helpers so every page's
 *                               header looks/behaves identically instead of
 *                               each module keeping its own copy in sync.
 *   2. NeoUI Neomail          - mobile SPA overhaul for /neomessages.phtml
 *   3. NeoUI Wishing Well     - mobile overhaul for /wishing.phtml, now
 *                               using the shared topbar/scrape helpers
 *   4. Item Transfer Log      - reformatted /items/transfer_list.phtml,
 *                               restyled onto NeoUI's design tokens, given a
 *                               real mobile viewport, a responsive card
 *                               layout, and the same shared topbar - plus a
 *                               visible crash box like the other modules
 *                               instead of failing silently.
 *
 * v1.0.1 fix: the legacy chrome-hiding CSS in the Transfer Log module used
 * to hide `.premium_bar_spacer`, which on this Neopets template is the class
 * on #main itself (the wrapper around the ENTIRE page - header, content,
 * footer). That hid the whole page body, including the cards we'd just
 * built, while leaving the topbar (appended directly to <body>, outside
 * #main) and the premium ad dock (which sits after #main closes) visible -
 * exactly the blank-page symptom. Fixed to hide only the specific legacy
 * pieces meant to be replaced (#header, #footer, #ban, sidebar, premium
 * dock) and never #main/.premium_bar_spacer itself.
 *
 * Each module below still starts life as its own IIFE and only takes action
 * once it confirms (via location.pathname) that it's on the right page, so
 * behavior is identical to running the four scripts side-by-side - just one
 * file, one version number, one theme applied everywhere.
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
                '--nui-texture':       'repeating-linear-gradient(45deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 12px)',
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
                '--nui-texture':       'radial-gradient(ellipse 55% 40% at 15% 20%, var(--nui-accent-2-soft) 0%, transparent 70%), radial-gradient(ellipse 45% 35% at 82% 65%, var(--nui-accent-soft) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 45% 90%, var(--nui-accent-2-soft) 0%, transparent 70%)',
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
                '--nui-texture':       'repeating-linear-gradient(115deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(25deg, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 20px)',
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
                '--nui-texture':       'radial-gradient(circle at 12% 25%, var(--nui-accent-2) 1px, transparent 1.5px), radial-gradient(circle at 30% 65%, var(--nui-text) 1px, transparent 1.5px), radial-gradient(circle at 55% 20%, var(--nui-accent) 1px, transparent 1.5px), radial-gradient(circle at 72% 55%, var(--nui-text) 1px, transparent 1.5px), radial-gradient(circle at 88% 30%, var(--nui-accent-2) 1px, transparent 1.5px), radial-gradient(circle at 45% 85%, var(--nui-text) 1px, transparent 1.5px), radial-gradient(circle at 95% 75%, var(--nui-accent) 1px, transparent 1.5px)',
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
                '--nui-texture':       'repeating-radial-gradient(circle at 50% 130%, var(--nui-border) 0, var(--nui-border) 1px, transparent 1px, transparent 14px)',
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
                '--nui-texture':       'radial-gradient(ellipse 65% 55% at 18% 30%, var(--nui-accent-soft) 0%, transparent 80%), radial-gradient(ellipse 55% 45% at 78% 70%, var(--nui-accent-2-soft) 0%, transparent 80%), radial-gradient(ellipse 45% 40% at 50% 5%, var(--nui-surface-2) 0%, transparent 80%)',
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
                '--nui-texture':       'none',
            },
        },
    };

    // Fix a stray typo-safe fallback in case of any malformed hex above.
    Object.keys(THEMES).forEach(function (key) {
        const t = THEMES[key].tokens;
        Object.keys(t).forEach(function (tk) {
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
        --nui-font-display: "Museo", "Segoe UI Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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

        /* ---------- Surfaces & Type ---------- */
        .nui-surface { background: var(--nui-surface); }
        .nui-text { color: var(--nui-text); }
        .nui-text-muted { color: var(--nui-text-muted); }
        .nui-font-display { font-family: var(--nui-font-display); }

        /* ---------- Top Bar ---------- */
                              .nui-header-wrapper {
            position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
            background-color: var(--nui-bg);
            background-image:
                linear-gradient(to bottom, transparent 30%, var(--nui-bg) 100%),
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
        }
        .nui-hnav::-webkit-scrollbar { display: none; }

        .nui-pill {
            color: var(--nui-text-muted);
            text-decoration: none;
            font-weight: 600;
            font-size: 13.5px;
            background: var(--nui-surface-2);
            padding: 7px 14px;
            border-radius: var(--nui-radius-pill);
            transition: background var(--nui-dur-fast) var(--nui-ease), color var(--nui-dur-fast) var(--nui-ease), transform var(--nui-dur-fast) var(--nui-ease);
            flex-shrink: 0;
            border: 1px solid transparent;
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
    margin: 8px 12px; /* Adds space around each item */
    border-radius: var(--nui-radius-md); /* Rounds the cards */
    border: 1px solid var(--nui-border);
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 14px;
    align-items: center;
    background: var(--nui-surface);
    box-shadow: 0 2px 4px var(--nui-shadow); /* Adds a subtle shadow */
    transition: transform var(--nui-dur-fast) var(--nui-ease), background var(--nui-dur-fast) var(--nui-ease);
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
            border-radius: 50%; width: 100%; height: 100%;
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
    overflow: hidden;
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
    background: transparent; /* No background needed if image covers */
    border: 4px solid var(--nui-surface);
    box-shadow: 0 4px 12px var(--nui-shadow);
    flex-shrink: 0;
    object-fit: cover;
    margin-left: -10px; /* Pulls it slightly left for visual balance */
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

        .nui-drawer-section { margin: var(--nui-space-3) 0; }
        .nui-drawer-section-title {
            font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;
            color: var(--nui-text); font-weight: 800;
            background: var(--nui-surface-2);
            padding: 12px 14px; margin-bottom: 4px;
            border-radius: var(--nui-radius-sm);
            transition: filter var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-drawer-section-title:active { filter: brightness(0.9); }

        /* Hides the default browser triangle markers on the accordion */
        details.nui-drawer-section summary::-webkit-details-marker { display: none; }
        details.nui-drawer-section summary { list-style: none; }

        .nui-drawer-item {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 6px; font-size: 14px; font-weight: 600; color: var(--nui-text);
            text-decoration: none; border-radius: var(--nui-radius-sm);
            transition: background var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-drawer-item:active { background: var(--nui-surface-2); }
        .nui-drawer-item .nui-drawer-ic { width: 20px; text-align: center; flex-shrink: 0; font-size: 15px; }
        .nui-drawer-item.is-action { color: var(--nui-accent); }
        .nui-drawer-item.is-danger { color: var(--nui-danger); }

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
    const SITE_NAV = [
        {
            title: 'My Account',
            items: [
                { label: 'Control Panel', href: '/myaccount.phtml' },
                { label: 'Preferences', href: '/preferences.phtml' },
                { label: 'Edit Profile', href: '/userinfo.phtml' },
                { label: 'Neomail', href: '/neomessages.phtml' },
                { label: 'Neofriends', href: '/neofriends.phtml' },
                { label: 'Create a Neopet', href: '/addpet.phtml' },
                { label: 'Redeem Code', href: '/space/warehouse/prizecodes.phtml' },
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
            title: 'Games',
            items: [
                { label: 'Games Room', href: '/games/' },
                { label: 'High Scores', href: '/games/hiscores.phtml' },
                { label: 'Favourites', href: '/games/favourites.phtml' },
                { label: 'Battledome', href: '/dome/' },
            ],
        },
        {
            title: 'Explore',
            items: [
                { label: 'Map of Neopia', href: '/explore.phtml' },
                { label: 'Neopedia', href: '/neopedia.phtml' },
                { label: 'Pet Central', href: '/petcentral.phtml' },
                { label: 'Calendar', href: '/calendar.phtml' },
            ],
        },
        {
            title: 'News',
            items: [
                { label: 'New Features', href: '/nf.phtml' },
                { label: 'Neopian Times', href: '/ntimes/index.phtml' },
                { label: 'Coming Soon', href: '/comingsoon.phtml' },
            ],
        },
        {
            title: 'Community',
            items: [
                { label: 'Hub', href: '/community/index.phtml' },
                { label: 'Neoboards', href: '/neoboards/index.phtml' },
                { label: 'Spotlights', href: '/contests.phtml' },
                { label: 'Guilds', href: '/guilds/index.phtml' },
            ],
        },
        {
            title: 'Shops',
            items: [
                { label: 'Neopia Central', href: '/objects.phtml' },
                { label: 'Shop Wizard', href: '/market.phtml?type=wizard' },
                { label: 'Your Shop', href: '/market.phtml?type=your' },
                { label: 'Auctions', href: '/auctions.phtml' },
                { label: 'Trading Post', href: '/island/tradingpost.phtml' },
                { label: 'Bank', href: '/bank.phtml' },
            ],
        },
        {
            title: 'NC Mall',
            items: [
                { label: 'Shop', href: 'https://ncmall.neopets.com/mall/shop.phtml' },
                { label: 'Get Neocash', href: 'https://nc.neopets.com/get-neocash' },
                { label: 'Redeem Neocash Cards', href: 'https://nc.neopets.com/redeemnc' },
            ],
        },
        {
            title: 'Premium',
            items: [
                { label: 'Manage Membership', href: 'http://nc.neopets.com/managemembership/' },
            ],
        },
    ];

    function getStoredTheme() {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            return THEMES[v] ? v : DEFAULT_THEME;
        } catch (e) { return DEFAULT_THEME; }
    }

    function persistTheme(name) {
        try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
    }

    function applyThemeVars(name) {
        const theme = THEMES[name] || THEMES[DEFAULT_THEME];
        const root = document.documentElement;
        root.setAttribute(ROOT_ATTR, name);
        Object.keys(theme.tokens).forEach(function (key) {
            root.style.setProperty(key, theme.tokens[key]);
        });
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
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
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
        const userLink = document.querySelector('.user a[href^="/userlookup.phtml?user="]');
        const petImg = document.querySelector('.activePet img');
        const petName = document.querySelector('.sidebarHeader a b');
        const npEl = document.getElementById('npanchor');
        const ncEl = document.getElementById('ncanchor');
        
        // Detect the event icon cell before nuking the DOM
        const hasNotification = document.querySelector('.eventIcon.sf') !== null;

        return {
            username: userLink ? userLink.textContent.trim() : 'Neopian',
            petname: petName ? petName.textContent.trim() : 'Unknown Pet',
            petImage: petImg ? petImg.src : 'https://images.neopets.com/themes/h5/basic/images/mystery-icon.png',
            np: npEl ? npEl.textContent.trim() : '0',
            nc: ncEl ? ncEl.textContent.trim() : '0',
            hasNotification: hasNotification
        };
    }


    // ---- Shared fixed topbar (logo + NeoGo button + NP/NC) ----
    // This is THE topbar markup for the suite. Every page-level module calls
    // this same function so the header looks and behaves identically
    // everywhere, instead of each script hand-rolling its own version.
    // Returns the wrapper element (idempotent - safe to call more than once).
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
        wrapper.innerHTML =
            '<div class="nui-topbar" style="position: relative;">' +
                '<div style="display:flex; align-items:center; gap:10px; z-index:2;" id="nui-topbar-neogo-slot"></div>' +
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
                '<div class="nui-topbar-stats" id="nui-topbar-stats" style="z-index:2;">NP: <b>' + stats.np + '</b> &nbsp; NC: <b>' + stats.nc + '</b></div>' +
            '</div>';
        document.body.insertBefore(wrapper, document.body.firstChild);
        wrapper.querySelector('#nui-topbar-neogo-slot').appendChild(buildNeoGoButton());
        return wrapper;
    }

    // ---- Settings panel sections (extensible) ----
    // Each section is {id, title, render(container)}. Theme picker ships
    // built-in; consuming apps can push more via NeoUI.registerSettingsSection.
    const settingsSections = [];

    function renderThemeSection(container) {
        const optionsHtml = Object.keys(THEMES).map(function (key) {
            const t = THEMES[key];
            const tk = t.tokens;
            return (
                '<div class="nui-theme-option" data-theme="' + key + '">' +
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
        }).join('');

        container.innerHTML =
            '<div class="nui-drawer-section-title">Theme</div>' +
            '<div class="nui-theme-grid">' + optionsHtml + '</div>';

        function refresh() {
            const current = getStoredTheme();
            container.querySelectorAll('.nui-theme-option').forEach(function (opt) {
                opt.classList.toggle('is-selected', opt.getAttribute('data-theme') === current);
            });
        }
        container.querySelectorAll('.nui-theme-option').forEach(function (opt) {
            opt.addEventListener('click', function () {
                setTheme(opt.getAttribute('data-theme'));
                refresh();
            });
        });
        refresh();
    }

    settingsSections.push({ id: 'theme', title: 'Theme', render: renderThemeSection });

    function registerSettingsSection(section) {
        if (section && section.id && typeof section.render === 'function') {
            settingsSections.push(section);
        }
    }

    // ---- Drawer (NeoGo nav + nested settings) ----
    let drawerBuilt = false;
    let drawerEl = null;
    let listeners = [];

    function buildDrawer() {
        if (drawerBuilt) return;
        drawerBuilt = true;

        const navHtml = SITE_NAV.map(function (section) {
    const itemsHtml = section.items.map(function (item) {
        return '<a class="nui-drawer-item" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    return (
        '<details class="nui-drawer-section">' +
            '<summary class="nui-drawer-section-title" style="cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">' +
                section.title +
                '<span style="font-size: 10px; opacity: 0.5;">▼</span>' +
            '</summary>' +
            '<div style="margin-top: 8px;">' + itemsHtml + '</div>' +
        '</details>'
    );
}).join('');

                const backdrop = h('div', { class: 'nui-drawer-backdrop nui-reset' },
            '<div class="nui-drawer" data-active-view="nav"><div class="nui-drawer-views"><div class="nui-drawer-view" data-view="nav">' +

                // Profile Section updated with an img tag for the pet
                '<div class="nui-drawer-profile">' +
                    '<img class="nui-drawer-avatar" data-slot="petImage" src="https://images.neopets.com/themes/h5/basic/images/mystery-icon.png" alt="Pet">' +
                    '<div>' +
                        '<div class="nui-drawer-name" data-slot="username">Neopian</div>' +
                        '<div class="nui-drawer-sub" data-slot="petname"></div>' +
                    '</div>' +
                '</div>' +

                // (The redundant stats block has been deleted from here)

                '<a class="nui-drawer-item is-action" href="/quickref.phtml">Quickref</a>' + navHtml +
                '<div class="nui-drawer-section"><div class="nui-drawer-item" data-action="open-settings">Settings</div><a class="nui-drawer-item is-danger" href="/logout.phtml">Logout</a></div>' +
            '</div><div class="nui-drawer-view" data-view="settings"><div class="nui-drawer-back" data-action="back-to-nav">&larr; Back</div><div data-slot="settings-sections"></div></div></div></div>'
        );


        const drawer = backdrop.querySelector('.nui-drawer');
        const settingsContainer = backdrop.querySelector('[data-slot="settings-sections"]');

        function renderSettings() {
            settingsContainer.innerHTML = '';
            settingsSections.forEach(function (section) {
                const wrap = document.createElement('div');
                wrap.className = 'nui-drawer-section';
                settingsContainer.appendChild(wrap);
                section.render(wrap);
            });
        }

        function openDrawer() { backdrop.classList.add('is-open'); }
        function closeDrawer() {
            backdrop.classList.remove('is-open');
            drawer.setAttribute('data-active-view', 'nav');
        }

        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) closeDrawer();
        });
        backdrop.querySelector('[data-action="open-settings"]').addEventListener('click', function () {
            renderSettings();
            drawer.setAttribute('data-active-view', 'settings');
        });
        backdrop.querySelector('[data-action="back-to-nav"]').addEventListener('click', function () {
            drawer.setAttribute('data-active-view', 'nav');
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

        // We only map username and petname now
        const map = { username: info.username, petname: info.petname };

        Object.keys(map).forEach(function (key) {
            if (map[key] === undefined) return;
            const el = drawerEl.querySelector('[data-slot="' + key + '"]');
            if (el) el.textContent = map[key];
        });

        // Target the image slot and update the src attribute
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
        VERSION: '2.2.0',
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
        get isInitialized() { return initialized; },
    };

})(window);

// ==============================================================================
// MODULE 2: NEOUI NEOMAIL
// ==============================================================================

(function () {
    'use strict';

    if (/\/neomessages\.phtml/.test(location.pathname)) {
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
                document.querySelectorAll(`.nui-bubble[data-vibe-user="${CSS.escape(key)}"]`).forEach(function (el) {
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
            const stats = getStats();
            headerWrapper.querySelector('#neomail-stats').innerHTML = `NP: <b>${stats.np}</b> &nbsp; NC: <b>${stats.nc}</b>`;

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
        NeoUI.buildTopbar({ stats: activeStats });

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
        NeoUI.buildTopbar({ stats: { np: profile.np, nc: profile.nc } });

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

    function run() {
        const NeoUI = window.NeoUI;
        if (!NeoUI || !NeoUI.__ready) { throw new Error('NeoUI Core Framework missing.'); }

        // 1. Scrape the legacy events table
        const events = [];
        const eventForm = document.querySelector('form[name="eventform"]');
        
        if (eventForm) {
            // Skip the header row (index 0) and the control row (last index)
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

        // 2. Nuke the DOM
        document.body.innerHTML = '';
        document.body.className = 'nui-reset';
        
        // Make the background transparent or match the drawer, remove default padding
        document.documentElement.style.background = 'var(--nui-surface)';
        document.body.style.background = 'var(--nui-surface)';
        document.body.style.padding = '0';
        document.body.style.margin = '0';
        document.body.style.overflowX = 'hidden';

        // 3. Initialize NeoUI core tokens (skip topbar injection for the iframe)
        NeoUI.init({ showNeoGoButton: false }); 

        // 4. Build the Compact UI
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'padding: var(--nui-space-3); display: flex; flex-direction: column; gap: var(--nui-space-3);';
        document.body.appendChild(wrapper);

        // Header & Actions
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--nui-border); padding-bottom: var(--nui-space-2);';
        
        const title = document.createElement('div');
        title.className = 'nui-text';
        title.style.cssText = 'font-weight: 800; font-size: 18px; font-family: var(--nui-font-display);';
        title.textContent = `Notifications (${events.length})`;
        
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'nui-btn nui-btn-sm';
        clearAllBtn.style.cssText = 'background: var(--nui-danger-soft); color: var(--nui-danger); border: none; font-size: 12px; padding: 6px 10px;';
        clearAllBtn.textContent = 'Clear All';
        
        header.appendChild(title);
        if (events.length > 0) header.appendChild(clearAllBtn);
        wrapper.appendChild(header);

        // Event List Form
        if (events.length > 0) {
            const form = document.createElement('form');
            form.action = 'process_allevents.phtml';
            form.method = 'POST';
            form.style.cssText = 'display: flex; flex-direction: column; gap: var(--nui-space-2);';

            events.forEach(ev => {
                const item = document.createElement('div');
                item.className = 'nui-surface-2';
                item.style.cssText = 'border-radius: var(--nui-radius-md); padding: var(--nui-space-3); display: flex; gap: var(--nui-space-3); align-items: flex-start; position: relative;';

                item.innerHTML = `
                    <a href="${ev.actionUrl}" target="_parent" style="flex-shrink: 0; display: block; border-radius: var(--nui-radius-sm); overflow: hidden; background: var(--nui-surface); padding: 4px; border: 1px solid var(--nui-border);">
                        <img src="${ev.imgSrc}" style="width: 36px; height: 36px; display: block; object-fit: cover;">
                    </a>
                    <div style="flex: 1; min-width: 0; font-size: 13px; line-height: 1.4;">
                        <div style="font-weight: 800; color: var(--nui-text); margin-bottom: 2px;">${ev.type}</div>
                        <div class="nui-text-muted" style="word-wrap: break-word;">${ev.descHtml}</div>
                        <div style="font-size: 11px; color: var(--nui-text-faint); margin-top: 4px; font-weight: 600;">${ev.time}</div>
                    </div>
                    <label style="flex-shrink: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: var(--nui-surface); border: 1px solid var(--nui-border);">
                        <input type="checkbox" name="${ev.delName}" style="margin: 0; width: 16px; height: 16px; accent-color: var(--nui-danger);">
                    </label>
                `;
                
                // Clicking the description also clicks the link
                const textWrap = item.querySelector('div.nui-text-muted');
                textWrap.querySelectorAll('a').forEach(a => {
                    a.style.color = 'var(--nui-accent)';
                    a.style.fontWeight = 'bold';
                    a.style.textDecoration = 'none';
                    a.setAttribute('target', '_parent'); // Break out of iframe
                });

                form.appendChild(item);
            });

            // Delete Selected Button
            const submitBtn = document.createElement('button');
            submitBtn.type = 'submit';
            submitBtn.className = 'nui-btn nui-btn-secondary nui-btn-block nui-btn-sm';
            submitBtn.style.marginTop = 'var(--nui-space-2)';
            submitBtn.textContent = 'Clear Selected';
            form.appendChild(submitBtn);

            wrapper.appendChild(form);

            // Handle "Clear All" via the hidden POST form logic from Neopets
            clearAllBtn.addEventListener('click', () => {
                const confirmed = window.confirm('Clear all notifications?');
                if (confirmed) {
                    const wipeForm = document.createElement('form');
                    wipeForm.action = 'process_allevents.phtml';
                    wipeForm.method = 'POST';
                    wipeForm.innerHTML = `<input type="hidden" name="type" value="all">`;
                    document.body.appendChild(wipeForm);
                    wipeForm.submit();
                }
            });

        } else {
            wrapper.innerHTML += `<div class="nui-empty" style="padding-top: var(--nui-space-5);"><span class="nui-empty-emoji">✨</span><br>All caught up!</div>`;
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        run();
    } else {
        document.addEventListener('DOMContentLoaded', run);
    }
})();
