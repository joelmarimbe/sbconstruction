const projects = [
    {
        title: "Modern Office Complex",
        description: "A state-of-the-art office building with sustainable features",
        image: "images/com.jpg",
        duration: "18 months",
        value: "113k",
        area: "15,000 sqm"
    },
    {
        title: "Residential Tower",
        description: "Luxury apartments with panoramic city views",
        image: "images/ihome.jpg",
        duration: "24 months",
        value: "$120k",
        area: "20,000 sqm"
    },
    {
        title: "Shopping Mall",
        description: "Mixed-use retail and entertainment complex",
        image: "images/reno.png",
        duration: "30 months",
        value: "$676k",
        area: "35,000 sqm"
    },
    // Add more projects as needed
];

function createProjectCard(project) {
    return `
        <div class="project-card">
            <img src="${project.image}" alt="${project.title}" class="project-image">
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-stats">
                    <div class="stat">
                        <strong>${project.duration}</strong>
                        <span>Duration</span>
                    </div>
                    <div class="stat">
                        <strong>${project.value}</strong>
                        <span>Value</span>
                    </div>
                    <div class="stat">
                        <strong>${project.area}</strong>
                        <span>Area</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initializeProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    projects.forEach(project => {
        projectsGrid.innerHTML += createProjectCard(project);
    });
}

document.addEventListener('DOMContentLoaded', initializeProjects);