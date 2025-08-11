document.addEventListener("DOMContentLoaded", () => {
  // --- PENGATURAN & KONSTANTA ---
  const correctPassword = "IKTIAR745RAMADANI";
  const MAX_ATTEMPTS = 3;
  const COOLDOWN_SECONDS = 20;
  const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 jam

  // --- SELEKSI ELEMEN DOM ---
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const blockedScreen = document.getElementById("blockedScreen");
  const countdownTimer = document.getElementById("countdownTimer");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  let activeInterval; // Satu interval untuk semua (cooldown atau block)

  // --- FUNGSI UTAMA ---

  function handleLogin() {
    if (passwordInput.value === correctPassword) {
      clearAllLocks();
      window.location.href = "privat-web.html";
    } else {
      handleWrongPassword();
    }
  }

  function handleWrongPassword() {
    let attempts = parseInt(localStorage.getItem("loginAttempts") || "0") + 1;
    localStorage.setItem("loginAttempts", attempts);
    passwordInput.value = "";
    passwordInput.focus();

    if (attempts >= MAX_ATTEMPTS) {
      const blockUntil = Date.now() + BLOCK_DURATION_MS;
      localStorage.setItem("blockUntil", blockUntil);
      showBlockedScreen(blockUntil);
    } else {
      const cooldownUntil = Date.now() + COOLDOWN_SECONDS * 1000;
      localStorage.setItem("cooldownUntil", cooldownUntil);
      showCooldownState(cooldownUntil);
    }
  }

  function showBlockedScreen(endTime) {
    clearInterval(activeInterval);
    loginForm.style.display = "none"; // Sembunyikan form
    blockedScreen.classList.remove("hidden");

    const update = () => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearAllLocks();
      } else {
        const h = String(
          Math.floor((remainingTime / (1000 * 60 * 60)) % 24)
        ).padStart(2, "0");
        const m = String(
          Math.floor((remainingTime / (1000 * 60)) % 60)
        ).padStart(2, "0");
        const s = String(Math.floor((remainingTime / 1000) % 60)).padStart(
          2,
          "0"
        );
        countdownTimer.textContent = `${h}:${m}:${s}`;
      }
    };
    update(); // Panggil sekali agar timer langsung muncul
    activeInterval = setInterval(update, 1000);
  }

  function showCooldownState(endTime) {
    clearInterval(activeInterval);
    loginBtn.disabled = true;

    const update = () => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining > 0) {
        errorMsg.textContent = `Password salah. Coba lagi dalam ${remaining} detik.`;
      } else {
        clearCooldown();
      }
    };
    update(); // Panggil sekali agar pesan langsung muncul
    activeInterval = setInterval(update, 1000);
  }

  // --- FUNGSI BANTU ---

  function clearAllLocks() {
    clearInterval(activeInterval);
    localStorage.removeItem("loginAttempts");
    localStorage.removeItem("blockUntil");
    localStorage.removeItem("cooldownUntil");

    blockedScreen.classList.add("hidden");
    loginForm.style.display = "block"; // Tampilkan form kembali
    loginBtn.disabled = false;
    errorMsg.textContent = "";
  }

  function clearCooldown() {
    clearInterval(activeInterval);
    localStorage.removeItem("cooldownUntil");
    loginBtn.disabled = false;
    errorMsg.textContent = "";
  }

  // --- INISIALISASI HALAMAN & EVENT LISTENERS ---

  function initializePage() {
    const blockUntil = parseInt(localStorage.getItem("blockUntil"));
    if (blockUntil && blockUntil > Date.now()) {
      showBlockedScreen(blockUntil);
      return;
    }

    const cooldownUntil = parseInt(localStorage.getItem("cooldownUntil"));
    if (cooldownUntil && cooldownUntil > Date.now()) {
      showCooldownState(cooldownUntil);
    }
  }

  initializePage(); // Jalankan saat halaman dimuat

  loginBtn.addEventListener("click", handleLogin);
  passwordInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && !loginBtn.disabled && handleLogin()
  );
  passwordInput.addEventListener("input", () => {
    if (!localStorage.getItem("cooldownUntil")) {
      errorMsg.textContent = "";
    }
  });

  // Logika untuk toggle password visibility
  const eyeOpenSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
  const eyeClosedSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.673.123 2.458.35M18.825 13.875c.323-.785.525-1.623.525-2.5 0-4.057-3.79-7.333-8.333-7.333-1.403 0-2.733.32-3.916.89M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 5.25a5.25 5.25 0 005.25-5.25M3 3l18 18"></path>`;
  togglePasswordBtn.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    eyeIcon.innerHTML = type === "password" ? eyeOpenSVG : eyeClosedSVG;
  });
});
