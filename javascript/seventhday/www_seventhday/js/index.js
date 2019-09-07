/*
 *
 */
window.addEventListener('load', () => {
  const ctx = Canvas(300, 300);
  ctx.clear('black');


  const points = [...Array(8)].map(_ => ({ x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 }));
  const qtree = QuadTree(points, [0, ctx.canvas.width, 0, ctx.canvas.height], 0x4);
  console.log(JSON.stringify(qtree, null, 2));


  // Draws quadtree.
  ctx.lineWidth = 1;
  (function draw_qtree(qtree) {
    if (qtree) {
      const rect = [qtree.rect[0], qtree.rect[2], qtree.rect[1] - qtree.rect[0], qtree.rect[3] - qtree.rect[2]];

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
    return rect[0] <= point.x && point.x <= rect[1]
        && rect[2] <= point.y && point.y <= rect[3];
  }

  /**
   * Recursively generates quadtree.
   * @param {Array} points - "[ { x, y }, ... ]".
   * @param {Array} rect - "[ (0)Left, (1)Right, (2)Top, (3)Bottom ]".
   * @param {Number} depth - Recursive depth.
   * @returns {Object} Containts position rect and array of branches (1 to 4) wich can contain 'null' (end of tree).
   */
  function QuadTree(points, rect, depth = 0x2) {
    if (points.length === 0 || --depth < 0) return null;

    const rect_w = rect[1] - rect[0];
    const rect_h = rect[3] - rect[2];
    const half__x = rect[0] + rect_w / 2;
    const half__y = rect[2] + rect_h / 2;

    //               Left     Right    Top      Bottom
    const rect_LT = [rect[0], half__x, rect[2], half__y]; // left top
    const rect_RT = [half__x, rect[1], rect[2], half__y]; // right top
    const rect_LB = [rect[0], half__x, half__y, rect[3]]; // left bottom
    const rect_RB = [half__x, rect[1], half__y, rect[3]]; // right bottom


    const points_LT = [];
    const points_RT = [];
    const points_LB = [];
    const points_RB = [];
    for (let point of points) {
      if (is_point_in_rect(point, rect_LT)) points_LT.push(point);
      if (is_point_in_rect(point, rect_RT)) points_RT.push(point);
      if (is_point_in_rect(point, rect_LB)) points_LB.push(point);
      if (is_point_in_rect(point, rect_RB)) points_RB.push(point);
    }

    return {
      rect,
      brunches: [
        QuadTree(points_LT, rect_LT, depth),
        QuadTree(points_RT, rect_RT, depth),
        QuadTree(points_LB, rect_LB, depth),
        QuadTree(points_RB, rect_RB, depth),
      ],
    }
  }


  // Tests is point in volume or not.
  function is_point_in_volume(point, volume) {
    return volume[0] <= point.x && point.x <= volume[1]
        && volume[2] <= point.y && point.y <= volume[3]
        && volume[4] <= point.z && point.z <= volume[5];
  }

  /**
   * Recursively generates octtree.
   * @param {Array} points - "[ { x, y, z }, ... ]".
   * @param {Array} volume - "[ (0)Left, (1)Right, (2)Top, (3)Bottom, (4)Near, (5)Far ]".
   * @param {Number} depth - Recursive depth.
   * @returns {Object} Containts position rect and array of branches (1 to 4) wich can contain 'null' (end of tree).
   */
  function OctTree(points, volume, depth = 0x2) {
    if (points.length === 0 || --depth < 0) return null;

    const volume_w = volume[1] - volume[0];
    const volume_h = volume[3] - volume[2];
    const volume_d = volume[5] - volume[4];
    const half____x = volume[0] + volume_w / 2;
    const half____y = volume[2] + volume_h / 2;
    const half____z = volume[4] + volume_d / 2;

    //                  Left       Right      Top        Bottom     Near       Far
    const volume_LTN = [volume[0], half____x, volume[2], half____y, volume[4], half____z]; // left top near
    const volume_RTN = [half____x, volume[1], volume[2], half____y, volume[4], half____z]; // right top near
    const volume_LBN = [volume[0], half____x, half____y, volume[3], volume[4], half____z]; // left bottom near
    const volume_RBN = [half____x, volume[1], half____y, volume[3], volume[4], half____z]; // right bottom near
    const volume_LTF = [volume[0], half____x, volume[2], half____y, half____z, volume[5]]; // left top far
    const volume_RTF = [half____x, volume[1], volume[2], half____y, half____z, volume[5]]; // right top far
    const volume_LBF = [volume[0], half____x, half____y, volume[3], half____z, volume[5]]; // left bottom far
    const volume_RBF = [half____x, volume[1], half____y, volume[3], half____z, volume[5]]; // right bottom far

    const points_LTN = [];
    const points_RTN = [];
    const points_LBN = [];
    const points_RBN = [];
    const points_LTF = [];
    const points_RTF = [];
    const points_LBF = [];
    const points_RBF = [];

    for (let point of points) {
      if (is_point_in_volume(point, volume_LTN)) points_LTN.push(point);
      if (is_point_in_volume(point, volume_RTN)) points_RTN.push(point);
      if (is_point_in_volume(point, volume_LBN)) points_LBN.push(point);
      if (is_point_in_volume(point, volume_RBN)) points_RBN.push(point);
      if (is_point_in_volume(point, volume_LTF)) points_LTF.push(point);
      if (is_point_in_volume(point, volume_RTF)) points_RTF.push(point);
      if (is_point_in_volume(point, volume_LBF)) points_LBF.push(point);
      if (is_point_in_volume(point, volume_RBF)) points_RBF.push(point);
    }

    return {
      rect,
      brunches: [
        OctTree(points_LTN, volume_LTN, depth),
        OctTree(points_RTN, volume_RTN, depth),
        OctTree(points_LBN, volume_LBN, depth),
        OctTree(points_RBN, volume_RBN, depth),
        OctTree(points_LTF, volume_LTF, depth),
        OctTree(points_RTF, volume_RTF, depth),
        OctTree(points_LBF, volume_LBF, depth),
        OctTree(points_RBF, volume_RBF, depth),
      ],
    }
  }


});



