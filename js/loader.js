import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function cargarModeloCharry(url) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                console.log('✅ Modelo cargado correctamente');
                // Mostrar todas las animaciones y sus pistas
                if (gltf.animations.length > 0) {
                    console.log('🎬 Animaciones encontradas:', gltf.animations.length);
                    gltf.animations.forEach((clip, i) => {
                        console.log(`   Clip ${i}: "${clip.name}" (${clip.duration.toFixed(2)}s)`);
                        clip.tracks.forEach(track => {
                            const nodeName = track.name.split('.')[0];
                            console.log(`      Nodo animado: "${nodeName}"`);
                        });
                    });
                }
                resolve(gltf.scene);
            },
            undefined,
            (error) => reject(error)
        );
    });
}