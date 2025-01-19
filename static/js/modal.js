// モーダルの操作
// 文字列省略設定モーダル
const regexpSettingModal = document.getElementById("regexp-setting-modal");
const openRegexpSettingBtn = document.getElementById("open-regexp-setting-btn");

// コマンド表示/非表示設定モーダル
const hideSettingModal = document.getElementById("hide-setting-modal");
const openHideSettingBtn = document.getElementById("open-hide-setting-btn");

openRegexpSettingBtn.addEventListener("click", () => {
  regexpSettingModal.style.display = "flex";
});

openHideSettingBtn.addEventListener("click", () => {
  hideSettingModal.style.display = "flex";
});

window.addEventListener("click", (e) => {
  if (e.target === regexpSettingModal) {
    regexpSettingModal.style.display = "none";
  }
  if (e.target === hideSettingModal) {
    hideSettingModal.style.display = "none";
  }
});
