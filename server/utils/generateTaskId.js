const generateTaskId = () => {
  const base36 = Date.now().toString(36).toUpperCase().slice(-6);
  return `AI-${base36}`;
};

module.exports = generateTaskId;
