// Utility function to add our styles to the page
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .gh-hidden {
            display: none !important;
        }

        /* Fade out animation for elements being hidden */
        .gh-fade-out {
            opacity: 0;
            transition: opacity 0.3s ease-out;
        }

        /* Custom styles for organization items */
        .gh-org-hidden {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Selectors for GitHub profile elements
const SELECTORS = {
    activity: {
        container: '.js-yearly-contributions',
        graph: '.js-calendar-graph-svg',
        activityOverview: '.js-activity-overview'
    },
    repositories: {
        pinnedRepos: '.js-pinned-items-reorder-container',
        popularRepos: '.js-profile-repositories-section'
    },
    organizations: {
        container: '.border-top.color-border-muted.pt-3.mt-3.clearfix.hide-sm.hide-md',
        items: '.avatar-group-item'
    },
    contributions: {
        calendar: '.js-calendar-graph',
        activityListing: '.contribution-activity-listing'
    },
    sponsors: {
        section: '.js-profile-sponsors-section'
    },
    achievements: {
        section: '.js-profile-achievements'
    }
};

// Class to manage GitHub profile elements
class GitHubProfileManager {
    constructor() {
        this.settings = null;
        this.initialized = false;
        this.mutationObserver = null;
    }

    // Initialize the manager
    async initialize() {
        if (this.initialized) return;

        injectStyles();
        await this.loadSettings();
        this.setupMutationObserver();
        this.applySettings();
        this.initialized = true;
    }

    // Load settings from storage
    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                hideActivity: false,
                hideRepositories: false,
                hideContributions: false,
                hideAllOrgs: false,
                hiddenOrgs: [],
                hideSponsors: false,
                hideAchievements: false
            }, (settings) => {
                this.settings = settings;
                resolve(settings);
            });
        });
    }

    // Setup mutation observer to handle dynamic content
    setupMutationObserver() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.mutationObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    // Check if added nodes contain any of our target elements
                    const hasRelevantChanges = Array.from(mutation.addedNodes).some(node => {
                        if (node.nodeType !== Node.ELEMENT_NODE) return false;
                        return Object.values(SELECTORS).some(selectorGroup =>
                            Object.values(selectorGroup).some(selector =>
                                node.matches?.(selector) || node.querySelector?.(selector)
                            )
                        );
                    });

                    if (hasRelevantChanges) {
                        shouldUpdate = true;
                        break;
                    }
                }
            }

            if (shouldUpdate) {
                this.applySettings();
            }
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Apply settings to the page
    applySettings() {
        if (!this.settings) return;

        // Handle activity sections
        if (this.settings.hideActivity) {
            this.hideElements(SELECTORS.activity.container);
            this.hideElements(SELECTORS.activity.graph);
            this.hideElements(SELECTORS.activity.activityOverview);
        } else {
            this.showElements(SELECTORS.activity.container);
            this.showElements(SELECTORS.activity.graph);
            this.showElements(SELECTORS.activity.activityOverview);
        }

        // Handle repositories
        if (this.settings.hideRepositories) {
            this.hideElements(SELECTORS.repositories.pinnedRepos);
            this.hideElements(SELECTORS.repositories.popularRepos);
        } else {
            this.showElements(SELECTORS.repositories.pinnedRepos);
            this.showElements(SELECTORS.repositories.popularRepos);
        }

        // Handle contributions
        if (this.settings.hideContributions) {
            this.hideElements(SELECTORS.contributions.calendar);
            this.hideElements(SELECTORS.contributions.activityListing);
        } else {
            this.showElements(SELECTORS.contributions.calendar);
            this.showElements(SELECTORS.contributions.activityListing);
        }

        // Handle organizations
        const orgContainer = document.querySelector(SELECTORS.organizations.container);
        if (orgContainer) {
            if (this.settings.hideAllOrgs) {
                this.hideElements(SELECTORS.organizations.container);
            } else {
                this.showElements(SELECTORS.organizations.container);
                // Handle individual organizations
                document.querySelectorAll(SELECTORS.organizations.items).forEach(org => {
                    const orgName = org.getAttribute('aria-label');
                    if (this.settings.hiddenOrgs.includes(orgName)) {
                        org.classList.add('gh-org-hidden');
                    } else {
                        org.classList.remove('gh-org-hidden');
                    }
                });
            }
        }

        // Handle sponsors
        if (this.settings.hideSponsors) {
            this.hideElements(SELECTORS.sponsors.section);
        } else {
            this.showElements(SELECTORS.sponsors.section);
        }

        // Handle achievements
        if (this.settings.hideAchievements) {
            this.hideElements(SELECTORS.achievements.section);
        } else {
            this.showElements(SELECTORS.achievements.section);
        }
    }

    // Hide elements matching a selector
    hideElements(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.add('gh-fade-out');
            setTimeout(() => {
                element.classList.add('gh-hidden');
            }, 300);
        });
    }

    // Show elements matching a selector
    showElements(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.remove('gh-hidden');
            setTimeout(() => {
                element.classList.remove('gh-fade-out');
            }, 50);
        });
    }

    // Get organizations from the page
    getOrganizations() {
        const orgs = [];
        document.querySelectorAll(SELECTORS.organizations.items).forEach(org => {
            const img = org.querySelector('img');
            orgs.push({
                name: org.getAttribute('aria-label'),
                avatar: img ? img.src : '',
                url: org.href
            });
        });
        return orgs;
    }

    // Update settings
    async updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.applySettings();
    }

    // Clean up
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }
}

// Create and initialize the profile manager
const profileManager = new GitHubProfileManager();
profileManager.initialize();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'getOrganizations':
            sendResponse({ organizations: profileManager.getOrganizations() });
            break;

        case 'updateSettings':
            profileManager.updateSettings(message.settings);
            sendResponse({ success: true });
            break;

        case 'getState':
            sendResponse({
                initialized: profileManager.initialized,
                settings: profileManager.settings
            });
            break;
    }
    return true; // Required for async response
});

// Cleanup on window unload
window.addEventListener('unload', () => {
    profileManager.destroy();
});