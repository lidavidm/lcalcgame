'use strict';

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Node = function () {
    function Node(x, y) {
        _classCallCheck(this, Node);

        this._pos = { x: x, y: y };
        this.children = [];
        this.parent = null;
        this._stage = null;
        this._ctx = null;
        this.ignoreEvents = false;
    }

    _createClass(Node, [{
        key: 'addChild',
        value: function addChild(child) {
            this.children.push(child);
            if (child) {
                child.parent = this;
                child.ctx = this.ctx;
            }
        }
    }, {
        key: 'addChildAt',
        value: function addChildAt(idx, child) {
            if (idx < 0 || idx >= this.children.count) {
                console.error('@ Node.addChildAt: Index out of range.');
                return;
            }
            this.children.splice(idx, 0, child);
            child.parent = this;
            child.ctx = this.ctx;
        }
    }, {
        key: 'removeChild',
        value: function removeChild(node) {
            var i = this.children.indexOf(node);
            if (i > -1) {
                this.children[i].ctx = null;
                this.children[i].stage = null;
                this.children.splice(i, 1);
            }
        }
    }, {
        key: 'addAll',
        value: function addAll(children) {
            var _this = this;

            children.forEach(function (child) {
                return _this.addChild(child);
            });
        }
    }, {
        key: 'removeAll',
        value: function removeAll(children) {
            var _this2 = this;

            children.forEach(function (child) {
                return _this2.removeChild(child);
            });
        }
    }, {
        key: 'posWithOffset',
        value: function posWithOffset(offset) {
            if (typeof offset === 'undefined') return this.pos;else return shiftPos(this.pos, offset);
        }
    }, {
        key: 'update',
        value: function update() {
            this.children.forEach(function (c) {
                return c.update();
            });
        }
    }, {
        key: 'draw',
        value: function draw(offset) {
            var pos = this.posWithOffset(offset);
            this.drawInternal(pos);
            this.children.forEach(function (child) {
                return child.draw(pos);
            });
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos) {}

        // Events

    }, {
        key: 'hits',
        value: function hits(pos) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            return null;
        } // Whether the given position lies 'inside' this node. Returns the node that it hits (could be child).

    }, {
        key: 'hitsChild',
        value: function hitsChild(pos) {
            return null;
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {}
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {}
    }, {
        key: 'onmouseclick',
        value: function onmouseclick(pos) {}
    }, {
        key: 'onmousehover',
        value: function onmousehover(pos) {}
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {}
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {}
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {}

        // Drag 'n' drop

    }, {
        key: 'ondropenter',
        value: function ondropenter(node, pos) {}
    }, {
        key: 'ondropped',
        value: function ondropped(node, pos) {}
    }, {
        key: 'ondropexit',
        value: function ondropexit(node, pos) {}

        // Name of class

    }, {
        key: 'value',
        value: function value() {
            return this.constructor.name;
        }

        // Generic clone function.

    }, {
        key: 'clone',
        value: function clone() {
            var _this3 = this;

            var parent = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var ins = constructClassInstance(this.constructor, this.constructorArgs);
            //console.warn('Cloning', this.constructor);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    var v = this[key];
                    if (v && v instanceof Object) {
                        if ('x' in v && 'y' in v) v = { x: v.x, y: v.y };else if ('w' in v && 'h' in v) v = { w: v.w, h: v.h };else if ('color' in v && 'lineWidth' in v) v = { color: v.color, lineWidth: v.lineWidth };
                    }
                    ins[key] = v;
                    //console.warn('Cloning', key, v);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            ins.parent = parent;
            ins.children = ins.children.map(function (child) {
                return child.clone(_this3);
            });
            return ins;
        }

        // 'Equality.'

    }, {
        key: 'equals',
        value: function equals(otherNode) {
            if (!otherNode || !otherNode.constructor) return false;else return this.constructor.name === otherNode.constructor.name;
        }
    }, {
        key: 'stage',
        get: function get() {
            if (!this._stage && this.parent) return this.parent.stage;else return this._stage;
        },
        set: function set(stg) {
            this._stage = stg;
        }
    }, {
        key: 'rootParent',
        get: function get() {
            if (this.parent) return this.parent.rootParent;else if (this._stage) return this;else return null;
        }
    }, {
        key: 'ctx',
        get: function get() {
            return this._ctx;
        },
        set: function set(c) {
            this._ctx = c;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var child = _step2.value;

                    child.ctx = c;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: 'pos',
        get: function get() {
            return { x: this._pos.x, y: this._pos.y };
        },
        set: function set(p) {
            this._pos = p;
        }
    }, {
        key: 'absolutePos',
        get: function get() {
            var pos = this.pos;
            if (this.parent) return addPos(pos, this.parent.absolutePos);else return pos;
        }
    }, {
        key: 'constructorArgs',
        get: function get() {
            return null;
        }
    }]);

    return Node;
}();

var Rect = function (_Node) {
    _inherits(Rect, _Node);

    function Rect(x, y, w, h) {
        _classCallCheck(this, Rect);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(Rect).call(this, x, y));

        _this4._size = { w: w, h: h };
        _this4._anchor = { x: 0, y: 0 };
        _this4._scale = { x: 1, y: 1 };
        _this4._color = "lightgray";
        _this4._highlightColor = 'yellow';
        _this4.stroke = null;
        _this4.shadowOffset = 2;
        return _this4;
    }

    _createClass(Rect, [{
        key: 'upperLeftPos',
        value: function upperLeftPos(pos, boundingSize) {
            return { x: pos.x - this.anchor.x * boundingSize.w, y: pos.y - this.anchor.y * boundingSize.h };
        }
    }, {
        key: 'centerPos',
        value: function centerPos() {
            var sz = this.absoluteSize;
            var pt = this.absolutePos;
            var left = this.upperLeftPos(pt, sz);
            return { x: left.x + sz.w * 0.5, y: left.y + sz.h * 0.5 };
        }
    }, {
        key: 'posOnRectAt',
        value: function posOnRectAt(unitPos) {
            // Given unit pos like 0, 1, returns position relative to Rect's this.pos and this.anchor properties.
            var sz = { w: this._size.w * this._scale.x, h: this._size.h * this._scale.y };
            var pt = this.upperLeftPos(this._pos, sz);
            var offset = { x: unitPos.x * sz.w, y: unitPos.y * sz.h };
            return addPos(pt, offset);
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _this5 = this;

            if (!this.ctx) return;
            this.ctx.save();
            if (this.opacity && this.opacity < 1.0) {
                this.ctx.globalAlpha = this.opacity;
            }
            var boundingSize = this.absoluteSize;
            var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
            if (this._color || this.stroke) this.drawInternal(upperLeftPos, boundingSize);
            this.children.forEach(function (child) {
                child.parent = _this5;
                child.draw();
            });
            if (this._color || this.stroke) this.drawInternalAfterChildren(upperLeftPos, boundingSize);
            this.ctx.restore();
        }
    }, {
        key: 'strokeRect',
        value: function strokeRect(x, y, w, h) {
            if (this.stroke) {
                if (this.stroke.opacity && this.stroke.opacity < 1.0) {
                    this.ctx.save();
                    this.ctx.globalAlpha *= this.stroke.opacity;
                    this.ctx.strokeRect(x, y, w, h);
                    this.ctx.restore();
                } else this.ctx.strokeRect(x, y, w, h);
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            setStrokeStyle(this.ctx, this.stroke);
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(pos.x, pos.y, boundingSize.w, boundingSize.h + this.shadowOffset);
            this.strokeRect(pos.x, pos.y, boundingSize.w, boundingSize.h + this.shadowOffset);
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(pos.x, pos.y, boundingSize.w, boundingSize.h);
            this.strokeRect(pos.x, pos.y, boundingSize.w, boundingSize.h);
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(pos, boundingSize) {}

        // Events

    }, {
        key: 'hits',
        value: function hits(pos, options) {
            if (this.ignoreEvents) return null; // All children are ignored as well.

            if (typeof options !== 'undefined' && options.hasOwnProperty('exclude')) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = options.exclude[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var e = _step3.value;

                        if (e == this) return null;
                    }
                    //console.log('excluding ', this);
                    //return null; // skip excluded nodes
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }

            var hitChild = this.hitsChild(pos, options);
            if (hitChild) return hitChild;

            // Hasn't hit any children, so test if the point lies on this node.
            var boundingSize = this.absoluteSize;
            var upperLeftPos = this.upperLeftPos(this.absolutePos, boundingSize);
            if (pointInRect(pos, rectFromPosAndSize(upperLeftPos, boundingSize))) return this;else return null;
        }
    }, {
        key: 'hitsChild',
        value: function hitsChild(pos, options) {
            // Depth-first hit test.
            if (this.children && this.children.length > 0) {
                var hitChild = null;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = this.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var child = _step4.value;

                        hitChild = child.hits(pos, options);
                        if (hitChild) break;
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                if (hitChild) return hitChild;
            }
            return null;
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(pos) {}
    }, {
        key: 'onmousedrag',
        value: function onmousedrag(pos) {
            //this.pos = pos;
        }
    }, {
        key: 'onmouseenter',
        value: function onmouseenter(pos) {
            this.stroke = { color: this.highlightColor, lineWidth: 2 };
        }
    }, {
        key: 'onmouseleave',
        value: function onmouseleave(pos) {
            this.stroke = null;
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(pos) {}
    }, {
        key: 'highlightColor',
        get: function get() {
            return this._highlightColor;
        },
        set: function set(clr) {
            this._highlightColor = clr;
        }
    }, {
        key: 'absolutePos',
        get: function get() {
            var pos = this.pos;
            if (this.parent) {
                var abs_scale = this.parent.absoluteScale;
                return addPos({ x: pos.x * abs_scale.x,
                    y: pos.y * abs_scale.y }, this.parent.upperLeftPos(this.parent.absolutePos, this.parent.absoluteSize));
            } else return pos;
        }
    }, {
        key: 'absoluteScale',
        get: function get() {
            if (this.parent) return multiplyPos(this.scale, this.parent.absoluteScale);else return this.scale;
        }
    }, {
        key: 'absoluteSize',
        get: function get() {
            var size = this.size;
            var scale = this.absoluteScale;
            return { w: size.w * scale.x, h: size.h * scale.y };
        }
    }, {
        key: 'absoluteBounds',
        get: function get() {
            var pos = this.absolutePos;
            var size = this.absoluteSize;
            return { x: pos.x, y: pos.y, w: size.w, h: size.h };
        }
    }, {
        key: 'color',
        get: function get() {
            return this._color;
        },
        set: function set(clr) {
            this._color = clr;
        }
    }, {
        key: 'size',
        get: function get() {
            return { w: this._size.w, h: this._size.h };
        },
        set: function set(sz) {
            this._size = sz;
        }
    }, {
        key: 'anchor',
        get: function get() {
            return { x: this._anchor.x, y: this._anchor.y };
        },
        set: function set(anch) {
            this._anchor = anch;
        }
    }, {
        key: 'scale',
        get: function get() {
            return { x: this._scale.x, y: this._scale.y };
        },
        set: function set(sc) {
            this._scale = sc;
        }
    }]);

    return Rect;
}(Node);

var RoundedRect = function (_Rect) {
    _inherits(RoundedRect, _Rect);

    function RoundedRect(x, y, w, h) {
        var rad = arguments.length <= 4 || arguments[4] === undefined ? 6 : arguments[4];

        _classCallCheck(this, RoundedRect);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(RoundedRect).call(this, x, y, w, h));

        _this6.radius = rad;
        return _this6;
    }

    _createClass(RoundedRect, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            //console.log('drawing with color: ', this.color, boundingSize);
            this.ctx.fillStyle = 'black';
            setStrokeStyle(this.ctx, this.stroke);
            if (this.shadowOffset !== 0) {
                roundRect(this.ctx, pos.x, pos.y + this.shadowOffset, boundingSize.w, boundingSize.h, this.radius * this.absoluteScale.x, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null); // just fill for now
            }
            this.ctx.fillStyle = this.color;
            roundRect(this.ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, this.radius * this.absoluteScale.x, true, this.stroke ? true : false, this.stroke ? this.stroke.opacity : null); // just fill for now
        }
    }]);

    return RoundedRect;
}(Rect);

