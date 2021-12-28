import * as THREE from 'three';
import {MathUtils} from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import Constants from './constants';
// import Player from './player';

export default class World {

    constructor( canvas ) {
        this.canvas = canvas;
        this.setProps();
        this.setup();
    }

    setProps() {
        this.window_w = 0;
        this.window_h = 0;
        this.camera = null;
        this.controls = null;
        this.renderer = null;
        this.texture_loader = new THREE.TextureLoader();
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.lights = {};
        this.textures = {};
        this.displacement_maps = {};

        this.buttons_pressed = {
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
        }

        this.entities = {
            floor: {},
            player: {},
            maze: [],
        };
    }

    /**
     * Updates the world objects.
     */
    update( dt, elapsed_time ) {
        this.updatePlayerSwing( dt );
    }

    updatePlayerSwing( dt ) {
        if ( this.isPlayerMoving() ) {
            this.entities.player.swing_angle += this.entities.player.swing_step;
            this.camera.position.y = Constants.PLAYER_POS_Y + Math.sin( this.entities.player.swing_angle ) / 4;
        }
    }

    isPlayerMoving() {
        return ( this.buttons_pressed.up.pressed || this.buttons_pressed.down.pressed || this.buttons_pressed.left.pressed || this.buttons_pressed.right.pressed );
    }

    /**
     * The main, simplistic game loop.
     */
    tick() {

        const elapsed_time = this.clock.getElapsedTime();
        const dt = this.clock.getDelta();

        this.handleInput( dt, elapsed_time );
        this.update( dt, elapsed_time );
        this.renderer.render( this.scene, this.camera );

        window.requestAnimationFrame( () => { this.tick() } );
    }

    /**
     * Performs initial setup.
     */
    setup() {
        this.createPlayer();

        this.createCamera();
        this.createRenderer();
        this.createControls();

        this.loadTextures();
        this.createMaze();
        this.createLights();

        this.reactOnWindowResize();
        this.reactOnGameAreaFocus();
        this.connectInputs();
    }

    /**
     * Fills in our internal mapping of keys pressed together
     * with data "when the key was pressed" so that we can make
     * smooth transitions in direction change, like in true FPPs ; D
     */
    connectInputs() {
        this.connectKeyboardInput();
    }

    connectKeyboardInput() {
        document.addEventListener('keydown', ( event ) => {
            switch ( event.code ) {
                case 'KeyW':
                    this.buttons_pressed.up.pressed = true;
                    this.buttons_pressed.up.time = window.performance.now();
                    break;
                case 'KeyS':
                    this.buttons_pressed.down.pressed = true;
                    this.buttons_pressed.down.time = window.performance.now();
                    break;
                case 'KeyA':
                    this.buttons_pressed.left.pressed = true;
                    this.buttons_pressed.left.time = window.performance.now();
                    break;
                case 'KeyD':
                    this.buttons_pressed.right.pressed = true;
                    this.buttons_pressed.right.time = window.performance.now();
                    break;
            }
        }, false );

        document.addEventListener( 'keyup', ( event ) => {
            switch ( event.code ) {
                case 'KeyW':
                    this.buttons_pressed.up.pressed = false;
                    this.buttons_pressed.up.time = 0;
                    break;
                case 'KeyS':
                    this.buttons_pressed.down.pressed = false;
                    this.buttons_pressed.down.time = 0;
                    break;
                case 'KeyA':
                    this.buttons_pressed.left.pressed = false;
                    this.buttons_pressed.left.time = 0;
                    break;
                case 'KeyD':
                    this.buttons_pressed.right.pressed = false;
                    this.buttons_pressed.right.time = 0;
                    break;
            }
        });
    }

    /**
     * Updates the camera and renderer when screen resize event happens.
     */
    reactOnWindowResize() {
        window.addEventListener('resize', () => {
            this.getScreenSize();
            this.setCameraSize();
            this.setRenderedSize();
        });
    }

