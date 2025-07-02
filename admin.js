import { 
  auth, 
  db, 
  collection, 
  getDocs,
  signOut
} from './firebase.js';

// Выход из админки
document.getElementById('admin-logout').addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'auth.html';
  } catch (error) {
    console.error('Ошибка выхода:', error);
  }
});

// Проверка прав администратора
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'auth.html';
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || !userDoc.data().isAdmin) {
    window.location.href = 'dashboard.html';
    return;
  }

  loadUsers();
  loadStats();
});

// Загрузка пользователей
async function loadUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  const tbody = document.getElementById('users-list');
  tbody.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-700 hover:bg-gray-800';
    tr.innerHTML = `
      <td class="py-3">${doc.id.substring(0, 6)}...</td>
      <td>${data.email}</td>
      <td>${data.balance?.toFixed(2) || 0} USDT</td>
      <td>VIP ${data.vipLevel || 1}</td>
      <td>${data.refCount || 0}</td>
      <td>
        <button class="text-green-400 hover:underline">Изменить</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Загрузка статистики
async function loadStats() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  let totalBalance = 0;
  let vipUsers = 0;
  
  usersSnapshot.forEach(doc => {
    totalBalance += doc.data().balance || 0;
    if (doc.data().vipLevel > 1) vipUsers++;
  });
  
  document.getElementById('total-users').textContent = usersSnapshot.size;
  document.getElementById('total-balance').textContent = totalBalance.toFixed(2) + ' USDT';
  document.getElementById('active-vip').textContent = vipUsers;
}