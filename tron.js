import TronWeb from 'https://cdn.jsdelivr.net/npm/tronweb@4.1.0/dist/TronWeb.js';

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  headers: { "TRON-PRO-API-KEY": "ваш-api-ключ" }
});

// Проверка баланса USDT
export async function checkUSDTBalance(address) {
  try {
    const contract = await tronWeb.contract().at('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'); // USDT контракт
    const balance = await contract.balanceOf(address).call();
    return tronWeb.fromSun(balance);
  } catch (error) {
    console.error('Ошибка проверки баланса:', error);
    return 0;
  }
}

// Отправка USDT
export async function sendUSDT(toAddress, amount, privateKey) {
  try {
    const contract = await tronWeb.contract().at('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
    const result = await contract.transfer(
      toAddress,
      tronWeb.toSun(amount)
    ).send({
      feeLimit: 100000000,
      callValue: 0,
      shouldPollResponse: true
    });
    return { success: true, txId: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}