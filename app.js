const stays = [
  {
    name: "The Palm House",
    type: "Hotel",
    area: "Candolim · 400m to the beach",
    rating: 4.8,
    art: "boutique",
    tag: "Guest favourite",
    amenities: ["Breakfast", "Pool", "Free cancellation"],
    features: ["breakfast", "pool", "quiet", "beach"],
    offers: [{ provider: "MakeMyTrip", price: 6450 }, { provider: "Agoda", price: 6890 }, { provider: "Booking.com", price: 7120 }]
  },
  {
    name: "Casa Solara",
    type: "Resort",
    area: "Ashwem · Beachfront",
    rating: 4.9,
    art: "seaside",
    tag: "Beachfront",
    amenities: ["Breakfast", "Sea view", "Pool"],
    features: ["breakfast", "pool", "beach", "quiet"],
    offers: [{ provider: "Agoda", price: 7890 }, { provider: "Booking.com", price: 8240 }, { provider: "MakeMyTrip", price: 8490 }]
  },
  {
    name: "Mango Grove Retreat",
    type: "Homestay",
    area: "Assagao · Garden setting",
    rating: 4.7,
    art: "jungle",
    tag: "A little hideaway",
    amenities: ["Garden", "Breakfast", "Free cancellation"],
    features: ["breakfast", "quiet", "budget"],
    offers: [{ provider: "Booking.com", price: 4950 }, { provider: "MakeMyTrip", price: 5290 }, { provider: "Agoda", price: 5680 }]
  },
  {
    name: "Casa Maré Villas",
    type: "Resort",
    area: "Benaulim · South Goa",
    rating: 4.6,
    art: "villa",
    tag: "Room to unwind",
    amenities: ["Private pool", "Kitchen", "Family friendly"],
    features: ["pool", "family", "quiet", "budget"],
    offers: [{ provider: "MakeMyTrip", price: 7290 }, { provider: "Agoda", price: 7590 }, { provider: "Booking.com", price: 7980 }]
  }
];

const grid = document.querySelector("#stay-grid");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const sortSelect = document.querySelector("#sort-select");
const promptInput = document.querySelector("#trip-prompt");
const resultTitle = document.querySelector("#results-title");
let activeFilter = "all";

function getBestOffer(stay) {
  return stay.offers.reduce((best, offer) => offer.price < best.price ? offer : best);
}

function getPreferenceScore(stay, preferences, budget) {
  const featureScore = preferences.filter((preference) => stay.features.includes(preference)).length;
  const budgetScore = budget && getBestOffer(stay).price <= budget ? 1 : 0;
  return featureScore + budgetScore;
}

function getMatches() {
  const prompt = promptInput.value.toLowerCase();
  const keywords = ["breakfast", "pool", "quiet", "beach", "family", "budget"];
  const preferences = keywords.filter((keyword) => prompt.includes(keyword));
  const budgetMatch = prompt.match(/(?:under|below|budget(?: of)?)\s*₹?\s*([\d,]+)/);
  const budget = budgetMatch ? Number(budgetMatch[1].replaceAll(",", "")) : null;
  let matches = stays.filter((stay) => activeFilter === "all" || stay.type === activeFilter);

  if (sortSelect.value === "price") {
    matches.sort((a, b) => getBestOffer(a).price - getBestOffer(b).price);
  } else if (sortSelect.value === "rating") {
    matches.sort((a, b) => b.rating - a.rating);
  } else if (preferences.length || budget) {
    matches.sort((a, b) => getPreferenceScore(b, preferences, budget) - getPreferenceScore(a, preferences, budget) || b.rating - a.rating);
  }

  return { matches, preferences, budget };
}

function createStayCard(stay, isSmartPick) {
  const best = getBestOffer(stay);
  const otherOffers = stay.offers.filter((offer) => offer !== best).slice(0, 2);
  const amenities = stay.amenities.map((amenity) => `<span class="amenity">${amenity}</span>`).join("");
  const otherDeals = otherOffers.map((offer) => `<div class="other-deal"><span>${offer.provider}</span><strong>₹${offer.price.toLocaleString("en-IN")}</strong></div>`).join("");
  const smartPick = isSmartPick ? '<span class="smart-pick">✳ SMART MATCH</span>' : "";

  return `<article class="stay-card">
    <div class="stay-art ${stay.art}" role="img" aria-label="${stay.tag} scenery illustration">
      <div class="art-scene" aria-hidden="true"><span class="art-sun"></span><span class="art-hill back"></span><span class="art-hill"></span><span class="art-water"></span></div>
      <span class="art-label">${stay.tag}</span>
    </div>
    <div class="stay-content">
      <div class="stay-meta"><span class="stay-type">${stay.type}</span>${smartPick}<span class="stay-rating"><span aria-hidden="true">★</span> ${stay.rating.toFixed(1)}</span></div>
      <h3 class="stay-name">${stay.name}</h3>
      <p class="stay-location">${stay.area}</p>
      <div class="amenity-list">${amenities}</div>
      <div class="best-deal">
        <div><p class="deal-label">BEST OFFER · ${stay.offers.length} SITES</p><span class="provider">${best.provider}</span></div>
        <div class="deal-price"><strong>₹${best.price.toLocaleString("en-IN")}</strong><span>per night</span></div>
      </div>
      <div class="other-deals">${otherDeals}</div>
      <button class="choose-button" type="button" data-stay="${stay.name}" data-provider="${best.provider}">View best offer ↗</button>
    </div>
  </article>`;
}

function renderStays() {
  const { matches, preferences, budget } = getMatches();
  const hasPreferences = preferences.length > 0 || budget !== null;
  grid.innerHTML = matches.length
    ? matches.map((stay, index) => createStayCard(stay, hasPreferences && index === 0)).join("")
    : '<p class="empty-state">No stays in this category yet. Try another filter.</p>';
  document.querySelector(".results-count").textContent = `${String(matches.length).padStart(2, "0")} handpicked stays`;
  grid.querySelectorAll(".choose-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#selection-message").textContent =
        `${button.dataset.provider} has the best preview offer for ${button.dataset.stay}. Live booking isn’t available in this demo.`;
    });
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("selected", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("#selection-message").textContent = "";
    renderStays();
  });
});

sortSelect.addEventListener("change", renderStays);
promptInput.addEventListener("input", renderStays);

const dateInput = (selector, date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  document.querySelector(selector).value = localDate.toISOString().slice(0, 10);
};
const today = new Date();
const checkIn = new Date(today);
checkIn.setDate(today.getDate() + 14);
const checkOut = new Date(checkIn);
checkOut.setDate(checkIn.getDate() + 3);
dateInput("#check-in", checkIn);
dateInput("#check-out", checkOut);

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const destination = document.querySelector("#destination").value.trim();
  if (!destination) return;
  resultTitle.firstChild.textContent = `Stays in ${destination} `;
  document.querySelector("#selection-message").textContent =
    "Search updated. Displayed stays and offers are illustrative preview data.";
  document.querySelector(".results-section").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderStays();
