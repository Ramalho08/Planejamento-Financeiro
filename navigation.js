import { $ } from "./utils.js";

export function setPage(page) {
  document.querySelectorAll(".page").forEach((el) => el.classList.remove("active"));
  const target = $(page);
  if (target) target.classList.add("active");

  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  closeDrawer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function openDrawer() {
  $("drawer")?.classList.remove("hidden");
  $("drawerBackdrop")?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function closeDrawer() {
  $("drawer")?.classList.add("hidden");
  $("drawerBackdrop")?.classList.add("hidden");
  document.body.style.overflow = "";
}

export function initNavigation() {
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      setPage(btn.dataset.page);
    });
  });

  $("menuBtn")?.addEventListener("click", openDrawer);
  $("closeDrawerBtn")?.addEventListener("click", closeDrawer);
  $("drawerBackdrop")?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeDrawer();
  });
}
