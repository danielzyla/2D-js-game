const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const cw = canvas.width = 1080;
const ch = canvas.height = 768;

canvas.style.outline = "2px solid black";
canvas.style.backgroundColor = "rgb(66, 188, 245)";

class Sprite {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.img = null;
        this.width = 0;
        this.height = 0;
    }

    setImage(imgPath) {
        this.img = new Image();
        this.img.src = imgPath;
        this.img.style.display = "none";
        document.getElementsByTagName("body")[0].appendChild(this.img);
    }

    setDimensions(width, height) {
        this.width = width;
        this.height = height;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Hero extends Sprite {
    constructor(x, y, img, width, height) {
        super(x, y, img, width, height);
    }
}

let lifesNumber = 3;

const hero = new Hero();
hero.setImage("./img/platformChar_jump.png");
hero.img.onload = function() {
    hero.setDimensions(this.width, this.height);
    hero.setPosition(cw / 3 - this.width, 0);
};

class Life extends Sprite {
    constructor(x, y, img, width, height, amount) {
        super(x, y, img, width, height);
        this.amount = amount;
    }
}

const life = new Life(lifesNumber);
life.setImage("./img/platformPack_item017.png");
life.img.onload = function() {
    life.setDimensions(this.width, this.height);
}

class Platform extends Sprite {
    constructor(x, y, img, width, height) {
        super(x, y, img, width, height);
        this.diamond = null;
    }

    addDiamond() {
        let thisPlatform = this;
        this.diamond = new Diamond();
        this.diamond.setImage("./img/platformPack_item008.png");
        this.diamond.img.onload = function() {
            thisPlatform.diamond.width = this.width;
            thisPlatform.diamond.height = this.height;
            thisPlatform.diamond.setPosition(thisPlatform.x, thisPlatform.y - 100);
        }
    }
}

let platformLength = null;
const boardItems = [];
let platformX = 0;
let platformY = 0;
let currentPlatform = null;
let platformPassed = null;

class Diamond extends Sprite {
    constructor(x, y, img, width, height) {
        super(x, y, img, width, height);
    }
}

class Lift extends Sprite {
    constructor(x, y, img, width, height) {
        super(x, y, img, width, height);
    }
}

let isGravity = true;

for(let p = 0; p < 30; p++) {
    const platform = new Platform();
    platform.setImage("./img/platformPack_tile001.png");

    function setPlatformY(img, valY) {
        platformY = ch - img.height - valY;
        platform.y = platformY;
        if(valY === 600) platform.addDiamond();
    }

    platform.img.onload = function() {
        platform.width = this.width;
        platformLength += this.width;
        platform.height = this.height;
        platform.x = platformX;
        boardItems.push(platform);
        if(boardItems.indexOf(platform) % 10 >= 2 &&  boardItems.indexOf(platform) % 10 <= 3) setPlatformY(this, 200);
        else if(boardItems.indexOf(platform) % 10 >= 4 &&  boardItems.indexOf(platform) % 10 <= 5) setPlatformY(this, 400);
        else if(boardItems.indexOf(platform) % 10 >= 6 &&  boardItems.indexOf(platform) % 10 <= 7) setPlatformY(this, 600);
        else if(boardItems.indexOf(platform) % 10 >= 8 ) setPlatformY(this, 800);
        else setPlatformY(this, 0);
        
        platformX += this.width;
        currentPlatform = boardItems[0];
    };
}

for (let i = 0; i < 4; i++) {
    let lift = new Lift();
    lift.setImage("./img/platformPack_tile039.png");
    lift.img.onload = function() {
        lift.width = this.width;
        lift.height = this.height;
        lift.setPosition(platformLength, 0);
        platformLength += this.width;
        boardItems.push(lift);
    }
}

collision = {isOnTop: null, isOnBottom: null};

function collisionWithObject() {
    for(let p of boardItems) {
        let dhh = hero.y + hero.height;
        let dph = p.y + p.height;
        let dhw = hero.x + hero.width;
        let dpw = p.x + p.width;
        let ddw = null;
        let ddh = null;

        let collisionWithPlatform = dhw >= p.x && hero.x <= dpw && dhh >= p.y && hero.y <= dph;

        if(p.diamond) {
            ddw =  p.diamond.x + p.diamond.width;
            ddh = p.diamond.y + p.diamond.height;
        }

        if(hero.y < p.y && collisionWithPlatform) {
            currentPlatform = p;
            hero.y = currentPlatform.y - hero.height;
            collision.isOnTop = true;
            collision.isOnBottom = false;
            moveDown = 7;
        } else if(hero.y > p.y && collisionWithPlatform) {
            currentPlatform = p;
            collision.isOnTop = false;
            collision.isOnBottom = true;
            isGravity = true;
        } 

        if(
            p.diamond && 
            dhw >= p.diamond.x &&
            hero.x <= ddw &&
            dhh >= p.diamond.y &&
            hero.y <= ddh
        ){  
            p.diamond = null;
            result += 100;
            let audio = new Audio("./audio/coin.wav");
            audio.play();
        }
    }
}

function lifeLoss() {
    lifesNumber--;
    if(lifesNumber === 0) gameOver();
}

let stopGame = false;

function gameOver() {
    alert("GAME OVER!");
    stopGame = true;
}

let result = 0;
let theHighestPY = null;

function getTheHighestPY() {
    theHighestPY = boardItems.find(p => p instanceof Platform).y;
    boardItems.forEach(p => {
        if(p instanceof Platform) {
            if(p.y > theHighestPY) theHighestPY = p.y;
        }
    })
}

let liftCourseY = 1;
let liftY = 0;

function moveLift() {
    liftY += liftCourseY;
    boardItems.filter(p => p instanceof Lift).forEach(l => {
        l.y = theHighestPY - liftY;
        if(l.y >= theHighestPY) liftCourseY = 1;
        if(l.y <= theHighestPY - ch) liftCourseY = -1;
    })
}

let moveUp = 15;
let moveDown = 7;


function gravity(flag) {
    if(flag || collision.isOnBottom) {
        if((hero.y - hero.height) <= theHighestPY) {
            moveDown *= 1.01;
            hero.y += moveDown;
            if(currentPlatform instanceof Platform && hero.y + hero.height > ch - currentPlatform.height - 400) { 
                for(p of boardItems) {
                    if(theHighestPY >= ch - currentPlatform.height) {
                        if(p instanceof Platform) p.y -= moveDown ;
                        if(p.diamond) p.diamond.y -= moveDown;
                    }
                }
            }
            if(currentPlatform instanceof Lift) {     
                if(hero.y < ch / 4) { 
                    for(p of boardItems) {           
                        if(p instanceof Platform) p.y += Math.abs(liftCourseY);
                        if(p.diamond) p.diamond.y += Math.abs(liftCourseY);                     
                    }
                } 
                if(hero.y >= ch / 2) {
                    for(p of boardItems) {
                        
                        if(theHighestPY >= ch - currentPlatform.height) {
                            if(p instanceof Platform) p.y -= Math.abs(liftCourseY);
                            if(p.diamond) p.diamond.y -= Math.abs(liftCourseY);
                        }
                    }
                }
            } 
        } else {
            lifeLoss();
            hero.setPosition(cw / 3 - hero.width, 0);
        }
    } else if(!flag && hero.y > platformPassed.y - 400) {
        moveUp *= 0.99;
        if(hero.y > ch / 3) {
            hero.y -= moveUp;  
        } else {
            for(p of boardItems) {
                p.y += moveUp;
                if(p.diamond) p.diamond.y += moveUp;
            }
        }
    } else isGravity = true;
}

function draw() {
    gravity(isGravity);
    ctx.drawImage(hero.img, hero.x, hero.y); 
    ctx.drawImage(life.img, life.x, life.y);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#E85017";
    ctx.fillText(lifesNumber, 55, 42);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#FFAB1A";
    ctx.fillText(result, cw - ctx.measureText(result).width - 20, 42);

    for(p of boardItems) {
        ctx.drawImage(p.img, p.x, p.y);
        if(p.diamond) ctx.drawImage(p.diamond.img, p.diamond.x, p.diamond.y);
    }  
}

function moveX(velX) {
    if(velX < 0 && hero.x >= cw / 10) hero.x += velX;
    else if(velX > 0 && hero.x < cw / 3 * 2 - hero.width) hero.x += velX;
    else if(boardItems[0].x <= 0) {
        for(p of boardItems) {
            p.x -= velX;
            if(p.diamond) p.diamond.x -= velX;
        }
    } else if(boardItems[0].x > 0) {
        let pX = 0;
        for (p of boardItems) {
            p.x = pX;
            if(p.diamond) p.diamond.x = pX;
            pX += p.width;
        }
    } 
}

let keysDown = [];

function moveHero() {
    if(keysDown.ArrowLeft) moveX(-5);
    if(keysDown.ArrowRight) moveX(5);
    if(keysDown.Space) if(collision.isOnTop) {
        isGravity = false;
        platformPassed = currentPlatform;
        collision.isOnTop = false;
        moveUp = 15;
    }
}

window.onload = function() {
    window.addEventListener("keydown", (e) => {
        keysDown[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
        keysDown[e.code] = false;
    });

    function game() {
        ctx.clearRect(0, 0, cw, ch);
        draw();
        moveHero();
        getTheHighestPY();
        moveLift();
        collisionWithObject();
        if(!stopGame) requestAnimationFrame(game);
    }

    game();
}