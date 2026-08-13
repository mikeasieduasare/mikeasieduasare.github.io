javascript id="f6m2pk"
// =========================


// =========================
// CURRENT YEAR
// =========================

// Keep the footer year automatically up to date.
const yearElement = document.querySelector(".site-footer p");

if (yearElement) {
    yearElement.textContent =
        `© ${new Date().getFullYear()} Michael Asiedu Asare`;
}


// =========================
// SUBTLE SCROLL EFFECT
// =========================

// Add a small shadow to the navigation when scrolling.
const header = document.querySelector(".site-header");

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
