const previousOperationText = document.getElementById('previous-operation');
const currentOperationText = document.getElementById('current-operation');
const buttons = document.querySelectorAll('#buttons-container button');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const voiceCommandToggle = document.getElementById('voice-command-toggle');
const voiceFeedback = document.getElementById('voice-feedback');

let currentOperation = '';
let previousOperation = '';
let operation = undefined;

function clear() {
  currentOperation = '';
  previousOperation = '';
  operation = undefined;
  updateDisplay();
}

function deleteNumber() {
  currentOperation = currentOperation.toString().slice(0, -1);
  updateDisplay();
}

function appendNumber(number) {
  if (number === '.' && currentOperation.includes('.')) return;
  currentOperation = currentOperation.toString() + number.toString();
  updateDisplay();
}

function chooseOperation(op) {
  if (currentOperation === '') return;
  if (previousOperation !== '') {
    calculate();
  }
  operation = op;
  previousOperation = currentOperation;
  currentOperation = '';
  updateDisplay();
}

function calculate() {
  let result;
  const prev = parseFloat(previousOperation);
  const curr = parseFloat(currentOperation);
  if (isNaN(prev) || isNaN(curr)) return;

  switch (operation) {
    case '+':
      result = prev + curr;
      break;
    case '-':
      result = prev - curr;
      break;
    case '*':
      result = prev * curr;
      break;
    case '/':
      result = prev / curr;
      break;
    default:
      return;
  }
  currentOperation = result;
  operation = undefined;
  previousOperation = '';
  updateDisplay();
}

function updateDisplay() {
  currentOperationText.innerText = currentOperation;
  previousOperationText.innerText = previousOperation + ' ' + (operation || '');
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.textContent.match(/[0-9]/) || button.textContent === '.') {
      appendNumber(button.textContent);
    } else if (button.textContent === 'CE') {
      clear();
    } else if (button.textContent === 'C') {
      clear();
    } else if (button.textContent === 'DEL') {
      deleteNumber();
    } else if (button.textContent === '=') {
      calculate();
    } else {
      chooseOperation(button.textContent);
    }
  });
});

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  buttons.forEach(button => button.classList.toggle('dark-mode'));
});

// Verificação de suporte e inicialização do reconhecimento de voz
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;

  recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    voiceFeedback.textContent = `Comando reconhecido: "${transcript}"`;
    handleVoiceCommand(transcript);
  });

  recognition.addEventListener('end', () => {
    if (voiceCommandToggle.textContent === 'Desativar Comando de Voz') {
      recognition.start();
    }
  });

  voiceCommandToggle.addEventListener('click', () => {
    if (voiceCommandToggle.textContent === 'Ativar Comando de Voz') {
      recognition.start();
      voiceCommandToggle.textContent = 'Desativar Comando de Voz';
    } else {
      recognition.stop();
      voiceCommandToggle.textContent = 'Ativar Comando de Voz';
    }
  });
} else {
  voiceFeedback.textContent = "Comando de voz não é suportado neste navegador.";
  voiceCommandToggle.style.display = 'none';
}

function handleVoiceCommand(command) {
  // Remover caracteres indesejados
  command = command.replace(/[^a-z0-9+\-*/.]/g, '');

  // Mapeamento dos comandos de voz para números e operações
  const numberMap = {
    'zero': '0',
    'um': '1',
    'dois': '2',
    'três': '3',
    'quatro': '4',
    'cinco': '5',
    'seis': '6',
    'sete': '7',
    'oito': '8',
    'nove': '9',
    'ponto': '.'
  };

  const operationMap = {
    'mais': '+',
    'menos': '-',
    'vezes': '*',
    'dividido': '/'
  };

  Object.keys(numberMap).forEach(word => {
    command = command.replace(word, numberMap[word]);
  });

  Object.keys(operationMap).forEach(word => {
    command = command.replace(word, operationMap[word]);
  });

  // Interpretando o comando como uma expressão matemática
  try {
    // Verifica se o comando inclui uma expressão matemática válida
    if (command.match(/[0-9+\-*/.]/)) {
      currentOperation = eval(command).toString();
      updateDisplay();
    } else if (command.includes('limpar')) {
      clear();
    } else if (command.includes('apagar') || command.includes('del')) {
      deleteNumber();
    } else if (command.includes('igual') || command.includes('resultado')) {
      calculate();
    }
  } catch (error) {
    voiceFeedback.textContent = 'Comando inválido.';
  }
}
