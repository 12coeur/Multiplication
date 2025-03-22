const container = document.getElementById("container");
const plateau = document.getElementById("plateau");
const bille = document.getElementById("bille");
const randomText = document.getElementById("randomText");
const ButtonScore = document.getElementById("ButtonScore");
const product = document.getElementById("product");
const guide = document.getElementById("guide");
const angleguide = document.getElementById("angleguide");
const stepAngle = 360 / 36;

let score = 0;
let currentAngle = 0;
let guideAngle = 315;
let tourCounter = 0;
let rotationInterval;
let isDragging = false;
let startX = 0;
let startAngle = 0;
let accumulatedDelta = 0;
let angleOffset = 0;
let isAnimating = false;
const movementDistance = 40;
const animationDuration = 1000;

function normalizeAngle(angle) {
    return (angle % 360 + 360) % 360;
}

function adjustTransformOrigin() {
    const guideWidth = guide.offsetWidth;
    const guideHeight = guide.offsetHeight;
    guide.style.transformOrigin = `${guideWidth / 2}px ${guideHeight / 2}px`;
}

adjustTransformOrigin();
window.addEventListener('resize', adjustTransformOrigin);

function calculateAngle(clientX, clientY) {
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const angleRad = Math.atan2(deltaY, deltaX);
    const angleDeg = angleRad * (180 / Math.PI);
    return angleDeg;
}

function updateGuideRotation() {
    guide.style.transform = `translate(-50%, -50%) rotate(${guideAngle}deg)`;
}

function animateBall() {
    if (isAnimating) return;
    isAnimating = true;
    clearInterval(rotationInterval);

    const fixedGuideAngle = guideAngle;
    const angleRad = fixedGuideAngle * (Math.PI / 180);

    const containerStyles = getComputedStyle(container);
    const movementDistance = parseFloat(containerStyles.getPropertyValue('--ball-distance'));
    const animationDuration = 300;
    const pauseDuration = 100;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const billeWidth = bille.clientWidth;
    const billeHeight = bille.clientHeight;
    const startX = (containerWidth - billeWidth) / 2;
    const startY = (containerHeight - billeHeight) / 2;
    const vwInPixels = containerWidth / 100;

    function applyStep(distanceFromCenter, delay, easing) {
        const deltaX = Math.cos(angleRad) * distanceFromCenter * vwInPixels;
        const deltaY = Math.sin(angleRad) * distanceFromCenter * vwInPixels;
        setTimeout(() => {
            bille.style.transition = `transform ${animationDuration}ms ${easing}`;
            bille.style.transform = `translate(${startX + deltaX}px, ${startY + deltaY}px)`;
        }, delay);
    }

    bille.style.opacity = 1;
    applyStep(movementDistance, 0, 'ease-in');
    applyStep(movementDistance * 0.1, animationDuration + pauseDuration, 'ease-out');
    applyStep(movementDistance, (animationDuration + pauseDuration) * 2, 'ease-in');
    applyStep(movementDistance * 0.3, (animationDuration + pauseDuration) * 3, 'ease-out');
    applyStep(movementDistance, (animationDuration + pauseDuration) * 4, 'ease-in');
    applyStep(movementDistance * 0.6, (animationDuration + pauseDuration) * 5, 'ease-out');
    applyStep(movementDistance, (animationDuration + pauseDuration) * 6, 'ease-in');

    setTimeout(() => {
        bille.style.transition = `transform ${animationDuration}ms ease-in`;
        bille.style.transform = `translate(${startX}px, ${startY}px)`;
        bille.style.opacity = 0;
        setTimeout(() => {
            bille.style.opacity = 1;
            bille.style.transition = 'none';
            isAnimating = false;
            rotationInterval = setInterval(rotatePlateauStep, 1200);
        }, animationDuration + pauseDuration);
    }, (animationDuration + pauseDuration) * 7);

    let son = document.getElementById("cliclac");
    son.play();
    setTimeout(() => {
        son.pause();
        son.currentTime = 0;
    }, 1000);
}

function startRotation(x, y) {
    isDragging = true;
    startX = x;
    startY = y;
    accumulatedDelta = 0;
    startAngle = calculateAngle(x, y);
    guideAngle = startAngle;
    updateGuideRotation();
}

function rotateGuide(x, y) {
    if (isDragging) {
        const current = calculateAngle(x, y);
        const deltaAngle = current - startAngle;
        const stepsToApply = Math.floor(Math.abs(deltaAngle) / stepAngle);
        
        if (stepsToApply > 0) {
            const direction = deltaAngle > 0 ? 1 : -1;
            accumulatedDelta += direction * stepAngle * stepsToApply;
            startAngle = current;

            const totalPlateauAngle = currentAngle + tourCounter * 360;
            const rawGuideAngle = startAngle + accumulatedDelta;
            const nearestStep = Math.round((rawGuideAngle - totalPlateauAngle) / stepAngle) * stepAngle;
            guideAngle = totalPlateauAngle + nearestStep;

            guideAngle = normalizeAngle(guideAngle);
            updateGuideRotation();
        }
    }
}
function snapToPlateau() {
    isDragging = false;
    const totalPlateauAngle = currentAngle + tourCounter * 360;
    const nearestStep = Math.round((guideAngle - totalPlateauAngle) / stepAngle) * stepAngle;
    angleOffset = nearestStep;
    guideAngle = totalPlateauAngle + angleOffset;
    updateGuideRotation();

    const normalizedAngle = normalizeAngle(angleOffset + tourCounter * 360);
    angleguide.textContent = normalizedAngle;
    anglechoix.textContent = convertirAngle(normalizedAngle);
    animateBall();

    const productValue = parseInt(product.textContent);
    const anglechoixValue = parseInt(anglechoix.textContent);

    if (productValue === anglechoixValue) {
        if (score < 6) {
            score += 1;
            ButtonScore.textContent = `Score : ${score}`;
            let son = document.getElementById("pioupiou");
            son.play();
            updateBonusImages();

            if (score === 6) {
                let bravos = document.getElementById("bravos");
                bravos.play();
            }
        }
    } else {
        let son = document.getElementById("rate");
        son.play();
    }

    // Appliquer l'effet de scintillement
    const randomBox = document.getElementById("randomBox");
    randomBox.classList.add("scintillement");

    // Retirer la classe après la fin de l'animation (1.5 secondes)
    setTimeout(() => {
        randomBox.classList.remove("scintillement");
    }, 1500); // 1500ms = 1.5 secondes (3 répétitions de 0.5 seconde)

    generateRandomNumbers();
}


