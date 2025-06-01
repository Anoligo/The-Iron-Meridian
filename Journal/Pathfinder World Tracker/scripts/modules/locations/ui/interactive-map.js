/**
 * Interactive Map Component
 * Displays a world map with interactive location pins
 * Supports zooming, panning, and adding new location pins
 */

export class InteractiveMap {
    /**
     * Create a new interactive map
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.container - Container element for the map
     * @param {string} options.mapImagePath - Path to the map image
     * @param {Array} options.locations - Array of location objects
     * @param {Function} options.onLocationClick - Callback when a location is clicked
     * @param {Function} options.onMapClick - Callback when the map is clicked (for adding new locations)
     */
    constructor(options) {
        this.container = options.container;
        this.mapImagePath = options.mapImagePath || './WorldMap.png';
        this.locations = options.locations || [];
        this.onLocationClick = options.onLocationClick || (() => {});
        this.onMapClick = options.onMapClick || (() => {});
        
        // Map state
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.selectedLocationId = null;
        
        // Bind methods
        this.handleWheel = this.handleWheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.render = this.render.bind(this);
        
        // Initialize the map
        this.init();
    }
    
    /**
     * Initialize the map
     */
    init() {
        console.log('Initializing interactive map');
        console.log('Container element:', this.container);
        console.log('Container exists:', !!this.container);
        console.log('Map image path:', this.mapImagePath);
        
        if (!this.container) {
            console.error('Cannot initialize map: No container element provided');
            throw new Error('No container element provided for the map');
        }
        
        // Track which path we're trying
        this.currentPathIndex = 0;
        
        // Create map container
        this.mapContainer = document.createElement('div');
        this.mapContainer.className = 'interactive-map-container';
        this.mapContainer.style.position = 'relative';
        this.mapContainer.style.overflow = 'hidden';
        this.mapContainer.style.width = '100%';
        this.mapContainer.style.height = '500px';
        this.mapContainer.style.border = '1px solid #ccc';
        this.mapContainer.style.borderRadius = '4px';
        this.mapContainer.style.backgroundColor = '#f8f9fa';
        
        // Create map controls
        this.createMapControls();
        
        // Create map image
        this.mapImage = document.createElement('img');
        this.mapImage.style.position = 'absolute';
        this.mapImage.style.transformOrigin = '0 0';
        this.mapImage.style.userSelect = 'none';
        this.mapImage.style.pointerEvents = 'none'; // Prevent image from capturing events
        this.mapImage.draggable = false;
        
        // Define all possible paths to find the image
        const possiblePaths = [
            './WorldMap.png',
            '../WorldMap.png',
            '../../WorldMap.png',
            '../../../WorldMap.png',
            './images/WorldMap.png',
            '../images/WorldMap.png',
            '../../images/WorldMap.png',
            './assets/WorldMap.png',
            '../assets/WorldMap.png',
            '../../assets/WorldMap.png',
            './assets/images/WorldMap.png',
            '../assets/images/WorldMap.png',
            '../../assets/images/WorldMap.png',
            '/assets/images/WorldMap.png',
            '/images/WorldMap.png',
            '/WorldMap.png',
            'WorldMap.png'
        ];
        
        // Set up path tracking
        this.currentPathIndex = 0;
        
        // Use a placeholder grid background if we can't load the actual map
        this.mapContainer.style.backgroundImage = 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)';
        this.mapContainer.style.backgroundSize = '20px 20px';
        
        // Set up path tracking
        this.currentPathIndex = 0;
        
        // Try the first path
        console.log('Setting map image source to:', possiblePaths[this.currentPathIndex]);
        this.mapImage.src = possiblePaths[this.currentPathIndex];
        
        // Add event listeners for image loading
        this.mapImage.onload = () => {
            console.log('Map image loaded successfully:', this.mapImagePath);
            this.render(); // Render the map once the image is loaded
        };
        
        this.mapImage.onerror = () => {
            console.error('Error loading map image:', this.mapImagePath);
            console.error('Image path attempted:', this.mapImagePath);
            
            // Try the next path in our list of possible paths
            if (this.currentPathIndex < possiblePaths.length - 1) {
                this.currentPathIndex++;
                this.mapImagePath = possiblePaths[this.currentPathIndex];
                console.log('Trying alternative path:', this.mapImagePath);
                this.mapImage.src = this.mapImagePath;
            } else {
                // If we've tried all paths, show error and create a fallback grid background
                console.error('All image paths failed, using fallback grid');
                
                // Show error message in map container
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-danger';
                errorMsg.style.position = 'absolute';
                errorMsg.style.top = '10px';
                errorMsg.style.left = '10px';
                errorMsg.style.right = '10px';
                errorMsg.style.zIndex = '100';
                errorMsg.innerHTML = `<strong>Map Error:</strong> Could not load map image. Using fallback grid.`;
                this.mapContainer.appendChild(errorMsg);
                
                // Create a fallback grid background
                this.createFallbackGrid();
            }
        };
        
