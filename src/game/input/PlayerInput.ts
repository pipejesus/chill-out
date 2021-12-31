import NullPlayerInput from "./NullPlayerInput";

export default class PlayerInput extends NullPlayerInput {

    public keyUp: string;
    public keyDown: string;
    public keyLeft: string;
    public keyRight: string;
    public keyFire: string;

    protected history: string[];
    protected history_head: number;
    protected history_tail: number;
    protected static HISTORY_LENGTH: number = 3;

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
        this.setupHistory();
    }

    /**
     * Keys pressed history ring buffer setup.
     */
    protected setupHistory(): void {
        this.history = [];
        for ( let i = 0; i < PlayerInput.HISTORY_LENGTH; i++ ) {
            this.history.push('');
        }

        this.history_head = 0;
        this.history_tail = 0;
    }

    protected addToHistory( key_name: string ) {
        if ( ( this.history_tail + 1 ) % PlayerInput.HISTORY_LENGTH != this.history_head ) {
            this.history[ this.history_tail ] = key_name;
            this.history_tail = ( this.history_tail + 1 ) % PlayerInput.HISTORY_LENGTH;
        }
    }

    public getHistory() {
        return this.history;
    }

    public getLastButton(): string {
        if ( this.history_tail == this.history_head ) {
            return '';
        }

        const last_key = this.history[ this.history_head ];
        this.history_head = ( this.history_head + 1 ) % PlayerInput.HISTORY_LENGTH;

        return last_key;
    }

}