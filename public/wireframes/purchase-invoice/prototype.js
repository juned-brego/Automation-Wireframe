const autocompleteSources = {
  items: [
    "60-KNITTED FABRICS",
    "6212-Cups",
    "Active Wear Apparel",
    "Alteration Charges",
    "Consulting Services (Central)",
    "Printed Labels",
    "Professional Legal Services",
  ],
  customers: [
    "SVA COUTURE PRIVATE LIMITED",
    "Paarijaat Personal Care Pvt Ltd",
    "ABC Fabrics LLP",
    "BURGEON LAW LLP",
    "Metro Retail LLP",
  ],
  vendors: [
    "BURGEON LAW LLP",
    "Paarijaat Personal Care Pvt Ltd",
    "ABC Fabrics LLP",
    "Metro Retail LLP",
    "HDFC Bank Ltd",
  ],
  "sales-ledgers": [
    "Sales Ledger",
    "Domestic Sales",
    "Export Sales",
    "Fabric Sales",
  ],
  "purchase-ledgers": [
    "Purchase Ledger",
    "Consulting Services Purchase",
    "Professional Charges",
    "Fabric Purchase",
  ],
  "ledger-names": [
    "BURGEON LAW LLP",
    "Professional Charges",
    "Consulting Fees",
    "Legal & Compliance",
    "Sundry Creditors",
    "Sundry Debtors",
  ],
  "tax-ledgers": [
    "Input CGST 9%",
    "Input SGST 9%",
    "Input IGST 18%",
    "Output CGST 9%",
    "Output SGST 9%",
    "GST Input Credit",
  ],
  "stock-under": [
    "Primary",
    "KURTA SET",
    "LEHENGA",
    "LEHENGA SET",
    "LOUNGE PANTS",
    "PANTS",
    "PATIALA",
    "PEPLUM",
    "PEPLUM SET",
  ],
  "stock-category": [
    "Not Applicable",
    "Finished Goods",
    "Raw Material",
    "Semi Finished",
    "Accessories",
  ],
  "stock-unit": [
    "Not Applicable",
    "Nos",
    "PCS",
    "Box",
    "Meter",
    "Kg",
  ],
  "gst-applicable": ["Applicable", "Not Applicable"],
  "alter-gst": ["Yes", "No"],
  "type-supply": ["Goods", "Services"],
  taxability: ["Unknown", "Taxable", "Exempt", "Nil Rated"],
  "ledger-types": [
    "Sundry Creditors",
    "Sundry Debtors",
    "Bank Accounts",
    "Cash-in-Hand",
    "Indirect Expenses",
  ],
  "bill-by-bill": ["Yes", "No"],
  "inventory-affected": ["No", "Yes"],
  countries: ["India", "United Arab Emirates", "United Kingdom", "United States"],
  states: [
    "Andaman & Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu & Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Other Territory",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Foreign Country",
  ],
  "registration-types": ["Regular", "Composition", "Consumer", "Unregistered"],
  drcr: ["Cr.", "Dr."],
  "voucher-types": ["Purchase", "Purchase Return", "Sales", "Sales Return", "Journal"],
  "invoice-modes": ["Item Invoice", "Accounting Invoice"],
  "bank-ledgers": ["Cash", "HDFC Bank Ltd", "Axis Bank Ltd", "ICICI Bank Ltd"],
  "journal-types": ["Expense Booking", "Stock Adjustment", "Provision Entry", "Reclass Entry"],
};

let invoiceMode = "item";

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getOpenShells() {
  return [...document.querySelectorAll("[data-modal-shell].open, [data-drawer-shell].open")];
}

function syncBodyLock() {
  document.body.classList.toggle("overflow-hidden", getOpenShells().length > 0);
}

function setShellOpen(shell, isOpen) {
  if (!shell) {
    return;
  }

  shell.classList.toggle("open", isOpen);
  shell.setAttribute("aria-hidden", String(!isOpen));

  if (!isOpen) {
    shell.querySelectorAll(".autocomplete-list").forEach((list) => {
      list.classList.remove("open");
      list.innerHTML = "";
    });
  }

  syncBodyLock();
}

function closeAllShells() {
  getOpenShells().forEach((shell) => setShellOpen(shell, false));
}

function getAutocompleteWrapper(element) {
  return element.closest(".stock-select-shell, .relative");
}

function closeAllAutocomplete() {
  document.querySelectorAll(".autocomplete-list").forEach((list) => {
    list.classList.remove("open");
    list.innerHTML = "";
  });
}

