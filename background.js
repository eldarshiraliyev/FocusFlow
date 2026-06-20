let activeTabId = null;
let activeHostname = null;
let timerInterval = null;
let secondCounter = 0; // Saniyələri daxildə saymaq üçün

chrome.tabs.onActivated.addListener(activeInfo => {
    checkTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        checkTab(tabId);
    }
});

function checkTab(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        
        try {
            const url = new URL(tab.url);
            const hostname = url.hostname;
            startTracking(tabId, hostname);
        } catch(e) {
            stopTracking();
        }
    });
}

function startTracking(tabId, hostname) {
    stopTracking();
    
    activeTabId = tabId;
    activeHostname = hostname;
    secondCounter = 0; // Yeni taba keçəndə saniyəni sıfırla

    timerInterval = setInterval(() => {
        chrome.storage.sync.get(['focusActive', 'blockedSitesObj', 'spentTimes'], (data) => {
            if (!data.focusActive) return;

            const sites = data.blockedSitesObj || [];
            const matchedSite = sites.find(site => activeHostname.includes(site.url));

            if (matchedSite) {
                secondCounter++;
                
                // Hər 60 saniyə tamam olanda yaddaşda 1 dəqiqə artır
                if (secondCounter >= 60) {
                    secondCounter = 0; // Saniyəni sıfırla
                    let spentTimes = data.spentTimes || {};
                    let currentSpent = spentTimes[matchedSite.url] || 0;

                    currentSpent++;
                    spentTimes[matchedSite.url] = currentSpent;

                    chrome.storage.sync.set({ spentTimes: spentTimes });
                }

                // Əgər limit artıq keçilibsə (və ya tam o anda keçildisə) dərhal blokla
                let spentTimes = data.spentTimes || {};
                let currentSpent = spentTimes[matchedSite.url] || 0;
                
                if (currentSpent >= matchedSite.time) {
                    chrome.tabs.sendMessage(activeTabId, { 
                        action: "blockSite", 
                        color: matchedSite.color 
                    }).catch(() => {});
                }
            }
        });
    }, 1000); // Hər saniyə daxili yoxlama aparır
}

function stopTracking() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    activeTabId = null;
    activeHostname = null;
    secondCounter = 0;
}