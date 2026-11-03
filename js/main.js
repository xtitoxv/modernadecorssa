(() => {
  const config = {
    whatsapp: "",
    whatsappMessage: "Olá! Gostaria de solicitar um orçamento com a MODERNA DECOR.",
    instagram: "",
    ...(window.MODERNA_DECOR_CONFIG || {})
  };

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

  $$("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const whatsappNumber = digitsOnly(config.whatsapp);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`
    : "";

  if (whatsappUrl) {
    $$("[data-whatsapp]").forEach((link) => {
      link.href = whatsappUrl;
    });
  }

  const instagramHandle = String(config.instagram || "").replace(/^@/, "");
  if (instagramHandle) {
    $$("[data-instagram]").forEach((link) => {
      link.href = `https://instagram.com/${instagramHandle}`;
    });
  }

  const header = $("[data-header]");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuToggle = $("[data-menu-toggle]");
  const mobileMenu = $("[data-menu]");
  const pageMain = $("main");
  const pageFooter = $(".site-footer");

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");
    mobileMenu.removeAttribute("inert");
    mobileMenu.setAttribute("aria-hidden", "false");
    if (pageMain) pageMain.inert = true;
    if (pageFooter) pageFooter.inert = true;
    const firstLink = $("a", mobileMenu);
    if (firstLink) window.setTimeout(() => firstLink.focus(), 160);
  };

  const closeMenu = (returnFocus = false) => {
    if (!menuToggle || !mobileMenu) return;
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    mobileMenu.setAttribute("inert", "");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (pageMain) pageMain.inert = false;
    if (pageFooter) pageFooter.inert = false;
    if (returnFocus) menuToggle.focus();
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      if (document.body.classList.contains("menu-open")) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    $$("a", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => closeMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
        closeMenu(true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980 && document.body.classList.contains("menu-open")) {
        closeMenu(false);
      }
    });
  }

  const navLinks = $$(".main-nav a");
  const navMap = {
    inicio: "#inicio",
    servicos: "#servicos",
    adesivos: "#servicos",
    "outros-servicos": "#servicos",
    contato: "#contato"
  };

  if ("IntersectionObserver" in window && navLinks.length) {
    const observedSections = Object.keys(navMap)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = navMap[entry.target.id];
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === target) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const lightbox = $("[data-lightbox]");
  const lightboxTriggers = $$("[data-lightbox-trigger]");

  if (lightbox && lightboxTriggers.length) {
    const lightboxImage = $("[data-lightbox-image]", lightbox);
    const lightboxCaption = $("[data-lightbox-caption]", lightbox);
    const closeButton = $("[data-lightbox-close]", lightbox);
    const placeholder = lightboxImage.getAttribute("src");
    let lastTrigger = null;

    const openLightbox = (trigger) => {
      lastTrigger = trigger;
      lightboxImage.src = trigger.dataset.full || placeholder;
      lightboxImage.alt = trigger.dataset.alt || "";
      if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.caption || "";
      document.body.classList.add("lightbox-open");
      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }
      closeButton.focus();
    };

    const closeLightbox = () => {
      if (typeof lightbox.close === "function" && lightbox.open) {
        lightbox.close();
      } else {
        lightbox.removeAttribute("open");
        document.body.classList.remove("lightbox-open");
        if (lastTrigger) lastTrigger.focus();
      }
    };

    lightboxTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openLightbox(trigger));
    });

    closeButton.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      }
    });

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      lightboxImage.src = placeholder;
      lightboxImage.alt = "";
      if (lastTrigger) lastTrigger.focus();
    });

    lightbox.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeLightbox();
    });
  }
})();
