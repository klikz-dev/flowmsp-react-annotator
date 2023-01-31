/* eslint no-unused-vars: 0 */

import FabricCanvasTool from './fabrictool';

const fabric = require('fabric').fabric;

class Delete extends FabricCanvasTool {
  configureCanvas(props) {
    const canvas = this._canvas;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject((o) => {
      o.selectable = o.evented = true;
      if (o.editable !== undefined) {
        o.editable = false;
      }
    });
    canvas.hoverCursor = 'pointer';
    this.isDown = false;
  }

  onObjectSelected({ target }) {
    const canvas = this._canvas;
    canvas.remove(target);
  }

  onMouseUp(event) {
    this.isDown = false;
  }

  onMouseDown(event) {
    this.isDown = true;
  }

  onMouseOver(e) {
    if (!this.isDown) return;
    const canvas = this._canvas;
    canvas.remove(e.target);
  }
}

export default Delete;
