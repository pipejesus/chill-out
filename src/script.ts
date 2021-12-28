import './style.css';
import World from './game/World';

const canvas: HTMLCanvasElement = document.querySelector( 'canvas.webgl' );
new World( canvas );