var HexaRect = function (_Rect2) {
    _inherits(HexaRect, _Rect2);

    function HexaRect(x, y, w, h) {
        _classCallCheck(this, HexaRect);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(HexaRect).call(this, x, y, w, h));
    }

    _createClass(HexaRect, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            this.ctx.fillStyle = 'black';
            setStrokeStyle(this.ctx, this.stroke);
            if (this.shadowOffset !== 0) {
                hexaRect(this.ctx, pos.x, pos.y + this.shadowOffset, boundingSize.w, boundingSize.h, true, this.stroke ? true : false); // just fill for now
            }
            this.ctx.fillStyle = this.color;
            hexaRect(this.ctx, pos.x, pos.y, boundingSize.w, boundingSize.h, true, this.stroke ? true : false); // just fill for now
        }
    }]);

    return HexaRect;
}(Rect);

var Star = function (_Rect3) {
    _inherits(Star, _Rect3);

    function Star(x, y, rad) {
        var points = arguments.length <= 3 || arguments[3] === undefined ? 5 : arguments[3];

        _classCallCheck(this, Star);

        var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(Star).call(this, x, y, rad * 2, rad * 2));

        _this8.starPoints = points;
        return _this8;
    }

    _createClass(Star, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            drawStar(this.ctx, pos.x + boundingSize.w / 2, pos.y + boundingSize.h / 2 + this.shadowOffset, this.starPoints, boundingSize.w / 2, boundingSize.w / 4, this.stroke, 'black');
            drawStar(this.ctx, pos.x + boundingSize.w / 2, pos.y + boundingSize.h / 2, this.starPoints, boundingSize.w / 2, boundingSize.w / 4, this.stroke, this.color);
        }
    }]);

    return Star;
}(Rect);

