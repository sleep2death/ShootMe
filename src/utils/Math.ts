module Wonder{
    export class Random {
        private xg: XorGen;

        constructor(seed: string) {
            this.xg = new XorGen(seed);
        }

        nextUInt(): number {
            return this.xg.next();
        }

        nextRange(a: number, b: number) {
            var range: number = Math.abs(b - a);
            range = range * this.prng();
            return Math.round(range + a);
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
}
