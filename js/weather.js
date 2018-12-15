function getCoordinates(callback)
{
    const API_KEY = '19f72ad7d0e5911653d8e37df08280d7';

    // Fill coordinates
    $.getJSON('/data/counties.json', function(data)
    {
        let coordinates = [];

        let url = `https://api.darksky.net/forecast/${API_KEY}`;

        let lat, lon;
/*
0: Object { name: "Adams County", latitude: 3.046, longitude: 39.869471 }
​
1: Object { name: "Allegheny County", latitude: 14.445, longitude: 40.469757 }
​
2: Object { name: "Armstrong County", latitude: 10.666, longitude: 40.81238 }
​
3: Object { name: "Beaver County", latitude: 9.331, longitude: 40.68414 }
​
4: Object { name: "Bedford County", latitude: 4.608, longitude: 39.99862 }
*/
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
                        callback(coordinates);
                }
            }); 
        }
    });
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