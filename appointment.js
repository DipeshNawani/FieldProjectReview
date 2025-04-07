import { db } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize EmailJS
emailjs.init("BzUocemCmmCy6o01h");

// Make functions globally accessible
window.openForm = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";
    } else {
        console.error(`Modal ${modalId} not found`);
    }
}

window.closeForm = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Function to send email
function sendEmail(userName, userEmail, doctorName, appointmentDate) {
    emailjs.send("service_5zalwdy", "template_bavrthj", {
        user_name: userName,
        doctor_name: doctorName,
        appointment_date: appointmentDate,
        to_email: userEmail
    })
    .then(function(response) {
        console.log("Email sent successfully!", response.status, response.text);
    }, function(error) {
        console.error("Failed to send email", error);
    });
}

// Function to save appointment to Firestore
async function saveAppointment(appointment) {
    try {
        const docRef = await addDoc(collection(db, 'appointments'), appointment);
        console.log("Appointment saved with ID:", docRef.id);
        return true;
    } catch (error) {
        console.error("Error saving appointment:", error);
        return false;
    }
}

// Function to show appointment history
window.showAppointmentHistory = function() {
    const container = document.getElementById("appointmentHistory");
    if (!container) {
        console.error("Appointment history container not found");
        return;
    }

    container.style.textAlign = "center";
    container.style.display = "block";

    try {
        const q = query(collection(db, 'appointments'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                container.innerHTML = "<p>No past appointments found.</p>";
                return;
            }

            let html = "<h3>Your Past Appointments:</h3><div style='display: inline-block; text-align: left;'>";
            snapshot.forEach(doc => {
                const appt = doc.data();
                html += `<li><strong>${appt.doctor}</strong><br>
                         Name: ${appt.name} | Email: ${appt.email} | Date: ${appt.date} <br>
                         <small>Booked on: ${appt.timestamp}</small></li><hr>`;
            });
            html += "</div>";
            container.innerHTML = html;
        }, (error) => {
            console.error("Error fetching appointments:", error);
            container.innerHTML = "<p>Error loading appointments. Please try again.</p>";
        });

        // Cleanup subscription when component unmounts
        return () => unsubscribe();
    } catch (error) {
        console.error("Error setting up appointment listener:", error);
        container.innerHTML = "<p>Error loading appointments. Please try again.</p>";
    }
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Appointment form handlers
    const forms = ['formNaresh', 'formRakesh', 'formBalbir', 'formPankaj'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const name = this.querySelector('input[type="text"]').value;
                const email = this.querySelector('input[type="email"]').value;
                const date = this.querySelector('input[type="date"]').value;
                
                const doctor = formId.replace('form', '');
                const doctorName = {
                    'Naresh': 'Dr. Naresh Trehan',
                    'Rakesh': 'Dr. Rakesh Mahajan',
                    'Balbir': 'Dr. Balbir Singh',
                    'Pankaj': 'Dr. Pankaj Aneja'
                }[doctor];

                const appointment = {
                    doctor: doctorName,
                    name,
                    email,
                    date,
                    timestamp: new Date().toLocaleString()
                };

                const saved = await saveAppointment(appointment);
                if (saved) {
                    sendEmail(name, email, doctorName, date);
                    alert(`Your appointment with ${doctorName} has been booked!`);
                    closeForm(`modal${doctor}`);
                } else {
                    alert("Error booking appointment. Please try again.");
                }
            });
        }
    });

    // Query form handler
    const submitQueryBtn = document.getElementById('submitQuery');
    if (submitQueryBtn) {
        submitQueryBtn.addEventListener('click', async function() {
            const queryInput = document.getElementById('queryInput');
            const query = queryInput.value.trim();
            
            if (query) {
                try {
                    await addDoc(collection(db, 'queries'), {
                        query: query,
                        timestamp: new Date().toLocaleString()
                    });
                    alert('Query submitted successfully!');
                    queryInput.value = '';
                } catch (error) {
                    console.error('Error submitting query:', error);
                    alert('Error submitting query. Please try again.');
                }
            } else {
                alert('Please enter your query.');
            }
        });
    }

    // Contact form handler
    const submitContactBtn = document.getElementById('submitContact');
    if (submitContactBtn) {
        submitContactBtn.addEventListener('click', async function() {
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (name && email && message) {
                try {
                    await addDoc(collection(db, 'contacts'), {
                        name: name,
                        email: email,
                        message: message,
                        timestamp: new Date().toLocaleString()
                    });
                    alert('Message sent successfully!');
                    document.getElementById('contactName').value = '';
                    document.getElementById('contactEmail').value = '';
                    document.getElementById('contactMessage').value = '';
                } catch (error) {
                    console.error('Error sending message:', error);
                    alert('Error sending message. Please try again.');
                }
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
});
  