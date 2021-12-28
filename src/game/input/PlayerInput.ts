import NullPlayerInput from "./NullPlayerInput";

export default class PlayerInput extends NullPlayerInput {

    protected keyUp: string;
    protected keyDown: string;
    protected keyLeft: string;
    protected keyRight: string;
    protected keyFire: string;

    public buttons = {
        up: {
            time: 0,
            pressed: false
        },
        down: {
            time: 0,
            pressed: false
        },
        left: {
            time: 0,
            pressed: false
        },
        right:  {
            time: 0,
            pressed: false
        },
        fire:  {
            time: 0,
            pressed: false
        },
    }

    constructor() {
        super();
    }

}