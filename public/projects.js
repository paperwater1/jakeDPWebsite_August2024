function generateProjectHTML(project) {
    return `
        <div class="project-item">
            <a href="#${project.id}">
                <img src="${project.thumbnail}" 
                     alt="${project.title}" 
                     class="lazy-gif">
                <h3>${project.title}</h3>
            </a>
        </div>
    `;
}

function generateFeaturedPage() {
    const featuredProjects = projectsData.filter(project => project.featured);
    const projectsHTML = featuredProjects.map(generateProjectHTML).join('');
    
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `<section id="featured" class="project-grid">${projectsHTML}</section>`;
    }
}

function showCategory(category) {
    const categoryProjects = projectsData.filter(project => project.category === category);
    const projectsHTML = categoryProjects.map(generateProjectHTML).join('');
    
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `<section id="${category}" class="project-grid">${projectsHTML}</section>`;
    }
}

function showFeaturedPage() {
    generateFeaturedPage();
    window.history.pushState({}, 'Featured Page', '/');
}

// Make sure this function is globally accessible
window.showFeaturedPage = showFeaturedPage;

function formatLabel(key) {
    return key
        .split(/(?=[A-Z])|_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function showProject(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    let projectDetailsHTML = `
        <h2>${project.title}</h2>
        <div class="video-container">
            <a href="${project.videoUrl}" target="_blank">
                <img src="${project.thumbnail}" alt="${project.title}">
                <div class="play-button">
                    <p>PLAY VIDEO</p>
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
            
            projectDetailsHTML += `<p><strong>${label}:</strong> ${formattedValue}</p>`;
        }
    }

    projectDetailsHTML += '</div>'; // Close the project-details div
    projectDetailsHTML += '<button onclick="showFeaturedPage()"><</button>';

    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `<div class="project-page">${projectDetailsHTML}</div>`;
    }
    window.history.pushState({projectId}, project.title, `#${projectId}`);
}

// Make sure this function is defined
function formatLabel(key) {
    return key
        .split(/(?=[A-Z])|_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatLabel(key) {
    return key
        .split(/(?=[A-Z])|_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatLabel(key) {
    return key
        .split(/(?=[A-Z])|_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Make sure this function is defined
function formatLabel(key) {
    return key
        .split(/(?=[A-Z])|_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function handleNavigation() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        if (['narrative', 'music-videos', 'commercial', 'documentary'].includes(hash)) {
            showCategory(hash);
        } else {
            showProject(hash);
        }
    } else if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        showFeaturedPage();
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
                showFeaturedPage();
            } else if (href.startsWith('#')) {
                const category = href.slice(1);
                if (['narrative', 'music-videos', 'commercial', 'documentary'].includes(category)) {
                    showCategory(category);
                    window.history.pushState({}, category, `#${category}`);
                } else {
                    showProject(category);
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