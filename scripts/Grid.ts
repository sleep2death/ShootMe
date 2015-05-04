class Grid {
    static CELL_SIZE = 16;

    private _col: number = 0;
    private _row: number = 0;
    private _widthPx: number = 0;
    private _heightPx: number = 0;

    private map: Array<Array<number>> = new Array<Array<number>>();

    getCol(): number {
        return this._col;
    }

    getRow(): number {
        return this._row;
    }

    getCenterX(): number {
        return Math.floor(this._col * 0.5);
    }

    getCenterY(): number {
        return Math.floor(this._row * 0.5);
    }

    getGridX(x: number): number {
        var mx = Math.floor(x / Grid.CELL_SIZE);
        mx = Math.max(0, mx);
        mx = Math.min(this._col - 1, mx);
        return mx;
    }

    getGridY(y: number): number {
        var my = Math.floor(y / Grid.CELL_SIZE);
        my = Math.max(0, my);
        my = Math.min(this._row - 1, my);
        return my;
    }

    constructor(w: number, h: number) {
        this.buildCells(w, h);
    }

    buildCells(w: number, h: number) {
        this._col = Math.ceil(w / Grid.CELL_SIZE);
        this._row = Math.ceil(h / Grid.CELL_SIZE);
        this._widthPx = this._col * Grid.CELL_SIZE;
        this._heightPx = this._col * Grid.CELL_SIZE;

        this.map = new Array<Array<number>>(this._col);
        for (var col: number = 0; col < this._col; col++) {
            this.map[col] = new Array<number>(this._row);
            for (var row = 0; row < this._row; row++) {
                this.map[col][row] = 0;
            }
        }
    }

    toString() {
        return "col:" + this._col + " row:" + this._row;
    }

    debugDraw(graphics: Phaser.Graphics) {
        var g: Phaser.Graphics = graphics;
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
    }
}
