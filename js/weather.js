function getCoordinates()
{
    let coordinates = [];

    // Fill coordinates
    let url = `https://api.darksky.net/forecast/${API_KEY}`;

    let lat, lon;

    $.ajax(
    {
        method: 'GET',
        url: `${url}/${lat},${lon}`,
        dataType: 'jsonp',
        data: {
            format: "json"
        },
        success: (res) =>
        {
            console.log(res);
            // Do stuff with res
            // ex: coordinates.push(new Coordinate(lat, lon, weather data extracted from res));
        }
    });

    
    return coordinates;
}

class Coordinate
{
    constructor(x, y, data)
    {
        this.lat = x;
        this.y = y;
        this.data = data;
    }
}