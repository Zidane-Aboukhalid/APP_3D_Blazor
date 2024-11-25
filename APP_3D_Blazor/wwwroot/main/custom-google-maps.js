import {
    AmbientLight,
    DirectionalLight,
    Matrix4,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Raycaster,
    Vector2,
    MeshBasicMaterial,
    Mesh
} from "/three/three.js";
import { GLTFLoader } from "/three/GLTFLoader.js";
import { FontLoader } from '/three/FontLoader.js';
import { TextGeometry } from '/three/TextGeometry.js';

export class CustomGoogleMapsJs {
    static importDynamicLibrary = (g => {
        var h, a, k, p = "The Google Maps JavaScript API",
            c = "google", l = "importLibrary", q = "__ib__",
            m = document, b = window;
        b = b[c] || (b[c] = {});
        var d = b.maps || (b.maps = {}),
            r = new Set, e = new URLSearchParams,
            u = () => h || (h = new Promise(async (f, n) => {
                await (a = m.createElement("script"));
                e.set("libraries", [...r] + "");
                for (k in g)
                    e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
                e.set("callback", c + ".maps." + q);
                a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
                d[q] = f;
                a.onerror = () => h = n(Error(p + " could not load."));
                a.nonce = m.querySelector("script[nonce]")?.nonce || "";
                m.head.append(a);
            }));
        d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
    });

    static LoadMapsApi({ apikey, version, libraries, language, region }) {
        this.importDynamicLibrary({
            key: apikey,
            v: version,
            libraries,
            language,
            region
        });
    }

    static async initMapa3DAsync({ elementId, mapId, center, heading, tilt, defaultLabelsDisabled }) {
        try {
            const { Map } = await google.maps.importLibrary("maps");

            const mapOptions = {
                tilt,
                heading,
                zoom: 18,
                center,
                mapId
            };

            const mapDiv = document.getElementById(elementId);
            const map = new Map(mapDiv, mapOptions);
            let raycaster, camera, scene, renderer, mouse;
            const webglOverlayView = new google.maps.WebGLOverlayView();

            webglOverlayView.onAdd = () => {
                scene = new Scene();
                camera = new PerspectiveCamera();
                raycaster = new Raycaster();
                mouse = new Vector2();

                const ambientLight = new AmbientLight(0xffffff, 0.75);
                scene.add(ambientLight);
                const directionalLight = new DirectionalLight(0xffffff, 0.25);
                directionalLight.position.set(0.5, -1, 0.5);
                scene.add(directionalLight);

                const loader = new GLTFLoader();
                const source = "./models_Object3d/office.glb";
                loader.load(source, (gltf) => {
                    gltf.scene.scale.set(4, 4, 4);
                    gltf.scene.rotation.y = Math.PI / 2;
                    gltf.scene.rotation.x = Math.PI / 2;
                    scene.add(gltf.scene);

                    const fontLoader = new FontLoader();
                    fontLoader.load('./fonts/helvetiker_regular.typeface.json', (font) => {
                        const textGeometry = new TextGeometry('Office', {
                            font: font,
                            size: 15,
                            height: 1,
                            depth:1
                        });
                        const textMaterial = new MeshBasicMaterial({ color: 0xFFD700 });
                        const textMesh = new Mesh(textGeometry, textMaterial);
                        textMesh.position.set(20, 0, 0);
                        textMesh.rotation.set(Math.PI / 2, 0, 0);
                        scene.add(textMesh);
                    });
                });
            };
            webglOverlayView.onContextRestored = ({ gl }) => {
                renderer = new WebGLRenderer({
                    canvas: gl.canvas,
                    context: gl,
                    ...gl.getContextAttributes(),
                });
                renderer.autoClear = false;

                // Check if the canvas element is ready
                //if (renderer.domElement) {
                //    console.log('Canvas is ready for click events');
                //    //renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event, raycaster, camera, scene, mouse));
                //} else {
                //    console.error('Renderer DOM element is not available');
                //}
                var ft =true
                renderer.setAnimationLoop(() => {
                    
                    webglOverlayView.requestRedraw();
                    renderer.render(scene, camera);
                    renderer.resetState();
                    //const mapCanvas = mapDiv.querySelector("canvas")
                    //if (mapCanvas && ft) {
                    //    mapCanvas.addEventListener('click', (event) => this.onMouseClick(event, raycaster, camera, scene, mouse));
                    //    //mapCanvas.onClick((event) => this.onMouseClick(event, raycaster, camera, scene, mouse))
                    //    ft = false;
                    //}
                });
            };

            webglOverlayView.onDraw = ({ gl, transformer }) => {
                const latLngAltitudeLiteral = {
                    lat: center.lat,
                    lng: center.lng,
                    altitude: 0,
                };
                const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
                camera.projectionMatrix = new Matrix4().fromArray(matrix);
                webglOverlayView.requestRedraw();
                renderer.render(scene, camera);
                renderer.resetState();
            };

            webglOverlayView.setMap(map);
           ;
            

        } catch (error) {
            console.error("Error initializing map or models:", error);
        }
    }

    static onMouseClick(event, raycaster, camera, scene, mouse) {
        if (!raycaster || !camera || !scene) return;

        const rect = event.target.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            console.log("Intersected object:", object);

            if (object.userData.isClickable) {
                console.log("Clicked on 3D object:", object);
                alert("You clicked a 3D model!");
            }
        } else {
            console.log("No object intersected");
        }
    }

}

window.CustomGoogleMapsJs = CustomGoogleMapsJs;
