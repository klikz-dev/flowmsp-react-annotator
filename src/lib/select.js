/* eslint no-unused-vars: 0 */

import FabricCanvasTool from './fabrictool';

const fabric = require('fabric').fabric;

class Select extends FabricCanvasTool {
  configureCanvas(props) {
    const canvas = this._canvas;
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.forEachObject((o) => {
      o.selectable = o.evented = true;
    });
  }

  setColor(color) {
    this._canvas.getActiveObjects().forEach((o) => {
      if (o instanceof fabric.TextBubble) {
        o.set('backgroundColor', color);
        o.stem.set('fill', color);
      } else if (o instanceof fabric.IText) {
        o.set('fill', color);
      } else {
        o.set('stroke', color);
      }
    });
    this._canvas.requestRenderAll();
  }

  cleanUp() {
    this._canvas.discardActiveObject();
    this._canvas.requestRenderAll();
  }
}

export default Select;
