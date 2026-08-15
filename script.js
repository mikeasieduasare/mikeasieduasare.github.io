// =========================
// MOBILE NAVIGATION
// =========================

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

if (menuToggle && header) {
    menuToggle.addEventListener("click", () => {
        const isOpen = header.classList.toggle("menu-open");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });
}

mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (!header || !menuToggle) return;

        header.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
});


// =========================
// CURRENT YEAR
// =========================

const yearElement = document.querySelector(".site-footer p");

if (yearElement) {
    yearElement.textContent =
        `© ${new Date().getFullYear()} Michael Asiedu Asare`;
}


// =========================
// HEADER SCROLL STATE
// =========================

window.addEventListener("scroll", () => {
    if (!header) return;

    if (window.scrollY > 20) {
        header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.04)";
    } else {
        header.style.boxShadow = "none";
    }
});


// =========================
// REVEAL ANIMATION
// =========================

const revealElements = document.querySelectorAll(
    ".research-card, .project, .building-content, .writing-content, .about-content"
);

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
});
