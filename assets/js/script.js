const output = document.getElementById('output');
const input = document.getElementById('command-input');
const modal = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const bootScreen = document.getElementById('boot-screen');
const terminal = document.getElementById('terminal');
const dashboard = document.getElementById('dashboard');
const categoryNav = document.getElementById('category-nav');
const projectGallery = document.getElementById('project-gallery');

let contentData = null;
let currentCategoryIndex = 0;
let categories = [];

// 부팅 애니메이션 시퀀스
const bootLines = [
    "ROM BIOS (C) 1985 RETRO SYSTEMS INC.",
    "PROCESSOR: GEMINI-V1 AT 1.21 GIGAHERTZ",
    "MEMORY TEST: 640KB OK",
    "",
    "SEARCHING FOR BOOT RECORD...",
    "FOUND BOOT RECORD ON DRIVE C:",
    "LOADING PORTFOLIO CORE SYSTEM...",
    "MOUNTING PROJECTS...",
    "INITIATING TERMINAL INTERFACE...",
    "SUCCESS.",
    ""
];

let isBooting = true;

async function runBootSequence() {
    isBooting = true;
    window.addEventListener('keydown', skipBoot);

    for (let line of bootLines) {
        if (!isBooting) break;
        const div = document.createElement('div');
        bootScreen.appendChild(div);
        await typeEffect(div, line, 5);
        await new Promise(r => setTimeout(r, 30));
        bootScreen.scrollTop = bootScreen.scrollHeight;
    }
    
    completeBoot();
}

function skipBoot(e) {
    if (isBooting) {
        isBooting = false;
        completeBoot();
    }
}

function completeBoot() {
    window.removeEventListener('keydown', skipBoot);
    bootScreen.classList.add('hidden');
    terminal.classList.remove('hidden');
    input.focus();
    if (!contentData) loadContent();
}

async function typeEffect(element, text, speed) {
    for (let i = 0; i < text.length; i++) {
        if (!isBooting) break;
        element.textContent += text.charAt(i);
        await new Promise(r => setTimeout(r, speed));
    }
}

async function loadContent() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error("File not found");
        contentData = await response.json();
        
        const banner = `
██╗   ██╗ █████╗ ███╗   ██╗ ██████╗      ██╗ ██████╗    ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗
╚██╗ ██╔╝██╔══██╗████╗  ██║██╔════╝      ██║██╔════╝    ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝
 ╚████╔╝ ███████║██╔██╗ ██║██║  ███╗     ██║██║         ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ███████╗
  ╚██╔╝  ██╔══██║██║╚██╗██║██║   ██║██   ██║██║         ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ╚════██║
   ██║   ██║  ██║██║ ╚████║╚██████╔╝╚██████╔╝╚██████╗   ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝  ╚═════╝    ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
        `;
        banner.split('\n').forEach(line => {
            if (line.trim() !== "") printLine(line, 'banner');
        });

        printLine("-------------------------------------------------------------------------------------------");
        printLine(contentData.profile.welcome_message || `Welcome, ${contentData.profile.name}!`);
        printLine("Use ARROWS to explore categories or type 'help'.");
        printLine("");

        initDashboard();
        
    } catch (e) {
        printLine("! ERROR: Failed to load content.json.");
    }
}

function initDashboard() {
    // "ALL" 카테고리를 맨 앞에 추가
    categories = ["ALL", ...(contentData.settings.categories || [])];
    
    categoryNav.innerHTML = '';
    categories.forEach((cat, index) => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.textContent = cat;
        item.onclick = () => selectCategory(index);
        categoryNav.appendChild(item);
    });

    selectCategory(0); // 기본으로 ALL 선택
    
    window.addEventListener('keydown', (e) => {
        if (document.activeElement === input) return;
        
        if (e.key === 'ArrowLeft') {
            selectCategory((currentCategoryIndex - 1 + categories.length) % categories.length);
        } else if (e.key === 'ArrowRight') {
            selectCategory((currentCategoryIndex + 1) % categories.length);
        }
    });
}

function selectCategory(index) {
    currentCategoryIndex = index;
    const items = document.querySelectorAll('.category-item');
    
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    renderGallery(categories[index]);
}

