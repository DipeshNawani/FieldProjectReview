// Initialize Firebase
const db = firebase.firestore();
const auth = firebase.auth();

// Chat elements
let chatBox;
let chatForm;
let userInput;
let sendBtn;
let micBtn;

// Footer form elements
let queryForm;
let contactForm;

// Load existing chat messages
function loadChatMessages() {
    db.collection('chats').orderBy('timestamp', 'asc').onSnapshot(snapshot => {
        chatBox.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageDiv = document.createElement('div');
            messageDiv.className = message.sender === 'user' ? 'user-message' : 'bot-message';
            messageDiv.textContent = `${message.sender === 'user' ? '👤' : '🤖'}: ${message.text}`;
            chatBox.appendChild(messageDiv);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Initialize chat functionality
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    chatBox = document.getElementById('chat-box');
    chatForm = document.getElementById('chat-form');
    userInput = document.getElementById('user-input');
    sendBtn = document.getElementById('send-btn');
    micBtn = document.getElementById('mic-btn');
    queryForm = document.querySelector('.query-box form');
    contactForm = document.querySelector('.contact-box form');

    // Load existing messages
    loadChatMessages();

    // Handle chat form submission
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = userInput.value.trim();
            if (message) {
                try {
                    // Add user message to Firestore
                    await db.collection('chats').add({
                        text: message,
                        sender: 'user',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    // Simulate AI response (replace with actual AI logic)
                    setTimeout(async () => {
                        const response = getAIResponse(message);
                        await db.collection('chats').add({
                            text: response,
                            sender: 'bot',
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }, 1000);

                    userInput.value = '';
                } catch (error) {
                    console.error("Error sending message:", error);
                    alert('Error sending message. Please try again.');
                }
            }
        });
    }

    // Handle voice input
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if ('webkitSpeechRecognition' in window) {
                const recognition = new webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onresult = async (event) => {
                    const transcript = event.results[0][0].transcript;
                    userInput.value = transcript;
                    
                    try {
                        // Add user message to Firestore
                        await db.collection('chats').add({
                            text: transcript,
                            sender: 'user',
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Simulate AI response
                        setTimeout(async () => {
                            const response = getAIResponse(transcript);
                            await db.collection('chats').add({
                                text: response,
                                sender: 'bot',
                                timestamp: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }, 1000);
                    } catch (error) {
                        console.error("Error processing voice input:", error);
                        alert('Error processing voice input. Please try again.');
                    }
                };

                recognition.start();
            } else {
                alert('Speech recognition is not supported in your browser.');
            }
        });
    }

    // Handle query form submission
    if (queryForm) {
        queryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const queryInput = queryForm.querySelector('input[type="text"]');
            const queryText = queryInput.value.trim();

            if (queryText) {
                try {
                    await db.collection('queries').add({
                        query: queryText,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'pending'
                    });
                    queryInput.value = '';
                    alert('Your query has been submitted successfully!');
                } catch (error) {
                    console.error("Error submitting query:", error);
                    alert('Error submitting query. Please try again.');
                }
            }
        });
    }

    // Handle contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const messageInput = contactForm.querySelector('textarea');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            if (name && email && message) {
                try {
                    await db.collection('contacts').add({
                        name: name,
                        email: email,
                        message: message,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'unread'
                    });
                    
                    // Clear form
                    nameInput.value = '';
                    emailInput.value = '';
                    messageInput.value = '';
                    
                    alert('Your message has been sent successfully!');
                } catch (error) {
                    console.error("Error submitting contact form:", error);
                    alert('Error sending message. Please try again.');
                }
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
});

// Simple AI response function (replace with actual AI logic)
function getAIResponse(message) {
    message = message.toLowerCase();
    
    if (message.includes('fever') || message.includes('cold')) {
        return "You may be experiencing flu-like symptoms. Please stay hydrated and consult a doctor if it persists.";
    } else if (message.includes('headache')) {
        return "Try to rest in a quiet dark room. Drink water. If pain continues, consider taking a paracetamol.";
    } else if (message.includes('not feeling well')) {
        return "I'm here for you! Can you tell me more about your symptoms?";
    } else if (message.includes('medicine') || message.includes('tablet')) {
        return "Please consult a certified doctor before taking any medication. I can help guide you to one!";
    } else {
        return "I'm still learning! Could you rephrase or provide more details about your symptoms?";
    }
}

// Clear chat function
window.clearChat = async function() {
    try {
        const chatRef = db.collection('chats');
        const snapshot = await chatRef.get();
        
        // Delete all chat messages
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        // Reset chat box with initial message
        if (chatBox) {
            chatBox.innerHTML = '<div class="bot-message">🤖: Hello! I\'m your AI doctor. How can I help you today?</div>';
        }
        
        alert('Chat history cleared successfully!');
    } catch (error) {
        console.error("Error clearing chat:", error);
        alert('Error clearing chat. Please try again.');
    }
}