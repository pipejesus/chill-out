import * as THREE from "three";
import Display from "../Display";
import Actor from "./Actor";

export default class Crosshair extends Actor {
    private sprite: THREE.Sprite;
    private display: Display;

    constructor( display: Display ) {
        super();
        this.display = display;

        const material = new THREE.SpriteMaterial( { color: new THREE.Color(255, 0, 0) } );

        const width = 0.2;
        const height = 0.2;

        this.sprite = new THREE.Sprite( material );
        this.sprite.center.set( 0.5, 0.5 );
        this.sprite.scale.set( width, height, 1 );
    }

    public addToScene() {
        this.display.scene.add( this.sprite );
    }

    public update( dt: number, et: number ) {
        this.updateCrosshairPosition();
    }

    private updateCrosshairPosition() {
        // let look_at_vector = new THREE.Vector3(0,0, -1 );
        // look_at_vector.applyQuaternion( this.display.cam.quaternion );
        //
        // this.sprite.position.x = look_at_vector.x;
        // this.sprite.position.y = look_at_vector.y;
        // this.sprite.position.z = ( look_at_vector.z - 1 );
        //
        // this.sprite.position = this.display.cam.getWorldPosition();

        this.sprite.position.x = this.display.cam.position.x;
        this.sprite.position.y = this.display.cam.position.y;
        this.sprite.position.z = ( this.display.cam.position.z - 1 );
        // this.sprite.position.applyQuaternion( this.display.cam.quaternion );
    }
}
