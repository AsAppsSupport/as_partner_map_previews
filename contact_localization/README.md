# Contact Localization - Enhanced Map Widget

## Overview

This module provides an enhanced map widget for Odoo partner forms, displaying location information with multiple interactive features.

## New Features

### 1. **Multiple Map Types** 
- Street Map (OpenStreetMap)
- Satellite View (Esri Satellite)
- Terrain View (OpenTopoMap)
- Easy switching via control buttons in the top-right corner

### 2. **Enhanced Marker Information**
- Displays partner name in popup
- Shows full address information
- Displays exact coordinates (latitude, longitude)
- Professional popup styling with all relevant details

### 3. **Map Controls**
- **Zoom Controls**: Standard zoom in/out buttons
- **Center Button (📍)**: Quick button to center on partner location
- **Fullscreen Toggle (⛶)**: Expand map to fullscreen mode
- **Scale Control**: Shows distance scale on the map

### 4. **Improved UI/UX**
- Enhanced header with partner name and address
- Professional styling with gradients and shadows
- Responsive design for mobile devices
- Better visual hierarchy
- Footer showing coordinates
- Smooth animations and transitions

### 5. **Custom Marker**
- Blue custom marker icon with shadow
- Better visibility on map
- Animated popup when marker is clicked

### 6. **Responsive Layout**
- Auto-adjusts height and controls on mobile
- Optimized for different screen sizes
- Touch-friendly controls

## Technical Implementation

### File Structure
```
contact_localization/
├── static/src/
│   ├── css/
│   │   └── map_widget.css          # Enhanced styling
│   ├── js/
│   │   └── map_widget.js           # Advanced functionality
│   └── xml/
│       └── map_widget.xml          # Improved template
└── __manifest__.py                 # Updated with CSS
```

### Key Components

#### JavaScript (map_widget.js)
- **Multiple Map Layers**: OSM, Satellite, Terrain support
- **Custom Markers**: SVG-based custom marker icon
- **State Management**: Uses Owl.js useState for map properties
- **Dynamic Control Creation**: Leaflet controls for various functions
- **Fullscreen Mode**: Expandable map for better visibility

#### XML Template (map_widget.xml)
- Header with partner info
- Map container with styling
- Address display
- Coordinate information in footer

#### Styles (map_widget.css)
- Professional color scheme
- Rounded corners and shadows
- Responsive breakpoints
- Print-friendly styles
- Custom control styling
- Animation effects

## Usage

1. **Installation**: Install the module in Odoo
2. **Configuration**: No additional configuration needed
3. **Usage**:
   - Each partner contact with latitude/longitude will automatically show the enhanced map
   - Use map type buttons to switch between different views
   - Click fullscreen button for detailed view
   - Click marker to see partner details popup
   - Use center button to quickly focus on location

## Dependencies
- Odoo 19.0
- base_geolocalize (for lat/lng fields)
- Leaflet 1.9.4 (loaded from CDN)

## Supported APIs
- Leaflet Map Library
- OpenStreetMap tiles
- Esri Satellite imagery
- OpenTopoMap terrain
- OSM Tile layers

## Browser Support
- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancement Ideas
- Search functionality to find addresses
- Radius/geofence drawing
- Distance calculation between multiple locations
- Route planning
- Weather overlay
- Street view integration
- Heatmap visualization
- Export map as image/PDF
- Multiple markers for related locations
- Custom color markers
- Address search/autocomplete

## Version History

### v1.1.0 (Enhanced)
- Added multiple map type support
- Improved marker popup with address info
- Added fullscreen toggle
- Enhanced styling and animations
- Added custom marker icon
- Improved responsive design
- Added scale control

### v1.0.0 (Initial)
- Basic map display
- Simple marker at coordinates
- Static view

## Author
Odoo Development Team

## License
LGPL-3
