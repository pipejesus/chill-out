import * as THREE from "three";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import Player from "./Player";

export default class Display {

    public canvas: HTMLCanvasElement;
    public cam: THREE.PerspectiveCamera;
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public controls: PointerLockControls;

    private width:number;
    private height:number;

    public static EVENT_RESIZE : string = 'game_screen_resize';
    public static EVENT_GAME_AREA_FOCUS : string = 'game_area_focus';

    constructor( canvas:HTMLCanvasElement ) {
        this.canvas = canvas;
        this.getSize();

        this.createScene();
        this.createAndAttachCamera( 55, 0.1, 100 );
        this.createRenderer();

        this.handleWindowResize();
        this.handleGameAreaFocus();
    }

    /**
     * Renders the scene on the screen.
     */
    render() {
        this.renderer.render( this.scene, this.cam );
    }

    getSize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    handleWindowResize() {
        window.addEventListener('resize', () => {
            this.getSize();
            this.setCameraSize();
            this.setRendererSize();

            const event = new CustomEvent( Display.EVENT_RESIZE, {
                detail: { width: this.width, height: this.height }
            });

            window.dispatchEvent( event );
        });
    }

    /**
     * When user clicks, the window gets locked so that mouse-look events can get parsed by the PointerLockControls.
     */
    handleGameAreaFocus() {
        this.canvas.addEventListener( 'click', () => {
            const event = new CustomEvent( Display.EVENT_GAME_AREA_FOCUS );

            window.dispatchEvent( event );
        });
    }

    createScene() {
        this.scene = new THREE.Scene();
    }

    createAndAttachCamera( fov: number, near:number, far: number ) {
        this.cam = new THREE.PerspectiveCamera( fov, this.getAspect(), near, far );
        this.scene.add( this.cam );
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        });

        this.setRendererSize();
    }

    getAspect():number {
        return this.height > 0 && this.width > 0 ? this.width / this.height : 1;
    }

    setCameraPosition( position:THREE.Vector3 ) {
        this.cam.position.set( position.x, position.y, position.z );
    }

    setCameraLookAt( look_at:THREE.Vector3 ) {
        this.cam.lookAt( look_at );
    }

    setCameraSize() {
        this.cam.aspect = this.width / this.height;
        this.cam.updateProjectionMatrix();
    }

    setRendererSize() {
        this.renderer.setSize( this.width, this.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
    }

}