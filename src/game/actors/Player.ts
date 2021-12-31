import { Vector3 } from "three";
import PlayerInput from '../input/PlayerInput';
import Display from "../Display";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import PlayerCommandQueue from "../queues/PlayerCommandQueue";
import Actor, {ActorNotification} from "./Actor";
import EVS from "../EVS";

export default class Player extends Actor {
    public display: Display;
    private input: PlayerInput;
    public position: Vector3;
    public velocity: Vector3;
    public initial_position: Vector3;
    private readonly swing_step: number;
    private swing_angle: number;
    public controls: PointerLockControls;

    static EYES_ABOVE_GROUND:number = 2.0;
    public player_commands: PlayerCommandQueue;

    constructor( display: Display, initial_position: Vector3, pointer_lock_controls: PointerLockControls, input ?: PlayerInput ) {
        super();
        this.display = display;
        this.input = input ? input : new PlayerInput();
        this.controls = pointer_lock_controls;
        this.initial_position = new Vector3( initial_position.x, initial_position.y + Player.EYES_ABOVE_GROUND , initial_position.z );
        this.position = new Vector3( initial_position.x, initial_position.y + Player.EYES_ABOVE_GROUND, initial_position.z );
        this.velocity = new Vector3( 0.0, 0.0, 0.0 ); // x: (-)left / (+)right , y:(-)up / (+) down,  z: (-)backward / (+) forward
        this.swing_step = 0.15;
        this.swing_angle = 0.0;

        this.player_commands = PlayerCommandQueue.getInstance();

        this.setInitialLookAt();
        this.attachEventsListeners();
    }

    /**
     * Sets the initial "look at" for FPP camera (player)
     * @private
     */
    private setInitialLookAt() {
        this.display.cam.lookAt( this.initial_position );
    }

    public onNotify(actor: Actor, notification: ActorNotification) {

    }

    /**
     * Handles player input by reading the state of the buttons pressed on the input controller.
     * Sets the player velocity accordingly. The velocity is then read in the update phase
     * to move the player (camera in fact).
     */
    public handleInput() {
        this.handleInputQueue();
        this.handleInputForwardBackward();
        this.handleInputLeftRight();
    }

    public handleInputQueue(): void {
        const last_button = this.input.getLastButton();
        if ( last_button == this.input.keyFire ) {
            this.player_commands.add({
                command: this.fire
            })
        }
    }

    public fire() {
        this.notify( {
            event: EVS.EVENT_PLAYER_FIRE
        });
    }

    public handleInputForwardBackward(): void {
        if ( this.input.buttons.up.pressed || this.input.buttons.down.pressed ) {
            if ( this.input.buttons.down.time > this.input.buttons.up.time ) {
                this.velocity.z = -0.25;
            } else {
                this.velocity.z = 0.25;
            }
        } else {
            this.velocity.z = 0;
        }
    }

    public handleInputLeftRight(): void {
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
     *
     */
    public handleCommands() {
        const last_command = this.player_commands.get();

        if ( ! last_command ) {
            return;
        }

        const command = last_command['command'].bind( this );
        command();
    }

    /**
     * Updates the player state.
     */
    public update( dt:number, et:number ) {
        this.handleCommands();
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
    attachEventsListeners() {
        window.addEventListener( Display.EVENT_GAME_AREA_FOCUS, () => {
            this.controls.lock();
        });
    }

}