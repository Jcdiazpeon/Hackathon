let weatherCoordinates, userLocation,
    heatmap;

let reasons = [];

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

function isDanger(coordData, showReasoning)
{
    let data = coordData.data.currently;

    if(data.precipType === "rain" && data.precipIntensity > 4) // In reality this would be like 20 but for showcasing we made it really low
    {
        if(showReasoning)
            reasons.push({name: coordData.name, why: `The rain has an intensity of ${data.precipIntensity} mm/hr`});
        return true;
    }
    else if(data.precipType === "snow" && data.precipIntensity > 8)
    {
        if(showReasoning)
            reasons.push({name: coordData.name, why: `The snow has an intensity of ${data.precipIntensity} mm/hr`});
        return true;
    }
    else if(data.precipType === 'sleet' || data.precipType === 'hail')
    {
        if(showReasoning)
            reasons.push({name: coordData.name, why: `It's ${data.precipType}ing.`});
        return true;
    }
    else if(data.windSpeed > 20)
    {
        if(showReasoning)
            reasons.push({name: coordData.name, why: `The wind has an speed of ${data.windSpeed} m/s`});
        return true;
    }
    else if(data.visibility < 6)
    {
        if(showReasoning)
            reasons.push({name: coordData.name, why: `The visibility is only ${data.visibility} km`});
        return true;
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

    const slap = function(c)
    {
        dataToFill.data.push({lat: c.lat, lng: c.lon, count: 1});
    }

    for(let i = 0; i < weatherCoordinates.length; i++)
    {
        if(!options || options.danger)
        {
            if(isDanger(weatherCoordinates[i], true))
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

function giveReasoning()
{
    if(reasons.length > 0)
    {
        let msg = 'Reasons counties are dangerous';
        reasons.forEach(r =>
        {
            msg += '\n' + r.name + ': ' + r.why;
        });
        alert(msg);
    }
    else
        alert('No counties are dangerous.');
}