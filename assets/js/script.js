const output = document.getElementById('output');
const input = document.getElementById('command-input');
const modal = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const bootScreen = document.getElementById('boot-screen');
const terminal = document.getElementById('terminal');

let contentData = null;

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
        if (!isBooting) break; // 스킵 시 중단
        const div = document.createElement('div');
        bootScreen.appendChild(div);
        await typeEffect(div, line, 5); // 속도 20 -> 5로 대폭 상향
        await new Promise(r => setTimeout(r, 30)); // 지연시간 단축
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
    if (!contentData) loadContent(); // 아직 로드 안 됐다면 로드
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
        
        // 블록 스타일 아스키 아트 배너 (복구)
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
        printLine("Type 'help' to see available commands.");
        printLine("");
    } catch (e) {
        printLine("! ERROR: Failed to load content.json.");
        printLine("! If you are opening this file directly in a browser, use a local server (like Live Server).");
    }
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
        // 일반 유튜브 링크를 임베드 링크로 변환
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
        printLine("  ls [category]       - List projects (optionally filtered)");
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
        let projects = [...contentData.projects].sort((a, b) => b.year - a.year);
        const filter = args[0] ? args[0].toLowerCase() : null;

        if (filter) {
            projects = projects.filter(p => p.category.toLowerCase() === filter);
            printLine(`Listing projects for category: ${filter}`);
        } else {
            printLine("Listing all projects (Sorted by year):");
        }

        if (projects.length === 0) {
            printLine("  No projects found.");
        } else {
            projects.forEach(p => {
                printLine(` [${p.id}] [${p.year}] [${p.category}] ${p.title}`);
            });
        }
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
        } else if (cmd !== "") {
            printLine(`'${cmd}' is not recognized as an internal or external command.`);
        }
        
        input.value = '';
    }
});

runBootSequence();