var Triangle = function (_Rect4) {
    _inherits(Triangle, _Rect4);

    function Triangle() {
        _classCallCheck(this, Triangle);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Triangle).apply(this, arguments));
    }

    _createClass(Triangle, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            var ctx = this.ctx;
            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + boundingSize.h + this.shadowOffset);
            ctx.lineTo(pos.x + boundingSize.w, pos.y + boundingSize.h + this.shadowOffset);
            ctx.lineTo(pos.x + boundingSize.w / 2.0, pos.y + this.shadowOffset);
            ctx.closePath();
            ctx.fill();
            if (this.stroke) ctx.stroke();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + boundingSize.h);
            ctx.lineTo(pos.x + boundingSize.w, pos.y + boundingSize.h);
            ctx.lineTo(pos.x + boundingSize.w / 2.0, pos.y);
            ctx.closePath();
            ctx.fill();
            if (this.stroke) strokeWithOpacity(ctx, this.stroke.opacity);
        }
    }]);

    return Triangle;
}(Rect);

var Circle = function (_Rect5) {
    _inherits(Circle, _Rect5);

    function Circle(x, y, rad) {
        _classCallCheck(this, Circle);

        var _this10 = _possibleConstructorReturn(this, Object.getPrototypeOf(Circle).call(this, x, y, rad * 2, rad * 2));

        _this10._radius = rad;
        _this10.clipChildren = false;
        return _this10;
    }

    _createClass(Circle, [{
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(pos, boundingSize) {
            if (this.clipChildren) {
                this.ctx.restore();

                var ctx = this.ctx;
                var rad = boundingSize.w / 2.0;
                drawCircle(ctx, pos.x, pos.y, rad, null, { color: 'black', lineWidth: 1 });
            }
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            var ctx = this.ctx;
            var rad = boundingSize.w / 2.0;
            if (this.shadowOffset !== 0) drawCircle(ctx, pos.x, pos.y + this.shadowOffset, rad, 'black', this.stroke);
            drawCircle(ctx, pos.x, pos.y, rad, this.color, this.stroke);
            if (this.clipChildren) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(pos.x + rad, pos.y + rad, rad, 0, 2 * Math.PI);
                ctx.clip();

                if (this.clipBackground) {
                    ctx.drawImage(Resource.getImage(this.clipBackground), pos.x, pos.y);
                }
            }
        }
    }, {
        key: 'size',
        get: function get() {
            return _get(Object.getPrototypeOf(Circle.prototype), 'size', this);
        },
        set: function set(sz) {
            _set(Object.getPrototypeOf(Circle.prototype), 'size', sz, this);
            this._radius = (sz.w + sz.h) / 4.0;
        }
    }, {
        key: 'radius',
        get: function get() {
            return this._radius;
        },
        set: function set(r) {
            this._radius = r;
            this._size = { w: r * 2, h: r * 2 };
        }
    }]);

    return Circle;
}(Rect);