        // Create pins container
        this.pinsContainer = document.createElement('div');
        this.pinsContainer.className = 'map-pins-container';
        this.pinsContainer.style.position = 'absolute';
        this.pinsContainer.style.top = '0';
        this.pinsContainer.style.left = '0';
        this.pinsContainer.style.width = '100%';
        this.pinsContainer.style.height = '100%';
        this.pinsContainer.style.pointerEvents = 'none'; // Let events pass through to the map
        
        // Add elements to the container
        this.mapContainer.appendChild(this.mapImage);
        this.mapContainer.appendChild(this.pinsContainer);
        this.container.appendChild(this.mapContainer);
        
        console.log('Map container added to DOM:', this.mapContainer);
        console.log('Container contents:', this.container.innerHTML);
        
        // Add event listeners
        this.mapContainer.addEventListener('wheel', this.handleWheel);
        this.mapContainer.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        this.mapContainer.addEventListener('click', this.handleMapClick);
        
        // Note: onload handler is already set above
        // No need to set it again here
    }
    
    /**
     * Create map control buttons (zoom in, zoom out, reset)
     */
    createMapControls() {
        // Create controls container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'map-controls';
        this.controlsContainer.style.position = 'absolute';
        this.controlsContainer.style.top = '10px';
        this.controlsContainer.style.right = '10px';
        this.controlsContainer.style.zIndex = '10';
        this.controlsContainer.style.display = 'flex';
        this.controlsContainer.style.flexDirection = 'column';
        this.controlsContainer.style.gap = '5px';
        
        // Zoom in button
        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'btn btn-sm btn-light';
        zoomInBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
        zoomInBtn.title = 'Zoom In';
        zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        
        // Zoom out button
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'btn btn-sm btn-light';
        zoomOutBtn.innerHTML = '<i class="fas fa-search-minus"></i>';
        zoomOutBtn.title = 'Zoom Out';
        zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        
        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-sm btn-light';
        resetBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        resetBtn.title = 'Reset View';
        resetBtn.addEventListener('click', () => this.resetView());
        
        // Add buttons to controls container
        this.controlsContainer.appendChild(zoomInBtn);
        this.controlsContainer.appendChild(zoomOutBtn);
        this.controlsContainer.appendChild(resetBtn);
        
        // Add controls to map container
        this.container.appendChild(this.controlsContainer);
    }
    
    /**
     * Handle mouse wheel event for zooming
     * @param {WheelEvent} e - Wheel event
     */
    handleWheel(e) {
        e.preventDefault();
        
        // Calculate zoom factor based on wheel delta
        const delta = -Math.sign(e.deltaY) * 0.1;
        this.zoom(delta, e.offsetX, e.offsetY);
    }
    
    /**
     * Zoom the map by a given factor
     * @param {number} factor - Zoom factor
     * @param {number} x - X coordinate to zoom around
     * @param {number} y - Y coordinate to zoom around
     */
    zoom(factor, x, y) {
        // Get current dimensions
        const oldScale = this.scale;
        
        // Calculate new scale (with limits)
        this.scale = Math.max(0.5, Math.min(3, this.scale + factor));
        
        // If coordinates are provided, zoom around that point
        if (x !== undefined && y !== undefined) {
            // Calculate how much the point will move due to scaling
            const scaleChange = this.scale / oldScale;
            
            // Adjust offset to keep the point under the cursor
            this.offsetX = x - (x - this.offsetX) * scaleChange;
            this.offsetY = y - (y - this.offsetY) * scaleChange;
        }
        
        this.render();
    }
    
    /**
     * Reset the map view to default
     */
    resetView() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.render();
    }
    
    /**
     * Handle mouse down event for dragging
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
        // Only start dragging on left mouse button
        if (e.button !== 0) return;
        
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragStartOffsetX = this.offsetX;
        this.dragStartOffsetY = this.offsetY;
        
        // Change cursor to grabbing
        this.mapContainer.style.cursor = 'grabbing';
    }
    
    /**
     * Handle mouse move event for dragging
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        // Calculate new offset based on mouse movement
        this.offsetX = this.dragStartOffsetX + (e.clientX - this.dragStartX);
        this.offsetY = this.dragStartOffsetY + (e.clientY - this.dragStartY);
        
        this.render();
    }
    
    /**
     * Handle mouse up event for dragging
     */
    handleMouseUp() {
        this.isDragging = false;
        
        // Reset cursor
        this.mapContainer.style.cursor = 'grab';
    }
    
    /**
     * Handle map click event
     * @param {MouseEvent} e - Mouse event
     */
    handleMapClick(e) {
        // Don't trigger click if we were dragging
        if (Math.abs(e.clientX - this.dragStartX) > 5 || Math.abs(e.clientY - this.dragStartY) > 5) {
            return;
        }
        
        // Convert screen coordinates to map coordinates
        const rect = this.mapContainer.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) - this.offsetX) / this.scale);
        const y = Math.round(((e.clientY - rect.top) - this.offsetY) / this.scale);
        
        // Check if we clicked on a location pin
        const clickedLocation = this.findLocationAtCoordinates(e.clientX - rect.left, e.clientY - rect.top);
        
        if (clickedLocation) {
            // If we clicked on a location, select it
            this.selectLocation(clickedLocation.id);
            this.onLocationClick(clickedLocation);
        } else {
            // If we clicked on the map, trigger the onMapClick callback
            this.onMapClick(x, y);
        }
    }
    
    /**
     * Find a location at the given screen coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object|null} The location at the coordinates, or null if none
     */
    findLocationAtCoordinates(screenX, screenY) {
        // Check each location pin
        for (const location of this.locations) {
            // Calculate pin position on screen
            const pinX = this.offsetX + location.x * this.scale;
            const pinY = this.offsetY + location.y * this.scale;
            
            // Check if the click is within the pin's area (using a 20px radius)
            const distance = Math.sqrt(Math.pow(screenX - pinX, 2) + Math.pow(screenY - pinY, 2));
            if (distance <= 15) {
                return location;
            }
        }
        
        return null;
    }
    
    /**
     * Select a location by ID
     * @param {string} locationId - ID of the location to select
     */
    selectLocation(locationId) {
        this.selectedLocationId = locationId;
        this.render();
    }
    
    /**
     * Update the locations array
     * @param {Array} locations - New array of location objects
     */
    updateLocations(locations) {
        this.locations = locations || [];
        this.render();
    }
    
    /**
     * Center the map on a specific location with a fixed zoom level
     * @param {string} locationId - ID of the location to center on
     * @param {number} [targetScale=1.5] - The target zoom level (1.0 = 100%)
     */
    centerOnLocation(locationId, targetScale = 1.5) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (!location) return;
        
        // Calculate center position
        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;
        
        // Set the scale to the target zoom level
        this.scale = targetScale;
        
        // Calculate the new offset to center the location
        this.offsetX = containerWidth / 2 - location.x * this.scale;
        this.offsetY = containerHeight / 2 - location.y * this.scale;
        
        this.render();
    }
    
    /**
     * Render the map and location pins
     */
    render() {
        // Update map image transform
        this.mapImage.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        
        // Clear existing pins
        this.pinsContainer.innerHTML = '';
        
        // Render each location pin
        this.locations.forEach(location => {
            // Skip locations with no coordinates
            if (location.x === undefined || location.y === undefined) return;
            
            // Create pin element
            const pin = document.createElement('div');
            pin.className = 'map-pin';
            pin.style.position = 'absolute';
            pin.style.left = `${this.offsetX + location.x * this.scale}px`;
            pin.style.top = `${this.offsetY + location.y * this.scale}px`;
            pin.style.transform = 'translate(-50%, -100%)';
            pin.style.pointerEvents = 'auto'; // Make pin clickable
            
            // Determine pin style based on location type and selection state
            const isSelected = location.id === this.selectedLocationId;
            const iconClass = this.getLocationIcon(location.type);
            const discoveredClass = location.discovered ? 'text-primary' : 'text-secondary';
            
            // Create pin content
            pin.innerHTML = `
                <div class="pin-icon ${isSelected ? 'selected' : ''}" title="${location.name}">
                    <i class="fas ${iconClass} ${discoveredClass}"></i>
                    ${isSelected ? `<div class="pin-label">${location.name}</div>` : ''}
                </div>
            `;
            
            // Add click event
            pin.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectLocation(location.id);
                this.onLocationClick(location);
            });
            
            // Add pin to container
            this.pinsContainer.appendChild(pin);
        });
    }
    
    /**
     * Get the location icon based on type
     * @param {string} type - The location type
     * @returns {string} The icon class
     */
    getLocationIcon(type) {
        const icons = {
            'TOWN': 'fa-home',
            'CITY': 'fa-city',
            'DUNGEON': 'fa-dungeon',
            'FOREST': 'fa-tree',
            'MOUNTAIN': 'fa-mountain',
            'CAVE': 'fa-cave',
            'TEMPLE': 'fa-place-of-worship',
            'RUINS': 'fa-landmark',
            'CAMP': 'fa-campground',
            'OTHER': 'fa-map-marker-alt'
        };
        
        return icons[type] || 'fa-map-marker-alt';
    }
    
    /**
     * Create a fallback grid background when map image can't be loaded
     */
    createFallbackGrid() {
        // Create a canvas element to draw the grid
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        
        const ctx = canvas.getContext('2d');
        
        // Fill with light background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Add some reference coordinates
        ctx.fillStyle = '#999999';
        ctx.font = '12px Arial';
        
        for (let x = 0; x <= canvas.width; x += 100) {
            for (let y = 0; y <= canvas.height; y += 100) {
                ctx.fillText(`(${x},${y})`, x + 5, y + 15);
            }
        }
        
        // Use the canvas as our map image
        this.mapImage.src = canvas.toDataURL();
        this.mapContainer.appendChild(canvas);
    }
    
    /**
     * Clean up event listeners
     */
    destroy() {
        this.mapContainer.removeEventListener('wheel', this.handleWheel);
        this.mapContainer.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        this.mapContainer.removeEventListener('click', this.handleMapClick);
    }
}
