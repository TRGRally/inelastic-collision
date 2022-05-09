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


function resolveCollision(o1, o2) { //collision handler, passes 2 objects in with expected xVelocity, yVelocity attributes
	var diffX = o2.x - o1.x
	var diffY = o2.y - o1.y
	
	var diffXVel = o1.xVelocity - o2.xVelocity
	var diffYVel = o1.yVelocity - o2.yVelocity
	if (diffXVel * diffX + diffYVel * diffY >= 0) { //checks if 2 objects are travelling in a direction that will collide - allows enemies to spawn over each other without glitching
		var theta = -Math.atan2(diffY, diffX) //angle of collision - note: "theta" here is technically neg. theta as it is the value to return from theta -> axis
		var o1NormXVel = o1.xVelocity * Math.cos(theta) - o1.yVelocity * Math.sin(theta) // rotation matrix modeled as individual equations for simplicity
		var o1NormYVel = o1.xVelocity * Math.sin(theta) + o1.yVelocity * Math.cos(theta) // takes 0bject 1, object 2 velocities and rotates them to the coordinate axis
		var o2NormXVel = o2.xVelocity * Math.cos(theta) - o2.yVelocity * Math.sin(theta) // allows the collision to be considered 1 dimensionally
		var o2NormYVel = o2.xVelocity * Math.sin(theta) + o2.yVelocity * Math.cos(theta) // reversed after collision calculation with negative theta
		//object 1 calc.
		var o1ResolvedXVel = o1NormXVel * (o1.mass - o2.mass) / (o1.mass + o2.mass) + o2NormXVel * 2 * o2.mass / (o1.mass + o2.mass) //conservation of kinetic energy, momentum
		var o1ResolvedYVel = o1NormYVel //1D ignores y vel
		//object 2 calc.
		var o2ResolvedXVel = o2NormXVel * (o2.mass - o1.mass) / (o1.mass + o2.mass) + o1NormXVel * 2 * o1.mass / (o1.mass + o2.mass) //conservation of kinetic energy, momentum
		var o2ResolvedYVel = o2NormYVel //1D ignores y vel
		//reverse rotation matrix
		var o1FinalXVel = o1ResolvedXVel * Math.cos(-theta) - o1ResolvedYVel * Math.sin(-theta)
		var o1FinalYVel = o1ResolvedYVel * Math.cos(-theta) + o1ResolvedXVel * Math.sin(-theta)
		var o2FinalXVel = o2ResolvedXVel * Math.cos(-theta) - o2ResolvedYVel * Math.sin(-theta)
		var o2FinalYVel = o2ResolvedYVel * Math.cos(-theta) + o2ResolvedXVel * Math.sin(-theta)
		//set values
		o1.xVelocity = o1FinalXVel
		o1.yVelocity = o1FinalYVel
		o2.xVelocity = o2FinalXVel
		o2.yVelocity = o2FinalYVel
		console.table(o1, o2)
	}
}

//defining classes
class Particle { //player template
	constructor(x, y, radius, color, xVelocity, yVelocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.xVelocity = xVelocity
		this.yVelocity = yVelocity
        this.floortime = 1
		this.mass = this.radius
	}

    physics(g, damping){
        this.onGround = false
        if (this.y < innerHeight - this.radius) {
            this.yVelocity = this.yVelocity + ((g / 100) * dt)
        } else {
            this.y = innerHeight - this.radius
            if (this.yVelocity < 0.34) {
                this.yVelocity = this.yVelocity / 2
                this.onGround = true
                
            }
            this.yVelocity = -(this.yVelocity / damping)
            if (this.onGround == false) {
                this.xVelocity = this.xVelocity / (1.2 * (damping / 1.4))
            } else {
                this.floortime = this.floortime + 0.01
                this.friction()
            }
        }  
        
        
        if (this.x >= innerWidth - this.radius) {
            this.x = innerWidth - this.radius
            if (this.xVelocity < 0.34) {
                this.xVelocity = this.xVelocity / 2
            }
            this.xVelocity = -(this.xVelocity / damping)
        }

		if (this.x <= this.radius) {
            this.x = this.radius
            if (this.xVelocity > 0.34) {
                this.xVelocity = this.xVelocity / 2
            }
            this.xVelocity = -(this.xVelocity / damping)
        }

    }

    friction() {
        if (this.xVelocity > 0) {
            this.xVelocity = this.xVelocity / (this.floortime)
		}
        if (this.xVelocity < 0) {
            this.xVelocity = this.xVelocity / (this.floortime)
        }
    }

	draw() { //create circle
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) //circle
		c.strokeStyle = this.color
		c.fillStyle = this.color
		c.shadowBlur = this.radius / 3
		c.shadowColor = this.color
		c.lineWidth = 2
		c.stroke() //draw line of cirlce
		c.closePath()
	}

	update() { //calls draw and changes coords based on velocity - ease of use function
		this.physics(0.5, (this.radius / 7))
        this.draw()

		this.y = this.y + this.yVelocity * dt
		this.x = this.x + this.xVelocity * dt
	}
}

class Cursor { //player template
	constructor(x, y, radius, color) {
		this.x = x
        this.lastx = null
		this.y = y
        this.lasty = null
		this.radius = radius
		this.color = color
        this.xVelocity = this.x - this.lastx
        this.yVelocity = this.y - this.lasty
	}

	draw() {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) 
		c.strokeStyle = this.color
		c.fillStyle = this.color
		c.shadowBlur = this.radius / 3
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
        this.radius = scale
	}
}





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

c.rect(0, 0, canvas.width, canvas.height)
var framecount = 0
var lastLoop = new Date()

//MAIN LOOP - RENDER WINDOW

function gameplayLoop() {
	framecount = framecount + 1
	var thisLoop = new Date()  //delta time since last frame
    var fps = Math.floor(1000 / (thisLoop - lastLoop))
    dt = (thisLoop - lastLoop)  //set dt
    lastLoop = thisLoop;
	DrawBackground()
	requestAnimationFrame(gameplayLoop) //queue next frame
    
    particles.forEach((particle) => {
        particle.update()
		particles.forEach((particle2) => {
			if (particle != particle2 && Pythagoras(particle, particle2) <= particle.radius + particle2.radius) {
				resolveCollision(particle, particle2)
				particle2.update()
			}
		})
    })
    cursor.update()
    if (framecount % (Math.round(10 * dt)) == 0) {
        fpscounter.innerHTML = fps
    }

    
}
let particles = []
let p1
let p2
let scale = 25
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
//startup
init()
gameplayLoop()




