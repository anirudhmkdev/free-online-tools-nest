/** Shared DOM filtering for server-rendered catalogues; native details works without this. */
export function initializeToolCollection(collection: HTMLElement) {
  const surface = collection.closest<HTMLElement>("[data-discovery-surface]") ?? collection;
  const search = surface.querySelector<HTMLInputElement>("[data-collection-search]");
  const count = surface.querySelector<HTMLElement>("[data-collection-count]");
  const empty = collection.querySelector<HTMLElement>("[data-collection-empty]");
  const disclosure = collection.querySelector<HTMLDetailsElement>("[data-secondary-tools]");
  const items = Array.from(collection.querySelectorAll<HTMLElement>("[data-collection-tool]"));
  const filterButtons = surface.querySelectorAll<HTMLButtonElement>("[data-discovery-filter]");
  const initiallyOpen = disclosure?.open ?? false;
  let activeCategory = "all";
  let filtering = false;
  let savedOpen = initiallyOpen;

  function updateCount() {
    const visible = items.filter(item => !item.hidden && (item.dataset.discoveryTier !== "secondary" || disclosure?.open)).length;
    const label = visible === 1 ? collection.dataset.toolSingular! : collection.dataset.toolPlural!;
    if (count) count.textContent = (collection.dataset.showingTemplate || "Showing {count} {label}").replace("{count}", String(visible)).replace("{label}", label);
  }

  function filter() {
    const query = search?.value.trim().toLowerCase() || "";
    const nextFiltering = Boolean(query || activeCategory !== "all");
    if (nextFiltering && !filtering) savedOpen = disclosure?.open ?? false;
    let secondaryMatches = 0;
    let totalMatches = 0;
    items.forEach(item => {
      const haystack = [item.dataset.name, item.dataset.desc, item.dataset.keywords].join(" ");
      const matches = (activeCategory === "all" || item.dataset.category === activeCategory) && (!query || haystack.includes(query));
      item.hidden = !matches;
      if (matches) {
        totalMatches++;
        if (item.dataset.discoveryTier === "secondary") secondaryMatches++;
      }
    });
    if (disclosure) {
      disclosure.hidden = secondaryMatches === 0;
      disclosure.open = nextFiltering ? secondaryMatches > 0 : savedOpen;
    }
    filtering = nextFiltering;
    if (empty) empty.hidden = totalMatches > 0;
    updateCount();
  }

  search?.addEventListener("input", filter);
  disclosure?.addEventListener("toggle", updateCount);
  filterButtons.forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.discoveryFilter || "all";
    filterButtons.forEach(other => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    filter();
  }));
  if (search) {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) { search.value = query; filter(); }
  }
}
