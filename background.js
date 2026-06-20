let isBlocked = false;

const crazyScroll = (e) => {
    if (isBlocked) {
        e.preventDefault();
        const direction = Math.random() > 0.7 ? -2 : 0.5; 
        window.scrollBy({ top: e.deltaY * direction, behavior: 'instant' });
    }
};

window.addEventListener('wheel', crazyScroll, { passive: false });
window.addEventListener('touchmove', crazyScroll, { passive: false });

// 1. Background-dan gələn dinamik bloklama mesajını tutmaq
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "blockSite" && !isBlocked) {
        executeDigitalWall(request.color);
    }
});

// 2. Səhifə yenilənəndə (Refresh) əgər limit artıq bitibsə, dərhal blokla
function checkCurrentStatusOnLoad() {
    chrome.storage.sync.get(['focusActive', 'blockedSitesObj', 'spentTimes'], (data) => {
        if (!data.focusActive) return;

        const currentHostname = window.location.hostname;
        const sites = data.blockedSitesObj || [];
        const matchedSite = sites.find(site => currentHostname.includes(site.url));

        if (matchedSite) {
            const spentTimes = data.spentTimes || {};
            const currentSpent = spentTimes[matchedSite.url] || 0;

            if (currentSpent >= matchedSite.time) {
                executeDigitalWall(matchedSite.color);
            }
        }
    });
}

function executeDigitalWall(alertColor) {
    if (isBlocked) return;
    isBlocked = true;

    // Səhifənin daxilini təmizləmək və ya tam örtmək üçün overlay
    let overlay = document.getElementById("focus-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "focus-overlay";
        document.body.appendChild(overlay);
    }

    Object.assign(overlay.style, {
        position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
        zIndex: "2147483645", pointerEvents: "auto",
        backgroundColor: `${alertColor}dd`, backdropFilter: "blur(10px) grayscale(100%)",
        transition: "all 0.5s ease"
    });

    const alertBox = document.createElement("div");
    alertBox.id = "focus-alert-box";
    Object.assign(alertBox.style, {
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        backgroundColor: "#121212", color: "#fff", padding: "40px",
        borderRadius: "16px", fontSize: "22px", fontWeight: "bold",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)", border: `3px solid ${alertColor}`,
        zIndex: "2147483647", fontFamily: "sans-serif", textAlign: "center",
        maxWidth: "400px", width: "80%"
    });
    
    alertBox.innerHTML = `
        <div style="font-size: 50px; margin-bottom: 15px;">🛑</div>
        <span style="color: ${alertColor}; text-transform: uppercase;">Daily Limit Reached!</span>
        <p style="font-size: 14px; font-weight: normal; color: #a4b0be; margin: 15px 0 0 0;">
            Your time for this platform has expired. The block will remain active even if you refresh. Welcome back to the real world!
        </p>
    `;
    
    document.body.appendChild(alertBox);
}

// Səhifə yüklənən kimi statusu yoxla
checkCurrentStatusOnLoad();
