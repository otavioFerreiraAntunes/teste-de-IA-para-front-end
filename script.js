/**
 * VELOUR — Moda & Cosméticos
 * script.js — Carrinho, WhatsApp e comportamentos de UI
 *
 * Funcionalidades:
 * - Gerenciamento completo do carrinho (add, remover, alterar qtd)
 * - Integração WhatsApp com mensagem formatada
 * - Navbar scroll + hamburger menu
 * - Toast notifications
 * - Active nav link por seção (Intersection Observer)
 */

"use strict";

/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

// ⚠️ SUBSTITUA pelo número de WhatsApp real (somente dígitos, com DDI)
// Exemplo Brasil: 5511999998888
const WHATSAPP_NUMBER = "19982310381";

/* ============================================================
   ESTADO DO CARRINHO
   ============================================================ */

/**
 * Estrutura de um item:
 * { id, name, price, quantity }
 */
let cart = [];

/* ============================================================
   ELEMENTOS DOM
   ============================================================ */

const cartDrawer  = document.getElementById("cartDrawer");
const cartToggle  = document.getElementById("cartToggle");
const cartClose   = document.getElementById("cartClose");
const cartCount   = document.getElementById("cartCount");
const cartBody    = document.getElementById("cartBody");
const cartItems   = document.getElementById("cartItems");
const cartEmpty   = document.getElementById("cartEmpty");
const cartTotal   = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const overlay     = document.getElementById("overlay");
const toast       = document.getElementById("toast");
const navbar      = document.getElementById("navbar");
const hamburger   = document.getElementById("hamburger");
const navMenu     = document.getElementById("navMenu");
const footerWA    = document.getElementById("footerWA");

/* ============================================================
   CARRINHO — LÓGICA PRINCIPAL
   ============================================================ */

/**
 * Adiciona um produto ao carrinho.
 * Lê os dados do atributo data-* do <article> pai.
 * @param {HTMLButtonElement} btn — O botão clicado
 */
function addToCart(btn) {
  const card  = btn.closest(".card");
  const id    = card.dataset.id;
  const name  = card.dataset.name;
  const price = parseFloat(card.dataset.price);

  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  renderCart();
  animateCartBtn();
  showToast(`✔ "${name}" adicionado ao carrinho!`);
}

/**
 * Altera a quantidade de um item.
 * @param {string} id
 * @param {number} delta — +1 ou -1
 */
function changeQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeItem(id);
    return;
  }

  renderCart();
}

/**
 * Remove um item completamente do carrinho.
 * @param {string} id
 */
function removeItem(id) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;

  cart.splice(idx, 1);
  renderCart();
}

/**
 * Calcula o total do carrinho.
 * @returns {number}
 */
function calcTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calcula o total de itens (somando quantities).
 * @returns {number}
 */
function calcItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/* ============================================================
   CARRINHO — RENDERIZAÇÃO
   ============================================================ */

/**
 * Re-renderiza toda a UI do carrinho.
 */
function renderCart() {
  const count = calcItemCount();
  const total = calcTotal();

  // Badge
  cartCount.textContent = count;
  cartCount.style.transform = "scale(1.3)";
  setTimeout(() => { cartCount.style.transform = "scale(1)"; }, 200);

  // Total
  cartTotal.textContent = formatCurrency(total);

  // Checkout button
  checkoutBtn.disabled = cart.length === 0;

  // Empty state
  if (cart.length === 0) {
    cartEmpty.style.display  = "flex";
    cartItems.style.display  = "none";
  } else {
    cartEmpty.style.display  = "none";
    cartItems.style.display  = "flex";
  }

  // Render items
  cartItems.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.className  = "cart-item";
    li.dataset.id = item.id;

    li.innerHTML = `
      <div class="cart-item__info">
        <p class="cart-item__name">${escapeHtml(item.name)}</p>
        <p class="cart-item__price">${formatCurrency(item.price)}</p>
        <div class="cart-item__controls">
          <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)" aria-label="Diminuir quantidade">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity('${item.id}', +1)" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeItem('${item.id}')" aria-label="Remover item">✕</button>
    `;

    cartItems.appendChild(li);
  });
}

