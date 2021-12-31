import * as THREE from "three";
import {MathUtils} from "three";
import Player from "./actors/Player";
import Display from "./Display";
import Assets from "./Assets";
import Phuck from "./actors/Phuck";
import Actor, {ActorNotification} from "./actors/Actor";

export type LevelConfig = {
    enemies: number,
}

export default class Level extends Actor {

    private floor: THREE.Mesh;
    private player: Player;
    private display: Display;
    private assets: Assets;
    private raycaster: THREE.Raycaster;
    private lights: Map<string, THREE.Light>;
    public phucks: Phuck[];
    private config: LevelConfig;

    constructor( player:Player, display: Display, assets: Assets, config: LevelConfig ) {
        super();
        this.lights = new Map<string, THREE.Light>();
        this.config = config;
        this.player = player;
        this.display = display;
        this.assets = assets;
        this.phucks = [];
        this.createMaze();
        this.spawnPhucks();
    }

    /**
     * Updates the level's actors.
     */
    public update( dt: number, et: number ) {
        this.phucks.forEach( ( phuck) => {
            phuck.update( dt, et );
        });
    }

    public onNotify( actor: Actor, notification: ActorNotification ) {
        console.log('actor: ', actor);
        console.log('sends notification here:', notification);
    }

    public spawnPhucks() {
        for ( let i = 0; i < this.config.enemies; i++ ) {
            const initial_angle = MathUtils.degToRad( i * ( 360 / this.config.enemies ) );
            const center = new THREE.Vector3(0.0, 8.0, 0.0 );
            const radius = 4;
            this.spawnPhuck( center, radius, initial_angle );
        }
    }

    /**
     * Spawns a phuck.
     */
    public spawnPhuck( center: THREE.Vector3, radius: number, initial_angle: number ) {
        const phuck = new Phuck( this.display.cam, this.assets, center, radius, initial_angle, 100, 50 );
        this.player.addObserver( phuck );
        this.phucks.push( phuck );
        this.phucks[ this.phucks.length - 1 ].addToScene( this.display.scene );
    }

    /**
     * Creates the maze: floor, walls and ceiling.
     */
    createMaze() {
        this.createFloor( 0, 0, 0, 100, 100, 10 );
        this.createWalls( 0, 0, 0, 100, 100, 10 );
        this.createLights();
    }

    createFloor( x, y, z, w, h, segments ) {
        const geometry = new THREE.PlaneGeometry( w, h );
        const material = new THREE.MeshPhongMaterial();

        material.color = new THREE.Color(1.0, 1.0, 1.0);
        material.side = THREE.DoubleSide;

        const texture = this.assets.textures.get( 'color_wood' ).clone();
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.rotation = MathUtils.degToRad( 90 );
        texture.repeat.set( segments, segments );
        texture.needsUpdate = true;

        /**
         * Sets the basic texture on the material.
         */
        material.map = texture;

        const displacement_map = this.assets.textures.get( 'displacement_wood' ).clone();
        displacement_map.wrapS = THREE.RepeatWrapping;
        displacement_map.wrapT = THREE.RepeatWrapping;
        displacement_map.rotation = MathUtils.degToRad( 90 );
        displacement_map.repeat.set( segments, segments );
        displacement_map.needsUpdate = true;

        /**
         * Sets the displacement map texture on the material.
         */
        material.displacementMap = displacement_map;

        this.floor = new THREE.Mesh( geometry, material )

        this.floor.position.x = x;
        this.floor.position.y = y;
        this.floor.position.z = z;
        this.floor.rotation.x = MathUtils.degToRad( 90 ); // rotate the Plane to sit "as the floor"

        this.display.scene.add( this.floor );
    }

    createWalls( x, y, z, w, h, segments ) {

        const wall_w = 4;
        const wall_h = 4;
        const wall_d = 1;

        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1.0, 1.0, 1.0 ),
            side: THREE.DoubleSide,
        });

        material.map = this.assets.textures.get( 'color_wood' ).clone();
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( 0.5, 0.5 );

        material.map.needsUpdate = true;

        // material.displacementMap = this.assets.textures.get( 'displacement_green_wood' ).clone();
        // material.displacementMap.wrapS = THREE.RepeatWrapping;
        // material.displacementMap.wrapT = THREE.RepeatWrapping;
        // material.displacementMap.repeat.set( 1, 1 );
        // material.displacementMap.needsUpdate = true;

        let angl = 0.0;

        const start_x = x - ( w / 2 ) + ( wall_w / 2 );

        for ( let i = 0; i < w; i = i + wall_w ) {
            const dest_wall_h = wall_h + ( Math.abs(Math.cos( angl ) * 8 ) );

            const dest_wall_y_pos = y + ( dest_wall_h / 2 );
            const geometry = new THREE.BoxGeometry( wall_w, dest_wall_h, wall_d, 1, 1, 1 );
            const brick = new THREE.Mesh( geometry, material );

            brick.position.x = start_x + (i * 1) ;
            brick.position.y = dest_wall_y_pos - 0.5;
            brick.position.z = z - h / 2 + 0.5;
            this.display.scene.add( brick );
            angl+= 0.5;
        }

    }


    /**
     * Creates the base lightning for the maze.
     */
    createLights() {
        const point_light = new THREE.PointLight(0xffffff, 1.0);
        point_light.position.x = 0;
        point_light.position.y = 10;
        point_light.position.z = -50;
        this.lights.set( 'point', point_light );
        this.display.scene.add( this.lights.get( 'point' ) );

        const ambient_light = new THREE.AmbientLight( 0x404040, 1 );
        this.lights.set( 'ambient_light', ambient_light );
        this.display.scene.add( this.lights.get( 'ambient_light' ) );
    }

}