// Main JavaScript for AMA-UK

document.addEventListener("DOMContentLoaded", () => {
    console.log("AMA Website Loaded");
    loadContent();

    // Header Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg');
            navbar.classList.replace('bg-brand-navy/80', 'bg-brand-navy/95');
        } else {
            navbar.classList.remove('shadow-lg');
            navbar.classList.replace('bg-brand-navy/95', 'bg-brand-navy/80');
        }
    });
});

async function loadContent() {
    const bulletinContainer = document.getElementById('bulletin-container');
    const eventsContainer = document.getElementById('events-container');

    try {
        const response = await fetch('assets/data/posts.json');
        if (!response.ok) throw new Error('Failed to load data');
        const data = await response.json();

        // Render Bulletins
        if (data.bulletins && data.bulletins.length > 0) {
            bulletinContainer.innerHTML = data.bulletins.map(post => `
                <div class="glass p-6 rounded-xl transition-all duration-300 hover:bg-white/5 border border-white/5 group" data-aos="fade-up">
                    <div class="flex items-start justify-between mb-3">
                        <span class="text-xs font-semibold px-2 py-1 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/20 uppercase tracking-wider">
                            ${post.type || 'Update'}
                        </span>
                        <span class="text-xs text-gray-400 font-mono">${formatDate(post.date)}</span>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-white group-hover:text-brand-gold transition-colors">${post.title}</h3>
                    <p class="text-gray-300 leading-relaxed text-sm md:text-base">${post.content}</p>
                </div>
            `).join('');
        } else {
            bulletinContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No recent bulletins.</p>';
        }

        // Render Upcoming Events
        if (data.upcoming_events && data.upcoming_events.length > 0) {
            eventsContainer.innerHTML = data.upcoming_events.map(event => `
                <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <div class="bg-brand-navy text-center p-2 rounded border border-white/10 min-w-[60px]">
                        <span class="block text-xs text-brand-gold font-bold uppercase">${getMonth(event.date)}</span>
                        <span class="block text-xl font-bold text-white">${getDay(event.date)}</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-white hover:text-brand-accentBlue transition-colors cursor-pointer">${event.title}</h4>
                        <p class="text-xs text-gray-400 mt-1">${event.time || ''}</p>
                    </div>
                </div>
            `).join('');
        } else {
            eventsContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No upcoming events.</p>';
        }

    } catch (error) {
        console.error('Error loading content:', error);
        if (bulletinContainer) bulletinContainer.innerHTML = '<p class="text-red-400 text-center">Failed to load content.</p>';
        if (eventsContainer) eventsContainer.innerHTML = '<p class="text-red-400 text-center">Failed to load events.</p>';
    }
}

// Helper: Format Date (e.g., "2025-01-09" -> "Jan 9, 2025")
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper: Get Month (e.g., "May 28, 2025" -> "MAY")
function getMonth(dateString) {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'MAY' : d.toLocaleString('default', { month: 'short' }).toUpperCase(); // Fallback to hardcoded if parsing fails safely
}

// Helper: Get Day (e.g., "May 28, 2025" -> "28")
function getDay(dateString) {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '28' : d.getDate();
}

/**
 * Handle Contact/Newsletter Form Submission
 * @param {Event} event 
 */
async function sendEmail(event) {
    event.preventDefault();

    const form = event.target;
    // Basic differentiation: "newsletter" vs "contact"
    // We can check form ID or fields
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // UI Feedback Elements
    const btn = form.querySelector('button[type="submit"]');
    // Try to find a status element. If none exists, create one or use alert/fallback.
    let statusMsg = form.querySelector('p[id$="Status"]');
    if (!statusMsg) {
        // Create one dynamically if missing (common in newsletter form)
        statusMsg = document.createElement('p');
        statusMsg.className = "text-center text-sm mt-2";
        form.appendChild(statusMsg);
    }

    // specific subject handling
    if (!data.message && data.email && form.id === 'newsletterForm') {
        data.subject = "New Newsletter Subscription";
        data.message = "Please subscribe me to the newsletter.";
        data.name = "Subscriber";
    }

    const originalBtnText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Sending...";
    statusMsg.innerText = "";
    statusMsg.className = "text-center text-sm mt-2"; // Reset classes

    try {
        // Use the form's action attribute (Formspree)
        const apiPath = form.action;

        const response = await fetch(apiPath, {
            method: 'POST',
            body: formData, // Formspree accepts FormData directly or JSON
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            statusMsg.innerText = "Message sent successfully!";
            statusMsg.classList.add("text-green-400");
            form.reset();
        } else {
            // Formspree error handling
            if (Object.hasOwn(result, 'errors')) {
                const errorMessages = result.errors.map(error => error.message).join(", ");
                throw new Error(errorMessages);
            } else {
                throw new Error("Failed to send");
            }
        }
    } catch (error) {
        console.error(error);
        statusMsg.innerText = "Error: " + error.message;
        statusMsg.classList.add("text-red-400");
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
            // Clear success message after a while
            if (statusMsg.classList.contains("text-green-400")) {
                setTimeout(() => statusMsg.innerText = "", 5000);
            }
        }, 1000);
    }
}
