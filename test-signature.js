// Test PayOS signature generation
const crypto = require('crypto');

const testData = {
  orderCode: 860284,
  amount: 10000,
  description: "nap tien 25b7d2951dec429b9",
  returnUrl: "http://localhost:3000/thanh-toan-thanh-cong",
  cancelUrl: "http://localhost:3000/thanh-toan-that-bai"
};

const checksumKey = "3ca07dcfe14d4db6063a4c3c1c6e0559e395dc291fe776fdf28d07ce7c4085bb";

// Test different formats
const formats = [
  `${testData.orderCode}${testData.amount}${testData.description}${testData.returnUrl}${testData.cancelUrl}`,
  `${testData.orderCode}${testData.amount}${testData.description}${testData.cancelUrl}${testData.returnUrl}`,
  `${testData.orderCode}${testData.amount}${testData.description.trim()}${testData.returnUrl}${testData.cancelUrl}`,
  `${testData.orderCode}${testData.amount}${testData.description.trim()}${testData.cancelUrl}${testData.returnUrl}`
];

formats.forEach((format, index) => {
  const signature = crypto.createHmac('sha256', checksumKey).update(format).digest('hex');
  console.log(`Format ${index + 1}: ${format}`);
  console.log(`Signature ${index + 1}: ${signature}`);
  console.log('---');
});