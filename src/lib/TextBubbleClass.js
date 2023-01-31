export default (fabric, canvas) => {
  fabric.TextBubble = fabric.util.createClass(fabric.Textbox, {
    type: 'textBubble',

    initialize(options = {}) {
      this.callSuper('initialize', 'Use the Text Label Tool to edit me!', {
        left: 0,
        top: 0,
        fontFamily: 'arial black',
        fill: 'black',
        strokeWidth: 10,
        backgroundColor: 'rgba(0,0,0,0.25)',
        fontSize: 12,
        objectCaching: false,
        editable: false,
        ...options,
      });
      this.setControlsVisibility({ mt: false, mtr: false, mb: false });

      this.anchor = new fabric.Rect({
        left: (options.stem ? options.stem.x : this.left + 25) - 15 / 2,
        top: (options.stem ? options.stem.y : this.top + this.height + 25) - 15 / 2,
        width: 15,
        height: 15,
        strokeWidth: 1,
        stroke: '#B2CCFF',
        fill: 'rgba(100,100,100,0)',
        visible: false,
      });
      this.anchor.hasControls = false;
      this.anchor.hasBorders = false;
      this.anchor.excludeFromExport = true;

      this.x1 = 0;
      this.x2 = 0;

      this.stem = new fabric.Polygon(
        [
          {
            x: 0,
            y: 0,
          },
          {
            x: 0,
            y: 0,
          },
          {
            x: 25,
            y: 0,
          },
        ],
        {
          objectCaching: false,
          fill: options.backgroundColor || 'black',
        },
      );
      this.stem.hasControls = false;
      this.stem.hasBorders = false;
      this.stem.selectable = false;
      this.stem.excludeFromExport = true;

      // Events
      this.anchor.on('moving', () => {
        this.redrawStem();
      });

      this.on('moving', () => {
        this.setCoords();
        this.anchor.left += this.aCoords.tl.x - this.x1;
        this.anchor.top += this.aCoords.tl.y - this.y1;
        this.anchor.setCoords();
        this.redrawStem();
      });

      this.on('scaling', () => {
        this.setCoords();
        this.redrawStem();
      });

      this.on('changed', () => {
        this.setCoords();
        this.redrawStem();
      });

      this.on('deselected', () => {
        this.anchor.visible = false;
      });

      this.on('selected', () => {
        this.anchor.visible = true;
      });

      this.on('editing:entered', () => {
        this.anchor.visible = false;
      });

      this.on('removed', () => {
        canvas.remove(this.anchor, this.stem);
      });
    },

    toObject() {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        stem: this.stem.points[1],
      });
    },

    redrawStem() {
      // ─                              │
      //  └ ─             ┌────┐                   ┌────┐              ─ ─
      //     └ ─          │ TL │        │          │ TR │         ┌ ─ ┘
      //        └ ─       └────┘        xm         └────┘      ┌ ─
      //           └ ┬──────────────────●────────────────────┐─
      //             │(x1, y1)                               │
      //     ┌────┐  │                  │                    │      ┌────┐
      //     │ LT │  │                                       │      │ RT │
      //     └────┘  │                  │                    │      └────┘
      //             │                                       │
      // ─ ─ ─ ─ ─ym ● ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ── ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      //             │                                       │
      //     ┌────┐  │                  │                    │      ┌────┐
      //     │ LB │  │                                       │      │ RB │
      //     └────┘  │                  │                    │      └────┘
      //             │                               (x2, y2)│
      //           ─ ┴──────────────────┼────────────────────┴ ┐
      //      ┌ ─ ┘         ╲       ╱                            ─ ┐
      //   ┌ ─      ┌────┐   ╲     ╱    │           ┌────┐          ─ ┐
      //  ─         │ BL │    ╲   ╱                 │ BR │             ─ ─
      //            └────┘     ╲ ╱      │           └────┘
      //                        ●
      //                     (ax, ay)   │

      const h = parseInt(this.height * this.scaleY, 10);
      const w = parseInt(this.width * this.scaleX, 10);
      const x1 = (this.x1 = this.aCoords.tl.x);
      const y1 = (this.y1 = this.aCoords.tl.y);

      const x2 = this.aCoords.br.x;
      const y2 = this.aCoords.br.y;
      const xm = x1 + w / 2;
      const ym = y1 + h / 2;

      const m1 = (y2 - y1) / (x2 - x1);
      const b1 = y1 - m1 * x1;
      const m2 = -m1;
      const b2 = y1 - m2 * x2;

      const ax = this.anchor.left + this.anchor.width / 2;
      const ay = this.anchor.top + this.anchor.height / 2;

      let d;
      if (ax < xm && ay < ym && ay < m1 * ax + b1) {
        // TL
        d = { x: x1, y: y1, xo: w / 6, yo: 0 };
      } else if (ax < xm && ay < ym && ay > m1 * ax + b1) {
        // LT
        d = { x: x1, y: y1, xo: 0, yo: h / 6 };
      } else if (ax > xm && ay < ym && ay < m2 * ax + b2) {
        // TR
        d = { x: x2, y: y1, xo: -w / 6, yo: 0 };
      } else if (ax > xm && ay < ym && ay > m2 * ax + b2) {
        // RT
        d = { x: x2, y: y1, xo: 0, yo: h / 6 };
      } else if (ax > xm && ay > ym && ay < m1 * ax + b1) {
        // RB
        d = { x: x2, y: y2, xo: 0, yo: -h / 6 };
      } else if (ax > xm && ay > ym && ay > m1 * ax + b1) {
        // BR
        d = { x: x2, y: y2, xo: -w / 6, yo: 0 };
      } else if (ax < xm && ay > ym && ay > m2 * ax + b2) {
        // BL
        d = { x: x1, y: y2, xo: w / 6, yo: 0 };
      } else if (ax < xm && ay > ym && ay < m2 * ax + b2) {
        // BL
        d = { x: x1, y: y2, xo: 0, yo: -h / 6 };
      } else return;

      // Point on the anchor point
      this.stem.points[1].x = ax;
      this.stem.points[1].y = ay;

      // Point 1/6 from corner
      this.stem.points[0].x = d.x + d.xo;
      this.stem.points[0].y = d.y + d.yo;

      // Point 1/3 from corner
      this.stem.points[2].x = d.x + 2 * d.xo;
      this.stem.points[2].y = d.y + 2 * d.yo;
      this.stem.setCoords();
    },

    _render(ctx) {
      if (!canvas.contains(this.stem)) {
        canvas.add(this.anchor, this.stem);
      }
      this.callSuper('_render', ctx);

      this.redrawStem();
    },
  });

  fabric.TextBubble.fromObject = function fromObject(object, callback, forceAsync) {
    return fabric.Object._fromObject('TextBubble', object, callback, forceAsync);
  };
};