/* ============================================================
   WHATSAPP — FINALIZAR PEDIDO
   ============================================================ */

/**
 * Monta a mensagem formatada e abre o WhatsApp.
 */
function finalizarPedido() {
  if (cart.length === 0) return;

  const total = calcTotal();

  // Cabeçalho da mensagem
  let mensagem = "Olá! Gostaria de fazer o seguinte pedido na *Velour*:\n\n";

  // Lista de itens
  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    mensagem += `• ${item.quantity}x ${item.name} — ${formatCurrency(subtotal)}\n`;
  });

  // Total
  mensagem += `\n*Total: ${formatCurrency(total)}*\n`;
  mensagem += "\nAguardo confirmação. Obrigado(a)! 😊";

  // Codifica e abre WhatsApp
  const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ============================================================
   CARRINHO — ABERTURA / FECHAMENTO (DRAWER)
   ============================================================ */

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

/* ============================================================
   TOAST
   ============================================================ */

let toastTimer = null;

/**
 * Exibe uma notificação temporária na tela.
 * @param {string} message
 * @param {number} duration — ms
 */
function showToast(message, duration = 2800) {
  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* ============================================================
   ANIMAÇÃO DO BOTÃO DO CARRINHO (NAVBAR)
   ============================================================ */

function animateCartBtn() {
  cartToggle.classList.add("pulse");
  setTimeout(() => cartToggle.classList.remove("pulse"), 400);
}

/* ============================================================
   NAVBAR — SCROLL + HAMBURGER
   ============================================================ */

function handleScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

function toggleMenu() {
  hamburger.classList.toggle("open");
  navMenu.classList.toggle("open");
}

function closeMenu() {
  hamburger.classList.remove("open");
  navMenu.classList.remove("open");
}

/* ============================================================
   ACTIVE NAV LINK — INTERSECTION OBSERVER
   ============================================================ */

function initIntersectionObserver() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link[data-cat]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove("active"));
          const matching = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (matching) matching.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
  );

  sections.forEach(s => observer.observe(s));
}

/* ============================================================
   UTILIDADES
   ============================================================ */

/**
 * Formata número como moeda BRL.
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Previne XSS básico ao inserir texto no innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

// Abrir / fechar drawer
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// Fechar drawer com ESC
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeCart();
});

// Finalizar pedido
checkoutBtn.addEventListener("click", finalizarPedido);

// Footer WhatsApp (sem itens — apenas contato)
footerWA.addEventListener("click", e => {
  e.preventDefault();
  const msg = "Olá! Vim pelo site *Velour* e gostaria de mais informações. 😊";
  const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

// Scroll navbar
window.addEventListener("scroll", handleScroll, { passive: true });

// Hamburger
hamburger.addEventListener("click", toggleMenu);

// Fechar menu mobile ao clicar em link
navMenu.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", closeMenu);
});

/* ============================================================
   SMOOTH SCROLL para links de ancora
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  });
});

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function init() {
  renderCart();          // Estado inicial do carrinho (vazio)
  handleScroll();        // Estado inicial do navbar
  initIntersectionObserver();

  // Pequena animação nos cards ao entrar na viewport
  const cards = document.querySelectorAll(".card");
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = `${(i % 4) * 0.08}s`;
          entry.target.classList.add("card--visible");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  // Injetamos a animação via JS para não depender do CSS separado
  const style = document.createElement("style");
  style.textContent = `
    .card { opacity: 0; transform: translateY(24px); }
    .card--visible {
      animation: cardReveal .5s cubic-bezier(.25,.8,.25,1) both;
    }
    @keyframes cardReveal {
      to { opacity: 1; transform: translateY(0); }
    }
    .navbar__cart-btn.pulse {
      animation: cartPulse .4s ease;
    }
    @keyframes cartPulse {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.25); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  cards.forEach(card => cardObserver.observe(card));

  console.log(
    "%c Velour 🛍️ ",
    "background:#5B1FA8;color:#fff;font-size:16px;padding:8px 16px;border-radius:4px;",
    "\nCarrinho inicializado. WhatsApp:", WHATSAPP_NUMBER
  );
}

// Aguarda o DOM estar pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}