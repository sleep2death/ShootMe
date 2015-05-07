module PF {
    export class DynamicPotentialsMap {

        private _tilesWidth: number;
        private _tilesHeight: number;

        private _fields: LinkedList;

        constructor(tiles_width: number, tiles_height: number) {
            this._fields = new LinkedList();
            this._tilesWidth = tiles_width;
            this._tilesHeight = tiles_height;
        }

        getTilesWidth(): number {
            return this._tilesWidth;
        }

        getTilesHeight(): number {
            return this._tilesHeight;
        }

        addPotentialField(field: PotentialField): void {
            this._fields.appendNode(field);
        }

        removePotentialField(field: PotentialField): void {
            this._fields.removeNode(field);
        }

        removeAllPotentialFields(): void {
            this._fields.removeAllNodes()
        }

        getPotential(map_x: number, map_y: number): number {
            var potential: number = 0;
            for (var field: PotentialField = (<PotentialField>this._fields.head); field; field = (<PotentialField>field.next)) {
                potential += field.getLocalPotential(map_x - field.position.x, map_y - field.position.y);
            }
            return potential;
        }

        public debugDraw(game: Phaser.Game, graphics: Phaser.Sprite) {
            while (graphics.children.length > 0) {
                var child: Phaser.Text = <Phaser.Text>graphics.getChildAt(0);
                child.destroy();
            }
            var potential: number = 0;
            for (var field: PotentialField = (<PotentialField>this._fields.head); field; field = (<PotentialField>field.next)) {
            }
        }
    }

    export class StaticPotentialsMap {

        private _cachedPoint: Point;
        private _tilesWidth: number;
        private _tilesHeight: number;

        private _map: Array<Array<number>>;

        constructor(tiles_width: number, tiles_height: number) {
            this._cachedPoint = new Point();
            this._tilesWidth = tiles_width;
            this._tilesHeight = tiles_height;

            this._map = new Array<Array<number>>(tiles_width);
            for (var col: number = 0; col < tiles_width; col++) {
                this._map[col] = new Array<number>(tiles_height);
                for (var row: number = 0; row < tiles_height; row++) {
                    this._map[col][row] = 0;
                }
            }
        }

        getTilesWidth(): number {
            return this._tilesWidth;
        }

        getTilesHeight(): number {
            return this._tilesHeight;
        }

        addPotentialField(field: PotentialField): void {
            this.addPotentail(field, 1);
        }

        removePotentialField(field: PotentialField): void {
            this.addPotentail(field, -1);
        }
        getPotential(x: number, y: number): number {
            return this._map[x][y];
        }

        private addPotentail(field: PotentialField, multiplier: number): void {
            for (var x: number = Math.max(0, field.position.x - field.getPotentialBoundsHalfWidth()); x <= Math.min(this._tilesWidth - 1, field.position.x + field.getPotentialBoundsHalfWidth()); x++) {
                for (var y: number = Math.max(0, field.position.y - field.getPotentialBoundsHalfHeight()); y <= Math.min(this._tilesHeight - 1, field.position.y + field.getPotentialBoundsHalfHeight()); y++) {
                    var local: number = field.getLocalPotential(x - field.position.x, y - field.position.y);
                    this._map[x][y] += multiplier * field.getLocalPotential(x - field.position.x, y - field.position.y);
                }
            }
        }

        public debugDraw(game: Phaser.Game, graphics: Phaser.Graphics) {
            graphics.clear();

            for (var x: number = 0; x < this._tilesWidth; x++) {
                for (var y: number = 0; y < this._tilesHeight; y++) {
                    if (this._map[x][y] != 0) {
                        graphics.beginFill(0xFF0000, 0.5);
                        graphics.drawRect(x * Grid.CELL_SIZE, y * Grid.CELL_SIZE, Grid.CELL_SIZE, Grid.CELL_SIZE);
                        graphics.endFill();
                    }
                }
            }

            graphics.cacheAsBitmap = true;
        }
    }
}
