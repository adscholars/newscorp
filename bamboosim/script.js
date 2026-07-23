/* ------------------------------------------------------------------
   DOM REFERENCES
------------------------------------------------------------------ */

const campaignNameEl = document.getElementById("campaignName");
const creativeSelector = document.getElementById("creativeSelector");
const bannerContainer = document.getElementById("bannerContainer");
const reloadAllBtn = document.getElementById("reloadAll");
const header = document.querySelector(".header");
const headerText = document.querySelector(".header h1");
const footer = document.querySelector(".footer");
const backToTopBtn = document.getElementById("backToTop");

const infoBtn = document.getElementById("infoBtn");
const infoModal = document.getElementById("infoModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const brandColour = PREVIEW_SETTINGS.brandColour.split(",");

const backupImageModal = document.getElementById("backupImageModal");
const backupImagePreview = document.getElementById("backupImagePreview");
const closeBackupImage = document.getElementById("closeBackupImage");
const closeQRcode = document.getElementById("closeQRcode");
const allCommentsBtn = document.getElementById("commentsDashboardBtn");
const submitBtn = document.getElementById("submitDashboardComment");

const BASE_PATH = "banners/";
let currentCreative = null;
let editingCommentId = null;

const COMMENTS_API = "https://script.google.com/macros/s/AKfycby2g6xRuJ5ULYfzXpvwaoNhdciAtRIAreBKFUnZCcNZCmOAB5JEwOTlugwR-k7FlHvp/exec";
let currentCommentBanner = null;
let reviewerName = localStorage.getItem("reviewerName") || "";
let allComments = [];

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
    const zipName = creative.route && creative.route.trim() !== "" ?
        creative.route :
        creative.creativeName;

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

    option.textContent = banner.route && banner.route.trim() !== "" ?
        `${banner.creativeName} / ${banner.route}` :
        banner.creativeName;

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
    // populateBannerSizeDropdown();

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

        /* QR Code */
        const qrCodeBtn = document.createElement("button");
        qrCodeBtn.innerHTML = '<i class="material-icons">qr_code</i>';
        qrCodeBtn.title = "QR Code";
        qrCodeBtn.onclick = () => {

            qrImage.src =
                "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(iframe.src);
            qrBannerName.textContent = item.path;

            setTimeout(() => {
                qrModal.classList.remove("hidden");
            }, 500);

        };

        actions.append(reloadBtn, openBtn, backupBtn, downloadBtn, qrCodeBtn);
        card.append(title, iframe, actions);
        bannerContainer.appendChild(card);
    });

    syncCreativeInURL(index);
    applyFilters();
}

async function loadComments() {

    const response = await fetch(
        `${COMMENTS_API}?action=getAllComments&creative=${encodeURIComponent(currentCreative.creativeName)}`
    );

    const comments = await response.json();

    allComments = comments;
    updateCommentsDashboardBadge(allComments);

    populateFilters(allComments);
    renderFilteredComments();
}

function renderComments(comments) {

    const list = document.getElementById("allCommentsList");

    list.innerHTML = "";

    if (!comments.length) {
        list.innerHTML = `
            <div class="no-comments">
                No comments yet.
            </div>
        `;
        return;
    }

    // Show creative name once
    list.innerHTML = `
        <div class="comments-header">
            <span>${comments[0].creative}</span>
        </div>
    `;

    comments.forEach(comment => {

        const card = document.createElement("div");
        card.className = "dashboard-comment";

        card.innerHTML = `
            <div class="comment-meta">

                <i class="material-icons">person</i>
                ${comment.reviewer}

                &nbsp;&nbsp;•&nbsp;&nbsp;

                <i class="material-icons">schedule</i>
                ${new Date(comment.timestamp).toLocaleString()}

                &nbsp;&nbsp;•&nbsp;&nbsp;

                <i class="material-icons">check_circle</i>

                <select
                    class="comment-status"
                    data-id="${comment.id}"
                >
                    <option value="Pending"
                        ${comment.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="Resolved"
                        ${comment.status === "Resolved" ? "selected" : ""}>
                        Resolved
                    </option>
                </select>

                

            </div>

           <div class="comment-body">
    <i class="material-icons">comment</i>
    ${comment.comment}
</div>

<div class="comment-actions">

    <button
        class="edit-comment-btn"
        data-id="${comment.id}"
        title="Edit Comment">
        <i class="material-icons">edit</i>
        
    </button>

    <button
        class="delete-comment-btn"
        data-id="${comment.id}"
        title="Delete Comment">
        <i class="material-icons">delete</i>
        
    </button>

</div>
        `;

        list.appendChild(card);

    });

}

const commentsList = document.getElementById("allCommentsList");

