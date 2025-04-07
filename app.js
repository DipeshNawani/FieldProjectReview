document.getElementById('send-btn').addEventListener('click', () => {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;
    addMessage(userInput, 'user');
    document.getElementById('user-input').value = '';
    // TODO: Connect to backend later
});

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = text;
    msgDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    document.getElementById('chat-messages').appendChild(msgDiv);
}
const voiceBtn = document.getElementById('voice-btn');
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.textContent = "Listening...";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('user-input').value = transcript;
        voiceBtn.textContent = "🎤";
    };

    recognition.onerror = (event) => {
        console.error("Error:", event.error);
        voiceBtn.textContent = "🎤";
    };
} else {
    voiceBtn.disabled = true;
    console.log("Speech recognition not supported");
}
// Replace the placeholder with actual fetch to your backend
async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    addMessage(data.response, 'bot');
  }
  async function sendMessage() {
    try {
      const response = await fetch('http://localhost:3000/chat');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      // ... handle response
    } catch (error) {
      console.error('Fetch failed:', error);
      addMessage("Failed to connect to server", 'error');
    }
  }
  const BACKEND_URL = 'http://localhost:3000';

async function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    addMessage(data.response, 'bot');
  } catch (error) {
    addMessage("Error connecting to server", 'error');
    console.error('Error:', error);
  }
}