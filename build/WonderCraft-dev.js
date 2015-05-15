(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Wonder;
(function (Wonder) {
    var Random = (function () {
        function Random(seed) {
            this.xg = new XorGen(seed);
        }
        Random.prototype.nextUInt = function () {
            return this.xg.next();
        };
        Random.prototype.nextRange = function (a, b, round) {
            if (round === void 0) { round = true; }
            var range = Math.abs(b - a);
            range = range * this.prng();
            return round ? Math.round(range + a) : range + a;
        };
        Random.prototype.nextBoolean = function () {
            return this.prng() > 0.5;
        };
        Random.prototype.prng = function () {
            return (this.xg.next() >>> 0) / ((1 << 30) * 4);
        };
        Random.prototype.shuffle = function (arr, copy) {
            if (copy === void 0) { copy = false; }
            var collection = arr, len = arr.length, random, temp;
            if (copy === true)
                collection = arr.slice();
            while (len) {
                random = Math.floor(this.prng() * len);
                len -= 1;
                temp = collection[len];
                collection[len] = collection[random];
                collection[random] = temp;
            }
            return collection;
        };
        return Random;
    })();
    Wonder.Random = Random;
    var XorGen = (function () {
        function XorGen(seed) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 0;
            this.strseed = '';
            this.strseed = seed;
            for (var k = 0; k < this.strseed.length + 64; k++) {
                this.x ^= this.strseed.charCodeAt(k) | 0;
                this.next();
            }
        }
        XorGen.prototype.next = function () {
            var t = this.x ^ (this.x << 11);
            this.x = this.y;
            this.y = this.z;
            this.z = this.w;
            return this.w ^= (this.w >>> 19) ^ t ^ (t >>> 8);
        };
        return XorGen;
    })();
    var Vec2 = (function () {
        function Vec2(x, y) {
            this.x = x;
            this.y = y;
        }
        Vec2.prototype.add = function (v) {
            return new Vec2(v.x + this.x, v.y + this.y);
        };
        Vec2.prototype.sub = function (v) {
            return new Vec2(this.x - v.x, this.y - v.y);
        };
        Vec2.prototype.mul = function (m) {
            return new Vec2(this.x * m, this.y * m);
        };
        Vec2.prototype.div = function (d) {
            return new Vec2(this.x / d, this.y / d);
        };
        Vec2.prototype.angle = function () {
            return 0;
        };
        Vec2.prototype.normalize = function () {
            return Wonder.normalize(this.x, this.y);
        };
        return Vec2;
    })();
    Wonder.Vec2 = Vec2;
    function distance(ax, ay, bx, by) {
        var dx = ax - bx;
        var dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }
    Wonder.distance = distance;
    function length(x, y) {
        return Math.sqrt(x * x + y * y);
    }
    Wonder.length = length;
    function normalize(x, y) {
        if (x === 0 && y === 0)
            return new Vec2(0, 0);
        var len = length(x, y);
        return new Vec2(x / len, y / len);
    }
    Wonder.normalize = normalize;
})(Wonder || (Wonder = {}));
var Wonder;
(function (Wonder) {
    var Lill = require("lill");
    var RandomColor = require("randomcolor");
    var vec2 = require("vec2");
    Wonder.TEAM_SIDE_LEFT = 0;
    Wonder.TEAM_SIDE_RIGHT = 1;
    Wonder.FRAMERATE = 1 / 60;
    var MAX_SQUAD_NUMBER = 20;
    var SQUAD_POSITIONS = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19
    ];
    var DEBUG_COLOR_HUES = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];
    var ATTACK_RANGE;
    (function (ATTACK_RANGE) {
        ATTACK_RANGE[ATTACK_RANGE["MELEE"] = 20] = "MELEE";
        ATTACK_RANGE[ATTACK_RANGE["MEDIUM"] = 120] = "MEDIUM";
        ATTACK_RANGE[ATTACK_RANGE["LONG"] = 250] = "LONG";
    })(ATTACK_RANGE || (ATTACK_RANGE = {}));
    var RANGES = [20 /* MELEE */, 120 /* MEDIUM */, 250 /* LONG */];
    var Team = (function () {
        function Team(id) {
            this.squads = {};
            this.frameCount = 0;
            this.id = id;
            Lill.attach(this.squads);
        }
        Team.prototype.update = function () {
            var squad = Lill.getHead(this.squads);
            while (squad) {
                squad.hero.update(Wonder.FRAMERATE);
                var unit = Lill.getHead(squad.units);
                while (unit) {
                    unit.update(Wonder.FRAMERATE);
                    unit = Lill.getNext(squad.units, unit);
                }
                squad = Lill.getNext(this.squads, squad);
            }
            this.frameCount++;
            if (this.frameCount === 60)
                this.frameCount = 0;
        };
        Team.prototype.render = function () {
            var squad = Lill.getHead(this.squads);
            while (squad) {
                squad.hero.render(Wonder.FRAMERATE);
                var unit = Lill.getHead(squad.units);
                while (unit) {
                    unit.render(Wonder.FRAMERATE);
                    unit = Lill.getNext(squad.units, unit);
                }
                squad = Lill.getNext(this.squads, squad);
            }
        };
        Team.prototype.getSquadsNumber = function () {
            return Lill.getSize(this.squads);
        };
        Team.prototype.addSquad = function (squad) {
            squad.team = this;
            Lill.add(this.squads, squad);
        };
        Team.prototype.getSquad = function (squad_id) {
            var squad = Lill.getHead(this.squads);
            while (squad) {
                if (squad.id == squad_id) {
                    return squad;
                }
                squad = Lill.getNext(this.squads, squad);
            }
            return null;
        };
        return Team;
    })();
    Wonder.Team = Team;
    var Squad = (function () {
        function Squad(id, debug_color) {
            this.units = {};
            this.id = id;
            this.debug_color = debug_color;
            Lill.attach(this.units);
        }
        Squad.prototype.setHero = function (hero) {
            this.hero = hero;
            hero.squad = this;
        };
        Squad.prototype.getUnitsNumber = function () {
            return Lill.getSize(this.units);
        };
        Squad.prototype.addUnit = function (unit) {
            unit.squad = this;
            unit.team = this.team;
            Lill.add(this.units, unit);
        };
        Squad.prototype.getUnit = function (unit_id) {
            var unit = Lill.getHead(this.units);
            while (unit) {
                if (unit.id == unit_id) {
                    return unit;
                }
                unit = Lill.getNext(this.units, unit);
            }
            return null;
        };
        return Squad;
    })();
    Wonder.Squad = Squad;
    function buildTestTeam(rnd, color_hue) {
        if (color_hue === void 0) { color_hue = null; }
        var team = new Team(rnd.nextUInt());
        var squad_number_range = rnd.nextRange(10, 18);
        color_hue = color_hue ? color_hue : DEBUG_COLOR_HUES[rnd.nextRange(0, DEBUG_COLOR_HUES.length - 1)];
        team.debug_hue = color_hue;
        rnd.shuffle(SQUAD_POSITIONS);
        for (var i = 0; i < squad_number_range; i++) {
            var squad = new Squad(rnd.nextUInt(), 0);
            squad.position = SQUAD_POSITIONS[i];
            var hero = new Wonder.Hero(rnd.nextUInt());
            squad.setHero(hero);
            hero.range = RANGES[rnd.nextRange(0, RANGES.length - 1)];
            var unit_number_range = rnd.nextRange(10, 15);
            for (var j = 0; j < unit_number_range; j++) {
                var unit = new Wonder.Unit(j);
                squad.addUnit(unit);
            }
            var rc = RandomColor({ hue: team.debug_hue }).slice(1);
            squad.debug_color = parseInt("0x" + rc);
            team.addSquad(squad);
            team.seed = rnd;
        }
        return team;
    }
    Wonder.buildTestTeam = buildTestTeam;
    function initDebugDraw(game, team) {
        var side = team.side;
        var squad = Lill.getHead(team.squads);
        var squad_w = 1334 / 16;
        var squad_h = (750 - 200) / 5;
        var unit_radius = 12;
        var hero_radius = 16;
        var padding = 4;
        while (squad) {
            var s_col = side == 0 ? squad.position % 4 : 3 - (squad.position % 4);
            var s_row = Math.floor(squad.position / 4);
            var s_x = side == 0 ? s_col * squad_w + squad_w : 1334 - (s_col * squad_w + squad_w);
            var s_y = s_row * squad_h + squad_h * 0.5 + 100;
            addDebugShape(game, squad.hero, hero_radius, squad.debug_color, side);
            squad.hero.agent.x = squad.hero.displayer.x = s_x;
            squad.hero.agent.y = squad.hero.displayer.y = s_y;
            var unit = Lill.getHead(squad.units);
            var pos = 0;
            var start_x = side == 0 ? s_x - hero_radius - padding : s_x + hero_radius + padding;
            var start_y = s_y - 2 * (unit_radius + padding);
            while (unit) {
                var u_x = side == 0 ? start_x - Math.floor(pos / 5) * (unit_radius + padding) : start_x + Math.floor(pos / 5) * (unit_radius + padding);
                var u_y = start_y + pos % 5 * (unit_radius + padding);
                addDebugShape(game, unit, unit_radius, squad.debug_color, side);
                unit.agent.x = unit.displayer.x = u_x;
                unit.agent.y = unit.displayer.y = u_y;
                unit = Lill.getNext(squad.units, unit);
                pos++;
            }
            squad = Lill.getNext(team.squads, squad);
        }
    }
    Wonder.initDebugDraw = initDebugDraw;
    function addDebugShape(game, unit, radius, color, side) {
        var displayer = game.add.sprite(0, 0);
        var g = game.make.graphics(0, 0);
        g.lineStyle(2, color);
        g.drawCircle(0, 0, radius);
        g.moveTo(0, 0);
        if (side == 0) {
            g.lineTo(radius * 0.5, 0);
        }
        else {
            g.lineTo(-radius * 0.5, 0);
        }
        g.cacheAsBitmap = true;
        displayer.addChild(g);
        unit.displayer = displayer;
    }
})(Wonder || (Wonder = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Wonder;
(function (Wonder) {
    var Lill = require("lill");
    var Unit = (function () {
        function Unit(id) {
            this.isHero = false;
            this.isMoving = false;
            this.isAttacking = false;
            this.isDead = false;
            this.separation = new Wonder.Vec2(0, 0);
            this.randomFollow = new Wonder.Vec2(0, 0);
            this.id = id;
            this.init();
        }
        Unit.prototype.isIdle = function () {
            return !this.isMoving && !this.isAttacking && !this.isDead;
        };
        Unit.prototype.init = function () {
            this.isHero = false;
            this.agent = new UnitAgent(this);
        };
        Unit.prototype.update = function (time) {
            this.agent.update(time);
        };
        Unit.prototype.render = function (time) {
            this.displayer.x = this.agent.x;
            this.displayer.y = this.agent.y;
        };
        Unit.prototype.move = function () {
            this.isMoving = true;
            this.isAttacking = false;
            var dx = this.target.agent.x - this.agent.x;
            var dy = this.target.agent.y - this.agent.y;
            var vec2 = Wonder.normalize(dx, dy);
            this.agent.velocity = vec2.mul(2);
            if (this.squad.team.frameCount % 120 === 0) {
                var team = this.squad.team;
                var neighbour = Lill.getHead(team.squads);
                var neighboursCount = 0;
                while (neighbour) {
                    if (!neighbour.hero.isDead && !neighbour.hero.isMoving) {
                        var d = getUnitDistance(neighbour.hero, this);
                        if (d <= 120) {
                            dx = this.agent.x - neighbour.hero.agent.x;
                            dy = this.agent.y - neighbour.hero.agent.y;
                            this.separation.x += dx;
                            this.separation.y += dy;
                            neighboursCount++;
                        }
                    }
                    neighbour = Lill.getNext(team.squads, neighbour);
                }
                if (neighboursCount > 0)
                    this.separation = this.separation.div(neighboursCount).normalize().mul(0.75);
                else
                    this.separation = new Wonder.Vec2(0, 0);
            }
            this.agent.velocity = this.agent.velocity.add(this.separation);
            this.agent.x += this.agent.velocity.x;
            this.agent.y += this.agent.velocity.y;
        };
        Unit.prototype.follow = function () {
            this.isMoving = true;
            this.isAttacking = false;
            var hero = this.squad.hero;
            var hero_v = this.squad.hero.agent.velocity;
            if (this.squad.team.frameCount % 10 === 0) {
                var seed = this.squad.team.seed;
                this.randomFollow.x = seed.nextRange(-0.15, 0.15, false);
                this.randomFollow.y = seed.nextRange(-0.15, 0.15, false);
            }
            this.agent.velocity = hero_v.add(this.randomFollow);
            this.agent.x += this.agent.velocity.x;
            this.agent.y += this.agent.velocity.y;
        };
        Unit.prototype.attack = function () {
            this.isAttacking = true;
            this.isMoving = false;
        };
        return Unit;
    })();
    Wonder.Unit = Unit;
    var Hero = (function (_super) {
        __extends(Hero, _super);
        function Hero(id) {
            _super.call(this, id);
        }
        Hero.prototype.init = function () {
            this.isHero = true;
            this.agent = new HeroAgent(this);
        };
        return Hero;
    })(Unit);
    Wonder.Hero = Hero;
    var UnitAgent = (function () {
        function UnitAgent(unit) {
            this.pos = new Wonder.Vec2(0, 0);
            this.unit = unit;
        }
        UnitAgent.prototype.getPosition = function () {
            this.pos.x = this.x;
            this.pos.y = this.y;
            return this.pos;
        };
        UnitAgent.prototype.setPosition = function (v) {
            this.pos = v;
            this.x = this.pos.x;
            this.y = this.pos.y;
        };
        UnitAgent.prototype.update = function (time) {
            if (this.unit.squad.hero.isMoving) {
                this.unit.follow();
            }
        };
        return UnitAgent;
    })();
    Wonder.UnitAgent = UnitAgent;
    var HeroAgent = (function (_super) {
        __extends(HeroAgent, _super);
        function HeroAgent(unit) {
            _super.call(this, unit);
        }
        HeroAgent.prototype.update = function (time) {
            if (this.unit.isIdle()) {
                var target = findNearestHero(this.unit);
                this.unit.target = target;
                this.unit.move();
            }
            if (this.unit.target && this.unit.isMoving) {
                if (outOfRange(this.unit, this.unit.target)) {
                    this.unit.move();
                }
                else {
                    if (this.unit.isMoving)
                        console.log("move to attack");
                    this.unit.attack();
                }
            }
        };
        return HeroAgent;
    })(UnitAgent);
    Wonder.HeroAgent = HeroAgent;
    function getUnitDistance(a, b) {
        return Wonder.distance(a.agent.x, a.agent.y, b.agent.x, b.agent.y);
    }
    function findNearestHero(hero) {
        var distance = Infinity;
        var nearest = null;
        var enemy = hero.squad.team.enemy;
        var e_squad = Lill.getHead(enemy.squads);
        while (e_squad) {
            if (!e_squad.hero.isDead) {
                var d = getUnitDistance(e_squad.hero, hero);
                if (d < distance) {
                    distance = d;
                    nearest = e_squad.hero;
                }
            }
            e_squad = Lill.getNext(enemy.squads, e_squad);
        }
        return nearest;
    }
    function outOfRange(attacker, target) {
        var d = getUnitDistance(attacker, target);
        if (d < attacker.range)
            return false;
        return true;
    }
})(Wonder || (Wonder = {}));
var WonderCraft = (function () {
    function WonderCraft() {
        var _this = this;
        this.create = function (game) {
            game.time.advancedTiming = true;
            var seed = new Wonder.Random("TheSecretLifeOfWalterMitty");
            _this.teamA = Wonder.buildTestTeam(seed, "red");
            _this.teamB = Wonder.buildTestTeam(seed, "blue");
            _this.teamA.enemy = _this.teamB;
            _this.teamB.enemy = _this.teamA;
            _this.teamA.side = Wonder.TEAM_SIDE_LEFT;
            _this.teamB.side = Wonder.TEAM_SIDE_RIGHT;
            Wonder.initDebugDraw(game, _this.teamA);
            Wonder.initDebugDraw(game, _this.teamB);
        };
        this.count = 0;
        this.update = function (game) {
            if (_this.count > 300) {
                _this.teamA.update();
                _this.teamB.update();
            }
            _this.count++;
        };
        this.render = function (game) {
            _this.teamA.render();
            _this.teamB.render();
            game.debug.text(game.time.fps.toString(), 2, 14, "#00FF00");
        };
        this.game = new Phaser.Game(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT, Phaser.CANVAS, "body", { create: this.create, update: this.update, render: this.render });
    }
    WonderCraft.STAGE_WIDTH = 1334;
    WonderCraft.STAGE_HEIGHT = 750;
    return WonderCraft;
})();
window.onload = function () {
    new WonderCraft();
};
//# sourceMappingURL=wondercraft-dev.js.map
},{"lill":2,"randomcolor":19,"vec2":20}],2:[function(require,module,exports){
/*
* The MIT License (MIT)
* Copyright © 2014 Daniel K. (FredyC)
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
* 
* Version: 0.3.2
*/
'use strict';
var LiLL, Symbol, add, attach, bData, bOwner, checkAttached, checkItem, clear, detach, each, each$noContext, each$withContext, getHead, getNext, getPrevious, getSize, getTail, has, idSequence, isAttached, remove;

Symbol = require('es6-symbol');

bData = Symbol('lill related data');

bOwner = Symbol('lill owner of item');

idSequence = 0;

attach = function(owner) {
  var data, _ref;
  if (!(owner && ((_ref = typeof owner) === 'object' || _ref === 'function'))) {
    throw new TypeError('LiLL.attach needs an object or function');
  }
  if (owner[bData]) {
    throw new TypeError('LiLL.attach cannot use already attached object');
  }
  if (!Object.isExtensible(owner)) {
    throw new TypeError('LiLL.attach needs extensible object');
  }
  owner[bData] = data = {
    owner: Symbol('lill parent owner'),
    next: Symbol('lill next item'),
    prev: Symbol('lill previous item'),
    head: null,
    tail: null,
    size: 0,
    id: idSequence
  };
  idSequence += 1;
  Object.seal(data);
  return owner;
};

detach = function(owner) {
  if (!owner[bData]) {
    return owner;
  }
  clear(owner);
  delete owner[bData];
  return owner;
};

add = function(owner, item) {
  var data;
  data = checkAttached(owner);
  checkItem(owner, item, 'add');
  if (item[data.owner] === owner) {
    return owner;
  }
  item[data.next] = item[data.prev] = null;
  item[data.owner] = owner;
  if (!data.head) {
    data.head = data.tail = item;
  } else {
    data.tail[data.next] = item;
    item[data.prev] = data.tail;
    data.tail = item;
  }
  data.size += 1;
  return owner;
};

has = function(owner, item) {
  var data;
  data = checkAttached(owner);
  checkItem(owner, item, 'has');
  return item[data.owner] === owner;
};

remove = function(owner, item) {
  var data, next, prev;
  data = checkAttached(owner);
  checkItem(owner, item, 'remove');
  if (item[data.owner] !== owner) {
    return owner;
  }
  if (data.head === item) {
    data.head = data.head[data.next];
  }
  if (data.tail === item) {
    data.tail = data.tail[data.prev];
  }
  if (prev = item[data.prev]) {
    prev[data.next] = item[data.next];
  }
  if (next = item[data.next]) {
    next[data.prev] = item[data.prev];
  }
  delete item[data.next];
  delete item[data.prev];
  delete item[data.owner];
  data.size -= 1;
  return owner;
};

clear = function(owner) {
  var data, item;
  data = checkAttached(owner);
  while (item = data.head) {
    data.head = item[data.next];
    delete item[data.next];
    delete item[data.prev];
    delete item[data.owner];
  }
  data.head = data.tail = null;
  data.size = 0;
  return owner;
};

getHead = function(owner) {
  var data;
  data = checkAttached(owner);
  return data.head;
};

getTail = function(owner) {
  var data;
  data = checkAttached(owner);
  return data.tail;
};

getNext = function(owner, item) {
  var data;
  data = checkAttached(owner);
  return item != null ? item[data.next] : void 0;
};

getPrevious = function(owner, item) {
  var data;
  data = checkAttached(owner);
  return item != null ? item[data.prev] : void 0;
};

getSize = function(owner) {
  var data;
  data = checkAttached(owner);
  return data.size;
};

each = function(owner, cb, ctx) {
  var data, i, item, iterator, next;
  data = checkAttached(owner);
  if (typeof cb !== 'function') {
    throw new TypeError('LiLL.each method expects callback function');
  }
  i = 0;
  if (!(item = data.head)) {
    return i;
  }
  iterator = ctx !== void 0 ? each$withContext : each$noContext;
  while (true) {
    next = item[data.next];
    iterator(cb, item, i, ctx);
    if (!(item = next)) {
      break;
    }
    i += 1;
  }
  return i;
};

each$noContext = function(fn, item, i) {
  return fn(item, i);
};

each$withContext = function(fn, item, i, ctx) {
  return fn.call(ctx, item, i);
};

isAttached = function(owner) {
  return owner[bData] != null;
};

checkAttached = function(owner) {
  var data;
  if (data = owner != null ? owner[bData] : void 0) {
    return data;
  }
  throw new TypeError('use LiLL.attach() method on owner object');
};

checkItem = function(owner, item, method) {
  var _ref;
  if (!(item && ((_ref = typeof item) === 'object' || _ref === 'function'))) {
    throw new TypeError("LiLL." + method + " needs an object or function to be added");
  }
  if (!Object.isExtensible(item)) {
    throw new TypeError("LiLL." + method + " method needs an extensible item");
  }
  if (item[bOwner] && item[bOwner] !== owner) {
    throw new TypeError("LiLL cannot " + method + " item that is managed by another list");
  }
};

LiLL = {
  attach: attach,
  detach: detach,
  add: add,
  has: has,
  remove: remove,
  clear: clear,
  getHead: getHead,
  getTail: getTail,
  getNext: getNext,
  getPrevious: getPrevious,
  getSize: getSize,
  each: each,
  isAttached: isAttached
};

module.exports = Object.freeze(LiLL);

},{"es6-symbol":3}],3:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Symbol : require('./polyfill');

},{"./is-implemented":4,"./polyfill":18}],4:[function(require,module,exports){
'use strict';

module.exports = function () {
	var symbol;
	if (typeof Symbol !== 'function') return false;
	symbol = Symbol('test symbol');
	try { String(symbol); } catch (e) { return false; }
	if (typeof Symbol.iterator === 'symbol') return true;

	// Return 'true' for polyfills
	if (typeof Symbol.isConcatSpreadable !== 'object') return false;
	if (typeof Symbol.isRegExp !== 'object') return false;
	if (typeof Symbol.iterator !== 'object') return false;
	if (typeof Symbol.toPrimitive !== 'object') return false;
	if (typeof Symbol.toStringTag !== 'object') return false;
	if (typeof Symbol.unscopables !== 'object') return false;

	return true;
};

},{}],5:[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":6,"es5-ext/object/is-callable":9,"es5-ext/object/normalize-options":13,"es5-ext/string/#/contains":15}],6:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":7,"./shim":8}],7:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],8:[function(require,module,exports){
'use strict';

var keys  = require('../keys')
  , value = require('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":10,"../valid-value":14}],9:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],10:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":11,"./shim":12}],11:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],12:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],13:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],14:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],15:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":16,"./shim":17}],16:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],17:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],18:[function(require,module,exports){
'use strict';

var d = require('d')

  , create = Object.create, defineProperties = Object.defineProperties
  , generateName, Symbol;

generateName = (function () {
	var created = create(null);
	return function (desc) {
		var postfix = 0;
		while (created[desc + (postfix || '')]) ++postfix;
		desc += (postfix || '');
		created[desc] = true;
		return '@@' + desc;
	};
}());

module.exports = Symbol = function (description) {
	var symbol;
	if (this instanceof Symbol) {
		throw new TypeError('TypeError: Symbol is not a constructor');
	}
	symbol = create(Symbol.prototype);
	description = (description === undefined ? '' : String(description));
	return defineProperties(symbol, {
		__description__: d('', description),
		__name__: d('', generateName(description))
	});
};

Object.defineProperties(Symbol, {
	create: d('', Symbol('create')),
	hasInstance: d('', Symbol('hasInstance')),
	isConcatSpreadable: d('', Symbol('isConcatSpreadable')),
	isRegExp: d('', Symbol('isRegExp')),
	iterator: d('', Symbol('iterator')),
	toPrimitive: d('', Symbol('toPrimitive')),
	toStringTag: d('', Symbol('toStringTag')),
	unscopables: d('', Symbol('unscopables'))
});

defineProperties(Symbol.prototype, {
	properToString: d(function () {
		return 'Symbol (' + this.__description__ + ')';
	}),
	toString: d('', function () { return this.__name__; })
});
Object.defineProperty(Symbol.prototype, Symbol.toPrimitive, d('',
	function (hint) {
		throw new TypeError("Conversion of symbol objects is not allowed");
	}));
Object.defineProperty(Symbol.prototype, Symbol.toStringTag, d('c', 'Symbol'));

},{"d":5}],19:[function(require,module,exports){
;(function(root, factory) {

  // Support AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);

  // Support CommonJS
  } else if (typeof exports === 'object') {
    var randomColor = factory();
    
    // Support NodeJS & Component, which allow module.exports to be a function
    if (typeof module === 'object' && module && module.exports) {
      exports = module.exports = randomColor;
    }
    
    // Support CommonJS 1.1.1 spec
    exports.randomColor = randomColor;
  
  // Support vanilla script loading
  } else {
    root.randomColor = factory();
  };

}(this, function() {

  // Shared color dictionary
  var colorDictionary = {};

  // Populate the color dictionary
  loadColorBounds();

  var randomColor = function(options) {
    options = options || {};

    var H,S,B;

    // Check if we need to generate multiple colors
    if (options.count != null) {

      var totalColors = options.count,
          colors = [];

      options.count = null;

      while (totalColors > colors.length) {
        colors.push(randomColor(options));
      }

      options.count = totalColors;

      return colors;
    }

    // First we pick a hue (H)
    H = pickHue(options);

    // Then use H to determine saturation (S)
    S = pickSaturation(H, options);

    // Then use S and H to determine brightness (B).
    B = pickBrightness(H, S, options);

    // Then we return the HSB color in the desired format
    return setFormat([H,S,B], options);
  };

  function pickHue (options) {

    var hueRange = getHueRange(options.hue),
        hue = randomWithin(hueRange);

    // Instead of storing red as two seperate ranges,
    // we group them, using negative numbers
    if (hue < 0) {hue = 360 + hue}

    return hue;

  }

  function pickSaturation (hue, options) {

    if (options.luminosity === 'random') {
      return randomWithin([0,100]);
    }

    if (options.hue === 'monochrome') {
      return 0;
    }

    var saturationRange = getSaturationRange(hue);

    var sMin = saturationRange[0],
        sMax = saturationRange[1];

    switch (options.luminosity) {

      case 'bright':
        sMin = 55;
        break;

      case 'dark':
        sMin = sMax - 10;
        break;

      case 'light':
        sMax = 55;
        break;
   }

    return randomWithin([sMin, sMax]);

  }

  function pickBrightness (H, S, options) {

    var brightness,
        bMin = getMinimumBrightness(H, S),
        bMax = 100;

    switch (options.luminosity) {

      case 'dark':
        bMax = bMin + 20;
        break;

      case 'light':
        bMin = (bMax + bMin)/2;
        break;

      case 'random':
        bMin = 0;
        bMax = 100;
        break;
    }

    return randomWithin([bMin, bMax]);

  }

  function setFormat (hsv, options) {

    switch (options.format) {

      case 'hsvArray':
        return hsv;

      case 'hslArray':
        return HSVtoHSL(hsv);

      case 'hsl':
        var hsl = HSVtoHSL(hsv);
        return 'hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)';

      case 'rgbArray':
        return HSVtoRGB(hsv);

      case 'rgb':
        var rgb = HSVtoRGB(hsv);
        return 'rgb(' + rgb.join(', ') + ')';

      default:
        return HSVtoHex(hsv);
    }

  }

  function getMinimumBrightness(H, S) {

    var lowerBounds = getColorInfo(H).lowerBounds;

    for (var i = 0; i < lowerBounds.length - 1; i++) {

      var s1 = lowerBounds[i][0],
          v1 = lowerBounds[i][1];

      var s2 = lowerBounds[i+1][0],
          v2 = lowerBounds[i+1][1];

      if (S >= s1 && S <= s2) {

         var m = (v2 - v1)/(s2 - s1),
             b = v1 - m*s1;

         return m*S + b;
      }

    }

    return 0;
  }

  function getHueRange (colorInput) {

    if (typeof parseInt(colorInput) === 'number') {

      var number = parseInt(colorInput);

      if (number < 360 && number > 0) {
        return [number, number];
      }

    }

    if (typeof colorInput === 'string') {

      if (colorDictionary[colorInput]) {
        var color = colorDictionary[colorInput];
        if (color.hueRange) {return color.hueRange}
      }
    }

    return [0,360];

  }

  function getSaturationRange (hue) {
    return getColorInfo(hue).saturationRange;
  }

  function getColorInfo (hue) {

    // Maps red colors to make picking hue easier
    if (hue >= 334 && hue <= 360) {
      hue-= 360;
    }

    for (var colorName in colorDictionary) {
       var color = colorDictionary[colorName];
       if (color.hueRange &&
           hue >= color.hueRange[0] &&
           hue <= color.hueRange[1]) {
          return colorDictionary[colorName];
       }
    } return 'Color not found';
  }

  function randomWithin (range) {
    return Math.floor(range[0] + Math.random()*(range[1] + 1 - range[0]));
  }

  function HSVtoHex (hsv){

    var rgb = HSVtoRGB(hsv);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    var hex = "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

    return hex;

  }

  function defineColor (name, hueRange, lowerBounds) {

    var sMin = lowerBounds[0][0],
        sMax = lowerBounds[lowerBounds.length - 1][0],

        bMin = lowerBounds[lowerBounds.length - 1][1],
        bMax = lowerBounds[0][1];

    colorDictionary[name] = {
      hueRange: hueRange,
      lowerBounds: lowerBounds,
      saturationRange: [sMin, sMax],
      brightnessRange: [bMin, bMax]
    };

  }

  function loadColorBounds () {

    defineColor(
      'monochrome',
      null,
      [[0,0],[100,0]]
    );

    defineColor(
      'red',
      [-26,18],
      [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
    );

    defineColor(
      'orange',
      [19,46],
      [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
    );

    defineColor(
      'yellow',
      [47,62],
      [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
    );

    defineColor(
      'green',
      [63,178],
      [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
    );

    defineColor(
      'blue',
      [179, 257],
      [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
    );

    defineColor(
      'purple',
      [258, 282],
      [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
    );

    defineColor(
      'pink',
      [283, 334],
      [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
    );

  }

  function HSVtoRGB (hsv) {

    // this doesn't work for the values of 0 and 360
    // here's the hacky fix
    var h = hsv[0];
    if (h === 0) {h = 1}
    if (h === 360) {h = 359}

    // Rebase the h,s,v values
    h = h/360;
    var s = hsv[1]/100,
        v = hsv[2]/100;

    var h_i = Math.floor(h*6),
      f = h * 6 - h_i,
      p = v * (1 - s),
      q = v * (1 - f*s),
      t = v * (1 - (1 - f)*s),
      r = 256,
      g = 256,
      b = 256;

    switch(h_i) {
      case 0: r = v, g = t, b = p;  break;
      case 1: r = q, g = v, b = p;  break;
      case 2: r = p, g = v, b = t;  break;
      case 3: r = p, g = q, b = v;  break;
      case 4: r = t, g = p, b = v;  break;
      case 5: r = v, g = p, b = q;  break;
    }
    var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
    return result;
  }

  function HSVtoHSL (hsv) {
    var h = hsv[0],
      s = hsv[1]/100,
      v = hsv[2]/100,
      k = (2-s)*v;

    return [
      h,
      Math.round(s*v / (k<1 ? k : 2-k) * 10000) / 100,
      k/2 * 100
    ];
  }

  return randomColor;
}));

},{}],20:[function(require,module,exports){
;(function inject(clean, precision, undef) {

  var isArray = function (a) {
    return Object.prototype.toString.call(a) === "[object Array]";
  };

  var defined = function(a) {
    return a !== undef;
  };

  function Vec2(x, y) {
    if (!(this instanceof Vec2)) {
      return new Vec2(x, y);
    }

    if (isArray(x)) {
      y = x[1];
      x = x[0];
    } else if('object' === typeof x && x) {
      y = x.y;
      x = x.x;
    }

    this.x = Vec2.clean(x || 0);
    this.y = Vec2.clean(y || 0);
  }

  Vec2.prototype = {
    change : function(fn) {
      if (typeof fn === 'function') {
        if (this.observers) {
          this.observers.push(fn);
        } else {
          this.observers = [fn];
        }
      } else if (this.observers && this.observers.length) {
        for (var i=this.observers.length-1; i>=0; i--) {
          this.observers[i](this, fn);
        }
      }

      return this;
    },

    ignore : function(fn) {
      if (this.observers) {
        if (!fn) {
          this.observers = [];
        } else {
          var o = this.observers, l = o.length;
          while(l--) {
            o[l] === fn && o.splice(l, 1);
          }
        }
      }
      return this;
    },

    // set x and y
    set: function(x, y, notify) {
      if('number' != typeof x) {
        notify = y;
        y = x.y;
        x = x.x;
      }

      if(this.x === x && this.y === y) {
        return this;
      }

      var orig = null;
      if (notify !== false && this.observers && this.observers.length) {
        orig = this.clone();
      }

      this.x = Vec2.clean(x);
      this.y = Vec2.clean(y);

      if(notify !== false) {
        return this.change(orig);
      }
    },

    // reset x and y to zero
    zero : function() {
      return this.set(0, 0);
    },

    // return a new vector with the same component values
    // as this one
    clone : function() {
      return new (this.constructor)(this.x, this.y);
    },

    // negate the values of this vector
    negate : function(returnNew) {
      if (returnNew) {
        return new (this.constructor)(-this.x, -this.y);
      } else {
        return this.set(-this.x, -this.y);
      }
    },

    // Add the incoming `vec2` vector to this vector
    add : function(x, y, returnNew) {

      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      }

      x += this.x;
      y += this.y;


      if (!returnNew) {
        return this.set(x, y);
      } else {
        // Return a new vector if `returnNew` is truthy
        return new (this.constructor)(x, y);
      }
    },

    // Subtract the incoming `vec2` from this vector
    subtract : function(x, y, returnNew) {
      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      }

      x = this.x - x;
      y = this.y - y;

      if (!returnNew) {
        return this.set(x, y);
      } else {
        // Return a new vector if `returnNew` is truthy
        return new (this.constructor)(x, y);
      }
    },

    // Multiply this vector by the incoming `vec2`
    multiply : function(x, y, returnNew) {
      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      } else if (typeof y != 'number') {
        returnNew = y;
        y = x;
      }

      x *= this.x;
      y *= this.y;

      if (!returnNew) {
        return this.set(x, y);
      } else {
        return new (this.constructor)(x, y);
      }
    },

    // Rotate this vector. Accepts a `Rotation` or angle in radians.
    //
    // Passing a truthy `inverse` will cause the rotation to
    // be reversed.
    //
    // If `returnNew` is truthy, a new
    // `Vec2` will be created with the values resulting from
    // the rotation. Otherwise the rotation will be applied
    // to this vector directly, and this vector will be returned.
    rotate : function(r, inverse, returnNew) {
      var
      x = this.x,
      y = this.y,
      cos = Math.cos(r),
      sin = Math.sin(r),
      rx, ry;

      inverse = (inverse) ? -1 : 1;

      rx = cos * x - (inverse * sin) * y;
      ry = (inverse * sin) * x + cos * y;

      if (returnNew) {
        return new (this.constructor)(rx, ry);
      } else {
        return this.set(rx, ry);
      }
    },

    // Calculate the length of this vector
    length : function() {
      var x = this.x, y = this.y;
      return Math.sqrt(x * x + y * y);
    },

    // Get the length squared. For performance, use this instead of `Vec2#length` (if possible).
    lengthSquared : function() {
      var x = this.x, y = this.y;
      return x*x+y*y;
    },

    // Return the distance betwen this `Vec2` and the incoming vec2 vector
    // and return a scalar
    distance : function(vec2) {
      var x = this.x - vec2.x;
      var y = this.y - vec2.y;
      return Math.sqrt(x*x + y*y);
    },

    // Given Array of Vec2, find closest to this Vec2.
    nearest : function(others) {
      var
      shortestDistance = Number.MAX_VALUE,
      nearest = null,
      currentDistance;

      for (var i = others.length - 1; i >= 0; i--) {
        currentDistance = this.distance(others[i]);
        if (currentDistance <= shortestDistance) {
          shortestDistance = currentDistance;
          nearest = others[i];
        }
      }

      return nearest;
    },

    // Convert this vector into a unit vector.
    // Returns the length.
    normalize : function(returnNew) {
      var length = this.length();

      // Collect a ratio to shrink the x and y coords
      var invertedLength = (length < Number.MIN_VALUE) ? 0 : 1/length;

      if (!returnNew) {
        // Convert the coords to be greater than zero
        // but smaller than or equal to 1.0
        return this.set(this.x * invertedLength, this.y * invertedLength);
      } else {
        return new (this.constructor)(this.x * invertedLength, this.y * invertedLength);
      }
    },

    // Determine if another `Vec2`'s components match this one's
    // also accepts 2 scalars
    equal : function(v, w) {
      if (typeof v != 'number') {
        if (isArray(v)) {
          w = v[1];
          v = v[0];
        } else {
          w = v.y;
          v = v.x;
        }
      }

      return (Vec2.clean(v) === this.x && Vec2.clean(w) === this.y);
    },

    // Return a new `Vec2` that contains the absolute value of
    // each of this vector's parts
    abs : function(returnNew) {
      var x = Math.abs(this.x), y = Math.abs(this.y);

      if (returnNew) {
        return new (this.constructor)(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the smallest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    min : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx < vx ? tx : vx,
      y = ty < vy ? ty : vy;

      if (returnNew) {
        return new (this.constructor)(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the largest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    max : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx > vx ? tx : vx,
      y = ty > vy ? ty : vy;

      if (returnNew) {
        return new (this.constructor)(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Clamp values into a range.
    // If this vector's values are lower than the `low`'s
    // values, then raise them.  If they are higher than
    // `high`'s then lower them.
    //
    // Passing returnNew as true will cause a new Vec2 to be
    // returned.  Otherwise, this vector's values will be clamped
    clamp : function(low, high, returnNew) {
      var ret = this.min(high, true).max(low);
      if (returnNew) {
        return ret;
      } else {
        return this.set(ret.x, ret.y);
      }
    },

    // Perform linear interpolation between two vectors
    // amount is a decimal between 0 and 1
    lerp : function(vec, amount, returnNew) {
      return this.add(vec.subtract(this, true).multiply(amount), returnNew);
    },

    // Get the skew vector such that dot(skew_vec, other) == cross(vec, other)
    skew : function(returnNew) {
      if (!returnNew) {
        return this.set(-this.y, this.x)
      } else {
        return new (this.constructor)(-this.y, this.x);
      }
    },

    // calculate the dot product between
    // this vector and the incoming
    dot : function(b) {
      return Vec2.clean(this.x * b.x + b.y * this.y);
    },

    // calculate the perpendicular dot product between
    // this vector and the incoming
    perpDot : function(b) {
      return Vec2.clean(this.x * b.y - this.y * b.x);
    },

    // Determine the angle between two vec2s
    angleTo : function(vec) {
      return Math.atan2(this.perpDot(vec), this.dot(vec));
    },

    // Divide this vector's components by a scalar
    divide : function(x, y, returnNew) {
      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      } else if (typeof y != 'number') {
        returnNew = y;
        y = x;
      }

      if (x === 0 || y === 0) {
        throw new Error('division by zero')
      }

      if (isNaN(x) || isNaN(y)) {
        throw new Error('NaN detected');
      }

      if (returnNew) {
        return new (this.constructor)(this.x / x, this.y / y);
      }

      return this.set(this.x / x, this.y / y);
    },

    isPointOnLine : function(start, end) {
      return (start.y - this.y) * (start.x - end.x) ===
             (start.y - end.y) * (start.x - this.x);
    },

    toArray: function() {
      return [this.x, this.y];
    },

    fromArray: function(array) {
      return this.set(array[0], array[1]);
    },
    toJSON: function () {
      return {x: this.x, y: this.y};
    },
    toString: function() {
      return '(' + this.x + ', ' + this.y + ')';
    },
    constructor : Vec2
  };

  Vec2.fromArray = function(array, ctor) {
    return new (ctor || Vec2)(array[0], array[1]);
  };

  // Floating point stability
  Vec2.precision = precision || 8;
  var p = Math.pow(10, Vec2.precision);

  Vec2.clean = clean || function(val) {
    if (isNaN(val)) {
      throw new Error('NaN detected');
    }

    if (!isFinite(val)) {
      throw new Error('Infinity detected');
    }

    if(Math.round(val) === val) {
      return val;
    }

    return Math.round(val * p)/p;
  };

  Vec2.inject = inject;

  if(!clean) {
    Vec2.fast = inject(function (k) { return k; });

    // Expose, but also allow creating a fresh Vec2 subclass.
    if (typeof module !== 'undefined' && typeof module.exports == 'object') {
      module.exports = Vec2;
    } else {
      window.Vec2 = window.Vec2 || Vec2;
    }
  }
  return Vec2;
})();

},{}]},{},[1]);
