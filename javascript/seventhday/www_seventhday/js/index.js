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
   * @returns {Object} Containts position rect and array of branches (1 to 4) wich can contain 'null' (end of tree).
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
    const half___x = volume[0] + volume_w / 2;
    const half___y = volume[2] + volume_h / 2;
    const half___z = volume[4] + volume_d / 2;

    //                Left     Right    Top      Bottom   Near     Far
    const volume_LTF = [volume[0], half___x, volume[2], half___y, half___z, volume[5]]; // left top far
    const volume_RTF = [half___x, volume[1], volume[2], half___y, half___z, volume[5]]; // right top far
    const volume_LBF = [volume[0], half___x, half___y, volume[3], half___z, volume[5]]; // left bottom far
    const volume_RBF = [half___x, volume[1], half___y, volume[3], half___z, volume[5]]; // right bottom far
    const volume_LTN = [volume[0], half___x, volume[2], half___y, volume[4], half___z]; // left top near
    const volume_RTN = [half___x, volume[1], volume[2], half___y, volume[4], half___z]; // right top near
    const volume_LBN = [volume[0], half___x, half___y, volume[3], volume[4], half___z]; // left bottom near
    const volume_RBN = [half___x, volume[1], half___y, volume[3], volume[4], half___z]; // right bottom near

    const points_LTF = [];
    const points_RTF = [];
    const points_LBF = [];
    const points_RBF = [];
    const points_LTN = [];
    const points_RTN = [];
    const points_LBN = [];
    const points_RBN = [];

    for (let point of points) {
      if (is_point_in_volume(point, volume_LTF)) points_LTF.push(point);
      if (is_point_in_volume(point, volume_RTF)) points_RTF.push(point);
      if (is_point_in_volume(point, volume_LBF)) points_LBF.push(point);
      if (is_point_in_volume(point, volume_RBF)) points_RBF.push(point);
      if (is_point_in_volume(point, volume_LTN)) points_LTN.push(point);
      if (is_point_in_volume(point, volume_RTN)) points_RTN.push(point);
      if (is_point_in_volume(point, volume_LBN)) points_LBN.push(point);
      if (is_point_in_volume(point, volume_RBN)) points_RBN.push(point);
    }

    return {
      rect,
      brunches: [
        OctTree(points_LTF, volume_LTF, depth),
        OctTree(points_RTF, volume_RTF, depth),
        OctTree(points_LBF, volume_LBF, depth),
        OctTree(points_RBF, volume_RBF, depth),
        OctTree(points_LTN, volume_LTN, depth),
        OctTree(points_RTN, volume_RTN, depth),
        OctTree(points_LBN, volume_LBN, depth),
        OctTree(points_RBN, volume_RBN, depth),
      ],
    }
  }


});



