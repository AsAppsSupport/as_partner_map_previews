/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useRef, useState, onMounted, onPatched, Component } from "@odoo/owl";

class MapPreviewWidget extends Component {
    static template = "contact_localization.MapPreviewWidget";

    setup() {
        this.mapRef = useRef("mapContainer");
        this.searchInputRef = useRef("searchInput");
        this._map = null;
        this._marker = null;
        this._circleLayer = null;
        this._tileLayers = {};
        this.state = useState({
            mapType: "osm",
            radius: 0,
            showRadius: false,
            searchQuery: "",
            isFullscreen: false,
            zoom: 14,
        });

        onMounted(() => this._renderMap());
        onPatched(() => this._renderMap());
    }

    get latitude() {
        return this.props.record.data.partner_latitude || 0;
    }

    get longitude() {
        return this.props.record.data.partner_longitude || 0;
    }

    get partnerName() {
        return this.props.record.data.name || "Location";
    }

    get partnerAddress() {
        const parts = [];
        if (this.props.record.data.street) parts.push(this.props.record.data.street);
        if (this.props.record.data.city) parts.push(this.props.record.data.city);
        if (this.props.record.data.country_id && this.props.record.data.country_id[1]) {
            parts.push(this.props.record.data.country_id[1]);
        }
        return parts.join(", ");
    }

    get hasCoords() {
        return this.latitude !== 0 && this.longitude !== 0;
    }

    _renderMap() {
        if (!this.hasCoords) return;
        const lat = this.latitude;
        const lng = this.longitude;
        const container = this.mapRef.el;
        if (!container) return;

        if (!window.L) {
            this._loadLeaflet().then(() => this._initMap(lat, lng));
        } else {
            this._initMap(lat, lng);
        }
    }

