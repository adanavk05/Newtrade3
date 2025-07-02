import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  signOut,
  updateDoc
} from './firebase.js';

// Выход из системы
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Ошибка выхода:', error);
  }
});

// Загрузка данных пользователя
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    
    // Отображение данных
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-avatar').textContent = userData.name.charAt(0);
    document.getElementById('user-balance').textContent = userData.balance.toFixed(2);
    document.getElementById('user-vip').textContent = `VIP ${userData.vipLevel}`;
    document.getElementById('ref-link').value = `https://newtrade.com/ref/${userData.refCode}`;
    
    // Расчет дохода
    const dailyIncome = calculateDailyIncome(userData.vipLevel, userData.balance);
    document.getElementById('daily-income').textContent = dailyIncome.toFixed(2);
    
    // Загрузка рефералов
    loadReferrals(user.uid, userData.refCode);
    
    // Загрузка транзакций
    loadTransactions(user.uid);
  }
});

// Копирование кошелька
document.getElementById('copy-wallet').addEventListener('click', () => {
  const walletInput = document.querySelector('input[value^="TSJHZ4JnvNTp4oVTokmZP6UFGAn2zfMJsC"]');
  walletInput.select();
  document.execCommand('copy');
  alert('Кошелек скопирован!');
});

// Расчет дневного дохода
function calculateDailyIncome(vipLevel, balance) {
  const rates = { 1: 1.2, 2: 1.5, 3: 1.8, 4: 2.1, 5: 2.4, 6: 2.7, 7: 3.0 };
  return (balance * rates[vipLevel]) / 100;
}

// Загрузка рефералов
async function loadReferrals(userId, refCode) {
  const q = query(collection(db, "users"), where("referredBy", "==", refCode));
  const querySnapshot = await getDocs(q);
  
  document.getElementById('ref-count').textContent = querySnapshot.size;
  document.getElementById('ref-earned').textContent = (querySnapshot.size * 10).toFixed(2);
}

// Загрузка транзакций
async function loadTransactions(userId) {
  const q = query(collection(db, "transactions"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  const tbody = document.getElementById('transactions-list');
  tbody.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-700';
    tr.innerHTML = `
      <td class="py-3">${new Date(data.date.toDate()).toLocaleString()}</td>
      <td>${data.type}</td>
      <td class="${data.type === 'deposit' ? 'text-green-400' : 'text-red-400'}">${data.amount} USDT</td>
      <td>${data.status}</td>
    `;
    tbody.appendChild(tr);
  });
}