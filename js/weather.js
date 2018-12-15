function getCoordinates(callback)
{
    const API_KEY = 'e2848e12b7d6c4b0595889bcc8b3096b';
    let debug = false;

    if(debug)
    {
        $.ajax({
            url: '/data/weather.json',
            dataType: 'jsonp',
            success: function (data) {
                callback(JSON.parse('data'));
            }
        });
    }
    else
    {
        // Fill coordinates
        $.getJSON('/data/counties.json', function(data)
        {
            let coordinates = [];

            let url = `https://api.darksky.net/forecast/${API_KEY}`;

            let lat, lon;

            let gotten = 0;

            for(let x = 0; x < data.length; x++)
            {
                $.ajax(
                {
                    method: 'GET',
                    url: `${url}/${data[x].latitude},${data[x].longitude}`,
                    dataType: 'jsonp',
                    data: {
                        format: "json"
                    },
                    success: (res) =>
                    {
                        lat = data[x].latitude;
                        lon = data[x].longitude;

                        coordinates.push(new Coordinate(lat, lon, res));
                        // ex: coordinates.push(new Coordinate(lat, lon, weather data extracted from res));

                        gotten++;
                        if(gotten === data.length)
                        {
                            callback(coordinates);
                        }
                    }
                });
            }
        });
    }
}

class Coordinate
{
    constructor(x, y, data)
    {
        this.lat = x;
        this.lon = y;
        this.data = data;
    }
}