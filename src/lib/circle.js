/* eslint-disable */

import FabricCanvasTool from './fabrictool';

const fabric = require('fabric').fabric;

import { linearDistance } from './utils';

class Circle extends FabricCanvasTool {
  configureCanvas(props) {
    const canvas = this._canvas;
    canvas.isDrawingMode = canvas.selection = false;
    canvas.forEachObject(o => (o.selectable = o.evented = false));
    this._width = props.lineWidth;
    this._color = props.color;
    this._fill = props.fillColor;
  }

  onMouseDown(o) {
    const canvas = this._canvas;
    this.isDown = true;
    const pointer = canvas.getPointer(o.e);
    [this.startX, this.startY] = [pointer.x, pointer.y];
    this.circle = new fabric.Circle({
      left: this.startX,
      top: this.startY,
      originX: 'left',
      originY: 'center',
      strokeWidth: this._width,
      stroke: this._color,
      fill: this._fill,
      selectable: false,
      evented: false,
      radius: 1,
    });
    canvas.add(this.circle);
  }

  onMouseMove(o) {
    if (!this.isDown) return;
    const canvas = this._canvas;
    const pointer = canvas.getPointer(o.e);
    this.circle.set({
      radius:
        linearDistance({ x: this.startX, y: this.startY }, { x: pointer.x, y: pointer.y }) / 2,
      angle: Math.atan2(pointer.y - this.startY, pointer.x - this.startX) * 180 / Math.PI,
    });
    this.circle.setCoords();
    canvas.renderAll();
  }

  onMouseUp(o) {
    this.isDown = false;
  }


}

export default Circle;
