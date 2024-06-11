import { SmallByteArray, SmallJsObject } from "./objects.js";

export class UiHandler {
  constructor(uiFactory) {
    this.uiFactory = uiFactory;
  }

  handle(interpreter, high, stack, stackTop) {
    let returnedValue = null;
    switch (high) {
      case 60: // make window
        const uiWindow = this.uiFactory.makeWindow();
        returnedValue = new SmallJsObject(stack[--stackTop], uiWindow);
        break;
      case 61: // show/hide text window
        returnedValue = stack[--stackTop]; // true = visible (show)
        const windowToShow = stack[--stackTop];
        windowToShow.nativeObject.setVisible(
          returnedValue === interpreter.trueObject,
        );
        break;
      case 62: // add pane to window
        const contentPane = stack[--stackTop].nativeObject;
        returnedValue = stack[--stackTop]; // the window
        returnedValue.nativeObject.addChildWidget(contentPane);
        break;
      case 63: // set window size
        const width = stack[--stackTop].value; // a SmallInt
        const height = stack[--stackTop].value; // a SmallInt
        returnedValue = stack[--stackTop]; // the window
        returnedValue.nativeObject.setSize(width, height);
        break;
      case 65: // set window title
        const windowTitle = stack[--stackTop].toString();
        returnedValue = stack[--stackTop]; // the window
        returnedValue.nativeObject.setTitle(windowTitle);
        break;
      case 66: // repaint window
        returnedValue = stack[--stackTop];
        // redraw widget? not needed...
        break;
      case 70: // new label panel
        const uiLabel = this.uiFactory.makeLabel(stack[--stackTop].toString());
        returnedValue = new SmallJsObject(stack[--stackTop], uiLabel);
        break;
      case 71: // new button
        const buttonAction = stack[--stackTop];
        const uiButton = this.uiFactory.makeButton(
          /* label = */ stack[--stackTop].toString(),
        );
        returnedValue = new SmallJsObject(stack[--stackTop], uiButton);
        uiButton.addButtonListener(() => interpreter.runAction(buttonAction));
        break;
      case 72: // new text field
        returnedValue = new SmallJsObject(
          stack[--stackTop],
          this.uiFactory.makeTextField(),
        );
        break;
      case 73: // new text area
        returnedValue = new SmallJsObject(
          stack[--stackTop],
          this.uiFactory.makeTextArea(),
        );
        break;
      case 74: // new grid panel
        const gridPanelData = stack[--stackTop]; // a SmallObject array of widgets
        const gridHeight = stack[--stackTop].value; // a SmallInt
        const gridWidth = stack[--stackTop].value; // a SmallInt
        const uiGridPanel = this.uiFactory.makeGridPanel(gridWidth, gridHeight);
        for (let i = 0; i < gridPanelData.data.length; i++) {
          uiGridPanel.addChild(gridPanelData.data[i].nativeObject);
        }
        returnedValue = new SmallJsObject(stack[--stackTop], uiGridPanel);
        break;
      case 75: // new list panel
        const listAction = stack[--stackTop];
        const listData = stack[--stackTop].data.map((e) => e.toString()); // array of strings
        returnedValue = stack[--stackTop]; // wrapper class for list
        const uiList = this.uiFactory.makeListWidget(listData);
        returnedValue = new SmallJsObject(returnedValue, uiList);
        uiList.addSelectionListener((index) =>
          interpreter.runActionWithValue(
            listAction,
            interpreter.newInteger(index),
          ),
        );
        break;
      case 76: // new border panel
        const uiBorderPanel = this.uiFactory.makeBorderedPanel();
        returnedValue = stack[--stackTop];
        if (returnedValue !== interpreter.nilObject) {
          uiBorderPanel.addToCenter(returnedValue.nativeObject);
        }
        returnedValue = stack[--stackTop];
        if (returnedValue !== interpreter.nilObject) {
          uiBorderPanel.addToWest(returnedValue.nativeObject);
        }
        returnedValue = stack[--stackTop];
        if (returnedValue !== interpreter.nilObject) {
          uiBorderPanel.addToEast(returnedValue.nativeObject);
        }
        returnedValue = stack[--stackTop];
        if (returnedValue !== interpreter.nilObject) {
          uiBorderPanel.addToSouth(returnedValue.nativeObject);
        }
        returnedValue = stack[--stackTop];
        if (returnedValue !== interpreter.nilObject) {
          uiBorderPanel.addToNorth(returnedValue.nativeObject);
        }
        returnedValue = new SmallJsObject(stack[--stackTop], uiBorderPanel);
        break;
      case 80: // get contents of text area
        const textAreaContents = stack[--stackTop].nativeObject.getText();
        // String class is passed in to create the return type
        const stringClass = stack[--stackTop];
        returnedValue = new SmallByteArray(stringClass, textAreaContents);
        break;
      case 82: // set contents of text area
        returnedValue = stack[--stackTop]; // The text (String)
        stack[--stackTop].nativeObject.setText(returnedValue.toString());
        break;
      case 83: // get list selected index
        returnedValue = interpreter.newInteger(
          stack[--stackTop].nativeObject.getSelectedIndex(),
        );
        break;
      case 84: // set list data
        const newListData = stack[--stackTop].data.map((e) => e.toString()); // array of strings
        returnedValue = stack[--stackTop]; // the list widget
        returnedValue.nativeObject.setData(newListData);
        break;
    }
    return [returnedValue, stackTop];
  }
}
