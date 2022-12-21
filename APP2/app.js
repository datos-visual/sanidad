// Inicializar el mapa de Mapbox
mapboxgl.accessToken = 'TU_TOKEN_DE_MAPBOX';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-3.7, 40.4],
    zoom: 6
});

// Añadir menú desplegable para seleccionar la especialidad
const specialtyMenu = document.getElementById('specialty-menu');

// Añadir geocoder de Mapbox para permitir al usuario buscar municipios y centros médicos
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    placeholder: 'Busca un municipio o centro médico',
    language: 'es'
});
map.addControl(geocoder);

// Crear una capa de puntos para los municipios y otra para los centros médicos
const municipiosLayer = new mapboxgl.GeoJSONSource({
    data: 'https://raw.githubusercontent.com/datos-visual/sanidad/main/centroides_municipios.geojson'
});
const centrosLayer = new mapboxgl.GeoJSONSource({
    data: 'https://raw.githubusercontent.com/datos-visual/sanidad/main/centroides_centros.geojson'
});

// Añadir las capas de puntos al mapa
map.addSource('municipios', municipiosLayer);
map.addSource('centros', centrosLayer);
map.addLayer({
    id: 'municipios-layer',
    type: 'circle',
    source: 'municipios',
    paint: {
        'circle-radius': 5,
        'circle-color': '#FF0000'
    }
});
map.addLayer({
    id: 'centros-layer',
    type: 'circle',
    source: 'centros',
    paint: {
        'circle-radius': 5,
        'circle-color': '#0000FF'
    }
});

// Añadir evento 'mouseover' a cada punto de municipio para resaltar el polígono correspondiente
// y mostrar un círculo alrededor del punto con el radio que indica la distancia al centro médico más cercano
map.on('mousemove', 'municipios-layer', (e) => {
    const municipality = e.features[0];
    const specialty = specialtyMenu.value;

    // Resaltar el polígono del municipio
    map.setFilter('municipality-highlighted', ['==', 'c_mun', municipality.properties.c_mun]);

    // Mostrar círculo alrededor del punto del municipio con el radio que indica la distancia al centro médico más cercano
    const radius = municipality.properties[`distance_${specialty}`];
    if (radius) {
        map.addLayer({
            id: 'municipality-circle',
            type: 'circle',
            source: 'municipios',
            filter: ['==', 'c_mun', municipality.properties.c_mun],
            paint: {
                'circle-radius': radius,
                'circle-color': '#0000FF'
            }
        });
    }
});

// Añadir evento 'mouseover' a cada punto de municipio para resaltar el polígono correspondiente
// y mostrar un círculo alrededor del punto con el radio que indica la distancia al centro médico más cercano
map.on('mousemove', 'municipios-layer', (e) => {
    const municipality = e.features[0];

    // Crear una capa de puntos para los municipios y otra para los centros médicos
    const municipiosLayer = new mapboxgl.GeoJSONSource({
        data: 'https://raw.githubusercontent.com/datos-visual/sanidad/main/centroides_municipios.geojson'
    });
    const centrosLayer = new mapboxgl.GeoJSONSource({
        data: 'https://raw.githubusercontent.com/datos-visual/sanidad/main/centroides_hospitales.geojson'
            
    });

    // Añadir las capas de puntos al mapa
    map.addSource('municipios', municipiosLayer);
    map.addSource('centros', centrosLayer);
    map.addLayer({
        id: 'municipios-layer',
        type: 'circle',
        source: 'municipios',
        paint: {
            'circle-radius': 5,
            'circle-color': '#FF0000'
        }
    });
    map.addLayer({
        id: 'centros-layer',
        type: 'circle',
        source: 'centros',
        paint: {
            'circle-radius': 5,
            'circle-color': '#0000FF'
        }
    });

    // Añadir evento 'mouseover' a cada punto de municipio para resaltar el polígono correspondiente
    // y mostrar un círculo alrededor del punto con el radio que indica la distancia al centro médico más cercano
    map.on('mousemove', 'municipios-layer', (e) => {
        const municipality = e.features[0];
        const specialty = specialtyMenu.value;

        // Resaltar el polígono del municipio
        map.setFilter('municipality-highlighted', ['==', 'c_mun', municipality.properties.c_mun]);

        // Mostrar círculo alrededor del punto del municipio con el radio que indica la distancia al centro médico más cercano
        const radius = municipality.properties[`distance_${specialty}`];
        if (radius) {
            map.addLayer({
                id: 'municipality-circle',
                type: 'circle',
                source: 'municipios',
                filter: ['==', 'c_mun', municipality.properties.c_mun],
                paint: {
                    'circle-radius': radius,
                    'circle-color': '#0000FF'
                }
            });
        }
    });

    // Añadir evento 'mouseout' a cada punto de municipio para quitar el resaltado del polígono y el círculo alrededor del punto
    map.on('mouseout', 'municipios-layer', () => {
        map.setFilter('municipality-highlighted', ['==', 'c_mun', '']);
        map.removeLayer('municipality-circle');
    });

    // Añadir un menú desplegable para seleccionar la especialidad médica
    const specialtyMenu = document.getElementById('specialty-menu');

    // Cuando se seleccione una especialidad, actualizar el mapa para mostrar el círculo alrededor de cada municipio
    // con el radio que indica la distancia al centro médico de esa especialidad más cercano
    specialtyMenu.addEventListener('change', () => {
        map.setFilter('municipality-circle', ['==', 'c_mun', '']);

        const specialty = specialtyMenu.value;
        map.setFilter('municipality-circle', ['all', ['==', '$type', 'Point'], ['==', 'specialty', specialty]]);
    });

    // Añadir un geocoder para buscar municipios
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search for a municipality...',
    });

    // Añadir el geocoder al mapa
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

    // Cuando se seleccione un municipio a través del geocoder, ajustar el zoom del mapa para que se vea
    // el círculo alrededor del municipio con el radio que indica la distancia al centro médico más cercano
    geocoder.on('result', (e) => {
        const municipality = e.result.geometry;
        const specialty = specialtyMenu.value;
        const radius = municipality.properties[`distance_${specialty}`];
        map.fitBounds(municipality.bounds, { padding: 20 });
    });
});
