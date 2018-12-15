let weatherCoordinates;

let myOptions =
{
    zoom: 5,
    center: new google.maps.LatLng(40, -70)
};

// standard map
let map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

let direction = new DirectionsService();
let renderer = new DirectionsRenderer();

direction.route(new DirectionRequest(
    {
        origin: LatLng | String | google.maps.Place,
        destination: "School",
        travelMode: Driving,
        provideRouteAlternatives: true,
        avoidFerries: true,
        avoidHighways: false,
        avoidTolls: false,
    }
),
function(result, status)
    {
        console.log(result);
    }
);

// heatmap layer
let heatmap = new HeatmapOverlay(map, 
    {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        "radius": 0.35,
        "maxOpacity": 0.3, 
        // scales the radius based on map zoom
        "scaleRadius": true, 
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries 
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'count'
    }
);

getCoordinates(function(coords)
{
    weatherCoordinates = coords;
    fillHeatmap();
    
    // if (navigator.geolocation)
    // {
    //     navigator.geolocation.getCurrentPosition((position) =>
    //     {
    //         if(position)
    //         {
    //             searchSchools(position, (data) =>
    //             {
    //                 console.log(data);
    //             });
    //         }
    //     });
    // }
    // else
    // {
    //     alert("Geolocation is not supported by this browser. Stop using internet explorer.");
    // }
});

function isDanger(data)
{
    if(data.precipType === "rain")
    {
        if(data.precipIntensity > 0.01)
            return true;
    }
    else if(data.precipType === "snow")
    {

    }
    return false;
}

// function searchSchools(pos, callback)
// {
//     infowindow = new google.maps.InfoWindow(document.getElementById('map-canvas'));
//     var service = new google.maps.places.PlacesService('map-canvas');
//     service.nearbySearch({
//     location: pos,
//     radius: 500,
//     type: ['school']
//     }, callback);
// }

function fillHeatmap(options)
{
    let dataToFill =
    {
        max: 1,
        data: []
    };

    if(!options)
    {
        for(let i = 0; i < coords.length; i++)
            if(isDanger(coords[i].data.currently))
                dataToFill.data.push({lat: coords[i].lat, lng: coords[i].lon, count: 1});
    }
    else
    {
        
    }

    heatmap.setData(dataToFill);
}

$("#weatherDataForm").submit(e =>
{
    e.preventDefault();

    let precip = $('#precip').val();
    let precipAmt = $('#precipPercent').val();
    let danger = $('#danger').prop('checked');

    fillHeatmap(
        {
            precipitationType: precip,
            precipAmount: precipAmt ? precipAmt / 100 : null,
            danger: danger
        });

    return false;
});