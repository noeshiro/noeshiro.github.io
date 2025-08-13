// 年号
document.getElementById("y")?.append(document.createTextNode(new Date().getFullYear()));

// テーマ（ライト/ダークの循環）
const btn = document.getElementById("themeBtn");
const KEY = "theme";
const apply = (mode) => {
  if (!mode || mode === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", mode);
};
apply(localStorage.getItem(KEY));
btn?.addEventListener("click", () => {
  const cur = localStorage.getItem(KEY) || "auto";
  const next = cur === "dark" ? "light" : cur === "light" ? "auto" : "dark";
  localStorage.setItem(KEY, next);
  apply(next);
});
