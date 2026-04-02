/* ============================================
   PAISA — SAFFRON APP ENGINE
   Complete Personal Finance App Logic
   ============================================ */

// ============================================
// DATA MODEL & CONSTANTS
// ============================================

const CATEGORIES = {
    expense: [
        { id: 'food', name: 'Food', icon: '🍕', color: '#FF6B00' },
        { id: 'transport', name: 'Transport', icon: '🚗', color: '#9B59B6' },
        { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#E74C3C' },
        { id: 'bills', name: 'Bills', icon: '⚡', color: '#F39C12' },
        { id: 'health', name: 'Health', icon: '🏥', color: '#2ECC71' },
        { id: 'education', name: 'Education', icon: '📚', color: '#3498DB' },
        { id: 'entertainment', name: 'Fun', icon: '🎬', color: '#E91E63' },
        { id: 'other', name: 'Other', icon: '📦', color: '#95A5A6' }
    ],
    income: [
        { id: 'salary', name: 'Salary', icon: '💰', color: '#2ECC71' },
        { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3498DB' },
        { id: 'investment', name: 'Investment', icon: '📈', color: '#FF6B00' },
        { id: 'gift', name: 'Gift', icon: '🎁', color: '#E91E63' },
        { id: 'refund', name: 'Refund', icon: '↩️', color: '#9B59B6' },
        { id: 'rental', name: 'Rental', icon: '🏠', color: '#F39C12' },
        { id: 'dividend', name: 'Dividend', icon: '🏦', color: '#1ABC9C' },
        { id: 'other_inc', name: 'Other', icon: '📦', color: '#95A5A6' }
    ]
};

const ACCOUNT_ICONS = {
    bank: '🏦', upi: '📱', cash: '💵', credit: '💳', wallet: '👛'
};

const DEFAULT_ACCOUNTS = [
    { id: 'acc_1', name: 'Bank Account', type: 'bank', balance: 50000 },
    { id: 'acc_2', name: 'UPI', type: 'upi', balance: 15000 },
    { id: 'acc_3', name: 'Cash', type: 'cash', balance: 8000 },
    { id: 'acc_4', name: 'Credit Card', type: 'credit', balance: -5200 }
];

const SAMPLE_TRANSACTIONS = [
    { id: 't1', type: 'expense', amount: 485, description: 'Zomato Order', category: 'food', accountId: 'acc_2', date: getTodayStr() },
    { id: 't2', type: 'income', amount: 65000, description: 'Salary Credit', category: 'salary', accountId: 'acc_1', date: getTodayStr() },
    { id: 't3', type: 'expense', amount: 342, description: 'Uber Ride', category: 'transport', accountId: 'acc_2', date: getYesterdayStr() },
    { id: 't4', type: 'expense', amount: 2180, description: 'Electricity Bill', category: 'bills', accountId: 'acc_1', date: getYesterdayStr() },
    { id: 't5', type: 'expense', amount: 1245, description: 'BigBasket Groceries', category: 'shopping', accountId: 'acc_2', date: getYesterdayStr() },
    { id: 't6', type: 'income', amount: 25000, description: 'Freelance Payment', category: 'freelance', accountId: 'acc_1', date: getDaysAgoStr(2) },
    { id: 't7', type: 'expense', amount: 780, description: 'PVR Cinemas', category: 'entertainment', accountId: 'acc_2', date: getDaysAgoStr(2) },
    { id: 't8', type: 'expense', amount: 3200, description: 'Petrol', category: 'transport', accountId: 'acc_4', date: getDaysAgoStr(3) },
    { id: 't9', type: 'expense', amount: 520, description: 'Starbucks', category: 'food', accountId: 'acc_3', date: getDaysAgoStr(3) },
    { id: 't10', type: 'expense', amount: 1850, description: 'Apollo Pharmacy', category: 'health', accountId: 'acc_4', date: getDaysAgoStr(4) },
    { id: 't11', type: 'expense', amount: 4999, description: 'Amazon Order', category: 'shopping', accountId: 'acc_4', date: getDaysAgoStr(5) },
    { id: 't12', type: 'income', amount: 8500, description: 'Dividend', category: 'dividend', accountId: 'acc_1', date: getDaysAgoStr(5) },
];

// ============================================
// STATE
// ============================================

let state = {
    userName: 'User',
    currentUser: null,
    accounts: [],
    transactions: [],
    currentType: 'expense',
    selectedCategory: null,
    currentScreen: 'home'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const session = localStorage.getItem('paisa_session');
    if (session) {
        const sessionData = JSON.parse(session);
        state.currentUser = sessionData.username;
        loadState();
        showApp();
    } else {
        // Show auth screen
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
        document.getElementById('splashScreen').classList.add('hidden');
    }

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    });
});