    _loadLeaflet() {
        return new Promise((resolve) => {
            if (window.L && window.L_LoadProgress) { resolve(); return; }
            
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);

            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    _initMap(lat, lng) {
        const container = this.mapRef.el;
        if (!container || !window.L) return;

        if (this._map) {
            this._map.setView([lat, lng], this.state.zoom);
            if (this._marker) this._marker.setLatLng([lat, lng]);
            this._updateMarkerPopup();
            setTimeout(() => this._map.invalidateSize(), 100);
            return;
        }

        // Initialize map
        this._map = window.L.map(container).setView([lat, lng], this.state.zoom);

        // Define tile layers
        this._tileLayers = {
            osm: window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                maxZoom: 19,
                name: "Street Map"
            }),
            satellite: window.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                attribution: "© Esri, DigitalGlobe, Earthstar Geographics",
                maxZoom: 18,
                name: "Satellite"
            }),
            terrain: window.L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenTopoMap contributors",
                maxZoom: 17,
                name: "Terrain"
            })
        };

        // Add initial layer
        this._tileLayers[this.state.mapType].addTo(this._map);

        // Create custom icon
        const customIcon = window.L.icon({
            iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231f77d2' width='32' height='32'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12c0 7 10 13 10 13s10-6 10-13c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'/%3E%3C/svg%3E",
            shadowUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='rgba(0,0,0,0.2)' width='32' height='32'%3E%3Ccircle cx='16' cy='20' r='12'/%3E%3C/svg%3E",
            iconSize: [32, 32],
            shadowSize: [32, 32],
            iconAnchor: [16, 32],
            shadowAnchor: [10, 32],
            popupAnchor: [0, -32]
        });

        // Add marker with enhanced popup
        this._marker = window.L.marker([lat, lng], { icon: customIcon, draggable: false })
            .addTo(this._map);
        this._updateMarkerPopup();

        // Add zoom controls and layer selector
        window.L.control.zoom({ position: 'topright' }).addTo(this._map);

        // Map type selector
        const mapTypeControl = window.L.control({ position: 'topright' });
        mapTypeControl.onAdd = (map) => {
            const div = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control map-type-control');
            const buttonOsm = window.L.DomUtil.create('button', 'map-type-button', div);
            buttonOsm.textContent = 'Map';
            buttonOsm.title = 'Street Map';
            buttonOsm.onclick = () => this._changeMapType('osm', div);

            const buttonSat = window.L.DomUtil.create('button', 'map-type-button', div);
            buttonSat.textContent = 'Sat';
            buttonSat.title = 'Satellite';
            buttonSat.onclick = () => this._changeMapType('satellite', div);

            const buttonTerr = window.L.DomUtil.create('button', 'map-type-button', div);
            buttonTerr.textContent = 'Ter';
            buttonTerr.title = 'Terrain';
            buttonTerr.onclick = () => this._changeMapType('terrain', div);

            return div;
        };
        mapTypeControl.addTo(this._map);

        // Geolocate button
        const geoControl = window.L.control({ position: 'topright' });
        geoControl.onAdd = (map) => {
            const div = window.L.DomUtil.create('button', 'leaflet-bar leaflet-control geo-button');
            div.textContent = '📍';
            div.title = 'Center on marker';
            div.style.width = '36px';
            div.style.height = '36px';
            div.style.padding = '6px';
            div.style.fontSize = '18px';
            div.onclick = () => {
                map.setView([this.latitude, this.longitude], 16);
                map.invalidateSize();
            };
            return div;
        };
        geoControl.addTo(this._map);

        // Fullscreen toggle
        const fullscreenControl = window.L.control({ position: 'topright' });
        fullscreenControl.onAdd = (map) => {
            const div = window.L.DomUtil.create('button', 'leaflet-bar leaflet-control fullscreen-button');
            div.textContent = '⛶';
            div.title = 'Toggle Fullscreen';
            div.style.width = '36px';
            div.style.height = '36px';
            div.style.padding = '6px';
            div.style.fontSize = '18px';
            div.onclick = () => this._toggleFullscreen();
            return div;
        };
        fullscreenControl.addTo(this._map);

        // Add scale control
        window.L.control.scale().addTo(this._map);

        // Invalidate size after initialization
        setTimeout(() => this._map.invalidateSize(), 300);
    }

    _updateMarkerPopup() {
        if (!this._marker) return;
        const popupContent = `
            <div class="marker-popup">
                <h5 style="margin: 0 0 8px 0;">${this.partnerName}</h5>
                ${this.partnerAddress ? `<p style="margin: 0 0 8px 0; font-size: 12px;">${this.partnerAddress}</p>` : ''}
                <p style="margin: 0; font-size: 12px; color: #666;">
                    <strong>Coordinates:</strong> ${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}
                </p>
            </div>
        `;
        this._marker.bindPopup(popupContent).openPopup();
    }

    _changeMapType(type, controlElement) {
        if (!this._map) return;
        
        // Remove current layer
        const currentLayers = Object.keys(this._tileLayers)
            .filter(key => key !== type)
            .map(key => this._tileLayers[key]);
        
        currentLayers.forEach(layer => {
            if (this._map.hasLayer(layer)) {
                this._map.removeLayer(layer);
            }
        });

        // Add new layer
        if (!this._map.hasLayer(this._tileLayers[type])) {
            this._tileLayers[type].addTo(this._map);
        }

        this.state.mapType = type;

        // Update UI
        const buttons = controlElement.querySelectorAll('.map-type-button');
        buttons.forEach((btn, idx) => {
            btn.style.fontWeight = (idx === Object.keys(this._tileLayers).indexOf(type)) ? 'bold' : 'normal';
        });
    }

    _toggleFullscreen() {
        if (!this._map) return;

        const container = this.mapRef.el.closest('.o_field_map_preview');
        if (!container) return;

        this.state.isFullscreen = !this.state.isFullscreen;

        if (this.state.isFullscreen) {
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '10000';
            container.style.backgroundColor = 'white';
            this.mapRef.el.style.height = '100%';
        } else {
            container.style.position = '';
            container.style.top = '';
            container.style.left = '';
            container.style.width = '';
            container.style.height = '';
            container.style.zIndex = '';
            container.style.backgroundColor = '';
            this.mapRef.el.style.height = '400px';
        }

        setTimeout(() => this._map.invalidateSize(), 100);
    }
}

// Register the enhanced map widget
registry.category("fields").add("map_preview", {
    component: MapPreviewWidget,
    displayName: "Enhanced Map Preview",
    supportedTypes: ["float"],
    extractProps: ({ attrs, field }) => ({}),
});