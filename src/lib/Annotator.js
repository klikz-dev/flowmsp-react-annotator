/* eslint no-unused-vars: 0 */

'use strict';

import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import History from './history';
import Select from './select';
import Pencil from './pencil';
import Line from './line';
import Rectangle from './rectangle';
import Symbol from './symbol';
import Circle from './circle';
import Pan from './pan';
import Delete from './delete';
import Text from './text';
import TextBubble from './textBubble';
import Tool from './tools';
import CreateTextBubbleClass from './TextBubbleClass';

const fabric = require('fabric').fabric;

/**
 * Sketch Tool based on FabricJS for React Applications
 */
class Annotator extends Component {
  static propTypes = {
    // the color of the line
    color: PropTypes.string,
    // The width of the line
    lineWidth: PropTypes.number,
    // the fill color of the shape when applicable
    fillColor: PropTypes.string,
    // the opacity of the object
    opacity: PropTypes.number,
    // number of undo/redo steps to maintain
    undoSteps: PropTypes.number,
    // The tool to use, can be pencil, rectangle, circle, brush;
    tool: PropTypes.string,
    // image format when calling toDataURL
    imageFormat: PropTypes.string,
    // Default initial data
    defaultData: PropTypes.object,
    // Type of initial data
    defaultDataType: PropTypes.oneOf(['json', 'url']),
    // Specify some width correction which will be applied on auto resize
    widthCorrection: PropTypes.number,
    // Specify some height correction which will be applied on auto resize
    heightCorrection: PropTypes.number,
    // Function that fires on each changed
    onChange: PropTypes.func,
    // width
    width: PropTypes.number,
    // Height
    height: PropTypes.number,
    // CSS Class
    className: PropTypes.string,
    // inline style
    style: PropTypes.object,
    // image
    imageUrl: PropTypes.string,
    fontSize: PropTypes.number,
  };

  static defaultProps = {
    color: 'black',
    lineWidth: 10,
    fillColor: 'transparent',
    opacity: 1.0,
    undoSteps: 25,
    tool: Tool.Pencil,
    defaultDataType: 'json',
    widthCorrection: 2,
    heightCorrection: 0,
    fontSize: 22,
  };

  constructor(props, context) {
    super(props, context);
    // internal functions
    this._resize = this._resize.bind(this);
    this._initTools = this._initTools.bind(this);
    // exposed
    this.zoom = this.zoom.bind(this);
    this.enableTouchScroll = this.enableTouchScroll.bind(this);
    this.disableTouchScroll = this.disableTouchScroll.bind(this);
    // events
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onObjectAdded = this._onObjectAdded.bind(this);
    this._onObjectSelected = this._onObjectSelected.bind(this);
    this._onObjectMoving = this._onObjectMoving.bind(this);
    this._onObjectRemoved = this._onObjectRemoved.bind(this);
    this._onObjectScaling = this._onObjectScaling.bind(this);
    this._onObjectModified = this._onObjectModified.bind(this);
    this._onObjectRotating = this._onObjectRotating.bind(this);
    // pure render
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    this.state = {
      height: this.props,
      width: this.props,
      action: true,
    };
  }

