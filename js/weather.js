/**
 * Gets all the weather data for all the coordinates required
 * @param {Function} callback The function to call with the coordinates found as the first argument once everything has been loaded
 */
function getCoordinates(callback)
{
    const API_KEY = '9f925fde587e40fde8e97b28aa066a7a';

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

/**
 * A simple object that stores 4 variables
 */
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