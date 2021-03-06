//running js and parsing canvas
var canvas = document.querySelector("canvas")
var c = canvas.getContext("2d")
canvas.shadowBlur = 0
canvas.width = innerWidth
canvas.height = innerHeight
c.imageSmoothingEnabled = true
var dt = 1
let mouse = { 	//mouse object for coords
    x: innerWidth / 2,
    y: innerHeight / 2
}
let cursor
//html elements
let fpscounter = document.getElementById("fps")






addEventListener("mousemove", function(event) { //update mouse object coords every time move event detected
    mouse.x = event.clientX
    mouse.y = event.clientY
})
addEventListener("resize", function() { //update render window size when the browser window size is changed
    canvas.width = innerWidth
    canvas.height = innerHeight
})

//Distance between two points equation
function Pythagoras(o1, o2) {

    let xDistance = o2.x - o1.x

    let yDistance = o2.y - o1.y

    return Math.sqrt(Math.pow(xDistance, 2 ) + Math.pow(yDistance, 2))

}

let cR = 0.8
function resolveCollision(o1, o2, dist) { 
    if (locked == true) {
        console.log("locked")
        return
    }
    locked = true  
    var diffX = o2.x - o1.x
    var diffY = o2.y - o1.y
    
    var diffXVel = o1.xvel - o2.xvel
    var diffYVel = o1.yvel - o2.yvel
    if (o2 instanceof Cursor){
        var theta = -Math.atan2(diffY, diffX) //angle of collision - note: "theta" here is technically neg. theta as it is the value to return from theta -> axis
        var gradientOfCollision = diffY / diffX

        var o1NormX = o1.x * Math.cos(theta) - o1.y * Math.sin(theta) 
        var o1NormY = o1.x * Math.sin(-theta) + o1.y * Math.cos(-theta) 
        var o2NormX = o2.x * Math.cos(theta) - o2.y * Math.sin(theta)
        var o2NormY = o2.x * Math.sin(-theta) + o2.y * Math.cos(-theta)
        if (dist < (o1.r + o2.r) ) {
            console.log(o1.y.toFixed(0), o1.x.toFixed(0), "BEFORE")
            o1.y = o1.y - ((o1.r + o2.r) - dist)
            console.log(o1.y.toFixed(0), o1.x.toFixed(0), "AFTER")

        }

        var o1NormXVel = o1.xvel * Math.cos(theta) - o1.yvel * Math.sin(theta) // rotation matrix modeled as individual equations for simplicity
        var o1NormYVel = o1.xvel * Math.sin(theta) + o1.yvel * Math.cos(theta) // takes 0bject 1, object 2 velocities and rotates them to the coordinate axis
        var o2NormXVel = o2.xvel * Math.cos(theta) - o2.yvel * Math.sin(theta) // allows the collision to be considered 1 dimensionally
        var o2NormYVel = o2.xvel * Math.sin(theta) + o2.yvel * Math.cos(theta) // reversed after collision calculation with negative theta

        
        
        //object 1 calc.
        var o1ResolvedXVel = o1NormXVel * (o1.m - o2.m) / (o1.m + o2.m) + o2NormXVel * 2 * o2.m / (o1.m + o2.m) //conservation of kinetic energy, momentum
        var o1ResolvedYVel = o1NormYVel //1D ignores y vel
        //object 2 calc.
        //reverse rotation matrix
        var o1FinalXVel = o1ResolvedXVel * Math.cos(-theta) - o1ResolvedYVel * Math.sin(-theta)
        var o1FinalYVel = o1ResolvedYVel * Math.cos(-theta) + o1ResolvedXVel * Math.sin(-theta)

        //set values
        
        o1.xvel = o1FinalXVel * o1.elasticity
        o1.yvel = o1FinalYVel
        return
    }

    if (diffXVel * diffX + diffYVel * diffY >= 0) {
        //checks if 2 objects are travelling in a direction that will collide - allows enemies to spawn over each other without glitching
        var theta = -Math.atan2(diffY, diffX) //angle of collision - note: "theta" here is technically neg. theta as it is the value to return from theta -> axis

        var o1NormX = o1.x * Math.cos(theta) - o1.y * Math.sin(theta) 
        var o1NormY = o1.x * Math.sin(theta) + o1.y * Math.cos(theta)
        var o2NormX = o2.x * Math.cos(theta) - o2.y * Math.sin(theta)
        var o2NormY = o2.x * Math.sin(theta) + o2.y * Math.cos(theta)
        if (dist < (o1.r + o2.r) ) {
            console.log(o1.y.toFixed(0), o1.x.toFixed(0), "BEFORE")
            o1.y = o1.y - ((o1.r + o2.r) - dist)
            console.log(o1.y.toFixed(0), o1.x.toFixed(0), "AFTER")

        }


        var o1NormXVel = o1.xvel * Math.cos(theta) - o1.yvel * Math.sin(theta) // rotation matrix modeled as individual equations for simplicity
        var o1NormYVel = o1.xvel * Math.sin(theta) + o1.yvel * Math.cos(theta) // takes 0bject 1, object 2 velocities and rotates them to the coordinate axis
        var o2NormXVel = o2.xvel * Math.cos(theta) - o2.yvel * Math.sin(theta) // allows the collision to be considered 1 dimensionally
        var o2NormYVel = o2.xvel * Math.sin(theta) + o2.yvel * Math.cos(theta) // reversed after collision calculation with negative theta
        
        

        //object 1 calc.
        var o1ResolvedXVel = o1NormXVel * (o1.m - o2.m) / (o1.m + o2.m) + o2NormXVel * 2 * o2.m / (o1.m + o2.m) //conservation of kinetic energy, momentum
        var o1ResolvedYVel = o1NormYVel //1D ignores y vel
        //object 2 calc.
        var o2ResolvedXVel = o2NormXVel * (o2.m - o1.m) / (o1.m + o2.m) + o1NormXVel * 2 * o1.m / (o1.m + o2.m)//conservation of kinetic energy, momentum
        var o2ResolvedYVel = o2NormYVel //1D ignores y vel
        //reverse rotation matrix
        var o1FinalXVel = o1ResolvedXVel * Math.cos(-theta) - o1ResolvedYVel * Math.sin(-theta)
        var o1FinalYVel = o1ResolvedYVel * Math.cos(-theta) + o1ResolvedXVel * Math.sin(-theta)
        var o2FinalXVel = o2ResolvedXVel * Math.cos(-theta) - o2ResolvedYVel * Math.sin(-theta)
        var o2FinalYVel = o2ResolvedYVel * Math.cos(-theta) + o2ResolvedXVel * Math.sin(-theta)
        //set values
        
        o1.xvel = o1FinalXVel * o1.elasticity
        o1.yvel = o1FinalYVel
        o2.xvel = o2FinalXVel * o1.elasticity
        o2.yvel = o2FinalYVel		
    } 

}
let scale = 25
//defining classes
class Particle { //player template
    constructor(x, y, r, color, xvel, yvel) {
        this.x = x
        this.y = y
        this.r = r
        this.color = color
        this.xvel = xvel
        this.yvel = yvel
        this.floortime = 1
        this.m = this.r / 2
        this.elasticity = 1 - ((this.r - 1) / 50)
        this.onGround = false
        this.stillInCursor = true
    }

