/* ===============================
   1. Navbar Scroll Effect
   Adds a dark background and shadow when scrolling
=============================== */
window.addEventListener("scroll", function () {
    const navbar = document.getElementById("mainNavbar");

    if (window.scrollY > 50) {
        // User scrolled down: add dark background and shadow
        navbar.classList.add("scrolled", "shadow");
    } else {
        // User scrolled up: remove dark background and shadow
        navbar.classList.remove("scrolled", "shadow");
    }
});



    /* ===============================
   2. Fetch & Render Opening Hours
   Dynamically load opening hours from JSON
   and display in the contact section
=============================== */

    // Fetch Opening Hours from JSON
fetch('assets/data/data.json')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("openingHoursContainer");
        const hours = data.openingHours;

        container.innerHTML = `

        <div class="hero-hours">
            <div class="hours-pill">
                <span class="open-dot"></span>
                Open Today · Mon–Sat ${hours.weekdays.open} – ${hours.weekdays.close}
            </div>
        </div>
        `;
    })
    .catch(error => console.error("Error loading opening hours:", error));


    /* ===============================
   3. Search Bar Toggle
    Show/hide search bar when search icon is clicked
    =============================== */

// Toggle search bar visibility
    function toggleSearch() {
        var searchBar = document.getElementById("searchBar");

        if (searchBar.style.display === "block") {
            searchBar.style.display = "none";
        } else {
            searchBar.style.display = "block";
        }
    }


    
    /* ===============================
   4. AI Chat Widget
    Simple toggle and message handling for the chat widget
=============================== */

    // AI Chat Widget Functionality
    const chatWidget = document.getElementById('aiChatWidget');
    const chatHeader = document.getElementById('chatHeader');
    const chatBody = document.getElementById('chatBody');
    const chatToggle = document.getElementById('chatToggle');
    const sendBtn = document.getElementById('sendMsg');
    const userInput = document.getElementById('userMessage');
    const chatMessages = document.getElementById('chatMessages');

    // Toggle chat open/close
    chatHeader.addEventListener('click', () => {
        chatBody.style.display = chatBody.style.display === 'flex' ? 'none' : 'flex';
    });

    // Close button
    chatToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        chatBody.style.display = 'none';
    });

    // Send user message
    sendBtn.addEventListener('click', () => {
        let msg = userInput.value.trim();
        if(msg === "") return;

        // Add user message
        const userMsgEl = document.createElement('p');
        userMsgEl.classList.add('user-msg');
        userMsgEl.textContent = msg;
        chatMessages.appendChild(userMsgEl);
        userInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simple bot reply
        setTimeout(() => {
            const botMsgEl = document.createElement('p');
            botMsgEl.classList.add('bot-msg');
            botMsgEl.textContent = "Thanks for your message! We'll get back to you soon.";
            chatMessages.appendChild(botMsgEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800);
    });

    // Press Enter key
    userInput.addEventListener('keypress', function(e){
        if(e.key === 'Enter') sendBtn.click();
    });




