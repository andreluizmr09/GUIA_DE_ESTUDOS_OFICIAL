/* ========== GUIA DE ESTUDOS - JS SIMPLIFICADO ========== */

const API_URL = '/guia_de_estudos/api';

function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleView(view) {
    const login = document.getElementById('loginSection');
    const register = document.getElementById('registerSection');
    if (view === 'log') {
        login.classList.remove('hidden');
        register.classList.add('hidden');
    } else {
        login.classList.add('hidden');
        register.classList.remove('hidden');
    }
}

// ========== CADASTRO ==========
async function handleRegister() {
    const nome = document.getElementById('rName').value.trim();
    const email = document.getElementById('rEmail').value.trim();
    const senha = document.getElementById('rPass').value;
    
    if (!nome || !email || !senha) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/cadastro.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        const data = await res.json();
        
        if (res.ok) {
            showToast('Cadastro realizado! Faça login.');
            toggleView('log');
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

// ========== LOGIN ==========
async function handleLogin() {
    const email = document.getElementById('lEmail').value.trim();
    const senha = document.getElementById('lPass').value;
    
    if (!email || !senha) {
        showToast('Preencha email e senha!', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, senha })
        });
        const data = await res.json();
        
        if (res.ok) {
            showToast(`Bem-vindo, ${data.usuario.nome}!`);
            mostrarDashboard(data.usuario);
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

async function logout() {
    await fetch(`${API_URL}/logout.php`, { method: 'POST', credentials: 'include' });
    location.reload();
}

// ========== DASHBOARD ==========
function mostrarDashboard(usuario) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('registerSection').classList.add('hidden');
    document.getElementById('dashSection').classList.remove('hidden');
    document.getElementById('userSpan').innerHTML = `Olá, ${escapeHtml(usuario.nome)}`;
    
    carregarTudo();
}

async function carregarTudo() {
    const container = document.getElementById('courseList');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';
    
    try {
        // Buscar profissões
        const profRes = await fetch(`${API_URL}/profissoes.php`);
        const profissoes = await profRes.json();
        
        // Buscar progresso do usuário
        const progRes = await fetch(`${API_URL}/progresso.php`, { credentials: 'include' });
        const progresso = progRes.ok ? await progRes.json() : [];
        
        const progressoMap = {};
        progresso.forEach(p => { progressoMap[p.id] = p.status; });
        
        let html = '';
        
        // Para cada profissão, buscar seus cursos
        for (const prof of profissoes) {
            const cursosRes = await fetch(`${API_URL}/cursos.php?profissao_id=${prof.id}`);
            const cursos = await cursosRes.json();
            
            if (cursos.length === 0) continue;
            
            html += `
                <div class="profissao">
                    <div class="profissao-titulo">
                        <span>${escapeHtml(prof.icone)}</span>
                        <h3>${escapeHtml(prof.nome)}</h3>
                    </div>
                    <div class="profissao-desc">${escapeHtml(prof.descricao)}</div>
                    <div class="cursos-grid">
                        ${cursos.map(curso => renderCurso(curso, progressoMap[curso.id])).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html || '<div class="loading">Nenhum curso encontrado.</div>';
    } catch (error) {
        container.innerHTML = '<div class="loading">Erro ao carregar cursos.</div>';
        showToast('Erro ao carregar dados', 'error');
    }
}

function renderCurso(curso, status) {
    let statusIcon = '';
    let statusClass = '';
    
    if (status === 'concluido') {
        statusIcon = '<i class="fas fa-check-circle status-concluido"></i>';
    } else if (status === 'pulado') {
        statusIcon = '<i class="fas fa-skip-forward status-pulado"></i>';
    } else {
        statusIcon = '<i class="far fa-circle status-pendente"></i>';
    }
    
    const badgeClass = `dificuldade-${curso.dificuldade}`;
    
    let botoes = `<button class="btn-acessar" onclick="window.open('${curso.link}', '_blank')">Acessar</button>`;
    
    if (status !== 'concluido') {
        botoes += `<button class="btn-concluir" onclick="marcarConcluido(${curso.id})">Concluir</button>`;
    }
    
    if (status !== 'pulado' && status !== 'concluido') {
        botoes += `<button class="btn-pular" onclick="marcarPulado(${curso.id})">Pular</button>`;
    }
    
    return `
        <div class="curso-card">
            <div class="curso-status ${statusClass}">${statusIcon}</div>
            <div class="curso-titulo">${escapeHtml(curso.titulo)}</div>
            <span class="curso-dificuldade ${badgeClass}">${curso.dificuldade}</span>
            <div class="curso-acoes">${botoes}</div>
        </div>
    `;
}

async function marcarConcluido(cursoId) {
    try {
        const res = await fetch(`${API_URL}/concluir.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ curso_id: cursoId })
        });
        
        if (res.ok) {
            showToast('Curso concluído! 🎉');
            carregarTudo();
        } else {
            const data = await res.json();
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

async function marcarPulado(cursoId) {
    try {
        const res = await fetch(`${API_URL}/pular.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ curso_id: cursoId })
        });
        
        if (res.ok) {
            showToast('Curso pulado!');
            carregarTudo();
        } else {
            const data = await res.json();
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}