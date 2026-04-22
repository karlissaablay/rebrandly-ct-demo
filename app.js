/**
 * MetricFlow Demo Site - Rebrandly Conversion Tracking Events
 *
 * Events tracked:
 * 1. "signup"           — User submits the signup form (signup.html)
 * 2. "purchase"         — Paid plan selected, fires on thank-you page with revenue
 * 3. "cta_click"        — User clicks any "Start Free Trial" or "Start Tracking" CTA
 * 4. "pricing_viewed"   — User lands on the pricing page (high-intent signal)
 * 5. "plan_selected"    — User changes the plan dropdown on the signup form
 *
 * Page views are tracked automatically by the Rebrandly SDK snippet.
 */

(function () {
  "use strict";

  var PLAN_PRICES = {
    starter: 0,
    professional: 79.0,
    enterprise: 299.0,
  };

  // Helper: call rbly.track() — the SDK exposes window.rbly globally
  function track(eventName, revenue, currency, properties) {
    if (typeof rbly !== "undefined" && typeof rbly.track === "function") {
      var payload = { eventName: eventName };
      if (revenue != null) payload.revenue = revenue;
      if (currency) payload.currency = currency;
      if (properties) payload.properties = properties;
      rbly.track(payload);
      console.log("[Rebrandly CT] Sent:", eventName, payload);
    } else {
      console.warn("[Rebrandly CT] SDK not loaded, skipping:", eventName);
    }
  }

  // -----------------------------------------------------------
  // 1. CTA Click tracking (all pages)
  //    Fires when a user clicks any primary CTA leading to signup
  // -----------------------------------------------------------
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href="signup.html"]');
    if (!link) return;

    var ctaText = link.textContent.trim();
    var page = window.location.pathname.split("/").pop() || "index.html";

    track("cta_click", null, null, {
      ctaText: ctaText,
      sourcePage: page,
    });
  });

  // -----------------------------------------------------------
  // 2. Pricing page viewed (pricing.html)
  //    High-intent signal — user is evaluating plans
  // -----------------------------------------------------------
  if (window.location.pathname.includes("pricing")) {
    track("pricing_viewed", null, null, {
      referrer: document.referrer || "direct",
    });
  }

  // -----------------------------------------------------------
  // 3. Plan selected (signup.html)
  //    Fires when user changes the plan dropdown
  // -----------------------------------------------------------
  var planSelect = document.getElementById("plan");
  if (planSelect) {
    planSelect.addEventListener("change", function () {
      var plan = planSelect.value;
      track("plan_selected", PLAN_PRICES[plan] || 0, "USD", {
        plan: plan,
      });
    });
  }

  // -----------------------------------------------------------
  // 4. Signup event (signup.html)
  //    Fires on form submission with plan details
  // -----------------------------------------------------------
  var signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var plan = planSelect ? planSelect.value : "professional";

      track("signup", null, null, {
        plan: plan,
        email: document.getElementById("email").value,
        company: document.getElementById("company").value,
      });

      // Navigate to thank-you page with plan info
      window.location.href = "thank-you.html?plan=" + encodeURIComponent(plan);
    });
  }

  // -----------------------------------------------------------
  // 5. Purchase event (thank-you.html)
  //    Fires for paid plans with revenue attribution
  // -----------------------------------------------------------
  if (window.location.pathname.includes("thank-you")) {
    var params = new URLSearchParams(window.location.search);
    var plan = params.get("plan");

    if (plan && plan !== "starter") {
      var revenue = PLAN_PRICES[plan] || 0;

      track("purchase", revenue, "USD", {
        plan: plan,
        billingCycle: "monthly",
      });
    }
  }
})();
