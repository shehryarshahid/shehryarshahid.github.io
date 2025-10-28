// GitHub API Configuration
const GITHUB_USERNAME = 'shehryarshahid';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Language colors mapping (similar to GitHub's colors)
const languageColors = {
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'Java': '#b07219',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'TypeScript': '#2b7489',
    'Go': '#00ADD8',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'C++': '#f34b7d',
    'C': '#555555',
    'Shell': '#89e051',
    'Jupyter Notebook': '#DA5B0B',
    'default': '#8b949e'
};

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

// Fetch and display GitHub projects
async function fetchGitHubProjects() {
    const projectsContainer = document.getElementById('projects-container');
    
    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const repos = await response.json();
        
        // Filter out the portfolio website itself and sort by updated date
        const filteredRepos = repos
            .filter(repo => !repo.name.includes('.github.io'))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        if (filteredRepos.length === 0) {
            projectsContainer.innerHTML = `
                <div class="loading">
                    <p>No projects found yet. Check back soon!</p>
                </div>
            `;
            return;
        }
        
        // Clear loading message
        projectsContainer.innerHTML = '';
        
        // Create project cards
        filteredRepos.forEach(repo => {
            const card = createProjectCard(repo);
            projectsContainer.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        projectsContainer.innerHTML = `
            <div class="loading">
                <p>Unable to load projects at this time. Please visit my <a href="https://github.com/${GITHUB_USERNAME}" target="_blank">GitHub profile</a> directly.</p>
            </div>
        `;
    }
}

// Create a project card element
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const languageColor = languageColors[repo.language] || languageColors['default'];
    const description = repo.description || 'No description available';
    
    card.innerHTML = `
        <div class="project-header">
            <i class="fas fa-folder project-icon"></i>
            <h3 class="project-title">${repo.name}</h3>
        </div>
        <p class="project-description">${description}</p>
        <div class="project-meta">
            ${repo.language ? `
                <span class="project-language">
                    <span class="language-dot" style="background-color: ${languageColor}"></span>
                    ${repo.language}
                </span>
            ` : ''}
            ${repo.stargazers_count > 0 ? `
                <span>
                    <i class="fas fa-star"></i> ${repo.stargazers_count}
                </span>
            ` : ''}
            ${repo.forks_count > 0 ? `
                <span>
                    <i class="fas fa-code-branch"></i> ${repo.forks_count}
                </span>
            ` : ''}
        </div>
        <div class="project-links">
            <a href="${repo.html_url}" target="_blank" class="project-link">
                <i class="fab fa-github"></i> View Code
            </a>
            ${repo.homepage ? `
                <a href="${repo.homepage}" target="_blank" class="project-link">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubProjects();
    
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
        navbar.style.backgroundColor = 'rgba(30, 41, 59, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'var(--light-bg)';
        navbar.style.backdropFilter = 'none';
    }
});
