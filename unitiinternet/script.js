/* ------------------------------------------------------------------
   DOM REFERENCES
------------------------------------------------------------------ */

const campaignNameEl   = document.getElementById("campaignName");
const creativeSelector = document.getElementById("creativeSelector");
const bannerContainer  = document.getElementById("bannerContainer");
const reloadAllBtn     = document.getElementById("reloadAll");
const header           = document.querySelector(".header");
const headerText       = document.querySelector(".header h1");
const footer           = document.querySelector(".footer");
const backToTopBtn     = document.getElementById("backToTop");

const infoBtn     = document.getElementById("infoBtn");
const infoModal   = document.getElementById("infoModal");
const modalBody   = document.getElementById("modalBody");
const closeModal  = document.getElementById("closeModal");
const brandColour  = PREVIEW_SETTINGS.brandColour.split(",");

const backupImageModal   = document.getElementById("backupImageModal");
const backupImagePreview = document.getElementById("backupImagePreview");
const closeBackupImage   = document.getElementById("closeBackupImage");

const BASE_PATH = "banners/";
let currentCreative = null;

function getRoutePart(creative) {
  return creative.route ? `${creative.route}/` : "";
}

function getBannerHtmlPath(creative, item) {
  return `${BASE_PATH}${creative.creativeName}/${getRoutePart(creative)}${item.path}/index.html`;
}

function getBannerZipPath(creative, item) {
  return `${BASE_PATH}${creative.creativeName}/${getRoutePart(creative)}${item.path}.zip`;
}

function getCreativeZipPath(creative) {
  const zipName = creative.route && creative.route.trim() !== ""
    ? creative.route
    : creative.creativeName;

  return `${BASE_PATH}${creative.creativeName}/${getRoutePart(creative)}${zipName}.zip`;
}

function getBannerBackupImagePath(creative, item) {
  return `${BASE_PATH}${creative.creativeName}/${getRoutePart(creative)}${item.path}.jpg`;
}

/* ------------------------------------------------------------------
   GLOBAL UI SETUP
------------------------------------------------------------------ */

campaignNameEl.textContent = PREVIEW_SETTINGS.campaignName;
document.title = PREVIEW_SETTINGS.campaignName;

header.style.backgroundColor = brandColour[0];
footer.style.backgroundColor = brandColour[0];
headerText.style.color = brandColour[1];
footer.style.color = brandColour[1];

document.documentElement.style.setProperty(
  "--brand-bg-color",
  brandColour[0]
);

document.documentElement.style.setProperty(
  "--brand-text-color",
  brandColour[1]
);

/* ------------------------------------------------------------------
   CREATIVE SELECTOR
------------------------------------------------------------------ */

PREVIEW_SETTINGS.banners.forEach((banner, index) => {
  const option = document.createElement("option");
  option.value = index;

  option.textContent = banner.route && banner.route.trim() !== ""
    ? `${banner.creativeName} / ${banner.route}`
    : banner.creativeName;

  creativeSelector.appendChild(option);
});

function getCreativeIndexFromURL() {
  const params = new URLSearchParams(window.location.search);
  const creativeName = params.get("creative");
  const route = params.get("route");

  if (!creativeName) return 0;

  const index = PREVIEW_SETTINGS.banners.findIndex(b => {
    if (b.creativeName !== creativeName) return false;

    // If route exists in URL, match it strictly
    if (route) {
      return (b.route || "") === route;
    }

    // Otherwise match creative without route
    return !b.route || b.route.trim() === "";
  });

  return index !== -1 ? index : 0;
}

/* ------------------------------------------------------------------
   LOAD CREATIVE
------------------------------------------------------------------ */

function loadCreative(index) {
  bannerContainer.innerHTML = "";

  currentCreative = PREVIEW_SETTINGS.banners[index];
  renderSizeFilters(currentCreative);

  currentCreative.sizes.forEach(item => {
    const [w, h] = item.size.split("x");

    const card = document.createElement("div");
    card.className = "banner-card";
    card.dataset.size = item.size;

    const title = document.createElement("div");
    title.className = "banner-title";
    title.textContent = item.size;

    const iframe = document.createElement("iframe");
    iframe.className = "banner-frame";
    iframe.width = w;
    iframe.height = h;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.overflow = "hidden";
    iframe.src = getBannerHtmlPath(currentCreative, item);

    const actions = document.createElement("div");
    actions.className = "banner-actions";

    /* Reload */
    const reloadBtn = document.createElement("button");
    reloadBtn.innerHTML = '<i class="material-icons">refresh</i>';
    reloadBtn.title = "Reload banner";
    reloadBtn.onclick = () => iframe.src = iframe.src;

    /* Open */
    const openBtn = document.createElement("button");
    openBtn.innerHTML = '<i class="material-icons">open_in_new</i>';
    openBtn.title = "Open in new tab";
    openBtn.onclick = () => window.open(iframe.src, "_blank", "noopener,noreferrer");

    /* Download */
    const downloadBtn = document.createElement("button");
    downloadBtn.innerHTML = '<i class="material-icons">download</i>';
    downloadBtn.title = "Download banner ZIP";
    downloadBtn.onclick = () => {
      window.location.href = getBannerZipPath(currentCreative, item);
    };

    /* Backup Image */
    const backupBtn = document.createElement("button");
    backupBtn.innerHTML = '<i class="material-icons">image</i>';
    backupBtn.title = "View backup image";
    backupBtn.onclick = () => openBackupImage(currentCreative, item);

    actions.append(reloadBtn, openBtn, backupBtn, downloadBtn);
    card.append(title, iframe, actions);
    bannerContainer.appendChild(card);
  });

  syncCreativeInURL(index);
  applyFilters();
}

