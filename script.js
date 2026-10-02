/* ==========================================================================
   Drim Makeup · Adriana Silva
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURAÇÃO DE CONTATO
   O número do WhatsApp não estava legível nos prints enviados.
   Preencha apenas com dígitos: código do país + DDD + número.
   Exemplo: "5589999999999"
   Enquanto estiver vazio, os botões de agendamento levam ao Instagram
   @drimmakeup e o botão flutuante do WhatsApp fica oculto.
   -------------------------------------------------------------------------- */
const CONFIG = {
  whatsappNumber: "",
  whatsappMessage: "Olá, Adriana! Vi seu site e gostaria de saber mais sobre disponibilidade para maquiagem.",
  instagramUrl: "https://www.instagram.com/drimmakeup/",
};


/* ---------- Links de agendamento ---------- */
(function setupContactLinks() {
  const number = CONFIG.whatsappNumber.replace(/\D/g, "");
  const hasWhatsapp = number.length >= 10;
  const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;

  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = hasWhatsapp ? waUrl : CONFIG.instagramUrl;

    const label = hasWhatsapp ? link.dataset.labelWhatsapp : link.dataset.labelFallback;
    if (label) link.textContent = label;

    if (hasWhatsapp && link.hasAttribute("data-whatsapp-text")) {
      link.textContent = formatPhone(number);
    }
  });

  document.querySelectorAll("[data-whatsapp-only]").forEach((el) => {
    el.hidden = !hasWhatsapp;
  });

  function formatPhone(digits) {
    // Formato brasileiro: +55 (89) 99999-9999
    const m = digits.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
    return m ? `(${m[1]}) ${m[2]}-${m[3]}` : `+${digits}`;
  }
})();

/* ---------- Header ao rolar ---------- */
(function setupHeader() {
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---------- Menu mobile ---------- */
(function setupMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const desktop = window.matchMedia("(min-width: 960px)");

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  desktop.addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();

/* ---------- Link ativo no menu ---------- */
(function setupActiveLink() {
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
})();

/* ---------- Animações de entrada ---------- */
(function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  // Pequeno atraso em cascata para elementos irmãos
  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    el.style.transitionDelay = `${Math.min(index, 5) * 80}ms`;
    observer.observe(el);
  });
})();

/* ---------- Lightbox da galeria ---------- */
(function setupLightbox() {
  const box = document.getElementById("lightbox");
  const buttons = [...document.querySelectorAll(".gallery__btn")];
  if (!box || !buttons.length) return;

  const img = box.querySelector(".lightbox__img");
  const caption = box.querySelector(".lightbox__caption");
  const closeBtn = box.querySelector(".lightbox__close");
  const prevBtn = box.querySelector(".lightbox__nav--prev");
  const nextBtn = box.querySelector(".lightbox__nav--next");
  let current = 0;
  let lastFocus = null;

  const show = (index) => {
    current = (index + buttons.length) % buttons.length;
    const btn = buttons[current];
    const thumb = btn.querySelector("img");
    img.src = btn.dataset.full || thumb.src;
    img.alt = thumb.alt;
    img.classList.toggle("photo-fix", thumb.classList.contains("photo-fix"));
    const cap = btn.parentElement.querySelector(".gallery__caption");
    caption.textContent = cap ? cap.textContent : "";
  };

  const open = (index) => {
    lastFocus = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => box.classList.add("is-visible"));
    closeBtn.focus();
  };

  const close = () => {
    box.classList.remove("is-visible");
    document.body.classList.remove("is-locked");
    setTimeout(() => {
      box.hidden = true;
      img.removeAttribute("src");
    }, 250);
    if (lastFocus) lastFocus.focus();
  };

  buttons.forEach((btn, i) => btn.addEventListener("click", () => open(i)));
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));

  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "Tab") {
      // mantém o foco dentro do lightbox
      const focusables = [closeBtn, prevBtn, nextBtn];
      const idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? idx - 1 : idx + 1;
      focusables[(next + focusables.length) % focusables.length].focus();
    }
  });

  // Gesto de deslizar no celular
  let startX = null;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

/* ---------- Ano no rodapé ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
