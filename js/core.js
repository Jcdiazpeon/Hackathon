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

function run()
{
    // standard map
    let map = new google.maps.Map(document.getElementById("map-canvas"), 
    {
        zoom: 5,
        center: new google.maps.LatLng(userLocation.latitude, userLocation.longitude)
    });

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
    if(data.precipitationType === "rain" && data.precipIntensity > 10)
        return true;
    else if(data.precipitationType === "snow" && data.precipIntensity > 4)
        return true;
    else if(data.precipitationType === 'sleet' || data.precipitationType === 'hail')
        return true;
    else if(data.windSpeed > 50)
        return true;
    else if(data.visibility < 6)
        return true;

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

    console.log(weatherCoordinates);

    for(let i = 0; i < weatherCoordinates.length; i++)
    {
        if(!options || options.danger)
        {
            if(isDanger(weatherCoordinates[i].data.currently))
                slap(weatherCoordinates[i]);
        }
        else
        {
            // https://darksky.net/dev/docs

            let c = weatherCoordinates[i];

            if(options.precipitationType && !(c.data.currently.summary.toLowerCase().includes(options.precipitationType)))
                continue;
            if(options.precipIntensity && !(options.precipIntensity <= c.data.currently.precipIntensity))
                continue;
            if(options.windSpeed && !(options.windSpeed <= c.data.currently.windSpeed))
                continue;
            if(options.visibility && !(options.visibility >= c.data.currently.visibility))
                continue;
            if(options.humidityPercent && !(options.humidityPercent <= c.data.currently.humidity))
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

    let precip = $('#precip').val();
    let precipAmt = $('#precipIntensity').val();
    let windSpeed = $('#windSpeed').val();
    let visibility = $('#visibility').val();
    let humidityPercent = $('#humidityPercent').val();
    let danger = $('#danger').prop('checked');

    fillHeatmap(
        {
            precipitationType: precip.toLowerCase(),
            precipIntensity: precipAmt,
            danger: danger,
            windSpeed: windSpeed,
            visibility: visibility,
            humidityPercent: humidityPercent / 100
        });

    return false;
});
