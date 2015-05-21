module Wonder {
    export class Random {
        private xg: XorGen;

        constructor(seed: string) {
            this.xg = new XorGen(seed);
        }

        nextUInt(): number {
            return this.xg.next();
        }

        nextRange(a: number, b: number, round: boolean = true): number {
            var range: number = Math.abs(b - a);
            range = range * this.prng();
            return round ? Math.round(range + a) : range + a;
        }

        nextBoolean(): boolean {
            return this.prng() > 0.5;
        }

        prng(): number {
            return (this.xg.next() >>> 0) / ((1 << 30) * 4);
        }

        shuffle(arr: Array<any>, copy: boolean = false): Array<any> {
            var collection = arr,
                len = arr.length,
                random,
                temp;

            if (copy === true) collection = arr.slice();
            while (len) {
                random = Math.floor(this.prng() * len);
                len -= 1;
                temp = collection[len];
                collection[len] = collection[random];
                collection[random] = temp;
            }

            return collection;
        }
    }

    class XorGen {
        x: number = 0;
        y: number = 0;
        z: number = 0;
        w: number = 0;
        strseed: string = '';

        constructor(seed: string) {
            this.strseed = seed;
            for (var k = 0; k < this.strseed.length + 64; k++) {
                this.x ^= this.strseed.charCodeAt(k) | 0;
                this.next();
            }
        }

        next(): number {
            var t = this.x ^ (this.x << 11);
            this.x = this.y;
            this.y = this.z;
            this.z = this.w;
            return this.w ^= (this.w >>> 19) ^ t ^ (t >>> 8);
        }
    }



    //some useful math functions
    export class Vec2 {
        x: number;
        y: number;

        constructor(x: number = 0, y: number = 0) {
            this.x = x;
            this.y = y;
        }

        add(v: Vec2): Vec2 {
            return new Vec2(v.x + this.x, v.y + this.y);
        }

        sub(v: Vec2): Vec2 {
            return new Vec2(this.x - v.x, this.y - v.y);
        }

        mul(m: number): Vec2 {
            return new Vec2(this.x * m, this.y * m);
        }

        div(d: number): Vec2 {
            return new Vec2(this.x / d, this.y / d);
        }

        angle(): number {
            return 0;
        }

        normalize(): Vec2 {
            return Wonder.normalize(this.x, this.y);
        }
    }

    export function distance(ax: number, ay: number, bx: number, by: number): number {
        var dx = ax - bx;
        var dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    export function length(x: number, y: number): number {
        return Math.sqrt(x * x + y * y);
    }

    export function normalize(x: number, y: number): Vec2 {
        if (x === 0 && y === 0) return new Vec2(0, 0);

        var len: number = length(x, y);
        return new Vec2(x / len, y / len);
    }
}