// ============================================
// APP BOOT (after auth)
// ============================================

function showApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Show splash briefly
    const splash = document.getElementById('splashScreen');
    splash.classList.remove('hidden');
    setTimeout(() => {
        splash.classList.add('hidden');
        renderAll();
    }, 1200);

    updateTime();
    updateGreeting();
    setInterval(updateTime, 30000);

    // Set default date
    const txDate = document.getElementById('txDate');
    if (txDate) txDate.value = getTodayStr();

    // Period tab listeners
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    document.querySelectorAll('.stats-period').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.stats-period').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStats();
        });
    });
}

// ============================================
// PERSISTENCE (Multi-User)
// ============================================

function getUserKey(username) {
    return 'paisa_user_' + username.toLowerCase().trim();
}

function loadState() {
    if (!state.currentUser) return;
    const key = getUserKey(state.currentUser);
    const saved = localStorage.getItem(key);
    if (saved) {
        const parsed = JSON.parse(saved);
        state.userName = parsed.userName || state.currentUser;
        state.accounts = parsed.accounts || [];
        state.transactions = parsed.transactions || [];
    } else {
        // First login for this user — load defaults
        state.userName = state.currentUser;
        state.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
        state.transactions = JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS));
        saveState();
    }
}

function saveState() {
    if (!state.currentUser) return;
    const key = getUserKey(state.currentUser);
    localStorage.setItem(key, JSON.stringify({
        userName: state.userName,
        accounts: state.accounts,
        transactions: state.transactions
    }));
}

// ============================================
// AUTH FUNCTIONS
// ============================================

function getUsersRegistry() {
    const reg = localStorage.getItem('paisa_users');
    return reg ? JSON.parse(reg) : {};
}

function saveUsersRegistry(registry) {
    localStorage.setItem('paisa_users', JSON.stringify(registry));
}

function showLogin() {
    document.getElementById('loginCard').classList.remove('hidden');
    document.getElementById('signupCard').classList.add('hidden');
    document.getElementById('loginCard').style.animation = 'authCardEnter 0.4s ease-out both';
}

function showSignup() {
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('signupCard').classList.remove('hidden');
    document.getElementById('signupCard').style.animation = 'authCardEnter 0.4s ease-out both';
}

function showAuthError(formId, message) {
    let errorEl = document.querySelector(`#${formId} .auth-error`);
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'auth-error';
        const form = document.getElementById(formId);
        form.insertBefore(errorEl, form.firstChild);
    }
    errorEl.textContent = message;
    errorEl.classList.add('show');
    setTimeout(() => errorEl.classList.remove('show'), 3500);
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const pin = document.getElementById('loginPin').value.trim();

    if (!username || !pin) {
        showAuthError('loginForm', 'Please fill in all fields');
        return;
    }

    const registry = getUsersRegistry();
    const userKey = username.toLowerCase();

    if (!registry[userKey]) {
        showAuthError('loginForm', 'User not found. Please create an account.');
        return;
    }

    if (registry[userKey].pin !== pin) {
        showAuthError('loginForm', 'Incorrect PIN. Please try again.');
        return;
    }

    // Success — set session
    state.currentUser = registry[userKey].displayName;
    localStorage.setItem('paisa_session', JSON.stringify({
        username: registry[userKey].displayName,
        loginTime: Date.now()
    }));

    loadState();
    showApp();
    showToast(`👋 Welcome back, ${state.userName}!`);
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const pin = document.getElementById('signupPin').value.trim();
    const pinConfirm = document.getElementById('signupPinConfirm').value.trim();

    if (!name || !username || !pin || !pinConfirm) {
        showAuthError('signupForm', 'Please fill in all fields');
        return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        showAuthError('signupForm', 'PIN must be exactly 4 digits');
        return;
    }

    if (pin !== pinConfirm) {
        showAuthError('signupForm', 'PINs do not match');
        return;
    }

    const registry = getUsersRegistry();
    const userKey = username.toLowerCase();

    if (registry[userKey]) {
        showAuthError('signupForm', 'Username already taken. Try another.');
        return;
    }

    // Register user
    registry[userKey] = {
        displayName: name,
        username: username,
        pin: pin,
        createdAt: Date.now()
    };
    saveUsersRegistry(registry);

    // Set session
    state.currentUser = name;
    localStorage.setItem('paisa_session', JSON.stringify({
        username: name,
        loginTime: Date.now()
    }));

    // Initialize with defaults
    state.userName = name;
    state.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
    state.transactions = JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS));
    saveState();

    showApp();
    showToast(`🎉 Welcome to Paisa, ${name}!`);
}