function renderGallery(category) {
    projectGallery.innerHTML = '';
    
    let projects = [];
    if (category === "ALL") {
        projects = contentData.projects;
    } else {
        projects = contentData.projects.filter(p => p.category === category);
    }

    // 연도순 정렬
    projects.sort((a, b) => b.year - a.year);

    if (projects.length === 0) {
        projectGallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; opacity: 0.5;">NO PROJECTS FOUND IN THIS CATEGORY.</div>';
        return;
    }

    projects.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${index * 0.05}s`;
        
        let thumb = '<div class="thumb-placeholder">NO IMAGE</div>';
        try {
            if (p.type === 'video') {
                let vidId = "";
                if (p.url.includes('v=')) vidId = p.url.split('v=')[1].split('&')[0];
                else if (p.url.includes('youtu.be/')) vidId = p.url.split('/').pop().split('?')[0];
                else vidId = p.url.split('/').pop().split('?')[0];
                thumb = `<div class="thumb-placeholder"><img src="https://img.youtube.com/vi/${vidId}/mqdefault.jpg"></div>`;
            } else if (p.type === 'image') {
                thumb = `<div class="thumb-placeholder"><img src="${p.url}"></div>`;
            }
        } catch (e) { /* ignore error in thumb parsing */ }

        item.innerHTML = `
            ${thumb}
            <div class="gallery-title">${p.title}</div>
        `;
        item.onclick = () => openProject(p.id);
        projectGallery.appendChild(item);
    });
}

function printLine(text, type = 'default') {
    const line = document.createElement('div');
    line.className = `line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function openProject(id) {
    const project = contentData.projects.find(p => p.id == id);
    if (!project) {
        printLine(`Error: Project with ID ${id} not found.`);
        return;
    }

    modalBody.innerHTML = `<h3>${project.title} (${project.year})</h3><p>${project.description}</p>`;
    
    if (project.type === 'video') {
        let videoUrl = project.url;
        if (videoUrl.includes('youtube.com/watch?v=')) {
            videoUrl = videoUrl.replace('watch?v=', 'embed/').split('&')[0];
        } else if (videoUrl.includes('youtu.be/')) {
            videoUrl = videoUrl.replace('youtu.be/', 'www.youtube.com/embed/');
        }
        modalBody.innerHTML += `<iframe width="100%" height="450" src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`;
    } else if (project.type === 'image') {
        modalBody.innerHTML += `<img src="${project.url}" alt="${project.title}">`;
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

const commands = {
    'help': () => {
        printLine("Available commands:");
        printLine("  help                - Show this help message");
        printLine("  ls [category]       - List projects in terminal");
        printLine("  open [id]           - View project by ID");
        printLine("  whoami              - Profile information");
        printLine("  font                - Toggle font style");
        printLine("  theme [color]       - Change theme (green, amber, cyan, white)");
        printLine("  clear               - Clear terminal");
    },
    'whoami': () => {
        printLine(`NAME: ${contentData.profile.name}`);
        printLine(`TITLE: ${contentData.profile.title}`);
    },
    'ls': (args) => {
        let projs = [...contentData.projects].sort((a, b) => b.year - a.year);
        const filter = args[0] ? args[0].toLowerCase() : null;
        if (filter) projs = projs.filter(p => p.category.toLowerCase() === filter);
        
        printLine(filter ? `Projects for ${filter}:` : "All Projects:");
        projs.forEach(p => printLine(` [${p.id}] [${p.year}] [${p.category}] ${p.title}`));
    },
    'open': (args) => {
        if (!args[0]) {
            printLine("Usage: open [project_id]");
            return;
        }
        openProject(args[0]);
    },
    'font': () => {
        const root = document.querySelector(':root');
        const currentFont = getComputedStyle(root).getPropertyValue('--font-family').trim();
        if (currentFont.includes('Galmuri14')) {
            root.style.setProperty('--font-family', "'zpix', monospace");
            printLine("Switched to font: zpix");
        } else {
            root.style.setProperty('--font-family', "'Galmuri14', monospace");
            printLine("Switched to font: Galmuri14");
        }
    },
    'theme': (args) => {
        const color = args[0] ? args[0].toLowerCase() : 'green';
        document.body.className = 'crt';
        if (color !== 'green') {
            document.body.classList.add(`theme-${color}`);
        }
        printLine(`Theme set to ${color}`);
    },
    'clear': () => {
        output.innerHTML = '';
        dashboard.style.display = 'none';
    }
};

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const fullCmd = input.value.trim().split(' ');
        const cmd = fullCmd[0].toLowerCase();
        const args = fullCmd.slice(1);

        printLine(`C:\\USER\\PORTFOLIO> ${input.value}`);
        
        if (commands[cmd]) {
            commands[cmd](args);
            if (cmd !== 'clear') dashboard.style.display = 'block';
        } else if (cmd !== "") {
            printLine(`'${cmd}' is not recognized.`);
        }
        
        input.value = '';
    }
});

runBootSequence();
