module PF {
    export class Agent extends RadialPotentialField {

        static DEFAULT_TRAIL_LENGTH: number = 0;

        subtractSelfPotentialFromDynamicsMapSum: boolean;

        private _cachedPoint: Point;
        private _mapTilesWidth: number;
        private _mapTilesHeight: number;

        private _staticPotentialsMaps: Array<StaticPotentialsMap>;           // lazy initialized
        private _dynamicPotentialsMaps: Array<DynamicPotentialsMap>;         // lazy initialized
        private _staticPotentialsMapsEnabe: Array<boolean>;
        private _dynamicPotentialsMapsEnabe: Array<boolean>;
        private _trails: LinkedList;

        trailLength: number = Agent.DEFAULT_TRAIL_LENGTH;

        debugDrawColor: number;

        constructor(static_potentials_map: Array<StaticPotentialsMap> = null, dynamic_potentials_map: Array<DynamicPotentialsMap> = null, subtract_self_potential_from_dynamic_maps_sum: boolean = true) {
            super();
            this._cachedPoint = new Point();
            this._mapTilesWidth = (static_potentials_map) ? static_potentials_map[0].getTilesWidth() : 0;
            this._mapTilesHeight = (static_potentials_map) ? static_potentials_map[0].getTilesHeight() : 0;
            this._staticPotentialsMaps = static_potentials_map;
            this._dynamicPotentialsMaps = dynamic_potentials_map;
            this._trails = new LinkedList();
            this.subtractSelfPotentialFromDynamicsMapSum = subtract_self_potential_from_dynamic_maps_sum;

            this.debugDrawColor = 0xFF000000;
        }

        addStaticPotentialsMap(value: StaticPotentialsMap): void {
            if (this._mapTilesWidth > 0 && this._mapTilesHeight > 0) {
                if (this._mapTilesWidth != value.getTilesWidth() || this._mapTilesHeight != value.getTilesHeight())
                    throw new Error("All potentials maps should have the same tilesWidth and tilesHeight!");
            }
            else {
                this._mapTilesWidth = value.getTilesWidth();
                this._mapTilesHeight = value.getTilesHeight();
            }

            if (!this._staticPotentialsMaps) {
                this._staticPotentialsMaps = new Array<StaticPotentialsMap>();
                this._staticPotentialsMapsEnabe = new Array<boolean>();
            }
            this._staticPotentialsMaps.push(value);
            this._staticPotentialsMapsEnabe.push(true);
        }

        removeAllStaticPotentialsMaps(): void {
            this._staticPotentialsMaps = null;
            this._staticPotentialsMapsEnabe = null;
            if (!this._dynamicPotentialsMaps) this._mapTilesWidth = this._mapTilesHeight = 0;
        }

        addDynamicPotentialsMap(value: DynamicPotentialsMap): void {
            if (this._mapTilesWidth > 0 && this._mapTilesHeight > 0) {
                if (this._mapTilesWidth != value.getTilesWidth() || this._mapTilesHeight != value.getTilesHeight())
                    throw new Error("All potentials maps should have the same tilesWidth and tilesHeight!");
            }
            else {
                this._mapTilesWidth = value.getTilesWidth();
                this._mapTilesHeight = value.getTilesHeight();
            }

            if (!this._dynamicPotentialsMaps) {
                this._dynamicPotentialsMaps = new Array<DynamicPotentialsMap>();
                this._dynamicPotentialsMapsEnabe = new Array<boolean>();
            }
            this._dynamicPotentialsMaps.push(value);
            this._dynamicPotentialsMapsEnabe.push(true);
        }

        removeAllDynamicPotentialsMaps(): void {
            this._dynamicPotentialsMaps = null;
            this._dynamicPotentialsMapsEnabe = null;
            if (!this._staticPotentialsMaps) this._mapTilesWidth = this._mapTilesHeight = 0;
        }

        getStaticPotentialsMaps(): Array<StaticPotentialsMap> {
            return this._staticPotentialsMaps;
        }

        getDynamicPotentialsMaps(): Array<DynamicPotentialsMap> {
            return this._dynamicPotentialsMaps;
        }

        enableStaticPotentialMap(map_index: number, enabled: boolean): void {
            if (this._staticPotentialsMaps)
                this._staticPotentialsMapsEnabe[map_index] = enabled;
        }

        enableDynamicPotentialMap(map_index: number, enabled: boolean): void {
            if (this._dynamicPotentialsMaps)
                this._dynamicPotentialsMapsEnabe[map_index] = enabled;
        }

        isStaticPotentialMapEnabled(map_index: number): boolean {
            return this._staticPotentialsMapsEnabe[map_index];
        }

        isDynamicPotentialMapEnabled(map_index: number): boolean {
            return this._dynamicPotentialsMapsEnabe[map_index];
        }