function logoutUser() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('paisa_session');
        state.currentUser = null;
        state.userName = 'User';
        state.accounts = [];
        state.transactions = [];

        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();

        // Show auth, hide app
        document.getElementById('app').classList.add('hidden');
        document.getElementById('authScreen').classList.remove('hidden');
        showLogin();

        // Reset navigation to home
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-home').classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('.nav-item[data-screen="home"]').classList.add('active');
    }
}

function switchUser() {
    localStorage.removeItem('paisa_session');
    state.currentUser = null;
    state.userName = 'User';
    state.accounts = [];
    state.transactions = [];

    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();

    document.getElementById('app').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    showLogin();

    // Reset navigation to home
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-home').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-screen="home"]').classList.add('active');
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(screen) {
    state.currentScreen = screen;

    // Update screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screen}`).classList.add('active');

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-screen="${screen}"]`).classList.add('active');

    // Scroll to top
    document.getElementById(`screen-${screen}`).scrollTop = 0;

    // Re-render if needed
    if (screen === 'stats') renderStats();
    if (screen === 'cards') renderAccounts();
    if (screen === 'settings') renderSettings();
}

// ============================================
// RENDERING — HOME
// ============================================

function renderAll() {
    renderHome();
    renderAccounts();
    renderSettings();
}

function renderHome() {
    renderBalance();
    renderAccountsGrid();
    renderSpending();
    renderRecentTransactions();
    renderMiniChart();
}

function renderBalance() {
    const total = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    document.getElementById('totalBalance').textContent = formatCurrency(total);

    // Calculate trend (simplified)
    const thisMonth = getMonthTransactions();
    const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = income - expense;
    const pct = income > 0 ? Math.round((net / income) * 100) : 0;

    const badge = document.getElementById('balanceBadge');
    if (net >= 0) {
        badge.innerHTML = `<span>↑ ${Math.abs(pct)}%</span>`;
        badge.className = 'balance-badge';
        badge.style.background = 'rgba(46,204,113,0.12)';
        badge.style.borderColor = 'rgba(46,204,113,0.2)';
        badge.querySelector('span').style.color = '#2ECC71';
    } else {
        badge.innerHTML = `<span>↓ ${Math.abs(pct)}%</span>`;
        badge.style.background = 'rgba(231,76,60,0.12)';
        badge.style.borderColor = 'rgba(231,76,60,0.2)';
        badge.querySelector('span').style.color = '#E74C3C';
    }
}

function renderAccountsGrid() {
    const grid = document.getElementById('accountsGrid');
    grid.innerHTML = state.accounts.map(acc => `
        <div class="acc-card" onclick="navigateTo('cards')">
            <span class="acc-icon">${ACCOUNT_ICONS[acc.type] || '💰'}</span>
            <span class="acc-label">${acc.name}</span>
            <span class="acc-amount ${acc.balance < 0 ? 'negative' : ''}">${formatCurrency(acc.balance)}</span>
        </div>
    `).join('');
}

function renderSpending() {
    const thisMonth = getMonthTransactions();
    const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    document.getElementById('homeIncome').textContent = formatCurrency(income);
    document.getElementById('homeExpense').textContent = formatCurrency(expense);
}

function renderMiniChart() {
    const container = document.getElementById('miniBarChart');
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayExpense = state.transactions
            .filter(t => t.type === 'expense' && t.date === dateStr)
            .reduce((s, t) => s + t.amount, 0);
        last7Days.push({ date: dateStr, amount: dayExpense, day: d.toLocaleDateString('en', { weekday: 'short' }).charAt(0) });
    }

    const maxVal = Math.max(...last7Days.map(d => d.amount), 1);

    container.innerHTML = last7Days.map((d, i) => {
        const h = Math.max((d.amount / maxVal) * 100, 6);
        const isToday = i === last7Days.length - 1;
        const bg = isToday
            ? 'linear-gradient(180deg, #FFD700, #FF6B00)'
            : 'linear-gradient(180deg, rgba(255,107,0,0.6), rgba(255,107,0,0.3))';
        return `<div class="mini-bar" style="height:${h}%;background:${bg}" title="${d.day}: ${formatCurrency(d.amount)}"></div>`;
    }).join('');
}

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 8);

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="tx-empty">
                <span class="tx-empty-icon">📊</span>
                <span class="tx-empty-text">No transactions yet</span>
                <span class="tx-empty-sub">Tap + to add your first entry</span>
            </div>`;
        return;
    }

    let html = '';
    let lastDateLabel = '';

    recent.forEach(tx => {
        const dateLabel = getDateLabel(tx.date);
        if (dateLabel !== lastDateLabel) {
            html += `<div class="tx-date-header">${dateLabel}</div>`;
            lastDateLabel = dateLabel;
        }

        const allCats = [...CATEGORIES.expense, ...CATEGORIES.income];
        const cat = allCats.find(c => c.id === tx.category) || { icon: '📦', name: 'Other', color: '#95A5A6' };
        const acc = state.accounts.find(a => a.id === tx.accountId);
        const accName = acc ? acc.name : '';
        const sign = tx.type === 'expense' ? '-' : '+';

        html += `
            <div class="tx-item animate-in">
                <div class="tx-icon" style="background:${hexToRgba(cat.color, 0.12)}">${cat.icon}</div>
                <div class="tx-info">
                    <span class="tx-name">${tx.description}</span>
                    <span class="tx-category">${cat.name}${accName ? ' • ' + accName : ''}</span>
                </div>
                <span class="tx-amount ${tx.type}">${sign}${formatCurrency(tx.amount)}</span>
            </div>`;
    });

    container.innerHTML = html;
}

