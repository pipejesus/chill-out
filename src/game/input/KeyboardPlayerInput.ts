import PlayerInput from "./PlayerInput";

/**
 * A wrapper for Keyboard events so that we can translate the key presses
 * to kind of smooth FPP controls.
 */
export default class KeyboardPlayerInput extends PlayerInput {

    constructor( keyUp: string, keyDown: string, keyLeft: string, keyRight: string, keyFire: string ) {
        super();
        this.keyUp = keyUp;
        this.keyDown = keyDown;
        this.keyLeft = keyLeft;
        this.keyRight = keyRight;
        this.keyFire = keyFire;
        this.connectInput();
    }

    private connectInput() {
        this.connectKeyDown();
        this.connectKeyUp();
    }

    /**
     * Listens to keydown events and records time the key was pressed.
     */
    private connectKeyDown() {
        document.addEventListener('keydown', ( event ) => {
            switch ( event.code ) {
                case this.keyUp:
                    this.buttons.up.pressed = true;
                    this.buttons.up.time = window.performance.now();
                    break;
                case this.keyDown:
                    this.buttons.down.pressed = true;
                    this.buttons.down.time = window.performance.now();
                    break;
                case this.keyLeft:
                    this.buttons.left.pressed = true;
                    this.buttons.left.time = window.performance.now();
                    break;
                case this.keyRight:
                    this.buttons.right.pressed = true;
                    this.buttons.right.time = window.performance.now();
                    break;
                case this.keyFire:
                    this.buttons.fire.pressed = true;
                    this.buttons.fire.time = window.performance.now();
                    break;
            }
        }, false );
    }

    /**
     * Listens to keyup events and zeros the time button was pressed when button is being released.
     */
    private connectKeyUp() {
        document.addEventListener( 'keyup', ( event ) => {
            switch ( event.code ) {
                case this.keyUp:
                    this.buttons.up.pressed = false;
                    this.buttons.up.time = 0;
                    break;
                case this.keyDown:
                    this.buttons.down.pressed = false;
                    this.buttons.down.time = 0;
                    break;
                case this.keyLeft:
                    this.buttons.left.pressed = false;
                    this.buttons.left.time = 0;
                    break;
                case this.keyRight:
                    this.buttons.right.pressed = false;
                    this.buttons.right.time = 0;
                    break;
                case this.keyFire:
                    this.buttons.fire.pressed = false;
                    this.buttons.fire.time = 0;
                    break;
            }
        });
    }

}