import axios from "axios";

/* =========================
   CONFIG
========================= */
const API_BASE = "https://veff-2026-quotes.netlify.app/api/v1";

/* =========================
   QUOTE FEATURE
========================= */

/**
 * Fetch a quote from the API
 * @param {string} category - quote category
 */
const loadQuote = async (category = "general") => {
   // TODO: Use the assignment description to figure out what to do here
   try { 
      const response = await axios.get(`${API_BASE}/quotes`, 
         {params: { category },
      }); // using axios

      const quoteTextElement = document.getElementById("quote-text");
      const quoteAuthorElement = document.getElementById("quote-author");

      if (quoteTextElement) quoteTextElement.textContent = `"${response.data.quote}"`;
      if (quoteAuthorElement) quoteAuthorElement.textContent = response.data.author;

   } catch(error) {
      console.error("Error fetching quote:", error);
   }
};

/**
 * Attach event listeners for quote feature
 */
const wireQuoteEvents = () => {
  // TODO: Use the assignment description to figure out what to do here
   const select = document.getElementById("quote-category-select");
   const button = document.getElementById("new-quote-btn");

   const getCategory = () => select?.value || "general";

   select?.addEventListener("change", async () => {
      await loadQuote(getCategory());
   });

   button?.addEventListener("click", async () => {
      await loadQuote(getCategory());
   });
};

/* =========================
   INIT
========================= */

/**
 * Initialize application
 */
const init = async () => {
  wireQuoteEvents();

  const select = document.getElementById("quote-category-select");
  const category = select?.value || "general";

  await loadQuote(category);
};

/* =========================
   EXPORT (DO NOT REMOVE)
========================= */

export { init, loadQuote, wireQuoteEvents };

init();
