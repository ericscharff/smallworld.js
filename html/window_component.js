const template = document.createElement("template");
template.innerHTML = `
<style>
  * {
    box-sizing: border-box;
  }

  :host {
    --win-bg: #fff;
    --win-header-bg: rgba(243, 243, 243, 0.8);
    --win-border: rgba(0, 0, 0, 0.15);
    --win-shadow:
     0 1px 1px rgba(0, 0, 0, 0.11),
     0 2px 2px rgba(0, 0, 0, 0.11),
     0 4px 4px rgba(0, 0, 0, 0.11),
     0 8px 8px rgba(0, 0, 0, 0.11),
     0 16px 16px rgba(0, 0, 0, 0.11);
    --win-radius: 10px;
    --accent-color: #444cf7;

    position: absolute;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    min-height: 200px;
    background: var(--win-bg);
    border-radius: var(--win-radius);
    box-shadow: var(--win-shadow);
    border: 1px solid var(--win-border);
    overflow: hidden;
    user-select: none;
    font-family: system-ui;
    transition: box-shadow 0.2s ease;
  }

  :host(:focus-within) {
    border-color: var(--accent-color);
  }

  .title-bar {
    background: var(--win-header-bg);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--win-border);
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: default;
    flex-shrink: 0;
  }

  .title-bar:active {
    cursor: move;
  }

  .title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #222;
    letter-spacing: -0.01em;
  }

  .controls {
    display: flex;
    gap: 8px;
  }

  .close-btn {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #ff5f57;
    cursor: pointer;
    position: relative;
    transition: transform 0.1s;
  }

  .close-btn:hover {
    background: #ff4b42;
    transform: scale(1.1);
  }

  .content {
    flex-grow: 1;
    padding: 0;
    overflow: auto;
    background: transparent;
    user-select: text;
  }

  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 12px;
    height: 12px;
    cursor: nwse-resize;
    z-index: 10;
  }
</style>

<div class="title-bar">
  <div class="title" id="title-text">Window</div>
  <div class="controls">
    <button class="close-btn" id="close-btn" title="Close"></button>
  </div>
</div>
<div class="content">
  <slot></slot>
</div>
<div class="resize-handle"></div>
`;

class MyWindow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.x_ = 100;
    this.y_ = 100;
    this.width_ = 350;
    this.height_ = 250;
    this.isDragging_ = false;
    this.isResizing_ = false;
  }

  static get observedAttributes() {
    return ["window-title", "x", "y", "width", "height"];
  }

  connectedCallback() {
    this.shadowRoot
      .querySelector(".title-bar")
      .addEventListener("mousedown", (e) => {
        this.onMouseDown(e);
      });
    this.shadowRoot
      .querySelector(".resize-handle")
      .addEventListener("mousedown", (e) => {
        this.onResizeMouseDown(e);
      });
    this.shadowRoot
      .querySelector(".close-btn")
      .addEventListener("click", () => {
        this.remove();
      });
    this.addEventListener("mousedown", () => {
      this.onWindowClick();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "window-title":
        this.shadowRoot.getElementById("title-text").textContent = newValue;
        break;
      case "x":
        this.x_ = parseInt(newValue, 10);
        break;
      case "y":
        this.y_ = parseInt(newValue, 10);
        break;
      case "width":
        this.width_ = parseInt(newValue, 10);
        break;
      case "height":
        this.height_ = parseInt(newValue, 10);
        break;
    }
    this.render();
  }

  onWindowClick() {
    this.dispatchEvent(
      new CustomEvent("window-focus", { bubbles: true, composed: true }),
    );
  }

  onMouseDown(e) {
    if (e.target.closest(".close-btn")) return;

    this.isDragging_ = true;
    this.startX_ = e.clientX - this.x_;
    this.startY_ = e.clientY - this.y_;

    this.registerListeners();
    this.onWindowClick();
  }

  onResizeMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    const startResizing = !this.isResizing_;
    this.isResizing_ = true;
    this.startX_ = e.clientX;
    this.startY_ = e.clientY;
    this.startWidth_ = this.width_;
    this.startHeight_ = this.height_;

    this.registerListeners();
    this.onWindowClick();
  }

  onMouseMove(e) {
    if (this.isDragging_) {
      this.x_ = e.clientX - this.startX_;
      this.y_ = e.clientY - this.startY_;
      this.render();
    } else if (this.isResizing_) {
      this.width_ = Math.max(
        200,
        this.startWidth_ + (e.clientX - this.startX_),
      );
      this.height_ = Math.max(
        150,
        this.startHeight_ + (e.clientY - this.startY_),
      );
      this.render();
    }
  }

  onMouseUp() {
    this.isDragging_ = false;
    this.isResizing_ = false;
    document.removeEventListener("mousemove", this.moveListener_);
    document.removeEventListener("mouseup", this.upListener_);
    this.moveListener_ = null;
    this.upListener_ = null;
  }

  registerListeners() {
    if (!this.moveListener_) {
      this.moveListener_ = (e) => {
        this.onMouseMove(e);
      };
      document.addEventListener("mousemove", this.moveListener_);
    }
    if (!this.upListener_) {
      this.upListener_ = () => {
        this.onMouseUp();
      };
      document.addEventListener("mouseup", this.upListener_);
    }
  }

  render() {
    this.style.left = `${this.x_}px`;
    this.style.top = `${this.y_}px`;
    this.style.width = `${this.width_}px`;
    this.style.height = `${this.height_}px`;
  }
}

customElements.define("st-window", MyWindow);
