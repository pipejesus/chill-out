import { Vector3 } from "three";
import PlayerInput from './input/PlayerInput';
import Display from "./Display";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";

export default class Player {
    public display: Display;
    private input: PlayerInput;
    public position: Vector3;
    public velocity: Vector3;
    public initial_position: Vector3;
    private readonly swing_step: number;
    private swing_angle: number;
    public controls: PointerLockControls;

    constructor( display: Display, initial_position: Vector3, pointer_lock_controls: PointerLockControls, input ?: PlayerInput ) {
        this.display = display;
        this.input = input ? input : new PlayerInput();
        this.controls = pointer_lock_controls;
        this.initial_position = new Vector3( initial_position.x, initial_position.y, initial_position.z );
        this.position = new Vector3( initial_position.x, initial_position.y, initial_position.z );
        this.velocity = new Vector3( 0.0, 0.0, 0.0 ); // x: (-)left / (+)right , y:(-)up / (+) down,  z: (-)backward / (+) forward
        this.swing_step = 0.15;
        this.swing_angle = 0.0;

        this.attachEventsListerers();
    }

    /**
     * Handles player input by reading the state of the buttons pressed on the input controller.
     * Sets the player velocity accordingly. The velocity is then read in the update phase
     * to move the player (camera in fact).
     */
    public handleInput() {
        if ( this.input.buttons.up.pressed || this.input.buttons.down.pressed ) {
            if ( this.input.buttons.down.time > this.input.buttons.up.time ) {
                this.velocity.z = -0.25;
            } else {
                this.velocity.z = 0.25;
            }
        } else {
            this.velocity.z = 0;
        }

        if ( this.input.buttons.left.pressed || this.input.buttons.right.pressed ) {
            if ( this.input.buttons.left.time > this.input.buttons.right.time ) {
                this.velocity.x = -0.25;
            } else {
                this.velocity.x = 0.25;
            }
        } else {
            this.velocity.x = 0;
        }
    }

    /**
     * Updates the player state.
     */
    public update( dt:number, et:number ) {
        this.calculateYPositionForSwing();
        this.updatePosition();
    }

    /**
     * Calculate the current Y position of the player (the swing)
     */
    private calculateYPositionForSwing() {
        if ( this.isMoving() ) {
            this.swing_angle += this.swing_step;
            this.position.y = this.initial_position.y + Math.sin( this.swing_angle ) / 4;
        }
    }

    /**
     * Is player currently moving ?
     */
    private isMoving() {
        return ( this.velocity.x !== 0 || this.velocity.z !== 0 );
    }

    /**
     * Updates the player's position by issuing a command to the controls.
     * Since Camera position IS the player position, in effect we're moving the
     * camera in x - z plane (move right - moveforward).
     *
     * The Y coordinate update is needed to create the "swing" effect.
     */
    updatePosition() {
        this.controls.moveRight( this.velocity.x );
        this.controls.moveForward( this.velocity.z );
        this.display.cam.position.y = this.position.y;
    }

    /**
     * Attaches Event Listeners related to Player.
     */
    attachEventsListerers() {
        window.addEventListener( Display.EVENT_GAME_AREA_FOCUS, () => {
            this.controls.lock();
        });
    }

}