function closeAllMenus(exceptId = "") {
  document.querySelectorAll("[data-popover-menu].open").forEach((menu) => {
    if (exceptId && menu.id === exceptId) {
      return;
    }

    menu.classList.remove("open");
  });

  document.querySelectorAll("[data-menu-trigger]").forEach((trigger) => {
    if (exceptId && trigger.dataset.menuTrigger === exceptId) {
      return;
    }

    trigger.setAttribute("aria-expanded", "false");
  });
}

function renderAutocomplete(wrapper, filterText = "") {
  const input = wrapper.querySelector("[data-autocomplete-source]");
  const list = wrapper.querySelector(".autocomplete-list");

  if (!input || !list) {
    return;
  }

  const sourceName = input.dataset.autocompleteSource;
  const options = autocompleteSources[sourceName] || [];
  const query = filterText.trim().toLowerCase();
  const filtered = options.filter((option) => option.toLowerCase().includes(query));

  if (!filtered.length) {
    list.classList.remove("open");
    list.innerHTML = "";
    return;
  }

  list.innerHTML = filtered
    .map(
      (option) =>
        `<button type="button" class="block w-full border-b border-slate-100 px-3 py-2 text-left text-xs text-slate-600 hover:bg-brand-50 hover:text-brand-600" data-option-value="${option}">${option}</button>`,
    )
    .join("");

  list.classList.add("open");
}

function openAutocompleteForElement(element) {
  const wrapper = getAutocompleteWrapper(element) || element.parentElement;
  const input = wrapper?.querySelector("[data-autocomplete-source]");

  if (!wrapper || !input) {
    return;
  }

  renderAutocomplete(wrapper, input.value);
}

