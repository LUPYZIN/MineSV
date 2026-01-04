// Sistema MineHost - Premium Dark Theme
document.addEventListener('DOMContentLoaded', function() {
console.log('🚀 MineHost iniciando...');

// Variáveis globais
let currentUser = null;
let servers = [];
let filteredServers = [];
let currentFilter = 'all';
let searchTerm = '';
let selectedForm = 1;
let selectedServer = null;

// Inicialização
async function init() {
try {
// Iniciar loading
startLoading();

// Inicializar particles
initParticles();

// Configurar eventos
setupEventListeners();

// Inicializar Firebase
await initFirebase();

// Verificar autenticação
await checkAuth();

// Carregar servidores
await loadServers();

} catch (error) {
console.error('Erro na inicialização:', error);
showNotification('Erro ao carregar dados. Tente novamente.');
} finally {
// Garantir que o loading pare após 2.5 segundos no máximo
setTimeout(finishLoading, 2500);
}
}

// ===== LOADING =====
function startLoading() {
console.log('⏳ Iniciando loading...');
document.body.classList.add('loading');

// Iniciar animação da barra de progresso
let progress = 0;
const progressBar = document.getElementById('loadingProgress');
const loadingInterval = setInterval(() => {
if (progress < 100) { progress +=2; if (progressBar) { progressBar.style.width=progress + '%' ; } } else {
    clearInterval(loadingInterval); } }, 30); } function finishLoading() { console.log('✅ Finalizando loading...'); //
    Remover classe de loading do body document.body.classList.remove('loading'); // Esconder a tela de loading const
    loadingScreen=document.getElementById('loadingScreen'); if (loadingScreen) { loadingScreen.classList.add('hidden');
    setTimeout(()=> {
    loadingScreen.style.display = 'none';
    }, 500);
    }

    console.log('🎉 Página totalmente carregada!');
    }

    // ===== PARTICLES =====
    function initParticles() {
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
    try {
    particlesJS('particles-js', {
    particles: {
    number: { value: 80 },
    color: { value: ["#00ff88", "#7b61ff"] },
    shape: { type: "circle" },
    opacity: {
    value: 0.6,
    anim: { enable: true, speed: 1 }
    },
    size: {
    value: 3,
    anim: { enable: true, speed: 2 }
    },
    line_linked: {
    enable: true,
    distance: 150,
    color: "#00ff88",
    opacity: 0.2,
    width: 1
    },
    move: {
    enable: true,
    speed: 1.5,
    direction: "none"
    }
    },
    interactivity: {
    events: {
    onhover: { enable: true, mode: "grab" },
    onclick: { enable: true, mode: "push" }
    }
    }
    });
    console.log('✅ Particles inicializados');
    } catch (error) {
    console.log('⚠️ Particles não inicializados, continuando...');
    }
    }
    }

    // ===== FIREBASE =====
    async function initFirebase() {
    try {
    // Importar Firebase dinamicamente
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
    } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    const {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    setDoc
    } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    const firebaseConfig = {
    apiKey: "AIzaSyAwgA3wphz-vgQgiN1S9evAxZ5R9r6qhac",
    authDomain: "minesv-5760d.firebaseapp.com",
    databaseURL: "https://minesv-5760d-default-rtdb.firebaseio.com",
    projectId: "minesv-5760d",
    storageBucket: "minesv-5760d.firebasestorage.app",
    messagingSenderId: "1028898660834",
    appId: "1:1028898660834:web:19399da70912b70737d9bb",
    measurementId: "G-VVXNMFCVLK"
    };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();

    window.firebase = {
    app,
    auth,
    db,
    provider,
    signInWithPopup,
    onAuthStateChanged,
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    setDoc
    };

    console.log('✅ Firebase inicializado');

    } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    window.firebase = null;
    }
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
    this.innerHTML = navMenu.classList.contains('active')
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(event) {
    if (!event.target.closest('.navbar') && navMenu.classList.contains('active')) {
    navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
    });
    }

    // Navegação
    document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
    if (this.getAttribute('href').startsWith('#')) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
    // Atualizar link ativo
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');

    // Scroll suave
    window.scrollTo({
    top: targetElement.offsetTop - 80,
    behavior: 'smooth'
    });

    // Fechar menu mobile se aberto
    if (navMenu && navMenu.classList.contains('active')) {
    navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
    }
    }
    });
    });

    // Botão de login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
    loginBtn.addEventListener('click', signInWithGoogle);
    }

    // Botão de criar servidor
    const createBtn = document.getElementById('createBtn');
    if (createBtn) {
    createBtn.addEventListener('click', function(e) {
    if (!currentUser) {
    e.preventDefault();
    showNotification('Faça login para criar um servidor!');
    signInWithGoogle();
    }
    });
    }

    // Campo de busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
    searchInput.addEventListener('input', function(e) {
    searchTerm = e.target.value.toLowerCase().trim();
    filterAndDisplayServers();
    });
    }

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
    // Remover active de todos
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    // Adicionar ao clicado
    this.classList.add('active');
    // Atualizar filtro
    currentFilter = this.dataset.filter;
    filterAndDisplayServers();
    });
    });

    // Botão reset filtros
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
    }

    // Scroll do header
    window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (header) {
    if (window.scrollY > 100) {
    header.classList.add('scrolled');
    } else {
    header.classList.remove('scrolled');
    }
    }
    });

    // Fechar modais
    document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
    const modal = this.closest('.modal');
    if (modal) modal.classList.remove('active');
    });
    });

    // Fechar modal ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
    if (e.target === this) {
    this.classList.remove('active');
    }
    });
    });

    // Seleção de formulário
    document.querySelectorAll('.form-option').forEach(option => {
    option.addEventListener('click', function() {
    const formNumber = parseInt(this.getAttribute('data-form')) || 1;
    selectForm(formNumber);
    });
    });
    }

    // ===== AUTHENTICATION =====
    async function checkAuth() {
    if (!window.firebase) return;

    try {
    window.firebase.onAuthStateChanged(window.firebase.auth, async (user) => {
    if (user) {
    currentUser = user;
    await saveUserToFirestore(user);
    updateUIForUser(user);
    } else {
    currentUser = null;
    updateUIForGuest();
    }
    });
    } catch (error) {
    console.error('Erro na autenticação:', error);
    updateUIForGuest();
    }
    }

    async function saveUserToFirestore(user) {
    if (!window.firebase) return;

    try {
    const userRef = window.firebase.doc(window.firebase.db, 'users', user.uid);
    await window.firebase.setDoc(userRef, {
    uid: user.uid,
    displayName: user.displayName || 'Usuário',
    email: user.email || '',
    photoURL: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
    }, { merge: true });
    } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    }
    }

    async function signInWithGoogle() {
    if (!window.firebase) {
    showNotification('Modo demonstração ativado');
    currentUser = {
    displayName: 'Usuário Demo',
    photoURL: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    };
    updateUIForUser(currentUser);
    return;
    }

    try {
    const result = await window.firebase.signInWithPopup(
    window.firebase.auth,
    window.firebase.provider
    );
    showNotification(`Bem-vindo, ${result.user.displayName}!`);
    } catch (error) {
    console.error('Erro no login:', error);
    showNotification('Erro ao fazer login com Google');
    }
    }

    function updateUIForUser(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');

    if (loginBtn) loginBtn.classList.add('hidden');
    if (userProfile) {
    userProfile.classList.remove('hidden');
    const username = document.getElementById('username');
    const avatar = userProfile.querySelector('.avatar');

    if (username) username.textContent = user.displayName || 'Usuário';
    if (avatar) avatar.src = user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    }
    }

    function updateUIForGuest() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');

    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
    }

    // ===== DATA LOADING =====
    async function loadServers() {
    try {
    if (window.firebase) {
    await loadServersFromFirebase();
    } else {
    await loadDemoServers();
    }

    // Atualizar estatísticas
    updateStats();

    // Inicializar servidores filtrados
    filteredServers = [...servers];

    // Exibir servidores
    displayServers();

    // Atualizar servidores em destaque
    updateFeaturedServers();

    // Atualizar estatísticas no loading
    updateLoadingStats();

    } catch (error) {
    console.error('Erro ao carregar servidores:', error);
    await loadDemoServers();
    updateStats();
    filteredServers = [...servers];
    displayServers();
    updateFeaturedServers();
    updateLoadingStats();
    }
    }

    async function loadServersFromFirebase() {
    try {
    const serversQuery = window.firebase.query(
    window.firebase.collection(window.firebase.db, 'servers'),
    window.firebase.orderBy('createdAt', 'desc')
    );

    const serversSnapshot = await window.firebase.getDocs(serversQuery);
    servers = [];

    serversSnapshot.forEach(doc => {
    const data = doc.data();
    servers.push({
    id: doc.id,
    name: data.name || 'Servidor Sem Nome',
    description: data.description || 'Sem descrição',
    category: data.category || 'survival',
    ip: data.ip || 'demo.minehost.com',
    port: data.port || '25565',
    players: parseInt(data.players) || 0,
    maxPlayers: parseInt(data.maxPlayers) || 100,
    online: data.online !== false,
    version: data.version || '1.20.1',
    ownerId: data.ownerId || '',
    ownerName: data.ownerName || 'Admin',
    ownerAvatar: data.ownerAvatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    banner: data.banner || `https://picsum.photos/600/300?random=${doc.id}`,
    votes: parseInt(data.votes) || 0,
    views: parseInt(data.views) || 0,
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
    });
    });

    console.log(`✅ ${servers.length} servidores carregados`);

    } catch (error) {
    console.error('❌ Erro ao carregar do Firebase:', error);
    throw error;
    }
    }

    async function loadDemoServers() {
    // Dados de exemplo
    servers = [
    {
    id: '1',
    name: 'SkyBlock Extreme',
    description: 'Servidor SkyBlock com economia avançada.',
    category: 'survival',
    ip: 'skyblock.minehost.com',
    port: '25565',
    players: 142,
    maxPlayers: 300,
    online: true,
    version: '1.20.1',
    ownerName: 'SkyMaster',
    ownerAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    votes: 1245,
    views: 8923
    }
    ];

    console.log(`🎮 ${servers.length} servidores de demonstração`);
    }

    function updateLoadingStats() {
    // Atualizar estatísticas na tela de loading
    const statServers = document.getElementById('statServers');
    const statPlayers = document.getElementById('statPlayers');
    const statOnline = document.getElementById('statOnline');

    const totalServers = servers.length;
    const onlineServers = servers.filter(s => s.online).length;
    const totalPlayers = servers.reduce((sum, server) => sum + (server.players || 0), 0);

    if (statServers) statServers.textContent = totalServers;
    if (statPlayers) statPlayers.textContent = totalPlayers;
    if (statOnline) statOnline.textContent = onlineServers;
    }

    // ===== SERVER DISPLAY =====
    function displayServers() {
    const serversGrid = document.getElementById('serversGrid');
    const noResults = document.getElementById('noResults');

    if (!serversGrid) return;

    if (filteredServers.length === 0) {
    serversGrid.innerHTML = '';
    if (noResults) noResults.classList.remove('hidden');
    return;
    }

    if (noResults) noResults.classList.add('hidden');

    serversGrid.innerHTML = filteredServers.map((server) => {
    const categoryIcon = getCategoryIcon(server.category);
    const categoryName = getCategoryName(server.category);

    return `
    <div class="server-card" data-id="${server.id}" onclick="window.openServerModal('${server.id}')">
        <div class="server-banner">
            <img src="${server.banner}" alt="${server.name}"
                onerror="this.src='https://picsum.photos/600/300?random=${server.id}'">
            <div class="server-status">
                <div class="status-dot ${server.online ? '' : 'offline'}"></div>
                <div class="status-text">${server.online ? 'ONLINE' : 'OFFLINE'}</div>
            </div>
        </div>

        <div class="server-content">
            <div class="server-header">
                <div class="server-icon">
                    <i class="fas fa-${categoryIcon}"></i>
                </div>
                <div class="server-info">
                    <div class="server-title">
                        ${server.name}
                        <span class="server-category">${categoryName}</span>
                    </div>
                    <p class="server-description">${server.description}</p>
                </div>
            </div>

            <div class="server-stats">
                <div class="server-stat">
                    <div class="value">${server.players}/${server.maxPlayers}</div>
                    <div class="label">Jogadores</div>
                </div>
                <div class="server-stat">
                    <div class="value">${server.version}</div>
                    <div class="label">Versão</div>
                </div>
                <div class="server-stat">
                    <div class="value">${server.votes}</div>
                    <div class="label">Votos</div>
                </div>
            </div>

            <div class="server-ip" onclick="event.stopPropagation(); window.copyIP('${server.ip}:${server.port}')">
                <span class="ip-text">${server.ip}:${server.port}</span>
                <button class="copy-btn">
                    <i class="fas fa-copy"></i>
                </button>
            </div>

            <div class="server-actions">
                <button class="btn-join" onclick="event.stopPropagation(); window.openFormModal('${server.id}')">
                    <i class="fas fa-gamepad"></i>
                    ENTRAR
                </button>
                <button class="btn-favorite"
                    onclick="event.stopPropagation(); window.toggleFavorite('${server.id}', this)">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    </div>
    `;
    }).join('');
    }

    function filterAndDisplayServers() {
    filteredServers = servers.filter(server => {
    // Filtrar por categoria
    if (currentFilter !== 'all' && server.category !== currentFilter) {
    return false;
    }

    // Filtrar por busca
    if (searchTerm) {
    const searchable = `${server.name} ${server.description} ${server.category}
    ${getCategoryName(server.category)}`.toLowerCase();
    if (!searchable.includes(searchTerm)) {
    return false;
    }
    }

    return true;
    });

    displayServers();
    }

    function resetFilters() {
    searchTerm = '';
    currentFilter = 'all';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === 'all') {
    btn.classList.add('active');
    }
    });

    filterAndDisplayServers();
    showNotification('Filtros resetados');
    }

    function updateStats() {
    const totalServers = servers.length;
    const onlineServers = servers.filter(s => s.online).length;
    const totalPlayers = servers.reduce((sum, server) => sum + (server.players || 0), 0);

    const totalServersEl = document.getElementById('totalServers');
    const onlineServersEl = document.getElementById('onlineServers');
    const totalPlayersEl = document.getElementById('totalPlayers');

    if (totalServersEl) totalServersEl.textContent = totalServers;
    if (onlineServersEl) onlineServersEl.textContent = onlineServers;
    if (totalPlayersEl) totalPlayersEl.textContent = totalPlayers.toLocaleString();
    }

    function updateFeaturedServers() {
    const featuredGrid = document.getElementById('featuredGrid');
    if (!featuredGrid) return;

    const featuredServers = servers
    .filter(server => server.online)
    .sort((a, b) => b.players - a.players)
    .slice(0, 4);

    if (featuredServers.length === 0) {
    featuredGrid.innerHTML = `
    <div class="no-results">
        <i class="fas fa-star"></i>
        <h3>Sem servidores em destaque</h3>
        <p>Nenhum servidor está online no momento</p>
    </div>
    `;
    return;
    }

    featuredGrid.innerHTML = featuredServers.map(server => {
    const categoryName = getCategoryName(server.category);

    return `
    <div class="server-card" data-id="${server.id}" onclick="window.openServerModal('${server.id}')">
        <div class="server-banner">
            <img src="${server.banner}" alt="${server.name}"
                onerror="this.src='https://picsum.photos/600/300?random=${server.id}'">
            <div class="server-status">
                <div class="status-dot"></div>
                <div class="status-text">DESTAQUE</div>
            </div>
        </div>

        <div class="server-content">
            <div class="server-header">
                <div class="server-icon" style="background: linear-gradient(135deg, #ffb74d, #ff6b6b);">
                    <i class="fas fa-crown"></i>
                </div>
                <div class="server-info">
                    <div class="server-title">
                        ${server.name}
                        <span class="server-category">${categoryName}</span>
                    </div>
                    <p class="server-description">${server.description}</p>
                </div>
            </div>

            <div class="server-stats">
                <div class="server-stat">
                    <div class="value">${server.players}/${server.maxPlayers}</div>
                    <div class="label">Jogadores</div>
                </div>
                <div class="server-stat">
                    <div class="value">${server.version}</div>
                    <div class="label">Versão</div>
                </div>
                <div class="server-stat">
                    <div class="value">${server.votes}</div>
                    <div class="label">Votos</div>
                </div>
            </div>

            <div class="server-actions">
                <button class="btn-join" onclick="event.stopPropagation(); window.openFormModal('${server.id}')">
                    <i class="fas fa-gamepad"></i>
                    ENTRAR AGORA
                </button>
            </div>
        </div>
    </div>
    `;
    }).join('');
    }

    // ===== MODAL FUNCTIONS =====
    window.openFormModal = function(serverId) {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    selectedServer = server;

    const selectedServerName = document.getElementById('selectedServerName');
    const serverIp = document.getElementById('serverIp');
    const serverPort = document.getElementById('serverPort');

    if (selectedServerName) selectedServerName.textContent = server.name;
    if (serverIp) serverIp.value = server.ip;
    if (serverPort) serverPort.value = server.port;

    const code = generateConnectionCode(server);
    const connectionCode = document.getElementById('connectionCode');
    if (connectionCode) connectionCode.value = code;

    const modal = document.getElementById('formModal');
    if (modal) modal.classList.add('active');

    selectForm(1);
    };

    window.closeFormModal = function() {
    const modal = document.getElementById('formModal');
    if (modal) modal.classList.remove('active');
    };

    window.selectForm = function(formNumber) {
    selectedForm = formNumber;

    document.querySelectorAll('.form-option').forEach((option, index) => {
    if (index === formNumber - 1) {
    option.classList.add('active');
    } else {
    option.classList.remove('active');
    }
    });

    const codeField = document.getElementById('codeField');
    const codeInput = document.getElementById('connectionCode');

    if (codeField && codeInput) {
    codeField.style.display = 'block';
    codeInput.placeholder = selectedForm === 2
    ? 'Código de segurança gerado'
    : 'Código personalizado';
    }
    };

    window.openServerModal = function(serverId) {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    selectedServer = server;

    const modal = document.getElementById('serverModal');
    if (!modal) return;

    const categoryName = getCategoryName(server.category);

    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('#modalServerName');

    if (modalBody && modalTitle) {
    modalBody.innerHTML = `
    <div class="server-details">
        <div class="detail-banner">
            <img src="${server.banner}" alt="${server.name}"
                onerror="this.src='https://picsum.photos/800/400?random=${server.id}'">
        </div>

        <div class="detail-info">
            <div class="detail-row">
                <div class="detail-label">
                    <i class="fas fa-server"></i>
                    Nome do Servidor
                </div>
                <div class="detail-value">${server.name}</div>
            </div>

            <div class="detail-row">
                <div class="detail-label">
                    <i class="fas fa-tag"></i>
                    Categoria
                </div>
                <div class="detail-value">${categoryName}</div>
            </div>

            <div class="detail-row">
                <div class="detail-label">
                    <i class="fas fa-network-wired"></i>
                    Endereço IP
                </div>
                <div class="detail-value">${server.ip}:${server.port}</div>
            </div>

            <div class="detail-row">
                <div class="detail-label">
                    <i class="fas fa-users"></i>
                    Jogadores Online
                </div>
                <div class="detail-value">${server.players}/${server.maxPlayers}</div>
            </div>

            <div class="detail-row">
                <div class="detail-label">
                    <i class="fas fa-code-branch"></i>
                    Versão
                </div>
                <div class="detail-value">${server.version}</div>
            </div>

            <div class="detail-row">
                <div class="detail-label">
                    <i class="fas fa-user"></i>
                    Proprietário
                </div>
                <div class="detail-owner">
                    <img src="${server.ownerAvatar}" alt="${server.ownerName}" class="owner-avatar">
                    <span class="owner-name">${server.ownerName}</span>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">
                    <i class="fas fa-signal"></i>
                    Status
                </div>
                <div class="detail-value">
                    <span style="color: ${server.online ? '#00ff88' : '#ff6b6b'}">
                        ${server.online ? '🟢 ONLINE' : '🔴 OFFLINE'}
                    </span>
                </div>
            </div>
        </div>

        <div class="detail-description">
            <h4><i class="fas fa-align-left"></i> Descrição</h4>
            <p>${server.description}</p>
        </div>

        <div class="form-actions">
            <button class="btn-copy" onclick="window.copyIP('${server.ip}:${server.port}')">
                <i class="fas fa-copy"></i>
                Copiar IP
            </button>
            <button class="btn-connect" onclick="window.openFormModal('${server.id}')">
                <i class="fas fa-gamepad"></i>
                Conectar
            </button>
        </div>
    </div>
    `;

    modalTitle.innerHTML = `
    <i class="fas fa-server"></i>
    ${server.name}
    `;
    }

    modal.classList.add('active');
    };

    window.closeServerModal = function() {
    const modal = document.getElementById('serverModal');
    if (modal) modal.classList.remove('active');
    };

    // ===== UTILITY FUNCTIONS =====
    function getCategoryIcon(category) {
    const icons = {
    'survival': 'tree',
    'creative': 'paint-brush',
    'pvp': 'crosshairs',
    'rpg': 'dragon',
    'minigames': 'gamepad',
    'modded': 'puzzle-piece',
    'anarchy': 'skull-crossbones',
    'hardcore': 'heartbeat',
    'skyblock': 'cloud',
    'bedwars': 'bed',
    'factions': 'users'
    };
    return icons[category] || 'server';
    }

    function getCategoryName(category) {
    const names = {
    'survival': 'Survival',
    'creative': 'Creative',
    'pvp': 'PvP',
    'rpg': 'RPG',
    'minigames': 'Minigames',
    'modded': 'Modded',
    'anarchy': 'Anarchy',
    'hardcore': 'Hardcore',
    'skyblock': 'SkyBlock',
    'bedwars': 'BedWars',
    'factions': 'Factions'
    };
    return names[category] || 'Outros';
    }

    function generateConnectionCode(server) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) { code +=chars.charAt(Math.floor(Math.random() * chars.length)); } return
        `${server.id.substring(0, 3).toUpperCase()}-${code}`; } //=====ACTION FUNCTIONS=====window.copyIP=function(ip) {
        navigator.clipboard.writeText(ip).then(()=> {
        showNotification('IP copiado para a área de transferência!');
        }).catch(err => {
        console.error('Erro ao copiar IP:', err);
        showNotification('Erro ao copiar IP');
        });
        };

        window.copyConnectionDetails = function() {
        const ip = document.getElementById('serverIp');
        const port = document.getElementById('serverPort');
        const code = document.getElementById('connectionCode');

        if (!ip || !port) return;

        let details = `IP: ${ip.value}:${port.value}`;
        if (selectedForm !== 1 && code && code.value) {
        details += `\nCódigo: ${code.value}`;
        }

        navigator.clipboard.writeText(details).then(() => {
        showNotification('Detalhes copiados!');
        });
        };

        window.connectToServer = function() {
        if (!selectedServer) return;

        const ip = selectedServer.ip;
        const port = selectedServer.port;

        // Minecraft deep link
        const minecraftUrl = `minecraft://?addExternalServer=MineHost|${ip}:${port}`;
        window.location.href = minecraftUrl;

        // Fallback
        setTimeout(() => {
        if (document.hasFocus()) {
        window.copyIP(`${ip}:${port}`);
        showNotification('IP copiado! Cole no Minecraft manualmente.');
        }
        }, 1000);

        window.closeFormModal();
        };

        window.toggleFavorite = function(serverId, button) {
        if (!currentUser) {
        showNotification('Faça login para favoritar servidores!');
        signInWithGoogle();
        return;
        }

        button.classList.toggle('favorited');
        showNotification(button.classList.contains('favorited')
        ? 'Servidor favoritado!'
        : 'Removido dos favoritos');
        };

        // ===== NOTIFICATION =====
        window.showNotification = function(message) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        if (!notification || !notificationText) return;

        notificationText.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
        notification.classList.remove('show');
        }, 3000);
        };

        // ===== INITIALIZE =====
        init();

        // Expor funções globalmente
        window.resetFilters = resetFilters;
        });