    /**
     * Adds click listener to the document body. When user clicks, the window gets locked
     * so that mouse-look events can get parsed by the PointerLockControls.
     */
    reactOnGameAreaFocus() {
        document.querySelector( 'body' ).addEventListener( 'click', () => {
            this.controls.lock();
        });
    }

    /**
     * Creates the camera and sets its position to player's position.
     */
    createCamera() {
        this.getScreenSize();

        this.camera = new THREE.PerspectiveCamera(55, this.window_w / this.window_h, 0.1, 100)
        this.setInitialCameraPosition();

        this.camera.lookAt( new THREE.Vector3( Constants.PLAYER_POS_X, Constants.PLAYER_POS_Y, Constants.PLAYER_POS_Z ) );
        this.scene.add( this.camera );
    }

    setInitialCameraPosition() {
        this.camera.position.x = Constants.PLAYER_POS_X;
        this.camera.position.y = Constants.PLAYER_POS_Y;
        this.camera.position.z = Constants.PLAYER_POS_Z;
    }

    /**
     * Creates the WEBGL Renderer and attaches is to canvas.
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        })

        this.setRenderedSize();
    }

    getScreenSize() {
        this.window_w = window.innerWidth;
        this.window_h = window.innerHeight;
    }

    setCameraSize() {
        this.camera.aspect = this.window_w / this.window_h;
        this.camera.updateProjectionMatrix();
    }

    setRenderedSize() {
        this.renderer.setSize( this.window_w, this.window_h );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
    }

    createControls() {
        this.controls = new PointerLockControls( this.camera, this.canvas );
    }

    handleInput( dt, elapsed_time ) {

        if ( this.buttons_pressed.up.pressed || this.buttons_pressed.down.pressed ) {
            if ( this.buttons_pressed.down.time > this.buttons_pressed.up.time ) {
                this.entities.player.velocity.y = -0.25;
            } else {
                this.entities.player.velocity.y = 0.25;
            }
        } else {
            this.entities.player.velocity.y = 0;
        }

        if ( this.buttons_pressed.left.pressed || this.buttons_pressed.right.pressed ) {
            if ( this.buttons_pressed.left.time > this.buttons_pressed.right.time ) {
                this.entities.player.velocity.x = -0.25;
            } else {
                this.entities.player.velocity.x = 0.25;
            }
        } else {
            this.entities.player.velocity.x = 0;
        }

        this.controls.moveRight( this.entities.player.velocity.x );
        this.controls.moveForward( this.entities.player.velocity.y );

    }

    /**
     * Creates player
     */
    createPlayer() {
        this.entities.player = {
            swing_step: 0.15,
            swing_angle: 0.0,
            velocity: new THREE.Vector2( 0.0, 0.0 ) // x: (-)left / (+)right , y: (-)backward / (+) forward
        }
    }

    createFloor( x, y, z, w, h, segments ) {
        const geometry = new THREE.PlaneGeometry( w, h );
        const material = new THREE.MeshStandardMaterial();

        material.color = new THREE.Color(1.0, 1.0, 1.0);
        material.side = THREE.DoubleSide;
        material.shininess = 120;

        const texture = this.textures.wood;
        texture.filter = THREE.LinearMipmapLinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.rotation = MathUtils.degToRad( 90 );
        texture.repeat.set( segments, segments );

        /**
         * Sets the basic texture on the material.
         */
        material.map = texture;

        const displacement_map = this.displacement_maps.wood;
        displacement_map.wrapS = THREE.RepeatWrapping;
        displacement_map.wrapT = THREE.RepeatWrapping;
        displacement_map.rotation = MathUtils.degToRad( 90 );
        displacement_map.repeat.set( segments, segments );

        /**
         * Sets the displacement map texture on the material.
         */
        material.displacementMap = displacement_map;

        this.entities.floor = new THREE.Mesh( geometry, material )

        this.entities.floor.position.x = x;
        this.entities.floor.position.y = y;
        this.entities.floor.position.z = z;
        this.entities.floor.rotation.x = MathUtils.degToRad( 90 ); // rotate the Plane to sit "as the floor"

        this.scene.add( this.entities.floor );
    }

