(function () {
   const idleSrc = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL)
    ? chrome.runtime.getURL('assets/KiwiIdle.gif')
    : 'assets/KiwiIdle.gif';

const walkSrc = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL)
    ? chrome.runtime.getURL('assets/KiwiWalking.gif')
    : 'assets/KiwiWalking.gif';

    const messages = [
        'I am kiwi',
        'jsahdkashdknxjskada',
        'whatcha doin there?',
        'Be in tune for upcoming major updates!',
        'Surprise! This is a note'
    ];

    function init() {
        const hasSetup = localStorage.getItem('kiwiSetupDone');
        if (hasSetup === 'true') {
            startKiwi();
        } else {
            showSetupPopup();
        }
    }

    function showSetupPopup() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .kiwi-setup-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                padding: 30px 40px;
                width: 90%;
                max-width: 400px;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                text-align: center;
                z-index: 999999;
                animation: fadeIn 0.6s ease-out;
            }
            .kiwi-setup-title {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .kiwi-setup-text {
                font-size: 16px;
                color: rgba(255,255,255,0.8);
                margin-bottom: 20px;
            }
            .kiwi-eula {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 25px;
                font-size: 14px;
                color: rgba(255,255,255,0.85);
                user-select: none;
            }
            .kiwi-eula a {
                color: #5AC8FA;
                text-decoration: none;
            }
            .kiwi-eula a:hover {
                text-decoration: underline;
            }
            .kiwi-setup-button {
                background: linear-gradient(145deg, #0A84FF, #5AC8FA);
                border: none;
                border-radius: 14px;
                color: white;
                font-size: 16px;
                font-weight: 500;
                padding: 12px 24px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 20px rgba(10,132,255,0.4);
            }
            .kiwi-setup-button:disabled {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.3);
                cursor: not-allowed;
                box-shadow: none;
            }
            .kiwi-setup-button:hover:enabled {
                transform: scale(1.05);
                box-shadow: 0 6px 30px rgba(90,200,250,0.6);
            }
            .kiwi-setup-button:active:enabled {
                transform: scale(0.98);
            }
        `;
        document.head.appendChild(style);

        const popup = document.createElement('div');
        popup.className = 'kiwi-setup-container';

        const title = document.createElement('div');
        title.className = 'kiwi-setup-title';
        title.textContent = 'Welcome to Kiwi';
        popup.appendChild(title);

        const text = document.createElement('div');
        text.className = 'kiwi-setup-text';
        text.textContent = 'Let Kiwi roam around your screen and surprise you!';
        popup.appendChild(text);

        const eulaWrapper = document.createElement('label');
        eulaWrapper.className = 'kiwi-eula';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'kiwi-eula-checkbox';
        checkbox.style.transform = 'scale(1.2)';
        checkbox.style.cursor = 'pointer';

        const label = document.createElement('span');
        label.innerHTML = 'I agree to the <a href="https://example.com/eula" target="_blank" rel="noopener noreferrer">End User License Agreement</a>';

        eulaWrapper.appendChild(checkbox);
        eulaWrapper.appendChild(label);
        popup.appendChild(eulaWrapper);

        const button = document.createElement('button');
        button.className = 'kiwi-setup-button';
        button.textContent = 'Finish Setup';
        button.disabled = true;
        popup.appendChild(button);

        checkbox.addEventListener('change', () => {
            button.disabled = !checkbox.checked;
        });

        button.onclick = () => {
            localStorage.setItem('kiwiSetupDone', 'true'); // ✅ Save setup state
            popup.remove();
            style.remove();
            startKiwi(); // 🟢 Kiwi starts here
        };

        document.body.appendChild(popup);
    }

    function startKiwi() {
        const img = document.createElement('img');
        img.src = idleSrc;
        img.style.position = 'fixed';
        img.style.left = '0px';
        img.style.bottom = '0px';
        img.style.zIndex = '999998';
        img.style.width = '150px';
        img.style.pointerEvents = 'none';
        document.body.appendChild(img);

        let speed = 0;
        let isWalking = false;
        let posX = 0;
        let posY = 0;
        let direction = { x: 1, y: 0 };
        let shakeOffset = 0;
        let shakeDirection = 1;
        const imgWidth = 150;
        let isRareIdle = false;

        let boxActive = false;
        let walkingToEdge = false;
        let targetSide = null;

        function updatePosition() {
            if (walkingToEdge) {
                if (!isWalking) { img.src = walkSrc; isWalking = true; }
                direction.x = targetSide === 'left' ? -1 : 1;
                posX += direction.x * 3;
                if ((targetSide === 'left' && posX <= 0) || (targetSide === 'right' && posX >= window.innerWidth - imgWidth)) {
                    posX = targetSide === 'left' ? 0 : window.innerWidth - imgWidth;
                    walkingToEdge = false;
                    createTab();
                }
            } else {
                if (posX <= 0) direction.x = 1;
                if (posX >= window.innerWidth - imgWidth) direction.x = -1;
                if (posY <= 0) direction.y = 1;
                if (posY >= window.innerHeight - imgWidth) direction.y = -1;

                img.style.transform = direction.x < 0 ? 'scaleX(-1)' : 'scaleX(1)';

                if (speed > 0) {
                    if (!isWalking) { img.src = walkSrc; isWalking = true; }
                    posX += direction.x * speed;
                    shakeOffset += shakeDirection * 0.4;
                    if (Math.abs(shakeOffset) > 1.5) shakeDirection *= -1;
                    posY += direction.y * 0.6 + (Math.random() - 0.5);
                } else {
                    if (isWalking) {
                        img.src = idleSrc;
                        isWalking = false;
                        isRareIdle = false;
                    }
                    if (!isRareIdle && Math.random() < 0.005) {
                        isRareIdle = true;
                        img.src = idleSrc;
                    }
                }
            }

            posX = Math.max(0, Math.min(posX, window.innerWidth - imgWidth));
            posY = Math.max(0, Math.min(posY, window.innerHeight - imgWidth));
            img.style.left = `${posX}px`;
            img.style.bottom = `${posY + shakeOffset}px`;
        }

        function createTab() {
            boxActive = true;
            isWalking = false;
            img.src = idleSrc;

            const tab = document.createElement('div');
            tab.style.position = 'fixed';
            tab.style.bottom = `${imgWidth}px`;
            tab.style[targetSide] = '0px';
            tab.style.width = '0px';
            tab.style.height = '200px';
            tab.style.background = '#fff';
            tab.style.border = '1px solid #888';
            tab.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
            tab.style.overflow = 'hidden';
            tab.style.zIndex = '999997';

            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.padding = '5px';
            header.style.background = '#0078D7';

            const title = document.createElement('div');
            title.textContent = 'Notepad';
            title.style.color = '#fff';
            title.style.fontFamily = 'Segoe UI, sans-serif';
            title.style.fontSize = '14px';

            const closeBtn = document.createElement('span');
            closeBtn.textContent = '✕';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.color = '#fff';
            closeBtn.onclick = () => {
                clearInterval(dragInterval);
                document.body.removeChild(tab);
                boxActive = false;
            };

            header.appendChild(title);
            header.appendChild(closeBtn);
            tab.appendChild(header);

            const content = document.createElement('div');
            content.style.padding = '10px';
            content.style.fontFamily = 'Segoe UI, sans-serif';
            content.style.color = '#000';
            content.textContent = messages[Math.floor(Math.random() * messages.length)];
            tab.appendChild(content);
            document.body.appendChild(tab);

            const targetWidth = 300;
            let currentWidth = 0;
            const dragInterval = setInterval(() => {
                currentWidth += 5;
                if (currentWidth >= targetWidth) {
                    clearInterval(dragInterval);
                    boxActive = false;
                }
                tab.style.width = `${currentWidth}px`;
                posX = targetSide === 'left' ? currentWidth : window.innerWidth - imgWidth - currentWidth;
                img.style.left = `${posX}px`;
            }, 20);
        }

        function chooseSmartDirection() {
            direction.x = Math.random() < 0.5 ? -1 : 1;
            direction.y = Math.random() < 0.5 ? -1 : 1;
        }

        setInterval(() => {
            if (!boxActive && !walkingToEdge && Math.random() < 0.01) {
                walkingToEdge = true;
                targetSide = Math.random() < 0.5 ? 'left' : 'right';
            }
        }, 60000);

        setInterval(() => {
            if (!walkingToEdge && !boxActive) {
                speed = Math.random() < 0.5 ? 0 : 2 + Math.random() * 3;
                chooseSmartDirection();
            }
        }, 1200);

        setInterval(updatePosition, 20);

        window.addEventListener('resize', () => {
            posX = Math.min(posX, window.innerWidth - imgWidth);
            posY = Math.min(posY, window.innerHeight - imgWidth);
        });
    }

    init();
})();
