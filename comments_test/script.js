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
const closeQRcode   = document.getElementById("closeQRcode");
const allCommentsBtn = document.getElementById("commentsDashboardBtn");

const BASE_PATH = "banners/";
let currentCreative = null;
let editingCommentId = null;

const COMMENTS_API = "https://script.google.com/macros/s/AKfycbzAjZbWSlx06J3kkXsMD1JEdc9IqReUB95yIaMxX_DLiS-uDeuu-NYTXglv0S9tbqph/exec";
let currentCommentBanner = null;
let reviewerName = localStorage.getItem("reviewerName") || "";

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

    /* Comment */
    const commentBtn = document.createElement("button");
    commentBtn.innerHTML = '<i class="material-icons">comment</i>';
    commentBtn.title = "Comments";

    commentBtn.onclick = () => { openCommentModal(currentCreative, item); };

    /* QR Code */
    const qrCodeBtn = document.createElement("button");
    qrCodeBtn.innerHTML = '<i class="material-icons">qr_code</i>';
    qrCodeBtn.title = "QR Code";
    qrCodeBtn.onclick = () => {
      const url =
        getBannerPublicUrl(
          currentCreative,
          item
        );
      qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
        encodeURIComponent(url);
      qrBannerName.textContent = item.path;
      setTimeout(()=>{qrModal.classList.remove("hidden")},500);
    }

    function getBannerPublicUrl(creative,item){
      const routePart = creative.route ? `${creative.route}/` : "";
      const baseUrl = window.location.origin;
      return `${baseUrl}/${BASE_PATH}${creative.creativeName}/${routePart}${item.path}/index.html`;
    }

    actions.append(reloadBtn, openBtn, backupBtn, downloadBtn, qrCodeBtn, commentBtn);
    card.append(title, iframe, actions);
    bannerContainer.appendChild(card);
  });

  syncCreativeInURL(index);
  applyFilters();
}

  async function loadComments() {

  const commentList =document.getElementById("commentList");

  commentList.innerHTML ="<div>Loading comments...</div>";

  try {
    const response =
      await fetch(
        `${COMMENTS_API}?action=getComments&creative=${encodeURIComponent(currentCommentBanner.creative)}&banner=${encodeURIComponent(currentCommentBanner.banner)}`
      );

    if (!response.ok) {
  throw new Error(
    `HTTP ${response.status}`
  );
}

const comments = await response.json();

    commentList.innerHTML = "";

    if (!comments.length) {

      commentList.innerHTML =
        "<div>No comments yet.</div>";

      return;
    }

    comments
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach(comment => {

      const item =
        document.createElement("div");

      item.className =
        "comment-item";

      item.innerHTML = `
        <div class="comment-header">
          <div class="comment-author">
            ${comment.reviewer}
          </div>

          <div class="comment-date">
            ${new Date(comment.timestamp).toLocaleString()}
          </div>
        </div>

        <div class="comment-body">
          ${comment.comment}
        </div>
      `;

      if (comment.reviewer === reviewerName) {

  const actions = document.createElement("div");
  actions.className = "comment-actions comment-actions-comment";

  /* Edit */
  const editBtn = document.createElement("button");
  editBtn.className = "comment-edit";
  editBtn.innerHTML =
    '<i class="material-icons">edit</i>';

  editBtn.title = "Edit comment";

  editBtn.onclick = () =>
    editComment(comment);

  /* Delete */
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "comment-delete";
  deleteBtn.innerHTML =
    '<i class="material-icons">delete</i>';

  deleteBtn.title = "Delete comment";

  deleteBtn.onclick = () =>
    deleteComment(comment.id);

  actions.append(editBtn, deleteBtn);

  item.appendChild(actions);
}

      commentList.appendChild(item);
    });

  } catch (err) {

    commentList.innerHTML =
      "<div>Error loading comments.</div>";

    console.error(err);
  }
}

async function submitComment() {

  const commentText =
    document.getElementById("commentText")
      .value
      .trim();

  if (!commentText) return;

  const action =
    editingCommentId
      ? "updateComment"
      : "addComment";

  const payload = {
    action,
    reviewer: reviewerName,
    creative: currentCommentBanner.creative,
    route: currentCommentBanner.route,
    banner: currentCommentBanner.banner,
    comment: commentText
};

  if (editingCommentId) {
    payload.commentId = editingCommentId;
  }

  const response = await fetch(COMMENTS_API, {
    method: "POST",
    body: JSON.stringify(payload)
  });

const result = await response.json();

console.log("Update Result:", result);

  document.getElementById("commentText").value = "";

  editingCommentId = null;

  document.getElementById("submitCommentBtn")
    .textContent = "Submit";

  loadComments();
}

