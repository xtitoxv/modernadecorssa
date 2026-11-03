(() => {
  const config = {
    whatsapp: "",
    whatsappMessage: "Olá! Gostaria de solicitar um orçamento com a MODERNA DECOR.",
    email: "",
    instagram: "",
    facebook: "",
    formEndpoint: "",
    successMessage: "Obrigado. A MODERNA DECOR entrará em contato pelos dados informados.",
    ...(window.MODERNA_DECOR_CONFIG || {})
  };

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const digitsOnly = (value) => String(value || "").replace(/\D/g, "");
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isLocalPreview = location.protocol === "file:" || ["localhost", "127.0.0.1", ""].includes(location.hostname);

  $$("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const header = $("[data-header]");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
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
    if (firstLink) {
      window.setTimeout(() => firstLink.focus(), 180);
    }
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
  const observedSections = ["inicio", "projetos", "solucoes", "processo", "sobre", "contato"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const currentId = entry.target.id;
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${currentId}`) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const revealItems = $$("[data-reveal]");
  if (revealItems.length) {
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  const filterButtons = $$("[data-filters] .filter");
  const galleryItems = $$("[data-gallery] .gallery__item");
  const gallery = $("[data-gallery]");
  const filterStatus = $("[data-filter-status]");

  const applyFilter = (filter = "todos", shouldScroll = false) => {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    let visibleCount = 0;
    galleryItems.forEach((item) => {
      const matches = filter === "todos" || item.dataset.category === filter;
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (filterStatus) {
      filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "projeto exibido" : "projetos exibidos"}`;
    }

    if (shouldScroll && gallery) {
      const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 96;
      const top = gallery.getBoundingClientRect().top + window.scrollY - headerHeight - 26;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });

  $$("[data-filter-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      applyFilter(link.dataset.filterLink || "todos", true);
    });
  });

  $$("[data-footer-filter]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      applyFilter(link.dataset.footerFilter || "todos", true);
    });
  });

  $$("[data-compare]").forEach((compare) => {
    const range = $("[data-compare-range]", compare);
    if (!range) return;

    const updateComparison = () => {
      const value = Number(range.value);
      compare.style.setProperty("--pos", `${value}%`);
      range.setAttribute("aria-valuetext", `${value}% antes, ${100 - value}% depois`);
    };

    range.addEventListener("input", updateComparison);
    updateComparison();
  });

  const lightbox = $("[data-lightbox]");
  if (lightbox && galleryItems.length) {
    const lightboxImage = $("[data-lightbox-image]", lightbox);
    const lightboxPlaceholder = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    const lightboxTitle = $("[data-lightbox-title]", lightbox);
    const lightboxCategory = $("[data-lightbox-category]", lightbox);
    const lightboxCounter = $("[data-lightbox-counter]", lightbox);
    const closeButton = $("[data-lightbox-close]", lightbox);
    const prevButton = $("[data-lightbox-prev]", lightbox);
    const nextButton = $("[data-lightbox-next]", lightbox);
    let currentIndex = 0;
    let lastTrigger = null;

    const getVisibleItems = () => galleryItems.filter((item) => !item.hidden);

    const renderLightbox = (index) => {
      const visibleItems = getVisibleItems();
      if (!visibleItems.length) return;
      currentIndex = (index + visibleItems.length) % visibleItems.length;
      const item = visibleItems[currentIndex];
      const thumbnail = $("img", item);

      lightboxImage.src = item.dataset.full || lightboxPlaceholder;
      lightboxImage.alt = thumbnail ? thumbnail.alt : (item.dataset.title || "");
      lightboxTitle.textContent = item.dataset.title || "";
      lightboxCategory.textContent = item.dataset.categoryLabel || "";
      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(visibleItems.length).padStart(2, "0")}`;
    };

    const openLightbox = (item) => {
      const visibleItems = getVisibleItems();
      const index = visibleItems.indexOf(item);
      lastTrigger = item;
      renderLightbox(index < 0 ? 0 : index);
      document.body.classList.add("lightbox-open");
      lightbox.showModal();
      closeButton.focus();
    };

    const closeLightbox = () => {
      if (lightbox.open) lightbox.close();
    };

    galleryItems.forEach((item) => {
      item.addEventListener("click", () => openLightbox(item));
    });

    closeButton.addEventListener("click", closeLightbox);
    prevButton.addEventListener("click", () => renderLightbox(currentIndex - 1));
    nextButton.addEventListener("click", () => renderLightbox(currentIndex + 1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        renderLightbox(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        renderLightbox(currentIndex + 1);
      }
    });

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      lightboxImage.src = lightboxPlaceholder;
      if (lastTrigger) lastTrigger.focus();
    });
  }

  const iconWhatsapp = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.1 4 4.1-1.08A9.9 9.9 0 1 0 12.04 2Zm0 18.02a8.1 8.1 0 0 1-4.12-1.13l-.3-.18-2.43.64.65-2.37-.2-.31a8.1 8.1 0 1 1 6.4 3.35Zm4.44-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06a6.62 6.62 0 0 1-1.94-1.2 7.3 7.3 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.4-.55-.41h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>';
  const iconMail = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const iconInstagram = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor"/></svg>';
  const iconFacebook = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M13.7 21v-7.5h2.6l.4-3h-3V8.6c0-.87.24-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.46 4c-2.3 0-3.86 1.4-3.86 3.97v2.53H8v3h2.6V21h3.1Z"/></svg>';

  const whatsappNumber = digitsOnly(config.whatsapp);
  const channels = [];

  const formatWhatsApp = (digits) => {
    if (digits.length === 13 && digits.startsWith("55")) {
      return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    return `+${digits}`;
  };

  if (whatsappNumber) {
    channels.push({
      label: "WhatsApp",
      detail: formatWhatsApp(whatsappNumber),
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`,
      icon: iconWhatsapp,
      external: true
    });
  }

  if (config.email) {
    channels.push({
      label: "E-mail",
      detail: config.email,
      href: `mailto:${config.email}?subject=${encodeURIComponent("Contato pelo site — MODERNA DECOR")}`,
      icon: iconMail,
      external: false
    });
  }

  if (config.instagram) {
    const handle = String(config.instagram).replace(/^@/, "");
    channels.push({
      label: "Instagram",
      detail: `@${handle}`,
      href: `https://instagram.com/${handle}`,
      icon: iconInstagram,
      external: true
    });
  }

  if (config.facebook) {
    const handle = String(config.facebook).replace(/^@/, "");
    channels.push({
      label: "Facebook",
      detail: `@${handle}`,
      href: `https://facebook.com/${handle}`,
      icon: iconFacebook,
      external: true
    });
  }

  if (channels.length) {
    $$("[data-contact-channels]").forEach((container) => {
      container.innerHTML = "";
      channels.forEach((channel) => {
        const link = document.createElement("a");
        link.className = "contact-channel";
        link.href = channel.href;
        if (channel.external) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        link.innerHTML = channel.icon;
        const text = document.createElement("span");
        text.className = "contact-channel__text";
        const label = document.createElement("span");
        label.className = "contact-channel__label";
        label.textContent = channel.label;
        const value = document.createElement("span");
        value.className = "contact-channel__value";
        value.textContent = channel.detail;
        text.append(label, value);
        link.appendChild(text);
        container.appendChild(link);
      });
      container.hidden = false;
    });
  }

  const whatsappFloat = $("[data-whatsapp]");
  if (whatsappFloat) {
    if (whatsappNumber) {
      whatsappFloat.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`;
      whatsappFloat.hidden = false;
    } else {
      whatsappFloat.hidden = true;
    }
  }

  const quoteForm = $("[data-quote-form]");
  const formSuccess = $("[data-form-success]");
  const formError = $("[data-form-error]");
  const formSubmit = $("[data-form-submit]");
  const formReset = $("[data-form-reset]");
  const successMessage = $("[data-success-message]");
  const phoneInput = $("[data-phone]");

  const formatPhone = (value) => {
    const digits = digitsOnly(value).slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const validatePhone = () => {
    if (!phoneInput) return true;
    const digits = digitsOnly(phoneInput.value);
    const valid = digits.length >= 8 && digits.length <= 15;
    phoneInput.setCustomValidity(valid ? "" : "Informe um telefone válido.");
    return valid;
  };

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.setCustomValidity("");
      if (phoneInput.value.includes("+")) return;
      phoneInput.value = formatPhone(phoneInput.value);
    });
    phoneInput.addEventListener("blur", validatePhone);
  }

  const setFormError = (message = "") => {
    if (!formError) return;
    formError.textContent = message;
    formError.hidden = !message;
  };

  const setFormLoading = (loading) => {
    if (!formSubmit) return;
    if (!formSubmit.dataset.label) {
      formSubmit.dataset.label = formSubmit.innerHTML;
    }
    formSubmit.disabled = loading;
    formSubmit.innerHTML = loading ? "Enviando..." : formSubmit.dataset.label;
  };

  const showFormSuccess = (message) => {
    if (!quoteForm || !formSuccess) return;
    quoteForm.hidden = true;
    formSuccess.hidden = false;
    if (successMessage) {
      successMessage.textContent = message || config.successMessage;
    }
    formSuccess.focus({ preventScroll: true });
    formSuccess.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  };

  const buildQuoteMessage = () => {
    if (!quoteForm) return "";
    const data = new FormData(quoteForm);
    const lines = [
      "Nova solicitação de orçamento — MODERNA DECOR",
      `Nome: ${String(data.get("nome") || "").trim()}`,
      `Telefone: ${String(data.get("telefone") || "").trim()}`,
      data.get("email") ? `E-mail: ${String(data.get("email")).trim()}` : "",
      `Ambiente: ${String(data.get("ambiente") || "").trim()}`,
      "",
      `Projeto: ${String(data.get("mensagem") || "").trim()}`
    ];
    return lines.filter((line) => line !== "").join("\n");
  };

  if (quoteForm && formSuccess && formSubmit) {
    quoteForm.addEventListener("input", () => setFormError(""));

    quoteForm.addEventListener("submit", async (event) => {
      setFormError("");

      if (!validatePhone() || !quoteForm.checkValidity()) {
        event.preventDefault();
        quoteForm.reportValidity();
        return;
      }

      const data = new FormData(quoteForm);
      const name = String(data.get("nome") || "").trim();

      if (config.formEndpoint) {
        event.preventDefault();
        setFormLoading(true);
        try {
          const response = await fetch(config.formEndpoint, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" }
          });
          if (!response.ok) throw new Error("Falha no envio");
          showFormSuccess(`Obrigado, ${name}. Sua solicitação foi enviada e a MODERNA DECOR entrará em contato pelos dados informados.`);
        } catch (error) {
          setFormError("Não foi possível enviar a solicitação agora. Tente novamente ou utilize outro canal de contato.");
        } finally {
          setFormLoading(false);
        }
        return;
      }

      if (whatsappNumber) {
        event.preventDefault();
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildQuoteMessage())}`;
        window.open(url, "_blank", "noopener,noreferrer");
        showFormSuccess(`Obrigado, ${name}. Sua solicitação foi preparada no WhatsApp. Se a janela não abrir, verifique o bloqueador de pop-ups.`);
        return;
      }

      if (config.email) {
        event.preventDefault();
        const subject = `Solicitação de orçamento — ${name}`;
        const body = buildQuoteMessage();
        window.location.href = `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        showFormSuccess(`Obrigado, ${name}. Sua solicitação foi preparada no seu aplicativo de e-mail.`);
        return;
      }

      if (isLocalPreview) {
        event.preventDefault();
        showFormSuccess("Pré-visualização concluída: os dados foram validados. Para receber solicitações, publique o site no Netlify ou configure o envio em js/config.js.");
      }
    });

    if (formReset) {
      formReset.addEventListener("click", () => {
        quoteForm.reset();
        quoteForm.hidden = false;
        formSuccess.hidden = true;
        setFormError("");
        setFormLoading(false);
        if (successMessage) successMessage.textContent = config.successMessage;
        const firstField = quoteForm.querySelector("#nome");
        if (firstField) firstField.focus();
      });
    }
  }
})();
