// wwwroot/js/viewer3d.js

import * as THREE from '/three/three.js';
import { OrbitControls } from '/three/OrbitControls.js';
import { MODELS, SimpleModel } from '/main/SimpleModel.js';
import { ModelsType, ModelStatus, EnumHandler } from '/main/EnumHandler.js';
import { TransformControls } from '/three/TransformControls.js';
import { GUI } from '/three/lil-gui.module.min.js';

window.init_Scene = function (instanceId) {
    // Variables locales pour chaque instance
    let scene, renderer, camera, controls, transformControls;
    let mainView, models = [], buttons;
    const modelsTypeHandler = new EnumHandler(ModelsType);
    const modelStatusHandler = new EnumHandler(ModelStatus);

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    // Camera setup
    mainView = document.getElementById(`main-view-${instanceId}`);
    camera = new THREE.PerspectiveCamera(75, mainView.clientWidth / mainView.clientHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mainView.clientWidth, mainView.clientHeight);
    mainView.appendChild(renderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2;

    // Lights setup
    const lightLeft = new THREE.DirectionalLight(0xffffff, 5);
    lightLeft.position.set(10, 10, 10).normalize();
    scene.add(lightLeft);
    const lightRight = new THREE.DirectionalLight(0xffffff, 5);
    lightRight.position.set(-10, 10, 10).normalize();
    scene.add(lightRight);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -1, 0);
    scene.add(floor);

    // Add TransformControls for precise manipulation
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.7;
    scene.add(transformControls);

    transformControls.addEventListener('mouseDown', function () {
        controls.enabled = false;
    });

    transformControls.addEventListener('mouseUp', function () {
        controls.enabled = true;
        const object = transformControls.object;
        if (object) {
            const position = object.position;
            const rotation = object.rotation;
            const scale = object.scale;

            const dataToSave = {
                id: object.uuid,
                position: { x: position.x, y: position.y, z: position.z },
                rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
                scale: { x: scale.x, y: scale.y, z: scale.z }
            };

            console.log('Data to save:', dataToSave);
            myJsFunction(instanceId, dataToSave);
        }
    });

    // Fetch model data and load models
    fetchModelData().then(data => {
        createModelsFromAPI(instanceId, data);
    });

    // Event listener for mouse
    renderer.domElement.addEventListener('click', (event) => onMouseClick(event, instanceId));
    renderer.domElement.addEventListener('contextmenu', (event) => ActiveControleMouse(event, instanceId));
    renderer.domElement.addEventListener('wheel', (event) => ActiveControleMouse(event, instanceId));

    // Access the buttons and assign click events
    buttons = document.querySelectorAll(`#btn-group-container-${instanceId} button`);
    if (buttons.length >= 5) {
        buttons[0].addEventListener('click', () => setTransformMode(instanceId, 'mouse', buttons[0]));
        buttons[1].addEventListener('click', () => setTransformMode(instanceId, 'translate', buttons[1]));
        buttons[2].addEventListener('click', () => setTransformMode(instanceId, 'rotate', buttons[2]));
        buttons[3].addEventListener('click', () => setTransformMode(instanceId, 'scale', buttons[3]));
        buttons[4].addEventListener('click', () => setTransformMode(instanceId, 'add', buttons[4]));
        setTransformMode(instanceId, 'mouse', buttons[0]);
    } else {
        console.error(`Not enough buttons found in btn-group-container-${instanceId}`);
    }

    window.addEventListener('resize', () => resizeRenderer(instanceId, camera, renderer));
    animate();

    function resizeRenderer(instanceId, camera, renderer) {
        const mainView = document.getElementById(`main-view-${instanceId}`);
        renderer.setSize(mainView.clientWidth, mainView.clientHeight);  
        camera.aspect = mainView.clientWidth / mainView.clientHeight;
        camera.updateProjectionMatrix();
    }

    function display_Settings(models) {
        // Remove existing GUI
        $(".settings-gui").remove();

        const gui = new GUI({ autoPlace: false });
        const container = document.createElement('div');
        container.id = `settings-gui-${models.id}`;
        container.className = "settings-gui";
        document.body.appendChild(container);
        const MeshPosition = gui.addFolder(models.description + "Position")
        MeshPosition.add(models.model.position, 'x').min(-10000).max(10000000000).step(0.001).name('MeshPositionX');
        MeshPosition.add(models.model.position, 'y').min(-10000).max(10000000000).step(0.001).name('MeshPositionY');
        MeshPosition.add(models.model.position, 'z').min(-10000).max(10000000000).step(0.001).name('MeshPositionZ');
        MeshPosition.open()

        const MeshRotation = gui.addFolder(models.description + "Rotation")
        MeshRotation.add(models.model.rotation, 'x', 0, Math.PI * 2)
        MeshRotation.add(models.model.rotation, 'y', 0, Math.PI * 2)
        MeshRotation.add(models.model.rotation, 'z', 0, Math.PI * 2)
        MeshRotation.open()

        const cubeFolder = gui.addFolder(models.description + "Rotation")
        cubeFolder.add(models.model.scale, 'x', 100, Math.PI * 2)
        cubeFolder.add(models.model.scale, 'y', 100, Math.PI * 2)
        cubeFolder.add(models.model.scale, 'z', 100, Math.PI * 2)
        cubeFolder.open()
        gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '10px';
        gui.domElement.style.right = '10px';
        container.appendChild(gui.domElement);
    }

    async function fetchModelData() {
        try {
            const response = await fetch('/main/API.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération des données des modèles:', error);
            return [];
        }
    }

    function createModelsFromAPI(instanceId, modelData) {
        modelData.forEach(item => {
            const model = new SimpleModel(
                item.id,
                item.url,
                item.position,
                item.scale,
                item.type,
                item.status,
                item.description,
                item.rotation,
                item.components
            );
            model.load(scene);
            models.push(model);
        });
    }

    function displayStatusCard(instanceId, model) {
        const statusCard = document.getElementById(`status-card-${instanceId}`);
        statusCard.style.display = 'block';

        // Populate the status card with model information
        statusCard.innerHTML = `
            <button onclick="closeStatusCard('${instanceId}')" type="button" class="btn-close" aria-label="Close"></button>
            <h3>${modelsTypeHandler.getDisplayNameByValue(model.type)} Status</h3>
            <p>Position: X=${model.position.x}, Y=${model.position.y}, Z=${model.position.z}</p>
            <p>Status: ${modelStatusHandler.getDisplayNameByValue(model.status) || 'N/A'}</p>
            <p>Description: ${model.description || 'No description available'}</p>
        `;
    }

    function displayZoneButton(instanceId, models) {
        const zoneButtonContainer = document.getElementById(`mySidenav-${instanceId}`);
        zoneButtonContainer.innerHTML = `<a class="closebtn" onclick="closeNav('${instanceId}')">&times;</a>`;

        models.forEach(model => {
            if (model.type === ModelsType.CUBEZONE_MODEL.value) {
                const button = document.createElement('a');
                button.textContent = `${model.description}`;
                button.href = "javascript:void(0)";
                button.onclick = () => moveCameraToZone(instanceId, model);
                zoneButtonContainer.appendChild(button);
            }
        });
    }   

    function onMouseClick(event, instanceId) {
        controls.enabled = true;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const target = intersects[0].object;
            const parentModel = target.userData.parentModel;
            if (parentModel) {
                display_Settings(parentModel);
                transformControls.attach(parentModel.model);
                switch (transformControls.getMode()) {
                    case "translate":
                        setTransformMode(instanceId, "translate", buttons[1]);
                        break;
                    case "rotate":
                        setTransformMode(instanceId, "rotate", buttons[2]);
                        break;
                    case "scale":
                        setTransformMode(instanceId, "scale", buttons[3]);
                        break;
                }
                if (parentModel) {
                    models.forEach(model => {
                        if (model !== parentModel) {
                            model.setOpacity(0.5);
                        }
                        else {
                            if (parentModel.type !== ModelsType.SUPPER_MODEL.value && parentModel.type !== ModelsType.CUBEZONE_MODEL.value) {
                                model.setOpacity(1);
                                moveCameraToTarget(instanceId, parentModel.model);
                            }
                        }
                    });
                    // Display status card for the selected model
                    displayStatusCard(instanceId, parentModel);
                }
            }
        }
    }

    function moveCameraToTarget(instanceId, target) {
        const targetPosition = new THREE.Vector3();
        target.getWorldPosition(targetPosition);
        targetPosition.set(targetPosition.x + 3, targetPosition.y + 2, targetPosition.z);

        const startPosition = camera.position.clone();
        const startTime = performance.now();
        const duration = 1000;

        controls.enabled = false;

        function animateCamera(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);

            camera.position.lerpVectors(startPosition, targetPosition, t);
            camera.lookAt(targetPosition);
            camera.rotation.set(target.rotation.x, target.rotation.y, target.rotation.z * Math.PI * 2);
            if (t < 1) {
                requestAnimationFrame(animateCamera);
            } else {
                controls.enabled = true;
            }
        }

        requestAnimationFrame(animateCamera);
    }

    function moveCameraToZone(instanceId, model) {
        const offset = new THREE.Vector3(
            model.scale.x,
            model.scale.y,
            model.scale.z
        );

        const targetPosition = new THREE.Vector3();
        targetPosition.set(
            model.position.x - (offset.x / 2) + 2,
            model.position.y + (offset.y / 2) - 3,
            model.position.z + (offset.z / 2) - 1
        );

        const startPosition = camera.position.clone();
        const startTime = performance.now();
        const duration = 1000;

        controls.enabled = false;

        function animateCamera(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);

            // Update camera position
            camera.position.lerpVectors(startPosition, targetPosition, t);
            camera.lookAt(model.position);
            camera.rotation.set(0, Math.PI * -0.20, 0);

            if (t < 1) {
                requestAnimationFrame(animateCamera);
            } else {
                controls.enabled = false;
            }
        }

        requestAnimationFrame(animateCamera);
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (controls.enabled) {
            controls.update();
        }
        renderer.render(scene, camera);
        if (models.length !== MODELS.length) {
            models = [...MODELS];
            displayZoneButton(instanceId, models);
        }
    }

    function ActiveControleMouse(event, instanceId) {
        controls.enabled = true;
    }

    // Function to set the transform mode and handle button styles
    function setTransformMode(instanceId, mode, button) {
        if (!(mode === "mouse" || mode === "add")) {
            transformControls.setMode(mode);
        }
        else if (mode === "mouse") {
            transformControls.detach();
        }
        else if (mode === "add") {
            var newCube = new SimpleModel(
                uuidv4(),
                '',
                { x: -6, y: 3, z: 26 },
                { x: 3, y: 3, z: 3 },
                ModelsType.CUBEZONE_MODEL.value,
                3,
                "cube zone ",
                { x: 0, y: 0, z: 0 },
                []
            );
            newCube.load(scene);
            transformControls.attach(newCube.model);
        }

        // Remove 'btn-primary' from all buttons and set 'btn-secondary'
        const buttons = document.querySelectorAll(`#btn-group-container-${instanceId} button`);
        buttons.forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });

        // Add 'btn-primary' to the clicked button
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
    }

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async function myJsFunction(instanceId, data) {
        await DotNet.invokeMethodAsync('APP_3D_Blazor', 'MyCSharpFunction', data, instanceId);
    }
};

// Dans viewer3d.js (avant ou après la définition de init_Scene)
window.openNav = function (instanceId) {
    document.getElementById(`mySidenav-${instanceId}`).style.width = "250px";
    document.getElementById(`main-view-${instanceId}`).style.marginLeft = "250px";
    document.getElementById(`btn-group-container-${instanceId}`).style.marginLeft = "250px";
}

window.closeNav = function (instanceId) {
    document.getElementById(`mySidenav-${instanceId}`).style.width = "0";
    document.getElementById(`main-view-${instanceId}`).style.marginLeft = "0";
    document.getElementById(`btn-group-container-${instanceId}`).style.marginLeft = "0";
}

window.closeStatusCard = function (instanceId) {
    const statusCard = document.getElementById(`status-card-${instanceId}`);
    statusCard.style.display = 'none';
}
