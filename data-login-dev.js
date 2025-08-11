// File: data-login-dev.js (Tanpa localStorage, reset saat refresh)
document.addEventListener("DOMContentLoaded", () => {
  // --- PENGATURAN & SELEKSI ELEMEN ---
  const correctPassword = "IKTIAR745RAMADANI";
  const MAX_ATTEMPTS = 3;
  const COOLDOWN_SECONDS = 1;
  const BLOCK_duration_MS = 60 * 60 * 1000; // 1 jam

  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const blockedScreen = document.getElementById("blockedScreen");
  const countdownTimer = document.getElementById("countdownTimer");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");

  // Variabel lokal, bukan localStorage
  let loginAttempts = 0;
  let isCooldown = false;
  let cooldownInterval;

  // --- FUNGSI-FUNGSI LOGIKA ---
  function handleLogin() {
    if (isCooldown) return;

    if (passwordInput.value === correctPassword) {
      loginAttempts = 0; // Reset
      window.location.href = "privat-web.html";
    } else {
      loginAttempts++;
      passwordInput.value = "";
      passwordInput.focus();

      if (loginAttempts >= MAX_ATTEMPTS) {
        blockAccess();
      } else {
        startCooldown();
      }
    }
  }

  function startCooldown() {
    isCooldown = true;
    loginBtn.disabled = true;
    let secondsLeft = COOLDOWN_SECONDS;
    errorMsg.textContent = `Password salah. Coba lagi dalam ${secondsLeft} detik.`;

    cooldownInterval = setInterval(() => {
      secondsLeft--;
      errorMsg.textContent = `Password salah. Coba lagi dalam ${secondsLeft} detik.`;
      if (secondsLeft <= 0) {
        clearInterval(cooldownInterval);
        isCooldown = false;
        loginBtn.disabled = false;
        errorMsg.textContent = "";
      }
    }, 1000);
  }

  function blockAccess() {
    loginForm.classList.add("hidden");
    blockedScreen.classList.remove("hidden");
    let remainingTime = BLOCK_duration_MS;

    // Tampilkan waktu awal secara langsung
    updateCountdownDisplay(remainingTime);

    // Mulai interval untuk memperbarui setiap detik
    setInterval(() => {
      remainingTime -= 1000;
      updateCountdownDisplay(remainingTime);
      // Dalam versi dev, blokir tidak akan hilang kecuali di-refresh
    }, 1000);
  }

  function updateCountdownDisplay(ms) {
    if (ms < 0) ms = 0;
    const h = String(Math.floor((ms / (1000 * 60 * 60)) % 24)).padStart(2, "0");
    const m = String(Math.floor((ms / (1000 * 60)) % 60)).padStart(2, "0");
    const s = String(Math.floor((ms / 1000) % 60)).padStart(2, "0");
    countdownTimer.textContent = `${h}:${m}:${s}`;
  }

  // --- EVENT LISTENERS ---
  loginBtn.addEventListener("click", handleLogin);
  passwordInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && !loginBtn.disabled && handleLogin()
  );
  passwordInput.addEventListener(
    "input",
    () => !isCooldown && (errorMsg.textContent = "")
  );

  // Logika toggle password
  const eyeOpenSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
  const eyeClosedSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.673.123 2.458.35M18.825 13.875c.323-.785.525-1.623.525-2.5 0-4.057-3.79-7.333-8.333-7.333-1.403 0-2.733.32-3.916.89M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 5.25a5.25 5.25 0 005.25-5.25M3 3l18 18"></path>`;
  togglePasswordBtn.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    eyeIcon.innerHTML = type === "password" ? eyeOpenSVG : eyeClosedSVG;
  });
});
