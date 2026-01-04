// Sistema MineHost - Profile System (100% Firebase)
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 MineHost Profile iniciando...');

    // Variáveis globais
    let currentUser = null;
    let userData = null;
    let userServers = [];
    let featuredServers = [];
    let userPayments = [];
    let editingServerId = null;
    let selectedPlan = null;

    // Inicialização
    async function init() {
        try {
            // Iniciar loading
            startLoading();

            // Configurar eventos
            setupEventListeners();

            // Inicializar Firebase
            await initFirebase();

            // Verificar autenticação
            await checkAuth();

            // Se não estiver autenticado, redirecionar
            if (!currentUser) {
                window.location.href = 'home.html';
                return;
            }

            // Carregar dados do usuário
            await loadUserData();

            // Carregar servidores do usuário
            await loadUserServers();

            // Carregar servidores em destaque
            await loadFeaturedServers();

            // Carregar histórico de pagamentos
            await loadPaymentHistory();

            // Atualizar estatísticas
            updateUserStats();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao carregar dados. Tente novamente.');
        } finally {
            // Finalizar loading
            setTimeout(finishLoading, 1500);
        }
    }

    // ===== LOADING =====
    function startLoading() {
        console.log('⏳ Iniciando loading...');
        document.body.classList.add('loading');
    }

    function finishLoading() {
        console.log('✅ Finalizando loading...');
        document.body.classList.remove('loading');
        
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
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
                onAuthStateChanged,
                signOut
            } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
            const {
                getFirestore,
                collection,
                getDocs,
                query,
                where,
                orderBy,
                doc,
                getDoc,
                setDoc,
                addDoc,
                updateDoc,
                deleteDoc,
                serverTimestamp,
                limit
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
                signOut,
                collection,
                getDocs,
                query,
                where,
                orderBy,
                doc,
                getDoc,
                setDoc,
                addDoc,
                updateDoc,
                deleteDoc,
                serverTimestamp,
                limit
            };

            console.log('✅ Firebase inicializado');

        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            showNotification('Erro ao conectar com o servidor');
        }
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', function () {
                navMenu.classList.toggle('active');
                this.innerHTML = navMenu.classList.contains('active')
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';
            });
        }

        // Botão de login
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', signInWithGoogle);
        }

        // Botão de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', signOutUser);
        }

        // Botões de ação
        document.getElementById('createServerBtn')?.addEventListener('click', () => openServerModal());
        document.getElementById('addServerBtn')?.addEventListener('click', () => openServerModal());
        document.getElementById('editProfileBtn')?.addEventListener('click', openEditProfileModal);
        document.getElementById('uploadAvatar')?.addEventListener('click', uploadAvatar);

        // Formulário de edição de perfil
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', saveProfile);
        }

        // Formulário de servidor
        const serverForm = document.getElementById('serverForm');
        if (serverForm) {
            serverForm.addEventListener('submit', saveServer);
        }

        // Botão de excluir servidor
        document.getElementById('deleteServerBtn')?.addEventListener('click', deleteServer);

        // Botões de plano
        document.querySelectorAll('.btn-plan').forEach(btn => {
            btn.addEventListener('click', function() {
                selectedPlan = this.dataset.plan;
                openPaymentModal(selectedPlan);
            });
        });

        // Tabs de pagamento
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const method = this.dataset.method;
                switchPaymentMethod(method);
            });
        });

        // Botão de confirmar pagamento
        document.getElementById('confirmPaymentBtn')?.addEventListener('click', processPayment);

        // Botões de confirmação
        document.getElementById('confirmCancel')?.addEventListener('click', () => {
            document.getElementById('confirmModal').classList.remove('active');
        });

        // Fechar modais
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal) modal.classList.remove('active');
            });
        });

        // Fechar modal ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
    }

    // ===== AUTHENTICATION =====
    async function checkAuth() {
        if (!window.firebase) return;

        return new Promise((resolve) => {
            window.firebase.onAuthStateChanged(window.firebase.auth, async (user) => {
                if (user) {
                    currentUser = user;
                    console.log('✅ Usuário autenticado:', user.displayName);
                    updateProfileUI(user);
                    resolve();
                } else {
                    currentUser = null;
                    console.log('❌ Nenhum usuário autenticado');
                    resolve();
                }
            });
        });
    }

    async function signInWithGoogle() {
        if (!window.firebase) {
            showNotification('Firebase não inicializado');
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

    async function signOutUser() {
        if (!window.firebase) return;

        try {
            await window.firebase.signOut(window.firebase.auth);
            showNotification('Logout realizado!');
            window.location.href = 'home.html';
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }

    // ===== USER DATA =====
    async function loadUserData() {
        if (!window.firebase || !currentUser) return;

        try {
            const userRef = window.firebase.doc(window.firebase.db, 'users', currentUser.uid);
            const userDoc = await window.firebase.getDoc(userRef);

            if (userDoc.exists()) {
                userData = userDoc.data();
            } else {
                // Criar usuário no Firestore se não existir
                userData = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    bio: '',
                    premium: false,
                    verified: false,
                    createdAt: window.firebase.serverTimestamp(),
                    updatedAt: window.firebase.serverTimestamp()
                };
                
                await window.firebase.setDoc(userRef, userData);
            }

            updateProfileUI(currentUser);
            updateBadges();

        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    function updateProfileUI(user) {
        // Atualizar header
        const username = document.getElementById('username');
        const userAvatar = document.getElementById('userAvatar');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileAvatar = document.getElementById('profileAvatar');
        const loginBtn = document.getElementById('loginBtn');
        const userProfile = document.getElementById('userProfile');

        if (username) username.textContent = user.displayName || 'Usuário';
        if (userAvatar) userAvatar.src = user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        if (profileName) profileName.textContent = user.displayName || 'Usuário';
        if (profileEmail) profileEmail.textContent = user.email || '';
        if (profileAvatar) profileAvatar.src = user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
    }

    function updateBadges() {
        const badgesContainer = document.getElementById('profileBadges');
        if (!badgesContainer || !userData) return;

        badgesContainer.innerHTML = '';
        
        if (userData.premium) {
            badgesContainer.innerHTML += '<span class="badge"><i class="fas fa-crown"></i> Premium</span>';
        }
        
        if (userData.verified) {
            badgesContainer.innerHTML += '<span class="badge"><i class="fas fa-shield-alt"></i> Verificado</span>';
        }
    }

    // ===== SERVER MANAGEMENT =====
    async function loadUserServers() {
        if (!window.firebase || !currentUser) return;

        try {
            const serversQuery = window.firebase.query(
                window.firebase.collection(window.firebase.db, 'servers'),
                window.firebase.where('ownerId', '==', currentUser.uid),
                window.firebase.orderBy('createdAt', 'desc')
            );

            const serversSnapshot = await window.firebase.getDocs(serversQuery);
            userServers = [];

            serversSnapshot.forEach(doc => {
                const data = doc.data();
                userServers.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                });
            });

            console.log(`✅ ${userServers.length} servidores carregados`);
            displayUserServers();

        } catch (error) {
            console.error('Erro ao carregar servidores:', error);
        }
    }

    async function loadFeaturedServers() {
        if (!window.firebase || !currentUser) return;

        try {
            // Carregar servidores em destaque (com featuredUntil no futuro)
            const now = new Date();
            const featuredQuery = window.firebase.query(
                window.firebase.collection(window.firebase.db, 'servers'),
                window.firebase.where('featured', '==', true),
                window.firebase.where('featuredUntil', '>', now),
                window.firebase.orderBy('featuredUntil', 'desc'),
                window.firebase.limit(4)
            );

            const featuredSnapshot = await window.firebase.getDocs(featuredQuery);
            featuredServers = [];

            featuredSnapshot.forEach(doc => {
                const data = doc.data();
                featuredServers.push({
                    id: doc.id,
                    ...data,
                    featuredUntil: data.featuredUntil?.toDate() || new Date()
                });
            });

            console.log(`✅ ${featuredServers.length} servidores em destaque`);
            displayFeaturedServers();

        } catch (error) {
            console.error('Erro ao carregar servidores em destaque:', error);
        }
    }

    function displayUserServers() {
        const serversGrid = document.getElementById('userServers');
        if (!serversGrid) return;

        if (userServers.length === 0) {
            serversGrid.innerHTML = `
                <div class="no-servers">
                    <i class="fas fa-server"></i>
                    <h3>Nenhum servidor criado</h3>
                    <p>Comece criando seu primeiro servidor!</p>
                    <button class="btn-create" onclick="openServerModal()">
                        <i class="fas fa-plus"></i> Criar Servidor
                    </button>
                </div>
            `;
            return;
        }

        serversGrid.innerHTML = userServers.map(server => `
            <div class="server-card">
                <div class="server-banner">
                    <img src="${server.banner || `https://picsum.photos/600/300?random=${server.id}`}" alt="${server.name}"
                         onerror="this.src='https://picsum.photos/600/300?random=${server.id}'">
                    <div class="server-status">
                        <div class="status-dot ${server.online ? '' : 'offline'}"></div>
                        <div class="status-text">${server.online ? 'ONLINE' : 'OFFLINE'}</div>
                    </div>
                    ${server.featured ? '<div class="featured-badge"><i class="fas fa-crown"></i> EM DESTAQUE</div>' : ''}
                </div>

                <div class="server-content">
                    <div class="server-header">
                        <div class="server-icon">
                            <i class="fas fa-${getCategoryIcon(server.category)}"></i>
                        </div>
                        <div class="server-info">
                            <div class="server-title">
                                ${server.name}
                                <span class="server-category">${getCategoryName(server.category)}</span>
                            </div>
                            <p class="server-description">${server.description}</p>
                        </div>
                    </div>

                    <div class="server-stats">
                        <div class="server-stat">
                            <div class="value">${server.players || 0}/${server.maxPlayers || 100}</div>
                            <div class="label">Jogadores</div>
                        </div>
                        <div class="server-stat">
                            <div class="value">${server.version || '1.20.1'}</div>
                            <div class="label">Versão</div>
                        </div>
                        <div class="server-stat">
                            <div class="value">${server.votes || 0}</div>
                            <div class="label">Votos</div>
                        </div>
                    </div>

                    <div class="server-actions">
                        <button class="btn-join" onclick="window.copyIP('${server.ip}:${server.port}')">
                            <i class="fas fa-copy"></i> Copiar IP
                        </button>
                        <button class="btn-edit" onclick="window.editServer('${server.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="window.confirmDeleteServer('${server.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function displayFeaturedServers() {
        const featuredGrid = document.getElementById('featuredServers');
        if (!featuredGrid) return;

        if (featuredServers.length === 0) {
            featuredGrid.innerHTML = `
                <div class="no-featured">
                    <i class="fas fa-star"></i>
                    <h3>Nenhum servidor em destaque</h3>
                    <p>Seja o primeiro a destacar seu servidor!</p>
                </div>
            `;
            return;
        }

        featuredGrid.innerHTML = featuredServers.map(server => `
            <div class="server-card">
                <div class="server-banner">
                    <img src="${server.banner || `https://picsum.photos/600/300?random=${server.id}`}" alt="${server.name}"
                         onerror="this.src='https://picsum.photos/600/300?random=${server.id}'">
                    <div class="server-status">
                        <div class="status-dot"></div>
                        <div class="status-text">EM DESTAQUE</div>
                    </div>
                </div>

                <div class="server-content">
                    <div class="server-header">
                        <div class="server-icon" style="background: linear-gradient(135deg, #ffb74d, #ff9f43);">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div class="server-info">
                            <div class="server-title">
                                ${server.name}
                                <span class="server-category">${getCategoryName(server.category)}</span>
                            </div>
                            <p class="server-description">${server.description}</p>
                        </div>
                    </div>

                    <div class="server-stats">
                        <div class="server-stat">
                            <div class="value">${server.players || 0}/${server.maxPlayers || 100}</div>
                            <div class="label">Jogadores</div>
                        </div>
                        <div class="server-stat">
                            <div class="value">${server.version || '1.20.1'}</div>
                            <div class="label">Versão</div>
                        </div>
                        <div class="server-stat">
                            <div class="value">${server.votes || 0}</div>
                            <div class="label">Votos</div>
                        </div>
                    </div>

                    <div class="server-actions">
                        <button class="btn-join" onclick="window.copyIP('${server.ip}:${server.port}')">
                            <i class="fas fa-gamepad"></i> Conectar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ===== MODAL FUNCTIONS =====
    function openEditProfileModal() {
        if (!currentUser || !userData) return;

        const modal = document.getElementById('editProfileModal');
        const nameInput = document.getElementById('editName');
        const bioInput = document.getElementById('editBio');

        if (nameInput) nameInput.value = userData.displayName || '';
        if (bioInput) bioInput.value = userData.bio || '';

        modal.classList.add('active');
    }

    async function saveProfile(e) {
        e.preventDefault();
        if (!window.firebase || !currentUser) return;

        try {
            const name = document.getElementById('editName').value;
            const bio = document.getElementById('editBio').value;

            // Atualizar no Firestore
            const userRef = window.firebase.doc(window.firebase.db, 'users', currentUser.uid);
            await window.firebase.updateDoc(userRef, {
                displayName: name,
                bio: bio,
                updatedAt: window.firebase.serverTimestamp()
            });

            // Atualizar localmente
            userData.displayName = name;
            userData.bio = bio;

            // Atualizar UI
            updateProfileUI({ ...currentUser, displayName: name });
            
            // Fechar modal
            document.getElementById('editProfileModal').classList.remove('active');
            showNotification('Perfil atualizado com sucesso!');

        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            showNotification('Erro ao atualizar perfil');
        }
    }

    function openServerModal(serverId = null) {
        editingServerId = serverId;
        const modal = document.getElementById('serverModal');
        const title = document.getElementById('serverModalTitle');
        const deleteBtn = document.getElementById('deleteServerBtn');

        // Resetar formulário
        const form = document.getElementById('serverForm');
        if (form) form.reset();

        if (serverId) {
            // Modo edição
            const server = userServers.find(s => s.id === serverId);
            if (server) {
                document.getElementById('serverId').value = server.id;
                document.getElementById('serverName').value = server.name;
                document.getElementById('serverCategory').value = server.category;
                document.getElementById('serverDescription').value = server.description;
                document.getElementById('serverIP').value = server.ip;
                document.getElementById('serverPort').value = server.port;
                document.getElementById('serverVersion').value = server.version;
                document.getElementById('serverMaxPlayers').value = server.maxPlayers;
                document.getElementById('serverBanner').value = server.banner || '';
                
                if (title) title.innerHTML = '<i class="fas fa-edit"></i> Editar Servidor';
                if (deleteBtn) deleteBtn.style.display = 'block';
            }
        } else {
            // Modo criação
            if (title) title.innerHTML = '<i class="fas fa-plus"></i> Novo Servidor';
            if (deleteBtn) deleteBtn.style.display = 'none';
        }

        modal.classList.add('active');
    }

    async function saveServer(e) {
        e.preventDefault();
        if (!window.firebase || !currentUser) return;

        try {
            const serverData = {
                name: document.getElementById('serverName').value,
                category: document.getElementById('serverCategory').value,
                description: document.getElementById('serverDescription').value,
                ip: document.getElementById('serverIP').value,
                port: document.getElementById('serverPort').value,
                version: document.getElementById('serverVersion').value,
                maxPlayers: parseInt(document.getElementById('serverMaxPlayers').value),
                banner: document.getElementById('serverBanner').value || `https://picsum.photos/600/300?random=${Date.now()}`,
                ownerId: currentUser.uid,
                ownerName: currentUser.displayName,
                ownerAvatar: currentUser.photoURL,
                players: 0,
                votes: 0,
                views: 0,
                online: true,
                featured: false,
                updatedAt: window.firebase.serverTimestamp()
            };

            if (editingServerId) {
                // Atualizar servidor existente
                const serverRef = window.firebase.doc(window.firebase.db, 'servers', editingServerId);
                await window.firebase.updateDoc(serverRef, serverData);
                showNotification('Servidor atualizado com sucesso!');
            } else {
                // Criar novo servidor
                serverData.createdAt = window.firebase.serverTimestamp();
                await window.firebase.addDoc(
                    window.firebase.collection(window.firebase.db, 'servers'),
                    serverData
                );
                showNotification('Servidor criado com sucesso!');
            }

            // Fechar modal e recarregar dados
            document.getElementById('serverModal').classList.remove('active');
            await loadUserServers();
            updateUserStats();

        } catch (error) {
            console.error('Erro ao salvar servidor:', error);
            showNotification('Erro ao salvar servidor');
        }
    }

    async function deleteServer() {
        if (!window.firebase || !editingServerId) return;

        try {
            const serverRef = window.firebase.doc(window.firebase.db, 'servers', editingServerId);
            await window.firebase.deleteDoc(serverRef);

            document.getElementById('serverModal').classList.remove('active');
            showNotification('Servidor excluído com sucesso!');
            
            await loadUserServers();
            updateUserStats();

        } catch (error) {
            console.error('Erro ao excluir servidor:', error);
            showNotification('Erro ao excluir servidor');
        }
    }

    // ===== PAYMENT SYSTEM =====
    function openPaymentModal(plan) {
        const modal = document.getElementById('paymentModal');
        const planName = document.getElementById('paymentPlanName');
        const amount = document.getElementById('paymentAmount');
        const period = document.getElementById('paymentPeriod');
        const description = document.getElementById('paymentDescription');

        // Configurar valores baseados no plano
        const plans = {
            basic: { name: 'Básico', price: '19,90', period: '/semana', desc: 'Destaque por 7 dias' },
            premium: { name: 'Premium', price: '49,90', period: '/mês', desc: 'Destaque por 30 dias' },
            vip: { name: 'VIP', price: '99,90', period: '/mês', desc: 'Destaque permanente' }
        };

        const selected = plans[plan];
        if (selected) {
            planName.textContent = `Plano ${selected.name}`;
            amount.textContent = `R$ ${selected.price}`;
            period.textContent = selected.period;
            description.textContent = selected.desc;
        }

        modal.classList.add('active');
    }

    function switchPaymentMethod(method) {
        // Ativar tab
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.method === method);
        });

        // Mostrar conteúdo correspondente
        document.getElementById('pixContent').classList.toggle('active', method === 'pix');
        document.getElementById('cardContent').classList.toggle('active', method === 'card');
    }

    async function processPayment() {
        if (!window.firebase || !currentUser || !selectedPlan) return;

        try {
            const paymentMethod = document.querySelector('.payment-tab.active').dataset.method;
            const amount = getPlanAmount(selectedPlan);
            const duration = getPlanDuration(selectedPlan);

            const paymentData = {
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userEmail: currentUser.email,
                plan: selectedPlan,
                amount: amount,
                method: paymentMethod,
                duration: duration,
                status: 'pending',
                createdAt: window.firebase.serverTimestamp()
            };

            // Salvar pagamento no Firestore
            const paymentRef = await window.firebase.addDoc(
                window.firebase.collection(window.firebase.db, 'payments'),
                paymentData
            );

            // Simular processamento
            showNotification('Processando pagamento...');
            
            setTimeout(async () => {
                // Atualizar status para pago
                await window.firebase.updateDoc(paymentRef, {
                    status: 'paid',
                    paidAt: window.firebase.serverTimestamp()
                });

                // Atualizar usuário como premium/verificado baseado no plano
                const userRef = window.firebase.doc(window.firebase.db, 'users', currentUser.uid);
                await window.firebase.updateDoc(userRef, {
                    premium: true,
                    verified: selectedPlan === 'vip',
                    updatedAt: window.firebase.serverTimestamp()
                });

                // Recarregar dados do usuário
                await loadUserData();
                
                document.getElementById('paymentModal').classList.remove('active');
                showNotification('Pagamento realizado com sucesso!');
                
                // Recarregar histórico
                await loadPaymentHistory();

            }, 2000);

        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            showNotification('Erro ao processar pagamento');
        }
    }

    async function loadPaymentHistory() {
        if (!window.firebase || !currentUser) return;

        try {
            const paymentsQuery = window.firebase.query(
                window.firebase.collection(window.firebase.db, 'payments'),
                window.firebase.where('userId', '==', currentUser.uid),
                window.firebase.orderBy('createdAt', 'desc')
            );

            const paymentsSnapshot = await window.firebase.getDocs(paymentsQuery);
            userPayments = [];

            paymentsSnapshot.forEach(doc => {
                const data = doc.data();
                userPayments.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    paidAt: data.paidAt?.toDate() || null
                });
            });

            updatePaymentHistoryTable();

        } catch (error) {
            console.error('Erro ao carregar histórico de pagamentos:', error);
        }
    }

    function updatePaymentHistoryTable() {
        const tableBody = document.querySelector('#paymentHistoryTable tbody');
        if (!tableBody) return;

        if (userPayments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <i class="fas fa-receipt" style="font-size: 48px; color: #8892b0; margin-bottom: 20px; display: block;"></i>
                        <p style="color: #8892b0;">Nenhum pagamento encontrado</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = userPayments.map(payment => `
            <tr>
                <td>${formatDate(payment.createdAt)}</td>
                <td>Plano ${payment.plan.toUpperCase()}</td>
                <td>R$ ${payment.amount.toFixed(2)}</td>
                <td>
                    <span class="status-${payment.status}">
                        ${payment.status === 'paid' ? 'PAGO' : 
                          payment.status === 'pending' ? 'PENDENTE' : 'FALHOU'}
                    </span>
                </td>
                <td>
                    ${payment.status === 'paid' ? 
                        '<button class="btn-receipt" onclick="window.downloadReceipt(\'' + payment.id + '\')"><i class="fas fa-download"></i> Recibo</button>' :
                        '<button class="btn-retry" onclick="window.retryPayment(\'' + payment.id + '\')"><i class="fas fa-redo"></i> Tentar Novamente</button>'}
                </td>
            </tr>
        `).join('');
    }

    // ===== UTILITY FUNCTIONS =====
    function updateUserStats() {
        // Contadores
        document.getElementById('userServersCount').textContent = userServers.length;
        document.getElementById('userFavoritesCount').textContent = 0; // Temporário
        
        // Calcular totais
        const totalPlayers = userServers.reduce((sum, server) => sum + (server.players || 0), 0);
        const totalViews = userServers.reduce((sum, server) => sum + (server.views || 0), 0);
        const totalVotes = userServers.reduce((sum, server) => sum + (server.votes || 0), 0);
        const featuredCount = userServers.filter(s => s.featured).length;

        document.getElementById('totalPlayers').textContent = totalPlayers.toLocaleString();
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('totalVotes').textContent = totalVotes.toLocaleString();
        document.getElementById('userFeaturedCount').textContent = featuredCount;
    }

    function getCategoryIcon(category) {
        const icons = {
            'survival': 'tree',
            'creative': 'paint-brush',
            'pvp': 'crosshairs',
            'rpg': 'dragon',
            'minigames': 'gamepad',
            'modded': 'puzzle-piece',
            'skyblock': 'cloud',
            'bedwars': 'bed',
            'factions': 'users',
            'hardcore': 'heartbeat'
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
            'skyblock': 'SkyBlock',
            'bedwars': 'BedWars',
            'factions': 'Factions',
            'hardcore': 'Hardcore'
        };
        return names[category] || 'Outros';
    }

    function getPlanAmount(plan) {
        const amounts = {
            basic: 19.90,
            premium: 49.90,
            vip: 99.90
        };
        return amounts[plan] || 0;
    }

    function getPlanDuration(plan) {
        const durations = {
            basic: 7, // dias
            premium: 30, // dias
            vip: 365 * 10 // 10 anos (praticamente permanente)
        };
        return durations[plan] || 0;
    }

    function formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function uploadAvatar() {
        showNotification('Em breve: upload de avatar');
    }

    // ===== NOTIFICATION =====
    function showNotification(message) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        if (!notification || !notificationText) return;

        notificationText.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // ===== EXPORT FUNCTIONS =====
    window.copyIP = function(ip) {
        navigator.clipboard.writeText(ip).then(() => {
            showNotification('IP copiado para a área de transferência!');
        });
    };

    window.editServer = function(serverId) {
        openServerModal(serverId);
    };

    window.confirmDeleteServer = function(serverId) {
        editingServerId = serverId;
        const modal = document.getElementById('confirmModal');
        const title = document.getElementById('confirmTitle');
        const message = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmAction');

        if (title) title.textContent = 'Confirmar Exclusão';
        if (message) message.textContent = 'Tem certeza que deseja excluir este servidor? Esta ação não pode ser desfeita.';
        
        confirmBtn.onclick = deleteServer;
        modal.classList.add('active');
    };

    window.copyToClipboard = function(selector) {
        const element = document.querySelector(selector);
        if (element) {
            navigator.clipboard.writeText(element.textContent);
            showNotification('Código copiado!');
        }
    };

    window.downloadReceipt = function(paymentId) {
        showNotification('Recibo será gerado em breve...');
    };

    window.retryPayment = function(paymentId) {
        const payment = userPayments.find(p => p.id === paymentId);
        if (payment) {
            selectedPlan = payment.plan;
            openPaymentModal(payment.plan);
        }
    };

    window.openServerModal = openServerModal;
    window.showNotification = showNotification;

    // ===== INITIALIZE =====
    init();
});