    physics(g, damping){
        if (this.y < innerHeight - this.r) {
            this.yvel = this.yvel + ((g / 100) * dt)
        } else {
            this.y = innerHeight - this.r
            
            this.yvel = -this.yvel * this.elasticity
            this.xvel = this.xvel / (damping / 2)
        }
    
        
        
        if (this.x >= innerWidth - this.r) {
            this.x = innerWidth - this.r
            if (this.xvel < 0.34) {
                this.xvel = this.xvel / 2
            }
            this.xvel = -this.xvel * this.elasticity
        }

        if (this.x <= this.r) {
            this.x = this.r
            if (this.xvel > 0.34) {
                this.xvel = this.xvel / 2
            }
            this.xvel = -this.xvel * this.elasticity
        }

    }

    friction() {
        if (this.xvel > 0) {
            this.xvel = this.xvel / (this.floortime)
        }
        if (this.xvel < 0) {
            this.xvel = this.xvel / (this.floortime)
        }
    }

    edgeCollision(){
        if (this.x >= innerWidth - this.r){
            this.x = innerWidth - this.r
            this.xvel = -this.xvel
        }
        if (this.x <= this.r){
            this.x = this.r
            this.xvel = -this.xvel
        }

        if (this.y >= innerHeight - this.r){
            this.y = innerHeight - this.r
            this.yvel = -this.yvel
        }
        if (this.y <= this.r){
            this.y = this.r
            this.yvel = -this.yvel
        }
    }

    draw() { //create circle
        c.beginPath()
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false) //circle
        c.strokeStyle = this.color
        c.fillStyle = this.color
        c.shadowBlur = this.r / 3
        c.shadowColor = this.color
        c.lineWidth = 2
        c.stroke() //draw line of cirlce
        c.closePath()
    }

    update() { //calls draw and changes coords based on velocity - ease of use function
        this.physics(0.5, (this.r / 7))
        //this.edgeCollision()
        this.draw()

        this.y = this.y + this.yvel * dt
        this.x = this.x + this.xvel * dt
    }
}

