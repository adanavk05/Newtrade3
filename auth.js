import { 
  auth, 
  googleProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  getDoc,
  generateRefCode
} from './firebase.js';

// Переключение между вкладками
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    if (button.id === 'login-tab') {
      document.getElementById('login-form').classList.remove('hidden');
      document.getElementById('register-form').classList.add('hidden');
    } else {
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('register-form').classList.remove('hidden');
    }
  });
});

// Вход через Google
document.getElementById('google-login').addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
});

// Регистрация через email
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target['register-email'].value;
  const password = e.target['register-password'].value;
  const name = e.target['register-name'].value;
  const refCode = e.target['register-ref'].value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      name,
      balance: 0,
      vipLevel: 1,
      refCode: generateRefCode(),
      referredBy: refCode || null,
      createdAt: serverTimestamp()
    });

    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Ошибка регистрации: ' + error.message);
  }
});

// Вход через email
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target['login-email'].value;
  const password = e.target['login-password'].value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Ошибка входа: ' + error.message);
  }
});

// Сброс пароля
document.getElementById('reset-password').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = prompt('Введите ваш email:');
  if (email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Письмо для сброса пароля отправлено!');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  }
});