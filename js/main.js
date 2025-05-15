document.addEventListener('DOMContentLoaded', () => {
    // Bloquear rolagem inicialmente
    document.body.classList.add('locked');
    
    const terminalText = document.getElementById('terminal-text');
    const terminalInput = document.getElementById('terminal-input');
    const terminalInicio = document.getElementById('terminal-inicio');
    const mainContent = document.querySelectorAll('section:not(#terminal-inicio)');
    const webSwitch = document.getElementById('checkbox');
    const mobileSwitch = document.getElementById('checkbox-mobile');
    let terminalStarted = false;

    // Esconder conteúdo inicialmente
    mainContent.forEach(section => section.style.display = 'none');

    // Configurar prompt inicial
    const promptDiv = document.createElement('div');
    promptDiv.innerHTML = `<span style="color: var(--text-primary);">$ Digite 'start' para ir ao conteúdo...</span>`;
    terminalText.appendChild(promptDiv);

    // Configurar input
    terminalInput.disabled = false;
    terminalInput.value = '';
    terminalInput.focus();

    async function typeCharacter(element, text) {
        for (let char of text) {
            element.textContent += char;
            // Aqui é onde você controla a velocidade da digitação
            // Diminua os números para aumentar a velocidade
            // Math.random() * 80 + 30 -> velocidade atual (entre 30ms e 110ms por caractere)
            // Para mais rápido, tente por exemplo: Math.random() * 40 + 20 (entre 20ms e 60ms)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 110));
        }
    }

    async function typeText(lines) {
        terminalText.innerHTML = '';
        
        for (let line of lines) {
            const lineElement = document.createElement('div');
            lineElement.style.color = 'var(--text-primary)';
            lineElement.style.fontFamily = 'Fira Code, monospace';
            terminalText.appendChild(lineElement);
            
            await typeCharacter(lineElement, line);
            // Aqui controla o tempo entre as linhas
            // Diminua para ter menos pausa entre as linhas
            // 300ms -> tempo atual
            // Para mais rápido, tente 150ms
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Função do efeito Matrix atualizada
    function createMatrixEffect() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const characters = '01'; // Apenas 0 e 1
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Cor baseada no tema
            ctx.fillStyle = document.body.classList.contains('light-theme') ? 
                '#0066ff' : // Azul neon para tema claro
                '#0F0';     // Verde para tema escuro
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }

            requestAnimationFrame(draw);
        }

        draw();
    }

    // Theme Switch Logic
    function handleThemeSwitch(e) {
        if (e.target.checked) {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
        
        // Sincroniza os switches
        webSwitch.checked = e.target.checked;
        mobileSwitch.checked = e.target.checked;
        
        // Só recria o Matrix se o terminal já foi iniciado
        if (terminalStarted) {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.remove();
                createMatrixEffect();
            }
        }
    }

    // Adiciona listeners para os switches
    webSwitch.addEventListener('change', handleThemeSwitch);
    mobileSwitch.addEventListener('change', handleThemeSwitch);

    async function typeWriter(text) {
        for (let char of text) {
            terminalText.innerHTML += char;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        terminalText.innerHTML += '<br>';
    }

    terminalInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            
            if (command === 'start') {
                // Remove o prompt e o input imediatamente
                document.querySelector('.terminal-input-area').style.display = 'none';
                document.querySelector('.prompt').style.display = 'none';
                
                // Iniciar efeito Matrix imediatamente
                createMatrixEffect();
                
                terminalInput.disabled = true;

                const welcomeText = [
                    "const developer = {",
                    "    name: 'Lenan',",
                    "    role: 'Desenvolvedor Web',",
                    "    location: 'Brasil',",
                    "    skills: ['HTML', 'CSS', 'JavaScript'],",
                    "    interests: ['Web Development', 'UI/UX']",
                    "};",
                    "",
                    "// Bem-vindo ao meu portfólio!"
                ];

                terminalText.innerHTML = ''; // Limpa todo o conteúdo anterior
                await typeText(welcomeText);
                await new Promise(resolve => setTimeout(resolve, 1000));
                moveTerminalAndShowContent();
            } else if (command === 'pular') {
                terminalInput.disabled = true;
                document.querySelector('.terminal-input-area').style.display = 'none';
                
                terminalText.innerHTML = '';
                
                // Array com as linhas para digitar
                const linesPular = [
                    "const developer = {",
                    "    name: 'Lenan',",
                    "    role: 'Desenvolvedor Web',",
                    "    location: 'Brasil',",
                    "    skills: ['HTML', 'CSS', 'JavaScript'],",
                    "    interests: ['Web Development', 'UI/UX']",
                    "};",
                    "",
                    "// Bem-vindo ao meu portfólio!"
                ];

                // Digita cada linha com efeito
                for (let line of linesPular) {
                    await typeWriter(line);
                }

                moveTerminalAndShowContent();
            }
            terminalInput.value = '';
        }
    });

    // Manter foco no input
    terminalInput.addEventListener('blur', () => {
        if (!terminalInput.disabled) {
            setTimeout(() => terminalInput.focus(), 100);
        }
    });

    // Seleciona todos os cards de projeto
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h2').textContent;
            const description = card.querySelector('p').textContent;
            const technologies = Array.from(card.querySelectorAll('.tech-tag'))
                                   .map(tag => tag.textContent);
            
            showProjectModal(title, description, technologies);
        });
    });

    // Função para mover terminal e mostrar conteúdo
    function moveTerminalAndShowContent() {
        // Mover terminal para o topo
        terminalInicio.classList.add('terminal-top');
        document.body.classList.remove('locked'); // Libera a rolagem
        
        // Mostrar conteúdo
        mainContent.forEach(section => {
            section.style.display = 'block';
            setTimeout(() => {
                section.style.opacity = '1';
            }, 100);
        });
    }

    // Adicione este código para o scroll suave nos links do menu
    document.querySelectorAll('header a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Se for o logo (href="#"), scroll para o terminal
            if (targetId === '#') {
                const terminalInicio = document.getElementById('terminal-inicio');
                terminalInicio.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Para outros links, mantém o comportamento original
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

function showProjectModal(title, description, technologies) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const techTags = technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-image"></div>
            <div class="tech-tags">${techTags}</div>
            <p>${description}</p>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || 
            e.target.classList.contains('modal-close')) {
            modal.remove();
        }
    });
} 