// ==UserScript==
// @name         NeoUI Core Framework
// @namespace    http://tampermonkey.net/
// @version      0.9.1
// @description  Shared design system & runtime for the Neopets Mobile Overhaul suite. Other scripts @require this.
// @author       Ext1nct
// @match        *://*.neopets.com/*
// @grant        none
// ==/UserScript==

/*
 * ============================================================================
 * NEOUI CORE
 * ----------------------------------------------------------------------------
 * A standalone, @require-able design system for Neopets mobile-overhaul
 * userscripts. Provides:
 *
 * 1. Design tokens (CSS variables) for 7 swappable themes
 * 2. A base component library (topbar, nav, list items, bubbles, buttons,
 * forms, badges, empty states, modals)
 * 3. A tiny JS runtime: window.NeoUI
 * - NeoUI.init()                 mounts styles + floating theme menu
 * - NeoUI.setTheme(name)         switches theme, persists, broadcasts
 * - NeoUI.getTheme()             current theme name
 * - NeoUI.injectViewport()       forces mobile viewport meta
 * - NeoUI.mount(el)              appends el to document.body
 * - NeoUI.h(tag, attrs, html)    tiny element-creation helper
 * - NeoUI.THEMES                 theme metadata (for custom pickers)
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
            emoji: '🏠',
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
            position: fixed;
            top: 0; left: 0; right: 0; z-index: 9999;
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
           gradient still safely references single var(--nui-*) tokens.
        */
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
               Denser and larger toward the bottom to suggest they're rising.
            */
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
            font-family: "TP Cafeteria", cursive;
            /* New decorative font */
            font-weight: 400;
            font-size: 26px;
            /* Bumped up size for the stylized font */
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
    border-radius: var(--nui-radius-md);
    /* Rounds the cards */
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
            align-self: flex-end; background: var(--nui-accent-2-soft);
            border-color: var(--nui-accent-2-soft);
            border-bottom-right-radius: 6px;
        }
        .nui-bubble.is-theirs {
            align-self: flex-start; border-bottom-left-radius: 6px;
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
            flex-shrink: 0; transition: transform var(--nui-dur-fast) var(--nui-ease-snap);
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
            transform: translateX(-100%); transition: transform var(--nui-dur-slow) var(--nui-ease);
            display: flex; flex-direction: column;
            overflow: hidden;
        }
        .nui-drawer-backdrop.is-open .nui-drawer { transform: translateX(0); }

        .nui-drawer-views {
            position: relative; flex: 1;
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
            transform: translateX(100%); background: var(--nui-surface);
        }
        .nui-drawer[data-active-view="settings"] .nui-drawer-view[data-view="nav"] {
            transform: translateX(-30%); opacity: 0.4;
        }
        .nui-drawer[data-active-view="settings"] .nui-drawer-view[data-view="settings"] {
            transform: translateX(0);
        }

        .nui-drawer-profile {
            display: flex; align-items: center; gap: 14px;
            /* Negative margins pull the background flush to the edges of the drawer */
            margin: calc(var(--nui-space-4) * -1) calc(var(--nui-space-4) * -1) var(--nui-space-4) calc(var(--nui-space-4) * -1); padding: var(--nui-space-5) var(--nui-space-4);
            background: linear-gradient(135deg, var(--nui-accent-soft), var(--nui-surface-2));
            border-bottom: 2px solid var(--nui-border);
        }
                .nui-drawer-avatar {
    width: 90px; height: 90px;
    background: transparent; /* No background needed if image covers */
    border: 4px solid var(--nui-surface); box-shadow: 0 4px 12px var(--nui-shadow);
    flex-shrink: 0;
    object-fit: cover;
    margin-left: -10px; /* Pulls it slightly left for visual balance */
}

        .nui-drawer-name {
            font-weight: 800; font-size: 20px; /* Scaled up to match the larger avatar */
            color: var(--nui-text); line-height: 1.1;
        }
    .nui-drawer-sub { font-size: 13px; color: var(--nui-accent); font-weight: 700; margin-top: 2px; }

        .nui-drawer-stats {
            display: flex; gap: 8px;
            padding-bottom: var(--nui-space-3);
            margin-bottom: var(--nui-space-2);
        }
        .nui-drawer-stat {
            flex: 1; background: var(--nui-surface-2);
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
            border-radius: var(--nui-radius-sm); transition: filter var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-drawer-section-title:active { filter: brightness(0.9); }

        /* Hides the default browser triangle markers on the accordion */
        details.nui-drawer-section summary::-webkit-details-marker { display: none; }
        details.nui-drawer-section summary { list-style: none; }

        .nui-drawer-item {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 6px; font-size: 14px; font-weight: 600; color: var(--nui-text);
            text-decoration: none; border-radius: var(--nui-radius-sm); transition: background var(--nui-dur-fast) var(--nui-ease);
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
            position: relative; display: flex; flex-direction: column;
            border-radius: var(--nui-radius-md);
            border: 2px solid var(--nui-border);
            background: var(--nui-surface);
            cursor: pointer;
            overflow: hidden; transition: border-color var(--nui-dur-fast) var(--nui-ease),
                        transform var(--nui-dur-fast) var(--nui-ease-snap),
                        box-shadow var(--nui-dur-fast) var(--nui-ease);
        }
        .nui-theme-option:active { transform: scale(0.97); }
        .nui-theme-option.is-selected {
            border-color: var(--nui-accent); box-shadow: 0 0 0 3px var(--nui-accent-soft);
        }

        /* Mini live preview of the theme's own palette, independent of the
           page's CURRENT theme — everything inside .nui-theme-preview-card
           is painted with that theme's own tokens via inline style, not
           var(--nui-*), so it actually shows what the theme looks like
           instead of two abstract dots.
        */
        .nui-theme-preview {
            position: relative; padding: 10px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--nui-border);
        }

        .nui-theme-preview-card {
            display: flex; align-items: center;
            gap: 7px;
            width: 100%;
            padding: 8px;
            border-radius: 10px;
            border: 1px solid; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
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
            position: absolute; top: 6px; right: 6px;
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--nui-accent);
            color: var(--nui-accent-ink);
            display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
            opacity: 0; transform: scale(0.5); transition: opacity var(--nui-dur-fast) var(--nui-ease-snap), transform var(--nui-dur-fast) var(--nui-ease-snap);
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
        buildDrawer();
        if (!drawerEl) return; info = info || {};

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

    // ---- NOTIFICATION DRAWER LOGIC ----

    function getNotifications() {
        // Find the legacy event cell before the DOM is wiped
        const eventCell = document.querySelector('td.eventIcon');

        // If it doesn't exist or is empty (just a space), return null
        if (!eventCell || eventCell.innerHTML.trim() === '&nbsp;' || eventCell.textContent.trim() === '') {
            return null;
        }

        // We have an event! Extract the image and text.
        const img = eventCell.querySelector('img');
        const iconSrc = img ? img.src : '';

        // Clean up the legacy text formatting
        let rawText = eventCell.textContent.replace('» See all events «', '').trim();

        return {
            hasNotification: true,
            text: rawText,
            icon: iconSrc,
            url: '/allevents.phtml'
        };
    }

    function buildNotificationBell(notifData) {
        const btn = h('button', {
            class: 'nui-neogo-btn nui-reset',
            style: 'color: var(--nui-text-muted); position: relative; background: transparent; border: none; cursor: pointer; padding: 5px;',
            title: notifData ? notifData.text : 'No new events'
        });

        btn.innerHTML = `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;

        if (notifData && notifData.hasNotification) {
            btn.style.color = 'var(--nui-accent)';
            const dot = h('div', { class: 'nui-dot', style: 'display: block; position: absolute; right: 4px; top: 4px; width: 10px; height: 10px; background: var(--nui-danger); border-radius: 50%; border: 2px solid var(--nui-surface);' });
            btn.appendChild(dot);
        }

        // Trigger the iframe drawer on click
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openEventDrawer();
        });

        return btn;
    }

    function openEventDrawer() {
        // 1. Create the dark overlay
        const overlay = h('div', {
            style: 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 99998; opacity: 0; transition: opacity 0.3s ease;'
        });

        // 2. Create the sliding right-side drawer
        const drawer = h('div', {
            style: 'position: fixed; top: 0; right: -450px; width: 100%; max-width: 400px; height: 100vh; background: var(--nui-bg); z-index: 99999; transition: right 0.3s cubic-bezier(0.25, 1, 0.5, 1); display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.15);'
        });

        // 3. Build the Header
        const header = h('div', {
            style: 'display: flex; justify-content: space-between; align-items: center; padding: var(--nui-space-4); border-bottom: 1px solid var(--nui-border); background: var(--nui-surface);'
        });
        header.appendChild(h('div', { style: 'font-weight: 800; font-size: 18px; color: var(--nui-text);' }, 'Event Inbox'));

        const closeBtn = h('button', { style: 'background: transparent; border: none; font-size: 28px; line-height: 1; color: var(--nui-text-muted); cursor: pointer;' }, '×');

        const closeDrawer = () => {
            drawer.style.right = '-450px';
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); drawer.remove(); }, 300);
        };

        closeBtn.addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);

        header.appendChild(closeBtn);
        drawer.appendChild(header);

        // 4. Build the Iframe Wrapper
        const iframeWrap = h('div', { style: 'flex: 1; position: relative; overflow: hidden; background: var(--nui-bg);' });

        // Loading spinner
        const loadingText = h('div', { style: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--nui-text-muted); font-weight: bold;' }, 'Loading events...');
        iframeWrap.appendChild(loadingText);

        const iframe = h('iframe', {
            src: '/allevents.phtml',
            style: 'width: 100%; height: 100%; border: none; position: relative; z-index: 2; opacity: 0; transition: opacity 0.3s;'
        });

        // 5. Intercept the iframe load to inject CSS
        iframe.addEventListener('load', () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;

                // Inject the NeoUI aesthetic directly into the child document
                const style = doc.createElement('style');
                style.textContent = `
                    /* Fallback variables in case the parent root doesn't cascade into the frame */
                    :root {
                        --frame-bg: #f4f7f6;
                        --frame-surface: #ffffff;
                        --frame-border: #dce1e6;
                        --frame-primary: #4479BA;
                        --frame-danger: #dc3545;
                        --frame-text: #333333;
                    }

                    /* Nuke the legacy DOM */
                    td.sidebar, #header, #footer, #superfooter, #ban, .premium_bar_spacer { display: none !important; }
                    body { background: var(--frame-bg) !important; padding: 15px !important; margin: 0 !important; font-family: 'Segoe UI', Roboto, Helvetica, sans-serif !important; color: var(--frame-text) !important; }
                    #content > table > tbody > tr > td.content { display: block !important; width: 100% !important; padding: 0 !important; border: none !important; }

                    /* Hide redundant text */
                    b:contains('Event Inbox') { display: none !important; }

                    /* Modernize the Event Table */
                    table[border="1"] { border: 1px solid var(--frame-border) !important; border-radius: 8px !important; overflow: hidden !important; width: 100% !important; background: var(--frame-surface) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
                    table[border="1"] th { background: var(--frame-surface) !important; color: var(--frame-text) !important; padding: 12px !important; font-size: 14px !important; border: none !important; border-bottom: 2px solid var(--frame-border) !important; }
                    table[border="1"] td { border: none !important; border-bottom: 1px solid var(--frame-border) !important; padding: 12px !important; font-size: 14px !important; background: var(--frame-surface) !important; }

                    /* Format the bottom utility row */
                    table[border="1"] tr:last-child td { border-bottom: none !important; background: #fafafa !important; padding: 15px !important; }

                    /* NeoUI Buttons & Links */
                    input[type="submit"] { background: var(--frame-danger) !important; color: white !important; border: none !important; padding: 10px 16px !important; border-radius: 6px !important; font-weight: bold !important; cursor: pointer !important; width: 100%; transition: opacity 0.2s; }
                    input[type="submit"]:hover { opacity: 0.9; }
                    a { color: var(--frame-primary) !important; text-decoration: none !important; font-weight: bold !important; }

                    /* Clean up the images */
                    img { border-radius: 6px; border: 1px solid var(--frame-border); }
                `;
                doc.head.appendChild(style);

                // Fade the iframe in once it's styled
                iframe.style.opacity = '1';
                loadingText.style.display = 'none';

            } catch (e) {
                console.error("NeoUI Iframe Injection Blocked:", e);
                iframe.style.opacity = '1';
            }
        });

        iframeWrap.appendChild(iframe);
        drawer.appendChild(iframeWrap);

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        // Slide animation triggers on next frame
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            drawer.style.right = '0';
        });
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
        registerSettingsSection: registerSettingsSection,
        getNotifications: getNotifications,
        notificationBell: buildNotificationBell,
        get isInitialized() { return initialized; },
    };

})(window);
