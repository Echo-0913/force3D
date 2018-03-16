(function () {
    var force_3D = {
        version: "0.0.1"
    };
    force_3D.force = function () {
        var force = {}, timer, center = {}, size = [1, 1, 1], drag, alpha, friction = .9, linkDistance = 20, linkStrength = 1, charge = -30, chargeDistance2 = Infinity, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges, distanceMin2 = 1, distanceMax2 = Infinity;

        force.eventList = {};

        function x$1(d) {
            return d.x;
        }

        function y$1(d) {
            return d.y;
        }

        function z$1(d) {
            return d.z;
        }

        function repulse(node) {
            return function (oct, x1, y1, z1, x2, y2, z2) {
                if (oct.point !== node) {

                    var dx = oct.cx - node.x;
                    var dy = oct.cy - node.y;
                    var dz = oct.cz - node.z;

                    var dw = x2 - x1;

                    var dn = dx * dx + dy * dy + dz * dz;

                    if (dw * dw / theta2 < dn) {
                        if (dn < chargeDistance2) {
                            var k = oct.charge / dn;
                            node.px -= dx * k;
                            node.py -= dy * k;
                            node.pz -= dz * k;
                        }
                        return true;
                    }
                    if (oct.point && dn && dn < chargeDistance2) {
                        var k = oct.pointCharge / dn;
                        node.px -= dx * k;
                        node.py -= dy * k;
                        node.pz -= dz * k;
                    }
                }
                return !oct.charge;
            };
        }

        function d3_layout_forceAccumulate(oct, alpha, charges) {
            var cx = 0, cy = 0, cz = 0;
            oct.charge = 0;
            if (!oct.leaf) {
                var nodes = oct.nodes, n = nodes.length, i = -1, c;
                while (++i < n) {
                    c = nodes[i];
                    if (c == null) continue;
                    d3_layout_forceAccumulate(c, alpha, charges);
                    oct.charge += c.charge;
                    cx += c.charge * c.cx;
                    cy += c.charge * c.cy;
                    cz += c.charge * c.cz;
                }
            }
            if (oct.point) {
                if (!oct.leaf) {
                    oct.point.x += Math.random() - .5;
                    oct.point.y += Math.random() - .5;
                    oct.point.z += Math.random() - .5;
                }
                var k = alpha * charges[oct.point.index];
                oct.charge += oct.pointCharge = k;
                cx += k * oct.point.x;
                cy += k * oct.point.y;
                cz += k * oct.point.z;
            }
            oct.cx = cx / oct.charge;
            oct.cy = cy / oct.charge;
            oct.cz = cz / oct.charge;
        }


        function accumulate(oct) {
            var strength = 0, q, c, weight = 0, x, y, i;

            // For internal nodes, accumulate forces from child quadrants.
            if (oct.length) {
                for (z = x = y = i = 0; i < 8; ++i) {
                    if ((q = oct[i]) && (c = Math.abs(q.value))) {
                        strength += q.value;
                        weight += c;
                        x += c * q.x;
                        y += c * q.y;
                        z += c * q.z;
                    }
                }
                oct.x = x / weight;
                oct.y = y / weight;
                oct.z = z / weight;
            }

            // For leaf nodes, accumulate forces from coincident quadrants.
            else {
                q = oct;
                q.x = q.data.x;
                q.y = q.data.y;
                q.z = q.data.z;
                do strength += strengths[q.data.index];
                while (q = q.next);
            }

            oct.value = strength;
        }


        function apply(oct, x1, y1, z1, x2, y2, z2) {
            if (!oct.value) return true;

            var x = oct.x - node.x,
                y = oct.y - node.y,
                z = oct.z - node.z,
                w = x2 - x1,
                l = x * x + y * y + z * z;

            // Apply the Barnes-Hut approximation if possible.
            // Limit forces for very close nodes; randomize direction if coincident.
            if (w * w / theta2 < l) {
                if (l < distanceMax2) {
                    if (x === 0) x = jiggle(), l += x * x;
                    if (y === 0) y = jiggle(), l += y * y;
                    if (z === 0) z = jiggle(), l += z * z;
                    if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
                    node.x += x * charge * alpha / l;
                    node.y += y * charge * alpha / l;
                    node.z += z * charge * alpha / l;
                }
                return true;
            }

            // Otherwise, process points directly.
            else if (oct.length || l >= distanceMax2) return;

            // Limit forces for very close nodes; randomize direction if coincident.
            if (oct.data !== node || oct.next) {
                if (x === 0) x = jiggle(), l += x * x;
                if (y === 0) y = jiggle(), l += y * y;
                if (z === 0) z = jiggle(), l += z * z;
                if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
            }

            do if (oct.data !== node) {
                w = strengths[oct.data.index] * alpha / l;
                node.x += x * w;
                node.y += y * w;
                node.z += z * w;
            } while (oct = oct.next);
        }


        force.nodes = function (x) {
            if (!arguments.length) return nodes;
            nodes = x;
            return force;
        };
        force.links = function (x) {
            if (!arguments.length) return links;
            links = x;
            return force;
        };
        force.size = function (x) {
            if (!arguments.length) return size;
            size = x;
            return force;
        };
        force.gravity = function (x) {
            if (!arguments.length) return gravity;
            gravity = +x;
            return force;
        };
        force.theta = function (x) {
            if (!arguments.length) return Math.sqrt(theta2);
            theta2 = x * x;
            return force;
        };
        force.resume = function () {
            return force.alpha(.1);
        };
        force.stop = function () {
            return force.alpha(0);
        };
        force.alpha = function (x) {
            if (!arguments.length) return alpha;
            x = +x;
            if (alpha) {
                if (x > 0) {
                    alpha = x;
                } else {
                    clearInterval(timer)
                    timer.c = null, timer.t = NaN, timer = null;
                    if (force.end instanceof Function) {
                        force.eventList.end();
                    }
                    alpha = 0;
                }
            } else if (x > 0) {
                if (force.eventList.start instanceof Function) {
                    force.eventList.start();
                }
                alpha = x;
                timer = setInterval(force.tick, 0);
            }
            return force;
        };
        force.start = function () {
            var i, n = nodes.length, m = links.length, w = size[0], h = size[1], z = size[2], neighbors, o;
            // 初始化weight
            for (i = 0; i < n; ++i) {
                (o = nodes[i]).index = i;
                o.weight = 0;
            }
            // 计算节点weight
            for (i = 0; i < m; ++i) {
                o = links[i];
                if (typeof o.source == "number") o.source = nodes[o.source]; else nodes.forEach((d, i) => { if (d.id == o.source) o.source = nodes[i] });
                if (typeof o.target == "number") o.target = nodes[o.target]; else nodes.forEach((d, i) => { if (d.id == o.target) o.target = nodes[i] });
                ++o.source.weight;
                ++o.target.weight;
            }
            // 初始化坐标
            for (i = 0; i < n; ++i) {
                o = nodes[i];
                if (isNaN(o.x)) o.x = position("x", w, center.x);
                if (isNaN(o.y)) o.y = position("y", h, center.y);
                if (isNaN(o.z)) o.z = position("z", z, center.z);
                if (isNaN(o.px)) o.px = o.x;
                if (isNaN(o.py)) o.py = o.y;
                if (isNaN(o.pz)) o.pz = o.z;
            }
            distances = [];
            if (typeof linkDistance === "function")
                for (i = 0; i < m; ++i)
                    distances[i] = +linkDistance.call(this, links[i], i);
            else
                for (i = 0; i < m; ++i)
                    distances[i] = linkDistance;

            strengths = [];
            if (typeof linkStrength === "function")
                for (i = 0; i < m; ++i)
                    strengths[i] = +linkStrength.call(this, links[i], i);
            else
                for (i = 0; i < m; ++i)
                    strengths[i] = linkStrength;


            charges = [];
            if (typeof charge === "function")
                for (i = 0; i < n; ++i)
                    charges[i] = +charge.call(this, nodes[i], i);
            else
                for (i = 0; i < n; ++i)
                    charges[i] = charge;


            function position(dimension, size, center) {
                if (!neighbors) {
                    neighbors = new Array(n);
                    for (j = 0; j < n; ++j) {
                        neighbors[j] = [];
                    }
                    for (j = 0; j < m; ++j) {
                        var o = links[j];
                        neighbors[o.source.index].push(o.target);
                        neighbors[o.target.index].push(o.source);
                    }
                }
                var candidates = neighbors[i], j = -1, l = candidates.length, x;
                if (typeof center != "undefined")
                    return (Math.random() * size) - size / 2 + center;
                else
                    return Math.random() * size;
            }
            return force.resume();
        }
        force.tick = function () {
            // 稳定系数的降低
            if ((alpha *= .99) < .005) {
                clearInterval(timer)
                if (force.eventList.end instanceof Function) {
                    force.eventList.end();
                }
                alpha = 0;
                return true;
            }
            var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y, z;
            // 节点根据引力靠近
            for (i = 0; i < m; ++i) {
                o = links[i];
                s = o.source;
                t = o.target;
                x = t.x - s.x;
                y = t.y - s.y;
                z = t.z - s.z;
                if (l = x * x + y * y + z * z) {
                    l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
                    x *= l;
                    y *= l;
                    z *= l;

                    t.x -= x * (k = s.weight + t.weight ? s.weight / (s.weight + t.weight) : .5);
                    t.y -= y * k;
                    t.z -= z * k;

                    s.x += x * (k = 1 - k);
                    s.y += y * k;
                    s.z += z * k;
                }
            }
            //节点根据整体引力居中
            if (k = alpha * gravity) {
                if (Object.keys(center).length) {
                    x = center.x;
                    y = center.y;
                    z = center.z;
                }
                else {
                    x = size[0] / 2;
                    y = size[1] / 2;
                    z = size[2] / 2;
                }
                i = -1;

                if (k) while (++i < n) {
                    o = nodes[i];
                    o.x += (x - o.x) * k;
                    o.y += (y - o.y) * k;
                    o.z += (z - o.z) * k;
                }
            }

            //根据电荷斥力排远 V3
            if (charge) {
                d3_layout_forceAccumulate(q = octree(nodes), alpha, charges);
                i = -1;
                while (++i < n) {
                    if (!(o = nodes[i]).fixed) {
                        q.visit(repulse(o));
                    }
                }
            }

            //根据摩擦系数调整映射位置变换速度
            i = -1;
            while (++i < n) {
                o = nodes[i];
                if (o.fixed) {
                    o.x = o.px;
                    o.y = o.py;
                    o.z = o.pz;
                } else {
                    o.x -= (o.px - (o.px = o.x)) * friction;
                    o.y -= (o.py - (o.py = o.y)) * friction;
                    o.z -= (o.pz - (o.pz = o.z)) * friction;
                }
            }
            if (force.eventList.tick instanceof Function) {
                force.eventList.tick();
            }
        }
        force.on = function (type, listener) {
            if (typeof force.eventList[type] == "undefined") {
                force.eventList[type] = listener.bind(this);
            }
            return force;
        };
        force.center = function (x, y, z) {
            center = { x: x, y: y, z: z };
            let sumX = 0, sumY = 0, sumZ = 0, averageX = 0, averageY = 0, averageZ = 0, deltaX = 0, deltaY = 0, deltaZ = 0;
            for (let i = 0; i < nodes.length; i++) {
                sumX += nodes[i].x;
                sumY += nodes[i].y;
                sumZ += nodes[i].z;
            }
            averageX = sumX / nodes.length;
            averageY = sumY / nodes.length;
            averageZ = sumZ / nodes.length;
            if (!arguments.length) {
                return { averageX, averageY, averageZ }
            } else {
                deltaX = x - averageX;
                deltaY = y - averageY;
                deltaZ = z - averageZ;
                for (let i = 0; i < nodes.length; i++) {
                    nodes[i].x += deltaX;
                    nodes[i].y += deltaY;
                    nodes[i].z += deltaZ;
                }
                return force
            }
        };
        // force.drag = function () {
        //     if (!drag) drag = d3.behavior.drag().origin((d)=>d).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
        //     if (!arguments.length) return drag;
        //     this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
        // };
        // function dragmove(d) {
        //     d.px = d3.event.x, d.py = d3.event.y;
        //     force.resume();
        // }
        // function d3_layout_forceDragstart(d) {
        //     d.fixed |= 2;
        // }
        // function d3_layout_forceDragend(d) {
        //     d.fixed &= ~6;
        // }
        // function d3_layout_forceMouseover(d) {
        //     d.fixed |= 4;
        //     d.px = d.x, d.py = d.y;
        // }
        // function d3_layout_forceMouseout(d) {
        //     d.fixed &= ~4;
        // }
        return force;
    }
    this.force_3D = force_3D;
})();