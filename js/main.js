const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

let score = 0;
let lives = 10; // Cambiar el número de vidas iniciales a 5
let level = 0;
let levelUp = false;
let bubblesPerLevel = 10;
let bubbleSpeedIncrement = 0.5;
let bubbles = [];
let particles = []; // Array para almacenar partículas

class Circle {
    constructor(x, y, radius, image, speed) {
        this.radius = radius;
        this.color = "#87CEEB"; // Azul cielo
        this.image = image; // Imagen de la burbuja
        this.speed = speed;
        this.score = Math.floor(Math.random() * 10) + 1; // Puntuación aleatoria entre 1 y 10
        
        // Genera las posiciones de los círculos de abajo hacia arriba
        this.posX = Math.max(radius, Math.random() * (window_width - 2 * radius));
        this.posY = window_height + radius;
        
        // Velocidades aleatorias para simular el movimiento de burbujas
        this.dx = (Math.random() - 0.5) * this.speed * 2;
        this.dy = -Math.random() * this.speed;
    }

    draw(context) {
        context.beginPath();
        
        // Dibuja el relleno del círculo
        context.fillStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        
        // Dibuja la imagen de la burbuja
        context.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);

        // Dibuja el contorno del círculo
        context.lineWidth = 2;
        context.strokeStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
        
        // Dibuja la puntuación dentro del círculo
        context.font = "20px Arial";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.fillText(this.score, this.posX, this.posY);
    }

    update(context, circles) {
        this.draw(context);

        // Actualiza la posición de acuerdo a la velocidad
        this.posX += this.dx;
        this.posY += this.dy;

        // Detecta colisiones con las paredes
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        if ((this.posY - this.radius) < 0) {
            // Resta vidas si el círculo toca el borde superior
            lives -= 1;
            if (lives <= 0) {
                alert("Fin del Juego! Tu puntaje final es: " + score);
                document.location.reload();
            } else {
                this.posY = window_height + this.radius; // Reposiciona el círculo en la parte inferior
            }
        }

        // Detecta colisiones con otros círculos
        for (let circle of circles) {
            if (circle !== this) {
                let dx = this.posX - circle.posX;
                let dy = this.posY - circle.posY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + circle.radius) {
                    // Si hay colisión, ajusta las posiciones para evitar superposición
                    let overlap = this.radius + circle.radius - distance;
                    let angle = Math.atan2(dy, dx);
                    let moveX = overlap * Math.cos(angle);
                    let moveY = overlap * Math.sin(angle);

                    this.posX += moveX / 2;
                    this.posY += moveY / 2;
                    circle.posX -= moveX / 2;
                    circle.posY -= moveY / 2;

                    // Cambia las direcciones para simular el rebote
                    let tempDx = this.dx;
                    let tempDy = this.dy;
                    this.dx = circle.dx;
                    this.dy = circle.dy;
                    circle.dx = tempDx;
                    circle.dy = tempDy;
                }
            }
        }
    }
}

// Clase para las partículas de la explosión
class Particle {
    constructor(x, y, radius, color, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
        this.alpha = 1.0;
    }

    draw(context) {
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        context.restore();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.02; // Disminuye la opacidad gradualmente
    }
}

// Array global de círculos
let circles = [];

// Función para generar un color aleatorio en formato hexadecimal
function getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Cargar la imagen de la burbuja
const bubbleImage = new Image();
bubbleImage.src = "burbuja.jpg"; // Ruta relativa de la imagen

// Cargar la imagen de fondo
const backgroundImage = new Image();
backgroundImage.src = "Fondo.jpg"; // Ruta relativa de la imagen de fondo

// Callback cuando la imagen se carga correctamente
bubbleImage.onload = function() {
    console.log("Imagen de burbuja cargada correctamente.");
    startLevel();
};

// Función para iniciar un nivel
function startLevel() {
    circles = [];
    for (let i = 0; i < bubblesPerLevel; i++) {
        let randomRadius = Math.floor(Math.random() * 100 + 30);
        let newCircle = new Circle(0, 0, randomRadius, bubbleImage, 2 + bubbleSpeedIncrement * (level - 1));
        circles.push(newCircle);
    }
    levelUp = true;
    setTimeout(() => { levelUp = false; }, 2000); // Mostrar el número de nivel durante 2 segundos
}

// Función para actualizar los círculos y el juego
function updateCircles() {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);

    // Dibuja la imagen de fondo
    ctx.drawImage(backgroundImage, 0, 0, window_width, window_height);

    for (let circle of circles) {
        circle.update(ctx, circles);
    }

    // Dibuja las partículas de explosión
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1); // Elimina partículas transparentes
        } else {
            particles[i].draw(ctx);
        }
    }

    // Dibuja la puntuación y las vidas restantes
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText("Tu Puntuación: " + score, 10, 30);
    ctx.fillText("Vidas Restantes: " + lives, 10, 60);

    // Dibuja el número de nivel al inicio de cada nivel
    if (levelUp) {
        ctx.font = "50px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Nivel " + level, window_width / 2, window_height / 2);
    }

    // Avanzar al siguiente nivel si todas las burbujas han sido eliminadas
    if (circles.length === 0 && !levelUp) {
        level++;
        bubblesPerLevel += 3; // Aumentar el número de burbujas en cada nivel
        startLevel();
    }
}

updateCircles();

// Agregar event listener para clics del mouse
canvas.addEventListener("click", function (event) {
    let rect = canvas.getBoundingClientRect(); // Obtener las dimensiones y posición del lienzo
    let mouseX = event.clientX - rect.left; // Ajustar la posición X del clic al lienzo
    let mouseY = event.clientY - rect.top; // Ajustar la posición Y del clic al lienzo

    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let dx = mouseX - circle.posX;
        let dy = mouseY - circle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= circle.radius) {
            // Si el clic está dentro del círculo, elimina el círculo del arreglo
            score += circle.score; // Aumenta la puntuación según el valor de la burbuja
            circles.splice(i, 1);
            createExplosion(mouseX, mouseY, circle.color); // Crear partículas de explosión
            break; // Salimos del bucle ya que solo queremos interactuar con un círculo a la vez
        }
    }
});

// Función para crear partículas de explosión
function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) { // Ajusta el número de partículas según sea necesario
        let radius = Math.random() * 5 + 2; // Tamaño aleatorio de las partículas
        let speedX = (Math.random() - 0.5) * 4;
        let speedY = (Math.random() - 0.5) * 4;
        let particle = new Particle(x, y, radius, color, speedX, speedY);
        particles.push(particle);
    }
}
