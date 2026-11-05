(function () {
  "use strict";

  var config = window.MODERNA_DECOR_CONFIG || {};
  var whatsapp = String(config.whatsapp || "").replace(/\D/g, "");
  var instagram = String(config.instagram || "").replace(/^@/, "");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function waLink(message) {
    var text = message || config.whatsappMessage || "Olá! Gostaria de solicitar um orçamento com a MODERNA DECOR.";
    return "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(text);
  }

  function serviceMessage(service) {
    return "Olá! Gostaria de solicitar um orçamento para " + service + " com a MODERNA DECOR.";
  }

  function setupLinks() {
    $$("[data-whatsapp]").forEach(function (link) {
      var service = link.getAttribute("data-service");
      link.setAttribute("href", waLink(service ? serviceMessage(service) : config.whatsappMessage));
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    if (instagram) {
      $$("[data-instagram]").forEach(function (link) {
        link.setAttribute("href", "https://instagram.com/" + instagram);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });
    }

    if (config.email) {
      $$('a[href^="mailto:"]').forEach(function (link) {
        link.setAttribute("href", "mailto:" + config.email);
      });
    }
  }

  function setupHeader() {
    var header = $("[data-header]");
    var toTop = $("[data-to-top]");
    var ticking = false;

    function update() {
      var scrolled = window.scrollY > 12;
      if (header) header.classList.toggle("is-scrolled", scrolled);
      if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 600);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  function setupMenu() {
    var toggle = $("[data-menu-toggle]");
    var menu = $("[data-menu]");
    if (!toggle || !menu) return;

    var open = false;
    var desktop = window.matchMedia("(min-width: 1121px)");

    function setMenu(state, returnFocus) {
      var wasOpen = open;
      open = state;
      toggle.setAttribute("aria-expanded", String(state));
      toggle.setAttribute("aria-label", state ? "Fechar menu" : "Abrir menu");
      menu.classList.toggle("is-open", state);
      menu.setAttribute("aria-hidden", String(!state));
      document.body.classList.toggle("menu-open", state);

      if (state) {
        menu.inert = false;
        var first = menu.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      } else {
        menu.inert = true;
        if (wasOpen && returnFocus !== false) {
          toggle.focus({ preventScroll: true });
        }
      }
    }

    menu.inert = true;

    toggle.addEventListener("click", function () {
      setMenu(!open);
    });

    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false, false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && open) {
        setMenu(false);
      }
    });

    var onChange = function (event) {
      if (event.matches && open) setMenu(false, false);
    };

    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", onChange);
    } else if (typeof desktop.addListener === "function") {
      desktop.addListener(onChange);
    }
  }

  function setupHero() {
    var hero = $(".hero");
    var slides = $$("[data-hero-slides] .hero__slide");
    var dots = $$("[data-hero-dot]");
    var label = $("[data-hero-label]");
    var labels = [
      "Películas de privacidade",
      "Adesivos decorativos",
      "Adesivo ripado"
    ];
    if (!hero || slides.length < 2) return;

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        var active = position === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });
      if (label) label.textContent = labels[index] || "";
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 4000);
    }

    $$("[data-hero-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    });

    $$("[data-hero-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", function (event) {
      if (!hero.contains(event.relatedTarget)) start();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    show(0);
    start();
  }

  function setupReveal() {
    var elements = $$("[data-reveal]");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function setupCompare() {
    $$("[data-compare]").forEach(function (compare) {
      var range = $("[data-compare-range]", compare);
      if (!range) return;

      function update() {
        compare.style.setProperty("--pos", range.value + "%");
      }

      range.addEventListener("input", update);
      range.addEventListener("change", update);
      update();
    });
  }

  function setupFilters() {
    $$("[data-filters]").forEach(function (filters) {
      var targetId = filters.getAttribute("data-target");
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;

      var buttons = $$("[data-filter]", filters);
      var items = $$("[data-filter-item]", target);
      var status = $("[data-filter-status]", filters);

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter");
          var count = 0;

          buttons.forEach(function (other) {
            var active = other === button;
            other.classList.toggle("is-active", active);
            other.setAttribute("aria-pressed", String(active));
          });

          items.forEach(function (item) {
            var categories = (item.getAttribute("data-category") || "").split(/\s+/);
            var show = value === "todos" || categories.indexOf(value) !== -1;
            item.hidden = !show;
            if (show) {
              count += 1;
              item.classList.add("is-visible");
            }
          });

          if (status) {
            status.textContent = "Mostrando " + count + (count === 1 ? " projeto" : " projetos") + " em \"" + button.textContent.trim() + "\".";
          }
        });
      });
    });
  }

  function setupFaq() {
    var items = $$(".faq-item");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  function setupLightbox() {
    var dialog = $("[data-lightbox]");
    if (!dialog) return;

    var image = $("[data-lightbox-img]", dialog);
    var title = $("[data-lightbox-title]", dialog);
    var category = $("[data-lightbox-cat]", dialog);
    var counter = $("[data-lightbox-counter]", dialog);
    var lastTrigger = null;
    var current = 0;

    function visibleTriggers() {
      return $$("[data-lightbox-trigger]").filter(function (trigger) {
        return !trigger.hidden;
      });
    }

    function render() {
      var list = visibleTriggers();
      if (!list.length || !image) return;
      current = (current + list.length) % list.length;
      var trigger = list[current];
      var thumb = $("img", trigger);
      image.src = trigger.getAttribute("data-full") || (thumb ? thumb.currentSrc || thumb.src : "");
      image.alt = thumb ? thumb.alt : "";
      if (title) title.textContent = trigger.getAttribute("data-title") || "";
      if (category) category.textContent = trigger.getAttribute("data-category-label") || "";
      if (counter) counter.textContent = (current + 1) + " / " + list.length;
    }

    function open(trigger) {
      lastTrigger = trigger;
      var list = visibleTriggers();
      current = list.indexOf(trigger);
      if (current < 0) current = 0;
      render();
      document.body.classList.add("lightbox-open");
      if (typeof dialog.showModal === "function") {
        try {
          dialog.showModal();
        } catch (error) {
          dialog.setAttribute("open", "");
        }
      } else {
        dialog.setAttribute("open", "");
      }
    }

    function close() {
      if (!dialog.open) return;
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        handleClosed();
      }
    }

    function handleClosed() {
      document.body.classList.remove("lightbox-open");
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus({ preventScroll: true });
      }
    }

    $$("[data-lightbox-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        open(trigger);
      });
    });

    $$("[data-lightbox-close]", dialog).forEach(function (button) {
      button.addEventListener("click", close);
    });

    $$("[data-lightbox-prev]", dialog).forEach(function (button) {
      button.addEventListener("click", function () {
        current -= 1;
        render();
      });
    });

    $$("[data-lightbox-next]", dialog).forEach(function (button) {
      button.addEventListener("click", function () {
        current += 1;
        render();
      });
    });

    dialog.addEventListener("click", function (event) {
      if (!event.target.closest(".lightbox__figure") && !event.target.closest("button")) {
        close();
      }
    });

    dialog.addEventListener("close", handleClosed);
  }

  function formatPhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.length > 11 && digits.indexOf("55") === 0) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return "(" + digits;
    if (digits.length <= 6) return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    if (digits.length <= 10) return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
  }

  function setupForm() {
    var form = $("[data-form]");
    if (!form) return;

    var status = $("[data-form-status]", form);
    var phone = $("#telefone", form);
    var submit = form.querySelector('button[type="submit"]');

    function setStatus(message, type) {
      if (!status) return;
      status.className = "form-status" + (type ? " is-" + type : "");
      status.textContent = message || "";
    }

    if (phone) {
      phone.addEventListener("input", function () {
        var formatted = formatPhone(phone.value);
        if (phone.value !== formatted) phone.value = formatted;
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (phone) {
        phone.setCustomValidity("");
        var digits = phone.value.replace(/\D/g, "");
        if (digits.length < 10) {
          phone.setCustomValidity("Informe um WhatsApp com DDD.");
        }
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus("Confira os campos obrigatórios para continuar.", "error");
        return;
      }

      var data = new FormData(form);
      var nome = String(data.get("nome") || "").trim();
      var telefone = String(data.get("telefone") || "").trim();
      var email = String(data.get("email") || "").trim();
      var servico = String(data.get("servico") || "").trim();
      var mensagem = String(data.get("mensagem") || "").trim();
      var texto = "Olá! Gostaria de solicitar um orçamento com a MODERNA DECOR.\n\n" +
        "Nome: " + nome + "\n" +
        "WhatsApp: " + telefone + "\n" +
        (email ? "E-mail: " + email + "\n" : "") +
        "Serviço: " + servico + "\n" +
        "Mensagem: " + mensagem;
      var url = waLink(texto);

      form.classList.add("is-loading");
      if (submit) submit.disabled = true;

      var opened = window.open(url, "_blank");
      if (opened) {
        try { opened.opener = null; } catch (error) {}
      } else {
        window.location.href = url;
      }

      setStatus("Mensagem pronta! ", "success");
      if (status) {
        var link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Abrir o WhatsApp";
        status.appendChild(link);
        status.appendChild(document.createTextNode(" caso a janela não tenha aberto."));
      }

      window.setTimeout(function () {
        form.classList.remove("is-loading");
        if (submit) submit.disabled = false;
      }, 1200);
    });
  }

  function setupScrollSpy() {
    var links = $$(".main-nav a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    }).filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle("is-current", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function setupYear() {
    var year = String(new Date().getFullYear());
    $$("[data-year]").forEach(function (element) {
      element.textContent = year;
    });
  }

  function init() {
    setupLinks();
    setupHeader();
    setupMenu();
    setupHero();
    setupReveal();
    setupCompare();
    setupFilters();
    setupFaq();
    setupLightbox();
    setupForm();
    setupScrollSpy();
    setupYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
