import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const cartItemsContainer = document.getElementById('cartItemsContainer');
const totalAmountSpan = document.getElementById('totalAmount');

// Load cart items from Firestore
async function loadCartItems() {
    try {
        const querySnapshot = await getDocs(collection(db, 'cart'));
        let totalPrice = 0;
        cartItemsContainer.innerHTML = '';

        if (querySnapshot.empty) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            totalAmountSpan.textContent = "0";
            return;
        }

        querySnapshot.forEach((doc) => {
            const item = doc.data();
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong> × ${item.quantity}
                    <button onclick="removeItem('${doc.id}')">Remove</button>
                </div>
                <div>₹${itemTotal}</div>
            `;
            cartItemsContainer.appendChild(div);
        });

        totalAmountSpan.textContent = totalPrice;
    } catch (error) {
        console.error("Error loading cart items:", error);
        cartItemsContainer.innerHTML = "<p>Error loading cart items. Please try again.</p>";
    }
}

// Remove item from cart
async function removeItem(itemId) {
    try {
        await deleteDoc(doc(db, 'cart', itemId));
        await loadCartItems();
    } catch (error) {
        console.error("Error removing item:", error);
        alert("Error removing item. Please try again.");
    }
}

// Handle payment method selection
document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        // You can add additional logic here based on the selected payment method
        console.log("Selected payment method:", e.target.value);
    });
});

// Initialize
loadCartItems(); 