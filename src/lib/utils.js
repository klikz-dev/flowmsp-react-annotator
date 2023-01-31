/**
 * Determine the mouse position
 *
 * @param event the canvas event
 * @returns *[] tuple of position x,y
 * @private
 */
export const pointerPosition = (event) => {
  event = event || window.event;
  const target = event.target || event.srcElement;
  const style = target.currentStyle || window.getComputedStyle(target, null);
  const borderLeftWidth = parseInt(style.borderLeftWidth, 10);
  const borderTopWidth = parseInt(style.borderTopWidth, 10);
  const rect = target.getBoundingClientRect();
  const _x = event.clientX - borderLeftWidth - rect.left;
  const _y = event.clientY - borderTopWidth - rect.top;
  const _touchX = event.changedTouches
    ? event.changedTouches[0].clientX - borderLeftWidth - rect.left
    : null;
  const _touchY = event.changedTouches
    ? event.changedTouches[0].clientY - borderTopWidth - rect.top
    : null;
  return [_x || _touchX, _y || _touchY];
};

// function getMouseCoords(canvas, event)
// {
//    var pointer = canvas.getPointer(event.e);
//    var posX = pointer.x;
//    var posY = pointer.y;
//    console.log(posX+", "+posY);    // Log to console
// }

/**
 * Calculate the distance of two x,y points
 *
 * @param point1 an object with x,y attributes representing the start point
 * @param point2 an object with x,y attributes representing the end point
 *
 * @returns {number}
 */
export const linearDistance = (point1, point2) => {
  const xs = point2.x - point1.x;
  const ys = point2.y - point1.y;
  return Math.sqrt(xs * xs + ys * ys);
};
