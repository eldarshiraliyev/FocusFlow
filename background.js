let activeTabId = null;
let activeHostname = null;
let timerInterval = null;

// RAM-da saxlanacaq qlobal daxili keş (State)
let appState = {
    focusActive: false,
    blockedSites: [],
    spentTimes: {}
};

// Sayğacın saniyələrini yaddaşda tutmaq üçün daxili obyekt
let siteSecondsCache = {};

// Sürətli yoxlama üçün storage-dən bir dəfə RAM-a yükləyirik
function initializeState() {
    chrome.storage.sync.get(['focusActive', 'blockedSitesObj', 'spentTimes'], (data) => {
        appState.focusActive = data.focusActive !== undefined ? data.focusActive : false;
        appState.blockedSites = data.blockedSitesObj || [];
        appState.spentTimes = data.spentTimes || {};
    });
}

// Runtime ərzində popup-dan və ya başqa yerdən gələn dinamik dəyişiklikləri izləyirik
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        if (changes.focusActive) appState.focusActive = changes.focusActive.newValue;
        if (changes.blockedSitesObj) appState.blockedSites = changes.blockedSitesObj.newValue;
        if (changes.spentTimes) appState.spentTimes = changes.spentTimes.newValue;
    }
});

// Extension işə düşəndə işləsin
chrome.runtime.onInstalled.addListener(initializeState);
chrome.runtime.onStartup.addListener(initializeState);

// Tab hərəkətlərini dinləyirik
chrome.tabs.onActivated.addListener(activeInfo => checkTab(activeInfo.tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if ((changeInfo.status === 'complete' || changeInfo.url) && tab.active) {
        checkTab(tabId);
    }
});

function checkTab(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab || !tab.url) {
            stopTracking();
            return;
        }
        try {
            const url = new URL(tab.url);
            startTracking(tabId, url.hostname);
        } catch(e) {
            stopTracking();
        }
    });
}

function startTracking(tabId, hostname) {
    if (activeTabId === tabId && activeHostname === hostname) return;
    stopTracking();

    activeTabId = tabId;
    activeHostname = hostname;

    timerInterval = setInterval(() => {
        // Hər saniyə storage-ə müraciət etmirik! RAM-dan yoxlayırıq.
        if (!appState.focusActive || !activeHostname) return;

        const matchedSite = appState.blockedSites.find(site => activeHostname.includes(site.url));

        if (matchedSite) {
            const targetUrl = matchedSite.url;
            
            if (!siteSecondsCache[targetUrl]) siteSecondsCache[targetUrl] = 0;
            siteSecondsCache[targetUrl]++;

            let currentSpent = appState.spentTimes[targetUrl] || 0;

            // 60 saniyə tamam olanda yalnız 1 dəfə storage-ə yazırıq (Kvota dostu)
            if (siteSecondsCache[targetUrl] >= 60) {
                siteSecondsCache[targetUrl] = 0;
                currentSpent++;
                appState.spentTimes[targetUrl] = currentSpent;
                chrome.storage.sync.set({ spentTimes: appState.spentTimes });
            }

            // Limiti anlıq olaraq daxili keşlə qəti yoxlayırıq (Gecikmə 0ms)
            if (currentSpent >= matchedSite.time) {
                chrome.tabs.sendMessage(activeTabId, { 
                    action: "blockSite", 
                    color: matchedSite.color 
                }).catch(() => { /* Tab hələ mesaj qəbuluna tam hazır deyilsə xətanı yatırt */ });
            }
        }
    }, 1000);
}

function stopTracking() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    activeTabId = null;
    activeHostname = null;
}
