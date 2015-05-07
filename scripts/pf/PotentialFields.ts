module PF {
    export class PotentialField extends LinkedListNode {
        static PF_TYPE_ATTRACT: number = -1;
        static PF_TYPE_REPEL: number = 1;

        position: Point;
        type: number;

        constructor() {
            super();
            this.position = new Point(0, 0);
            this.type = PotentialField.PF_TYPE_REPEL;
        }

        getPotentialBoundsHalfWidth(): number {
            throw new Error("Method is abstract, override it in inherited class!");
            return 0;
        }

        getPotentialBoundsHalfHeight(): number {
            throw new Error("Method is abstract, override it in inherited class!");
            return 0;
        }

        getLocalPotential(local_x: number, local_y: number): number {
            throw new Error("Method is abstract, override it in inherited class!");
            return 0;
        }
    }

    export class RadialPotentialField extends PotentialField {
        private _potential: number;

        getPotential(): number {
            return this._potential;
        }

        setPotential(value: number) {
            this._potential = value;
            this.updateRadius();
        }

        private _gradation: number;

        getGradation(): number {
            return this._gradation;
        }

        setGradation(value: number) {
            this._gradation = value;
            this.updateRadius();
        }

        private _radius: number;

        getRadius(): number {
            return this._radius;
        }

        constructor() {
            super();
            this._potential = 1;
            this._gradation = 1;
            this.updateRadius();
        }

        private updateRadius(): void {
            this._radius = Math.ceil(this._potential / this._gradation) - 1;
        }

        getPotentialBoundsHalfWidth(): number {
            return this._radius;
        }

        getPotentialBoundsHalfHeight(): number {
            return this._radius;
        }

        getLocalPotential(local_x: number, local_y: number): number {
            var distance: number = Math.abs(local_x) + Math.abs(local_y);// manhattan distance
            if (distance > this._radius) return 0;

            if (this.type < 0) return Math.min(0, this.type * (this._potential - this._gradation * distance));
            return Math.max(0, this.type * (this._potential - this._gradation * distance));
        }
    }

    export class RectangularPotentialField extends PotentialField {

        private _potential: number;

        private _gradation: number;

        private _maxPotentialHalfWidth: number;
        private _maxPotentialHalfHeight: number;

        private _boundsHalfWidth: number;
        private _boundsHalfHeight: number;

        constructor(max_potential_half_width: number, max_potential_half_height: number) {
            super();
            this._potential = 1;
            this._gradation = 1;
            this._maxPotentialHalfWidth = max_potential_half_width;
            this._maxPotentialHalfHeight = max_potential_half_height;
            this.updateBounds();
        }

        setMaxPotentialHalfWidth(value: number) {
            this._maxPotentialHalfWidth = value;
            this.updateBounds();
        }

        getMaxPotentialHalfWidth(): number {
            return this._maxPotentialHalfWidth;
        }

        setMaxPotentialHalfHeight(value: number) {
            this._maxPotentialHalfHeight = value;
            this.updateBounds();
        }

        getMaxPotentialHalfHeight(): number {
            return this._maxPotentialHalfHeight;
        }

        setPotential(value: number) {
            this._potential = value;
            this.updateBounds();
        }

        getPotential(): number {
            return this._potential;
        }

        setGradation(value: number) {
            this._gradation = value;
            this.updateBounds();
        }

        getGradation(): number {
            return this._gradation;
        }

        getPotentialBoundsHalfWidth(): number {
            return this._boundsHalfWidth;
        }

        getPotentialBoundsHalfHeight(): number {
            return this._boundsHalfHeight;
        }

        getLocalPotential(local_x: number, local_y: number): number {
            if (Math.abs(local_x) <= this._maxPotentialHalfWidth && Math.abs(local_y) <= this._maxPotentialHalfHeight) return this.type * this._potential;

            if (Math.abs(local_x) < this._boundsHalfWidth && Math.abs(local_y) < this._boundsHalfHeight) {

                var distance: number;

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
        }

        private updateBounds(): void {
            this._boundsHalfWidth = this._maxPotentialHalfWidth + Math.ceil(this._potential / this._gradation) - 1;
            this._boundsHalfHeight = this._maxPotentialHalfHeight + Math.ceil(this._potential / this._gradation) - 1;
        }
    }

    export class HorizontalPotentialField extends PotentialField {

        private _potential: number;

        private _gradation: number;

        private _halfWidth: number;
        private _halfHeight: number;

        constructor(half_width: number) {
            super();
            this._potential = 1;
            this._gradation = 1;
            this._halfWidth = half_width;
            this.updateBounds();
        }

        setPotential(value: number) {
            this._potential = value;
            this.updateBounds();
        }

        setGradation(value: number) {
            this._gradation = value;
            this.updateBounds();
        }

        getPotential(): number {
            return this._potential;
        }

        getGradation(): number {
            return this._gradation;
        }

        getPotentialBoundsHalfWidth(): number {
            return this._halfWidth;
        }

        getPotentialBoundsHalfHeight(): number {
            return this._halfHeight;
        }

        getLocalPotential(local_x: number, local_y: number): number {
            if (Math.abs(local_x) > this._halfWidth) return 0;

            if (this.type < 0) {
                return Math.min(0, this.type * (this._potential - this._gradation * Math.abs(local_y)));
            }
            return Math.max(0, this.type * (this._potential - this._gradation * Math.abs(local_y)));
        }

        private updateBounds() {
            this._halfHeight = Math.ceil(this._potential / this._gradation) - 1;
        }
    }

    export class VerticalPotentialField extends PotentialField {

        private _potential: number;

        private _gradation: number;

        private _halfWidth: number;
        private _halfHeight: number;

        constructor(half_height: number) {
            super();
            this._potential = 1;
            this._gradation = 1;
            this._halfHeight = half_height;
            this.updateBounds();
        }

        setPotential(value: number) {
            this._potential = value;
            this.updateBounds();
        }

        setGradation(value: number) {
            this._gradation = value;
            this.updateBounds();
        }

        getPotential(): number {
            return this._potential;
        }

        getGradation(): number {
            return this._gradation;
        }

        getPotentialBoundsHalfWidth(): number {
            return this._halfWidth;
        }

        getPotentialBoundsHalfHeight(): number {
            return this._halfHeight;
        }

        getLocalPotential(local_x: number, local_y: number): number {
            if (Math.abs(local_y) > this._halfHeight) return 0;

            if (this.type < 0) {
                return Math.min(0, this.type * (this._potential - this._gradation * Math.abs(local_x)));
            }
            return Math.max(0, this.type * (this._potential - this._gradation * Math.abs(local_x)));
        }

        private updateBounds(): void {
            this._halfWidth = Math.ceil(this._potential / this._gradation) - 1;
        }
    }

}
