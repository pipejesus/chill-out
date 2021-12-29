import * as THREE from "three";
import Display from './Display';
import Player from './Player';
import Level, {LevelConfig} from './Level';
import Assets from './Assets';
import KeyboardPlayerInput from "./input/KeyboardPlayerInput";
import {Vector3} from "three";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import PlayerEventQueue from "./queues/PlayerEventQueue";

export default class World {

    public assets: Assets;
    protected display: Display;
    private time_delta: number;
    private time_elapsed: number;
    private clock: THREE.Clock;
    private player: Player;
    private level: Level;
    private player_events: PlayerEventQueue;

    constructor( canvas: HTMLCanvasElement ) {
        this.clock = new THREE.Clock();
        this.assets = new Assets( this.getTexturesForPreload() );
        this.player_events = PlayerEventQueue.getInstance();
        this.assets.load().then( () => {
            this.createWorld( canvas );
        })
    }

    createWorld( canvas: HTMLCanvasElement ) {
        this.createDisplay( canvas );
        this.createPlayer();
        this.createLevel();
        this.tick();
    }

    createDisplay( canvas: HTMLCanvasElement ) {
        this.display = new Display( canvas );
    }

    createPlayer() {
        const keyboard_player_input = new KeyboardPlayerInput( 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space' );
        const initial_position = new Vector3(0.0, 0.0, -30.0 );
        const pointer_lock_controls = new PointerLockControls( this.display.cam, this.display.canvas );
        this.player = new Player( this.display, initial_position, pointer_lock_controls, keyboard_player_input );
    }

    createLevel() {
        const level_config:LevelConfig = {
            enemies: 3
        };
        this.level = new Level( this.player, this.display, this.assets, level_config );
    }

    tick() {
        this.getTime();
        this.handleInput();
        this.update();
        this.display.render();
        window.requestAnimationFrame( () => { this.tick() } );
    }

    getTime() {
        this.time_elapsed = this.clock.getElapsedTime();
        this.time_delta = this.clock.getDelta();
    }

    public update() {
        this.level.update( this.time_delta, this.time_elapsed );
        this.player.update( this.time_delta, this.time_elapsed );
    }

    handleInput() {
        this.player.handleInput();
    }

    getTexturesForPreload() {
        return [
            {
                name: 'wood',
                color: 'Wood067_1K_Color.png',
                displacement: 'Wood067_1K_Displacement.png'
            },
            {
                name: 'transistor',
                color: 'transistor.jpg',
                displacement: null
            }

        ];
    }

}