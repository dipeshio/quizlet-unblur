/**
 * Quizlet De-Blur & Paywall Remover - Content Script
 * Passively monitors and cleans the DOM for a better user experience.
 */

(function() {
    'use strict';

    // Configuration for debouncing
    let timeout = null;

    /**
     * Removes paywall overlays and unblurs content.
     */
    function cleanup() {
        // 1. Remove targeted overlays by test-id and class
        const overlays = document.querySelectorAll('[data-testid="PayWallOverlay"], .p2gybnk, .p11u758u, .oxutk4g');
        overlays.forEach(el => {
            el.remove();
        });

        // 2. Remove upgrade buttons/banners specifically
        const upgradeButtons = document.querySelectorAll('a[data-testid="assembly-button-upgrade"]');
        upgradeButtons.forEach(btn => {
            const container = btn.closest('div');
            if (container) container.remove();
            else btn.remove();
        });

        // 3. Fallback: Search for text-based triggers if obfuscated
        const allDivs = document.getElementsByTagName('div');
        for (let div of allDivs) {
            if (div.textContent.includes('Upgrade to Quizlet Plus')) {
                // Heuristic: If it contains this text and is fixed/absolute, it's likely an overlay
                const style = window.getComputedStyle(div);
                if (style.position === 'fixed' || style.position === 'absolute') {
                    div.remove();
                }
            }
        }

        // 4. Unblur everything
        const blurredElements = document.querySelectorAll('*');
        blurredElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.filter.includes('blur')) {
                el.style.setProperty('filter', 'none', 'important');
                el.style.setProperty('-webkit-filter', 'none', 'important');
                el.style.setProperty('user-select', 'auto', 'important');
            }
        });

        // 5. Restore Scrolling
        if (document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden') {
            document.body.style.setProperty('overflow', 'auto', 'important');
            document.documentElement.style.setProperty('overflow', 'auto', 'important');
        }
    }

    /**
     * Debounced cleanup function to optimize performance.
     */
    function debouncedCleanup() {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(cleanup, 250);
    }

    // Initial run
    cleanup();

    // Observe changes in the DOM (for SPAs like Quizlet)
    const observer = new MutationObserver((mutations) => {
        let shouldCleanup = false;
        for (let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldCleanup = true;
                break;
            }
        }
        if (shouldCleanup) {
            debouncedCleanup();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('Quizlet De-Blur & Paywall Remover: Active');
})();