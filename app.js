// === CONFIG ===

// map center
var LATLNG_CENTER = { 'lat': 36.97513 , 'lng': -122.024117 }; // Santa Cruz, dude

// set initial zoom level
var ZOOM = 14;

// Define default and highlight styles for the parcel polygons
var defaultParcelStyle = {
        color: '#009900',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5,
        fillColor: '#00FF00'
    },
    selectedParcelStyle = {
        color: '#2262CC',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.5,
        fillColor: '#2262CC'
    };

// 
function createPopupContent(properties) {
    
    var address = createAddressString(properties),
        zoning = createZoningString(properties),
        lease = createLeaseString(properties),
        use = createUseString(properties),
        footage = createFootageString(properties),
        details = '<div>' + 
                  '<h3>Address</h3><p>' + address + '</p>' +
                  '<h3>Zoning</h3><p>' + zoning + '</p>' +
                  '<h3>APN</h3><p>' + properties.APN + '</p>' +
                  '<h3>Lease</h3><p>' + lease + '</p>' +
                  '<h3>Use</h3><p>' + use + '</p>' +
                  '<h3>Square Footage</h3><p>' + footage + '</p>' +
                  '<h3>Contact</h3><p>' + '[coming soon]' + '</p>' +
                  '</div>';
        
        return details;
}

// TODO make this work for craigslist data
function createAddressString(properties) {
    
    var address = '';
    
    if (properties.property_address_street) {
        address = properties.property_address_street;
    }
    
    if ( (properties.property_address_street) && ( (properties.property_address_city) || (properties.property_address_state) || (properties.property_address_zip) ) ) {
        address = address + '<br>';
    }
    
    if (properties.property_address_city) {
        address = address + properties.property_address_city;
    }
    
    if ( (properties.property_address_city) && (properties.property_address_state) ) {
        address = address + ', ';
    }
    
    if (properties.property_address_state) {
        address = address + properties.property_address_state;
    }
    
    if ( (properties.property_address_state) && (properties.property_address_zip) ) {
        address = address + ' ';
    }
    
    if (properties.property_address_zip) {
        address = address + properties.property_address_zip;
    }
    
    return address;
    
}


function createZoningString(properties) {
    
    var zoning = '';
    
    if (properties.property_zoning_1_full) {
        zoning = properties.property_zoning_1_full;
    }
    
    if (properties.property_zoning_1_full && properties.property_zoning_2_full) {
        zoning = zoning + ' and ';
    }
    
    if (properties.property_zoning_2_full) {
        zoning = zoning + properties.property_zoning_2_full;
    }
    
    if ( (properties.property_zoning_2_full && properties.property_zoning_3_full)
         ||
         (properties.property_zoning_1_full && properties.property_zoning_3_full) ) {
        zoning = zoning + ' and ';
    }
    
    if (properties.property_zoning_3_full) {
        zoning = zoning + properties.property_zoning_3_full;
    }
    
    return zoning;
}

function createLeaseString(properties) {
    
    var lease = '';
    
    if (properties.property_gross) {
        lease = '$' + properties.property_gross + '/ft<sup>2</sup> gross (<a href="#">What does this mean?</a>)';
    }
    
    if (properties.property_nnn) {
        lease = '$' + properties.property_nnn + '/ft<sup>2</sup> NNN (<a href="#">What does this mean?</a>)';
    }
    
    if (lease === '') {
        lease = 'Lease terms unlisted. Lame.';
    }
    
    return lease;
    
}

// TODO 'use' will be a reserved word, change this.
function createUseString(properties) {
    
    var use = '';
    
    if (properties.property_use_type_simple) {
        use = properties.property_use_type_simple;
    }
    
    return use;
    
}

// 
function createFootageString(properties) {
    
    var footage = '';
    
    if (properties.property_footage) {
        footage = properties.property_footage + ' ft<sup>2</sup>';
    }
    
    if (properties.property_footage && properties.property_footage_range) {
        footage = footage + '<br>';
    }
    
    if (properties.property_footage_range) {
        footage = footage + '(Range of ' + properties.property_footage_range + ' ft<sup>2</sup>)';
    }
    
    return footage;
    
}