function formatDateDisplay(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function syncDatePickerDisplay(nativeInput) {
  const wrapper = nativeInput.closest("[data-date-picker]");
  const displayInput = wrapper?.querySelector("[data-date-display]");

  if (!displayInput) {
    return;
  }

  displayInput.value = formatDateDisplay(nativeInput.value);
}

function openDatePickerForElement(element) {
  const nativeInput = element?.closest("[data-date-picker]")?.querySelector("[data-date-native]");

  if (!nativeInput) {
    return;
  }

  try {
    if (typeof nativeInput.showPicker === "function") {
      nativeInput.showPicker();
      return;
    }
  } catch (error) {
    // Fallback to focus when native showPicker is unavailable.
  }

  nativeInput.focus();
}

function formatCurrency(value) {
  const number = Number(value) || 0;
  return `Rs ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function syncLedgerModalPartyName() {
  const partyInput = document.getElementById("party-name-input");
  const titleNode = document.getElementById("ledger-modal-party-name");

  if (!titleNode) {
    return;
  }

  titleNode.textContent = partyInput?.value?.trim() || "PAARIJAAT PERSONAL CARE PRIVATE LIMITED";
}

function activateTabSet(root, tabId) {
  if (!root) {
    return;
  }

  root.querySelectorAll("[data-tab-trigger]").forEach((button) => {
    const isActive = button.dataset.tabTrigger === tabId;
    button.setAttribute("aria-selected", String(isActive));
    button.classList.toggle("border-brand-500", isActive);
    button.classList.toggle("text-brand-600", isActive);
    button.classList.toggle("border-transparent", !isActive);
    button.classList.toggle("text-slate-500", !isActive);
  });

  root.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    const isActive = panel.dataset.tabPanel === tabId;
    panel.classList.toggle("hidden", !isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });
}

function updateEntryTotals() {
  const qtyInput = document.getElementById("item-qty");
  const rateInput = document.getElementById("item-rate");
  const amountInput = document.getElementById("item-amount");
  const ledgerAmountInput = document.getElementById("ledger-amount");

  if (!qtyInput || !rateInput || !amountInput) {
    return;
  }

  const qtyRaw = qtyInput.value.trim();
  const rateRaw = rateInput.value.trim();
  const hasItemValues = qtyRaw !== "" && rateRaw !== "";
  const qty = Number(qtyRaw) || 0;
  const rate = Number(rateRaw) || 0;
  const itemAmount = hasItemValues ? qty * rate : 0;
  amountInput.value = hasItemValues ? itemAmount.toFixed(2) : "";

  if (ledgerAmountInput && !ledgerAmountInput.dataset.userEdited) {
    ledgerAmountInput.value = hasItemValues ? itemAmount.toFixed(2) : "";
  }

  const taxTotal = [...document.querySelectorAll(".calc-tax")].reduce(
    (sum, input) => sum + (Number(input.value) || 0),
    0,
  );

  const itemTotalNode = document.getElementById("item-total");
  const ledgerTotalNode = document.getElementById("ledger-total");
  const taxLedgerTotalNode = document.getElementById("tax-ledger-total");
  const subTotalNode = document.getElementById("sub-total");
  const taxTotalNode = document.getElementById("tax-total");
  const grandTotalNode = document.getElementById("grand-total");
  const errorNode = document.getElementById("total-error");
  const ledgerTotal = Number(ledgerAmountInput?.value) || 0;
  const subTotal = invoiceMode === "item" ? itemAmount : ledgerTotal;

  if (itemTotalNode) itemTotalNode.textContent = formatCurrency(itemAmount);
  if (ledgerTotalNode) ledgerTotalNode.textContent = formatCurrency(ledgerTotal);
  if (taxLedgerTotalNode) taxLedgerTotalNode.textContent = formatCurrency(taxTotal);
  if (subTotalNode) subTotalNode.textContent = formatCurrency(subTotal);
  if (taxTotalNode) taxTotalNode.textContent = formatCurrency(taxTotal);

  const grandTotal = subTotal + taxTotal;
  if (grandTotalNode) grandTotalNode.textContent = formatCurrency(grandTotal);

  if (errorNode) {
    errorNode.textContent =
      grandTotal <= 0
        ? "Total amount can not be less than zero."
        : "Invoice ready for review and sync.";
    errorNode.classList.toggle("text-rose-500", grandTotal <= 0);
    errorNode.classList.toggle("text-emerald-600", grandTotal > 0);
  }
}

function setInvoiceMode(nextMode) {
  invoiceMode = nextMode === "accounting" ? "accounting" : "item";

  const titleNode = document.getElementById("invoice-mode-title");
  const toggle = document.getElementById("invoice-mode-toggle");
  const knob = document.getElementById("invoice-mode-knob");
  const accountingLabel = document.getElementById("invoice-mode-accounting-label");
  const itemLabel = document.getElementById("invoice-mode-item-label");

  if (titleNode) {
    titleNode.textContent = invoiceMode === "item" ? "Item Invoice" : "Accounting Invoice";
  }

  if (toggle) {
    toggle.dataset.invoiceMode = invoiceMode;
    toggle.setAttribute("aria-pressed", String(invoiceMode === "item"));
    toggle.classList.toggle("bg-brand-500", invoiceMode === "item");
    toggle.classList.toggle("bg-slate-300", invoiceMode !== "item");
  }

  if (knob) {
    knob.classList.toggle("ml-auto", invoiceMode === "item");
  }

  if (accountingLabel) {
    accountingLabel.classList.toggle("text-ink-900", invoiceMode === "accounting");
    accountingLabel.classList.toggle("text-slate-700", invoiceMode !== "accounting");
  }

  if (itemLabel) {
    itemLabel.classList.toggle("text-ink-900", invoiceMode === "item");
    itemLabel.classList.toggle("text-slate-700", invoiceMode !== "item");
  }

  document.querySelectorAll("[data-item-only]").forEach((element) => {
    element.classList.toggle("hidden", invoiceMode === "accounting");
  });

  updateEntryTotals();
}

function updateTaxRowNumbers() {
  document.querySelectorAll("[data-tax-rows] .tax-row").forEach((row, index) => {
    const indexNode = row.querySelector("[data-row-index]");
    if (indexNode) {
      indexNode.textContent = String(index + 1);
    }
  });
}

function addTaxRow(values = {}) {
  const container = document.querySelector("[data-tax-rows]");
  if (!container) {
    return;
  }

  const nextIndex = container.querySelectorAll(".tax-row").length + 1;
  const markup = `
    <div class="grid grid-cols-[56px_1.45fr_1fr_112px_44px] items-center border-t border-slate-200 px-3 py-1.5 text-[11px] tax-row">
      <div class="text-center" data-row-index>${nextIndex}</div>
      <div class="relative pr-2">
        <input class="voucher-input" autocomplete="off" placeholder="Ledger name" value="${values.ledger || ""}" data-autocomplete-source="tax-ledgers" />
        <div class="autocomplete-list"></div>
      </div>
      <div class="pr-2">
        <input class="voucher-input" placeholder="Description" value="${values.description || ""}" />
      </div>
      <div class="pr-2">
        <input class="voucher-input calc-tax" type="number" min="0" step="0.01" value="${values.amount || "0"}" />
      </div>
      <button type="button" class="remove-tax-row icon-button" aria-label="Delete tax row">
        <i data-lucide="trash-2" class="h-[14px] w-[14px]" aria-hidden="true"></i>
      </button>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", markup);
  renderIcons();
  updateTaxRowNumbers();
  updateEntryTotals();
}

async function renderPdfViewer() {
  const mainCanvas = document.getElementById("pdf-page-canvas");
  const thumbCanvas = document.getElementById("pdf-thumbnail");
  const zoomLabel = document.getElementById("pdf-zoom-label");
  const pageLabel = document.getElementById("pdf-page-indicator");
  const zoomOutButton = document.getElementById("zoom-out-button");
  const zoomInButton = document.getElementById("zoom-in-button");

  if (!mainCanvas || !thumbCanvas || !window.pdfjsLib) {
    return;
  }

  const pdfState = { zoom: 35, pageNumber: 1, pdfDoc: null };
  const workerSrc = document.documentElement.dataset.pdfWorker || "../../pdf.worker.min.js";
  const fileSrc = document.documentElement.dataset.pdfSrc || "../../assets/burgeon-invoice.pdf";
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  function decodeBase64ToUint8Array(base64) {
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index += 1) {
      output[index] = raw.charCodeAt(index);
    }
    return output;
  }

  async function drawPdf() {
    if (!pdfState.pdfDoc) {
      return;
    }

    const page = await pdfState.pdfDoc.getPage(pdfState.pageNumber);
    const viewport = page.getViewport({ scale: pdfState.zoom / 25 });
    const thumbViewport = page.getViewport({ scale: 0.24 });

    mainCanvas.width = viewport.width;
    mainCanvas.height = viewport.height;
    thumbCanvas.width = thumbViewport.width;
    thumbCanvas.height = thumbViewport.height;

    await page.render({ canvasContext: mainCanvas.getContext("2d"), viewport }).promise;
    await page.render({ canvasContext: thumbCanvas.getContext("2d"), viewport: thumbViewport }).promise;

    if (zoomLabel) zoomLabel.textContent = `${pdfState.zoom}%`;
    if (pageLabel) pageLabel.textContent = `${pdfState.pageNumber} / ${pdfState.pdfDoc.numPages}`;
  }

  try {
    const pdfData = window.invoicePdfData ? decodeBase64ToUint8Array(window.invoicePdfData) : null;
    const loadingTask = pdfjsLib.getDocument(pdfData ? { data: pdfData } : fileSrc);
    pdfState.pdfDoc = await loadingTask.promise;
    await drawPdf();
  } catch (error) {
    // Intentionally swallow for local wireframe fallback.
  }

  zoomOutButton?.addEventListener("click", async () => {
    pdfState.zoom = Math.max(20, pdfState.zoom - 5);
    await drawPdf();
  });

  zoomInButton?.addEventListener("click", async () => {
    pdfState.zoom = Math.min(150, pdfState.zoom + 5);
    await drawPdf();
  });
}

