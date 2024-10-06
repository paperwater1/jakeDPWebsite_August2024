let currentCategory = null;

function generateProjectHTML(project) {
    return `
        <div class="project-item">
            <a href="#${project.id}">
                <div class="video-wrapper">
                    <video 
                        src="${project.thumbnail}" 
                        alt="${project.title}" 
                        class="thumbnail-video" 
                        loop 
                        muted 
                        autoplay 
                        playsinline
                        onerror="handleVideoError('${project.thumbnail}')">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <h3>${project.title}</h3>
            </a>
        </div>
    `;
}

function handleVideoError(videoSrc) {
    console.error(`Failed to load video: ${videoSrc}`);
}

function generateFeaturedPage() {
    const featuredProjects = projectsData.filter(project => project.featured);
    const projectsHTML = featuredProjects.map(generateProjectHTML).join('');
    
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `<section id="featured" class="project-grid">${projectsHTML}</section>`;
    }
}

/**
 * Displays the featured projects page.
 * @param {boolean} pushStateFlag - Determines whether to push a new state to the history.
 */
function showFeaturedPage(pushStateFlag = true) {
    console.log(`Showing featured page, Push State: ${pushStateFlag}`);
    generateFeaturedPage();
    
    if (pushStateFlag) {
        window.history.pushState({}, 'Featured Page', '/');
    }
}

/**
 * Displays a specific category of projects.
 * @param {string} category - The category to display.
 * @param {boolean} pushStateFlag - Determines whether to push a new state to the history.
 */
function showCategory(category, pushStateFlag = true) {
    console.log(`Showing category: ${category}, Push State: ${pushStateFlag}`);
    currentCategory = category;
    const categoryProjects = projectsData.filter(project => project.category === category);
    const projectsHTML = categoryProjects.map(generateProjectHTML).join('');
    
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `<section id="${category}" class="project-grid">${projectsHTML}</section>`;
    }
    
    if (pushStateFlag) {
        window.history.pushState({ category }, category, `#${category}`);
    }
}

/**
 * Formats a key into a readable label.
 * @param {string} key - The key to format.
 * @returns {string} - The formatted label.
 */
function formatLabel(key) {
    return key
        .split(/(?=[A-Z])|_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Generates the HTML for the back button.
 * @returns {string} - The HTML string for the back button.
 */
function generateBackButtonHTML() {
    return '<button onclick="window.history.back()">&larr; Back</button>';
}

/**
 * Displays a specific project.
 * @param {string} projectId - The ID of the project to display.
 * @param {boolean} pushStateFlag - Determines whether to push a new state to the history.
 */
function showProject(projectId, pushStateFlag = true) {
    console.log(`Showing project: ${projectId}, Push State: ${pushStateFlag}`);
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    let projectDetailsHTML = `
        <h2>${project.title}</h2>
        <div class="video-container">
            <a href="${project.videoUrl}" target="_blank">
                <video 
                    src="${project.thumbnail}" 
                    alt="${project.title}" 
                    class="thumbnail-video" 
                    loop 
                    muted 
                    autoplay 
                    playsinline>
                    Your browser does not support the video tag.
                </video>
                <div class="play-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="48" height="48">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </a>
        </div>
        <div class="project-details">
    `;

    const essentialFields = ['id', 'title', 'category', 'thumbnail', 'videoUrl', 'featured'];
    
    for (const [key, value] of Object.entries(project)) {
        if (!essentialFields.includes(key) && value) {
            const label = formatLabel(key);
            let formattedValue = typeof value === 'string' ? value.replace(/\n/g, '<br>') : value;
            
            if (key === 'awards') {
                formattedValue = `<span class="multi-line">${formattedValue}</span>`;
            } else {
                formattedValue = `<span>${formattedValue}</span>`;
            }
            
            projectDetailsHTML += `<p>${label}: ${formattedValue}</p>`;
        }
    }

    projectDetailsHTML += '</div>'; // Close the project-details div
    // Updated back button to use browser history
    projectDetailsHTML += generateBackButtonHTML();

    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `<div class="project-page">${projectDetailsHTML}</div>`;
    }

    if (pushStateFlag) {
        window.history.pushState({ projectId, category: currentCategory }, project.title, `#${projectId}`);
    }
}

/**
 * Handles navigation based on the current URL hash and history state.
 * @param {PopStateEvent} event - The popstate event triggered by navigation.
 */
function handleNavigation(event) {
    console.log('Handling navigation:', event);
    const hash = window.location.hash.slice(1);
    if (hash) {
        if (['narrative', 'music-videos', 'commercial', 'documentary'].includes(hash)) {
            showCategory(hash, false); // Do not push state when handling popstate
        } else {
            const state = event.state;
            if (state && state.category) {
                currentCategory = state.category;
            }
            showProject(hash, false); // Do not push state when handling popstate
        }
    } else if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        showFeaturedPage(false); // Do not push state when handling popstate
    }
}

document.addEventListener("DOMContentLoaded", () => {
    handleNavigation();

    document.body.addEventListener("click", function(e) {
        if (e.target.tagName === 'A') {
            const href = e.target.getAttribute('href');
            
            if (href === 'about.html') {
                return; // Allow default behavior for About link
            }
            
            e.preventDefault();
            
            if (href === 'index.html' || href === '/') {
                showFeaturedPage(); // pushState defaults to true
            } else if (href.startsWith('#')) {
                const target = href.slice(1);
                if (['narrative', 'music-videos', 'commercial', 'documentary'].includes(target)) {
                    showCategory(target); // pushState defaults to true
                } else {
                    showProject(target); // pushState defaults to true
                }
            }
        }
    });
});

window.addEventListener('popstate', handleNavigation);

// Make functions globally accessible
window.showProject = showProject;
window.showCategory = showCategory;
window.showFeaturedPage = showFeaturedPage;