var Bag = function (_Circle) {
    _inherits(Bag, _Circle);

    function Bag(x, y, rad) {
        var includeInner = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

        _classCallCheck(this, Bag);

        var _this11 = _possibleConstructorReturn(this, Object.getPrototypeOf(Bag).call(this, x, y, rad));

        if (includeInner) {
            var outerRad = rad - _this11.topSize(rad).h / 2.0;
            var innerRad = outerRad / 1.3;
            var inner = new Circle(0, 0, innerRad);
            inner.pos = { x: outerRad - innerRad, y: rad / 2.2 + (outerRad - innerRad) };
            inner.clipChildren = true;
            inner.clipBackground = 'bag-background';
            _this11.addChild(inner);
            _this11.inner = inner;
        }

        _this11.shadowOffset = 3;
        return _this11;
    }

    _createClass(Bag, [{
        key: 'addItem',
        value: function addItem(item) {
            this.addChild(item);
            //this.inner.addChild(item);
        }
    }, {
        key: 'removeItem',
        value: function removeItem(item) {
            this.removeChild(item);
            //this.inner.removeChild(item);
        }
    }, {
        key: 'removeAllItems',
        value: function removeAllItems() {
            var _this12 = this;

            var children = this.children.filter(function (child) {
                return !child.clipChildren;
            });
            children.forEach(function (child) {
                return _this12.removeChild(child);
            }); // ha-ha programming tricks ...
        }
    }, {
        key: 'topSize',
        value: function topSize(rad) {
            return { w: Math.round(rad) * 1.5, h: rad / 2.2 };
        }
    }, {
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            var ctx = this.ctx;
            var rad = boundingSize.w / 2.0;
            var topSize = this.topSize(rad);
            rad -= topSize.h / 2.0;
            drawBag(ctx, pos.x, pos.y + this.shadowOffset, topSize.w, topSize.h, rad, 'black', this.stroke);
            drawBag(ctx, pos.x, pos.y, topSize.w, topSize.h, rad, this.color, this.stroke);
        }
    }, {
        key: 'drawInternalAfterChildren',
        value: function drawInternalAfterChildren(pos, boundingSize) {
            var ctx = this.ctx;
            var rad = boundingSize.w / 2.0;
            var topSize = this.topSize(rad);
            rad -= topSize.h / 2.0;
            drawBag(ctx, pos.x, pos.y, topSize.w, topSize.h, rad, null, this.stroke);
        }
    }]);

    return Bag;
}(Circle);