document.addEventListener("click", (event) => {
  const rowLink = event.target.closest("[data-row-link]");
  if (
    rowLink &&
    !event.target.closest("a, button, input, label, [data-menu-trigger], [data-open-modal], [data-close-modal], [data-popover-menu]")
  ) {
    window.location.href = rowLink.dataset.rowLink;
    return;
  }

  const menuTrigger = event.target.closest("[data-menu-trigger]");
  if (menuTrigger) {
    const menuId = menuTrigger.dataset.menuTrigger;
    const menu = document.getElementById(menuId);
    const isOpen = menu?.classList.contains("open");

    closeAllMenus(menuId);
    menu?.classList.toggle("open", !isOpen);
    menuTrigger.setAttribute("aria-expanded", String(!isOpen));
    return;
  }

  if (event.target.closest("#invoice-mode-toggle")) {
    setInvoiceMode(invoiceMode === "item" ? "accounting" : "item");
    return;
  }

  if (!event.target.closest("[data-popover-menu]")) {
    closeAllMenus();
  }

  const openTrigger = event.target.closest("[data-open-modal]");
  if (openTrigger) {
    closeAllMenus();
    if (openTrigger.dataset.openModal === "ledger-create-modal") {
      syncLedgerModalPartyName();
    }
    const shell = document.getElementById(openTrigger.dataset.openModal);
    if (openTrigger.dataset.openModal === "additional-details-modal") {
      activateTabSet(shell?.querySelector("[data-tab-root]"), "dispatch");
    }
    setShellOpen(shell, true);
    return;
  }

  const tabTrigger = event.target.closest("[data-tab-trigger]");
  if (tabTrigger) {
    activateTabSet(tabTrigger.closest("[data-tab-root]"), tabTrigger.dataset.tabTrigger);
    return;
  }

  const datePickerTrigger = event.target.closest("[data-date-picker]");
  if (datePickerTrigger) {
    openDatePickerForElement(datePickerTrigger);
    return;
  }

  const closeTrigger = event.target.closest("[data-close-modal]");
  if (closeTrigger) {
    setShellOpen(document.getElementById(closeTrigger.dataset.closeModal), false);
    if (closeTrigger.dataset.nextUrl) {
      window.location.href = closeTrigger.dataset.nextUrl;
    }
    return;
  }

  if (event.target.matches("[data-modal-backdrop]")) {
    setShellOpen(document.getElementById(event.target.dataset.modalBackdrop), false);
    return;
  }

  const optionButton = event.target.closest("[data-option-value]");
  if (optionButton) {
    const wrapper = optionButton.closest(".stock-select-shell, .relative");
    const input = wrapper.querySelector("[data-autocomplete-source]");
    const list = wrapper.querySelector(".autocomplete-list");
    input.value = optionButton.dataset.optionValue;
    list.classList.remove("open");
    list.innerHTML = "";
    updateEntryTotals();
    return;
  }

  const collapsible = event.target.closest("[data-collapsible-trigger]");
  if (collapsible) {
    const target = document.getElementById(collapsible.dataset.collapsibleTarget);
    const expanded = collapsible.dataset.expanded === "true";
    collapsible.dataset.expanded = String(!expanded);
    collapsible.setAttribute("aria-expanded", String(!expanded));
    target?.classList.toggle("hidden", expanded);
    const icon = collapsible.querySelector("[data-collapsible-icon]");
    icon?.classList.toggle("-rotate-90", expanded);
    return;
  }

  if (event.target.id === "add-tax-ledger") {
    addTaxRow();
    return;
  }

  if (event.target.closest(".remove-tax-row")) {
    const row = event.target.closest(".tax-row");
    if (row && document.querySelectorAll("[data-tax-rows] .tax-row").length > 1) {
      row.remove();
      updateTaxRowNumbers();
      updateEntryTotals();
    }
    return;
  }

  const autocompleteWrapper = event.target.closest(".stock-select-shell, .relative");
  if (autocompleteWrapper) {
    const autocompleteInput = autocompleteWrapper.querySelector("[data-autocomplete-source]");
    if (autocompleteInput) {
      openAutocompleteForElement(autocompleteInput);
      return;
    }
  }

  if (!event.target.closest(".stock-select-shell, .relative")) {
    closeAllAutocomplete();
  }
});

