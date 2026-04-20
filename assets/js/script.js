const output = document.getElementById('output');
const input = document.getElementById('command-input');
const modal = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
let contentData = null;

// JSON 데이터 로드
async function loadContent() {
    try {
        const response = await fetch('content.json');
        contentData = await response.json();
        printLine(contentData.profile.welcome_message);
    } catch (e) {
        printLine("Error: Could not load content.json");
    }
}

function printLine(text, type = 'default') {
    const line = document.createElement('div');
    line.className = `line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    window.scrollTo(0, document.body.scrollHeight);
}

function openProject(id) {
    const project = contentData.projects.find(p => p.id == id);
    if (!project) {
        printLine(`Error: Project with ID ${id} not found.`);
        return;
    }

    modalBody.innerHTML = `<h3>${project.title}</h3><p>${project.description}</p>`;
    
    if (project.type === 'video') {
        modalBody.innerHTML += `<iframe width="100%" height="450" src="${project.url}" frameborder="0" allowfullscreen></iframe>`;
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
        printLine("  help        - Show this help message");
        printLine("  ls          - List all projects");
        printLine("  open [id]   - Open a project by ID (e.g., open 1)");
        printLine("  whoami      - Show profile information");
        printLine("  font        - Toggle between Galmuri14 and zpix");
        printLine("  clear       - Clear the terminal");
    },
    'whoami': () => {
        printLine(`Name: ${contentData.profile.name}`);
        printLine(`Title: ${contentData.profile.title}`);
    },
    'ls': () => {
        printLine("Projects (sorted by year):");
        const sorted = [...contentData.projects].sort((a, b) => b.year - a.year);
        sorted.forEach(p => {
            printLine(` [${p.id}] [${p.year}] [${p.category}] ${p.title}`);
        });
        printLine("Tip: Type 'open [id]' to view a project.");
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

loadContent();
