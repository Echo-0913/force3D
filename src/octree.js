const octree = function(points, x1, y1, z1, x2, y2, z2) {
	function defaultX(d) {
		return d.x;
	}
	function defaultY(d) {
		return d.y;
	}
	function defaultZ(d) {
		return d.z;
	}
	function functor(v) {
		return typeof v === 'function'
			? v
			: function() {
					return v;
				};
	}
	var x = defaultX,
		y = defaultY,
		z = defaultZ,
		compat;
	if ((compat = arguments.length)) {
		x = octreeCompatX;
		y = octreeCompatY;
		z = octreeCompatZ;
		if (compat === 4) {
			z2 = z1;
			y2 = y1;
			x2 = x1;
			z1 = y1 = x1 = 0;
		}
		return octree(points);
	}
	function octree(data) {
		var d,
			fx = functor(x),
			fy = functor(y),
			fz = functor(z),
			xs,
			ys,
			zs,
			i,
			n,
			x1_,
			y1_,
			z1_,
			x2_,
			y2_,
			z2_;
		if (x1 != null) {
			(x1_ = x1), (y1_ = y1), (z1_ = z1), (x2_ = x2), (y2_ = y2), (z2_ = z2);
		} else {
			z2_ = x2_ = y2_ = -(x1_ = y1_ = z1_ = Infinity);
			(xs = []), (ys = []), (zs = []);
			n = data.length;
			if (compat)
				for (i = 0; i < n; ++i) {
					d = data[i];
					if (d.x < x1_) x1_ = d.x;
					if (d.y < y1_) y1_ = d.y;
					if (d.z < z1_) z1_ = d.z;
					if (d.x > x2_) x2_ = d.x;
					if (d.y > y2_) y2_ = d.y;
					if (d.z > z2_) z2_ = d.z;
					xs.push(d.x);
					ys.push(d.y);
					zs.push(d.z);
				}
			else
				for (i = 0; i < n; ++i) {
					var x_ = +fx((d = data[i]), i),
						y_ = +fy(d, i),
						z_ = +fz(d, i);
					if (x_ < x1_) x1_ = x_;
					if (y_ < y1_) y1_ = y_;
					if (z_ < z1_) z1_ = z_;
					if (x_ > x2_) x2_ = x_;
					if (y_ > y2_) y2_ = y_;
					if (z_ > z2_) z2_ = z_;
					xs.push(x_);
					ys.push(y_);
					zs.push(z_);
				}
		}
		var dx = x2_ - x1_,
			dy = y2_ - y1_,
			dz = z2_ - z1_;
		function insert(n, d, x, y, z, x1, y1, z1, x2, y2, z2) {
			if (isNaN(x) || isNaN(y) || isNaN(z)) return;
			if (n.leaf) {
				var nx = n.x,
					ny = n.y,
					nz = n.z;
				if (nx != null) {
					if (Math.abs(nx - x) + Math.abs(ny - y) + Math.abs(nz - z) < 0.01) {
						insertChild(n, d, x, y, z, x1, y1, z1, x2, y2, z2);
					} else {
						var nPoint = n.point;
						n.x = n.y = n.z = n.point = null;
						insertChild(n, nPoint, nx, ny, nz, x1, y1, z1, x2, y2, z2);
						insertChild(n, d, x, y, z, x1, y1, z1, x2, y2, z2);
					}
				} else {
					(n.x = x), (n.y = y), (n.z = z), (n.point = d);
				}
			} else {
				insertChild(n, d, x, y, z, x1, y1, z1, x2, y2, z2);
			}
		}
		function insertChild(n, d, x, y, z, x1, y1, z1, x2, y2, z2) {
			var xm = (x1 + x2) * 0.5;
			var ym = (y1 + y2) * 0.5;
			var zm = (z1 + z2) * 0.5;
			var right = x >= xm;
			var below = y >= ym;
			var long = z >= zm;

			var i = (long << 2) | (below << 1) | right;
			n.leaf = false;
			n = n.nodes[i] || (n.nodes[i] = octreeNode());
			if (right) x1 = xm;
			else x2 = xm;
			if (below) y1 = ym;
			else y2 = ym;
			if (long) z1 = zm;
			else z2 = zm;
			insert(n, d, x, y, z, x1, y1, z1, x2, y2, z2);
		}
		var root = octreeNode();
		root.add = function(d) {
			insert(root, d, +fx(d, ++i), +fy(d, i), +fz(d, i), x1_, y1_, z1_, x2_, y2_, z2_);
		};
		root.visit = function(f) {
			octreeVisit(f, root, x1_, y1_, z1_, x2_, y2_, z2_);
		};
		root.find = function(point) {
			return octreeFind(root, point[0], point[1], point[2], x1_, y1_, z1_, x2_, y2_, z2_);
		};
		i = -1;
		if (x1 == null) {
			while (++i < n) {
				insert(root, data[i], xs[i], ys[i], zs[i], x1_, y1_, z1_, x2_, y2_, z2_);
			}
			--i;
		} else data.forEach(root.add);
		zs = xs = ys = data = d = null;
		return root;
	}
	octree.x = function(_) {
		return arguments.length ? ((x = _), octree) : x;
	};
	octree.y = function(_) {
		return arguments.length ? ((y = _), octree) : y;
	};
	octree.z = function(_) {
		return arguments.length ? ((y = _), octree) : z;
	};
	octree.extent = function(_) {
		if (!arguments.length) return x1 == null ? null : [ [ x1, y1, z1 ], [ x2, y2, z2 ] ];
		if (_ == null) x1 = y1 = z1 = x2 = y2 = z2 = null;
		else (x1 = +_[0][0]), (y1 = +_[0][1]), (x2 = +_[1][0]), (y2 = +_[1][1]), (z1 = +_[0][2]), (z2 = +_[1][2]);
		return octree;
	};
	octree.size = function(_) {
		if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1, z2 - z1 ];
		if (_ == null) x1 = y1 = z1 = x2 = y2 = z2 = null;
		else (x1 = y1 = z1 = 0), (x2 = +_[0]), (y2 = +_[1]), (z2 = +_[2]);
		return octree;
	};
	return octree;
};
function octreeCompatX(d) {
	return d.x;
}
function octreeCompatY(d) {
	return d.y;
}
function octreeCompatZ(d) {
	return d.z;
}
function octreeNode() {
	return {
		leaf: true,
		nodes: [],
		point: null,
		x: null,
		y: null,
		z: null
	};
}
function octreeVisit(f, node, x1, y1, z1, x2, y2, z2) {
	if (!f(node, x1, y1, z1, x2, y2, z2)) {
		var sx = (x1 + x2) * 0.5;
		var sy = (y1 + y2) * 0.5;
		var sz = (z1 + z2) * 0.5;
		var children = node.nodes;
		if (children[0]) octreeVisit(f, children[0], x1, y1, z1, sx, sy, sz);
		if (children[1]) octreeVisit(f, children[1], sx, y1, z1, x2, sy, sz);
		if (children[2]) octreeVisit(f, children[2], x1, sy, z1, sx, y2, sz);
		if (children[3]) octreeVisit(f, children[3], sx, sy, z1, x2, y2, sz);

		if (children[4]) octreeVisit(f, children[4], x1, y1, sz, sx, sy, z2);
		if (children[5]) octreeVisit(f, children[5], sx, y1, sz, x2, sy, z2);
		if (children[6]) octreeVisit(f, children[6], x1, sy, sz, sx, y2, z2);
		if (children[7]) octreeVisit(f, children[7], sx, sy, sz, x2, y2, z2);
	}
}
function octreeFind(root, x, y, z, x0, y0, z0, x3, y3, z3) {
	var minDistance2 = Infinity,
		closestPoint;
	(function find(node, x1, y1, z1, x2, y2, z2) {
		if (x1 > x3 || y1 > y3 || z1 > z3 || x2 < x0 || y2 < y0 || z2 < z0) return;
		if ((point = node.point)) {
			var point,
				dx = x - node.x,
				dy = y - node.y,
				dz = z - node.z,
				distance2 = dx * dx + dy * dy + dz * dz;
			if (distance2 < minDistance2) {
				var distance = Math.sqrt((minDistance2 = distance2));
				(x0 = x - distance), (y0 = y - distance), (z0 = z - distance);
				(x3 = x + distance), (y3 = y + distance), (z3 = z + distance);
				closestPoint = point;
			}
		}
		var children = node.nodes,
			xm = (x1 + x2) * 0.5,
			ym = (y1 + y2) * 0.5,
			zm = (z1 + z2) * 0.5,
			right = x >= xm,
			below = y >= ym,
			long = z >= zm;
		for (var i = (long << 2) | (below << 1) | right, j = i + 8; i < j; ++i) {
			if ((node = children[i & 7]))
				switch (i & 7) {
					case 0:
						find(node, x1, y1, z1, xm, ym, zm);
						break;
					case 1:
						find(node, xm, y1, z1, x2, ym, zm);
						break;
					case 2:
						find(node, x1, ym, z1, xm, y2, zm);
						break;
					case 3:
						find(node, xm, ym, z1, x2, y2, zm);
						break;
					case 4:
						find(node, x1, y1, zm, xm, ym, z2);
						break;
					case 5:
						find(node, xm, y1, zm, x2, ym, z2);
						break;
					case 6:
						find(node, x1, ym, zm, xm, y2, z2);
						break;
					case 7:
						find(node, xm, ym, zm, x2, y2, z2);
						break;
				}
		}
	})(root, x0, y0, z0, x3, y3, z3);
	return closestPoint;
}
export default octree;
