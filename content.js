(function () {
    const idleSrc = chrome.runtime.getURL('assets/KiwiIdle.gif');
    const walkSrc = chrome.runtime.getURL('assets/KiwiWalking.gif');
    const honkSoundSrc = chrome.runtime.getURL('assets/nah.wav');

    const rareGifs = [
        { src: '', chance: 0.001 },
        { src: '', chance: 0.000001 }
    ];

    const img = document.createElement('img');
    img.src = idleSrc;
    img.style.position = 'fixed';
    img.style.left = '0px'; // ✅ use left instead of right
    img.style.bottom = '0px';
    img.style.zIndex = '999999';
    img.style.width = '100px';
    img.style.pointerEvents = 'none';
    img.setAttribute('draggable', false);
    document.body.appendChild(img);

    const honkSound = new Audio(honkSoundSrc);

    let speed = 0;
    let isWalking = false;
    let isRareIdle = false;

    let posX = 0;
    let posY = 0;
    let direction = { x: 1, y: 0 }; // Start going right
    let shakeOffset = 0;
    let shakeDirection = 1;

    function updatePosition() {
        // Bounce off edges
        if (posX <= 0 || posX >= window.innerWidth - 100) direction.x *= -1;
        if (posY <= 0 || posY >= window.innerHeight - 100) direction.y *= -1;

        // Flip image only when moving left
        img.style.transform = direction.x < 0 ? 'scaleX(-1)' : 'scaleX(1)';

        if (speed > 0) {
            if (!isWalking) {
                img.src = walkSrc;
                isWalking = true;
            }

            posX += direction.x * speed;

            // Add shake/bounce
            shakeOffset += shakeDirection * 0.4;
            if (Math.abs(shakeOffset) > 1.5) shakeDirection *= -1;

            // Explore vertically
            posY += direction.y * 0.6 + (Math.random() - 0.5) * 1;
        } else {
            if (isWalking) {
                img.src = idleSrc;
                isWalking = false;
                isRareIdle = false;
            }

            // Rare idle gif
            if (!isRareIdle) {
                rareGifs.forEach((gif) => {
                    if (gif.src && Math.random() < gif.chance) {
                        img.src = gif.src;
                        isRareIdle = true;
                    }
                });
            }
        }

        // Keep on screen
        posX = Math.max(0, Math.min(posX, window.innerWidth - 100));
        posY = Math.max(0, Math.min(posY, window.innerHeight - 100));

        img.style.left = `${posX}px`;
        img.style.bottom = `${posY + shakeOffset}px`;
    }

    // Movement logic
    setInterval(() => {
        speed = Math.random() < 0.5 ? 0 : 2 + Math.random() * 3;
        direction.x = Math.random() < 0.5 ? -1 : 1;
        direction.y = speed > 0 ? (Math.random() < 0.7 ? (Math.random() < 0.5 ? 1 : -1) : 0) : 0;
    }, 1200);

    setInterval(updatePosition, 20);

    setInterval(() => {
        if (Math.random() < 0.05) {
            honkSound.play().catch(() => {});
        }
    }, 2000);

    window.addEventListener('resize', () => {
        posX = Math.min(posX, window.innerWidth - 100);
        posY = Math.min(posY, window.innerHeight - 100);
    });
})();
