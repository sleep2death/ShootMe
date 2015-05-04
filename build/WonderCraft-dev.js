var PF;
(function (PF) {
    var Point = (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = 0;
            this.y = 0;
            this.x = x;
            this.y = y;
        }
        Point.prototype.setTo = function (x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        };
        return Point;
    })();
    PF.Point = Point;
})(PF || (PF = {}));
var PF;
(function (PF) {
    var LinkedList = (function () {
        function LinkedList() {
            this.length = 0;
            length = 0;
            this.head = this.tail = null;
        }
        LinkedList.prototype.appendNode = function (node) {
            if (this.head == null) {
                this.head = this.tail = node;
            }
            else {
                this.tail.next = node;
                node.prev = this.tail;
                this.tail = node;
            }
            this.length++;
        };
        LinkedList.prototype.insertBeforeNode = function (before_node, new_node) {
            if (before_node == this.head) {
                new_node.next = this.head;
                this.head.prev = new_node;
                new_node.prev = null;
                this.head = new_node;
            }
            else {
                before_node.prev.next = new_node;
                new_node.prev = before_node.prev;
                before_node.prev = new_node;
                new_node.next = before_node;
            }
            ++this.length;
        };
        LinkedList.prototype.removeNode = function (node) {
            if (node == this.head) {
                this.head = node.next;
                if (this.head != null)
                    this.head.prev = null;
            }
            else {
                node.prev.next = node.next;
            }
            if (node == this.tail) {
                this.tail = node.prev;
                if (this.tail != null)
                    this.tail.next = null;
            }
            else {
                node.next.prev = node.prev;
            }
            node.prev = null;
            node.next = null;
            --this.length;
        };
        LinkedList.prototype.fetchHead = function () {
            if (this.length > 0) {
                var node = this.head;
                this.head = node.next;
                if (this.head != null)
                    this.head.prev = null;
                node.prev = null;
                node.next = null;
                --this.length;
                return node;
            }
            return null;
        };
        LinkedList.prototype.fetchRandom = function () {
            if (this.length > 0) {
                var node = this.head;
                var shifts = Math.round((this.length - 1) * Math.random());
                while (shifts > 0) {
                    node = node.next;
                    shifts--;
                }
                this.removeNode(node);
                return node;
            }
            return null;
        };
        LinkedList.prototype.removeAllNodes = function () {
            while (this.length > 0)
                this.removeNode(this.head);
        };
        LinkedList.prototype.contains = function (node) {
            var it = this.head;
            while (it) {
                if (it == node)
                    return true;
                else
                    it = it.next;
            }
            return false;
        };
        return LinkedList;
    })();
    PF.LinkedList = LinkedList;
    var LinkedListNode = (function () {
        function LinkedListNode() {
            this.next = this.prev = null;
        }
        return LinkedListNode;
    })();
    PF.LinkedListNode = LinkedListNode;
})(PF || (PF = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var PF;
(function (PF) {
    var PotentialField = (function (_super) {
        __extends(PotentialField, _super);
        function PotentialField() {
            _super.call(this);
            this.position = new PF.Point(0, 0);
            this.type = PotentialField.PF_TYPE_REPEL;
        }
        PotentialField.prototype.getPotentialBoundsHalfWidth = function () {
            throw new Error("Method is abstract, override it in inherited class!");
            return 0;
        };
        PotentialField.prototype.getPotentialBoundsHalfHeight = function () {
            throw new Error("Method is abstract, override it in inherited class!");
            return 0;
        };
        PotentialField.prototype.getLocalPotential = function (local_x, local_y) {
            throw new Error("Method is abstract, override it in inherited class!");
            return 0;
        };
        PotentialField.PF_TYPE_ATTRACT = 1;
        PotentialField.PF_TYPE_REPEL = -1;
        return PotentialField;
    })(PF.LinkedListNode);
    PF.PotentialField = PotentialField;
    var RadialPotentialField = (function (_super) {
        __extends(RadialPotentialField, _super);
        function RadialPotentialField() {
            _super.call(this);
            this._potential = 1;
            this._gradation = 1;
            this.updateRadius();
        }
        RadialPotentialField.prototype.getPotential = function () {
            return this._potential;
        };
        RadialPotentialField.prototype.setPotential = function (value) {
            this._potential = value;
            this.updateRadius();
        };
        RadialPotentialField.prototype.getGradation = function () {
            return this._gradation;
        };
        RadialPotentialField.prototype.setGradation = function (value) {
            this._gradation = value;
            this.updateRadius();
        };
        RadialPotentialField.prototype.getRadius = function () {
            return this._radius;
        };
        RadialPotentialField.prototype.updateRadius = function () {
            this._radius = Math.ceil(this._potential / this._gradation) - 1;
        };
        RadialPotentialField.prototype.getPotentialBoundsHalfWidth = function () {
            return this._radius;
        };
        RadialPotentialField.prototype.getPotentialBoundsHalfHeight = function () {
            return this._radius;
        };
        RadialPotentialField.prototype.getLocalPotential = function (local_x, local_y) {
            var distance = Math.abs(local_x) + Math.abs(local_y);
            if (distance > this._radius)
                return 0;
            if (this.type < 0)
                return Math.min(0, this.type * (this._potential - this._gradation * distance));
            return Math.max(0, this.type * (this._potential - this._gradation * distance));
        };
        return RadialPotentialField;
    })(PotentialField);
    PF.RadialPotentialField = RadialPotentialField;
    var RectangularPotentialField = (function (_super) {
        __extends(RectangularPotentialField, _super);
        function RectangularPotentialField(max_potential_half_width, max_potential_half_height) {
            _super.call(this);
            this._potential = 1;
            this._gradation = 1;
            this._maxPotentialHalfWidth = max_potential_half_width;
            this._maxPotentialHalfHeight = max_potential_half_height;
            this.updateBounds();
        }
        RectangularPotentialField.prototype.setMaxPotentialHalfWidth = function (value) {
            this._maxPotentialHalfWidth = value;
            this.updateBounds();
        };
        RectangularPotentialField.prototype.getMaxPotentialHalfWidth = function () {
            return this._maxPotentialHalfWidth;
        };
        RectangularPotentialField.prototype.setMaxPotentialHalfHeight = function (value) {
            this._maxPotentialHalfHeight = value;
            this.updateBounds();
        };
        RectangularPotentialField.prototype.getMaxPotentialHalfHeight = function () {
            return this._maxPotentialHalfHeight;
        };
        RectangularPotentialField.prototype.setPotential = function (value) {
            this._potential = value;
            this.updateBounds();
        };
        RectangularPotentialField.prototype.getPotential = function () {
            return this._potential;
        };
        RectangularPotentialField.prototype.setGradation = function (value) {
            this._gradation = value;
            this.updateBounds();
        };
        RectangularPotentialField.prototype.getGradation = function () {
            return this._gradation;
        };
        RectangularPotentialField.prototype.getPotentialBoundsHalfWidth = function () {
            return this._boundsHalfWidth;
        };
        RectangularPotentialField.prototype.getPotentialBoundsHalfHeight = function () {
            return this._boundsHalfHeight;
        };
        RectangularPotentialField.prototype.getLocalPotential = function (local_x, local_y) {
            if (Math.abs(local_x) <= this._maxPotentialHalfWidth && Math.abs(local_y) <= this._maxPotentialHalfHeight)
                return this.type * this._potential;
            if (Math.abs(local_x) < this._boundsHalfWidth && Math.abs(local_y) < this._boundsHalfHeight) {
                var distance;
                if (Math.abs(local_x) > this._maxPotentialHalfWidth && Math.abs(local_y) > this._maxPotentialHalfHeight) {
                    distance = Math.abs(local_x) - this._maxPotentialHalfWidth + Math.abs(local_y) - this._maxPotentialHalfHeight;
                }
                else if (Math.abs(local_x) > this._maxPotentialHalfWidth) {
                    distance = Math.abs(local_x) - this._maxPotentialHalfWidth;
                }
                else if (Math.abs(local_y) > this._maxPotentialHalfHeight) {
                    distance = Math.abs(local_y) - this._maxPotentialHalfHeight;
                }
                if (this.type < 0) {
                    return Math.min(0, this.type * (this._potential - this._gradation * distance));
                }
                return Math.max(0, this.type * (this._potential - this._gradation * distance));
            }
            return 0;
        };
        RectangularPotentialField.prototype.updateBounds = function () {
            this._boundsHalfWidth = this._maxPotentialHalfWidth + Math.ceil(this._potential / this._gradation) - 1;
            this._boundsHalfHeight = this._maxPotentialHalfHeight + Math.ceil(this._potential / this._gradation) - 1;
        };
        return RectangularPotentialField;
    })(PotentialField);
    PF.RectangularPotentialField = RectangularPotentialField;
    var HorizontalPotentialField = (function (_super) {
        __extends(HorizontalPotentialField, _super);
        function HorizontalPotentialField(half_width) {
            _super.call(this);
            this._potential = 1;
            this._gradation = 1;
            this._halfWidth = half_width;
            this.updateBounds();
        }
        HorizontalPotentialField.prototype.setPotential = function (value) {
            this._potential = value;
            this.updateBounds();
        };
        HorizontalPotentialField.prototype.setGradation = function (value) {
            this._gradation = value;
            this.updateBounds();
        };
        HorizontalPotentialField.prototype.getPotential = function () {
            return this._potential;
        };
        HorizontalPotentialField.prototype.getGradation = function () {
            return this._gradation;
        };
        HorizontalPotentialField.prototype.getPotentialBoundsHalfWidth = function () {
            return this._halfWidth;
        };
        HorizontalPotentialField.prototype.getPotentialBoundsHalfHeight = function () {
            return this._halfHeight;
        };
        HorizontalPotentialField.prototype.getLocalPotential = function (local_x, local_y) {
            if (Math.abs(local_x) > this._halfWidth)
                return 0;
            if (this.type < 0) {
                return Math.min(0, this.type * (this._potential - this._gradation * Math.abs(local_y)));
            }
            return Math.max(0, this.type * (this._potential - this._gradation * Math.abs(local_y)));
        };
        HorizontalPotentialField.prototype.updateBounds = function () {
            this._halfHeight = Math.ceil(this._potential / this._gradation) - 1;
        };
        return HorizontalPotentialField;
    })(PotentialField);
    PF.HorizontalPotentialField = HorizontalPotentialField;
    var VerticalPotentialField = (function (_super) {
        __extends(VerticalPotentialField, _super);
        function VerticalPotentialField(half_height) {
            _super.call(this);
            this._potential = 1;
            this._gradation = 1;
            this._halfHeight = half_height;
            this.updateBounds();
        }
        VerticalPotentialField.prototype.setPotential = function (value) {
            this._potential = value;
            this.updateBounds();
        };
        VerticalPotentialField.prototype.setGradation = function (value) {
            this._gradation = value;
            this.updateBounds();
        };
        VerticalPotentialField.prototype.getPotential = function () {
            return this._potential;
        };
        VerticalPotentialField.prototype.getGradation = function () {
            return this._gradation;
        };
        VerticalPotentialField.prototype.getPotentialBoundsHalfWidth = function () {
            return this._halfWidth;
        };
        VerticalPotentialField.prototype.getPotentialBoundsHalfHeight = function () {
            return this._halfHeight;
        };
        VerticalPotentialField.prototype.getLocalPotential = function (local_x, local_y) {
            if (Math.abs(local_y) > this._halfHeight)
                return 0;
            if (this.type < 0) {
                return Math.min(0, this.type * (this._potential - this._gradation * Math.abs(local_x)));
            }
            return Math.max(0, this.type * (this._potential - this._gradation * Math.abs(local_x)));
        };
        VerticalPotentialField.prototype.updateBounds = function () {
            this._halfWidth = Math.ceil(this._potential / this._gradation) - 1;
        };
        return VerticalPotentialField;
    })(PotentialField);
    PF.VerticalPotentialField = VerticalPotentialField;
})(PF || (PF = {}));
var PF;
(function (PF) {
    var DynamicPotentialsMap = (function () {
        function DynamicPotentialsMap(tiles_width, tiles_height) {
            this._fields = new PF.LinkedList();
            this._tilesWidth = tiles_width;
            this._tilesHeight = tiles_height;
        }
        DynamicPotentialsMap.prototype.getTilesWidth = function () {
            return this._tilesWidth;
        };
        DynamicPotentialsMap.prototype.getTilesHeight = function () {
            return this._tilesHeight;
        };
        DynamicPotentialsMap.prototype.addPotentialField = function (field) {
            this._fields.appendNode(field);
        };
        DynamicPotentialsMap.prototype.removePotentialField = function (field) {
            this._fields.removeNode(field);
        };
        DynamicPotentialsMap.prototype.removeAllPotentialFields = function () {
            this._fields.removeAllNodes();
        };
        DynamicPotentialsMap.prototype.getPotential = function (map_x, map_y) {
            var potential = 0;
            for (var field = this._fields.head; field; field = field.next) {
                potential += field.getLocalPotential(map_x - field.position.x, map_y - field.position.y);
            }
            return potential;
        };
        return DynamicPotentialsMap;
    })();
    PF.DynamicPotentialsMap = DynamicPotentialsMap;
    var StaticPotentialsMap = (function () {
        function StaticPotentialsMap(tiles_width, tiles_height) {
            this._cachedPoint = new PF.Point();
            this._tilesWidth = tiles_width;
            this._tilesHeight = tiles_height;
            this._map = new Array(tiles_width);
            for (var col = 0; col < tiles_width; col++) {
                this._map[col] = new Array(tiles_height);
                for (var row = 0; row < tiles_height; row++) {
                    this._map[col][row] = 0;
                }
            }
        }
        StaticPotentialsMap.prototype.getTilesWidth = function () {
            return this._tilesWidth;
        };
        StaticPotentialsMap.prototype.getTilesHeight = function () {
            return this._tilesHeight;
        };
        StaticPotentialsMap.prototype.addPotentialField = function (field) {
            this.addPotentail(field, 1);
        };
        StaticPotentialsMap.prototype.removePotentialField = function (field) {
            this.addPotentail(field, -1);
        };
        StaticPotentialsMap.prototype.getPotential = function (x, y) {
            return this._map[x][y];
        };
        StaticPotentialsMap.prototype.addPotentail = function (field, multiplier) {
            for (var x = Math.max(0, field.position.x - field.getPotentialBoundsHalfWidth()); x <= Math.min(this._tilesWidth - 1, field.position.x + field.getPotentialBoundsHalfWidth()); x++) {
                for (var y = Math.max(0, field.position.y - field.getPotentialBoundsHalfHeight()); y <= Math.min(this._tilesHeight - 1, field.position.y + field.getPotentialBoundsHalfHeight()); y++) {
                    var local = field.getLocalPotential(x - field.position.x, y - field.position.y);
                    this._map[x][y] += multiplier * field.getLocalPotential(x - field.position.x, y - field.position.y);
                }
            }
        };
        StaticPotentialsMap.prototype.debugDraw = function (game, graphics) {
            while (graphics.children.length > 0) {
                var child = graphics.getChildAt(0);
                child.destroy();
            }
            for (var x = 0; x < this._tilesWidth; x++) {
                for (var y = 0; y < this._tilesHeight; y++) {
                    if (this._map[x][y] != 0) {
                        var p = this._map[x][y];
                        var txt = game.make.text(x * Grid.CELL_SIZE, y * Grid.CELL_SIZE, p.toString(), { fontSize: 12 });
                        txt.alpha = 0.5;
                        txt.addColor(p <= 0 ? '#00FF00' : '#0000FF', 0);
                        graphics.addChild(txt);
                    }
                }
            }
        };
        return StaticPotentialsMap;
    })();
    PF.StaticPotentialsMap = StaticPotentialsMap;
})(PF || (PF = {}));
var PF;
(function (PF) {
    var Agent = (function (_super) {
        __extends(Agent, _super);
        function Agent(static_potentials_map, dynamic_potentials_map, subtract_self_potential_from_dynamic_maps_sum) {
            if (static_potentials_map === void 0) { static_potentials_map = null; }
            if (dynamic_potentials_map === void 0) { dynamic_potentials_map = null; }
            if (subtract_self_potential_from_dynamic_maps_sum === void 0) { subtract_self_potential_from_dynamic_maps_sum = true; }
            _super.call(this);
            this.trailLength = Agent.DEFAULT_TRAIL_LENGTH;
            this._cachedPoint = new PF.Point();
            this._mapTilesWidth = (static_potentials_map) ? static_potentials_map[0].getTilesWidth() : 0;
            this._mapTilesHeight = (static_potentials_map) ? static_potentials_map[0].getTilesHeight() : 0;
            this._staticPotentialsMaps = static_potentials_map;
            this._dynamicPotentialsMaps = dynamic_potentials_map;
            this._trails = new PF.LinkedList();
            this.subtractSelfPotentialFromDynamicsMapSum = subtract_self_potential_from_dynamic_maps_sum;
            this.debugDrawColor = 0xFF000000;
        }
        Agent.prototype.addStaticPotentialsMap = function (value) {
            if (this._mapTilesWidth > 0 && this._mapTilesHeight > 0) {
                if (this._mapTilesWidth != value.getTilesWidth() || this._mapTilesHeight != value.getTilesHeight())
                    throw new Error("All potentials maps should have the same tilesWidth and tilesHeight!");
            }
            else {
                this._mapTilesWidth = value.getTilesWidth();
                this._mapTilesHeight = value.getTilesHeight();
            }
            if (!this._staticPotentialsMaps) {
                this._staticPotentialsMaps = new Array();
                this._staticPotentialsMapsEnabe = new Array();
            }
            this._staticPotentialsMaps.push(value);
            this._staticPotentialsMapsEnabe.push(true);
        };
        Agent.prototype.removeAllStaticPotentialsMaps = function () {
            this._staticPotentialsMaps = null;
            this._staticPotentialsMapsEnabe = null;
            if (!this._dynamicPotentialsMaps)
                this._mapTilesWidth = this._mapTilesHeight = 0;
        };
        Agent.prototype.addDynamicPotentialsMap = function (value) {
            if (this._mapTilesWidth > 0 && this._mapTilesHeight > 0) {
                if (this._mapTilesWidth != value.getTilesWidth() || this._mapTilesHeight != value.getTilesHeight())
                    throw new Error("All potentials maps should have the same tilesWidth and tilesHeight!");
            }
            else {
                this._mapTilesWidth = value.getTilesWidth();
                this._mapTilesHeight = value.getTilesHeight();
            }
            if (!this._dynamicPotentialsMaps) {
                this._dynamicPotentialsMaps = new Array();
                this._dynamicPotentialsMapsEnabe = new Array();
            }
            this._dynamicPotentialsMaps.push(value);
            this._dynamicPotentialsMapsEnabe.push(true);
        };
        Agent.prototype.removeAllDynamicPotentialsMaps = function () {
            this._dynamicPotentialsMaps = null;
            this._dynamicPotentialsMapsEnabe = null;
            if (!this._staticPotentialsMaps)
                this._mapTilesWidth = this._mapTilesHeight = 0;
        };
        Agent.prototype.getStaticPotentialsMaps = function () {
            return this._staticPotentialsMaps;
        };
        Agent.prototype.getDynamicPotentialsMaps = function () {
            return this._dynamicPotentialsMaps;
        };
        Agent.prototype.enableStaticPotentialMap = function (map_index, enabled) {
            if (this._staticPotentialsMaps)
                this._staticPotentialsMapsEnabe[map_index] = enabled;
        };
        Agent.prototype.enableDynamicPotentialMap = function (map_index, enabled) {
            if (this._dynamicPotentialsMaps)
                this._dynamicPotentialsMapsEnabe[map_index] = enabled;
        };
        Agent.prototype.isStaticPotentialMapEnabled = function (map_index) {
            return this._staticPotentialsMapsEnabe[map_index];
        };
        Agent.prototype.isDynamicPotentialMapEnabled = function (map_index) {
            return this._dynamicPotentialsMapsEnabe[map_index];
        };
        Agent.prototype.getPotentialByMap = function (map_x, map_y) {
            return this.getLocalPotential(map_x - this.position.x, map_y - this.position.y);
        };
        Agent.prototype.getTrailPotential = function (map_x, map_y) {
            var potential = 0;
            for (var trail = this._trails.head; trail; trail = trail.next) {
                var pfaTrail = trail;
                if (pfaTrail.worldX == map_x && pfaTrail.worldY == map_y) {
                    potential += pfaTrail.potential;
                }
            }
            return potential;
        };
        Agent.prototype.staticPotentialsSum = function (map_x, map_y) {
            if (!this._staticPotentialsMaps)
                return 0;
            var sum = 0;
            var len = this._staticPotentialsMaps.length;
            for (var i = 0; i < len; i++) {
                if (this._staticPotentialsMapsEnabe[i]) {
                    sum += this._staticPotentialsMaps[i].getPotential(map_x, map_y);
                }
            }
            return sum;
        };
        Agent.prototype.dynamicPotentialsSum = function (map_x, map_y) {
            if (!this._dynamicPotentialsMaps)
                return 0;
            var sum = 0;
            var len = this._dynamicPotentialsMaps.length;
            for (var i = 0; i < len; i++) {
                if (this._dynamicPotentialsMapsEnabe[i]) {
                    sum += this._dynamicPotentialsMaps[i].getPotential(map_x, map_y);
                }
            }
            return sum;
        };
        Agent.prototype.nextPosition = function (x_order, y_order) {
            if (x_order === void 0) { x_order = 1; }
            if (y_order === void 0) { y_order = 1; }
            this._cachedPoint.setTo(this.position.x, this.position.y);
            var staticPotential = this.staticPotentialsSum(this.position.x, this.position.y);
            var agentsPotential = this.dynamicPotentialsSum(this.position.x, this.position.y);
            var selfPotential = this.getPotentialByMap(this.position.x, this.position.y);
            var trailPotential = this.getTrailPotential(this.position.x, this.position.y);
            var bestAttractPotential = staticPotential + agentsPotential - (this.subtractSelfPotentialFromDynamicsMapSum ? selfPotential : 0) + trailPotential;
            for (var x = -1; x <= 1; x++) {
                var xx = this.position.x + x * x_order;
                if (xx >= 0 && xx < this._mapTilesWidth) {
                    for (var y = -1; y <= 1; y++) {
                        if (x == 0 && y == 0) {
                            continue;
                        }
                        var yy = this.position.y + y * y_order;
                        if (yy >= 0 && yy < this._mapTilesHeight) {
                            var comparingPotential = this.staticPotentialsSum(xx, yy) + this.dynamicPotentialsSum(xx, yy) - (this.subtractSelfPotentialFromDynamicsMapSum ? this.getPotentialByMap(xx, yy) : 0) + this.getTrailPotential(xx, yy);
                            if (comparingPotential < bestAttractPotential) {
                                bestAttractPotential = comparingPotential;
                                this._cachedPoint.setTo(xx, yy);
                            }
                        }
                    }
                }
            }
            if (this._cachedPoint.x == this.position.x && this._cachedPoint.y == this.position.y) {
                if (this._trails.length > this.trailLength) {
                    var recycledTrail = this._trails.head;
                    this._trails.removeNode(recycledTrail);
                    recycledTrail.worldX = this.position.x;
                    recycledTrail.worldY = this.position.y;
                    this._trails.appendNode(recycledTrail);
                }
                else if (this.trailLength > 0) {
                    this._trails.appendNode(new AgentTrail(this.position.x, this.position.y, this.type * this.getPotential()));
                }
                this._cachedPoint.setTo(this.position.x, this.position.y);
            }
            return this._cachedPoint;
        };
        Agent.prototype.setTrailLength = function (value) {
            while (value < this._trails.length) {
                this._trails.fetchHead();
            }
            this.trailLength = value;
        };
        Agent.prototype.moveToPositionPoint = function (p) {
            this.moveToPosition(p.x, p.y);
        };
        Agent.prototype.moveToPosition = function (new_x, new_y) {
            this.position.x = new_x;
            this.position.y = new_y;
        };
        Agent.DEFAULT_TRAIL_LENGTH = 0;
        return Agent;
    })(PF.RadialPotentialField);
    PF.Agent = Agent;
    var AgentTrail = (function (_super) {
        __extends(AgentTrail, _super);
        function AgentTrail(world_x, world_y, potential) {
            _super.call(this);
            this.worldX = world_x;
            this.worldY = world_y;
            this.potential = potential;
        }
        return AgentTrail;
    })(PF.LinkedListNode);
    PF.AgentTrail = AgentTrail;
})(PF || (PF = {}));
var Grid = (function () {
    function Grid(w, h) {
        this._col = 0;
        this._row = 0;
        this._widthPx = 0;
        this._heightPx = 0;
        this.map = new Array();
        this.buildCells(w, h);
    }
    Grid.prototype.getCol = function () {
        return this._col;
    };
    Grid.prototype.getRow = function () {
        return this._row;
    };
    Grid.prototype.getCenterX = function () {
        return Math.floor(this._col * 0.5);
    };
    Grid.prototype.getCenterY = function () {
        return Math.floor(this._row * 0.5);
    };
    Grid.prototype.getGridX = function (x) {
        var mx = Math.floor(x / Grid.CELL_SIZE);
        mx = Math.max(0, mx);
        mx = Math.min(this._col - 1, mx);
        return mx;
    };
    Grid.prototype.getGridY = function (y) {
        var my = Math.floor(y / Grid.CELL_SIZE);
        my = Math.max(0, my);
        my = Math.min(this._row - 1, my);
        return my;
    };
    Grid.prototype.buildCells = function (w, h) {
        this._col = Math.ceil(w / Grid.CELL_SIZE);
        this._row = Math.ceil(h / Grid.CELL_SIZE);
        this._widthPx = this._col * Grid.CELL_SIZE;
        this._heightPx = this._col * Grid.CELL_SIZE;
        this.map = new Array(this._col);
        for (var col = 0; col < this._col; col++) {
            this.map[col] = new Array(this._row);
            for (var row = 0; row < this._row; row++) {
                this.map[col][row] = 0;
            }
        }
    };
    Grid.prototype.toString = function () {
        return "col:" + this._col + " row:" + this._row;
    };
    Grid.prototype.debugDraw = function (graphics) {
        var g = graphics;
        g.clear();
        g.lineStyle(0.01, 0x292929);
        for (var x = 0; x < this._col; x++) {
            g.moveTo(x * Grid.CELL_SIZE, 0);
            g.lineTo(x * Grid.CELL_SIZE, this._row * Grid.CELL_SIZE);
        }
        for (var y = 0; y < this._row; y++) {
            g.moveTo(0, y * Grid.CELL_SIZE);
            g.lineTo(this._col * Grid.CELL_SIZE, y * Grid.CELL_SIZE);
        }
        g.cacheAsBitmap = true;
    };
    Grid.CELL_SIZE = 16;
    return Grid;
})();
var WonderCraft = (function () {
    function WonderCraft() {
        var _this = this;
        this.grid = new Grid(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT);
        this.create = function (game) {
            var gridGraphics = game.add.graphics(0, 0);
            _this.grid.debugDraw(gridGraphics);
            _this.game.input.onDown.add(_this.onMouseDown);
            _this.agentG = game.add.graphics(0, 0);
            _this.agentG.beginFill(0xFF9900, 1);
            _this.agentG.drawRect(0, 0, Grid.CELL_SIZE, Grid.CELL_SIZE);
            _this.agentG.endFill();
            _this.staticPFs = game.add.sprite(0, 0);
            _this.dynamicPFs = game.add.sprite(0, 0);
            _this.sPFMap = new PF.StaticPotentialsMap(_this.grid.getCol(), _this.grid.getRow());
            _this.dPFMap = new PF.DynamicPotentialsMap(_this.grid.getCol(), _this.grid.getRow());
            _this.agent = new PF.Agent();
            _this.agent.addStaticPotentialsMap(_this.sPFMap);
            _this.agent.moveToPosition(_this.grid.getCenterX(), _this.grid.getCenterY());
            _this.agent.subtractSelfPotentialFromDynamicsMapSum = false;
        };
        this.update = function (game) {
            var p = _this.agent.nextPosition();
            _this.agent.moveToPositionPoint(p);
            _this.agentG.x = p.x * Grid.CELL_SIZE;
            _this.agentG.y = p.y * Grid.CELL_SIZE;
        };
        this.onMouseDown = function (input) {
            var x = _this.grid.getGridX(input.x);
            var y = _this.grid.getGridY(input.y);
            var field = new PF.RectangularPotentialField(1, 1);
            field.type = Math.random() >= 0.5 ? PF.PotentialField.PF_TYPE_ATTRACT : PF.PotentialField.PF_TYPE_REPEL;
            field.setPotential(4);
            field.setGradation(2);
            field.position.setTo(x, y);
            _this.sPFMap.addPotentialField(field);
            _this.sPFMap.debugDraw(_this.game, _this.staticPFs);
        };
        this.game = new Phaser.Game(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT, Phaser.AUTO, "body", { create: this.create, update: this.update });
    }
    WonderCraft.STAGE_WIDTH = 800;
    WonderCraft.STAGE_HEIGHT = 448;
    return WonderCraft;
})();
window.onload = function () {
    new WonderCraft();
};
//# sourceMappingURL=WonderCraft-dev.js.map