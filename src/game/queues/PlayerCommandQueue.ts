export default class PlayerCommandQueue {

    public static instance:PlayerCommandQueue;
    protected queue: object[];
    protected head: number;
    protected tail: number;
    protected static SIZE: number = 20;

    constructor() {
        this.setup();
    }

    public static getInstance() {
        if ( ! PlayerCommandQueue.instance ) {
            PlayerCommandQueue.instance = new PlayerCommandQueue();
        }
        return PlayerCommandQueue.instance;
    }

    /**
     * Setup the event queue ring buffer.
     */
    protected setup(): void {
        this.queue = [];

        for (let i = 0; i < PlayerCommandQueue.SIZE; i++ ) {
            this.queue.push({});
        }

        this.head = 0;
        this.tail = 0;
    }

    /**
     * Adds event to the queue
     */
    public add( ev: object ) {
        if ( ( this.tail + 1 ) % PlayerCommandQueue.SIZE != this.head ) {
            this.queue[ this.tail ] = ev;
            this.tail = ( this.tail + 1 ) % PlayerCommandQueue.SIZE;
        }
    }

    /**
     * Gets the event from the queue
     */
    public get() {
        if ( this.tail == this.head ) {
            return null;
        }

        const ev = this.queue[ this.head ];
        this.head = ( this.head + 1 ) % PlayerCommandQueue.SIZE;

        return ev;
    }
}