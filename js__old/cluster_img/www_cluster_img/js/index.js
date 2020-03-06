window.onload = () => {
  //const ctx = document.getElementById('canvas').getContext('2d');
  //ctx.fillStyle = 'red';
  //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  let files_num = 0;
  let files = null;
  document.getElementById('input-file').addEventListener('change', function() {
    files = this.files;
    files_num = this.files.length;
    let i = 0;
    for (file of this.files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => process_img(img, '', ++i);
      }
      reader.readAsDataURL(file);
    }
  }, false);


  function process_img(img, name = 'filename', index = -1) {
    name = files[index - 1].name.substr(0, files[index - 1].name.lastIndexOf('.'));
    console.log('processing ' + name + ' (' + index + ' of ' + files_num + ')');
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = img.width;
    ctx.canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const clusters = clusterize(ctx);
    //document.getElementById('download').onclick = () => {
    const zip = new JSZip();
    const vctx = document.createElement('canvas').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);
    clusters.forEach((e, i) => {
      vctx.canvas.width = 1 + e.x_max - e.x_min;
      vctx.canvas.height = 1 + e.y_max - e.y_min;
      vctx.drawImage(ctx.canvas,
                     e.x_min, e.y_min,
                     vctx.canvas.width, vctx.canvas.height,
                     0, 0,
                     vctx.canvas.width, vctx.canvas.height);
      zip.file(name + '-' + i + '.png', atob(vctx.canvas.toDataURL().substr(22)), { binary: true });
    });
    zip.generateAsync({ type: 'base64' }).then(e => location.href = 'data:application/zip;base64,' + e);
    //}
  }


  function clusterize(ctx) {
    const image_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = image_data.data;
    const mask = [...Array(ctx.canvas.width * ctx.canvas.height)];
    const indexof = (x, y) => x + y * ctx.canvas.width;
    const not_empty = i => data[i + 3] !== 0;
    let cluster_num = 0;

    // fills mask

    function fill_mask(x, y) {
      if (x < 0 || y < 0 || x >= ctx.canvas.width || y >= ctx.canvas.height) return;
      const index = indexof(x, y);
      if (mask[index] == null && not_empty(index << 2)) {
        mask[index] = cluster_num;
        fill_mask(x - 1, y + 0);
        fill_mask(x + 1, y + 0);
        fill_mask(x + 0, y - 1);
        fill_mask(x + 0, y + 1);
        fill_mask(x - 1, y - 1);
        fill_mask(x - 1, y + 1);
        fill_mask(x + 1, y - 1);
        fill_mask(x + 1, y + 1);
      }
    }

    for (let y = 0; y < ctx.canvas.height; ++y) for (let x = 0; x < ctx.canvas.width; ++x) {
      const index = indexof(x, y);
      if (mask[index] == null && not_empty(index << 2)) {
        fill_mask(x, y);
        ++cluster_num;
      }
    }

    // clusterizes

    const clusters = [...Array(cluster_num)].map(e => e = {
      map: [],
      x_max: 0,
      y_max: 0,
      x_min: ctx.canvas.width - 1,
      y_min: ctx.canvas.height - 1,
    });

    for (let y = 0; y < ctx.canvas.height; ++y) for (let x = 0; x < ctx.canvas.width; ++x) {
      const X = ctx.canvas.width - 1 - x;
      const Y = ctx.canvas.height - 1 - y;
      const m_ = mask[indexof(x, y)];
      const mx = mask[indexof(X, y)];
      const my = mask[indexof(x, Y)];
      if (mx != null && X > clusters[mx].x_max) clusters[mx].x_max = X;
      if (my != null && Y > clusters[my].y_max) clusters[my].y_max = Y;
      if (m_ != null) {
        if (x < clusters[m_].x_min) clusters[m_].x_min = x;
        if (y < clusters[m_].y_min) clusters[m_].y_min = y;

        // draw
        //ctx.fillStyle = COLORS[m_ % COLORS.length];
        //ctx.fillRect(x, y, 1, 1);
      }
    }

    for (let c of clusters) {
      c.pos = [c.x_min, c.y_min];
      c.map = [];
      for (let y = c.y_min; y <= c.y_max; ++y) {
        c.map.push([]);
        for (let x = c.x_min; x <= c.x_max; ++x)
          c.map[c.map.length - 1].push(mask[indexof(x, y)] != null);
      }

    }

    return clusters;
  }
}


const COLORS = [
  "#DC143C", "#C71585", "#ADD8E6", "#7FFFD4", "#FFC0CB", "#00FFFF", "#E0FFFF",
  "#FF4500", "#EE82EE", "#8FBC8F", "#008000", "#FF0000", "#9370DB", "#2E8B57",
  "#3CB371", "#00BFFF", "#FF6347", "#800080", "#7B68EE", "#FF00FF", "#BDB76B",
  "#00008B", "#E6E6FA", "#00FF7F", "#00FA9A", "#8B0000", "#808000", "#7CFC00",
  "#556B2F", "#B22222", "#8A2BE2", "#F0E68C", "#008B8B", "#9ACD32", "#66CDAA",
  "#FF00FF", "#4B0082", "#FF7F50", "#00FFFF", "#98FB98", "#006400", "#FF1493",
  "#FFE4B5", "#48D1CC", "#FFFF00", "#FFB6C1", "#D8BFD8", "#B0C4DE", "#008080",
  "#F0FFF0", "#32CD32", "#FFEFD5", "#E9967A", "#4169E1", "#DDA0DD", "#228B22",
  "#FFD700", "#EEE8AA", "#AFEEEE", "#FFFFFF", "#9932CC", "#40E0D0", "#8B008B",
  "#CD5C5C", "#6A5ACD", "#90EE90", "#20B2AA", "#FFFAFA", "#ADFF2F", "#FFA07A",
  "#FFDAB9", "#FAFAD2", "#FFFACD", "#4682B4", "#9400D3", "#00FF00", "#5F9EA0",
  "#00CED1", "#1E90FF", "#FF69B4", "#000080", "#191970", "#DB7093", "#6B8E23",
  "#FF8C00", "#7FFF00", "#0000CD", "#6495ED", "#0000FF", "#B0E0E6", "#87CEFA",
  "#FFFFE0", "#BA55D3", "#87CEEB", "#FA8072", "#F08080", "#F5FFFA", "#FFA500",
  "#483D8B", "#DA70D6"
];
