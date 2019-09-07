/*
 *
 */
window.addEventListener('load', () => {
  const ctx = Canvas(300, 300);
  ctx.clear('black');


  const points = [...Array(8)].map(_ => ({ x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 }));
  const qtree = QuadTree(points, [0, 0, ctx.canvas.width, ctx.canvas.height], 0x6);
  console.log(JSON.stringify(qtree, null, 2));


  // Draws quadtree.
  ctx.lineWidth = 1;
  (function draw_qtree(qtree) {
    if (qtree) {
      const rect = [qtree.rect[0], qtree.rect[1], qtree.rect[2] - qtree.rect[0], qtree.rect[3] - qtree.rect[1]];

      ctx.fillStyle = `rgba(${~~(Math.random() * 256)}, ${~~(Math.random() * 256)}, ${~~(Math.random() * 256)}, 0.5)`;
      ctx.fillRect(...rect);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.strokeRect(...rect);

      for (let brunch of qtree.brunches) draw_qtree(brunch);
    }
  })(qtree);


  // Draws points.
  const radius = 2;
  ctx.fillStyle = 'white';
  for (let point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }


  // Tests is point in rect or not.
  function is_point_in_rect(point, rect) {
    return rect[0] <= point.x && point.x <= rect[2] && rect[1] <= point.y && point.y <= rect[3];
  }


  /**
   * Recursively generates quadtree.
   * @param {Array} points - "[ { x, y }, ... ]".
   * @param {Array} rect - "[ (0)Left, (1)Top, (2)Right, (3)Bottom ]".
   * @param {Number} depth - Recursive depth.
   * @returns {Object} Pointer to the 'points' array, or array of branches (1 to 4).
   */
  function QuadTree(points, rect, depth = 0x2) {
    if (points.length === 0 || --depth < 0) return null;

    const rect_w = rect[2] - rect[0];
    const rect_h = rect[3] - rect[1];
    const half_x = rect[0] + rect_w / 2;
    const half_y = rect[1] + rect_h / 2;

    //               Left     Top      Right    Bottom
    const rect_tl = [rect[0], rect[1], half_x , half_y ]; // top left
    const rect_tr = [half_x , rect[1], rect[2], half_y ]; // top right
    const rect_bl = [rect[0], half_y , half_x , rect[3]]; // bottom left
    const rect_br = [half_x , half_y , rect[2], rect[3]]; // bottom right

    const points_tl = [];
    const points_tr = [];
    const points_bl = [];
    const points_br = [];
    for (let point of points) {
      if (is_point_in_rect(point, rect_tl)) points_tl.push(point);
      if (is_point_in_rect(point, rect_tr)) points_tr.push(point);
      if (is_point_in_rect(point, rect_bl)) points_bl.push(point);
      if (is_point_in_rect(point, rect_br)) points_br.push(point);
    }

    return {
      rect,
      brunches: [
        QuadTree(points_tl, rect_tl, depth),
        QuadTree(points_tr, rect_tr, depth),
        QuadTree(points_bl, rect_bl, depth),
        QuadTree(points_br, rect_br, depth),
      ],
    }
  }

});



