import * as THREE from "three";
import Actor from './Actor';
import { PhuckState, PhuckStateFalling, PhuckStateLive} from './states/PhuckStates';
import Assets from "../Assets";

export default class Phuck extends Actor {

    public mesh: THREE.Mesh;
    public radius: number;
    public center: THREE.Vector3;
    public rotation: number;
    public health: number;
    public hit_damage: number;
    public initial_angle: number;
    public is_on_target: boolean;
    private state: PhuckState;
    private states: Map<string, PhuckState>;
    private assets: Assets;
    private raycaster: THREE.Raycaster;
    private cam: THREE.Camera;

    constructor( cam: THREE.Camera, assets: Assets, center: THREE.Vector3, radius: number, initial_angle: number, health: number, hit_damage: number ) {
        super();
        this.cam = cam;
        this.raycaster = new THREE.Raycaster();
        this.assets = assets;
        this.center = center;
        this.radius = radius;
        this.initial_angle = initial_angle;
        this.health = health;
        this.hit_damage = hit_damage;
        this.rotation = 0.0;
        this.createMesh();
        this.createStates();
    }

    public addToScene( scene: THREE.Scene ) {
        scene.add( this.mesh );
    }

    public removeFromScene( scene: THREE.Scene ) {
        scene.remove( this.mesh );
    }

    public isOnPlayersTarget() {
        let look_at_vector = new THREE.Vector3(0,0, -1 );
        look_at_vector.applyQuaternion( this.cam.quaternion );
        this.raycaster.set( this.cam.position, look_at_vector );
        const intersect = this.raycaster.intersectObject( this.mesh );
        if ( intersect.length ) {
            this.is_on_target = true;
            console.log('Intersects: the mesh: ', this.mesh.uuid );
            // this.state = this.states.get( 'falling' );
        } else {
            this.is_on_target = false;
            // this.state = this.states.get( 'live' );
        }
    }

    protected createStates() {
        this.states = new Map<string, PhuckState>();
        this.states.set( 'idle', new PhuckState( this ) );
        this.states.set( 'live', new PhuckStateLive( this ) );
        this.states.set( 'falling', new PhuckStateFalling( this ) );
        this.state = this.states.get( 'live' );
    }

    protected createMesh() {
        const texture = this.assets.textures.get( 'color_transistor' );
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1.0, 1.0, 0.0 ),
            side: THREE.DoubleSide,
            map: texture
        });

        const geometry = new THREE.BoxGeometry( 2, 2, 2, 1, 1, 1 );
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.position.x = this.center.x;
        this.mesh.position.y = this.center.y;
        this.mesh.position.z = this.center.z;

        /**
         * Set the initial rotation
         */
        this.mesh.position.x = this.mesh.position.x + Math.cos( this.initial_angle ) * this.radius;
        this.mesh.position.z = this.mesh.position.x + Math.sin( this.initial_angle ) * this.radius;
    }

    public update( dt: number, et: number ) {
        this.state.update( dt, et );
    }
}