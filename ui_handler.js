import { SmallObject } from "./objects.js";

export class UIHandler {
  handle(high, stack, stackTop) {
    let returnedValue = null;
    switch (high) {
      case 60: // make window
        returnedValue = new SmallObject(stack[--stackTop], 0);
        break;
      case 61: // show/hide text window
        const showHide = stack[--stackTop];
        /* the window = */ stack[--stackTop];
        // Set visible vased on showHide
        returnedValue = showHide;
        break;
      case 62: // set window content pane
        /* SmallJavaObject pane = */ stack[--stackTop];
        returnedValue = stack[--stackTop];
        // SmallJavaObject jd = (SmallJavaObject) returnedValue;
        // ((Window) jd.value).addChild((Widget) tc.value);
        break;
      case 63: // set window size
        /* const height = */ stack[--stackTop];
        /* const width = */ stack[--stackTop];
        returnedValue = stack[--stackTop];
        // set window size
        break;
      case 65: // set window title
        /* const title = */ stack[--stackTop];
        returnedValue = stack[--stackTop];
        // set window title
        break;
      case 71: // new button
        /* final SmallObject action = */ stack[--stackTop];
        /* String label = */ stack[--stackTop];
        returnedValue = new SmallObject(stack[--stackTop], 0);
        // jb.addButtonListener(
        //     new Button.ButtonListener() {
        //       @Override
        //       public void buttonClicked() {
        //         new ActionThread(action, myThread).start();
        //       }
        //     });
        break;
      case 72: // new text field
        returnedValue = new SmallObject(stack[--stackTop], 0);
        break;
      case 73: // new text area
        returnedValue = new SmallObject(stack[--stackTop], 0);
        break;
      case 74: // new grid panel
        /* SmallObject data = */ stack[--stackTop];
        /* const columns = */ stack[--stackTop];
        /* const rows = */ stack[--stackTop];
        //GridPanel gp = this.uiFactory.makeGridPanel(low, high);
        //for (int i = 0; i < data.data.length; i++) {
        //  gp.addChild(asWidget(data.data[i]));
        //}
        returnedValue = new SmallObject(stack[--stackTop], 0);
        break;
      case 75: // new list panel
        // new list panel
        /* ignored action = */ stack[--stackTop];
        /* ignored data = */ stack[--stackTop];
        returnedValue = stack[--stackTop];
        // ListWidget jl = this.uiFactory.makeListWidget(data.data);
        // returnedValue = new SmallJavaObject(returnedValue, jl);
        returnedValue = new SmallObject(returnedValue, 0);
        // jl.addSelectionListener(
        //     new ListWidget.Listener() {
        //       @Override
        //       public void itemSelected(int selectedIndex) {
        //         new ActionThread(action, myThread, selectedIndex).start();
        //       }
        //     });
        break;
      case 76: // new border panel
        // BorderedPanel bp = this.uiFactory.makeBorderedPanel();
        returnedValue = stack[--stackTop];
        // if (returnedValue != this.nilObject) {
        //  bp.addToCenter(asWidget(returnedValue));
        // }
        returnedValue = stack[--stackTop];
        // if (returnedValue != this.nilObject) {
        //   bp.addToWest(asWidget(returnedValue));
        // }
        returnedValue = stack[--stackTop];
        // if (returnedValue != this.nilObject) {
        //   bp.addToEast(asWidget(returnedValue));
        // }
        returnedValue = stack[--stackTop];
        // if (returnedValue != this.nilObject) {
        //  bp.addToSouth(asWidget(returnedValue));
        // }
        returnedValue = stack[--stackTop];
        // if (returnedValue != this.nilObject) {
        //  bp.addToNorth(asWidget(returnedValue));
        //}
        returnedValue = new SmallObject(stack[--stackTop], 0);
        break;
    }
    return { returnedValue, stack, stackTop };
  }
}
