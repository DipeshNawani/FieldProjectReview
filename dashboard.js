import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// References to Firestore collections
const healthTipsRef = collection(db, 'healthTips');
const notificationsRef = collection(db, 'notifications');
const userDataRef = collection(db, 'userData');
const queriesRef = collection(db, 'queries');
const contactsRef = collection(db, 'contacts');

// Load health tips
async function loadHealthTips() {
    try {
        const healthTipsList = document.querySelector('.health-tips');
        const q = query(healthTipsRef, orderBy('timestamp', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            healthTipsList.innerHTML = '';
            snapshot.forEach((doc) => {
                const tip = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `${tip.emoji} ${tip.text}`;
                healthTipsList.appendChild(li);
            });
        });
    } catch (error) {
        console.error("Error loading health tips:", error);
    }
}

// Add new health tip
async function addHealthTip(emoji, text) {
    try {
        await addDoc(healthTipsRef, {
            emoji: emoji,
            text: text,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Error adding health tip:", error);
    }
}

// Add new notification
async function addNotification(title, message, imageUrl) {
    try {
        await addDoc(notificationsRef, {
            title: title,
            message: message,
            imageUrl: imageUrl,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Error adding notification:", error);
    }
}

// Update user data
async function updateUserData(data) {
    try {
        await addDoc(userDataRef, {
            ...data,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const notificationContainer = document.querySelector('.notification');
        const q = query(notificationsRef, orderBy('timestamp', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            snapshot.forEach((doc) => {
                const notification = doc.data();
                notificationContainer.innerHTML = `
                    <img src="${notification.imageUrl || 'bf5c8787-0fbe-4640-b36a-da81f4aaeb66.png'}" alt="HealSmart Logo" class="notif-logo">
                    <div class="notif-text">
                        <span class="notif-title">${notification.title || 'HealSmart'}</span>
                        <p>${notification.message}</p>
                    </div>
                `;
            });
        });
    } catch (error) {
        console.error("Error loading notifications:", error);
    }
}

// Handle query submission
async function handleQuerySubmit(event) {
    event.preventDefault();
    const queryInput = document.querySelector('.query-box input[type="text"]');
    const queryText = queryInput.value.trim();

    if (queryText) {
        try {
            await addDoc(queriesRef, {
                query: queryText,
                timestamp: new Date(),
                status: 'pending'
            });
            queryInput.value = '';
            alert('Your query has been submitted successfully!');
        } catch (error) {
            console.error("Error submitting query:", error);
            alert('Error submitting query. Please try again.');
        }
    }
}

// Handle contact form submission
async function handleContactSubmit(event) {
    event.preventDefault();
    const nameInput = document.querySelector('.contact-box input[type="text"]');
    const emailInput = document.querySelector('.contact-box input[type="email"]');
    const messageInput = document.querySelector('.contact-box textarea');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (name && email && message) {
        try {
            await addDoc(contactsRef, {
                name: name,
                email: email,
                message: message,
                timestamp: new Date(),
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
}

// Initialize dashboard
async function initializeDashboard() {
    // Load initial data
    await loadHealthTips();
    await loadNotifications();

    // Add some default health tips if none exist
    const tipsSnapshot = await getDocs(healthTipsRef);
    if (tipsSnapshot.empty) {
        const defaultTips = [
            { emoji: '🥦', text: 'Eat a balanced diet rich in vegetables and proteins.' },
            { emoji: '🚶', text: 'Walk at least 10,000 steps a day for a healthy heart.' },
            { emoji: '🛌', text: 'Get 7-8 hours of sleep for proper brain function.' },
            { emoji: '🧘', text: 'Reduce stress with meditation or deep breathing.' }
        ];

        for (const tip of defaultTips) {
            await addHealthTip(tip.emoji, tip.text);
        }
    }

    // Add a default notification if none exist
    const notifSnapshot = await getDocs(notificationsRef);
    if (notifSnapshot.empty) {
        await addNotification(
            'HealSmart',
            '💡 Stay hydrated! Drink at least 8 glasses of water daily.',
            'bf5c8787-0fbe-4640-b36a-da81f4aaeb66.png'
        );
    }

    // Add event listeners for footer forms
    const queryForm = document.querySelector('.query-box form');
    const contactForm = document.querySelector('.contact-box form');

    if (queryForm) {
        queryForm.addEventListener('submit', handleQuerySubmit);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Export functions for use in other files
export { addHealthTip, addNotification, updateUserData };
