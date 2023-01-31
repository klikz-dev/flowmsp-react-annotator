import FabricCanvasTool from './fabrictool';

const fabric = require('fabric').fabric;

class TextBubble extends FabricCanvasTool {
  configureCanvas(props) {
    const canvas = this._canvas;
    this._color = props.color;
    this._font = props.font || 'Helvetica';
    this._fontSize = props.fontSize || 22;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject((o) => {
      o.selectable = o.evented = o instanceof fabric.TextBubble;
      if (o instanceof fabric.TextBubble) {
        o.editable = false;
      }
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
      return;
    }

    // if () {
    //   this._canvas.setActiveObject();
    //   return;
    // }
    const canvas = this._canvas;
    const pointer = canvas.getPointer(e);

    this.current = new fabric.TextBubble({
      fontSize: this._fontSize,
      fontFamily: this._font,
      textAlign: 'center',
      left: pointer.x,
      top: pointer.y,
      width: 200,
      backgroundColor: this._color,
      selectable: true,
    });

    canvas.add(this.current);
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
    const obj = this._canvas.getActiveObject();
    if (obj) {
      obj.set('backgroundColor', color);
      obj.stem.set('fill', color);
      this._canvas.renderAll();
    }
  }
}

export default TextBubble;