document.addEventListener("focusin", (event) => {
  const input = event.target.closest("[data-autocomplete-source]");
  if (input) {
    openAutocompleteForElement(input);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "party-name-input") {
    syncLedgerModalPartyName();
  }

  const autocompleteInput = event.target.closest("[data-autocomplete-source]");
  if (autocompleteInput) {
    renderAutocomplete(getAutocompleteWrapper(autocompleteInput) || autocompleteInput.parentElement, autocompleteInput.value);
  }

  if (event.target.matches("[data-date-native]")) {
    syncDatePickerDisplay(event.target);
  }

  if (event.target.id === "ledger-amount") {
    event.target.dataset.userEdited = "true";
  }

  if (
    event.target.matches(".calc-item") ||
    event.target.matches(".calc-tax") ||
    event.target.id === "ledger-amount"
  ) {
    updateEntryTotals();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-date-native]")) {
    syncDatePickerDisplay(event.target);
  }
});

document.addEventListener("keydown", (event) => {
  const rowLink = event.target.closest("[data-row-link]");
  if (rowLink && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    window.location.href = rowLink.dataset.rowLink;
    return;
  }

  if (
    event.target.matches("[data-date-display]") &&
    (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")
  ) {
    event.preventDefault();
    openDatePickerForElement(event.target);
    return;
  }

  if (event.key === "Escape") {
    closeAllShells();
    closeAllAutocomplete();
    closeAllMenus();
  }
});

renderIcons();
setInvoiceMode(invoiceMode);
updateEntryTotals();
renderPdfViewer();
