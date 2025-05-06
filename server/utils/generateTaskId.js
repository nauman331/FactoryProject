const Product = require('../models/Job'); // Adjust path as needed

const generateUniqueTaskId = async () => {
  let isUnique = false;
  let JobId;

  while (!isUnique) {
    const sixDigit = Math.floor(100000 + Math.random() * 900000);
    JobId = `AI-${sixDigit}`;
    const existing = await Product.findOne({ JobId });
    if (!existing) {
      isUnique = true;
    }
  }

  return JobId;
};

module.exports = generateUniqueTaskId;