  componentDidMount() {
    const { tool, undoSteps, defaultData, defaultDataType, height, width } = this.props;

    // override canvas defaults
    fabric.Canvas.prototype.set({
      perPixelTargetFind: true,
      targetFindTolerance: 15,
    });

    fabric.Object.prototype.set({
      perPixelTargetFind: true,
    });

    // get parent height and width
    const domSize = this.domNode.getBoundingClientRect();

    this._fc = new fabric.Canvas(this._canvas, {
      height: height || domSize.height,
      width: width || domSize.width,
      uniScaleTransform: true,
    });

    const canvas = this._fc;

    CreateTextBubbleClass(fabric, canvas);

    this._initTools(canvas);

    const selectedTool = this._tools[tool];
    selectedTool.configureCanvas(this.props);
    this._selectedTool = selectedTool;

    // Control resize
    // window.addEventListener('resize', this._resize, false);

    // Initialize History, with maximum number of undo steps
    this._history = new History(undoSteps);

    // Events binding
    canvas.on('object:added', this._onObjectAdded);
    canvas.on('object:modified', this._onObjectModified);
    canvas.on('object:removed', this._onObjectRemoved);
    canvas.on('mouse:down', this._onMouseDown);
    canvas.on('mouse:move', this._onMouseMove);
    canvas.on('mouse:up', this._onMouseUp);
    canvas.on('mouse:out', this._onMouseOut);
    canvas.on('mouse:over', this._onMouseOver);
    canvas.on('object:moving', this._onObjectMoving);
    canvas.on('object:scaling', this._onObjectScaling);
    canvas.on('object:rotating', this._onObjectRotating);
    canvas.on('object:selected', this._onObjectSelected);

    this.disableTouchScroll();
    this._resize();

    // initialize canvas with default data
    if (defaultData) {
      if (defaultDataType === 'json') {
        this.fromJSON(defaultData);
      }
      if (defaultDataType === 'url') {
        this.fromDataURL(defaultData);
      }
    } else {
      this.setBackgroundFromDataUrl(this.props.imageUrl);
    }
  }
  _initTools(fabricCanvas) {
    this._tools = {};
    this._tools[Tool.Select] = new Select(fabricCanvas);
    this._tools[Tool.Pencil] = new Pencil(fabricCanvas);
    this._tools[Tool.Line] = new Line(fabricCanvas);
    this._tools[Tool.Rectangle] = new Rectangle(fabricCanvas);
    this._tools[Tool.Symbol] = new Symbol(fabricCanvas);
    this._tools[Tool.Circle] = new Circle(fabricCanvas);
    this._tools[Tool.Pan] = new Pan(fabricCanvas);
    this._tools[Tool.Delete] = new Delete(fabricCanvas);
    this._tools[Tool.Text] = new Text(fabricCanvas);
    this._tools[Tool.TextBubble] = new TextBubble(fabricCanvas);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.parentWidth !== prevState.parentWidth ||
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this._resize();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tool !== nextProps.tool) {
      this._selectedTool.cleanUp();

      this._selectedTool = this._tools[nextProps.tool] || this._tools[Tool.Pencil];
      // Bring the cursor back to default if it is changed by a tool
      this._fc.defaultCursor = 'default';
    } else if (this.props.color !== nextProps.color) {
      this._selectedTool.setColor(nextProps.color);
    }
    this._selectedTool.configureCanvas(nextProps);
  }

  /**
   * Enable touch Scrolling on Canvas
   */
  enableTouchScroll() {
    const canvas = this._fc;
    if (canvas.allowTouchScrolling) return;
    canvas.allowTouchScrolling = true;
  }

  /**
   * Disable touch Scrolling on Canvas
   */
  disableTouchScroll() {
    const canvas = this._fc;
    if (canvas.allowTouchScrolling) {
      canvas.allowTouchScrolling = false;
    }
  }

  _onObjectAdded(e) {
    if (!this.state.action) {
      this.setState({ action: true });
      return;
    }
    const obj = e.target;
    obj.version = 1;
    const state = JSON.stringify(obj.originalState);
    // object, previous state, current state
    this._history.keep([obj, state, state]);
  }

  _onObjectSelected(e) {
    this._selectedTool.onObjectSelected(e);
  }

  _onObjectModified(e) {
    const obj = e.target;
    obj.version += 1;
    const prevState = JSON.stringify(obj.originalState);
    obj.saveState();
    const currState = JSON.stringify(obj.originalState);
    this._history.keep([obj, prevState, currState]);
  }

  _onObjectMoving(e) {}

  _onObjectScaling(e) {}

  _onObjectRotating(e) {}

  _onObjectRemoved(e) {
    const obj = e.target;
    obj.version = 0;
  }

  _onMouseDown(e) {
    this._selectedTool.onMouseDown(e);
  }

  _onMouseMove(e) {
    this._selectedTool.onMouseMove(e);
  }

  _onMouseOver(e) {
    this._selectedTool.onMouseOver(e);
  }

  _onMouseUp(e) {
    this._selectedTool.onMouseUp(e);
    if (this.props.onChange) {
      const onChange = this.props.onChange;
      setTimeout(() => {
        onChange(this.toJSON(), this.toSVG());
      }, 10);
    }
  }

  _onMouseOut(e) {
    this._selectedTool.onMouseOut(e);
    if (this.props.onChange) {
      const onChange = this.props.onChange;
      setTimeout(() => {
        onChange(this.toJSON(), this.toSVG());
      }, 10);
    }
  }

  setBold() {
    if (this._selectedTool.setBold) {
      this._selectedTool.setBold();
    }
  }
  setItalic() {
    if (this._selectedTool.setItalic) {
      this._selectedTool.setItalic();
    }
  }
  setUnderline() {
    if (this._selectedTool.setUnderline) {
      this._selectedTool.setUnderline();
    }
  }
  setFontSize(fontSize) {
    if (this._selectedTool.setFontSize) {
      this._selectedTool.setFontSize(fontSize);
    }
  }
  setImage(path) {
    if (this._selectedTool.setImage) {
      this._selectedTool.setImage(path);
    }
  }

  /**
   * Track the resize of the window and update our state
   *
   * @param e the resize event
   * @private
   */
  _resize(e) {
    if (e) e.preventDefault();
    const { widthCorrection, heightCorrection } = this.props;
    const canvas = this._fc;
    const { offsetWidth, clientHeight } = this.domNode;
    const prevWidth = canvas.getWidth();
    const prevHeight = canvas.getHeight();
    const wfactor = ((offsetWidth - widthCorrection) / prevWidth).toFixed(2);
    const hfactor = ((clientHeight - heightCorrection) / prevHeight).toFixed(2);
    canvas.setWidth(offsetWidth - widthCorrection);
    canvas.setHeight(clientHeight - heightCorrection);
    if (canvas.backgroundImage) {
      // Need to scale background images as well
      const bi = canvas.backgroundImage;
      bi.width *= wfactor;
      bi.height *= hfactor;
    }
    const objects = canvas.getObjects(); // TODO: refactor
    /* eslint-disable */ for (const i in objects) {
      const obj = objects[i];
      const scaleX = obj.scaleX;
      const scaleY = obj.scaleY;
      const left = obj.left;
      const top = obj.top;
      const tempScaleX = scaleX * wfactor;
      const tempScaleY = scaleY * hfactor;
      const tempLeft = left * wfactor;
      const tempTop = top * hfactor;
      obj.scaleX = tempScaleX;
      obj.scaleY = tempScaleY;
      obj.left = tempLeft;
      obj.top = tempTop;
      obj.setCoords();
    }
    /* eslint-enable */
    this.setState({
      parentWidth: offsetWidth,
    });
    canvas.renderAll();
    canvas.calcOffset();
  }

  /**
   * Zoom the drawing by the factor specified
   *
   * The zoom factor is a percentage with regards the original, for example if factor is set to 2
   * it will double the size whereas if it is set to 0.5 it will half the size
   *
   * @param factor the zoom factor
   */
  zoom(factor) {
    const canvas = this._fc;
    const objects = canvas.getObjects(); // TODO: refactor
    /* eslint-disable */ for (const i in objects) {
      objects[i].scaleX = objects[i].scaleX * factor;
      objects[i].scaleY = objects[i].scaleY * factor;
      objects[i].left = objects[i].left * factor;
      objects[i].top = objects[i].top * factor;
      objects[i].setCoords();
    }
    /* eslint-enable */
    canvas.renderAll();
    canvas.calcOffset();
  }

  /**
   * Perform an undo operation on canvas, if it cannot undo it will leave the canvas intact
   */
  undo() {
    const history = this._history;
    const [obj, prevState, currState] = history.getCurrent();
    history.undo();
    if (obj.version === 1) {
      obj.remove();
    } else {
      obj.setOptions(JSON.parse(prevState));
      obj.setCoords();
      obj.version -= 1;
      this._fc.renderAll();
    }
    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  /**
   * Perform a redo operation on canvas, if it cannot redo it will leave the canvas intact
   */
  redo() {
    const history = this._history;
    if (history.canRedo()) {
      const canvas = this._fc;
      // noinspection Eslint
      const [obj, prevState, currState] = history.redo();
      if (obj.version === 0) {
        this.setState({ action: false }, () => {
          canvas.add(obj);
          obj.version = 1;
        });
      } else {
        obj.version += 1;
        obj.setOptions(JSON.parse(currState));
      }
      obj.setCoords();
      canvas.renderAll();
      if (this.props.onChange) {
        this.props.onChange();
      }
    }
  }

  canUndo() {
    return this._history.canUndo();
  }

  canRedo() {
    return this._history.canRedo();
  }

  toDataURL(options) {
    return this._fc.toDataURL(options);
  }

  toJSON(propertiesToInclude) {
    const json = this._fc.toJSON();
    const bgImageJSON = json.backgroundImage;
    if (bgImageJSON) {
      bgImageJSON.scaleX = 1;
      bgImageJSON.scaleY = 1;
    }
    return json;
  }

  toSVG(propertiesToInclude) {
    return this._fc.toSVG();
  }

  fromJSON(json) {
    if (!json) return;
    const canvas = this._fc;
    const bgImageJSON = json.backgroundImage;
    if (bgImageJSON) {
      bgImageJSON.scaleX = 1;
      bgImageJSON.scaleY = 1;
    }
    canvas.loadFromJSON(json, () => {
      const img = canvas.backgroundImage;
      const canvasAspect = canvas.width / canvas.height;
      const imageAspect = img.width / img.height;
      let width;
      let height;
      if (canvasAspect > imageAspect) {
        width = canvas.height * imageAspect;
        height = canvas.height;
      } else {
        width = canvas.width;
        height = canvas.width / imageAspect;
      }
      const zoom = height / img.height;
      canvas.setZoom(zoom);
      canvas.setDimensions({ width, height });
      canvas.renderAll();
    });
  }

  clear(propertiesToInclude) {
    const discarded = this.toJSON(propertiesToInclude);
    this._fc.clear();
    this._history.clear();
    return discarded;
  }

  setBackgroundFromDataUrl(imageUrl, options = {}) {
    const canvas = this._fc;
    if (options.stretched) {
      delete options.stretched;
      Object.assign(options, {
        width: canvas.width,
        height: canvas.height,
      });
    }
    if (options.stretchedX) {
      delete options.stretchedX;
      Object.assign(options, {
        width: canvas.width,
      });
    }
    if (options.stretchedY) {
      delete options.stretchedY;
      Object.assign(options, {
        height: canvas.height,
      });
    }
    fabric.Image.fromURL(imageUrl, (img) => {
      const canvasAspect = canvas.width / canvas.height;
      const imageAspect = img.width / img.height;
      let width;
      let height;
      if (canvasAspect > imageAspect) {
        width = canvas.height * imageAspect;
        height = canvas.height;
      } else {
        width = canvas.width;
        height = canvas.width / imageAspect;
      }
      img.scaleX = width / img.width;
      img.scaleY = height / img.height;
      canvas.setBackgroundImage(img);
      canvas.setDimensions({ width, height });
      this.fromJSON(canvas.toJSON());
    });
  }

  render() {
    const { className, style, onChange, width, height, ...other } = this.props;

    return (
      <div
        className={className}
        ref={(node) => {
          this.domNode = node;
        }}
      >
        <canvas
          ref={(c) => {
            this._canvas = c;
          }}
        >
          You need to upgrade your browser.
        </canvas>
      </div>
    );
  }
}

export default Annotator;
