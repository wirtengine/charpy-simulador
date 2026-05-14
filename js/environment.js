import * as THREE from 'three';

export function crearEntorno(renderer) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222244);
    const envMap = pmremGenerator.fromScene(scene).texture;
    return envMap;
}