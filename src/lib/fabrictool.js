/* eslint no-unused-vars: 0 */

/**
 * "Abstract" like base class for a Canvas tool
 */
class FabricCanvasTool {
  constructor(canvas) {
    this._canvas = canvas;
  }

  configureCanvas(props) {}

  onMouseUp(event) {}

  onMouseDown(event) {}

  onMouseMove(event) {}

  onMouseOut(event) {}

  onMouseOver(event) {}

  onObjectSelected(event) {}

  setColor() {}

  cleanUp() {}
}

export default FabricCanvasTool;
