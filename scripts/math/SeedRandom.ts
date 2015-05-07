module Seed {
    export class SeedRandom {
        private xg: XorGen;
        constructor(seed: string) {
            this.xg = new XorGen(seed);
        }

        prng(): number {
            return (this.xg.next() >>> 0) / ((1 << 30) * 4);
        }
    }

    export class XorGen {
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
}
