import "./window_component.js";

let highestZIndex = 100;

export class DomUiFactory {
  makeBorderedPanel() {
    const d = document.createElement("div");
    d.classList.add("borderPane");
    return {
      elt: d,
      addToCenter: (e) => {
        e.elt.classList.add("center");
        d.appendChild(e.elt);
      },
      addToEast: (e) => {
        e.elt.classList.add("east");
        d.appendChild(e.elt);
      },
      addToNorth: (e) => {
        e.elt.classList.add("north");
        d.appendChild(e.elt);
      },
      addToSouth: (e) => {
        e.elt.classList.add("south");
        d.appendChild(e.elt);
      },
      addToWest: (e) => {
        e.elt.classList.add("west");
        d.appendChild(e.elt);
      },
    };
  }

  makeButton(buttonLabel) {
    const b = document.createElement("button");
    b.innerText = buttonLabel;
    return {
      elt: b,
      addButtonListener: (l) => b.addEventListener("click", () => l()),
    };
  }

  makeGridPanel() {
    const d = document.createElement("div");
    return { elt: d, addChild: (c) => d.appendChild(c.elt) };
  }

  makeLabel(labelText) {
    const s = document.createElement("span");
    s.innerText = labelText;
    return { elt: s };
  }

  makeListWidget(listItems) {
    const l = document.createElement("ul");
    l.classList.add("listBox");
    let selectedIndex = -1;
    let listeners = [];
    let listItemElts = [];
    for (const [i, label] of listItems.entries()) {
      const e = document.createElement("li");
      e.innerText = label;
      e.addEventListener("click", () => {
        // Deslect old item
        if (selectedIndex > 0) {
          listItemElts[selectedIndex - 1].classList.remove("selected");
        }
        // Select new item
        listItemElts[i].classList.add("selected");

        selectedIndex = i + 1;
        for (const l of listeners) {
          l(i + 1);
        }
      });
      l.appendChild(e);
      listItemElts.push(e);
    }
    return {
      elt: l,
      addSelectionListener: (l) => listeners.push(l),
      getSelectedIndex: () => selectedIndex,
      setData: (newListItems) => {
        // Remove all list elements
        while (l.firstChild) {
          l.removeChild(l.firstChild);
        }
        listItemElts = [];
        selectedIndex = -1;
        for (const [i, label] of newListItems.entries()) {
          const e = document.createElement("li");
          e.innerText = label;
          e.addEventListener("click", () => {
            // Deslect old item
            if (selectedIndex > 0) {
              listItemElts[selectedIndex - 1].classList.remove("selected");
            }
            // Select new item
            listItemElts[i].classList.add("selected");

            selectedIndex = i + 1;
            for (const l of listeners) {
              l(i + 1);
            }
          });
          l.appendChild(e);
          listItemElts.push(e);
        }
      },
    };
  }

  makeTextArea() {
    const t = document.createElement("textarea");
    return {
      elt: t,
      getText: () => t.value,
      setText: (s) => {
        t.value = s;
      },
    };
  }

  makeTextField() {
    const t = document.createElement("input");
    t.type = "text";
    return {
      elt: t,
      getText: () => t.value,
      setText: (s) => {
        t.value = s;
      },
    };
  }

  makeWindow() {
    const d = document.createElement("st-window");
    d.setAttribute("window-title", "Window");
    d.style.zIndex = ++highestZIndex;
    d.setAttribute("x", 50);
    d.setAttribute("y", 50);
    d.setAttribute("width", 400);
    d.setAttribute("height", 300);
    document.getElementById("workspace").appendChild(d);
    return {
      elt: d,
      addChildWidget: (c) => d.appendChild(c.elt),
      setSize: (w, h) => {
        d.setAttribute("width", w);
        d.setAttribute("height", h);
      },
      setTitle: (t) => {
        d.setAttribute("window-title", t);
      },
      setVisible: (v) => {
        if (!v) {
          document.getElementById("workspace").removeChild(d);
        }
      },
    };
  }
}

// Handle z index on window selections
document.addEventListener("window-focus", (e) => {
  e.target.style.zIndex = ++highestZIndex;
});
