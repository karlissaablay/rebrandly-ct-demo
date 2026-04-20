(function () {
  "use strict";

  var currentStep = 1;
  var addedEvents = [];

  // ==============================
  // Stepper Navigation
  // ==============================

  window.goToStep = function (step) {
    if (step < 1 || step > 4) return;

    // Mark previous steps as completed
    for (var i = 1; i < step; i++) {
      var prevIndicator = document.querySelector('.step-indicator[data-step="' + i + '"]');
      if (prevIndicator) {
        prevIndicator.classList.remove("active");
        prevIndicator.classList.add("completed");
        prevIndicator.querySelector(".step-number").textContent = "\u2713";
      }
    }

    // Update connectors
    var connectors = document.querySelectorAll(".step-connector");
    connectors.forEach(function (c, idx) {
      c.classList.remove("active", "completed");
      if (idx < step - 2) c.classList.add("completed");
      else if (idx === step - 2) c.classList.add("active");
    });

    // Update indicators
    document.querySelectorAll(".step-indicator").forEach(function (el) {
      var s = parseInt(el.getAttribute("data-step"));
      if (s === step) {
        el.classList.add("active");
        el.classList.remove("completed");
        el.querySelector(".step-number").textContent = s;
      } else if (s > step) {
        el.classList.remove("active", "completed");
        el.querySelector(".step-number").textContent = s;
      }
    });

    // Show panel
    document.querySelectorAll(".step-panel").forEach(function (p) {
      p.classList.remove("active");
    });
    var targetPanel = document.querySelector('.step-panel[data-step="' + step + '"]');
    if (targetPanel) targetPanel.classList.add("active");

    currentStep = step;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Click on step indicators
  document.querySelectorAll(".step-indicator").forEach(function (btn) {
    btn.addEventListener("click", function () {
      goToStep(parseInt(btn.getAttribute("data-step")));
    });
  });

  // ==============================
  // Step 1: Tracking Toggle
  // ==============================

  var toggle = document.getElementById("tracking-toggle");
  var toggleLabel = document.getElementById("tracking-toggle-label");
  var trackingHelp = document.getElementById("tracking-help");
  var attributionField = document.getElementById("attribution-field");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var isOn = toggle.classList.toggle("on");
      toggleLabel.textContent = isOn ? "Enabled" : "Disabled";
      toggleLabel.classList.toggle("on", isOn);
      trackingHelp.style.display = isOn ? "block" : "none";
      attributionField.style.display = isOn ? "block" : "none";
    });
  }

  // ==============================
  // Step 2: Snippet Editor
  // ==============================

  var snippetTextarea = document.getElementById("snippet-textarea");
  var saveBtn = document.getElementById("save-snippet-btn");
  var saveStatus = document.getElementById("save-status");
  var copySnippetBtn = document.getElementById("copy-snippet-btn");
  var snippetToCopy = document.getElementById("snippet-to-copy");
  var codeLines = document.getElementById("code-lines");

  var EXPECTED_SNIPPET = '<script src="https://cdn.test.rebrandly.com/sdk/v1/rbly.min.js" data-api-key="433200b2fd6141da82f1bd3d49b8dce8"></scr' + 'ipt>';

  if (snippetTextarea) {
    snippetTextarea.addEventListener("input", function () {
      var val = snippetTextarea.value.trim();
      saveBtn.disabled = val.length === 0;
      saveStatus.textContent = "";

      // Update line numbers
      var lines = snippetTextarea.value.split("\n");
      var lineCount = Math.max(lines.length, 1);
      codeLines.innerHTML = "";
      for (var i = 1; i <= lineCount; i++) {
        var span = document.createElement("span");
        span.textContent = i;
        codeLines.appendChild(span);
      }
    });

    saveBtn.addEventListener("click", function () {
      var val = snippetTextarea.value.trim();
      if (val.indexOf("rbly.min.js") !== -1) {
        saveBtn.textContent = "Saving...";
        saveBtn.disabled = true;
        setTimeout(function () {
          saveBtn.textContent = "Saved!";
          saveBtn.style.background = "var(--success)";
          saveStatus.textContent = "Snippet installed successfully!";
          setTimeout(function () {
            saveBtn.textContent = "Save Changes";
            saveBtn.style.background = "";
          }, 2000);
        }, 800);
      } else {
        saveStatus.textContent = "This doesn't look like a Rebrandly snippet. Please paste the correct code.";
        saveStatus.style.color = "#dc2626";
        setTimeout(function () {
          saveStatus.style.color = "";
          saveStatus.textContent = "";
        }, 3000);
      }
    });
  }

  if (copySnippetBtn) {
    copySnippetBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(EXPECTED_SNIPPET).then(function () {
        copySnippetBtn.textContent = "Copied!";
        copySnippetBtn.classList.add("copied");
        setTimeout(function () {
          copySnippetBtn.textContent = "Copy";
          copySnippetBtn.classList.remove("copied");
        }, 2000);
      });
    });
  }

  // ==============================
  // Step 3: Event Builder
  // ==============================

  var eventsList = document.getElementById("events-list");
  var eventNameInput = document.getElementById("event-name-input");
  var eventRevenueInput = document.getElementById("event-revenue-input");
  var eventCurrencyInput = document.getElementById("event-currency-input");
  var propertiesList = document.getElementById("properties-list");
  var addPropertyBtn = document.getElementById("add-property-btn");
  var addEventBtn = document.getElementById("add-event-btn");
  var codePreview = document.getElementById("code-preview");
  var generatedCode = document.getElementById("generated-code");
  var copyCodeBtn = document.getElementById("copy-code-btn");

  var EVENT_ICONS = {
    signup: "&#128221;",
    purchase: "&#128176;",
    download: "&#128229;",
    lead: "&#127919;",
    contact: "&#128231;",
    demo: "&#128250;",
    subscribe: "&#128276;",
    default: "&#9889;",
  };

  function getEventIcon(name) {
    var lower = name.toLowerCase();
    for (var key in EVENT_ICONS) {
      if (lower.indexOf(key) !== -1) return EVENT_ICONS[key];
    }
    return EVENT_ICONS["default"];
  }

  if (addPropertyBtn) {
    addPropertyBtn.addEventListener("click", function () {
      var row = document.createElement("div");
      row.className = "property-row";
      row.innerHTML =
        '<input type="text" class="prop-key" placeholder="Key">' +
        '<input type="text" class="prop-value" placeholder="Value">' +
        '<button class="prop-remove" title="Remove">&times;</button>';
      row.querySelector(".prop-remove").addEventListener("click", function () {
        row.remove();
      });
      propertiesList.appendChild(row);
    });
  }

  // Wire up initial remove button
  var initialRemove = document.querySelector(".property-row .prop-remove");
  if (initialRemove) {
    initialRemove.addEventListener("click", function () {
      initialRemove.parentElement.remove();
    });
  }

  if (addEventBtn) {
    addEventBtn.addEventListener("click", function () {
      var name = eventNameInput.value.trim();
      if (!name) {
        eventNameInput.style.borderColor = "#dc2626";
        eventNameInput.focus();
        setTimeout(function () {
          eventNameInput.style.borderColor = "";
        }, 2000);
        return;
      }

      var revenue = parseFloat(eventRevenueInput.value) || null;
      var currency = eventCurrencyInput.value;

      // Collect properties
      var props = {};
      document.querySelectorAll(".property-row").forEach(function (row) {
        var key = row.querySelector(".prop-key").value.trim();
        var val = row.querySelector(".prop-value").value.trim();
        if (key && val) props[key] = val;
      });

      var eventData = {
        name: name,
        revenue: revenue,
        currency: currency,
        properties: props,
      };
      addedEvents.push(eventData);

      // Add to list
      var badges = '<span class="event-badge custom">Custom</span>';
      if (revenue) {
        badges +=
          ' <span class="event-badge revenue">$' +
          revenue.toFixed(2) +
          "</span>";
      }

      var propDesc = Object.keys(props).length
        ? " | Props: " + Object.keys(props).join(", ")
        : "";

      var item = document.createElement("div");
      item.className = "event-item";
      item.innerHTML =
        '<div class="event-icon">' +
        getEventIcon(name) +
        "</div>" +
        '<div class="event-details">' +
        '<span class="event-name">' +
        escapeHtml(name) +
        "</span>" +
        badges +
        "</div>" +
        '<span class="event-desc">Custom conversion event' +
        escapeHtml(propDesc) +
        "</span>" +
        '<button class="event-remove" title="Remove">&times;</button>';

      var removeBtn = item.querySelector(".event-remove");
      removeBtn.addEventListener("click", function () {
        var idx = Array.from(eventsList.children).indexOf(item) - 1; // -1 for page_view
        addedEvents.splice(idx, 1);
        item.remove();
        updateCodePreview();
      });

      eventsList.appendChild(item);

      // Reset form
      eventNameInput.value = "";
      eventRevenueInput.value = "";
      // Reset properties to single empty row
      propertiesList.innerHTML =
        '<div class="property-row">' +
        '<input type="text" class="prop-key" placeholder="Key (e.g. plan)">' +
        '<input type="text" class="prop-value" placeholder="Value (e.g. professional)">' +
        '<button class="prop-remove" title="Remove">&times;</button>' +
        "</div>";
      propertiesList
        .querySelector(".prop-remove")
        .addEventListener("click", function () {
          this.parentElement.remove();
        });

      updateCodePreview();
    });
  }

  function updateCodePreview() {
    if (addedEvents.length === 0) {
      codePreview.style.display = "none";
      return;
    }

    codePreview.style.display = "block";

    var code = 'import { trackConversion } from \'@rebrandly/conversion-tracking\';\n';
    addedEvents.forEach(function (evt) {
      code += "\n// Track: " + evt.name + "\n";
      code += "trackConversion({\n";
      code += "  eventName: '" + evt.name + "'";
      if (evt.revenue) {
        code += ",\n  revenue: " + evt.revenue.toFixed(2);
        code += ",\n  currency: '" + evt.currency + "'";
      }
      var propKeys = Object.keys(evt.properties);
      if (propKeys.length > 0) {
        code += ",\n  properties: {\n";
        propKeys.forEach(function (key, i) {
          code += "    " + key + ": '" + evt.properties[key] + "'";
          if (i < propKeys.length - 1) code += ",";
          code += "\n";
        });
        code += "  }";
      }
      code += "\n});\n";
    });

    generatedCode.textContent = code;
  }

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener("click", function () {
      navigator.clipboard
        .writeText(generatedCode.textContent)
        .then(function () {
          copyCodeBtn.textContent = "Copied!";
          copyCodeBtn.classList.add("copied");
          setTimeout(function () {
            copyCodeBtn.textContent = "Copy";
            copyCodeBtn.classList.remove("copied");
          }, 2000);
        });
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==============================
  // Step 4: Verification
  // ==============================

  var verifyBtn = document.getElementById("verify-btn");
  var verifyResults = document.getElementById("verify-results");
  var verifySummary = document.getElementById("verify-summary");
  var verifyEventSummary = document.getElementById("verify-event-summary");

  var checks = [
    { id: "verify-sdk", delay: 1200, passMsg: "rbly.min.js detected in page header" },
    { id: "verify-api", delay: 2000, passMsg: "API key 433200b...dce8 is valid and active" },
    { id: "verify-pageview", delay: 3000, passMsg: "page_view event delivered successfully" },
    { id: "verify-events", delay: 3800, passMsg: null }, // dynamic
  ];

  if (verifyBtn) {
    verifyBtn.addEventListener("click", function () {
      verifyBtn.disabled = true;
      verifyBtn.textContent = "Verifying...";
      verifyResults.style.display = "flex";
      verifySummary.style.display = "none";

      // Reset all items
      checks.forEach(function (check) {
        var el = document.getElementById(check.id);
        el.classList.remove("checking", "passed");
        el.querySelector("p").textContent = el.querySelector("p").textContent;
      });

      // Run checks sequentially with delays
      checks.forEach(function (check, idx) {
        setTimeout(function () {
          var el = document.getElementById(check.id);
          el.classList.add("checking");
        }, idx * 400);

        setTimeout(function () {
          var el = document.getElementById(check.id);
          el.classList.remove("checking");
          el.classList.add("passed");

          if (check.id === "verify-events") {
            var count = addedEvents.length + 1; // +1 for page_view
            el.querySelector("p").textContent =
              count + " event(s) registered: page_view" +
              (addedEvents.length
                ? ", " +
                  addedEvents
                    .map(function (e) {
                      return e.name;
                    })
                    .join(", ")
                : "");
          } else {
            el.querySelector("p").textContent = check.passMsg;
          }
        }, check.delay);
      });

      // Show summary
      setTimeout(function () {
        verifySummary.style.display = "block";
        verifyBtn.textContent = "Re-verify";
        verifyBtn.disabled = false;

        // Populate event chips
        verifyEventSummary.innerHTML =
          '<span class="verify-event-chip">page_view</span>';
        addedEvents.forEach(function (evt) {
          verifyEventSummary.innerHTML +=
            '<span class="verify-event-chip">' + escapeHtml(evt.name) + "</span>";
        });

        verifySummary.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 4500);
    });
  }
})();
