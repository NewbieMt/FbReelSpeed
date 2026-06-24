// ==UserScript==
// @name         Facebook Reel Speed Controller + Overlay
// @namespace    https://facebook.com
// @version      2.0
// @description  Bảng điều khiển tốc độ Video/Reels trên Facebook, ẩn overlay
// @author       NewbieMt
// @match        https://www.facebook.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const styles = `
    .fb-custom-speed-panel {
      position: absolute; top: 70px; left: 10px; z-index: 2147483647;
      background: rgba(0,0,0,0.4); color: white; padding: 6px;
      border-radius: 6px; font-size: 14px; display: flex; flex-direction: column; gap: 5px;
      backdrop-filter: blur(4px);
      transition: all 0.3s ease;
      cursor: grab;
    }
    .fb-custom-speed-panel:active { cursor: grabbing; }
    .fb-custom-speed-panel:hover { background: rgba(0,0,0,0.8); }
    .fb-custom-speed-panel select { background: #333; color: white; border: 1px solid #555; border-radius: 3px; }
    .fb-custom-btn {
      background: #444; color: white; border: none; border-radius: 4px;
      cursor: pointer; padding: 2px 8px; transition: 0.2s;
    }
    .fb-custom-btn:hover { background: #666; }
    .fb-custom-toggle-btn {
      position: absolute; top: 10px; right: 10px; z-index: 2147483647;
      background: rgba(0,0,0,0.6); color: white; border: none; padding: 5px 10px;
      border-radius: 5px; cursor: pointer;
    }
    .fb-custom-close-mini {
      position: absolute; top: 5px; left: 5px; z-index: 2147483647;
      background: rgba(0,0,0,0.7); color: white; border: none; padding: 5px 8px;
      border-radius: 50%; cursor: pointer; font-size: 14px; font-weight: bold;
    }
    .fb-hide-overlay [data-visualcompletion="ignore-dynamic"],
    .fb-hide-overlay [data-visualcompletion="ignore"],
    .fb-hide-overlay [role="link"],
    .fb-hide-overlay .fb-custom-speed-panel {
        display: none !important;
    }
  `;

  if (typeof GM_addStyle !== "undefined") {
    GM_addStyle(styles);
  } else {
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  function findRootPlayerDiv(video) {
    if (!video) return null;
    let el = video;
    while (el && el !== document.body) {
      if (el.matches('div[data-testid="video_player_root"]')) return el;
      el = el.parentElement;
    }
    return video.closest('div[role="presentation"]') || video.parentElement;
  }

  function updateVideoSpeed(video, newSpeed, uiElements) {
    newSpeed = Math.max(0.1, parseFloat(newSpeed.toFixed(2)));
    video.playbackRate = newSpeed;
    GM_setValue("fbReelSpeed", newSpeed);

    if (uiElements) {
      uiElements.input.value = newSpeed;
      const opt = uiElements.select.querySelector(
        `option[value="${newSpeed}"]`,
      );
      uiElements.select.value = opt ? newSpeed : "";
    }
  }

  function setupHoldableButton(button, video, uiElements, step) {
    let id = null;
    const change = () => {
      let cur = parseFloat(uiElements.input.value) || 1.0;
      updateVideoSpeed(video, cur + step, uiElements);
    };
    button.onmousedown = (e) => {
      e.preventDefault();
      change();
      id = setInterval(change, 100);
    };
    const stop = () => {
      if (id) clearInterval(id);
      id = null;
    };
    button.onmouseup = stop;
    button.onmouseleave = stop;
  }

  function createSpeedControl(video) {
    if (video.dataset.hasSpeedControl) return;
    const root = findRootPlayerDiv(video);
    if (!root) return;

    video.dataset.hasSpeedControl = "true";
    root.style.position = "relative";

    const savedSpeed = GM_getValue("fbReelSpeed", 1.0);
    const container = document.createElement("div");
    container.className = "fb-custom-speed-panel";

    // Khôi phục vị trí nếu đã từng kéo
    const savedPos = GM_getValue("fbReelSpeedPos", null);
    if (savedPos) {
      container.style.top = savedPos.top;
      container.style.left = savedPos.left;
      container.style.bottom = 'auto';
    }

    const row1 = document.createElement("div");
    row1.style.display = "flex";
    row1.style.alignItems = "center";

    const label = document.createElement("label");
    label.textContent = "Tốc độ: ";
    label.style.marginRight = "5px";

    const select = document.createElement("select");
    [0.25, 0.75, 1, 1.25, 1.5, 2, 2.5, 2.75, 3, 5].forEach((s) => {
      const o = document.createElement("option");
      o.value = s;
      o.textContent = s + "x";
      if (s === savedSpeed) o.selected = true;
      select.appendChild(o);
    });

    const expand = document.createElement("button");
    expand.className = "fb-custom-btn";
    expand.textContent = "⚙️";
    expand.style.marginLeft = "5px";

    const row2 = document.createElement("div");
    row2.style.display = "none";
    row2.style.alignItems = "center";
    row2.style.gap = "3px";

    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.1";
    input.min = "0.1";
    input.value = savedSpeed;
    input.style.width = "40px";
    input.style.textAlign = "center";

    const dec = document.createElement("button");
    dec.className = "fb-custom-btn";
    dec.textContent = "-";
    const inc = document.createElement("button");
    inc.className = "fb-custom-btn";
    inc.textContent = "+";

    const uiElements = { input, select };

    select.onchange = () =>
      updateVideoSpeed(video, parseFloat(select.value), uiElements);
    input.onchange = () =>
      updateVideoSpeed(video, parseFloat(input.value), uiElements);
      
    // Logic kéo thả (Draggable)
    let isDragging = false, startX, startY, startLeft, startTop;
    container.addEventListener('mousedown', (e) => {
      if (['INPUT', 'BUTTON', 'SELECT', 'OPTION'].includes(e.target.tagName)) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = container.offsetLeft;
      startTop = container.offsetTop;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let newLeft = startLeft + e.clientX - startX;
      let newTop = startTop + e.clientY - startY;
      
      // Giới hạn trong khung video
      const maxLeft = root.offsetWidth - container.offsetWidth;
      const maxTop = root.offsetHeight - container.offsetHeight;
      
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      
      container.style.left = newLeft + 'px';
      container.style.top = newTop + 'px';
      container.style.bottom = 'auto';
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        GM_setValue("fbReelSpeedPos", { top: container.style.top, left: container.style.left });
      }
    });
    setupHoldableButton(dec, video, uiElements, -0.1);
    setupHoldableButton(inc, video, uiElements, 0.1);

    expand.onclick = () =>
      (row2.style.display = row2.style.display === "none" ? "flex" : "none");

    row1.append(label, select, expand);
    row2.append(dec, input, inc);
    container.append(row1, row2);
    root.appendChild(container);

    video.playbackRate = savedSpeed;
  }

  function createOverlayToggle(video) {
    if (video.dataset.hasOverlayToggle) return;
    const root = findRootPlayerDiv(video);
    if (!root) return;

    video.dataset.hasOverlayToggle = "true";
    const btn = document.createElement("button");
    btn.className = "fb-custom-toggle-btn";
    btn.textContent = "👁️";
    btn.title = "Ẩn/hiện lớp phủ";

    btn.onclick = () => {
      root.classList.toggle("fb-hide-overlay");
    };
    root.appendChild(btn);
  }

  function addCloseButtonToMiniPlayer() {
    const containers = document.querySelectorAll(
      'div[style*="position: fixed"][style*="bottom"]',
    );
    containers.forEach((container) => {
      if (container.dataset.hasCloseBtn || !container.querySelector("video"))
        return;
      container.dataset.hasCloseBtn = "true";

      const close = document.createElement("button");
      close.className = "fb-custom-close-mini";
      close.textContent = "✖";
      close.title = "Đóng video thu nhỏ";

      close.onclick = () => container.remove();
      container.appendChild(close);
    });
  }

  function init() {
    document.querySelectorAll("video").forEach((v) => {
      if (!v.offsetParent) return;
      createSpeedControl(v);
      createOverlayToggle(v);
    });
    addCloseButtonToMiniPlayer();
  }

  init();

  let timeoutId = null;
  const observer = new MutationObserver(() => {
    if (timeoutId) return;
    timeoutId = setTimeout(() => {
      init();
      timeoutId = null;
    }, 800);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
