// Smooth scroll functionality
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero particle animation
    initHeroParticles();
    
    // Add animation to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// Add navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(21, 27, 43, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'var(--light-bg)';
        navbar.style.backdropFilter = 'none';
    }
});

// Hero Particle Animation
function initHeroParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animationFrameId;
    
    // Set canvas size
    function setCanvasSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    setCanvasSize();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        setCanvasSize();
        initParticles();
    });
    
    // Track mouse position relative to hero section
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    hero.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
            // Random initial position
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }
        
        reset() {
            this.baseX = Math.random() * canvas.width;
            this.baseY = Math.random() * canvas.height;
            this.x = this.baseX;
            this.y = this.baseY;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.density = (Math.random() * 30) + 1;
            // Color variations with theme colors
            const colors = [
                'rgba(20, 184, 166, 0.8)',   // primary-color
                'rgba(6, 182, 212, 0.8)',    // secondary-color
                'rgba(34, 211, 238, 0.8)',   // accent
                'rgba(226, 232, 240, 0.6)'   // text-primary
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
        
        update() {
            // Smooth floating animation
            this.baseX += this.speedX;
            this.baseY += this.speedY;
            
            // Wrap around edges
            if (this.baseX < 0) this.baseX = canvas.width;
            if (this.baseX > canvas.width) this.baseX = 0;
            if (this.baseY < 0) this.baseY = canvas.height;
            if (this.baseY > canvas.height) this.baseY = 0;
            
            // Mouse interaction - repel particles
            if (mouse.x != null && mouse.y != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                
                if (distance < mouse.radius) {
                    // Repel away from mouse
                    const directionX = forceDirectionX * force * this.density * -1;
                    const directionY = forceDirectionY * force * this.density * -1;
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to base position smoothly
                    if (this.x !== this.baseX) {
                        const dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        const dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            } else {
                // Return to base position when mouse not in canvas
                if (this.x !== this.baseX) {
                    const dx = this.x - this.baseX;
                    this.x -= dx / 10;
                }
                if (this.y !== this.baseY) {
                    const dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
            }
            
            this.draw();
        }
    }
    
    // Initialize particles
    function initParticles() {
        particles = [];
        // Adjust particle count based on screen size for performance
        const particleCount = Math.min(
            Math.floor((canvas.width * canvas.height) / 8000),
            100
        );
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
        });
        
        // Connect nearby particles with lines
        connectParticles();
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Draw lines between nearby particles
    function connectParticles() {
        const maxDistance = 120;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    ctx.strokeStyle = `rgba(20, 184, 166, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Start animation
    initParticles();
    animate();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });
}
