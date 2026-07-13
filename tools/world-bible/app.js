(function () {
  const data = window.SSB_WORLD_BIBLE;
  let projectData = { books: [], spreads: [], assets: [] };
  let books = data.books.slice();
  let spreads = data.spreads.slice();
  let assets = data.assets.slice();
  let assetById = new Map(assets.map((asset) => [asset.id, asset]));
  let spreadById = new Map(spreads.map((spread) => [spread.id, spread]));
  let bookById = new Map(books.map((book) => [book.id, book]));
  const progressKey = "ssb-world-bible-progress-v1";

  let selectedView = "dashboard";
  let selectedBookId = data.books[0].id;
  let selectedSpreadId = data.books[0].currentSpreadId;
  let searchTerm = "";
  let assetFilter = "all";
  let progress = loadProgress();
  const markdownCache = {};
  const markdownStatus = {};

  const els = {
    viewTitle: document.getElementById("view-title"),
    search: document.getElementById("global-search"),
    navLinks: Array.from(document.querySelectorAll(".nav-link")),
    views: Array.from(document.querySelectorAll("[data-view-panel]")),
    dashboardGrid: document.getElementById("dashboard-grid"),
    activeBookCard: document.getElementById("active-book-card"),
    currentPackage: document.getElementById("current-package"),
    bookSelect: document.getElementById("book-select"),
    addBook: document.getElementById("add-book"),
    addSpread: document.getElementById("add-spread"),
    spreadSelect: document.getElementById("spread-select"),
    spreadList: document.getElementById("spread-list"),
    spreadDetail: document.getElementById("spread-detail"),
    promptOutput: document.getElementById("prompt-output"),
    copyPrompt: document.getElementById("copy-prompt"),
    downloadPrompt: document.getElementById("download-prompt"),
    assetGrid: document.getElementById("asset-grid"),
    assetFilter: document.getElementById("asset-filter"),
    pipelineBoard: document.getElementById("pipeline-board"),
    exportProgress: document.getElementById("export-progress"),
    resetProgress: document.getElementById("reset-progress"),
    dialog: document.getElementById("asset-dialog"),
    dialogBody: document.getElementById("asset-dialog-body"),
    dialogClose: document.querySelector(".dialog-close"),
    toast: document.getElementById("toast")
  };

  init();

  async function init() {
    await loadProjectData();
    els.navLinks.forEach((link) => {
      link.addEventListener("click", () => setView(link.dataset.view));
    });

    els.search.addEventListener("input", () => {
      searchTerm = els.search.value.trim().toLowerCase();
      render();
    });

    els.bookSelect.addEventListener("change", () => {
      selectedBookId = els.bookSelect.value;
      const firstSpread = activeSpreads()[0];
      selectedSpreadId = firstSpread ? firstSpread.id : "";
      if (selectedSpreadId) loadMarkdownBrief(selectedSpreadId);
      render();
    });

    els.spreadSelect.addEventListener("change", () => {
      selectedSpreadId = els.spreadSelect.value;
      loadMarkdownBrief(selectedSpreadId);
      setView("book");
    });

    els.assetFilter.addEventListener("change", () => {
      assetFilter = els.assetFilter.value;
      renderAssetLibrary();
    });

    els.copyPrompt.addEventListener("click", copyPrompt);
    els.downloadPrompt.addEventListener("click", downloadPrompt);
    els.addBook.addEventListener("click", addBook);
    els.addSpread.addEventListener("click", addSpread);
    els.exportProgress.addEventListener("click", exportProgress);
    els.resetProgress.addEventListener("click", resetProgress);
    els.dialogClose.addEventListener("click", () => els.dialog.close());

    document.addEventListener("click", (event) => {
      const saveBrief = event.target.closest("[data-save-brief]");
      if (saveBrief) {
        saveMarkdownBrief(saveBrief.dataset.saveBrief);
      }

      const reloadBrief = event.target.closest("[data-reload-brief]");
      if (reloadBrief) {
        loadMarkdownBrief(reloadBrief.dataset.reloadBrief, { force: true });
      }

      const saveSpread = event.target.closest("[data-save-spread]");
      if (saveSpread) {
        saveSpreadDetails(saveSpread.dataset.saveSpread);
      }

      const addReference = event.target.closest("[data-add-reference]");
      if (addReference) {
        attachReference(addReference.dataset.addReference);
      }

      const addCustomReference = event.target.closest("[data-add-custom-reference]");
      if (addCustomReference) {
        addImagePathReference(addCustomReference.dataset.addCustomReference);
      }

      const removeReference = event.target.closest("[data-remove-reference]");
      if (removeReference) {
        removeReferenceFromSpread(removeReference.dataset.removeReference, removeReference.dataset.assetId);
      }

      const setSpreadArt = event.target.closest("[data-set-spread-art]");
      if (setSpreadArt) {
        setActualSpreadImage(setSpreadArt.dataset.setSpreadArt, setSpreadArt.dataset.assetId);
      }

      const preview = event.target.closest("[data-preview-asset]");
      if (preview) {
        showAssetDialog(preview.dataset.previewAsset);
      }

      const copyAssetPath = event.target.closest("[data-copy-asset-path]");
      if (copyAssetPath) {
        copyPathForAsset(copyAssetPath.dataset.copyAssetPath);
      }

      const selectSpread = event.target.closest("[data-select-spread]");
      if (selectSpread) {
        selectedSpreadId = selectSpread.dataset.selectSpread;
        loadMarkdownBrief(selectedSpreadId);
        setView("book");
      }

      const stageToggle = event.target.closest("[data-stage-toggle]");
      if (stageToggle) {
        updateStage(stageToggle.dataset.spreadId, stageToggle.dataset.stageToggle, stageToggle.checked);
      }
    });

    renderSpreadSelect();
    loadMarkdownBrief(selectedSpreadId);
    render();
  }

  function setView(view) {
    selectedView = view;
    els.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === view));
    els.views.forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === view));
    els.viewTitle.textContent = titleForView(view);
    render();
  }

  function titleForView(view) {
    return {
      dashboard: "Dashboard",
      book: "Books",
      prompt: "Prompt Builder",
      library: "Asset Library",
      pipeline: "KDP Pipeline"
    }[view] || "World Bible";
  }

  async function loadProjectData() {
    try {
      const response = await fetch("/api/project-data");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      projectData = await response.json();
    } catch (error) {
      projectData = loadLocalProjectData();
    }
    refreshRuntimeData();
  }

  function refreshRuntimeData() {
    books = mergeById(data.books, projectData.books || []);
    spreads = mergeById(data.spreads, projectData.spreads || []);
    assets = mergeById(data.assets, projectData.assets || []);
    assetById = new Map(assets.map((asset) => [asset.id, asset]));
    spreadById = new Map(spreads.map((spread) => [spread.id, spread]));
    bookById = new Map(books.map((book) => [book.id, book]));
  }

  function mergeById(baseItems, projectItems) {
    const merged = new Map(baseItems.map((item) => [item.id, { ...item }]));
    projectItems.forEach((item) => {
      merged.set(item.id, { ...(merged.get(item.id) || {}), ...item });
    });
    return Array.from(merged.values());
  }

  function loadLocalProjectData() {
    try {
      const stored = JSON.parse(localStorage.getItem("ssb-world-bible-project-data-v1"));
      if (stored && typeof stored === "object") return stored;
    } catch (error) {
      return { books: [], spreads: [], assets: [] };
    }
    return { books: [], spreads: [], assets: [] };
  }

  async function saveProjectData() {
    localStorage.setItem("ssb-world-bible-project-data-v1", JSON.stringify(projectData, null, 2));
    refreshRuntimeData();
    try {
      const response = await fetch("/api/project-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      toast("Book and spread changes saved.");
    } catch (error) {
      toast("Saved in this browser. Open with the local server to save project files.");
    }
  }

  function activeBook() {
    return bookById.get(selectedBookId) || books[0];
  }

  function activeSpreads() {
    return spreads.filter((spread) => spread.bookId === selectedBookId)
      .sort((a, b) => Number(a.spread) - Number(b.spread));
  }

  function render() {
    renderSpreadSelect();
    renderDashboard();
    renderBook();
    renderPrompt();
    renderAssetLibrary();
    renderPipeline();
  }

  function renderDashboard() {
    const bookSpreads = activeSpreads();
    const total = bookSpreads.length;
    const stageCounts = data.pipelineStages.reduce((acc, stage) => {
      acc[stage.id] = bookSpreads.filter((spread) => isStageDone(spread.id, stage.id)).length;
      return acc;
    }, {});
    const listedRefs = new Set(bookSpreads.flatMap((spread) => spread.references || [])).size;
    const missing = getMissingReferences(bookSpreads).length;
    const nextSpread = bookSpreads.find((spread) => getSpreadBlockers(spread).length)
      || bookSpreads.find((spread) => !isStageDone(spread.id, "final"))
      || bookSpreads[0];

    els.dashboardGrid.innerHTML = [
      statCard(total, "Book spreads", "gold"),
      statCard(stageCounts.prompt || 0, "Prompt-ready spreads", "orange"),
      statCard(stageCounts.preflight || 0, "Preflight-ready spreads", "green"),
      statCard(missing, "Missing reference IDs", missing ? "orange" : "green")
    ].join("");

    const book = activeBook();
    const cover = assetById.get(book.coverAssetId);
    els.activeBookCard.innerHTML = `
      <div class="book-summary">
        ${cover ? `<img src="${cover.path}" alt="${escapeHtml(book.title)} cover">` : ""}
        <div>
          <h3>${escapeHtml(book.title)}</h3>
          <p>${escapeHtml(book.goal)}</p>
          <div class="pill-row">
            <span class="pill gold">${total} spreads</span>
            <span class="pill green">${listedRefs} reference links</span>
            <span class="pill orange">${escapeHtml(book.printTarget)}</span>
          </div>
        </div>
      </div>
    `;

    const currentSpread = spreadById.get(selectedSpreadId);
    els.currentPackage.innerHTML = currentSpread ? renderPackageSummary(currentSpread, nextSpread) : `<p>No spread has been added for this book yet.</p>`;
  }

  function statCard(value, label, color) {
    return `<section class="panel stat-card ${color || ""}"><strong>${value}</strong><span>${escapeHtml(label)}</span></section>`;
  }

  function renderSpreadSelect() {
    const bookOptions = books.map((book) => (
      `<option value="${book.id}">${escapeHtml(book.title)}</option>`
    )).join("");
    els.bookSelect.innerHTML = bookOptions;
    els.bookSelect.value = selectedBookId;

    const bookSpreads = activeSpreads();
    if (!bookSpreads.some((spread) => spread.id === selectedSpreadId)) {
      selectedSpreadId = bookSpreads[0] ? bookSpreads[0].id : "";
    }
    els.spreadSelect.innerHTML = bookSpreads.map((spread) => (
      `<option value="${spread.id}">${pad(spread.spread)} - ${escapeHtml(spread.title)}</option>`
    )).join("");
    els.spreadSelect.disabled = bookSpreads.length === 0;
    els.spreadSelect.value = selectedSpreadId;
  }

  function renderBook() {
    const spreads = filteredSpreads();
    els.spreadList.innerHTML = `<div class="spread-list-items">${spreads.map(renderSpreadButton).join("")}</div>`;
    els.spreadSelect.value = selectedSpreadId;
    const spread = spreadById.get(selectedSpreadId) || activeSpreads()[0];
    els.spreadDetail.innerHTML = spread ? renderSpreadDetail(spread) : renderEmptyBookState();
  }

  function renderSpreadButton(spread) {
    return `
      <button class="spread-button ${spread.id === selectedSpreadId ? "active" : ""}" type="button" data-select-spread="${spread.id}">
        <span class="spread-number">${pad(spread.spread)}</span>
        <span>
          <strong>${escapeHtml(spread.title)}</strong>
          <span>${escapeHtml(spread.beat)} | Pages ${escapeHtml(spread.pages)}</span>
        </span>
      </button>
    `;
  }

  function renderEmptyBookState() {
    const book = activeBook();
    return `
      <div class="empty-state">
        <h2>${escapeHtml(book.title)}</h2>
        <p>This book does not have any spreads yet. Add the first spread to start building the production plan.</p>
        <button class="primary-button" type="button" id="empty-add-spread" onclick="window.SSB_APP.addSpread()">Add first spread</button>
      </div>
    `;
  }

  function renderSpreadDetail(spread) {
    const actualSpread = assetById.get(spread.artAssetId);
    const missing = getMissingReferences([spread]);
    const blockers = getSpreadBlockers(spread);
    const nextAction = getNextAction(spread);
    const neighbors = getNeighborSpreads(spread);
    const brief = markdownCache[spread.id] || buildBriefMarkdown(spread);
    const briefStatus = markdownStatus[spread.id] || "generated fallback";
    const briefPath = markdownPathForSpread(spread);
    const stageChecks = data.pipelineStages.map((stage) => (
      `<label class="check-item">
        <input type="checkbox" data-stage-toggle="${stage.id}" data-spread-id="${spread.id}" ${isStageDone(spread.id, stage.id) ? "checked" : ""}>
        <span>${escapeHtml(stage.label)}</span>
      </label>`
    )).join("");

    return `
      <article>
        <div class="spread-hero">
          ${actualSpread ? `<button class="asset-card spread-art-card" type="button" data-preview-asset="${actualSpread.id}" aria-label="Preview ${escapeHtml(actualSpread.title)}">
            <img class="scene-preview" src="${actualSpread.path}" alt="${escapeHtml(actualSpread.title)}">
            <strong>${escapeHtml(actualSpread.title)}</strong>
            <small>Actual spread artwork</small>
          </button>` : `<div class="spread-art-placeholder"><strong>Not Started</strong><small>No actual spread artwork has been attached yet.</small></div>`}
          <div class="spread-copy">
            <p class="eyebrow">${escapeHtml(spread.beat)} | Spread ${pad(spread.spread)} | Pages ${escapeHtml(spread.pages)}</p>
            <h2>${escapeHtml(spread.title)}</h2>
            <div class="meta-row">
              <span class="pill gold">${escapeHtml(spread.status)}</span>
              <span class="pill green">${escapeHtml(spread.environmentState)}</span>
              <span class="pill orange">${escapeHtml(spread.location)}</span>
              <span class="pill ${blockers.length ? "orange" : "green"}">${blockers.length ? "Needs attention" : "Ready for next step"}</span>
            </div>
            <p><strong>Story text:</strong> ${escapeHtml(spread.storyText)}</p>
            <p><strong>Illustration purpose:</strong> ${escapeHtml(spread.objective)}</p>
            <p><strong>Camera:</strong> ${escapeHtml(spread.camera)}</p>
            <p><strong>Next action:</strong> ${escapeHtml(nextAction)}</p>
            ${missing.length ? `<p class="pill orange">Missing reference IDs: ${missing.map(escapeHtml).join(", ")}</p>` : `<p class="pill green">All listed reference IDs resolve in the tool.</p>`}
            <div class="button-row">
              <button class="primary-button" type="button" data-view-jump="prompt" onclick="window.SSB_APP.setView('prompt')">Build prompt</button>
              <button class="ghost-button" type="button" onclick="window.SSB_APP.downloadManifest('${spread.id}')">Download reference manifest</button>
            </div>
          </div>
        </div>
        <section class="readiness-grid">
          <div class="readiness-card ${blockers.length ? "warning" : "ready"}">
            <h3>${blockers.length ? "Readiness blockers" : "Ready check"}</h3>
            ${blockers.length
              ? `<ul>${blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : `<p>This spread has the basic brief, references, and asset links needed for prompt work.</p>`}
          </div>
          <div class="readiness-card">
            <h3>Neighbor context</h3>
            <div class="neighbor-row">
              ${renderNeighborCard("Previous", neighbors.previous)}
              ${renderNeighborCard("Current", spread)}
              ${renderNeighborCard("Next", neighbors.next)}
            </div>
          </div>
        </section>
        <section class="readiness-grid canon-grid">
          ${renderCanonCard(spread)}
          ${renderQualityGateCard(spread)}
        </section>
        <section class="asset-section brief-panel">
          <div class="brief-header">
            <div>
              <h3>Spread setup</h3>
              <p>Edit the spread record used by the tracker and prompt builder.</p>
            </div>
            <button class="primary-button" type="button" data-save-spread="${spread.id}">Save spread setup</button>
          </div>
          <div class="form-grid">
            ${fieldInput(spread.id, "title", "Title", spread.title)}
            ${fieldInput(spread.id, "pages", "Pages", spread.pages)}
            ${fieldInput(spread.id, "beat", "Beat", spread.beat)}
            ${fieldInput(spread.id, "location", "Location", spread.location)}
            ${fieldInput(spread.id, "environmentState", "Environment state", spread.environmentState)}
            ${fieldInput(spread.id, "camera", "Camera", spread.camera)}
            ${assetSelectInput(spread.id, "artAssetId", "Actual spread image", spread.artAssetId)}
            ${fieldInput(spread.id, "lighting", "Lighting", spread.lighting)}
            ${fieldInput(spread.id, "colorScript", "Color script", spread.colorScript)}
            ${fieldInput(spread.id, "storyText", "Short caption/story text", spread.storyText)}
            ${fieldInput(spread.id, "objective", "Illustration purpose", spread.objective)}
            ${fieldInput(spread.id, "primaryRead", "Primary visual read", spread.primaryRead)}
            ${fieldInput(spread.id, "emotionalTurn", "Emotional turn", spread.emotionalTurn)}
            ${fieldInput(spread.id, "conflict", "Conflict or tension", spread.conflict)}
            ${fieldInput(spread.id, "readerDiscovery", "Reader discovery", spread.readerDiscovery)}
            ${fieldInput(spread.id, "pageTurn", "Page-turn intent", spread.pageTurn)}
            ${fieldInput(spread.id, "visualInfo", "Important visual information", spread.visualInfo)}
            ${fieldInput(spread.id, "withheld", "What to withhold", spread.withheld)}
            ${fieldInput(spread.id, "avoid", "Avoid", spread.avoid)}
            ${fieldInput(spread.id, "printNotes", "Photoshop / InDesign notes", spread.printNotes)}
          </div>
        </section>
        <section class="asset-section">
          <div class="brief-header">
            <div>
              <h3>Prompt photos and references</h3>
              <p>Select the images that should travel with this spread's prompt.</p>
            </div>
            <div class="reference-picker">
              <select id="reference-picker-${spread.id}" aria-label="Choose image reference">
                ${assets.map((asset) => `<option value="${asset.id}">${escapeHtml(asset.title)} (${escapeHtml(asset.group)})</option>`).join("")}
              </select>
              <button class="ghost-button" type="button" data-add-reference="${spread.id}">Add image</button>
              <button class="ghost-button" type="button" data-add-custom-reference="${spread.id}">Add image path</button>
            </div>
          </div>
          ${renderReferenceTierSummary(spread)}
          <div class="reference-grid">${(spread.references || []).map((assetId) => renderAttachedAssetCard(spread.id, assetId)).join("")}</div>
        </section>
        <section class="asset-section brief-panel">
          <div class="brief-header">
            <div>
              <h3>Living spread brief</h3>
              <p>${escapeHtml(briefPath)} | ${escapeHtml(briefStatus)}</p>
            </div>
            <div class="button-row">
              <button class="primary-button" type="button" data-save-brief="${spread.id}">Save .md</button>
              <button class="ghost-button" type="button" data-reload-brief="${spread.id}">Reload .md</button>
            </div>
          </div>
          <textarea class="brief-editor" id="brief-editor-${spread.id}" spellcheck="true" aria-label="Markdown brief for ${escapeHtml(spread.title)}">${escapeHtml(brief)}</textarea>
        </section>
        <section class="asset-section">
          <h3>Production checklist</h3>
          <div class="checklist">${stageChecks}</div>
        </section>
      </article>
    `;
  }

  function fieldInput(spreadId, field, label, value) {
    const longText = [
      "storyText",
      "objective",
      "primaryRead",
      "emotionalTurn",
      "conflict",
      "readerDiscovery",
      "pageTurn",
      "visualInfo",
      "withheld",
      "avoid",
      "printNotes"
    ].includes(field);
    const control = longText
      ? `<textarea id="spread-${spreadId}-${field}" rows="3">${escapeHtml(value || "")}</textarea>`
      : `<input id="spread-${spreadId}-${field}" type="text" value="${escapeAttr(value || "")}">`;
    return `
      <label class="form-field ${longText ? "wide" : ""}">
        <span>${escapeHtml(label)}</span>
        ${control}
      </label>
    `;
  }

  function assetSelectInput(spreadId, field, label, value) {
    const options = [
      `<option value="">Not Started</option>`,
      ...assets.map((asset) => `<option value="${asset.id}" ${asset.id === value ? "selected" : ""}>${escapeHtml(asset.title)} (${escapeHtml(asset.group)})</option>`)
    ].join("");
    return `
      <label class="form-field">
        <span>${escapeHtml(label)}</span>
        <select id="spread-${spreadId}-${field}">
          ${options}
        </select>
      </label>
    `;
  }

  function renderPackageSummary(spread, nextSpread) {
    const missing = getMissingReferences([spread]);
    const blockers = getSpreadBlockers(spread);
    const unresolvedConflicts = getUnresolvedConflicts(spread);
    return `
      <div class="spread-copy">
        <p class="eyebrow">${escapeHtml(spread.id)}</p>
        <h3>${escapeHtml(spread.title)}</h3>
        <p>${escapeHtml(spread.objective)}</p>
        <p><strong>Next action:</strong> ${escapeHtml(getNextAction(spread))}</p>
        <div class="pill-row">
          <span class="pill gold">${(spread.references || []).length} required refs</span>
          <span class="pill ${missing.length ? "orange" : "green"}">${missing.length ? missing.length + " missing IDs" : "references resolved"}</span>
          <span class="pill ${blockers.length ? "orange" : "green"}">${blockers.length ? blockers.length + " blockers" : "brief ready"}</span>
          <span class="pill ${unresolvedConflicts.length ? "orange" : "green"}">${unresolvedConflicts.length ? "canon conflict" : "canon clear"}</span>
        </div>
        ${nextSpread && nextSpread.id !== spread.id ? `<p><strong>Queue focus:</strong> ${escapeHtml(nextSpread.title)} - ${escapeHtml(getNextAction(nextSpread))}</p>` : ""}
        <div class="button-row">
          <button class="primary-button" type="button" data-select-spread="${spread.id}">Open spread</button>
          <button class="ghost-button" type="button" onclick="window.SSB_APP.downloadManifest('${spread.id}')">Download manifest</button>
        </div>
      </div>
    `;
  }

  function renderCanonCard(spread) {
    const book = bookById.get(spread.bookId) || activeBook();
    const conflicts = spread.conflicts || [];
    const unresolved = getUnresolvedConflicts(spread);
    const statusClass = unresolved.length || !spread.approvedCanonical ? "warning" : "ready";
    return `
      <div class="readiness-card ${statusClass}">
        <h3>Canonical record</h3>
        <p><strong>Status:</strong> ${spread.approvedCanonical ? "Approved canonical" : "Needs canon approval"}</p>
        <p><strong>Manifest:</strong> ${escapeHtml(book.manifestPath || "Not assigned")}</p>
        <p><strong>Decision:</strong> ${escapeHtml(optionalText(spread.canonicalDecision, "Use the spread setup until the team records a canonical decision."))}</p>
        ${conflicts.length
          ? `<ul>${conflicts.map((item) => `<li><strong>${escapeHtml(item.status || "open")}:</strong> ${escapeHtml(item.issue || item.source || "Conflict noted.")} ${item.decision ? `Decision: ${escapeHtml(item.decision)}` : ""}</li>`).join("")}</ul>`
          : `<p>No source conflicts recorded.</p>`}
      </div>
    `;
  }

  function renderQualityGateCard(spread) {
    const gates = qualityGateRows(spread);
    const active = Boolean(spread.qualityGates);
    const failed = active && gates.some((gate) => !gate.done);
    return `
      <div class="readiness-card ${failed ? "warning" : "ready"}">
        <h3>Award-quality gates</h3>
        <p>${active ? "These gates must pass before prompt/art approval." : "Add gate decisions when this spread enters prompt approval."}</p>
        <div class="quality-list">
          ${gates.map((gate) => `
            <span class="quality-item ${gate.done ? "pass" : "open"}">
              <strong>${gate.done ? "Pass" : "Open"}</strong>
              ${escapeHtml(gate.label)}
            </span>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderReferenceTierSummary(spread) {
    const tiers = referenceTiersForSpread(spread);
    const sections = [
      ["Mandatory", tiers.mandatory, "gold"],
      ["Conditional", tiers.conditional, "green"],
      ["Inspirational", tiers.inspirational, "orange"]
    ];
    return `
      <div class="reference-tier-grid">
        ${sections.map(([label, ids, tone]) => `
          <div class="reference-tier">
            <span class="pill ${tone}">${label}</span>
            ${ids.length
              ? `<ul>${ids.map((id) => `<li>${escapeHtml(id)}${assetById.has(id) ? ` - ${escapeHtml(assetById.get(id).title)}` : " - missing asset"}</li>`).join("")}</ul>`
              : `<p>None listed.</p>`}
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderAssetCard(assetId) {
    const asset = assetById.get(assetId);
    if (!asset) {
      return `<div class="asset-card"><strong>${escapeHtml(assetId)}</strong><small>Missing from data.js</small></div>`;
    }

    return `
      <article class="asset-card">
        <button type="button" class="asset-preview" data-preview-asset="${asset.id}" aria-label="Preview ${escapeHtml(asset.title)}">
          <img src="${asset.path}" alt="${escapeHtml(asset.title)}" loading="lazy">
          <strong>${escapeHtml(asset.title)}</strong>
          <small>${escapeHtml(asset.group)} | ${escapeHtml(asset.purpose)}</small>
        </button>
        <div class="asset-actions">
          <a href="${asset.path}" target="_blank" rel="noopener">Open file</a>
          <a href="${asset.path}" download>Download</a>
          <button type="button" data-copy-asset-path="${asset.id}">Copy path</button>
          <button type="button" data-preview-asset="${asset.id}">Preview</button>
        </div>
      </article>
    `;
  }

  function renderAttachedAssetCard(spreadId, assetId) {
    const asset = assetById.get(assetId);
    if (!asset) {
      return `<div class="asset-card"><strong>${escapeHtml(assetId)}</strong><small>Missing from asset library</small></div>`;
    }

    return `
      <article class="asset-card">
        <button type="button" class="asset-preview" data-preview-asset="${asset.id}" aria-label="Preview ${escapeHtml(asset.title)}">
          <img src="${asset.path}" alt="${escapeHtml(asset.title)}" loading="lazy">
          <strong>${escapeHtml(asset.title)}</strong>
          <small>${escapeHtml(asset.group)} | ${escapeHtml(asset.purpose)}</small>
        </button>
        <div class="asset-actions">
          <a href="${asset.path}" target="_blank" rel="noopener">Open file</a>
          <button type="button" data-copy-asset-path="${asset.id}">Copy path</button>
          <button type="button" data-set-spread-art="${spreadId}" data-asset-id="${asset.id}">Use as spread image</button>
          <button type="button" data-preview-asset="${asset.id}">Preview</button>
          <button type="button" data-remove-reference="${spreadId}" data-asset-id="${asset.id}">Remove</button>
        </div>
      </article>
    `;
  }

  function renderPrompt() {
    const spread = spreadById.get(selectedSpreadId);
    els.promptOutput.value = spread ? buildPrompt(spread) : "Add a spread first, then the prompt will appear here.";
  }

  function buildPrompt(spread) {
    const book = bookById.get(spread.bookId) || activeBook();
    const neighbors = getNeighborSpreads(spread);
    const refs = formatPromptReferences(spread);

    return [
      `# ${spread.id} - ${spread.title}`,
      "",
      `Book: ${book.title}`,
      `Pages: ${spread.pages}`,
      `Beat: ${spread.beat}`,
      `Location: ${spread.location}`,
      `Environmental state: ${spread.environmentState}`,
      `Camera: ${spread.camera}`,
      "",
      "Story caption / on-page text:",
      optionalText(spread.storyText, "No final caption yet. Leave room for a short child-readable caption."),
      "",
      "Spread purpose:",
      optionalText(spread.objective),
      "",
      "Primary visual read:",
      optionalText(spread.primaryRead, "Make the main story action readable at thumbnail size."),
      "",
      "Character acting and emotion:",
      optionalText(spread.emotionalTurn, "Show clear, warm, child-readable emotion."),
      "",
      "Conflict / tension:",
      optionalText(spread.conflict, "Keep the conflict emotionally clear without making it frightening."),
      "",
      "Reader discovery:",
      optionalText(spread.readerDiscovery, "Include one visual detail a child can notice after the first read."),
      "",
      "Lighting and color:",
      [
        optionalText(spread.lighting, "Warm cinematic children's book lighting."),
        optionalText(spread.colorScript, "Navy and gold brand foundation, orange for Bubble Boy, green for Captain Cash, purple only for Echo Ogre energy.")
      ].join(" "),
      "",
      "Continuity context:",
      `Previous spread: ${neighbors.previous ? neighbors.previous.title : "None"}.`,
      `Next spread: ${neighbors.next ? neighbors.next.title : "None"}.`,
      "",
      "Composition and layout:",
      [
        optionalText(spread.camera, "Use a clear storybook composition."),
        "Leave safe space for a short caption and protect the gutter/safe zones for InDesign."
      ].join(" "),
      "",
      "Important visual information:",
      optionalText(spread.visualInfo),
      "",
      "What to withhold:",
      optionalText(spread.withheld, "Do not reveal future story answers early."),
      "",
      "Avoid:",
      optionalText(spread.avoid, "Avoid extra public-facing text, off-model characters, harsh violence, horror tone, and cluttered details that compete with the emotional beat."),
      "",
      "Sparkle Shield Bros art direction:",
      "Create a polished children's book spread in the Sparkle Shield Bros visual system. Keep characters on-model, prioritize clear emotion, readable silhouettes, warm family-centered stakes, Afrofuturist warmth, and a hopeful sense of repair.",
      "",
      "Required references:",
      refs || "- Add photos/reference images from the spread setup screen.",
      "",
      "Production notes:",
      optionalText(spread.printNotes, "- Prepare output for Photoshop cleanup and InDesign page layout."),
      "- Keep the spread cohesive with the approved Maplewood Terrace continuity.",
      "- Preserve the emotional rule: the environment reflects unresolved feelings and heals through calm, kindness, courage, and repair."
    ].join("\n");
  }

  function buildBriefMarkdown(spread) {
    const book = bookById.get(spread.bookId) || activeBook();
    const neighbors = getNeighborSpreads(spread);
    const blockers = getSpreadBlockers(spread);
    const qualityRows = qualityGateRows(spread);
    const conflicts = spread.conflicts || [];
    return [
      `# ${spread.beat} - ${spread.title}`,
      "",
      `Book: ${book.title}`,
      `Spread: ${pad(spread.spread)}`,
      `Pages: ${spread.pages}`,
      `Status: ${spread.status}`,
      `Canonical: ${spread.approvedCanonical ? "approved" : "needs review"}`,
      "",
      "## Story Text",
      optionalText(spread.storyText),
      "",
      "## Beat & Emotional Purpose",
      `Purpose: ${optionalText(spread.objective)}`,
      `Emotional turn: ${optionalText(spread.emotionalTurn)}`,
      `Conflict: ${optionalText(spread.conflict)}`,
      "",
      "## Reader Discovery",
      optionalText(spread.readerDiscovery),
      "",
      "## Visual Direction",
      `Location: ${spread.location}`,
      `Environmental state: ${spread.environmentState}`,
      `Camera: ${spread.camera}`,
      `Lighting: ${optionalText(spread.lighting)}`,
      `Color script: ${optionalText(spread.colorScript)}`,
      `Primary visual read: ${optionalText(spread.primaryRead)}`,
      `Important visual information: ${optionalText(spread.visualInfo)}`,
      `What to withhold: ${optionalText(spread.withheld)}`,
      `Avoid: ${optionalText(spread.avoid)}`,
      "",
      "## Adjacent Spread Context",
      `Previous: ${neighbors.previous ? `${neighbors.previous.id} - ${neighbors.previous.title}` : "None"}`,
      `Next: ${neighbors.next ? `${neighbors.next.id} - ${neighbors.next.title}` : "None"}`,
      "",
      "## Required References",
      formatBriefReferences(spread),
      "",
      "## Canonical Notes",
      `Manifest: ${book.manifestPath || "Not assigned"}`,
      `Decision: ${optionalText(spread.canonicalDecision, "No canonical decision recorded yet.")}`,
      conflicts.length ? conflicts.map((item) => `- ${item.status || "open"}: ${item.issue || item.source || "Conflict noted."}${item.decision ? ` Decision: ${item.decision}` : ""}`).join("\n") : "- No conflicts recorded.",
      "",
      "## Award-Quality Gates",
      qualityRows.map((gate) => `- [${gate.done ? "x" : " "}] ${gate.label}`).join("\n"),
      "",
      "## Readiness",
      blockers.length ? blockers.map((item) => `- [ ] ${item}`).join("\n") : "- [x] Basic brief and references are ready for the next production step.",
      `Next action: ${getNextAction(spread)}`,
      "",
      "## Prompt Draft",
      buildPrompt(spread),
      "",
      "## Production Notes",
      optionalText(spread.printNotes, "- Photoshop cleanup:\n- InDesign layout:"),
      "- Review notes:",
      "- KDP readiness:"
    ].join("\n");
  }

  function markdownPathForSpread(spread) {
    const book = bookById.get(spread.bookId) || activeBook();
    const folder = book.folder || (book.id === "EO" ? "EchoOgre" : book.id);
    return `assets/images/production/SparkleShieldUniverse/03_StoryContinuity/${folder}/Beat${pad(spread.spread)}/README.md`;
  }

  async function loadMarkdownBrief(spreadId, options = {}) {
    if (markdownCache[spreadId] && !options.force) return;
    markdownStatus[spreadId] = "loading from .md file";
    renderBook();

    try {
      const spread = spreadById.get(spreadId);
      const response = await fetch(markdownApiPath(spread));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      markdownCache[spreadId] = payload.content;
      markdownStatus[spreadId] = `loaded from ${payload.path}`;
    } catch (error) {
      const spread = spreadById.get(spreadId);
      markdownCache[spreadId] = markdownCache[spreadId] || buildBriefMarkdown(spread);
      markdownStatus[spreadId] = "not connected to save server; showing generated fallback";
    }

    if (selectedSpreadId === spreadId) {
      renderBook();
    }
  }

  async function saveMarkdownBrief(spreadId) {
    const editor = document.getElementById(`brief-editor-${spreadId}`);
    if (!editor) return;

    const content = editor.value;
    markdownCache[spreadId] = content;
    markdownStatus[spreadId] = "saving...";
    renderBook();

    try {
      const spread = spreadById.get(spreadId);
      const response = await fetch(markdownApiPath(spread), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      markdownStatus[spreadId] = `saved to ${payload.path}`;
      toast("Spread brief saved to its .md file.");
    } catch (error) {
      markdownStatus[spreadId] = "save failed; run tools/world-bible/server.py";
      toast("Save failed. Open the GUI with the World Bible local server.");
    }

    renderBook();
  }

  function markdownApiPath(spread) {
    if (!spread) return `/api/spreads/${selectedSpreadId}/markdown`;
    if (spread.bookId === "EO") return `/api/spreads/${spread.id}/markdown`;
    return `/api/books/${encodeURIComponent(spread.bookId)}/spreads/${encodeURIComponent(spread.id)}/markdown`;
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(els.promptOutput.value);
      toast("Prompt copied.");
    } catch (error) {
      els.promptOutput.select();
      toast("Prompt selected. Use copy from the keyboard.");
    }
  }

  function downloadPrompt() {
    const spread = spreadById.get(selectedSpreadId);
    downloadText(`${spread.id}_Prompt.md`, els.promptOutput.value);
  }

  function downloadManifest(spreadId) {
    const spread = spreadById.get(spreadId);
    const blockers = getSpreadBlockers(spread);
    const book = bookById.get(spread.bookId) || activeBook();
    const conflicts = spread.conflicts || [];
    const text = [
      `# ${spread.id} Reference Package`,
      "",
      `Title: ${spread.title}`,
      `Pages: ${spread.pages}`,
      `Beat: ${spread.beat}`,
      `Canonical: ${spread.approvedCanonical ? "approved" : "needs review"}`,
      `Manifest: ${book.manifestPath || "Not assigned"}`,
      `Next action: ${getNextAction(spread)}`,
      "",
      "## Readiness",
      blockers.length ? blockers.map((item) => `- [ ] ${item}`).join("\n") : "- [x] Basic brief and references are ready.",
      "",
      "## Canonical Decision",
      optionalText(spread.canonicalDecision, "No canonical decision recorded yet."),
      conflicts.length ? conflicts.map((item) => `- ${item.status || "open"} | ${item.source || "source"} | ${item.issue || "Conflict noted."} | ${item.decision || "No decision yet."}`).join("\n") : "- No conflicts recorded.",
      "",
      "## Award-Quality Gates",
      qualityGateRows(spread).map((gate) => `- [${gate.done ? "x" : " "}] ${gate.label}`).join("\n"),
      "",
      "## Reference Files",
      formatBriefReferences(spread),
      "",
      "## Prompt",
      buildPrompt(spread)
    ].join("\n");
    downloadText(`${spread.id}_Reference_Package.md`, text);
    toast("Reference package manifest downloaded.");
  }

  async function addBook() {
    const title = prompt("Book title");
    if (!title) return;
    const id = makeId(title);
    const book = {
      id,
      title,
      subtitle: "",
      status: "active",
      currentSpreadId: "",
      coverAssetId: "",
      folder: id,
      goal: "Plan a cohesive children's book with consistent characters, locations, emotional beats, and publication-ready spreads.",
      printTarget: "KDP paperback production through Photoshop cleanup and InDesign layout."
    };
    upsertProjectItem("books", book);
    selectedBookId = id;
    selectedSpreadId = "";
    await saveProjectData();
    render();
  }

  async function addSpread() {
    const book = activeBook();
    const number = activeSpreads().length + 1;
    const title = prompt("Spread title", `Spread ${pad(number)}`);
    if (!title) return;
    const spreadId = `${book.id}-SP${pad(number)}`;
    const spread = {
      id: spreadId,
      bookId: book.id,
      spread: number,
      pages: "",
      beat: `Beat ${pad(number)}`,
      title,
      status: "draft",
      location: "",
      environmentState: "",
      camera: "",
      lighting: "",
      colorScript: "",
      storyText: "",
      objective: "",
      artAssetId: "",
      approvedCanonical: false,
      canonicalDecision: "",
      primaryRead: "",
      emotionalTurn: "",
      conflict: "",
      readerDiscovery: "",
      pageTurn: "",
      visualInfo: "",
      withheld: "",
      avoid: "",
      printNotes: "",
      sceneAssetId: "",
      referenceTiers: {
        mandatory: [],
        conditional: [],
        inspirational: []
      },
      conflicts: [],
      references: []
    };
    upsertProjectItem("spreads", spread);
    selectedSpreadId = spread.id;
    await saveProjectData();
    markdownCache[spread.id] = buildBriefMarkdown(spread);
    render();
  }

  async function saveSpreadDetails(spreadId) {
    const spread = spreadById.get(spreadId);
    if (!spread) return;
    const updated = {
      ...spread,
      title: fieldValue(spreadId, "title"),
      pages: fieldValue(spreadId, "pages"),
      beat: fieldValue(spreadId, "beat"),
      location: fieldValue(spreadId, "location"),
      environmentState: fieldValue(spreadId, "environmentState"),
      camera: fieldValue(spreadId, "camera"),
      artAssetId: fieldValue(spreadId, "artAssetId"),
      lighting: fieldValue(spreadId, "lighting"),
      colorScript: fieldValue(spreadId, "colorScript"),
      storyText: fieldValue(spreadId, "storyText"),
      objective: fieldValue(spreadId, "objective"),
      primaryRead: fieldValue(spreadId, "primaryRead"),
      emotionalTurn: fieldValue(spreadId, "emotionalTurn"),
      conflict: fieldValue(spreadId, "conflict"),
      readerDiscovery: fieldValue(spreadId, "readerDiscovery"),
      pageTurn: fieldValue(spreadId, "pageTurn"),
      visualInfo: fieldValue(spreadId, "visualInfo"),
      withheld: fieldValue(spreadId, "withheld"),
      avoid: fieldValue(spreadId, "avoid"),
      printNotes: fieldValue(spreadId, "printNotes")
    };
    upsertProjectItem("spreads", updated);
    await saveProjectData();
    selectedSpreadId = spreadId;
    markdownCache[spreadId] = buildBriefMarkdown(updated);
    render();
  }

  async function attachReference(spreadId) {
    const picker = document.getElementById(`reference-picker-${spreadId}`);
    const assetId = picker && picker.value;
    if (!assetId) return;
    const spread = spreadById.get(spreadId);
    const references = Array.from(new Set([...(spread.references || []), assetId]));
    const updated = {
      ...spread,
      sceneAssetId: spread.sceneAssetId || assetId,
      references
    };
    upsertProjectItem("spreads", updated);
    await saveProjectData();
    selectedSpreadId = spreadId;
    render();
  }

  async function removeReferenceFromSpread(spreadId, assetId) {
    const spread = spreadById.get(spreadId);
    const references = (spread.references || []).filter((id) => id !== assetId);
    const updated = {
      ...spread,
      references,
      sceneAssetId: spread.sceneAssetId === assetId ? (references[0] || "") : spread.sceneAssetId,
      artAssetId: spread.artAssetId === assetId ? "" : spread.artAssetId
    };
    upsertProjectItem("spreads", updated);
    await saveProjectData();
    selectedSpreadId = spreadId;
    render();
  }

  async function setActualSpreadImage(spreadId, assetId) {
    const spread = spreadById.get(spreadId);
    if (!spread || !assetById.has(assetId)) return;
    const updated = {
      ...spread,
      artAssetId: assetId
    };
    upsertProjectItem("spreads", updated);
    await saveProjectData();
    selectedSpreadId = spreadId;
    render();
    toast("Actual spread image set.");
  }

  async function addImagePathReference(spreadId) {
    const path = prompt("Paste the image path or project-relative URL");
    if (!path) return;
    const title = prompt("Image title", "Spread reference image") || "Spread reference image";
    const asset = {
      id: makeAssetId(title),
      title,
      type: "story",
      group: "Custom spread references",
      purpose: "User-added reference image for prompt generation.",
      path
    };
    upsertProjectItem("assets", asset);
    refreshRuntimeData();
    const spread = spreadById.get(spreadId);
    const useAsSpreadImage = confirm("Is this the actual spread artwork for this spread?");
    const updated = {
      ...spread,
      artAssetId: useAsSpreadImage ? asset.id : spread.artAssetId,
      sceneAssetId: spread.sceneAssetId || asset.id,
      references: Array.from(new Set([...(spread.references || []), asset.id]))
    };
    upsertProjectItem("spreads", updated);
    await saveProjectData();
    selectedSpreadId = spreadId;
    render();
  }

  function fieldValue(spreadId, field) {
    const input = document.getElementById(`spread-${spreadId}-${field}`);
    return input ? input.value.trim() : "";
  }

  function upsertProjectItem(collection, item) {
    projectData[collection] = projectData[collection] || [];
    const index = projectData[collection].findIndex((candidate) => candidate.id === item.id);
    if (index >= 0) {
      projectData[collection][index] = item;
    } else {
      projectData[collection].push(item);
    }
    refreshRuntimeData();
  }

  function makeId(value) {
    const words = value
      .trim()
      .replace(/[^A-Za-z0-9 ]+/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const initials = words.map((word) => word[0]).join("").toUpperCase() || "BOOK";
    let candidate = initials;
    let suffix = 2;
    while (bookById.has(candidate)) {
      candidate = `${initials}${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  function makeAssetId(value) {
    const base = value
      .trim()
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase() || "ASSET";
    let candidate = base;
    let suffix = 2;
    while (assetById.has(candidate)) {
      candidate = `${base}_${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  function renderAssetLibrary() {
    const filteredAssets = assets.filter((asset) => {
      const matchesFilter = assetFilter === "all" || asset.type === assetFilter;
      const matchesSearch = !searchTerm || searchableAsset(asset).includes(searchTerm);
      return matchesFilter && matchesSearch;
    });

    els.assetGrid.innerHTML = filteredAssets.length
      ? filteredAssets.map((asset) => renderAssetCard(asset.id)).join("")
      : `<div class="panel stat-card"><strong>0</strong><span>No assets match this search.</span></div>`;
  }

  function renderPipeline() {
    els.pipelineBoard.innerHTML = data.pipelineStages.map((stage) => {
      const stageSpreads = activeSpreads().filter((spread) => matchesSearchableSpread(spread));
      const complete = stageSpreads.filter((spread) => isStageDone(spread.id, stage.id));
      return `
        <section class="stage-column">
          <h3>${escapeHtml(stage.label)} <span>${complete.length}/${stageSpreads.length}</span></h3>
          <div class="stage-items">
            ${stageSpreads.map((spread) => `
              <div class="stage-item">
                <label>
                  <input type="checkbox" data-stage-toggle="${stage.id}" data-spread-id="${spread.id}" ${isStageDone(spread.id, stage.id) ? "checked" : ""}>
                  <span><strong>${spread.id}</strong><br>${escapeHtml(spread.title)}</span>
                </label>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }).join("");
  }

  function updateStage(spreadId, stageId, done) {
    progress[spreadId] = progress[spreadId] || {};
    progress[spreadId][stageId] = done;
    saveProgress();
    render();
  }

  function isStageDone(spreadId, stageId) {
    return Boolean(progress[spreadId] && progress[spreadId][stageId]);
  }

  function loadProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(progressKey));
      if (stored && typeof stored === "object") return stored;
    } catch (error) {
      return {};
    }
    const seeded = {};
    spreads.forEach((spread) => {
      seeded[spread.id] = {};
      if (["references", "prompt"].includes(spread.status)) {
        seeded[spread.id].story = true;
        seeded[spread.id].references = true;
      }
      if (spread.status === "prompt") seeded[spread.id].prompt = true;
    });
    return seeded;
  }

  function saveProgress() {
    localStorage.setItem(progressKey, JSON.stringify(progress, null, 2));
  }

  function exportProgress() {
    downloadText("SparkleShield_WorldBible_Progress.json", JSON.stringify(progress, null, 2));
    toast("Progress file downloaded.");
  }

  function resetProgress() {
    if (!confirm("Reset only the saved progress in this browser? The files will not be changed.")) return;
    localStorage.removeItem(progressKey);
    progress = loadProgress();
    saveProgress();
    render();
    toast("Local progress reset.");
  }

  function filteredSpreads() {
    return activeSpreads().filter(matchesSearchableSpread);
  }

  function matchesSearchableSpread(spread) {
    if (!searchTerm) return true;
    return searchableSpread(spread).includes(searchTerm);
  }

  function searchableSpread(spread) {
    return [
      spread.id,
      spread.title,
      spread.beat,
      spread.pages,
      spread.location,
      spread.environmentState,
      spread.lighting,
      spread.colorScript,
      spread.storyText,
      spread.objective,
      spread.primaryRead,
      spread.emotionalTurn,
      spread.conflict,
      spread.readerDiscovery,
      spread.pageTurn,
      spread.visualInfo,
      spread.withheld,
      spread.avoid,
      spread.printNotes,
      spread.canonicalDecision,
      (spread.conflicts || []).map((item) => `${item.source || ""} ${item.issue || ""} ${item.decision || ""}`).join(" "),
      (spread.references || []).join(" ")
    ].join(" ").toLowerCase();
  }

  function searchableAsset(asset) {
    return [asset.id, asset.title, asset.type, asset.group, asset.purpose, asset.path].join(" ").toLowerCase();
  }

  function getSpreadBlockers(spread) {
    if (!spread) return ["Select or create a spread."];
    const required = [
      ["pages", "Add page numbers"],
      ["beat", "Add story beat"],
      ["location", "Add location"],
      ["environmentState", "Add environmental state"],
      ["camera", "Add camera/composition"],
      ["storyText", "Add story text/caption"],
      ["objective", "Add illustration purpose"]
    ];
    const blockers = required
      .filter(([field]) => !String(spread[field] || "").trim())
      .map(([, label]) => label);
    if (!(spread.references || []).length) blockers.push("Attach required references");
    const missing = getMissingReferences([spread]);
    if (missing.length) blockers.push(`Resolve missing references: ${missing.join(", ")}`);
    const unresolved = getUnresolvedConflicts(spread);
    if (unresolved.length) blockers.push("Resolve canonical source conflicts");
    if (spread.qualityGates) {
      const openGates = qualityGateRows(spread).filter((gate) => !gate.done);
      if (openGates.length) blockers.push(`Clear quality gates: ${openGates.map((gate) => gate.label).join(", ")}`);
    }
    return blockers;
  }

  function getUnresolvedConflicts(spread) {
    return (spread.conflicts || []).filter((item) => item.status !== "resolved");
  }

  function qualityGateRows(spread) {
    const gates = spread.qualityGates || {};
    return [
      ["imageComplement", "Image adds story value beyond the caption"],
      ["thumbnailRead", "Main action reads at thumbnail size"],
      ["characterPerformance", "Character acting is specific and on-model"],
      ["worldSpecificity", "Maplewood Terrace / Sparkle Shield world details are present"],
      ["rereadDiscovery", "There is a second-look detail for rereads"],
      ["bookRhythm", "Spread rhythm differs from neighboring spreads"]
    ].map(([key, label]) => ({ key, label, done: Boolean(gates[key]) }));
  }

  function referenceTiersForSpread(spread) {
    const tiers = spread.referenceTiers || {};
    const mandatory = Array.from(new Set(tiers.mandatory || spread.references || []));
    const conditional = Array.from(new Set(tiers.conditional || []));
    const inspirational = Array.from(new Set(tiers.inspirational || []));
    return { mandatory, conditional, inspirational };
  }

  function formatPromptReferences(spread) {
    const tiers = referenceTiersForSpread(spread);
    const formatTier = (label, ids) => ids
      .map((assetId) => assetById.get(assetId))
      .filter(Boolean)
      .map((asset) => `- [${label}] ${asset.id}: ${asset.title} - ${asset.purpose} Influence: ${referenceInfluencePhrase(asset, label)}`)
      .join("\n");
    return [
      formatTier("Mandatory", tiers.mandatory),
      formatTier("Conditional", tiers.conditional),
      formatTier("Inspirational", tiers.inspirational)
    ].filter(Boolean).join("\n");
  }

  function referenceInfluencePhrase(asset, tierLabel) {
    const title = `${asset.title || ""} ${asset.group || ""} ${asset.purpose || ""}`.toLowerCase();
    const tier = tierLabel.toLowerCase();
    const strength = tier === "mandatory"
      ? "directly and visibly"
      : tier === "conditional"
        ? "only where it supports the scene"
        : "loosely and atmospherically";

    if (asset.type === "character" || title.includes("model") || title.includes("expression") || title.includes("pose") || title.includes("construction")) {
      const mode = title.includes("expression")
        ? "expressively"
        : title.includes("pose") || title.includes("action")
          ? "gesturally"
          : "proportionally";
      return `${mode}, use this reference ${strength} to keep the character on-model, emotionally clear, and consistent with approved costume, silhouette, face, and body language.`;
    }

    if (asset.type === "environment" || title.includes("location") || title.includes("maplewood") || title.includes("green") || title.includes("kitchen") || title.includes("garden")) {
      return `environmentally, use this reference ${strength} to preserve location layout, camera logic, landmark placement, scale, lighting, and lived-in Maplewood Terrace details.`;
    }

    if (asset.type === "guide" || title.includes("environmental") || title.includes("continuity") || title.includes("world") || title.includes("state")) {
      return `systemically, use this reference ${strength} to guide emotional state, color progression, world rules, environmental reactions, continuity, and story geography.`;
    }

    if (asset.type === "story" || title.includes("scene") || title.includes("ending") || title.includes("cover")) {
      return `compositionally, use this reference ${strength} for the story beat's staging, mood, action clarity, lighting direction, and visual continuity without copying it mechanically.`;
    }

    return `selectively, use this reference ${strength} to clarify the spread's composition, mood, continuity, and emotional read.`;
  }

  function formatBriefReferences(spread) {
    const tiers = referenceTiersForSpread(spread);
    const lines = [];
    [
      ["Mandatory", tiers.mandatory],
      ["Conditional", tiers.conditional],
      ["Inspirational", tiers.inspirational]
    ].forEach(([label, ids]) => {
      lines.push(`### ${label}`);
      if (!ids.length) {
        lines.push("- None listed.");
        return;
      }
      ids.forEach((assetId) => {
        const asset = assetById.get(assetId);
        lines.push(asset ? `- ${asset.id} - ${asset.title}: ${asset.path}` : `- ${assetId} - MISSING`);
      });
    });
    return lines.join("\n");
  }

  function getNextAction(spread) {
    const blockers = getSpreadBlockers(spread);
    if (blockers.length) return blockers[0];
    const stageActions = [
      ["story", "Review and approve the story brief."],
      ["references", "Review the reference package."],
      ["prompt", "Build and approve the prompt."],
      ["art_progress", "Generate or commission artwork."],
      ["art_review", "Review artwork against the brief."],
      ["art_approved", "Approve the art or request revisions."],
      ["photoshop", "Finish the Photoshop cleanup."],
      ["dimensions", "Verify dimensions and resolution."],
      ["indesign", "Place the spread in InDesign."],
      ["proofread", "Proofread text and layout."],
      ["preflight", "Run the print preflight check."],
      ["proof", "Review the printed or digital proof."],
      ["final", "Mark final when publication blockers are clear."]
    ];
    const openStage = stageActions.find(([stageId]) => !isStageDone(spread.id, stageId));
    return openStage ? openStage[1] : "This spread is final.";
  }

  function getNeighborSpreads(spread) {
    const bookSpreads = activeSpreads();
    const index = bookSpreads.findIndex((candidate) => candidate.id === spread.id);
    return {
      previous: index > 0 ? bookSpreads[index - 1] : null,
      next: index >= 0 && index < bookSpreads.length - 1 ? bookSpreads[index + 1] : null
    };
  }

  function renderNeighborCard(label, spread) {
    if (!spread) {
      return `
        <div class="neighbor-card">
          <small>${escapeHtml(label)}</small>
          <strong>None</strong>
          <span>No adjacent spread.</span>
        </div>
      `;
    }
    return `
      <button class="neighbor-card ${label === "Current" ? "current" : ""}" type="button" data-select-spread="${spread.id}">
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(spread.title)}</strong>
        <span>${escapeHtml(spread.beat)} | Pages ${escapeHtml(spread.pages || "not set")}</span>
      </button>
    `;
  }

  function optionalText(value, fallback = "Not set yet.") {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function getMissingReferences(spreads) {
    const missing = [];
    spreads.forEach((spread) => {
      (spread.references || []).forEach((assetId) => {
        if (!assetById.has(assetId) && !missing.includes(assetId)) missing.push(assetId);
      });
    });
    return missing;
  }

  function showAssetDialog(assetId) {
    const asset = assetById.get(assetId);
    if (!asset) return;
    els.dialogBody.innerHTML = `
      <div class="dialog-preview">
        <img src="${asset.path}" alt="${escapeHtml(asset.title)}">
        <div class="dialog-copy">
          <p class="eyebrow">${escapeHtml(asset.id)} | ${escapeHtml(asset.type)}</p>
          <h2>${escapeHtml(asset.title)}</h2>
          <p>${escapeHtml(asset.purpose)}</p>
          <p><strong>Group:</strong> ${escapeHtml(asset.group)}</p>
          <p><strong>File:</strong> <code>${escapeHtml(asset.path)}</code></p>
          <div class="button-row">
            <a class="primary-button" href="${asset.path}" target="_blank" rel="noopener">Open file</a>
            <a class="ghost-button" href="${asset.path}" download>Download file</a>
            <button class="ghost-button" type="button" data-copy-asset-path="${asset.id}">Copy path</button>
          </div>
        </div>
      </div>
    `;
    els.dialog.showModal();
  }

  async function copyPathForAsset(assetId) {
    const asset = assetById.get(assetId);
    if (!asset) return;
    try {
      await navigator.clipboard.writeText(asset.path);
      toast("Asset path copied.");
    } catch (error) {
      toast(asset.path);
    }
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("\\", "\\\\");
  }

  window.SSB_APP = {
    setView,
    downloadManifest,
    addSpread
  };
})();
