document.addEventListener('DOMContentLoaded', () => {
    // Get all UI elements
    const elements = {
        // Profile sections
        hideActivity: document.getElementById('hideActivity'),
        hideRepositories: document.getElementById('hideRepositories'),
        hideContributions: document.getElementById('hideContributions'),

        // Organization elements
        hideAllOrgs: document.getElementById('hideAllOrgs'),
        orgSettings: document.getElementById('orgSettings'),
        orgList: document.getElementById('orgList'),
        refreshOrgs: document.getElementById('refreshOrgs'),

        // Additional settings
        hideSponsors: document.getElementById('hideSponsors'),
        hideAchievements: document.getElementById('hideAchievements'),

        // Action buttons
        saveButton: document.getElementById('saveButton'),
        resetButton: document.getElementById('resetButton'),
        collapseAll: document.getElementById('collapseAll'),

        // Status display
        status: document.getElementById('status')
    };

    // Default settings
    const defaultSettings = {
        hideActivity: false,
        hideRepositories: false,
        hideContributions: false,
        hideAllOrgs: false,
        hiddenOrgs: [],
        hideSponsors: false,
        hideAchievements: false,
        sectionsCollapsed: false
    };

    // Track if settings have changed
    let settingsChanged = false;

    // Function to show status message
    function showStatus(message, type = 'success') {
        elements.status.textContent = message;
        elements.status.className =
            `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                type === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`;
        elements.status.classList.remove('hidden');

        setTimeout(() => {
            elements.status.classList.add('hidden');
        }, 2000);
    }

    // Function to load saved settings
    async function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(defaultSettings, (settings) => {
                // Apply settings to UI elements
                elements.hideActivity.checked = settings.hideActivity;
                elements.hideRepositories.checked = settings.hideRepositories;
                elements.hideContributions.checked = settings.hideContributions;
                elements.hideAllOrgs.checked = settings.hideAllOrgs;
                elements.hideSponsors.checked = settings.hideSponsors;
                elements.hideAchievements.checked = settings.hideAchievements;

                // Toggle organization list visibility
                elements.orgSettings.style.display = settings.hideAllOrgs ? 'none' : 'block';

                resolve(settings);
            });
        });
    }

    // Function to get organizations from the page
    async function loadOrganizations() {
        elements.orgList.innerHTML = '<div class="flex items-center justify-center py-4 text-gray-400 text-sm">Loading organizations...</div>';

        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs[0]) throw new Error('No active tab found');

            const response = await chrome.tabs.sendMessage(tabs[0].id, { type: 'getOrganizations' });
            if (!response || !response.organizations) {
                throw new Error('No organizations found');
            }

            return response.organizations;
        } catch (error) {
            console.error('Error loading organizations:', error);
            elements.orgList.innerHTML = `
                <div class="flex items-center justify-center py-4 text-gray-400 text-sm">
                    Unable to load organizations. Please refresh the page.
                </div>`;
            return [];
        }
    }

    // Function to populate organization list
    function populateOrgList(organizations, hiddenOrgs) {
        elements.orgList.innerHTML = '';

        if (organizations.length === 0) {
            elements.orgList.innerHTML = `
                <div class="flex items-center justify-center py-4 text-gray-400 text-sm">
                    No organizations found
                </div>`;
            return;
        }

        organizations.forEach(org => {
            const orgDiv = document.createElement('div');
            orgDiv.className = 'flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-100';

            const orgContent = document.createElement('div');
            orgContent.className = 'flex items-center space-x-2';

            const orgImg = document.createElement('img');
            orgImg.src = org.avatar;
            orgImg.alt = org.name;
            orgImg.className = 'w-6 h-6 rounded-full';

            const orgName = document.createElement('span');
            orgName.className = 'text-sm text-gray-700';
            orgName.textContent = org.name;

            const toggleDiv = document.createElement('div');
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.className = 'toggle-checkbox';
            toggle.checked = hiddenOrgs.includes(org.name);
            toggle.dataset.org = org.name;

            toggle.addEventListener('change', () => {
                settingsChanged = true;
                updateSaveButtonState();
            });

            // Continue from previous orgContent...
            orgContent.appendChild(orgImg);
            orgContent.appendChild(orgName);
            orgDiv.appendChild(orgContent);
            toggleDiv.appendChild(toggle);
            orgDiv.appendChild(toggleDiv);
            elements.orgList.appendChild(orgDiv);
        });
    }

    // Function to update save button state
    function updateSaveButtonState() {
        if (settingsChanged) {
            elements.saveButton.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-green-300');
            elements.saveButton.classList.add('bg-green-500', 'hover:bg-green-600');
            elements.saveButton.disabled = false;
        } else {
            elements.saveButton.classList.add('opacity-50', 'cursor-not-allowed', 'bg-green-300');
            elements.saveButton.classList.remove('bg-green-500', 'hover:bg-green-600');
            elements.saveButton.disabled = true;
        }
    }

    // Function to collect current settings
    function getCurrentSettings() {
        const hiddenOrgs = Array.from(elements.orgList.querySelectorAll('input[type="checkbox"]'))
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.org);

        return {
            hideActivity: elements.hideActivity.checked,
            hideRepositories: elements.hideRepositories.checked,
            hideContributions: elements.hideContributions.checked,
            hideAllOrgs: elements.hideAllOrgs.checked,
            hiddenOrgs: hiddenOrgs,
            hideSponsors: elements.hideSponsors.checked,
            hideAchievements: elements.hideAchievements.checked,
            sectionsCollapsed: false
        };
    }

    // Function to save settings
    async function saveSettings() {
        const settings = getCurrentSettings();

        try {
            // Disable save button during save
            elements.saveButton.disabled = true;
            elements.saveButton.classList.add('opacity-50', 'cursor-not-allowed');

            // Save to storage
            await chrome.storage.sync.set(settings);

            // Apply to active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'updateSettings',
                    settings: settings
                });
            }

            // Show success message
            showStatus('Settings saved!');
            settingsChanged = false;
            updateSaveButtonState();

        } catch (error) {
            console.error('Error saving settings:', error);
            showStatus('Error saving settings', 'error');
        }
    }

    // Function to reset settings
    async function resetSettings() {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to reset all settings to default?')) {
                return;
            }

            // Reset to defaults
            await chrome.storage.sync.set(defaultSettings);
            await loadSettings();

            // Reload organizations
            const orgs = await loadOrganizations();
            populateOrgList(orgs, defaultSettings.hiddenOrgs);

            // Apply to current tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'updateSettings',
                    settings: defaultSettings
                });
            }

            showStatus('Settings reset to default!');
            settingsChanged = false;
            updateSaveButtonState();

        } catch (error) {
            console.error('Error resetting settings:', error);
            showStatus('Error resetting settings', 'error');
        }
    }

    // Handle section collapse/expand
    let sectionsCollapsed = false;
    elements.collapseAll.addEventListener('click', () => {
        const sections = document.querySelectorAll('.space-y-4');
        sectionsCollapsed = !sectionsCollapsed;

        sections.forEach(section => {
            const content = section.querySelector('.space-y-3');
            if (content) {
                content.style.display = sectionsCollapsed ? 'none' : 'block';
            }
        });

        elements.collapseAll.textContent = sectionsCollapsed ? 'Expand All' : 'Collapse All';
    });

    // Event listeners
    elements.saveButton.addEventListener('click', saveSettings);
    elements.resetButton.addEventListener('click', resetSettings);
    elements.refreshOrgs.addEventListener('click', async () => {
        elements.refreshOrgs.classList.add('animate-spin');
        const settings = await loadSettings();
        const orgs = await loadOrganizations();
        populateOrgList(orgs, settings.hiddenOrgs);
        elements.refreshOrgs.classList.remove('animate-spin');
    });

    // Toggle organization settings visibility
    elements.hideAllOrgs.addEventListener('change', () => {
        elements.orgSettings.style.display = elements.hideAllOrgs.checked ? 'none' : 'block';
        settingsChanged = true;
        updateSaveButtonState();
    });

    // Add change listeners to all checkboxes
    Object.entries(elements).forEach(([key, element]) => {
        if (element && element.type === 'checkbox') {
            element.addEventListener('change', () => {
                settingsChanged = true;
                updateSaveButtonState();
            });
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Save on Ctrl/Cmd + S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!elements.saveButton.disabled) {
                saveSettings();
            }
        }
    });

    // Initialize popup
    async function initializePopup() {
        try {
            const settings = await loadSettings();
            const orgs = await loadOrganizations();
            populateOrgList(orgs, settings.hiddenOrgs);
            updateSaveButtonState();

            // Set initial button states
            elements.saveButton.disabled = true;
            elements.saveButton.classList.add('opacity-50', 'cursor-not-allowed');

        } catch (error) {
            console.error('Error initializing popup:', error);
            showStatus('Error loading settings', 'error');
        }
    }

    // Start initialization when popup opens
    initializePopup();
});