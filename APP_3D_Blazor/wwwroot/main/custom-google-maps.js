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
import { OrbitControls } from '/three/OrbitControls.js';
import { FontLoader } from '/three/FontLoader.js';
import { TextGeometry } from '/three/TextGeometry.js';
let raycaster, camera, scene, renderer, mouse, controls;

async function importDynamicLibrary(g) {
    return await new Promise((resolve, reject) => {
        const p = "The Google Maps JavaScript API";
        const c = "google";
        const m = document;
        const b = window;
        b[c] = b[c] || {};
        const d = b.maps || (b.maps = {});

        // Define your own callback
        b.onGoogleMapsLoad = () => {
            resolve();
        };

        const e = new URLSearchParams();
        const r = new Set();

        e.set("libraries", [...r] + "");
        for (const k in g) {
            e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
        }
        e.set("callback", "onGoogleMapsLoad"); // Set your custom callback

        const script = m.createElement("script");
        script.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        script.onerror = () => reject(Error(p + " could not load."));
        m.head.append(script);
    });
}

window.LoadMapsApi = async function ({ apikey, version, libraries, language, region }) {
    return await importDynamicLibrary({ key: apikey, v: version, libraries, language, region });
};

window.initMapa3DAsync = async function ({ elementId, mapId, center, heading, tilt, defaultLabelsDisabled }) {
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

        const webglOverlayView = new google.maps.WebGLOverlayView();

        webglOverlayView.onAdd = () => initializeScene();
        webglOverlayView.onContextRestored = ({ gl }) => setupRenderer(gl, mapDiv, webglOverlayView);
        webglOverlayView.onDraw = ({ transformer }) => drawScene(transformer, center);
       
        webglOverlayView.setMap(map);
    } catch (error) {
        console.error("Error initializing map or models:", error);
    }
}

function initializeScene() {
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
    loader.load("./models_Object3d/office.glb", (gltf) => {
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
                depth: 1
            });
            const textMaterial = new MeshBasicMaterial({ color: 0xFFD700 });
            const textMesh = new Mesh(textGeometry, textMaterial);
            textMesh.position.set(20, 0, 0);
            textMesh.rotation.set(Math.PI / 2, 0, 0);
            scene.add(textMesh);
        });
    });
}

function setupRenderer(gl, mapDiv, webglOverlayView) {
    renderer = new WebGLRenderer({
        canvas: gl.canvas,
        context: gl,
        ...gl.getContextAttributes(),
    });

    renderer.autoClear = false;
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.parentNode.style.zIndex = "1000000";

    renderer.setAnimationLoop(() => {
        webglOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
    });
}

function drawScene(transformer, center) {
    const latLngAltitudeLiteral = {
        lat: center.lat,
        lng: center.lng,
        altitude: 0,
    };
    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new Matrix4().fromArray(matrix);
    renderer.render(scene, camera);
    renderer.resetState();
}

// Evenmant click Problem 
function onMouseClick(event) {
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
// fin code 