function checkCollisions(box1, box2) {

    if (
        box2.offsetLeft >= box1.offsetLeft + box1.clientWidth ||
        box2.offsetLeft + box2.clientWidth <= box1.offsetLeft ||
        box2.offsetTop >= box1.offsetTop + box1.clientHeight ||
        box2.offsetTop + box2.clientHeight <= box1.offsetTop
    ) {
        return false;
    }

    return true;
}


var monde = document.getElementById("monde");
var starship = document.getElementById("starship");

var explosion = document.getElementById("explosion");
var gameOver = document.getElementById("gameOver");
var boutonRejouer = document.getElementById("rejouer");


var vitesse = 5;

var posX = starship.offsetLeft;
var posY = starship.offsetTop;

var touches = {};

var jeuEnCours = true;


// ========================================
// CONTROLE DU TELEPHONE
// ========================================

// Position de référence du téléphone
var orientationInitiale = {
    beta: 0,
    gamma: 0
};

var orientationConnue = false;


// Quand le téléphone est incliné
function gererOrientation(event) {

    if (!orientationConnue) {
        return;
    }

    var beta = event.beta || 0;
    var gamma = event.gamma || 0;


    // Différence par rapport à la position de départ
    var differenceX = gamma - orientationInitiale.gamma;
    var differenceY = beta - orientationInitiale.beta;


    // Zone morte pour éviter que le vaisseau bouge tout seul
    if (Math.abs(differenceX) < 3) {
        differenceX = 0;
    }

    if (Math.abs(differenceY) < 3) {
        differenceY = 0;
    }


    // Sensibilité
    var sensibilite = 0.5 ;


    // Déplacement horizontal
    posX += differenceX * sensibilite;


    // Déplacement vertical
    posY += differenceY * sensibilite;


    // Limites du monde
    posX = Math.max(
        0,
        Math.min(
            posX,
            monde.clientWidth - starship.clientWidth
        )
    );

    posY = Math.max(
        0,
        Math.min(
            posY,
            monde.clientHeight - starship.clientHeight
        )
    );
}


// Enregistrer la position initiale du téléphone
function calibrerTelephone(event) {

    orientationInitiale.beta = event.beta || 0;
    orientationInitiale.gamma = event.gamma || 0;

    orientationConnue = true;

    console.log("Téléphone calibré !");
    console.log("Beta :", orientationInitiale.beta);
    console.log("Gamma :", orientationInitiale.gamma);
}


// Demander l'autorisation sur iPhone
function activerGyroscope() {

    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {

        DeviceOrientationEvent.requestPermission()
            .then(function(permission) {

                if (permission === "granted") {

                    window.addEventListener(
                        "deviceorientation",
                        calibrerTelephone,
                        { once: true }
                    );

                    window.addEventListener(
                        "deviceorientation",
                        gererOrientation
                    );

                } else {
                    alert("Autorisation du gyroscope refusée.");
                }

            })
            .catch(function(error) {

                console.log(error);

            });

    } else {

        // Android et navigateurs compatibles
        window.addEventListener(
            "deviceorientation",
            calibrerTelephone,
            { once: true }
        );

        window.addEventListener(
            "deviceorientation",
            gererOrientation
        );
    }
}


// Activer le gyroscope
activerGyroscope();


// ========================================
// CLAVIER
// ========================================

document.addEventListener("keydown", function(event) {
    touches[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", function(event) {
    touches[event.key.toLowerCase()] = false;
});


// ========================================
// DEPLACEMENT DU VAISSEAU
// ========================================

function deplacerVaisseau() {

    if (!jeuEnCours) {
        return;
    }


    // Contrôles clavier
    if (touches["w"]) {
        posY -= vitesse;
    }

    if (touches["s"]) {
        posY += vitesse;
    }

    if (touches["a"]) {
        posX -= vitesse;
    }

    if (touches["d"]) {
        posX += vitesse;
    }


    // Limites
    posX = Math.max(
        0,
        Math.min(
            posX,
            monde.clientWidth - starship.clientWidth
        )
    );

    posY = Math.max(
        0,
        Math.min(
            posY,
            monde.clientHeight - starship.clientHeight
        )
    );


    starship.style.left = posX + "px";
    starship.style.top = posY + "px";


    requestAnimationFrame(deplacerVaisseau);
}

deplacerVaisseau();


// ========================================
// ASTEROIDES
// ========================================

function creerAsteroide() {

    if (!jeuEnCours) {
        return;
    }


    var asteroid = document.createElement("div");

    asteroid.className = "asteroid";

    asteroid.style.left = monde.clientWidth + "px";


    var positionY =
        Math.random() * (monde.clientHeight - 54);

    asteroid.style.top = positionY + "px";


    monde.appendChild(asteroid);


    var positionX = monde.clientWidth;


    function avancer() {

        if (!jeuEnCours) {

            asteroid.remove();

            return;
        }


        positionX -= 2;

        asteroid.style.left = positionX + "px";


        // Collision
        if (checkCollisions(starship, asteroid)) {

            asteroid.remove();

            perdreJeu();

            return;
        }


        if (positionX < -54) {

            asteroid.remove();

            return;
        }


        requestAnimationFrame(avancer);
    }


    avancer();
}


// ========================================
// GAME OVER
// ========================================

function perdreJeu() {

    if (!jeuEnCours) {
        return;
    }


    jeuEnCours = false;


    starship.style.display = "none";


    // Explosion
    explosion.style.left = posX + "px";
    explosion.style.top = posY + "px";

    explosion.style.display = "block";


    setTimeout(function() {

        explosion.style.display = "none";

        gameOver.style.display = "flex";

    }, 1000);
}


// ========================================
// REJOUER
// ========================================

boutonRejouer.addEventListener("click", function() {

    jeuEnCours = true;


    posX = 50;
    posY = monde.clientHeight / 2;


    starship.style.left = posX + "px";
    starship.style.top = posY + "px";


    starship.style.display = "block";

    gameOver.style.display = "none";


    // Recalibrer le téléphone
    // orientationConnue = false;


    deplacerVaisseau();

});


// ========================================
// CREATION DES ASTEROIDES
// ========================================

setInterval(creerAsteroide, 1000);