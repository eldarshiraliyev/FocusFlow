const toggleBtn = document.getElementById('toggleBtn');
const timeInput = document.getElementById('alertTime');
const colorInput = document.getElementById('alertColor');
const newSiteInput = document.getElementById('newSite');
const addSiteBtn = document.getElementById('addSiteBtn');
const siteListDiv = document.getElementById('siteList');
const quickBtns = document.querySelectorAll('.quick-btn');
const liveStatus = document.getElementById('liveStatus');
const resetBtn = document.getElementById('resetBtn');

const statToday = document.getElementById('statToday');
const statTodaySub = document.getElementById('statTodaySub');
const statRemaining = document.getElementById('statRemaining');

let blockedSites = [];

// Popup açılanda bir dəfə dataları çəkirik
chrome.storage.sync.get(['focusActive', 'blockedSitesObj'], (data) => {
    blockedSites = data.blockedSitesObj || [
        { url: "youtube.com", time: 15, color: "#ff0000" },
        { url: "instagram.com", time: 10, color: "#e1306c" }
    ];
    updateBtn(data.focusActive);
    renderSites();
    calculatePremiumStats(data.focusActive);
});

function updateBtn(isActive) {
    if (!toggleBtn) return;
    const btnText = toggleBtn.querySelector('span');
    if (isActive) {
        if (btnText) btnText.textContent = "ON";
        toggleBtn.classList.add('active');
    } else {
        if (btnText) btnText.textContent = "OFF";
        toggleBtn.classList.remove('active');
    }
}

function renderSites() {
    if (!siteListDiv) return;
    siteListDiv.innerHTML = '';
    
    chrome.storage.sync.get('spentTimes', (data) => {
        const spentTimes = data.spentTimes || {};

        blockedSites.forEach((site, index) => {
            const currentSpent = spentTimes[site.url] || 0;
            const isLimitHit = currentSpent >= site.time;
            
            const div = document.createElement('div');
            div.className = 'site-item';
            div.style.borderLeftColor = site.color;
            
            div.innerHTML = `
                <div class="site-info">
                    <span class="site-url">${site.url}</span>
                    <span class="site-meta">
                        ⏱️ ${currentSpent}/${site.time} min ${isLimitHit ? "<b style='color:#ff4757; font-weight:700;'>(BLOCKED)</b>" : ""}
                    </span>
                </div>
                <span class="remove-site" data-index="${index}">✖</span>
            `;
            siteListDiv.appendChild(div);
        });

        document.querySelectorAll('.remove-site').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetIndex = parseInt(e.target.getAttribute('data-index'));
                blockedSites.splice(targetIndex, 1);
                saveData();
            });
        });
    });

    quickBtns.forEach(btn => {
        const url = btn.getAttribute('data-site');
        if (blockedSites.some(s => s.url === url)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function saveData() {
    chrome.storage.sync.set({ blockedSitesObj: blockedSites }, () => {
        renderSites();
        chrome.storage.sync.get('focusActive', (data) => calculatePremiumStats(data.focusActive));
    });
}

function calculatePremiumStats(isActive) {
    if (!isActive) {
        if (liveStatus) liveStatus.style.display = "none";
        if (statToday) statToday.innerHTML = `0 <span>min</span>`;
        if (statTodaySub) statTodaySub.textContent = "Top: None";
        if (statRemaining) {
            statRemaining.textContent = "Disabled";
            statRemaining.style.color = "var(--text-muted)";
        }
        return;
    }

    chrome.storage.sync.get('spentTimes', (data) => {
        const spentTimes = data.spentTimes || {};
        
        let totalSpent = 0;
        let topSite = "None";
        let maxTime = 0;

        Object.entries(spentTimes).forEach(([siteUrl, minutes]) => {
            totalSpent += minutes;
            if (minutes > maxTime && minutes > 0) {
                maxTime = minutes;
                topSite = siteUrl;
            }
        });

        if (statToday) statToday.innerHTML = `${totalSpent} <span>min</span>`;
        
        if (topSite !== "None") {
            if (statTodaySub) {
                const matchedSiteObj = blockedSites.find(s => topSite.includes(s.url));
                const colorDot = matchedSiteObj ? matchedSiteObj.color : 'var(--text-muted)';
                statTodaySub.innerHTML = `Top: <span style="color: var(--text); font-weight: 600;">${topSite}</span> <span style="color: ${colorDot}; font-size: 9px;">●</span>`;
            }
        } else {
            if (statTodaySub) statTodaySub.textContent = "Top: None";
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url) {
                try {
                    const currentUrl = new URL(tabs[0].url).hostname;
                    const matched = blockedSites.find(site => currentUrl.includes(site.url));
                    const currentSpent = spentTimes[matched ? matched.url : ''] || 0;

                    if (matched && liveStatus && statRemaining) {
                        liveStatus.style.display = "block";
                        liveStatus.style.borderColor = matched.color;
                        liveStatus.style.color = matched.color;
                        
                        if (currentSpent >= matched.time) {
                            liveStatus.textContent = `🛑 Daily limit reached for this site!`;
                            statRemaining.textContent = "0 min";
                            statRemaining.style.color = "var(--primary)";
                        } else {
                            const rem = matched.time - currentSpent;
                            liveStatus.textContent = `⚠️ Remaining limit: ${rem} min`;
                            statRemaining.textContent = `${rem} min left`;
                            statRemaining.style.color = "var(--accent)";
                        }
                    } else if (liveStatus && statRemaining) {
                        liveStatus.style.display = "none";
                        statRemaining.textContent = "No Limit";
                        statRemaining.style.color = "var(--text-muted)";
                    }
                } catch (e) {
                    resetStatLabels();
                }
            } else {
                resetStatLabels();
            }
        });
    });
}

function resetStatLabels() {
    if (liveStatus) liveStatus.style.display = "none";
    if (statRemaining) {
        statRemaining.textContent = "--";
        statRemaining.style.color = "var(--text-muted)";
    }
}

quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-site');
        const time = parseInt(btn.getAttribute('data-time'));
        const color = btn.getAttribute('data-color');
        const index = blockedSites.findIndex(s => s.url === url);
        
        if (index > -1) blockedSites.splice(index, 1);
        else blockedSites.push({ url, time, color });
        saveData();
    });
});

if (addSiteBtn) {
    addSiteBtn.addEventListener('click', () => {
        if (!newSiteInput || !timeInput || !colorInput) return;
        let url = newSiteInput.value.trim().toLowerCase();
        url = url.replace(/^https?:\/\//, '').replace(/^www\\./, '').split('/')[0];
        const time = parseInt(timeInput.value) || 5;
        const color = colorInput.value;

        if (url && !blockedSites.some(s => s.url === url)) {
            blockedSites.push({ url, time, color });
            newSiteInput.value = '';
            saveData();
        }
    });
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        chrome.storage.sync.get('focusActive', (data) => {
            const newState = !data.focusActive;
            chrome.storage.sync.set({ focusActive: newState }, () => {
                updateBtn(newState);
                calculatePremiumStats(newState);
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    if (tabs[0]) chrome.tabs.reload(tabs[0].id).catch(() => {});
                });
            });
        });
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        chrome.storage.sync.set({ spentTimes: {} }, () => {
            renderSites();
            chrome.storage.sync.get('focusActive', (data) => calculatePremiumStats(data.focusActive));
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) chrome.tabs.reload(tabs[0].id).catch(() => {});
            });
        });
    });
}