var Pipe = function (_Rect6) {
    _inherits(Pipe, _Rect6);

    function Pipe(x, y, w, h) {
        var topColor = arguments.length <= 4 || arguments[4] === undefined ? 'green' : arguments[4];
        var sideColor = arguments.length <= 5 || arguments[5] === undefined ? 'ForestGreen' : arguments[5];

        _classCallCheck(this, Pipe);

        var _this13 = _possibleConstructorReturn(this, Object.getPrototypeOf(Pipe).call(this, x, y, w, h));

        _this13.topColor = topColor;
        _this13.sideColor = sideColor;
        _this13.cylStroke = { color: 'blue', lineWidth: 1 };
        return _this13;
    }

    _createClass(Pipe, [{
        key: 'drawInternal',
        value: function drawInternal(pos, boundingSize) {
            var ctx = this.ctx;
            var l = boundingSize.h / 4;
            var w = boundingSize.w / 2;
            var yoffset = -20;
            setStrokeStyle(ctx, this.cylStroke);

            // Draw side and bottom.
            ctx.fillStyle = this.sideColor;
            ctx.beginPath();
            ctx.ellipse(pos.x + w, pos.y + boundingSize.h + 10 + yoffset, w, l, 0, 0, Math.PI); // half ellipse
            ctx.lineTo(pos.x - w + w, pos.y + yoffset);
            ctx.lineTo(pos.x + w + w, pos.y + yoffset);
            ctx.closePath();
            ctx.fill();
            if (this.cylStroke) ctx.stroke();

            // Draw top circle.
            ctx.fillStyle = this.topColor;
            ctx.beginPath();
            ctx.ellipse(pos.x + w, pos.y + yoffset, w, l, 0, 0, 2 * Math.PI);
            ctx.fill();
            if (this.cylStroke) ctx.stroke();
        }
    }]);

    return Pipe;
}(Rect);

