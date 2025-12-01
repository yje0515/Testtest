const datasetPathInput = document.getElementById('datasetPath');
const modelSelect = document.getElementById('modelSelect');
const epochInput = document.getElementById('epochInput');
const patienceInput = document.getElementById('patienceInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logOutput = document.getElementById('logOutput');

const appendLog = (text) => {
  logOutput.textContent += `${text}\n`;
  logOutput.scrollTop = logOutput.scrollHeight;
};

window.backend.onLog((data) => {
  appendLog(data.trim());
});

startBtn.addEventListener('click', () => {
  const config = {
    datasetPath: datasetPathInput.value,
    model: modelSelect.value,
    epochs: Number(epochInput.value),
    patience: Number(patienceInput.value),
  };

  appendLog('Starting training...');
  window.backend.startTraining(config);
});

stopBtn.addEventListener('click', () => {
  window.backend.stopTraining();
  appendLog('Stopping training...');
});