async function deleteComment(commentId) {

  if (
    !confirm(
      "Delete this comment?"
    )
  ) {
    return;
  }

  await fetch(COMMENTS_API, {
    method: "POST",

    body: JSON.stringify({
      action: "deleteComment",
      commentId,
      reviewer: reviewerName
    })
  });

  loadComments();
}

function editComment(comment) {

  editingCommentId = comment.id;

  document.getElementById("commentText").value =
    comment.comment;

  document.getElementById("commentText").focus();

  document.getElementById("submitCommentBtn")
    .textContent = "Update";
}

document.getElementById("submitCommentBtn").addEventListener("click",submitComment);
document.getElementById("clearCommentBtn").addEventListener("click",() => {document.getElementById("commentText").value = "";});
document.getElementById("closeCommentModal").addEventListener("click",() => {document.getElementById("commentModal").classList.add("hidden");});

  const commentModal = document.getElementById("commentModal");
  const closeCommentModal = document.getElementById("closeCommentModal");

  closeCommentModal.addEventListener("click", () => {
      commentModal.classList.add("hidden");
  });

  commentModal.addEventListener("click", (e) => {
      if (e.target === commentModal) {
          commentModal.classList.add("hidden");
      }
  });

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
    size.textContent = "Loading comments...";

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
  console.log(creative, item)
  backupImagePreview.src = getBannerBackupImagePath(creative, item);
  backupImageModal.classList.remove("hidden");
  document.getElementById('backupBannerName').innerHTML = item.path;
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") infoModal.classList.add("hidden");
});

closeBackupImage.addEventListener("click", () => {
  backupImageModal.classList.add("hidden");
  backupImagePreview.src = "";
});

closeQRcode.addEventListener("click", () => {
  qrModal.classList.add("hidden");
  qrImage.src = "";
});

backupImageModal.addEventListener("click", e => {
  if (e.target === backupImageModal) {
    backupImageModal.classList.add("hidden");
    backupImagePreview.src = "";
  }
});

qrModal.addEventListener("click", e => {
  if (e.target === qrModal) {
    qrModal.classList.add("hidden");
    qrImage.src = "";
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    backupImageModal.classList.add("hidden");
    backupImagePreview.src = "";
  }
});

/* ------------------------------------------------------------------
   COMMENTS
------------------------------------------------------------------ */

function openCommentModal(creative, item) {

  if (!reviewerName) {

    reviewerName = prompt("Enter your name to leave a comment");

    if (!reviewerName) return;

    localStorage.setItem(
      "reviewerName",
      reviewerName
    );
  }

  currentCommentBanner = {
    creative: creative.creativeName,
    banner: item.path
  };

  document.getElementById("commentBannerName").textContent =
    item.path;

  document.getElementById("commentName").value =
    reviewerName;

  document.getElementById("commentText").value =
    "";

  document.getElementById("commentModal")
    .classList.remove("hidden");

  loadComments();
}

allCommentsBtn.addEventListener(
  "click",
  openAllCommentsModal
);

async function openAllCommentsModal() {

  const list =
    document.getElementById(
      "allCommentsList"
    );

  list.innerHTML =
    "<div>Loading comments...</div>";

  document
    .getElementById(
      "allCommentsModal"
    )
    .classList.remove("hidden");

  const response =
    await fetch(
      `${COMMENTS_API}?action=getAllComments`
    );

  const comments =
    await response.json();

  renderAllComments(comments);
}

function renderAllComments(comments) {
  const list = document.getElementById("allCommentsList");
  list.innerHTML = "";

  comments
    .sort(
      (a,b) =>
        new Date(b.timestamp) -
        new Date(a.timestamp)
    )
    .forEach(comment => {

      const card = document.createElement("div");
      card.className = "dashboard-comment";
      card.innerHTML = `
        <div class="comment-creative">
          ${comment.creative}
        </div>

        <div class="comment-banner">
          ${comment.banner}
        </div>

        <div class="comment-meta">
          ${comment.reviewer}
          •
          ${new Date(comment.timestamp).toLocaleString()}
          •
          ${comment.status}
        </div>

        <div class="comment-body">
          ${comment.comment}
        </div>
      `;

      list.appendChild(card);
    });
}

const allCommentsModal =
  document.getElementById("allCommentsModal");

const closeAllComments =
  document.getElementById("closeAllComments");

closeAllComments.addEventListener(
  "click",
  () => {
    allCommentsModal.classList.add("hidden");
  }
);

allCommentsModal.addEventListener(
  "click",
  e => {
    if (e.target === allCommentsModal) {
      allCommentsModal.classList.add("hidden");
    }
  }
);

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
