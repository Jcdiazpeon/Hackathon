

function getCoordinates()
{
    const API_KEY = 'b0d48880090d49e9dcc76306507a83b6';

    let coordinates = [];

    // Fill coordinates
    $.getJSON('file:///C:/Users/cl20copet/Documents/GitHub/Hackathon/data/counties.json', function(data)
    {
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
        
        for(let x = 0; x < data.length; x++)
        {
            lat = data[x].latitude;
            lon = data[x].longitude;

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
                    coordinates.push(new Coordinate(lat, lon, res));
                    // ex: coordinates.push(new Coordinate(lat, lon, weather data extracted from res));
                }
            }); 
        }
    });    

    return coordinates;
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