commentsList.addEventListener("click", async (e) => {

    /* ---------------- Edit ---------------- */

    const editBtn = e.target.closest(".edit-comment-btn");

    if (editBtn) {

        const commentId = editBtn.dataset.id;

        const comment = allComments.find(
            c => String(c.id) === String(commentId)
        );

        if (!comment) return;

        dashboardComment.value = comment.comment;
        reviewerName.value = comment.reviewer;

        editingCommentId = comment.id;

        submitBtn.textContent = "Update Comment";

        return;
    }

    /* ---------------- Delete ---------------- */

    const deleteBtn = e.target.closest(".delete-comment-btn");

    if (deleteBtn) {

        const commentId = deleteBtn.dataset.id;

        if (!confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        const response = await fetch(COMMENTS_API, {
            method: "POST",
            body: JSON.stringify({
                action: "deleteComment",
                commentId
            })
        });

        const result = await response.json();

        if (result.success) {
            await loadComments();
        } else {
            alert(result.message || "Failed to delete comment.");
        }
    }

});

commentsList.addEventListener("change", async (e) => {

    if (!e.target.classList.contains("comment-status")) {
        return;
    }

    const commentId = e.target.dataset.id;
    const status = e.target.value;

    const response = await fetch(COMMENTS_API, {
        method: "POST",
        body: JSON.stringify({
            action: "updateCommentStatus",
            commentId,
            status
        })
    });

    const result = await response.json();

        if (result.success) {
        const comment = allComments.find(
            c => String(c.id) === String(commentId)
        );
        if (comment) {
            comment.status = status;
        }
        renderFilteredComments();
    }
});

async function submitComment() {

    const reviewer = localStorage.getItem("reviewerName")

    const comment = document
        .getElementById("dashboardComment")
        .value
        .trim();

    if (!reviewer || !comment) {
        alert("Please enter your name and comment.");
        return;
    }

    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    try {

        const payload = editingCommentId
          ? {
              action: "updateComment",
              commentId: editingCommentId,
              reviewer,
              comment
          }
          : {
              action: "addComment",
              creative: currentCreative.creativeName,
              reviewer,
              comment
          };

      const response = await fetch(COMMENTS_API, {
          method: "POST",
          body: JSON.stringify(payload)
      });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        await response.json();

        document.getElementById("dashboardComment").value = "";

        await loadComments();

    } catch (error) {

        console.error(error);
        alert("Failed to submit comment.");

    } finally {

        submitBtn.textContent = "Submit";
        submitBtn.disabled = false;
    }
}

document.getElementById("submitDashboardComment").addEventListener("click", submitComment);
document.getElementById("clearDashboardComment").addEventListener("click", () => {
    document.getElementById("dashboardComment").value = "";
});

function updateCommentSummary(comments) {

    const total = comments.length;

    const pending = comments.filter(
        c => c.status === "Pending"
    ).length;

    const resolved = comments.filter(
        c => c.status === "Resolved"
    ).length;

    document.getElementById("totalComments").textContent = total;
    document.getElementById("pendingComments").textContent = pending;
    document.getElementById("resolvedComments").textContent = resolved;

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
        const res = await fetch(url, {
            method: "HEAD"
        });
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
    // populateBannerSizeDropdown();

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

    console.log(currentCommentBanner)

    document.getElementById("commentBannerName").textContent = item.path;

    document.getElementById("commentName").value = reviewerName;

    document.getElementById("commentText").value = "";

    document.getElementById("commentModal")
        .classList.remove("hidden");

    loadComments();
}

allCommentsBtn.addEventListener("click", openAllCommentsModal);
async function openAllCommentsModal() {

    if (!reviewerName) {

        reviewerName = prompt("Enter your name to leave a comment");

        if (!reviewerName) return;

        localStorage.setItem(
            "reviewerName",
            reviewerName
        );
    }

    const list = document.getElementById("allCommentsList");

    list.innerHTML = "<div>Loading comments...</div>";

    document.getElementById("allCommentsModal").classList.remove("hidden");

    const response =
        await fetch(
            `${COMMENTS_API}?action=getAllComments&creative=${encodeURIComponent(currentCreative.creativeName)}`
        )

    const comments = await response.json();
    allComments = comments;
    // renderComments(comments);
    populateFilters(allComments);
    renderFilteredComments();
}

function populateFilters(comments) {

    const reviewerFilter = document.getElementById("reviewerFilter");

    const reviewers = [...new Set(comments.map(c => c.reviewer))].sort();

    reviewerFilter.innerHTML =
        `<option value="">All Reviewers</option>`;

    reviewers.forEach(name => {
        reviewerFilter.innerHTML += `<option value="${name}">${name}</option>`;
    });

}

function renderFilteredComments() {

    let filtered = [...allComments];

    const reviewer = reviewerFilter.value;
    const status = statusFilter.value;
    const sort = sortComments.value;

    if (reviewer) {
        filtered = filtered.filter(c => c.reviewer === reviewer);
    }

    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }

    filtered.sort((a, b) => {

    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();

    if (sort === "newest") {
        return dateB - dateA;
    }

    return dateA - dateB;

});
    updateCommentSummary(filtered);
    renderComments(filtered);
}

sortComments.addEventListener("change", renderFilteredComments);
reviewerFilter.addEventListener("change", renderFilteredComments);
statusFilter.addEventListener("change", renderFilteredComments);
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

clearFiltersBtn.addEventListener("click", () => {

    document.getElementById("sortComments").value = "newest";
    document.getElementById("reviewerFilter").value = "";
    document.getElementById("statusFilter").value = "";

    renderFilteredComments();

});

const allCommentsModal = document.getElementById("allCommentsModal");
const closeAllComments = document.getElementById("closeAllComments");

closeAllComments.addEventListener("click", () => {
    allCommentsModal.classList.add("hidden");
});

allCommentsModal.addEventListener("click", e => {
    if (e.target === allCommentsModal) {
        allCommentsModal.classList.add("hidden");
    }
});

function updateCommentsDashboardBadge(comments){

    const badge = document.getElementById("commentsDashboardBadge");

    const count = comments.length;

    badge.textContent = count;

    badge.style.display = count > 0 ? "flex" : "none";

}

/* ------------------------------------------------------------------
   BACK TO TOP
------------------------------------------------------------------ */

window.addEventListener("scroll", () => {
    backToTopBtn.style.display = window.scrollY > 100 ? "flex" : "none";
});

backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* ------------------------------------------------------------------
   INITIAL LOAD
------------------------------------------------------------------ */

const initialIndex = getCreativeIndexFromURL();
creativeSelector.value = initialIndex;
loadCreative(initialIndex);

creativeSelector.addEventListener("change", e => loadCreative(e.target.value));