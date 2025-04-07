// Initialize Firebase
const db = firebase.firestore();
const auth = firebase.auth();

// Cart functionality
let cart = [];
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cartSidebar');

// Initialize cart from Firebase
async function initializeCart() {
    try {
        const user = auth.currentUser;
        if (user) {
            const cartRef = db.collection('carts').doc(user.uid);
            const cartDoc = await cartRef.get();
            if (cartDoc.exists) {
                cart = cartDoc.data().items || [];
                updateCartDisplay();
            }
        }
    } catch (error) {
        console.error('Error initializing cart:', error);
    }
}

// Add to cart function
async function addToCart(product) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Please sign in to add items to cart');
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        // Update Firebase
        const cartRef = db.collection('carts').doc(user.uid);
        await cartRef.set({ items: cart });

        updateCartDisplay();
        alert('Item added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
    }
}

// Update cart display
function updateCartDisplay() {
    cartItems.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price} x ${item.quantity}</p>
            </div>
            <button onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
        count += item.quantity;
    });

    cartTotal.textContent = `Total: ₹${total}`;
    cartCount.textContent = count;
}

// Remove from cart
async function removeFromCart(productId) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        cart = cart.filter(item => item.id !== productId);
        
        // Update Firebase
        const cartRef = db.collection('carts').doc(user.uid);
        await cartRef.set({ items: cart });

        updateCartDisplay();
    } catch (error) {
        console.error('Error removing from cart:', error);
        alert('Failed to remove item from cart');
    }
}

// Cart sidebar functions
function openCart() {
    if (cartSidebar) {
        cartSidebar.style.display = 'block';
        cartSidebar.classList.add('active');
    }
}

function closeCart() {
    if (cartSidebar) {
        cartSidebar.style.display = 'none';
        cartSidebar.classList.remove('active');
    }
}

function goToCartPage() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    checkout();
}

// Footer form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    initializeCart();
    
    // Add event listeners for cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const product = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price)
            };
            addToCart(product);
        });
    });
    
    // Add event listeners for footer forms
    const queryForm = document.getElementById('queryForm');
    if (queryForm) {
        queryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = document.getElementById('query').value;
            
            try {
                await db.collection('queries').add({
                    query,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert('Query submitted successfully!');
                document.getElementById('query').value = '';
            } catch (error) {
                console.error('Error submitting query:', error);
                alert('Failed to submit query');
            }
        });
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            try {
                await db.collection('contacts').add({
                    name,
                    email,
                    message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert('Message sent successfully!');
                contactForm.reset();
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message');
            }
        });
    }
});

// Checkout function
async function checkout() {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Please sign in to checkout');
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Create order in Firebase
        const orderRef = db.collection('orders').doc();
        const orderData = {
            userId: user.uid,
            items: cart,
            total: calculateTotal(),
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            deliveryAddress: '', // You can add address collection later
            paymentStatus: 'pending'
        };

        await orderRef.set(orderData);

        // Clear cart after successful order
        const cartRef = db.collection('carts').doc(user.uid);
        await cartRef.set({ items: [] });
        cart = [];
        updateCartDisplay();

        alert('Order placed successfully! Your order ID is: ' + orderRef.id);
        closeCart();
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('Failed to place order. Please try again.');
    }
}

// Calculate total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Make functions globally accessible
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.closeCart = closeCart;
window.goToCartPage = goToCartPage;
window.initializeCart = initializeCart;
window.openCart = openCart;
window.checkout = checkout;

// Slider functionality
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showNextSlide() {
    if (slides.length > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
}

if (slides.length > 0) {
    setInterval(showNextSlide, 3000); // Change slide every 3 seconds
}