        /**
         * Zwraca wartosc potencjalu generowanego przez tego agenta w zadanym punkcie mapy.
         * @param map_x
         * @param map_y
         * @return
         */
        getPotentialByMap(map_x: number, map_y: number): number {
            return this.getLocalPotential(map_x - this.position.x, map_y - this.position.y);
        }

        private getTrailPotential(map_x: number, map_y: number): number {
            var potential: number = 0;
            for (var trail: LinkedListNode = this._trails.head; trail; trail = trail.next) {
                var pfaTrail: AgentTrail = <AgentTrail>trail;
                if (pfaTrail.worldX == map_x && pfaTrail.worldY == map_y) {
                    potential += pfaTrail.potential;
                }
            }
            return potential;
        }

        private staticPotentialsSum(map_x: number, map_y: number): number {
            if (!this._staticPotentialsMaps) return 0;
            var sum: number = 0;
            var len: number = this._staticPotentialsMaps.length;
            for (var i: number = 0; i < len; i++) {
                if (this._staticPotentialsMapsEnabe[i]) {
                    sum += this._staticPotentialsMaps[i].getPotential(map_x, map_y);
                }
            }
            return sum;
        }

        private dynamicPotentialsSum(map_x: number, map_y: number): number {
            if (!this._dynamicPotentialsMaps) return 0;
            var sum: number = 0;
            var len: number = this._dynamicPotentialsMaps.length;
            for (var i: number = 0; i < len; i++) {
                if (this._dynamicPotentialsMapsEnabe[i]) {
                    sum += this._dynamicPotentialsMaps[i].getPotential(map_x, map_y);
                }
            }
            return sum;
        }

        nextPosition(x_order: number = 1, y_order: number = 1): Point {
            this._cachedPoint.setTo(this.position.x, this.position.y);

            var staticPotential: number = this.staticPotentialsSum(this.position.x, this.position.y);
            var agentsPotential: number = this.dynamicPotentialsSum(this.position.x, this.position.y);
            var selfPotential: number = this.getPotentialByMap(this.position.x, this.position.y);
            var trailPotential: number = this.getTrailPotential(this.position.x, this.position.y);

            var bestAttractPotential: number = staticPotential + agentsPotential - (this.subtractSelfPotentialFromDynamicsMapSum ? selfPotential : 0) + trailPotential;

            for (var x: number = -1; x <= 1; x++) {
                var xx: number = this.position.x + x * x_order;
                if (xx >= 0 && xx < this._mapTilesWidth) {

                    for (var y: number = -1; y <= 1; y++) {
                        if (x == 0 && y == 0) {
                            continue;
                        }

                        var yy: number = this.position.y + y * y_order;
                        if (yy >= 0 && yy < this._mapTilesHeight) {
                            var comparingPotential: number = this.staticPotentialsSum(xx, yy) + this.dynamicPotentialsSum(xx, yy) - (this.subtractSelfPotentialFromDynamicsMapSum ? this.getPotentialByMap(xx, yy) : 0) + this.getTrailPotential(xx, yy);

                            if (comparingPotential < bestAttractPotential) {
                                bestAttractPotential = comparingPotential;
                                this._cachedPoint.setTo(xx, yy);
                            }
                        }
                    }
                }
            }

            if (this._cachedPoint.x == this.position.x && this._cachedPoint.y == this.position.y) {
                //return this._cachedPoint;
                if (this._trails.length > this.trailLength) {// zapewnia stala dlugosc listy sladow i reuzywa ponownie starego sladu
                    var recycledTrail: AgentTrail = <AgentTrail>this._trails.head;
                    this._trails.removeNode(recycledTrail);// usuwa go z poczatku listy
                    recycledTrail.worldX = this.position.x;
                    recycledTrail.worldY = this.position.y;
                    this._trails.appendNode(recycledTrail);// dodaje go na koniec listy
                }
                else if (this.trailLength > 0) {
                    this._trails.appendNode(new AgentTrail(this.position.x, this.position.y, this.type * this.getPotential()));
                }
                this._cachedPoint.setTo(this.position.x, this.position.y);
            }
            return this._cachedPoint;
        }

        setTrailLength(value: number): void {
            while (value < this._trails.length) {
                this._trails.fetchHead();
            }
            this.trailLength = value;
        }

        moveToPositionPoint(p: Point): void {
            this.moveToPosition(p.x, p.y);
        }

        moveToPosition(new_x: number, new_y: number): void {
            this.position.x = new_x;
            this.position.y = new_y;
        }
    }

    export class AgentTrail extends LinkedListNode {

        worldX: number;
        worldY: number;
        potential: number;

        constructor(world_x: number, world_y: number, potential: number) {
            super();
            this.worldX = world_x;
            this.worldY = world_y;
            this.potential = potential;
        }
    }
}
