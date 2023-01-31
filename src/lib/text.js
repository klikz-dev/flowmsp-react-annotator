import FabricCanvasTool from './fabrictool';

const fabric = require('fabric').fabric;

class Text extends FabricCanvasTool {
  configureCanvas(props) {
    const canvas = this._canvas;
    this._color = props.color;
    this._font = props.font || 'Helvetica';
    this._fontSize = props.fontSize || 22;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject((o) => {
      o.selectable = o.evented = o.editable = o instanceof fabric.IText;
    });

    this.current = null;
  }

  cleanUp() {
    const activeObj = this._canvas.getActiveObject();
    if (activeObj) activeObj.exitEditing();
    if (this.current) this.current.exitEditing();
    this._canvas.discardActiveObject();
    this._canvas.requestRenderAll();
  }

  onMouseDown({ e, target }) {
    if (target) {
      target.enterEditing();
      return;
    }
    const canvas = this._canvas;
    const pointer = canvas.getPointer(e);

    const shadow = new fabric.Shadow({
      color: 'rgb(0,0,0)',
      blur: 10,
      offsetX: 0,
      offsetY: 0,
      opacity: 0.8,
      fillShadow: true,
    });

    this.current = new fabric.IText('', {
      fontSize: this._fontSize,
      fontFamily: this._font,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      left: pointer.x,
      top: pointer.y,
      fill: this._color,
      selectable: true,
    });

    this.current.setShadow(shadow);
    canvas.add(this.current);
    this.current.enterEditing();
  }

  setBold() {
    const canvas = this._canvas;
    const obj = canvas.getActiveObject() || this.current;
    if (obj) {
      const styles = obj.getSelectionStyles();
      if (styles[0] && styles[0].fontWeight === 'bold') {
        obj.setSelectionStyles({ fontWeight: undefined });
      } else {
        obj.setSelectionStyles({ fontWeight: 'bold' });
      }
      canvas.renderAll();
    }
  }

  setItalic() {
    const canvas = this._canvas;
    const obj = canvas.getActiveObject() || this.current;
    if (obj) {
      const styles = obj.getSelectionStyles();
      if (styles[0] && styles[0].fontStyle === 'italic') {
        obj.setSelectionStyles({ fontStyle: undefined });
      } else {
        obj.setSelectionStyles({ fontStyle: 'italic' });
      }
      canvas.renderAll();
    }
  }

  setUnderline() {
    const canvas = this._canvas;
    const obj = canvas.getActiveObject() || this.current;
    if (obj) {
      const styles = obj.getSelectionStyles();
      if (styles[0] && styles[0].underline === 'underline') {
        obj.setSelectionStyles({ underline: undefined });
      } else {
        obj.setSelectionStyles({ underline: 'underline' });
      }
      canvas.renderAll();
    }
  }

  setFontSize(fontSize) {
    const canvas = this._canvas;
    const obj = canvas.getActiveObject() || this.current;
    if (obj) {
      obj.setSelectionStyles({ fontSize });
      canvas.renderAll();
    }
  }

  setColor(color) {
    const obj = this._canvas.getActiveObject() || this.current;
    obj.set('fill', color);
    this._canvas.renderAll();
  }
}

export default Text;
