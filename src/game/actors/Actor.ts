export type ActorNotification = {
    event: string,
}

export default abstract class Actor {

    protected observers: Actor[];

    protected constructor( ) {
        this.observers = [];
    }

    update( dt: number, et: number ) {

    }

    public abstract onNotify( actor: Actor, notification: ActorNotification );

    public notify( notification: ActorNotification ) {
        this.observers.forEach( ( observer ) => {
            observer.onNotify( this, notification );
        })
    }

    public addObserver( actor: Actor ) {
        if ( this.observers.indexOf( actor ) !== -1 ) {
            return;
        }

        this.observers.push( actor );
    }

    public removeObserver( actor: Actor ) {
        const idx = this.observers.indexOf( actor );
        if ( -1 === idx ) {
            return;
        }

        this.observers.splice( idx, 1 );
    }

}