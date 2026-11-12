// --- Estado de la Aplicación ---
let state = {
    budget: 0,
    expenses: []
};

// --- Elementos del DOM ---
const budgetInput = document.getElementById('monthly-budget');
const setBudgetBtn = document.getElementById('set-budget-btn');
const remainingBalanceEl = document.getElementById('remaining-balance');
const dailyLimitEl = document.getElementById('daily-limit');
const daysLeftText = document.getElementById('days-left-text');

const expenseForm = document.getElementById('expense-form');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategorySelect = document.getElementById('expense-category');
const expenseDescInput = document.getElementById('expense-desc');

const expenseList = document.getElementById('expense-list');
const noExpensesEl = document.getElementById('no-expenses');
const clearHistoryBtn = document.getElementById('clear-history');

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    render();
});

// --- Lógica de Negocio ---

function loadFromLocalStorage() {
    const savedState = localStorage.getItem('gastofacil_state');
    if (savedState) {
        state = JSON.parse(savedState);
        budgetInput.value = state.budget;
    }
}

function saveToLocalStorage() {
    localStorage.setItem('gastofacil_state', JSON.stringify(state));
}

function calculateMetrics() {
    const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = state.budget - totalExpenses;

    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = (lastDayOfMonth - currentDay) + 1; // Incluyendo hoy

    const dailyLimit = remaining > 0 ? (remaining / daysRemaining) : 0;

    return {
        remaining,
        dailyLimit,
        daysRemaining
    };
}

// --- Event Listeners ---

setBudgetBtn.addEventListener('click', () => {
    const val = parseFloat(budgetInput.value);
    if (!isNaN(val) && val >= 0) {
        state.budget = val;
        saveToLocalStorage();
        render();
    }
});

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(expenseAmountInput.value);
    const category = expenseCategorySelect.value;
    const desc = expenseDescInput.value.trim() || category;

    if (amount > 0 && category) {
        const newExpense = {
            id: Date.now(),
            amount,
            category,
            desc,
            date: new Date().toLocaleDateString()
        };

        state.expenses.unshift(newExpense); // Agregar al principio
        saveToLocalStorage();
        render();
        expenseForm.reset();
    }
});

function deleteExpense(id) {
    state.expenses = state.expenses.filter(exp => exp.id !== id);
    saveToLocalStorage();
    render();
}

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los gastos?')) {
        state.expenses = [];
        saveToLocalStorage();
        render();
    }
});

// --- Renderizado ---

function render() {
    const { remaining, dailyLimit, daysRemaining } = calculateMetrics();

    // Actualizar Métricas
    remainingBalanceEl.textContent = `$${remaining.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dailyLimitEl.textContent = `$${dailyLimit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    daysLeftText.textContent = `Quedan ${daysRemaining} días del mes`;

    // Cambiar color si el saldo es negativo
    remainingBalanceEl.style.color = remaining < 0 ? 'var(--danger)' : 'var(--secondary)';

    // Renderizar Lista
    expenseList.innerHTML = '';
    
    if (state.expenses.length === 0) {
        noExpensesEl.style.display = 'block';
    } else {
        noExpensesEl.style.display = 'none';
        state.expenses.forEach(exp => {
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.innerHTML = `
                <div class="expense-info">
                    <h4>${exp.desc}</h4>
                    <small>${exp.category} • ${exp.date}</small>
                </div>
                <div class="expense-amount-action">
                    <span class="expense-val">-$${exp.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    <button class="delete-btn" onclick="deleteExpense(${exp.id})">Eliminar</button>
                </div>
            `;
            expenseList.appendChild(li);
        });
    }
}