// ============================================
// RENDERING — STATS
// ============================================

function renderStats() {
    const transactions = getMonthTransactions();
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    document.getElementById('statsIncome').textContent = formatCurrency(income);
    document.getElementById('statsExpense').textContent = formatCurrency(expense);

    renderCategoryBars(transactions);
    renderStatsChart(transactions);
}

function renderCategoryBars(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory = {};

    expenses.forEach(tx => {
        if (!byCategory[tx.category]) byCategory[tx.category] = 0;
        byCategory[tx.category] += tx.amount;
    });

    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const maxAmount = sorted.length > 0 ? sorted[0][1] : 1;
    const container = document.getElementById('categoryBars');

    if (sorted.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">📊</span><p class="empty-title">No expenses</p><p class="empty-desc">Start tracking to see insights</p></div>`;
        return;
    }

    container.innerHTML = sorted.map(([catId, amount]) => {
        const cat = CATEGORIES.expense.find(c => c.id === catId) || { icon: '📦', name: 'Other', color: '#95A5A6' };
        const pct = (amount / maxAmount) * 100;
        return `
            <div class="cat-bar-row animate-in">
                <span class="cat-bar-icon">${cat.icon}</span>
                <div class="cat-bar-info">
                    <div class="cat-bar-top">
                        <span class="cat-bar-name">${cat.name}</span>
                        <span class="cat-bar-amount">${formatCurrency(amount)}</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

function renderStatsChart(transactions) {
    const canvas = document.getElementById('statsBarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth;
    const h = 180;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // Last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayExpense = transactions
            .filter(t => t.type === 'expense' && t.date === dateStr)
            .reduce((s, t) => s + t.amount, 0);
        const dayIncome = transactions
            .filter(t => t.type === 'income' && t.date === dateStr)
            .reduce((s, t) => s + t.amount, 0);
        days.push({
            label: d.toLocaleDateString('en', { weekday: 'short' }),
            expense: dayExpense,
            income: dayIncome
        });
    }

    const maxVal = Math.max(...days.map(d => Math.max(d.expense, d.income)), 1);
    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barGroupW = chartW / days.length;
    const barW = barGroupW * 0.3;

    // Grid lines
    for (let i = 0; i <= 3; i++) {
        const y = padding.top + (chartH / 3) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Bars
    days.forEach((day, i) => {
        const cx = padding.left + barGroupW * i + barGroupW / 2;

        // Income bar
        const incH = (day.income / maxVal) * chartH;
        const incGrad = ctx.createLinearGradient(0, padding.top + chartH - incH, 0, padding.top + chartH);
        incGrad.addColorStop(0, '#2ECC71');
        incGrad.addColorStop(1, 'rgba(46,204,113,0.3)');

        roundedBar(ctx, cx - barW - 2, padding.top + chartH - incH, barW, incH, 4);
        ctx.fillStyle = incGrad;
        ctx.fill();

        // Expense bar
        const expH = (day.expense / maxVal) * chartH;
        const expGrad = ctx.createLinearGradient(0, padding.top + chartH - expH, 0, padding.top + chartH);
        expGrad.addColorStop(0, '#FF6B00');
        expGrad.addColorStop(1, 'rgba(255,107,0,0.3)');

        roundedBar(ctx, cx + 2, padding.top + chartH - expH, barW, expH, 4);
        ctx.fillStyle = expGrad;
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(day.label, cx, h - 8);
    });
}

function roundedBar(ctx, x, y, w, h, r) {
    if (h < r * 2) r = h / 2;
    if (h <= 0) return;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ============================================
// RENDERING — ACCOUNTS
// ============================================

function renderAccounts() {
    const container = document.getElementById('accountsList');
    if (!container) return;

    if (state.accounts.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">🏦</span><p class="empty-title">No accounts</p><p class="empty-desc">Add your first account to get started</p></div>`;
        return;
    }

    container.innerHTML = state.accounts.map(acc => `
        <div class="account-full-card animate-in" data-type="${acc.type}">
            <div class="account-card-top">
                <span class="account-card-icon">${ACCOUNT_ICONS[acc.type] || '💰'}</span>
                <span class="account-card-type">${acc.type}</span>
            </div>
            <div class="account-card-name">${acc.name}</div>
            <div class="account-card-balance ${acc.balance < 0 ? 'negative' : ''}">${formatCurrency(acc.balance)}</div>
        </div>
    `).join('');
}

function renderSettings() {
    document.getElementById('settingsName').textContent = state.userName;
    document.querySelector('.greeting-name').textContent = state.userName;
    const loggedInEl = document.getElementById('loggedInAs');
    if (loggedInEl) {
        loggedInEl.textContent = `Signed in as ${state.userName}`;
    }
}

// ============================================
// TRANSACTIONS — ADD/EDIT
// ============================================

function openAddTransaction(type = 'expense') {
    state.currentType = type;
    state.selectedCategory = null;

    // Reset form
    document.getElementById('transactionForm').reset();
    document.getElementById('txDate').value = getTodayStr();

    switchTransactionType(type);
    renderCategoryGrid();
    populateAccountSelect();

    document.getElementById('addModal').classList.add('open');
    document.getElementById('fabBtn').classList.add('open');

    setTimeout(() => document.getElementById('txAmount').focus(), 400);
}

function closeAddTransaction() {
    document.getElementById('addModal').classList.remove('open');
    document.getElementById('fabBtn').classList.remove('open');
}

function switchTransactionType(type) {
    state.currentType = type;
    state.selectedCategory = null;

    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.modal-tab[data-type="${type}"]`).classList.add('active');

    document.getElementById('modalTitle').textContent = type === 'expense' ? 'Add Expense' : 'Add Income';
    document.getElementById('submitBtn').querySelector('span').textContent = type === 'expense' ? 'Add Expense' : 'Add Income';

    renderCategoryGrid();
}

function renderCategoryGrid() {
    const cats = CATEGORIES[state.currentType] || CATEGORIES.expense;
    const grid = document.getElementById('categoryGrid');

    grid.innerHTML = cats.map(cat => `
        <button type="button" class="cat-btn ${state.selectedCategory === cat.id ? 'selected' : ''}"
            onclick="selectCategory('${cat.id}')">
            <span class="cat-btn-icon">${cat.icon}</span>
            <span class="cat-btn-name">${cat.name}</span>
        </button>
    `).join('');
}

function selectCategory(catId) {
    state.selectedCategory = catId;
    renderCategoryGrid();
}

function populateAccountSelect() {
    const select = document.getElementById('txAccount');
    select.innerHTML = state.accounts.map(acc =>
        `<option value="${acc.id}">${ACCOUNT_ICONS[acc.type]} ${acc.name}</option>`
    ).join('');
}

function saveTransaction(e) {
    e.preventDefault();

    if (!state.selectedCategory) {
        showToast('Please select a category');
        return;
    }

    const amount = parseFloat(document.getElementById('txAmount').value);
    const description = document.getElementById('txDescription').value.trim();
    const accountId = document.getElementById('txAccount').value;
    const date = document.getElementById('txDate').value;

    const tx = {
        id: 'tx_' + Date.now(),
        type: state.currentType,
        amount,
        description,
        category: state.selectedCategory,
        accountId,
        date
    };

    state.transactions.push(tx);

    // Update account balance
    const acc = state.accounts.find(a => a.id === accountId);
    if (acc) {
        if (state.currentType === 'expense') {
            acc.balance -= amount;
        } else {
            acc.balance += amount;
        }
    }

    saveState();
    closeAddTransaction();
    renderAll();
    showToast(state.currentType === 'expense' ? '💸 Expense added!' : '💰 Income added!');
}

// ============================================
// ACCOUNTS — ADD
// ============================================

function openAddAccount() {
    document.getElementById('accountForm').reset();
    document.getElementById('accountModal').classList.add('open');
}

function closeAddAccount() {
    document.getElementById('accountModal').classList.remove('open');
}

function saveAccount(e) {
    e.preventDefault();

    const name = document.getElementById('accName').value.trim();
    const type = document.getElementById('accType').value;
    const balance = parseFloat(document.getElementById('accBalance').value) || 0;

    const acc = {
        id: 'acc_' + Date.now(),
        name,
        type,
        balance
    };

    state.accounts.push(acc);
    saveState();
    closeAddAccount();
    renderAll();
    showToast('🏦 Account added!');
}

// ============================================
// SETTINGS
// ============================================

function editProfile() {
    document.getElementById('userName').value = state.userName;
    document.getElementById('nameModal').classList.add('open');
}

function closeNameModal() {
    document.getElementById('nameModal').classList.remove('open');
}

function saveName(e) {
    e.preventDefault();
    state.userName = document.getElementById('userName').value.trim() || 'User';
    saveState();
    renderSettings();
    closeNameModal();
    showToast('✅ Name updated!');
}

function exportData() {
    const data = JSON.stringify({
        userName: state.userName,
        accounts: state.accounts,
        transactions: state.transactions,
        exportDate: new Date().toISOString()
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paisa_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 Data exported!');
}

function importData() {
    document.getElementById('importInput').click();
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (data.accounts && data.transactions) {
                state.userName = data.userName || 'User';
                state.accounts = data.accounts;
                state.transactions = data.transactions;
                saveState();
                renderAll();
                showToast('📥 Data imported!');
            } else {
                showToast('❌ Invalid file format');
            }
        } catch {
            showToast('❌ Failed to parse file');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function clearAllData() {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
        state.accounts = [];
        state.transactions = [];
        state.userName = 'User';
        saveState();
        renderAll();
        showToast('🗑️ All data cleared');
    }
}

// ============================================
// UTILITIES
// ============================================

function formatCurrency(amount) {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    });
    return (isNegative ? '-₹' : '₹') + formatted;
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

function getDaysAgoStr(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}

function getDateLabel(dateStr) {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getMonthTransactions() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    return state.transactions.filter(t => t.date >= firstOfMonth);
}

function updateTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const h12 = h % 12 || 12;
    const timeStr = `${h12}:${m}`;
    document.querySelectorAll('.status-time').forEach(el => el.textContent = timeStr);
}

function updateGreeting() {
    const h = new Date().getHours();
    let greeting = 'GOOD MORNING';
    if (h >= 12 && h < 17) greeting = 'GOOD AFTERNOON';
    else if (h >= 17) greeting = 'GOOD EVENING';
    document.getElementById('greetingText').textContent = greeting;
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}
