let counter = 0;

const generateTaskId = () => {
  counter += 1;
  const formatted = String(counter).padStart(5, '0');
  return `AI - ${formatted}`;
};

module.exports = generateTaskId;
