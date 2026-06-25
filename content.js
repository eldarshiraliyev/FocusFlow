let isBlocked = false;
let DOMObserver = null;

const injectAntiFlicker = () => {
    if (document.getElementById('focusflow-anti-flicker')) return;
    const style = document.createElement('style');
    style.id = 'focusflow-anti-flicker';
    style.innerHTML = 'html { display: none !important; }';
    document.documentElement.appendChild(style);
};

const removeAntiFlicker = () => {
    const style = document.getElementById('focusflow-anti-flicker');
    if (style) style.remove();
};

const crazyScroll = (e) => {
    if (isBlocked) {
        e.preventDefault();
        const direction = Math.random() > 0.7 ? -2 : 0.5; 
        window.scrollBy({ top: e.deltaY * direction, behavior: 'instant' });
    }
};

window.addEventListener('wheel', crazyScroll, { passive: false });
window.addEventListener('touchmove', crazyScroll, { passive: false });

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "blockSite" && !isBlocked) {
        executeDigitalWall(request.color);
    }
});

function checkCurrentStatusOnLoad() {
    injectAntiFlicker();

    chrome.storage.sync.get(['focusActive', 'blockedSitesObj', 'spentTimes'], (data) => {
        if (!data.focusActive) {
            removeAntiFlicker();
            return;
        }

        const currentHostname = window.location.hostname;
        const sites = data.blockedSitesObj || [];
        const matchedSite = sites.find(site => currentHostname.includes(site.url));

        if (matchedSite) {
            const spentTimes = data.spentTimes || {};
            const currentSpent = spentTimes[matchedSite.url] || 0;

            if (currentSpent >= matchedSite.time) {
                executeDigitalWall(matchedSite.color);
            } else {
                removeAntiFlicker();
            }
        } else {
            removeAntiFlicker();
        }
    });
}

function executeDigitalWall(alertColor) {
    isBlocked = true;
    removeAntiFlicker();

    if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => executeDigitalWall(alertColor));
        return;
    }

    document.body.style.setProperty("overflow", "hidden", "important");

    let hostElement = document.getElementById("focusflow-secure-host");
    if (!hostElement) {
        hostElement = document.createElement("div");
        hostElement.id = "focusflow-secure-host";
        // Ən üst qatda bərkidilməsi üçün z-index
        hostElement.style.position = "fixed";
        hostElement.style.zIndex = "2147483647";
        document.body.appendChild(hostElement);
    }

    // Təhlükəsizlik: Kənar skriptlərin və DevTools manipulyasiyalarının qarşısını almaq üçün 'closed' Shadow DOM istifadə edirik
    let shadowRoot = hostElement.shadowRoot || hostElement.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = ''; 

    // Stil və elementləri tamamilə izolyasiya edilmiş Shadow DOM daxilinə inject edirik
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
        backgroundColor: `${alertColor}dd`, backdropFilter: "blur(12px) grayscale(100%)",
        display: "flex", justifyContent: "center", alignItems: "center",
        fontFamily: "sans-serif", zIndex: "2147483647"
    });

    overlay.innerHTML = `
        <div style="backgroundColor: #121212; color: #fff; padding: 40px; borderRadius: 16px; fontSize: 22px; fontWeight: bold; boxShadow: 0 20px 50px rgba(0,0,0,0.5); border: 3px solid ${alertColor}; textAlign: center; maxWidth: 400px; width: 80%;">
            <div style="font-size: 50px; margin-bottom: 15px;">🛑</div>
            <span style="color: ${alertColor}; text-transform: uppercase; letter-spacing: 1px;">Daily Limit Reached!</span>
            <p style="font-size: 14px; font-weight: normal; color: #a4b0be; margin: 15px 0 0 0; line-height: 1.5;">
                Your time for this platform has expired. The block will remain active even if you refresh. Welcome back to the real world!
            </p>
        </div>
    `;
    shadowRoot.appendChild(overlay);

    // KİBER TƏHLÜKƏSİZLİK QORUMASI: İstifadəçi DevTools-dan elementi silməyə çalışarsa dərhal müdafiə olunur
    if (!DOMObserver) {
        DOMObserver = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                // Əgər host elementimiz silinibsə və ya body elementin strukturu manipulyasiya olunubsa
                if (!document.getElementById("focusflow-secure-host") || document.body.style.overflow !== "hidden") {
                    DOMObserver.disconnect();
                    DOMObserver = null;
                    isBlocked = false;
                    executeDigitalWall(alertColor); // Div-i saniyələr içində yenidən doğururuq
                    break;
                }
            }
        });
        DOMObserver.observe(document.body, { attributes: true, childList: true, subtree: true });
    }
}

// İlkin işəsalma
checkCurrentStatusOnLoad();
