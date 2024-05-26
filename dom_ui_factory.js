export class DomUiFactory {
  makeBorderedPanel() {
    const d = document.createElement("div");
    return {
      elt: d,
      addToCenter: (e) => d.appendChild(e.elt),
      addToEast: (e) => d.appendChild(e.elt),
      addToNorth: (e) => d.appendChild(e.elt),
      addToSouth: (e) => d.appendChild(e.elt),
      addToWest: (e) => d.appendChild(e.elt),
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
    let selectedIndex = -1;
    let listeners = [];
    for (const [i, label] of listItems.entries()) {
      const e = document.createElement("li");
      e.innerText = label;
      e.addEventListener("click", () => {
        selectedIndex = i + 1;
        for (const l of listeners) {
          l(i + 1);
        }
      });
      l.appendChild(e);
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
        for (const [i, label] of newListItems.entries()) {
          const e = document.createElement("li");
          e.innerText = label;
          e.addEventListener("click", () => {
            selectedIndex = i + 1;
            for (const l of listeners) {
              l(i + 1);
            }
          });
          l.appendChild(e);
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
    // TODO: input instead of textarea
    const t = document.createElement("span");
    t.innerText = "TextField";
    //return {elt: t, setText: (s) => {t.value = s;}}
    return { elt: t };
  }

  makeWindow() {
    const d = document.createElement("div");
    document.getElementById("workspace").appendChild(d);
    return {
      elt: d,
      addChildWidget: (c) => d.appendChild(c.elt),
      setSize: (w, h) => console.log("window size", w, h),
      setTitle: (t) => console.log("window title: " + t),
      setVisible: (v) => 0,
    };
  }
}