class Cursor { //player template
    constructor(x, y, r, color) {
        this.x = x
        this.lastx = null
        this.y = y
        this.lasty = null
        this.r = 25
        this.color = color
        this.xvel = 0
        this.yel = 0
        this.m = 9999999
        this.elasticity = 1
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false) 
        c.strokeStyle = this.color
        c.fillStyle = this.color
        c.shadowBlur = this.r / 3
        c.shadowColor = this.color
        c.lineWidth = 2
        c.stroke()
        c.closePath()
    }

    update() {
        this.draw()
        this.lasty = this.y
        this.y = mouse.y
        this.lastx = this.x
        this.x = mouse.x
        if (this.x - this.lastx > 0){
            this.xvel = this.x - this.lastx
        } else if (this.x - this.lastx < 0){
            this.xvel = this.lastx - this.x
        } else if (this.x - this.lastx == 0){
            this.xvel = 0
        }

        if (this.y - this.lasty > 0){
            this.yvel = (this.y - this.lasty) / 10
        } else if (this.y - this.lasty < 0){
            this.yvel = (this.lasty - this.y) / 10
        } else if (this.y - this.lasty == 0) {
            this.yvel = 0
        }
        
        this.yvel = ((this.y - this.lasty) / dt ) / 2
        this.xvel = ((this.x - this.lastx) / dt ) / 2
        this.r = scale
        
    }
}


let delay


function init() { //called on startup 
    cursor = new Cursor(mouse.x, mouse.y, 10, "red", 0, 0)
}

let vignette
var bgColor = "rgba(26, 25, 23, 1)"
function DrawBackground(){ //creates the background gradient, draws it
    vignette = c.createRadialGradient(innerWidth / 2, innerHeight / 2, innerWidth / 1, innerWidth / 2, innerHeight / 2, innerWidth / 3) //vignette shape
    vignette.addColorStop(0, "rgba(0, 0, 0, 1") //vignette inner colour
    vignette.addColorStop(1, bgColor) //vignette outer colour
    c.fillStyle = vignette
    c.fillRect(0, 0, canvas.width, canvas.height) //fill
}

function randomColour(threshold){
    let colour =  Math.floor(Math.random() * 256)
    while (colour < threshold) {
        colour = Math.floor(Math.random() * 256)
    }
    return colour
}
//init global scope vars, hoisted to beginning of file but put here as used in main loop
let locked = false
c.rect(0, 0, canvas.width, canvas.height)
var framecount = 0
var lastLoop = new Date()

//MAIN LOOP - RENDER WINDOW

function gameplayLoop() {
    framecount = framecount + 1
    var thisLoop = new Date()  //delta time since last frame
    var fps = Math.floor(1000 / (thisLoop - lastLoop))
    //dt = (thisLoop - lastLoop)  //set dt
    delay = document.getElementById("slider").value
    if (delay <= 4) {
        dt = (thisLoop - lastLoop)  //set dt
        requestAnimationFrame(gameplayLoop)
    } else {
        dt = 10
        setTimeout(requestAnimationFrame, delay, gameplayLoop)
    }
    
    lastLoop = thisLoop;
    DrawBackground()
    
     //queue next frame
    
    particles.forEach((particle) => {
        particle.update()
        particles.forEach((particle2) => {
            if (particle != particle2 && Pythagoras(particle, particle2) <= particle.r + particle2.r) {
                
                resolveCollision(particle, particle2)
                locked = false
            

            }
        })

        if (Pythagoras(particle, cursor) <= particle.r + cursor.r){
            if (particle.stillInCursor == false) {
                resolveCollision(particle, cursor, (Pythagoras(particle, cursor)))
                locked = false
            }
            
        } else {
            particle.stillInCursor = false
        }
    })
    cursor.update()
    if (framecount % (Math.round(5)) == 0) {
        fpscounter.innerHTML = `${fps}, ${cursor.xvel.toFixed(3)}, ${cursor.yvel.toFixed(3)}, ${cursor.x}, ${cursor.y}`
    }

    
    
}
let particles = []
let p1
let p2

addEventListener("mousedown", () => {
    p1 = {x: mouse.x, y: mouse.y}
    cursor.color = "white"
})

addEventListener("mouseup", () => {
    p2 = {x: mouse.x, y: mouse.y}
    let n = 70
    particles.push(new Particle(mouse.x, mouse.y, scale, `rgb(${randomColour(150)},${randomColour(150)},${randomColour(150)})`, (p1.x - p2.x) / n, (p1.y - p2.y) / n))
    cursor.color = "red"
})

addEventListener("wheel", (event) => {
    scale += event.deltaY * -0.01
    if (scale < 9) {
        scale = 9
    }
    if (scale > 50) {
        scale = 50
    }
})

addEventListener("keydown", (e) => {
    if (e.keyCode == 32) {
        requestAnimationFrame(gameplayLoop)
        console.log("new frame")
    }
})
//startup
init()
gameplayLoop()




