
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
    
}

// Make sure CustomGoogleMapsJs is available globally if needed
window.CustomGoogleMapsJs = CustomGoogleMapsJs;