var ArrowPath = function (_Node2) {
    _inherits(ArrowPath, _Node2);

    function ArrowPath() {
        var points = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var stroke = arguments.length <= 1 || arguments[1] === undefined ? { color: 'black', lineWidth: 1 } : arguments[1];
        var arrowWidth = arguments.length <= 2 || arguments[2] === undefined ? 8 : arguments[2];

        _classCallCheck(this, ArrowPath);

        var _this14 = _possibleConstructorReturn(this, Object.getPrototypeOf(ArrowPath).call(this, 0, 0));

        _this14.stroke = stroke;
        _this14.points = points;
        _this14.arrowWidth = arrowWidth;
        return _this14;
    }

    _createClass(ArrowPath, [{
        key: 'addPoint',
        value: function addPoint(pt) {
            if (!this.points) this.points = [];
            this.points.push({ x: pt.x, y: pt.y });
        }
    }, {
        key: 'pointAtIndex',
        value: function pointAtIndex(i) {
            return { x: this.points[i].x, y: this.points[i].y };
        }
    }, {
        key: 'posAlongPath',


        // Takes a number from 0.0 to 1.0, representing start to end, respectively,
        // and returns the corresponding position along the path if it were treated like a single line.
        value: function posAlongPath(elapsed) {
            if (elapsed < 0) return this.pointAtIndex(0);else if (elapsed > 1) return this.lastPoint;

            var totalLen = this.pathLength;
            var fraction = 0;
            for (var i = 1; i < this.points.length; i++) {
                var len = distBetweenPos(this.points[i - 1], this.points[i]);
                if (elapsed < fraction + len / totalLen) {
                    var seg_elapsed = elapsed - fraction;
                    var vec = fromTo(this.points[i - 1], this.points[i]);
                    var seg_len = lengthOfPos(vec) * seg_elapsed;
                    return addPos(this.points[i - 1], rescalePos(vec, seg_len));
                }
                fraction += len / totalLen;
            }

            return this.lastPoint;
        }
    }, {
        key: 'draw',
        value: function draw(offset) {
            this.drawInternal(this.absolutePos);
        }

        // Draw path.

    }, {
        key: 'drawInternal',
        value: function drawInternal(pos) {
            if (!this.points || this.points.length === 0) return;
            var ctx = this.ctx;
            var abs_scale = this.parent.absoluteScale;
            var lastpt = this.lastPoint; //addPos( pos, this.lastPoint );

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.scale(abs_scale.x, abs_scale.y);

            setStrokeStyle(ctx, this.stroke);
            ctx.fillStyle = null;

            // Draw lines.
            var startpt = this.points[0];
            ctx.beginPath();
            ctx.moveTo(startpt.x, startpt.y);
            this.points.slice(1).forEach(function (pt) {
                var p = pt;
                ctx.lineTo(p.x, p.y);
            });
            if (this.stroke) ctx.stroke();

            // Draw arrowhead.
            var lastseg = reversePos(rescalePos(this.lastSegment, this.arrowWidth)); // Vector pointing from final point to 2nd-to-last point.
            var leftpt = addPos(rotateBy(lastseg, Math.PI / 4.0), lastpt);
            var rightpt = addPos(rotateBy(lastseg, -Math.PI / 4.0), lastpt);
            ctx.fillStyle = this.stroke ? this.stroke.color : null;
            setStrokeStyle(ctx, null);
            ctx.beginPath();
            ctx.moveTo(lastpt.x, lastpt.y);
            ctx.lineTo(leftpt.x, leftpt.y);
            ctx.lineTo(rightpt.x, rightpt.y);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }, {
        key: 'absolutePos',
        get: function get() {
            var pos = this.pos;
            if (this.parent) {
                var abs_scale = this.parent.absoluteScale;
                return addPos({ x: pos.x * abs_scale.x,
                    y: pos.y * abs_scale.y }, this.parent.upperLeftPos(this.parent.absolutePos, this.parent.absoluteSize));
            } else return pos;
        }
    }, {
        key: 'color',
        get: function get() {
            return this.stroke.color;
        },
        set: function set(clr) {
            this.stroke.color = clr;
        }
    }, {
        key: 'pathLength',
        get: function get() {
            var len = 0;
            for (var i = 1; i < this.points.length; i++) {
                len += distBetweenPos(this.points[i - 1], this.points[i]);
            }return len;
        }
    }, {
        key: 'lastPoint',
        get: function get() {
            return this.pointAtIndex(this.points.length - 1);
        }
    }, {
        key: 'lastSegment',
        get: function get() {
            var p1 = this.pointAtIndex(this.points.length - 2);
            var p2 = this.pointAtIndex(this.points.length - 1);
            return fromTo(p1, p2);
        }
    }]);

    return ArrowPath;
}(Node);