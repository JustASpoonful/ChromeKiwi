(function () {
    const idleSrc = chrome.runtime.getURL('assets/KiwiIdle.gif');
    const walkSrc = chrome.runtime.getURL('assets/KiwiWalking.gif');
    const honkSoundSrc = chrome.runtime.getURL('assets/nah.wav');

    const messages = [
        'I am kiwi',
        'jsahdkashdknxjskada',
        'whatcha doin there?',
        'Be in tune for upcoming major updates!|',
        'Surprise! This is a note'
    ];

    const img = document.createElement('img');
    img.src = idleSrc;
    img.style.position = 'fixed';
    img.style.left = '0px';
    img.style.bottom = '0px';
    img.style.zIndex = '999999';
    img.style.width = '150px';
    img.style.pointerEvents = 'none';
    document.body.appendChild(img);

    const honkSound = new Audio(honkSoundSrc);
    let speed = 0;
    let isWalking = false;
    let isRareIdle = false;
    let posX = 0;
    let posY = 0;
    let direction = { x: 1, y: 0 };
    let shakeOffset = 0;
    let shakeDirection = 1;

    let boxActive = false;
    let walkingToEdge = false;
    let targetSide = null;
    const imgWidth = 150;

    function updatePosition() {
        if (walkingToEdge) {
            if (!isWalking) { img.src = walkSrc; isWalking = true; }
            direction.x = targetSide === 'left' ? -1 : 1;
            const walkSpeed = 3;
            posX += direction.x * walkSpeed;
            if ((targetSide === 'left' && posX <= 0) || (targetSide === 'right' && posX >= window.innerWidth - imgWidth)) {
                posX = targetSide === 'left' ? 0 : window.innerWidth - imgWidth;
                walkingToEdge = false;
                createTab();
            }
        } else {
            if (posX <= 0 || posX >= window.innerWidth - imgWidth) direction.x *= -1;
            if (posY <= 0 || posY >= window.innerHeight - imgWidth) direction.y *= -1;
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
                if (!isRareIdle) {
                    (window.rareGifs || []).forEach(gif => {
                        if (gif.src && Math.random() < gif.chance) {
                            img.src = gif.src;
                            isRareIdle = true;
                        }
                    });
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

        const side = targetSide;
        const tab = document.createElement('div');
        tab.style.position = 'fixed';
        tab.style.bottom = `${imgWidth}px`;
        tab.style[side] = '0px';
        tab.style.width = '0px';
        tab.style.height = '200px';
        tab.style.background = '#fff';
        tab.style.border = '1px solid #888';
        tab.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        tab.style.overflow = 'hidden';
        tab.style.zIndex = '999998';

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
        header.appendChild(title);

        const closeBtn = document.createElement('span');
        closeBtn.textContent = '✕';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#fff';
        closeBtn.onclick = () => {
            clearInterval(dragInterval);
            document.body.removeChild(tab);
            boxActive = false;
        };
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
                boxActive = false; // allow kiwi to move again
            }
            tab.style.width = `${currentWidth}px`;
            posX = side === 'left' ? currentWidth : window.innerWidth - imgWidth - currentWidth;
            img.style.left = `${posX}px`;
        }, 20);
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
            direction.x = Math.random() < 0.5 ? -1 : 1;
            direction.y = speed > 0 ? (Math.random() < 0.7 ? (Math.random() < 0.5 ? 1 : -1) : 0) : 0;
        }
    }, 1200);

    setInterval(updatePosition, 20);

    setInterval(() => {
        if (Math.random() < 0.05) honkSound.play().catch(() => {});
    }, 2000);

    window.addEventListener('resize', () => {
        posX = Math.min(posX, window.innerWidth - imgWidth);
        posY = Math.min(posY, window.innerHeight - imgWidth);
    });
})();
