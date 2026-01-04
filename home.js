// Sistema MineHost - Premium Dark Theme
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MineHost iniciando...');
    
    // Variáveis globais
    let currentUser = null;
    let servers = [];
    let filteredServers = [];
    let featuredServers = [];
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
            
            // Carregar dados iniciais
            await loadInitialData();
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao carregar dados. Tente novamente.');
        } finally {
            // Finalizar loading
            setTimeout(() => {
                finishLoading();
            }, 1500);
        }
    }
    
    // ===== LOADING =====
    function startLoading() {
        document.body.classList.add('loading');
        simulateProgress();
    }
    
    function simulateProgress() {
        let progress = 0;
        const progressBar = document.getElementById('loadingProgress');
        const statServers = document.getElementById('statServers');
        const statPlayers = document.getElementById('statPlayers');
        const statOnline = document.getElementById('statOnline');
        
        const interval = setInterval(() => {
            progress += 1;
            if (progressBar) progressBar.style.width = progress + '%';
            
            // Atualizar estatísticas durante o loading
            if (progress <= 33) {
                statServers.textContent = Math.floor(Math.random() * 100) + 50;
            } else if (progress <= 66) {
                statPlayers.textContent = Math.floor(Math.random() * 5000) + 1000;
            } else {
                statOnline.textContent = Math.floor(Math.random() * 500) + 100;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 20);
    }
    
    function finishLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        document.body.classList.remove('loading');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // ===== PARTICLES =====
    function initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 80,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: ["#00ff88", "#7b61ff", "#ff6b6b", "#ffb74d"]
                    },
                    shape: {
                        type: "circle"
                    },
                    opacity: {
                        value: 0.6,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 1,
                            opacity_min: 0.1,
                            sync: false
                        }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 2,
                            size_min: 0.1,
                            sync: false
                        }
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
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false,
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: {
                            enable: true,
                            mode: "grab"
                        },
                        onclick: {
                            enable: true,
                            mode: "push"
                        }
                    }
                },
                retina_detect: true
            });
        }
    }
    
    // ===== FIREBASE =====
    async function initFirebase() {
        try {
            // Carregar Firebase dinamicamente
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
                getDoc,
                setDoc
            } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

            const firebaseConfig = {
                apiKey: "AIzaSyAwgA3wphz-vgQgiN1S9evAxZ5R9r6qhac",
                authDomain: "minesv-5760d.firebaseapp.com",
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
                getDoc,
                setDoc
            };
            
            console.log('✅ Firebase inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            // Continuar sem Firebase (modo demo)
            window.firebase = null;
        }
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');
        
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            this.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar') && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        // Update active link
                        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Scroll to section
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                        
                        // Close mobile menu if open
                        if (navMenu.classList.contains('active')) {
                            navMenu.classList.remove('active');
                            document.body.classList.remove('menu-open');
                            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        }
                    }
                }
            });
        });
        
        // Login button
        document.getElementById('loginBtn').addEventListener('click', signInWithGoogle);
        
        // Create server button
        document.getElementById('createBtn').addEventListener('click', function(e) {
            if (!currentUser) {
                e.preventDefault();
                showNotification('Faça login para criar um servidor!');
                signInWithGoogle();
            }
        });
        
        // Search inputs
        const searchInput = document.getElementById('searchInput');
        const heroSearch = document.getElementById('heroSearch');
        
        searchInput.addEventListener('input', function(e) {
            searchTerm = e.target.value.toLowerCase().trim();
            filterAndDisplayServers();
        });
        
        heroSearch.addEventListener('input', function(e) {
            searchTerm = e.target.value.toLowerCase().trim();
            filterAndDisplayServers();
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active filter
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update current filter
                currentFilter = this.dataset.filter;
                filterAndDisplayServers();
            });
        });
        
        // Reset filters button
        document.getElementById('resetFilters').addEventListener('click', resetFilters);
        
        // Header scroll effect
        window.addEventListener('scroll', function() {
            const header = document.getElementById('header');
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                modal.classList.remove('active');
            });
        });
        
        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // Form selection
        document.querySelectorAll('.form-option').forEach(option => {
            option.addEventListener('click', function() {
                selectForm(parseInt(this.dataset.form) || 1);
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
            showNotification('Modo demonstração ativado. Para login completo, configure o Firebase.');
            // Simulate login in demo mode
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
        const username = document.getElementById('username');
        const avatar = userProfile.querySelector('.avatar');
        
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        username.textContent = user.displayName || 'Usuário';
        avatar.src = user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    }
    
    function updateUIForGuest() {
        const loginBtn = document.getElementById('loginBtn');
        const userProfile = document.getElementById('userProfile');
        
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
    
    // ===== DATA LOADING =====
    async function loadInitialData() {
        // Atualizar estatísticas iniciais
        updateStats();
        
        // Atualizar servidores em destaque
        updateFeaturedServers();
    }
    
    async function loadServers() {
        try {
            if (window.firebase) {
                await loadServersFromFirebase();
            } else {
                // Modo demo - carregar dados de exemplo
                await loadDemoServers();
            }
            
            // Inicializar servidores filtrados
            filteredServers = [...servers];
            
            // Exibir servidores
            displayServers();
            
        } catch (error) {
            console.error('Erro ao carregar servidores:', error);
            await loadDemoServers();
            filteredServers = [...servers];
            displayServers();
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
                    description: data.description || 'Descrição não disponível',
                    category: data.category || 'survival',
                    ip: data.ip || 'demo.minehost.com',
                    port: data.port || '25565',
                    players: data.players || 0,
                    maxPlayers: data.maxPlayers || 100,
                    online: data.online !== false,
                    version: data.version || '1.20.1',
                    ownerId: data.ownerId || '',
                    ownerName: data.ownerName || 'Administrador',
                    ownerAvatar: data.ownerAvatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    banner: data.banner || `https://picsum.photos/600/300?random=${doc.id}`,
                    votes: data.votes || 0,
                    views: data.views || 0,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
                });
            });
            
            console.log(`✅ ${servers.length} servidores carregados do Firebase`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar do Firebase:', error);
            throw error;
        }
    }
    
    async function loadDemoServers() {
        const demoServers = [
            {
                id: '1',
                name: 'SkyBlock Extreme',
                description: 'Servidor SkyBlock com economia avançada, desafios únicos e comunidade ativa. Venha construir seu paraíso nas nuvens!',
                category: 'survival',
                ip: 'skyblock.minehost.com',
                port: '25565',
                players: 142,
                maxPlayers: 300,
                online: true,
                version: '1.20.1',
                ownerName: 'SkyMaster',
                ownerAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                votes: 1245,
                views: 8923
            },
            {
                id: '2',
                name: 'Creative Universe',
                description: 'Mundo criativo ilimitado com proteção de terrenos e ferramentas avançadas para construção. Libere sua criatividade!',
                category: 'creative',
                ip: 'creative.minehost.com',
                port: '25565',
                players: 89,
                maxPlayers: 200,
                online: true,
                version: '1.20.1',
                ownerName: 'BuildMaster',
                ownerAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                votes: 876,
                views: 6542
            },
            {
                id: '3',
                name: 'PvP Arena Champions',
                description: 'Batalhas PvP intensas com diferentes arenas, ranking competitivo e prêmios semanais. Prove que você é o melhor!',
                category: 'pvp',
                ip: 'pvp.minehost.com',
                port: '25565',
                players: 256,
                maxPlayers: 500,
                online: true,
                version: '1.20.1',
                ownerName: 'BattleLord',
                ownerAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
                banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                votes: 2103,
                views: 15432
            },
            {
                id: '4',
                name: 'Minigames Paradise',
                description: 'Coleção completa de minigames: BedWars, SkyWars, Hunger Games e muito mais. Diversão garantida!',
                category: 'minigames',
                ip: 'minigames.minehost.com',
                port: '25565',
                players: 324,
                maxPlayers: 600,
                online: true,
                version: '1.20.1',
                ownerName: 'GameMaster',
                ownerAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
                banner: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                votes: 1876,
                views: 12345
            },
            {
                id: '5',
                name: 'RPG Medieval',
                description: 'Mundo de RPG épico com missões, classes únicas, NPCs e história envolvente. Viva uma aventura inesquecível!',
                category: 'rpg',
                ip: 'rpg.minehost.com',
                port: '25565',
                players: 98,
                maxPlayers: 150,
                online: true,
                version: '1.20.1',
                ownerName: 'StoryTeller',
                ownerAvatar: 'https://randomuser.me/api/portraits/men/89.jpg',
                banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                votes: 654,
                views: 4321
            },
            {
                id: '6',
                name: 'Anarchy World',
                description: 'Mundo anárquico sem regras. Sobreviva como puder em um ambiente totalmente PvP e sem proteções.',
                category: 'pvp',
                ip: 'anarchy.minehost.com',
                port: '25565',
                players: 187,
                maxPlayers: 300,
                online: true,
                version: '1.20.1',
                ownerName: 'ChaosLord',
                ownerAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
                banner: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                votes: 432,
                views: 5678
            }
        ];
        
        servers = demoServers;
        console.log(`🎮 ${servers.length} servidores de demonstração carregados`);
    }
    
    // ===== SERVER DISPLAY =====
    function displayServers() {
        const serversGrid = document.getElementById('serversGrid');
        const noResults = document.getElementById('noResults');
        
        if (filteredServers.length === 0) {
            serversGrid.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }
        
        noResults.classList.add('hidden');
        
        serversGrid.innerHTML = filteredServers.map((server, index) => {
            const categoryIcon = getCategoryIcon(server.category);
            const categoryName = getCategoryName(server.category);
            
            return `
                <div class="server-card" data-id="${server.id}" onclick="openServerModal('${server.id}')">
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
                        
                        <div class="server-ip" onclick="event.stopPropagation(); copyIP('${server.ip}:${server.port}')">
                            <span class="ip-text">${server.ip}:${server.port}</span>
                            <button class="copy-btn">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        
                        <div class="server-actions">
                            <button class="btn-join" onclick="event.stopPropagation(); openFormModal('${server.id}')">
                                <i class="fas fa-gamepad"></i>
                                ENTRAR
                            </button>
                            <button class="btn-favorite" onclick="event.stopPropagation(); toggleFavorite('${server.id}', this)">
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
            // Filter by category
            if (currentFilter !== 'all' && server.category !== currentFilter) {
                return false;
            }
            
            // Filter by search term
            if (searchTerm) {
                const searchable = `${server.name} ${server.description} ${server.category} ${getCategoryName(server.category)}`.toLowerCase();
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
        
        document.getElementById('searchInput').value = '';
        document.getElementById('heroSearch').value = '';
        
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
        const totalPlayers = servers.reduce((sum, server) => sum + server.players, 0);
        
        document.getElementById('totalServers').textContent = totalServers;
        document.getElementById('onlineServers').textContent = onlineServers;
        document.getElementById('totalPlayers').textContent = totalPlayers.toLocaleString();
    }
    
    function updateFeaturedServers() {
        const featuredGrid = document.getElementById('featuredGrid');
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
            const categoryIcon = getCategoryIcon(server.category);
            const categoryName = getCategoryName(server.category);
            
            return `
                <div class="server-card" data-id="${server.id}" onclick="openServerModal('${server.id}')">
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
                            <button class="btn-join" onclick="event.stopPropagation(); openFormModal('${server.id}')">
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
        
        // Update modal with server info
        document.getElementById('selectedServerName').textContent = server.name;
        document.getElementById('serverIp').value = server.ip;
        document.getElementById('serverPort').value = server.port;
        
        // Generate connection code
        const code = generateConnectionCode(server);
        document.getElementById('connectionCode').value = code;
        
        // Show modal
        const modal = document.getElementById('formModal');
        modal.classList.add('active');
        
        // Reset form selection
        selectForm(1);
    };
    
    window.closeFormModal = function() {
        const modal = document.getElementById('formModal');
        modal.classList.remove('active');
    };
    
    window.selectForm = function(formNumber) {
        selectedForm = formNumber;
        
        // Update form options
        document.querySelectorAll('.form-option').forEach((option, index) => {
            if (index === formNumber - 1) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Update form preview
        const codeField = document.getElementById('codeField');
        const codeInput = document.getElementById('connectionCode');
        
        switch(formNumber) {
            case 1:
                codeField.style.display = 'none';
                break;
            case 2:
                codeField.style.display = 'block';
                codeInput.placeholder = 'Código de segurança gerado';
                break;
            case 3:
                codeField.style.display = 'block';
                codeInput.placeholder = 'Código personalizado';
                break;
        }
    };
    
    window.openServerModal = function(serverId) {
        const server = servers.find(s => s.id === serverId);
        if (!server) return;
        
        selectedServer = server;
        
        const modal = document.getElementById('serverModal');
        const modalBody = modal.querySelector('.modal-body');
        const categoryName = getCategoryName(server.category);
        
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
                    <button class="btn-copy" onclick="copyIP('${server.ip}:${server.port}')">
                        <i class="fas fa-copy"></i>
                        Copiar IP
                    </button>
                    <button class="btn-connect" onclick="openFormModal('${server.id}')">
                        <i class="fas fa-gamepad"></i>
                        Conectar
                    </button>
                </div>
            </div>
        `;
        
        modal.querySelector('#modalServerName').innerHTML = `
            <i class="fas fa-server"></i>
            ${server.name}
        `;
        
        modal.classList.add('active');
    };
    
    window.closeServerModal = function() {
        const modal = document.getElementById('serverModal');
        modal.classList.remove('active');
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
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${server.id.substring(0, 3).toUpperCase()}-${code}`;
    }
    
    // ===== ACTION FUNCTIONS =====
    window.copyIP = function(ip) {
        navigator.clipboard.writeText(ip).then(() => {
            showNotification('IP copiado para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar IP:', err);
            showNotification('Erro ao copiar IP');
        });
    };
    
    window.copyConnectionDetails = function() {
        const ip = document.getElementById('serverIp').value;
        const port = document.getElementById('serverPort').value;
        const code = document.getElementById('connectionCode').value;
        
        let details = `IP: ${ip}:${port}`;
        if (selectedForm !== 1) {
            details += `\nCódigo: ${code}`;
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
        
        // Try to open Minecraft
        window.location.href = minecraftUrl;
        
        // Fallback
        setTimeout(() => {
            if (document.hasFocus()) {
                copyIP(`${ip}:${port}`);
                showNotification('IP copiado! Cole no Minecraft manualmente.');
            }
        }, 1000);
        
        // Close modal
        closeFormModal();
    };
    
    window.toggleFavorite = function(serverId, button) {
        if (!currentUser) {
            showNotification('Faça login para favoritar servidores!');
            signInWithGoogle();
            return;
        }
        
        button.classList.toggle('favorited');
        const isFavorited = button.classList.contains('favorited');
        
        showNotification(isFavorited ? 'Servidor favoritado!' : 'Removido dos favoritos');
    };
    
    // ===== NOTIFICATION =====
    window.showNotification = function(message) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
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
    window.openFormModal = openFormModal;
    window.closeFormModal = closeFormModal;
    window.selectForm = selectForm;
    window.openServerModal = openServerModal;
    window.closeServerModal = closeServerModal;
    window.copyIP = copyIP;
    window.copyConnectionDetails = copyConnectionDetails;
    window.connectToServer = connectToServer;
    window.toggleFavorite = toggleFavorite;
});
