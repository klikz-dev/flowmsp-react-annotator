/* eslint no-unused-vars: 0 */

import FabricCanvasTool from './fabrictool';

const fabric = require('fabric').fabric;

class Symbol extends FabricCanvasTool {
  configureCanvas(props) {
    const canvas = this._canvas;
    canvas.isDrawingMode = canvas.selection = false;
    canvas.forEachObject((o) => {
      o.selectable = o.evented = false;
    });
  }

  onMouseDown(o) {
    if (!this.currentImagePath) {
      console.log('No Path Selected');
      return;
    }
    const canvas = this._canvas;
    this.isDown = true;
    const pointer = canvas.getPointer(o.e);
    const pugImg = new Image();
    this.symb = new fabric.Image(pugImg, {
      width: 256,
      height: 256,
      left: Math.abs(pointer.x),
      top: Math.abs(pointer.y),
      selectable: false,
      evented: false,
      scaleX: 0.25,
      scaleY: 0.25,
    });
    console.log(this.currentImagePath);
    pugImg.src = this.currentImagePath;
    canvas.add(this.symb);
    canvas.renderAll();
  }

  setImage(path) {
    this.currentImagePath = path;
  }

  onMouseMove(o) {
    this.isDown = false;
  }

  onMouseUp(o) {
    this.isDown = false;
  }
}

export default Symbol;
