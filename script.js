(() => {
  const config = window.TRIP_CONFIG || {};
  const translations = window.SITE_TRANSLATIONS || {};
  const byId = (id) => document.getElementById(id);
  let currentLang = "kk";
  const t = (path) => path.split(".").reduce((value, key) => value?.[key], translations[currentLang]);
  const configValue = (key) => {
    const value = String(config[key] || "").trim();
    return value || t("program.placeholder");
  };

  byId("year").textContent = new Date().getFullYear();

  const programKeys = ["departureDate", "duration", "departureCity", "sanatorium", "price", "included"];
  const renderProgram = () => {
    byId("program-details").innerHTML = programKeys.map((key, index) => {
      const value = configValue(key);
      const isPlaceholder = !String(config[key] || "").trim();
      return `<div class="program-row"><span class="program-label">${escapeHtml(t("program.labels")[index])}</span><span class="program-value${isPlaceholder ? " is-placeholder" : ""}">${escapeHtml(value)}</span></div>`;
    }).join("");
  };

  const renderPeopleOptions = () => {
    const values = ["1", "2", "3", "4", "5+"];
    const select = document.querySelector('[name="people"]');
    const selected = select.value || "1";
    select.innerHTML = t("form.peopleOptions").map((label, index) => `<option value="${values[index]}">${escapeHtml(label)}</option>`).join("");
    select.value = selected;
  };

  const whatsappDigits = String(config.whatsappNumber || "").replace(/\D/g, "");
  const whatsappNumber = /^\d{7,15}$/.test(whatsappDigits) ? whatsappDigits : "";
  const makeWhatsAppUrl = (message) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const safeExternalUrl = (value) => {
    try {
      const url = new URL(String(value || ""));
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  };
  const quickContact = byId("footer-contact");
  const floatingContact = byId("floating-whatsapp");
  const updateContactLinks = () => {
    if (whatsappNumber) {
      const url = makeWhatsAppUrl(t("ui.genericMessage"));
      [quickContact, floatingContact].forEach((link) => {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("title");
      });
    } else {
      [quickContact, floatingContact].forEach((link) => {
        link.href = "#booking";
        link.removeAttribute("target");
        link.removeAttribute("rel");
      });
      quickContact.title = t("ui.whatsappMissing");
    }
  };

  const phone = String(config.phone || "").trim();
  if (phone) {
    const phoneBlock = document.createElement("a");
    phoneBlock.href = `tel:${phone.replace(/[^+\d]/g, "")}`;
    phoneBlock.textContent = phone;
    phoneBlock.className = "footer-phone";
    byId("contacts").querySelector(".footer-contact").append(phoneBlock);
  }
  const organizer = String(config.organizer || "").trim();

  const socialLinks = Array.isArray(config.socialLinks) ? config.socialLinks : [];
  if (socialLinks.length) {
    const social = document.createElement("div");
    social.className = "social-links";
    social.setAttribute("aria-label", "Social media");
    socialLinks.forEach(({ label, url }) => {
      const safeUrl = safeExternalUrl(url);
      if (!String(label || "").trim() || !safeUrl) return;
      const link = document.createElement("a");
      link.href = safeUrl;
      link.textContent = String(label).trim().slice(0, 40);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      social.append(link);
    });
    byId("contacts").querySelector(".footer-main").append(social);
  }

  const renderGallery = () => {
    document.querySelectorAll(".gallery-item").forEach((item, index) => {
      const content = t("gallery.items")[index];
      item.dataset.caption = content.description;
      item.querySelector("img").alt = content.alt;
      item.querySelector(".gallery-caption span").textContent = content.caption;
    });
  };

  const applyLanguage = (language) => {
    if (!translations[language]) return;
    currentLang = language;
    document.documentElement.lang = language;
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]').content = t("meta.description");
    document.querySelector('meta[property="og:title"]').content = t("meta.title");
    document.querySelector('meta[property="og:description"]').content = t("meta.description");
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((element) => { element.innerHTML = t(element.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const active = button.dataset.lang === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelector(".skip-link").textContent = t("ui.skip");
    document.querySelector(".site-header .brand").setAttribute("aria-label", t("ui.home"));
    document.querySelector(".language-switcher").setAttribute("aria-label", t("ui.language"));
    byId("main-nav").setAttribute("aria-label", t("ui.navigation"));
    document.querySelector(".hero-photo").setAttribute("aria-label", t("gallery.items")[0].alt);
    document.querySelector(".scroll-cue").setAttribute("aria-label", t("ui.scroll"));
    floatingContact.setAttribute("aria-label", t("ui.whatsapp"));
    byId("lightbox").setAttribute("aria-label", t("gallery.title"));
    byId("lightbox").querySelector(".lightbox-close").setAttribute("aria-label", t("ui.close"));
    renderProgram();
    renderPeopleOptions();
    renderGallery();
    updateContactLinks();
    if (organizer) quickContact.textContent = t("footer.organizerContact").replace("{name}", organizer);
    const menuOpen = document.querySelector(".menu-toggle").getAttribute("aria-expanded") !== "true";
    document.querySelector(".menu-toggle").setAttribute("aria-label", menuOpen ? t("ui.menuOpen") : t("ui.menuClose"));
    byId("form-status").textContent = "";
  };

  document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.lang)));
  applyLanguage("kk");

  const menuButton = document.querySelector(".menu-toggle");
  const nav = byId("main-nav");
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", t("ui.menuOpen"));
    nav.classList.remove("is-open");
  };
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? t("ui.menuOpen") : t("ui.menuClose"));
    nav.classList.toggle("is-open", !isOpen);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

  const header = document.querySelector(".site-header");
  const progressBar = document.querySelector(".scroll-progress");
  const hero = document.querySelector(".hero");
  let motionFrame = 0;
  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
  const updateMotion = () => {
    if (motionFrame) return;
    motionFrame = window.requestAnimationFrame(() => {
      updateHeader();
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progressBar?.style.setProperty("--scroll-progress", String(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0));
      if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        hero.style.setProperty("--hero-shift", `${-Math.min(window.scrollY, hero.offsetHeight) * 0.075}px`);
      }
      motionFrame = 0;
    });
  };
  updateMotion();
  window.addEventListener("scroll", updateMotion, { passive: true });
  if (hero && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.025;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.025;
      hero.style.setProperty("--pointer-x", `${x.toFixed(1)}px`);
      hero.style.setProperty("--pointer-y", `${y.toFixed(1)}px`);
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--pointer-x", "0px");
      hero.style.setProperty("--pointer-y", "0px");
    }, { passive: true });
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => observer.observe(element));
  } else revealElements.forEach((element) => element.classList.add("is-visible"));

  const lightbox = byId("lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("p");
  document.querySelectorAll(".gallery-item").forEach((item) => item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.dataset.caption || t("gallery.title");
    lightboxCaption.textContent = item.dataset.caption || "";
    lightbox.showModal();
    document.body.classList.add("no-scroll");
  }));
  const closeLightbox = () => { lightbox.close(); document.body.classList.remove("no-scroll"); };
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener("close", () => document.body.classList.remove("no-scroll"));

  const form = byId("booking-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = byId("form-status");
    if (!whatsappNumber) {
      status.textContent = t("ui.whatsappMissing");
      return;
    }
    const formData = new FormData(form);
    const date = formData.get("date");
    const name = String(formData.get("name") || "").trim().slice(0, 80);
    const phoneValue = String(formData.get("phone") || "").trim().slice(0, 24);
    const allowedPeople = new Set(["1", "2", "3", "4", "5+"]);
    const people = allowedPeople.has(String(formData.get("people"))) ? String(formData.get("people")) : "1";
    const formattedDate = date ? new Date(`${date}T12:00:00`).toLocaleDateString(t("ui.locale"), { year: "numeric", month: "long", day: "numeric" }) : t("ui.noDate");
    const messageText = t("ui.formMessage");
    const message = [
      messageText[0],
      `${messageText[1]}: ${name}`,
      `${messageText[2]}: ${phoneValue}`,
      `${messageText[3]}: ${people}`,
      `${messageText[4]}: ${formattedDate}`
    ].join("\n");
    status.textContent = t("ui.whatsappOpening");
    window.open(makeWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  });

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }
})();
