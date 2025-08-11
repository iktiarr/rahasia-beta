// File: data-web-dev.js (Versi Development)

document.addEventListener("DOMContentLoaded", function () {
  // --- PENGATURAN UNTUK DEVELOPMENT ---
  const CORRECT_TOKEN = "00475";
  const MAX_TOKEN_ATTEMPTS = 3; // Batas percobaan hanya 3 kali
  const TOKEN_COOLDOWN_SECONDS = 1; // Jeda waktu hanya 1 detik

  // --- SELEKSI ELEMEN DOM ---
  const accordionContainer = document.getElementById("accordion-container");
  const openDataBtn = document.getElementById("openDataBtn");
  const lockDataBtn = document.getElementById("lockDataBtn");
  const tokenModal = document.getElementById("tokenModal");
  const tokenInput = document.getElementById("tokenInput");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const tokenError = document.getElementById("tokenError");

  // Variabel lokal (state akan hilang saat refresh)
  let tokenAttempts = 0;
  let isTokenCooldown = false;
  let cooldownInterval;

  // --- FUNGSI-FUNGSI UTAMA ---

  function createInfoItem(item, isMasked) {
    const displayJudul = isMasked ? "********" : item.judul;
    const displayNilai = isMasked ? "******************" : item.nilai;
    const displayLink = isMasked ? "#" : item.link;
    const copyValue = isMasked ? "" : item.teks_salin;

    const copyButtonHTML = isMasked
      ? ""
      : `
            <button class="copy-btn p-2 rounded-md hover:bg-white/10" data-copy="${copyValue}">
                <svg class="clipboard-icon w-5 h-5" fill="none" stroke-width="1.5" stroke="#ffcb74"><use href="#icon-clipboard"></use></svg>
                <svg class="check-icon hidden w-5 h-5" fill="none" stroke-width="2" stroke="#ffcb74"><use href="#icon-check"></use></svg>
            </button>
        `;

    return `
            <div class="info-item flex items-center justify-between p-3 bg-zinc-800/60 rounded-md">
                <a href="${displayLink}" target="_blank" rel="noopener noreferrer" class="flex-grow ${isMasked ? "pointer-events-none" : ""}">
                    <h4 class="font-bold text-gray-100">${displayJudul}</h4>
                    <p class="text-sm text-gray-400">${displayNilai}</p>
                </a>
                ${copyButtonHTML}
            </div>
        `;
  }

  function renderData(isMasked = true) {
    accordionContainer.innerHTML = "";
    websiteData.forEach((kategoriData) => {
      const displayKategori = isMasked ? "**********" : kategoriData.kategori;
      const accordionItemHTML = `
                <div class="accordion-item bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <button class="accordion-header w-full text-left p-4 hover:bg-zinc-800" ${
                      isMasked ? "disabled" : ""
                    }>
                        <span class="font-bold text-lg" style="color: #ffcb74;">${displayKategori}</span>
                    </button>
                    <div class="accordion-content p-4 space-y-3">
                        ${kategoriData.items
                          .map((item) => createInfoItem(item, isMasked))
                          .join("")}
                    </div>
                </div>
            `;
      accordionContainer.innerHTML += accordionItemHTML;
    });

    openDataBtn.classList.toggle("hidden", !isMasked);
    lockDataBtn.classList.toggle("hidden", isMasked);
  }

  function showTokenModal() {
    tokenError.textContent = "";
    tokenInput.value = "";
    tokenModal.classList.remove("hidden");
    tokenInput.focus();
  }

  function hideTokenModal() {
    tokenModal.classList.add("hidden");
  }

  function unlockData() {
    sessionStorage.setItem("isUnlocked", "true");
    tokenAttempts = 0; // Reset percobaan
    renderData(false);
    hideTokenModal();
  }

  function lockData() {
    sessionStorage.removeItem("isUnlocked");
    renderData(true);
  }

  function handleWrongToken() {
    tokenAttempts++;
    if (tokenAttempts >= MAX_TOKEN_ATTEMPTS) {
      tokenAttempts = 0; // Reset sebelum redirect
      window.location.href = "index.html";
    } else {
      startTokenCooldown();
    }
  }

  function startTokenCooldown() {
    isTokenCooldown = true;
    confirmBtn.disabled = true;
    tokenInput.disabled = true;
    let secondsLeft = TOKEN_COOLDOWN_SECONDS;
    tokenError.textContent = `Token salah. Coba lagi dalam ${secondsLeft} detik.`;

    cooldownInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        tokenError.textContent = `Token salah. Coba lagi dalam ${secondsLeft} detik.`;
      } else {
        clearInterval(cooldownInterval);
        isTokenCooldown = false;
        confirmBtn.disabled = false;
        tokenInput.disabled = false;
        tokenError.textContent = "";
      }
    }, 1000);
  }

  // --- EVENT LISTENERS ---
  openDataBtn.addEventListener("click", showTokenModal);
  lockDataBtn.addEventListener("click", lockData);

  confirmBtn.addEventListener("click", () => {
    if (isTokenCooldown) return;
    if (tokenInput.value === CORRECT_TOKEN) {
      unlockData();
    } else {
      handleWrongToken();
    }
  });

  tokenInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && !confirmBtn.disabled && confirmBtn.click()
  );
  cancelBtn.addEventListener("click", hideTokenModal);

  accordionContainer.addEventListener("click", function (event) {
    if (sessionStorage.getItem("isUnlocked") !== "true") return;
    const header = event.target.closest(".accordion-header");
    if (header) {
      const content = header.nextElementSibling;
      const isOpen = content.style.display === "block";
      document
        .querySelectorAll(".accordion-content")
        .forEach((c) => (c.style.display = "none"));
      document
        .querySelectorAll(".accordion-header")
        .forEach((h) => h.classList.remove("open"));
      if (!isOpen) {
        content.style.display = "block";
        header.classList.add("open");
      }
    }
    const copyButton = event.target.closest(".copy-btn");
    if (copyButton) {
      const textToCopy = copyButton.getAttribute("data-copy");
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          const clipboardIcon = copyButton.querySelector(".clipboard-icon");
          const checkIcon = copyButton.querySelector(".check-icon");
          clipboardIcon.classList.add("hidden");
          checkIcon.classList.remove("hidden");
          setTimeout(() => {
            checkIcon.classList.add("hidden");
            clipboardIcon.classList.remove("hidden");
          }, 2000);
        })
        .catch((err) => console.error("Gagal menyalin: ", err));
    }
  });

  // --- INISIALISASI HALAMAN ---
  if (sessionStorage.getItem("isUnlocked") === "true") {
    renderData(false);
  } else {
    renderData(true);
    showTokenModal();
  }
});
