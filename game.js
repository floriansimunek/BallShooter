const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreElement = document.querySelector('#score')
const scoreModalElement = document.querySelector('#start h1')
const startElement = document.querySelector('#start')
const startButton = document.querySelector('#startButton')

class Player {
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
	}

	draw() {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		context.fillStyle = this.color
		context.fill()
	}
}

let player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let score = 0

function init() {
	player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white')
	projectiles = []
	enemies = []
	particles = []
	score = 0
	scoreElement.innerHTML = score
	scoreModalElement.innerHTML = score
}

class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		context.fillStyle = this.color
		context.fill()
	}

	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}

	draw() {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		context.fillStyle = this.color
		context.fill()
	}

	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4
		let x = 0,
			y = 0

		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
			y = Math.random() * canvas.height
		} else {
			x = Math.random() * canvas.width
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
		}

		const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle),
		}

		enemies.push(
			new Enemy(
				x,
				y,
				radius,
				`rgb(${Math.random() * 255},${Math.random() * 255},${
					Math.random() * 255
				})`,
				velocity,
			),
		)
	}, 1000)
}

const friction = 0.99
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		this.alpha = 1
	}

	draw() {
		context.save()
		context.globalAlpha = this.alpha
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		context.fillStyle = this.color
		context.fill()
		context.restore()
	}

	update() {
		this.draw()
		this.velocity.x *= friction
		this.velocity.y *= friction
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
		this.alpha -= 0.01
	}
}

let animationId

function animate() {
	animationId = requestAnimationFrame(animate)
	context.fillStyle = '#00000010'
	context.fillRect(0, 0, canvas.width, canvas.height)
	player.draw()

	projectiles.forEach((projectile, index) => {
		projectile.update()
		if (
			projectile.x + projectile.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			projectiles.splice(index, 1)
		}
	})

	enemies.forEach((enemy, eIndex) => {
		enemy.update()

		const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)

		if (distance - enemy.radius - player.radius < 1) {
			cancelAnimationFrame(animationId)
			startElement.style.display = 'flex'
		}

		projectiles.forEach((projectile, pIndex) => {
			const distance = Math.hypot(
				projectile.x - enemy.x,
				projectile.y - enemy.y,
			)

			if (distance - enemy.radius - projectile.radius < 1) {
				for (let i = 0; i <= enemy.radius * 2; i++) {
					particles.push(
						new Particle(
							projectile.x,
							projectile.y,
							Math.random() * 2,
							enemy.color,
							{
								x: (Math.random() - 0.5) * (Math.random() * 4),
								y: (Math.random() - 0.5) * (Math.random() * 4),
							},
						),
					)
				}

				if (enemy.radius - 10 > 5) {
					score += 100
					scoreElement.innerHTML = score
					scoreModalElement.innerHTML = score
					gsap.to(enemy, {
						radius: enemy.radius - 10,
					})
					setTimeout(() => {
						projectiles.splice(pIndex, 1)
					}, 0)
				} else {
					score += 250
					scoreElement.innerHTML = score
					scoreModalElement.innerHTML = score
					setTimeout(() => {
						enemies.splice(eIndex, 1)
						projectiles.splice(pIndex, 1)
					}, 0)
				}
			}
		})
	})

	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1)
		} else {
			particle.update()
		}
	})
}

window.addEventListener('click', (e) => {
	const angle = Math.atan2(
		e.clientY - canvas.height / 2,
		e.clientX - canvas.width / 2,
	)
	const velocity = {
		x: Math.cos(angle) * 4,
		y: Math.sin(angle) * 4,
	}

	projectiles.push(
		new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity),
	)
})

startButton.addEventListener('click', () => {
	init()
	animate()
	spawnEnemies()
	startElement.style.display = 'none'
})
