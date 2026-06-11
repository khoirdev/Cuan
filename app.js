/**
 * Earn Coins — Telegram Mini App
 * Uses Monetag zone 11133202 (show_11133202 global injected by SDK script tag)
 *
 * Ad formats:
 *   show_11133202()         → Rewarded Interstitial
 *   show_11133202('pop')    → Rewarded Popup
 *   show_11133202({...})    → In-App Interstitial (auto)
 */

// ─── Telegram WebApp init ─────────────────────────────────────────────────────
const tg = window.Telegram?.WebApp
if (tg) {
  tg.ready()
  tg.expand()
  tg.setHeaderColor('secondary_bg_color')
}

// ─── State (persisted in localStorage) ───────────────────────────────────────
const state = {
  get balance() { return parseInt(localStorage.getItem('coins') || '0') },
  set balance(v) { localStorage.setItem('coins', String(v)) },
  get streak()  { return parseInt(localStorage.getItem('streak') || '0') },
  set streak(v) { localStorage.setItem('streak', String(v)) },
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const balanceEl       = document.getElementById('balance')
const streakEl        = document.getElementById('streak-count')
const btnInterstitial = document.getElementById('btn-interstitial')
const btnPop          = document.getElementById('btn-pop')
const toggleInApp     = document.getElementById('toggle-inapp')
const loadingEl       = document.getElementById('ad-loading')
const toastEl         = document.getElementById('toast')

// ─── UI helpers ───────────────────────────────────────────────────────────────
function renderBalance() {
  balanceEl.textContent = state.balance.toLocaleString()
  streakEl.textContent  = state.streak
}

function bumpBalance(amount) {
  state.balance += amount
  state.streak  += 1
  renderBalance()
  balanceEl.classList.add('bump')
  setTimeout(() => balanceEl.classList.remove('bump'), 200)
  tg?.HapticFeedback?.notificationOccurred('success')
}

let toastTimer
function showToast(msg) {
  toastEl.textContent = msg
  toastEl.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200)
}

function setLoading(on) {
  loadingEl.classList.toggle('visible', on)
}

function lockBtn(btn, ms = 4000) {
  btn.disabled = true
  setTimeout(() => { btn.disabled = false }, ms)
}

// ─── 1. Rewarded Interstitial ─────────────────────────────────────────────────
btnInterstitial.addEventListener('click', () => {
  lockBtn(btnInterstitial)
  setLoading(true)

  show_11133202()
    .then(() => {
      setLoading(false)
      bumpBalance(10)
      showToast('+10 coins earned! 🪙')
    })
    .catch((err) => {
      setLoading(false)
      console.warn('[Monetag] Interstitial error:', err)
      showToast('Ad not available, try again')
    })
})

// ─── 2. Rewarded Popup ───────────────────────────────────────────────────────
btnPop.addEventListener('click', () => {
  lockBtn(btnPop)
  setLoading(true)

  show_11133202('pop')
    .then(() => {
      setLoading(false)
      bumpBalance(5)
      showToast('+5 coins earned! 🪙')
    })
    .catch((err) => {
      setLoading(false)
      console.warn('[Monetag] Pop error:', err)
      showToast('Ad not available, try again')
    })
})

// ─── 3. In-App Interstitial (auto) ───────────────────────────────────────────
let inAppActive = false

toggleInApp.addEventListener('change', () => {
  if (toggleInApp.checked && !inAppActive) {
    inAppActive = true

    show_11133202({
      type: 'inApp',
      inAppSettings: {
        frequency:  2,
        capping:    0.1,   // 6-minute window
        interval:   30,    // 30s between ads
        timeout:    5,     // first ad after 5s
        everyPage:  false,
      },
    })

    showToast('Background ads enabled')
  } else if (!toggleInApp.checked && inAppActive) {
    inAppActive = false
    showToast('Restart app to fully stop auto ads')
  }
})

// ─── Init ─────────────────────────────────────────────────────────────────────
renderBalance()
function setLoading(on) {
  loadingEl.classList.toggle('visible', on)
}

function lockBtn(btn) {
  btn.disabled = true
  setTimeout(() => { btn.disabled = false }, 3000)
}

// ─── 1. Rewarded Interstitial ─────────────────────────────────────────────────
btnInterstitial.addEventListener('click', () => {
  lockBtn(btnInterstitial)
  setLoading(true)

  adHandler()
    .then(() => {
      setLoading(false)
      bumpBalance(REWARDS.interstitial)
      showToast(`+${REWARDS.interstitial} coins earned! 🪙`)
    })
    .catch((err) => {
      setLoading(false)
      console.warn('[Monetag] Interstitial error:', err)
      showToast('Ad not available, try again')
    })
})

// ─── 2. Rewarded Pop ─────────────────────────────────────────────────────────
btnPop.addEventListener('click', () => {
  lockBtn(btnPop)
  setLoading(true)

  adHandler('pop')
    .then(() => {
      setLoading(false)
      bumpBalance(REWARDS.pop)
      showToast(`+${REWARDS.pop} coins earned! 🪙`)
    })
    .catch((err) => {
      setLoading(false)
      console.warn('[Monetag] Pop error:', err)
      showToast('Ad not available, try again')
    })
})

// ─── 3. In-App Interstitial ───────────────────────────────────────────────────
toggleInApp.addEventListener('change', () => {
  if (toggleInApp.checked && !inAppActive) {
    inAppActive = true
    adHandler({
      type: 'inApp',
      inAppSettings: {
        frequency: 3,   // max 3 ads per capping window
        capping:   0.5, // 30-minute window
        interval:  30,  // min 30s between ads
        timeout:   10,  // first ad after 10s
      },
    })
    showToast('Background ads enabled')
  } else if (!toggleInApp.checked) {
    inAppActive = false
    // Note: reloading the page is the cleanest way to stop inApp ads
    // since the SDK doesn't expose a stop method
    showToast('Restart app to fully disable')
  }
})

// ─── Init ─────────────────────────────────────────────────────────────────────
renderBalance()
