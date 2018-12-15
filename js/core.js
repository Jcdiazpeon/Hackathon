let weatherCoordinates, userLocation,
    heatmap;

if (navigator.geolocation)
{
    navigator.geolocation.getCurrentPosition(pos =>
    {
        userLocation = pos.coords;
        run();
    });
}
else
{
    alert('You are using a browser that is 10 years out of date. Stop it now.');
}

function route()
{
    let direction = new google.maps.DirectionsService();
    let renderer = new google.maps.DirectionsRenderer();
    let request = {
        origin: new google.maps.LatLng(userLocation.latitude, userLocation.longitude),
        destination: "School",
        travelMode: "DRIVING",
        provideRouteAlternatives: true,
        avoidFerries: true,
        avoidHighways: false,
        avoidTolls: false,
    };

    direction.route(request, function(result, status)
    {
        if(status == "ok")
        {
            renderer.setDirections(result);
        }
    });
}

function run()
{
    // standard map
    let map = new google.maps.Map(document.getElementById("map-canvas"), 
    {
        zoom: 5,
        center: new google.maps.LatLng(userLocation.latitude, userLocation.longitude)
    });
    
    route();

    // heatmap layer
    heatmap = new HeatmapOverlay(map, 
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
    });

    getCoordinates(function(coords)
    {
        weatherCoordinates = coords;
        fillHeatmap();
    });
}

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

function fillHeatmap(options)
{
    heatmap.setData({data:[]});

    let dataToFill =
    {
        max: 1,
        data: []
    };

    let slap = function(c)
    {
        dataToFill.data.push({lat: c.lat, lng: c.lon, count: 1});
    }

    for(let i = 0; i < weatherCoordinates.length; i++)
    {
        if(!options || options.danger)
        {
            if(isDanger(weatherCoordinates[i].data.currently))
                slap(weatherCoordinates[i]);
        }
        else
        {
            let c = weatherCoordinates[i];

            /*
apparentTemperature: 40.11
cloudCover: 0.24
dewPoint: 36.94
humidity: 0.78
icon: "clear-day"
nearestStormDistance: 0
ozone: 294.56
precipIntensity: 0
precipProbability: 0
pressure: 1020.73
summary: "Clear"
temperature: 43.42
time: 1544903566
uvIndex: 0
visibility: 10
windBearing: 47
windGust: 6.54
windSpeed: 5.56

apparentTemperature: 44.88
cloudCover: 0.94
dewPoint: 45.17
humidity: 0.92
icon: "rain"
nearestStormDistance: 0
ozone: 298.42
precipIntensity: 0.0723
precipIntensityError: 0.014
precipProbability: 1
precipType: "rain"
pressure: 1016.47
summary: "Rain"
temperature: 47.5
time: 1544903564
uvIndex: 1
visibility: 5.56
windBearing: 63
windGust: 8.34
windSpeed: 5.67

            */

            if(options.precipitationType && !(c.data.currently.summary.toLowerCase().includes(options.precipitationType)))
                continue;
            if(options.precipAmount && !(options.precipAmount <= c.data.currently.precipAmount))
                continue;
            if(options.windSpeed && !(options.windSpeed <= c.data.currently.windSpeed))
                continue;
            if(options.visibility && !(options.visibilityPercent <= c.data.currently.visibility))
                continue;
            if(options.humidity && !(options.humidityPercent <= c.data.currently.humidity))
                continue;
            
            console.log(c.data);
            slap(c);
        }
    }

    heatmap.setData(dataToFill);
}

$("#weatherDataForm").submit(e =>
{
    e.preventDefault();

/*
<label>Wind Speed (km/h)</label>
                    <input type="number" id="windSpeed" />

                    <label>Visibility %</label>
                    <input type="number" id="visibilityPercent" />

                    <label>Humidity %</label>
                    <input type="number" id="humidityPercent" />
*/

    let precip = $('#precip').val();
    let precipAmt = $('#precipPercent').val();
    let windSpeed = $('#windSpeed').val();
    let visibilityPercent = $('#visibilityPercent').val();
    let humidityPercent = $('#humidityPercent').val();
    let danger = $('#danger').prop('checked');

    console.log(precipAmt / 100)

    fillHeatmap(
        {
            precipitationType: precip.toLowerCase(),
            precipAmount: precipAmt / 100,
            danger: danger,
            windSpeed: windSpeed,
            visibilityPercent: visibilityPercent / 100,
            humidityPercent: humidityPercent / 100
        });

    return false;
});