const correspondances = {
    10: 1, 20: 2, 30: 3, 40: 4, 50: 5, 60: 6, 70: 7, 80: 8, 90: 9, 100: 10,
    110: 12, 120: 14, 130: 15, 140: 16, 150: 18, 160: 20, 170: 21, 180: 24,
    190: 25, 200: 27, 210: 28, 220: 30, 230: 32, 240: 35, 250: 36, 260: 40,
    270: 42, 280: 45, 290: 48, 300: 49, 310: 54, 320: 56, 330: 63, 340: 64,
    350: 72, 0: 81
};
// Récupérer l'élément product et le son rate
const productElement = document.getElementById("product");
const rateSound = document.getElementById("rate");

// Ajouter un écouteur d'événement pour le survol (mouseenter)
productElement.addEventListener("mouseenter", () => {
    rateSound.play(); // Jouer le son rate
});

// Ajouter un écouteur d'événement pour le toucher (touchstart)
productElement.addEventListener("touchstart", () => {
    rateSound.play(); // Jouer le son rate
});


function convertirAngle(angleguide) {
    return correspondances[angleguide];
}

function updateBonusImages() {
    const images = [
        document.getElementById("img1"),
        document.getElementById("img2"),
        document.getElementById("img3"),
        document.getElementById("img4"),
        document.getElementById("img5"),
        document.getElementById("img6")
    ];

    images.forEach(img => img.style.display = "none");

    for (let i = 0; i < score; i++) {
        if (images[i]) {
            images[i].style.display = "block";
        }
    }
}

guide.addEventListener("mousedown", (event) => startRotation(event.clientX, event.clientY));
document.addEventListener("mousemove", (event) => rotateGuide(event.clientX, event.clientY));
document.addEventListener("mouseup", () => { if (isDragging) snapToPlateau(); });

guide.addEventListener("touchstart", (event) => startRotation(event.touches[0].clientX, event.touches[0].clientY));
document.addEventListener("touchmove", (event) => rotateGuide(event.touches[0].clientX, event.touches[0].clientY));
document.addEventListener("touchend", () => { if (isDragging) snapToPlateau(); });

function setGuidePosition() {
    guide.style.position = "absolute";
    guide.style.top = "50%";
    guide.style.left = "50%";
    guide.style.transform = `translate(-50%, -50%) rotate(${guideAngle}deg)`;
}

function setInitialPosition() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const billeWidth = bille.clientWidth;
    const billeHeight = bille.clientHeight;
    let startX = (containerWidth - billeWidth) / 2;
    let startY = (containerHeight - billeHeight) / 2;
    bille.style.transform = `translate(${startX}px, ${startY}px)`;
}

setGuidePosition();
setInitialPosition();

function rotatePlateauStep() {
    currentAngle += stepAngle;
    if (currentAngle >= 360) {
        currentAngle -= 360;
        tourCounter++;
    } else if (currentAngle < 0) {
        currentAngle += 360;
        tourCounter--;
    }
    updatePlateauRotation();
    if (!isDragging) {
        guideAngle = currentAngle + angleOffset + tourCounter * 360;
        updateGuideRotation();
    }
}

function updatePlateauRotation() {
    plateau.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;    
}

function generateRandomNumbers() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    randomText.textContent = `${a} X ${b}`;
    product.textContent = a * b;
}

generateRandomNumbers();

rotationInterval = setInterval(rotatePlateauStep, 1200);

bille.addEventListener('dragstart', (e) => e.preventDefault());
bille.addEventListener('drop', (e) => e.preventDefault());
guide.addEventListener('dragstart', (e) => e.preventDefault());

const go2Button = document.getElementById("go2Button");
const grilleOverlay = document.getElementById("grilleOverlay");

function handleReset() {
    grilleOverlay.style.display = "block";
    let ding = document.getElementById("ding");
    ding.play();

    // Ajouter un délai avant de masquer l'overlay et recharger la page
    setTimeout(() => {
        grilleOverlay.style.display = "none";
        score = 0;
        ButtonScore.textContent = `Score : ${score}`;
        updateBonusImages();
        location.reload();
    }, 3000); // Délai de 3000 ms (3 secondes)
}

go2Button.addEventListener("mousedown", handleReset);
go2Button.addEventListener("touchstart", handleReset);

product.addEventListener('mouseenter', () => {
    retirerPoint();
});

product.addEventListener('touchstart', () => {
    retirerPoint();
});

document.addEventListener('touchstart', function(event) {
    event.preventDefault();
}, { passive: false });

function retirerPoint() {
    if (score > 0) {
        score -= 1;
        ButtonScore.textContent = `Score : ${score}`;
        updateBonusImages();
    }
}