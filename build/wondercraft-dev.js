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
    var RandomColor = require("randomcolor");
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
            this.squads = [];
            this.frameCount = 0;
            this.id = id;
        }
        Team.prototype.update = function () {
            var len = this.getSquadsNumber();
            for (var i = 0; i < len; i++) {
                var squad = this.squads[i];
                squad.hero.update(Wonder.FRAMERATE);
                var l = squad.units.length;
                for (var j = 0; j < l; j++) {
                    var unit = squad.units[j];
                    unit.update(Wonder.FRAMERATE);
                }
            }
            this.frameCount++;
            if (this.frameCount === 60)
                this.frameCount = 0;
        };
        Team.prototype.render = function () {
            var len = this.getSquadsNumber();
            for (var i = 0; i < len; i++) {
                var squad = this.squads[i];
                squad.hero.render(Wonder.FRAMERATE);
                var l = squad.units.length;
                for (var j = 0; j < l; j++) {
                    var unit = squad.units[j];
                    unit.render(Wonder.FRAMERATE);
                }
            }
        };
        Team.prototype.getSquadsNumber = function () {
            return this.squads.length;
        };
        Team.prototype.addSquad = function (squad) {
            squad.team = this;
            this.squads.push(squad);
        };
        return Team;
    })();
    Wonder.Team = Team;
    var Squad = (function () {
        function Squad(id, debug_color) {
            this.units = [];
            this.id = id;
            this.debug_color = debug_color;
        }
        Squad.prototype.setHero = function (hero) {
            this.hero = hero;
            hero.squad = this;
        };
        Squad.prototype.getUnitsNumber = function () {
            return this.units.length;
        };
        Squad.prototype.addUnit = function (unit) {
            unit.squad = this;
            unit.team = this.team;
            this.units.push(unit);
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
        var len = team.getSquadsNumber();
        var squad_w = 1334 / 16;
        var squad_h = (750 - 200) / 5;
        var unit_radius = 12;
        var hero_radius = 16;
        var padding = 4;
        for (var i = 0; i < len; i++) {
            var squad = team.squads[i];
            var s_col = side == 0 ? squad.position % 4 : 3 - (squad.position % 4);
            var s_row = Math.floor(squad.position / 4);
            var s_x = side == 0 ? s_col * squad_w + squad_w : 1334 - (s_col * squad_w + squad_w);
            var s_y = s_row * squad_h + squad_h * 0.5 + 100;
            addDebugShape(game, squad.hero, hero_radius, squad.debug_color, side);
            squad.hero.agent.x = squad.hero.displayer.x = s_x;
            squad.hero.agent.y = squad.hero.displayer.y = s_y;
            var l = squad.getUnitsNumber();
            var pos = 0;
            var start_x = side == 0 ? s_x - hero_radius - padding : s_x + hero_radius + padding;
            var start_y = s_y - 2 * (unit_radius + padding);
            for (var j = 0; j < l; j++) {
                var unit = squad.units[j];
                var u_x = side == 0 ? start_x - Math.floor(pos / 5) * (unit_radius + padding) : start_x + Math.floor(pos / 5) * (unit_radius + padding);
                var u_y = start_y + pos % 5 * (unit_radius + padding);
                addDebugShape(game, unit, unit_radius, squad.debug_color, side);
                unit.agent.x = unit.displayer.x = u_x;
                unit.agent.y = unit.displayer.y = u_y;
                pos++;
            }
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
            this.agent = new Wonder.UnitAgent(this);
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
            if (this.target === this.squad.hero)
                this.follow();
            this.agent.x += this.agent.velocity.x;
            this.agent.y += this.agent.velocity.y;
        };
        Unit.prototype.follow = function () {
            var hero = this.squad.hero;
            var hero_v = this.squad.hero.agent.velocity;
            if (this.squad.team.frameCount % 10 === 0) {
                var seed = this.squad.team.seed;
                this.randomFollow.x = seed.nextRange(-0.15, 0.15, false);
                this.randomFollow.y = seed.nextRange(-0.15, 0.15, false);
            }
            this.agent.velocity = hero_v.add(this.randomFollow);
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
            this.agent = new Wonder.HeroAgent(this);
        };
        Hero.prototype.move = function () {
            this.isMoving = true;
            this.isAttacking = false;
            var dx = this.target.agent.x - this.agent.x;
            var dy = this.target.agent.y - this.agent.y;
            var vec2 = Wonder.normalize(dx, dy);
            this.agent.velocity = vec2.mul(2);
            if (this.squad.team.frameCount % 12 === 0) {
                var team = this.squad.team;
                var len = team.getSquadsNumber();
                var neighboursCount = 0;
                for (var i = 0; i < len; i++) {
                    var neighbour = team.squads[i];
                    if (!neighbour.hero.isDead && !neighbour.hero.isMoving) {
                        var d = Wonder.getUnitDistance(neighbour.hero, this);
                        if (d <= 120) {
                            dx = this.agent.x - neighbour.hero.agent.x;
                            dy = this.agent.y - neighbour.hero.agent.y;
                            this.separation.x += dx != 0 ? 1 / dx : 0;
                            this.separation.y += dy != 0 ? 1 / dy : 0;
                            neighboursCount++;
                        }
                    }
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
        return Hero;
    })(Unit);
    Wonder.Hero = Hero;
})(Wonder || (Wonder = {}));
var Wonder;
(function (Wonder) {
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
            if (this.unit.isIdle()) {
                this.unit.target = this.unit.squad.hero;
                this.unit.move();
                return;
            }
            if (this.unit.target && this.unit.isMoving) {
                if (this.unit.squad.hero.isMoving) {
                    this.unit.move();
                }
                else if (this.unit.squad.hero.isAttacking) {
                    findTargetFromSquad(this.unit, this.unit.squad.hero.target.squad);
                }
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
                return;
            }
            if (this.unit.target && this.unit.isMoving) {
                if (outOfRange(this.unit, this.unit.target)) {
                    this.unit.move();
                }
                else {
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
    Wonder.getUnitDistance = getUnitDistance;
    function findNearestHero(hero) {
        var distance = Infinity;
        var nearest = null;
        var enemy = hero.squad.team.enemy;
        var len = enemy.getSquadsNumber();
        for (var i = 0; i < len; i++) {
            var e_squad = enemy.squads[i];
            if (!e_squad.hero.isDead) {
                var d = getUnitDistance(e_squad.hero, hero);
                if (d < distance) {
                    distance = d;
                    nearest = e_squad.hero;
                }
            }
            else {
            }
        }
        return nearest;
    }
    function outOfRange(attacker, target) {
        var d = getUnitDistance(attacker, target);
        if (d < attacker.range)
            return false;
        return true;
    }
    function findTargetFromSquad(unit, squad) {
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
        this.update = function (game) {
            _this.teamA.update();
            _this.teamB.update();
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
},{"randomcolor":2}],2:[function(require,module,exports){
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

},{}]},{},[1]);
