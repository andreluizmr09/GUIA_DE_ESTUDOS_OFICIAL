/* ============================================
   GUIA DE ESTUDOS - PAINEL ADMIN
   Arquivo: js/admin.js
   Ctrl+Click neste arquivo para editar
   ============================================ */

const API_URL = '/guia_de_estudos/api';
let adminToken = '';

// ========== UTILITÁRIOS ==========
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== AUTENTICAÇÃO ==========
async function loginAdmin() {
    const login = document.getElementById('adminLogin').value.trim();
    const senha = document.getElementById('adminSenha').value;
    
    if (!login || !senha) {
        showToast('Preencha login e senha!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login_admin.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            adminToken = data.token;
            document.getElementById('loginArea').style.display = 'none';
            document.getElementById('adminPanel').classList.remove('hidden');
            document.getElementById('adminTokenDisplay').innerText = adminToken;
            showToast('Login realizado com sucesso!');
            carregarTudo();
        } else {
            showToast(data.error || 'Login inválido', 'error');
            document.getElementById('loginResult').innerHTML = `<span style="color: #ef4444;">${data.error || 'Erro'}</span>`;
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

function logoutAdmin() {
    adminToken = '';
    document.getElementById('loginArea').style.display = 'block';
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('adminLogin').value = '';
    document.getElementById('adminSenha').value = '';
    document.getElementById('loginResult').innerHTML = '';
    showToast('Logout realizado!');
}

function carregarTudo() {
    carregarCursosAdmin();
    carregarProfissoesAdmin();
    carregarUsuariosAdmin();
    carregarSelectProfissoes();
}

// ========== TABS ==========
function mostrarTab(tab) {
    const tabs = ['cursos', 'profissoes', 'usuarios'];
    tabs.forEach(t => {
        const content = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (content) content.classList.toggle('active', t === tab);
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(tab)) {
            btn.classList.add('active');
        }
    });
    
    if (tab === 'cursos') carregarCursosAdmin();
    if (tab === 'profissoes') carregarProfissoesAdmin();
    if (tab === 'usuarios') carregarUsuariosAdmin();
}

// ========== CURSOS CRUD ==========
async function carregarCursosAdmin() {
    if (!adminToken) return;
    const container = document.getElementById('adminCursosList');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';
    
    try {
        const response = await fetch(`${API_URL}/admin/cursos.php`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error();
        const cursos = await response.json();
        
        if (cursos.length === 0) {
            container.innerHTML = '<div class="loading">Nenhum curso encontrado.</div>';
            return;
        }
        
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Profissão</th>
                    <th>Dificuldade</th>
                    <th>Ordem</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>`;
        
        cursos.forEach(curso => {
            html += `
                <tr>
                    <td>${curso.id}</td>
                    <td><strong>${escapeHtml(curso.titulo)}</strong></td>
                    <td>${escapeHtml(curso.profissao_nome)}</td>
                    <td><span class="badge badge-${curso.dificuldade.toLowerCase()}">${curso.dificuldade}</span></td>
                    <td>${curso.ordem}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="abrirModalCurso(${curso.id})"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn-delete" onclick="deletarCurso(${curso.id})"><i class="fas fa-trash"></i> Deletar</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><br>Erro ao carregar cursos</div>';
        showToast('Erro ao carregar cursos', 'error');
    }
}

function abrirModalCurso(id = null) {
    document.getElementById('modalCursoTitle').innerText = id ? 'Editar Curso' : 'Novo Curso';
    document.getElementById('formCurso').reset();
    document.getElementById('cursoId').value = '';
    
    if (id) {
        carregarCursoParaEditar(id);
    }
    
    document.getElementById('modalCurso').style.display = 'flex';
}

async function carregarCursoParaEditar(id) {
    try {
        const response = await fetch(`${API_URL}/admin/cursos.php`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const cursos = await response.json();
        const curso = cursos.find(c => c.id == id);
        
        if (curso) {
            document.getElementById('cursoId').value = curso.id;
            document.getElementById('cursoTitulo').value = curso.titulo;
            document.getElementById('cursoLink').value = curso.link;
            document.getElementById('cursoOrdem').value = curso.ordem;
            document.getElementById('cursoDificuldade').value = curso.dificuldade;
            document.getElementById('cursoProfissaoId').value = curso.profissao_id;
        }
    } catch (error) {
        showToast('Erro ao carregar curso', 'error');
    }
}

document.getElementById('formCurso')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('cursoId').value;
    const data = {
        profissao_id: parseInt(document.getElementById('cursoProfissaoId').value),
        titulo: document.getElementById('cursoTitulo').value,
        link: document.getElementById('cursoLink').value,
        ordem: parseInt(document.getElementById('cursoOrdem').value),
        dificuldade: document.getElementById('cursoDificuldade').value
    };
    
    if (!data.profissao_id || !data.titulo || !data.link) {
        showToast('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const url = id ? `${API_URL}/admin/curso_editar.php?id=${id}` : `${API_URL}/admin/curso_criar.php`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast(id ? 'Curso atualizado!' : 'Curso criado!');
            fecharModal('modalCurso');
            carregarCursosAdmin();
        } else {
            showToast(result.error || 'Erro ao salvar', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
});

async function deletarCurso(id) {
    if (!confirm(`Deletar curso #${id}? Esta ação não pode ser desfeita.`)) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/curso_deletar.php?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Curso deletado!');
            carregarCursosAdmin();
        } else {
            showToast(data.error || 'Erro ao deletar', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

// ========== PROFISSÕES CRUD ==========
async function carregarProfissoesAdmin() {
    if (!adminToken) return;
    const container = document.getElementById('adminProfissoesList');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';
    
    try {
        const response = await fetch(`${API_URL}/admin/profissoes.php`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error();
        const profissoes = await response.json();
        
        if (profissoes.length === 0) {
            container.innerHTML = '<div class="loading">Nenhuma profissão encontrada.</div>';
            return;
        }
        
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Ícone</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>`;
        
        profissoes.forEach(prof => {
            html += `
                <tr>
                    <td>${prof.id}</td>
                    <td style="font-size: 1.8rem;">${escapeHtml(prof.icone)}</td>
                    <td><strong>${escapeHtml(prof.nome)}</strong></td>
                    <td>${escapeHtml(prof.descricao?.substring(0, 80))}${prof.descricao?.length > 80 ? '...' : ''}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="abrirModalProfissao(${prof.id})"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn-delete" onclick="deletarProfissao(${prof.id})"><i class="fas fa-trash"></i> Deletar</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><br>Erro ao carregar profissões</div>';
        showToast('Erro ao carregar profissões', 'error');
    }
}

async function carregarSelectProfissoes() {
    if (!adminToken) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/profissoes.php`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const profissoes = await response.json();
        const select = document.getElementById('cursoProfissaoId');
        
        select.innerHTML = '<option value="">Selecione uma profissão...</option>';
        profissoes.forEach(prof => {
            select.innerHTML += `<option value="${prof.id}">${escapeHtml(prof.nome)}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar select de profissões');
    }
}

function abrirModalProfissao(id = null) {
    document.getElementById('modalProfissaoTitle').innerText = id ? 'Editar Profissão' : 'Nova Profissão';
    document.getElementById('formProfissao').reset();
    document.getElementById('profissaoId').value = '';
    document.getElementById('profissaoIcone').value = '💻';
    
    if (id) {
        carregarProfissaoParaEditar(id);
    }
    
    document.getElementById('modalProfissao').style.display = 'flex';
}

async function carregarProfissaoParaEditar(id) {
    try {
        const response = await fetch(`${API_URL}/admin/profissoes.php`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const profissoes = await response.json();
        const prof = profissoes.find(p => p.id == id);
        
        if (prof) {
            document.getElementById('profissaoId').value = prof.id;
            document.getElementById('profissaoNome').value = prof.nome;
            document.getElementById('profissaoDescricao').value = prof.descricao || '';
            document.getElementById('profissaoIcone').value = prof.icone || '💻';
        }
    } catch (error) {
        showToast('Erro ao carregar profissão', 'error');
    }
}

document.getElementById('formProfissao')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('profissaoId').value;
    const data = {
        nome: document.getElementById('profissaoNome').value,
        descricao: document.getElementById('profissaoDescricao').value,
        icone: document.getElementById('profissaoIcone').value || '💻'
    };
    
    if (!data.nome) {
        showToast('O nome da profissão é obrigatório!', 'error');
        return;
    }
    
    const url = id ? `${API_URL}/admin/profissao_editar.php?id=${id}` : `${API_URL}/admin/profissao_criar.php`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast(id ? 'Profissão atualizada!' : 'Profissão criada!');
            fecharModal('modalProfissao');
            carregarProfissoesAdmin();
            carregarSelectProfissoes();
        } else {
            showToast(result.error || 'Erro ao salvar', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
});

async function deletarProfissao(id) {
    if (!confirm(`Deletar profissão #${id}? Isso também deletará TODOS os cursos associados!`)) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/profissao_deletar.php?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Profissão deletada!');
            carregarProfissoesAdmin();
            carregarSelectProfissoes();
            carregarCursosAdmin();
        } else {
            showToast(data.error || 'Erro ao deletar', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

// ========== USUÁRIOS ==========
async function carregarUsuariosAdmin() {
    if (!adminToken) return;
    const container = document.getElementById('adminUsuariosList');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';
    
    try {
        const response = await fetch(`${API_URL}/admin/usuarios.php`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error();
        const usuarios = await response.json();
        
        if (usuarios.length === 0) {
            container.innerHTML = '<div class="loading">Nenhum usuário encontrado.</div>';
            return;
        }
        
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>`;
        
        usuarios.forEach(user => {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td><strong>${escapeHtml(user.nome)}</strong></td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${new Date(user.criado_em).toLocaleDateString('pt-BR')}</td>
                    <td class="action-buttons">
                        <button class="btn-delete" onclick="deletarUsuario(${user.id})"><i class="fas fa-trash"></i> Deletar</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><br>Erro ao carregar usuários</div>';
        showToast('Erro ao carregar usuários', 'error');
    }
}

async function deletarUsuario(id) {
    if (!confirm(`Deletar usuário #${id}? Todo o progresso do usuário será perdido.`)) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/usuario_deletar.php?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Usuário deletado!');
            carregarUsuariosAdmin();
        } else {
            showToast(data.error || 'Erro ao deletar', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
    }
}

// ========== MODAL ==========
function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ========== TOAST STYLES (injetar dinamicamente) ==========
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
    }
    .toast-success { background: #10b981; }
    .toast-error { background: #ef4444; }
    .toast-info { background: #3b82f6; }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .badge-iniciante { background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; }
    .badge-intermediário { background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; }
    .badge-avancado { background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; }
`;
document.head.appendChild(toastStyles);