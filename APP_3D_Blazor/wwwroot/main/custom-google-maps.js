import {
    AmbientLight,
    DirectionalLight,
    Matrix4,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "/three/three.js";
import { GLTFLoader } from "/three/GLTFLoader.js";
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

    static async initMapa3Dsync({ elementId, mapId, center, heading, tilt, defaultLabelsDisabled }) {
        try {

            const { Map3DElement, Model3DElement } = await google.maps.importLibrary("maps3d");
            const map = new Map3DElement({
                center: center,
                heading: heading,
                tilt: tilt,
                defaultLabelsDisabled: defaultLabelsDisabled,
            });

            document.getElementById(elementId).append(map);

            const models = [
                // Basic model setup
                {
                    position: { lat: 33.5903311, lng: - 7.6376218, altitude: 216 },
                    orientation: { tilt: -90},
                    scale: 1,
                }
            ];

            for (const { position, orientation, scale } of models) {
                const model = new Model3DElement({
                    src: '/models_Object3d/office.glb',
                    position,
                    orientation,
                    scale,
                });

                map.append(model);
            }
        } catch (error) {
            console.error("Error initializing map or models:", error);
        }
    }
    static map;
    static async initMapa2Dsync({ elementId, mapId, center, zoom, controls }) {
            
            const position = { lat: -25.344, lng: 131.031 };
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            this.map = new Map(document.getElementById(elementId), {
                center,
                zoom,
                mapId,
                ...controls
            });

            const marker = new AdvancedMarkerElement({
                map: this.map,
                position: position,
                title: "Uluru",
            });
    }

    //loading google maps v2 
    static async initMapa3D_V2sync({ elementId, mapId, center, heading, tilt, defaultLabelsDisabled }) {
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

            let scene, renderer, camera, loader;
            const webglOverlayView = new google.maps.WebGLOverlayView();

            webglOverlayView.onAdd = () => {
                scene = new Scene();
                camera = new PerspectiveCamera();
                const ambientLight = new AmbientLight(0xffffff, 0.75); // Soft white light.
                scene.add(ambientLight);
                const directionalLight = new DirectionalLight(0xffffff, 0.25);
                directionalLight.position.set(0.5, -1, 0.5);
                scene.add(directionalLight);

                loader = new GLTFLoader();
                const source = "./models_Object3d/office.glb"; // Adjusted to your 3D model path.
                loader.load(source, (gltf) => {
                    gltf.scene.scale.set(4, 4, 4);
                    gltf.scene.rotation.y = Math.PI / 2;
                    gltf.scene.rotation.x = Math.PI / 2;
                    scene.add(gltf.scene);
                });
            };

            webglOverlayView.onContextRestored = ({ gl }) => {
                renderer = new WebGLRenderer({
                    canvas: gl.canvas,
                    context: gl,
                    ...gl.getContextAttributes(),
                });
                renderer.autoClear = false;

                loader.manager.onLoad = () => {
                    renderer.setAnimationLoop(() => {
                        webglOverlayView.requestRedraw();
                        const { tilt, heading, zoom } = mapOptions;
                        map.moveCamera({ tilt, heading, zoom });

                        //// Rotate the map 360 degrees (animation loop for the map)
                        //if (mapOptions.tilt < 67.5) {
                        //    mapOptions.tilt += 0.5;
                        //} else if (mapOptions.heading <= 360) {
                        //    mapOptions.heading += 0.2;
                        //    mapOptions.zoom -= 0.0005;
                        //} else {
                        //    renderer.setAnimationLoop(null); // Stop animation after full rotation
                        //}
                        renderer.setAnimationLoop(null);
                        renderer.render(scene, camera);
                        renderer.resetState();
                    });
                };
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

        } catch (error) {
            console.error("Error initializing map or models:", error);
        }
    }
}

// Make sure CustomGoogleMapsJs is available globally if needed
window.CustomGoogleMapsJs = CustomGoogleMapsJs;
