import Phuck from "../Phuck";
import {MathUtils, Vector3 } from "three";

export class PhuckState {
    protected phuck: Phuck;

    constructor( phuck: Phuck ) {
        this.phuck = phuck;
    }

    public update( dt:number, et:number ) {

    }
}

export class PhuckStateLive extends PhuckState {

    constructor( phuck: Phuck ) {
        super( phuck );
    }

    public update( dt: number, et: number ) {
        this.phuck.mesh.position.x = this.phuck.center.x + Math.cos( this.phuck.initial_angle + et ) * this.phuck.radius;
        this.phuck.mesh.position.z = this.phuck.center.z + Math.sin( this.phuck.initial_angle + et ) * this.phuck.radius;
        this.phuck.mesh.rotation.y = Math.atan2( this.phuck.mesh.position.x, this.phuck.mesh.position.z );

        if ( this.phuck.player_is_shooting === true ) {
            this.phuck.isOnPlayersTarget();
        }

    }

}

export class PhuckStateFalling extends PhuckState {
    constructor( phuck: Phuck ) {
        super( phuck );
    }

    public update( dt: number, et: number ) {
        const original = new Vector3( this.phuck.mesh.position.x, this.phuck.mesh.position.y, this.phuck.mesh.position.z );
        const destination = new Vector3( this.phuck.mesh.position.x, 0.0, this.phuck.mesh.position.z )
        const current = original.lerp( destination, 0.05);
        this.phuck.mesh.position.set( current.x, current.y, current.z );
    }
}