// 
function createPopup(event, layer, properties) {
    
    // Change the style to the highlighted version
    layer.setStyle(selectedParcelStyle);
    
    // Create a popup with a unique ID linked to this record
    var popup = $('<div></div>', {
        'id':    'popup-' + properties.APN,
        'class': 'popup'
    });
    
    // Create popup content
    var popupContent = createPopupContent(properties);
    
    // Append popup content to the popup
    $(popupContent).appendTo(popup);

    // Add the popup to the detail
    popup.appendTo('#detail');
}

//
function destroyPopup(event, layer, properties) {
    
    // Reverting the style to default
    layer.setStyle(defaultParcelStyle);
    
    // Destroy the popup
    $('#popup-' + properties.APN).remove();
    
}

// Onready...
$(document).ready(function() {
    
    // === MAP ===
    
    // Create map object and point it to <div id="map">
    var map = new L.Map('map');
    
    // Set map center
    var mapCenter = new L.LatLng(LATLNG_CENTER['lat'], LATLNG_CENTER['lng']);
    
    // Set initial zoom level
    var mapZoom = ZOOM;
    
    // === BASE LAYER ===
    
    // Create base layer (using Toner tiles from Stamen)
    var baseUrl = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.jpg',
        attrib = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
        baseLayer = new L.TileLayer(baseUrl, {attribution: attrib, maxZoom:18});
    
    // Add the base layer to map
    map.addLayer(baseLayer);
    
    // Center and zoom on base layer
    map.setView(mapCenter, mapZoom);
    
    // === AVAILABLE PARCEL LAYER ===
    
    // Create an empty layer where we will load the parcel polygons
    var parcelLayer = new L.GeoJSON();
    
    // Define what happens to each polygon just before it is loaded onto
    // the map. This is Leaflet's special way of goofing around with your
    // data, setting styles and regulating user interactions.
    parcelLayer.on('featureparse', function (e) {
        
        // Load the default style
        e.layer.setStyle(defaultParcelStyle);
        
        // Create a self-invoking function that passes in the layer
        // and the properties associated with this particular record.
        (function(layer, properties) {
        
            var clicked = false;
            
            // On mouseover, show details
            layer.on('mouseover', function (event) {
                
                createPopup(event, layer, properties);
                
            });
            
            /*
            Cases:
            
            1. Initial load:
                  All parcels <default> styling
                  No parcel data showing
            
            2. One parcel is hovered and no parcels are selected:
                  Hovered parcel has <active> styles
                  Show the hovered parcel's data
            
            3. One parcel is clicked:
                  Zoom in on clicked parcel
                  Clicked parcel has <active> styles
                  All other parcels have <default> styles
                  Show the clicked parcel's data
                
            4. One parcel is hovered while another has been clicked on:
                  Do nothing
            */
            
            
            // On click, persist details
            layer.on('click', function (event) {
                
                setTimeout(function(){
                
                    $(document).one('click', function (event) {
                        destroyPopup(event, layer, properties);
                    });
                
                }, 0);
                
                clicked = true;
                
            });
            
            // On mouseout, undo the mouseover changes
            layer.on('mouseout', function (event) {
                
                // Will persist if clicked
                if (!clicked) {
                    destroyPopup(event, layer, properties);
                }
            
            });
          
        
        // Close the "anonymous" wrapper function, and call it while passing
        // in the variables necessary to make the events work the way we want.
        })(e.layer, e.properties);

    });
    
    // Gets all documents from MongoHQ recursively, 100 at a time
    function findParcels(collection, results, skipCount) {
        
        var dataUri = 'https://api.mongohq.com/databases/sitemybiz/collections/' + 
                      collection + '/' +
                      'documents?' +
                      '_apikey=' + 'unyeh7o6sy69tw0lw5y8' + '&' +
                      'limit=' + '100' + '&' + 
                      'skip=' + skipCount;
        
        // keep calling until we cannot get any more data from API
        $.getJSON(dataUri, function(data) {
            if (data.length > 0) {
                results = $.merge(results, data);
                skipCount += 100;
                findParcels(collection, results, skipCount);
            } else {
                // Add GeoJSON for parcel data into the parcel layer
                for (var i = 0; i < results.length; i++) {
                    parcelLayer.addGeoJSON(results[i]);
                }
                
                // Add parcel data layer to map
                map.addLayer(parcelLayer);
            }
        });
    }
    
    // Get parcel data from MongoHQ and plot it
    findParcels('available_parcels' , [], 0);
    
});