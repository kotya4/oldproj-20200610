// Tileset viewer.
class TilesetViewer {
  constructor (image, scaler=1, tilesize=[16,16], row_num=8, parent=document.body) {
		// Creates canvas.
		const ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.height = Math.ceil(image.height * scaler);
		ctx.canvas.width = Math.ceil(image.width * scaler);
		ctx.imageSmoothingEnabled = false;
		// Creates container.
	  const container = document.createElement('div');
	  container.className = 'tilset-viewer-container';
	  container.style.height = parent.getBoundingClientRect().height;
	  container.style.width = ctx.canvas.width + 20;
	  // Information.
	  const information = document.createElement('div');
	  information.className = 'tilset-viewer-information';
	  information.innerText = `[scaler:${scaler}, tilesize:${tilesize}]`;
	  // Applies layout.
		container.appendChild(ctx.canvas);
		parent.appendChild(information);
		parent.appendChild(container);
		// Defines members.
		this.ctx = ctx;
		this.image = image;
		this.scaler = scaler;
		this.row_num = row_num;
		this.tilesize = tilesize.map(e => e * scaler);
		this.information = information;
		// Draws.
		this.redraw(0, 0);
		// Sets up onmousemove event listener.
		this.mousemove = e => {
			const rect = this.ctx.canvas.getBoundingClientRect();
			const x = e.clientX - rect.x, y = e.clientY - rect.y;
			this.redraw(x, y);
		};
		ctx.canvas.addEventListener('mousemove', this.mousemove);
  }

  redraw(px, py) {
		// Redraws image.
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		const sx = 0, sy = 0, sw = this.image.width, sh = this.image.height;
		const dx = 0, dy = 0, dw = this.ctx.canvas.width, dh = this.ctx.canvas.height;
		this.ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
		// Draws pointer.
		const x = (px / this.tilesize[0] | 0);
		const y = (py / this.tilesize[1] | 0);
		const pnx = x * this.tilesize[0];
		const pny = y * this.tilesize[1];
		this.ctx.strokeStyle = 'yellow';
		this.ctx.strokeRect(pnx, pny, ...this.tilesize);
		// Updates information.
		this.information.innerText =
			`tpos:${pnx/this.scaler},${pny/this.scaler} ` +
			`pos:${px/this.scaler|0},${py/this.scaler|0} ` +
			`xy:${x},${y} ` +
			`i:${x + y * this.row_num} ` +
			``;
  }
}
