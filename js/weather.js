function getCoordinates(callback)
{
    const API_KEY = '928d04e30fff4119841f12df9c1f0709';

    // Fill coordinates
    $.getJSON('/data/cities_clean.json', function(data)
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
                url: `${url}/${data[x].latitude},${data[x].longitude}?units=si`,
                dataType: 'jsonp',
                data: {
                    format: "json"
                },
                success: (res) =>
                {
                    lat = data[x].latitude;
                    lon = data[x].longitude;

                    coordinates.push(new Coordinate(lat, lon, res, data[x].name));

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

class Coordinate
{
    constructor(x, y, data, name)
    {
        this.lat = x;
        this.lon = y;
        this.data = data;
        this.name = name;
    }
}