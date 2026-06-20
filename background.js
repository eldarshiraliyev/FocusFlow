let activeTabId = null;
let activeHostname = null;
let timerInterval = null;
let siteSeconds = {}; // Hər saytın saniyəsini ayrı saxlamaq üçün obyekt

chrome.tabs.onActivated.addListener(activeInfo => {
    checkTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // SPA saytlarda URL dəyişəndə və ya tam yüklənəndə yoxla
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
            const hostname = url.hostname;
            startTracking(tabId, hostname);
        } catch(e) {
            stopTracking();
        }
    });
}

function startTracking(tabId, hostname) {
    if (activeTabId === tabId && activeHostname === hostname) return; // Artıq eyni tab izlənilirsa, yenidən başlatma
    
    stopTracking();
    
    activeTabId = tabId;
    activeHostname = hostname;

    timerInterval = setInterval(() => {
        chrome.storage.sync.get(['focusActive', 'blockedSitesObj', 'spentTimes'], (data) => {
            if (!data.focusActive || !activeHostname) return;

            const sites = data.blockedSitesObj || [];
            const matchedSite = sites.find(site => activeHostname.includes(site.url));

            if (matchedSite) {
                if (!siteSeconds[matchedSite.url]) {
                    siteSeconds[matchedSite.url] = 0;
                }
                
                siteSeconds[matchedSite.url]++;
                
                // 60 saniyə tamam olanda yaddaşda 1 dəqiqə artır
                if (siteSeconds[matchedSite.url] >= 60) {
                    siteSeconds[matchedSite.url] = 0;
                    let spentTimes = data.spentTimes || {};
                    let currentSpent = spentTimes[matchedSite.url] || 0;

                    currentSpent++;
                    spentTimes[matchedSite.url] = currentSpent;

                    chrome.storage.sync.set({ spentTimes: spentTimes });
                }

                // Limiti dərhal yoxla
                let spentTimes = data.spentTimes || {};
                let currentSpent = spentTimes[matchedSite.url] || 0;
                
                if (currentSpent >= matchedSite.time) {
                    chrome.tabs.sendMessage(activeTabId, { 
                        action: "blockSite", 
                        color: matchedSite.color 
                    }).catch(() => {
                        // Əgər mesaj çatmasa (content script hələ tam yüklənməyibsə), yenidən inject etməyə cəhd edə bilər
                    });
                }
            }
        });
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