/* ------------------------------------------------------------------
   URL HANDLING
------------------------------------------------------------------ */

function syncCreativeInURL(index) {
  const params = new URLSearchParams(window.location.search);
  const creative = PREVIEW_SETTINGS.banners[index];

  params.set("creative", creative.creativeName);

  if (creative.route && creative.route.trim() !== "") {
    params.set("route", creative.route);
  } else {
    params.delete("route");
  }

  history.replaceState(null, "", `${location.pathname}?${params}`);
}

/* ------------------------------------------------------------------
   SIZE FILTERS
------------------------------------------------------------------ */

function renderSizeFilters(creative) {
  const container = document.getElementById("sizeFilters");
  container.innerHTML = "";

  const sizesFromURL = getSizesFromURL();
  const allSizes = creative.sizes.map(s => s.size);

  /* All sizes */
  const allLabel = document.createElement("label");
  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.id = "allSizes";
  allCheckbox.checked = !sizesFromURL || sizesFromURL.length === allSizes.length;

  allCheckbox.addEventListener("change", () => {
    container.querySelectorAll("input[data-size]").forEach(cb => {
      cb.checked = allCheckbox.checked;
    });
    applyFilters();
  });

  allLabel.append(allCheckbox, ` All Sizes (${allSizes.length})`);
  container.appendChild(allLabel);

  /* Individual sizes */
  creative.sizes.forEach(item => {
    const label = document.createElement("label");
    const cb = document.createElement("input");

    cb.type = "checkbox";
    cb.dataset.size = item.size;
    cb.value = item.size;
    cb.checked = !sizesFromURL || sizesFromURL.includes(item.size);

    cb.addEventListener("change", () => {
      syncAllSizesCheckbox();
      applyFilters();
    });

    label.append(cb, ` ${item.size}`);
    container.appendChild(label);
  });
}

function applyFilters() {
  const checkboxes = [...document.querySelectorAll('#sizeFilters input[data-size]')];
  const activeSizes = checkboxes.filter(cb => cb.checked).map(cb => cb.value);

  document.querySelectorAll(".banner-card").forEach(card => {
    card.style.display = activeSizes.includes(card.dataset.size) ? "flex" : "none";
  });

  updateSizesInURL(activeSizes, checkboxes.length);
}

function syncAllSizesCheckbox() {
  const allCheckbox = document.getElementById("allSizes");
  const checkboxes = [...document.querySelectorAll('#sizeFilters input[data-size]')];
  allCheckbox.checked = checkboxes.every(cb => cb.checked);
}

function updateSizesInURL(active, total) {
  const params = new URLSearchParams(window.location.search);

  if (active.length === total || active.length === 0) {
    params.delete("sizes");
  } else {
    params.set("sizes", active.join(","));
  }

  history.replaceState(null, "", `${location.pathname}?${params}`);
}

function getSizesFromURL() {
  const params = new URLSearchParams(window.location.search);
  const sizes = params.get("sizes");
  return sizes ? sizes.split(",") : null;
}

/* ------------------------------------------------------------------
   GLOBAL ACTIONS
------------------------------------------------------------------ */

reloadAllBtn.addEventListener("click", () => {
  document.querySelectorAll("iframe").forEach(f => f.src = f.src);
});

document.getElementById("downloadAll").addEventListener("click", () => {
  window.location.href = getCreativeZipPath(currentCreative);
});

/* ------------------------------------------------------------------
   INFO MODAL
------------------------------------------------------------------ */

async function getZipSize(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const bytes = res.headers.get("content-length");
    return bytes ? (bytes / 1024).toFixed(1) + " KB" : "—";
  } catch {
    return "—";
  }
}

function openInfoModal() {
  modalBody.innerHTML = "";

  const header = document.createElement("div");
  header.className = "modal-row modal-header";
  header.innerHTML = "<span>Banner Name(s)</span><span>File Weight</span>";
  modalBody.appendChild(header);

  currentCreative.sizes.forEach(item => {
    const row = document.createElement("div");
    row.className = "modal-row";

    const name = document.createElement("span");
    name.textContent = item.path;

    const size = document.createElement("span");
    size.textContent = "Loading...";

    getZipSize(getBannerZipPath(currentCreative, item))
    .then(v => size.textContent = v);

    row.append(name, size);
    modalBody.appendChild(row);
  });

  infoModal.classList.remove("hidden");
}

infoBtn.addEventListener("click", openInfoModal);
closeModal.addEventListener("click", () => infoModal.classList.add("hidden"));
infoModal.addEventListener("click", e => e.target === infoModal && infoModal.classList.add("hidden"));
function openBackupImage(creative, item) {
  backupImagePreview.src = getBannerBackupImagePath(creative, item);
  backupImageModal.classList.remove("hidden");
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") infoModal.classList.add("hidden");
});

closeBackupImage.addEventListener("click", () => {
  backupImageModal.classList.add("hidden");
  backupImagePreview.src = "";
});

backupImageModal.addEventListener("click", e => {
  if (e.target === backupImageModal) {
    backupImageModal.classList.add("hidden");
    backupImagePreview.src = "";
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    backupImageModal.classList.add("hidden");
    backupImagePreview.src = "";
  }
});

/* ------------------------------------------------------------------
   BACK TO TOP
------------------------------------------------------------------ */

window.addEventListener("scroll", () => {
  backToTopBtn.style.display = window.scrollY > 100 ? "flex" : "none";
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ------------------------------------------------------------------
   INITIAL LOAD
------------------------------------------------------------------ */

const initialIndex = getCreativeIndexFromURL();
creativeSelector.value = initialIndex;
loadCreative(initialIndex);

creativeSelector.addEventListener("change", e => loadCreative(e.target.value));