    createWalls( x, y, z, w, h, segments ) {

        let wall_bricks = [];
        const wall_w = 4;
        const wall_h = 4;
        const wall_d = 1;

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(1.0, 1.0, 1.0 ),
            side: THREE.DoubleSide,
            shininess: 30
        });

        material.map = this.textures.green_wood;
        material.map.filter = THREE.LinearMipmapLinearFilter;
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( 1, 1 );

        material.displacementMap = this.displacement_maps.green_wood;
        material.displacementMap.wrapS = THREE.RepeatWrapping;
        material.displacementMap.wrapT = THREE.RepeatWrapping;
        material.displacementMap.repeat.set( 1, 1 );

        let angl = 0.0;

        const start_x = x - ( w / 2 ) + ( wall_w / 2 );

        for ( let i = 0; i < w; i = i + wall_w ) {
            const dest_wall_h = wall_h + ( Math.abs(Math.cos(angl) * 8) );
            // const dest_wall_h = wall_h;
            const dest_wall_y_pos = y + ( dest_wall_h / 2 );
            const geometry = new THREE.BoxGeometry( wall_w, dest_wall_h, wall_d, 1, 1, 1 );
            const brick = new THREE.Mesh( geometry, material );

            brick.position.x = start_x + i;
            brick.position.y = dest_wall_y_pos - 0.5;
            brick.position.z = z - h / 2 + 0.5;
            this.scene.add( brick );
            angl+= 0.2;
        }

        /**
         * Add Bob
         *
         */
        const bob_material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(1.0, 1.0, 1.0 ),
            side: THREE.DoubleSide,
            shininess: 90,
            map: this.textures.bob
        });

        const bob_geometry = new THREE.BoxGeometry( 2, 2, 0.5, 1, 1, 1 );
        const bob = new THREE.Mesh( bob_geometry, bob_material );
        bob.position.x = x;
        bob.position.y = 2;
        bob.position.z = z - h / 2 + 1;
        this.scene.add( bob );
    }

    /**
     * Creates the maze: floor, walls and ceiling.
     */
    createMaze() {
        this.createFloor( 0, 0, 0, 50, 100, 10 );
        this.createWalls( 0, 0, 0, 50, 100, 10 );
    }

    /**
     * Creates the base lightning for the maze.
     */
    createLights() {
        const point_light = new THREE.PointLight(0xffffff, 1.0);
        point_light.position.x = 0;
        point_light.position.y = 10;
        point_light.position.z = -50;
        this.lights.point = point_light;
        this.scene.add( this.lights.point );

        const point_light_back = new THREE.PointLight(0xff0ff, 0.24);
        point_light_back.position.x = 0;
        point_light_back.position.y = -5;
        point_light_back.position.z = -40;
        this.lights.point_back = point_light_back;
        this.scene.add( this.lights.point_back );

        const light = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add( light );
    }

    /**
     * Loads the textures.
     */
    loadTextures() {
        /**
         * Wood: Color
         */
        this.textures.wood = this.texture_loader.load( 'Wood067_1K_Color.png' );

        /**
         * Wood: Displacement map
         */
        this.displacement_maps.wood = this.texture_loader.load( 'Wood067_1K_Displacement.png' );

        /**
         * Green Wood: Color
         */
        this.textures.green_wood = this.texture_loader.load( 'moss_wood_diff_4k.jpg' );

        /**
         * Green Wood: Displacement
         */
        this.displacement_maps.green_wood = this.texture_loader.load( 'moss_wood_disp_4k.jpg' );

        this.textures.bob = this.texture_loader.load( 'uncle_bob.jpg' );
    }

}