(function() {
    var img = document.createElement('img');
    var idleSrc = 'assets/KiwiIdle.gif';
    var walkSrc = 'assets/KiwiWalking.gif';
    var walkSound = new Audio('');
    var rareGifs = [
        { src: '', chance: 0.001 },  
        { src: '', chance: 0.000001 } 
    ];
    img.src = idleSrc;
    img.style.position = 'fixed';
    img.style.bottom = '0px';
    img.style.right = '0px';
    img.style.zIndex = 9999;
    img.setAttribute('draggable', false);
    document.body.appendChild(img);

    var speed = 3;
    var chasing = false;
    var Bird = 1;
    var direction = {x: 1, y: 1};
    var isWalking = false;
    var isRareIdle = false;

    setInterval(function() {
        if (!chasing) {
            var x = parseInt(img.style.right);
            var y = parseInt(img.style.bottom);

            if (x > window.innerWidth - 100 || x < 0) direction.x *= -1;
            if (y > window.innerHeight - 100 || y < 0) direction.y *= -1;

            img.style.transform = direction.x === 1 ? 'scaleX(1)' : 'scaleX(-1)';

            if (speed > 0 && !isWalking) {
                img.src = walkSrc;
                walkSound.play();
                isWalking = true;
            } else if (speed === 0 && isWalking) {
                img.src = idleSrc;
                isWalking = false;
                isRareIdle = false;
            }

            if (Math.random() >= 0.89) {
                img.style.right = (x + speed * direction.x) + 'px';
            } else {
                img.style.bottom = (y + speed * direction.y) + 'px';
            }

        }
    }, 20);

    setInterval(function() {
        if (!chasing) {
            speed = Math.random() < 0.5 ? 0 : 5;
            if (speed === 0 && !isRareIdle) {
                rareGifs.forEach(function(gif) {
                    if (Math.random() < gif.chance) {
                        img.src = gif.src;
                        isRareIdle = true;
                    }
                });
            }

            direction.x = Math.random() < 0.5 ? -1 : 1;
            direction.y = Math.random() < 0.5 ? -1 : 1;
        }
    }, 1000);

    var honkSound = new Audio('assets/nah.wav');
    setInterval(function() {
        if (Math.random() < 0.05) {
            honkSound.play();
        }
    }, 1000);
})();
