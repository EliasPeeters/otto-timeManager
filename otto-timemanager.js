const express = require('express');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const fs = require('fs');

app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('assets'));


app.get('/', async (req, res) => {
    let timeString = req.query.time;
    if (timeString == null) {
        timeString = createTimeString(getCurrentTime());
    }
    const currentTime = readTimeString(timeString);
    const checkIn = currentTime;
    const sevenAndHalf = calcTime(currentTime.hour, currentTime.minute, 8, 20);
    const tenHour = calcTime(currentTime.hour, currentTime.minute, 10, 50);

    const percentage = getPercentage(checkIn, tenHour, sevenAndHalf);
    console.log(percentage)

    const svg = Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        <svg width="100%" height="100%" viewBox="0 0 1920 400" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,1700.81,-19.161)">
                <text x="44.002px" y="340.285px" style="font-family:'Futura-Medium', 'Futura', sans-serif;font-weight:500;font-size:64px;fill:white;">${createTimeString(tenHour)}</text>
            </g>
            <g transform="matrix(1,0,0,1,1310.06,-19.161)">
                <text x="41.596px" y="340.285px" style="font-family:'Futura-Medium', 'Futura', sans-serif;font-weight:500;font-size:64px;fill:white;">${createTimeString(sevenAndHalf)}</text>
            </g>
            <g transform="matrix(1,0,0,0.664759,32.4688,36.9712)">
                <rect x="46.946" y="102.077" width="1773.01" height="175.361" style="fill:white;fill-opacity:0.27;"/>
            </g>
            <g transform="matrix(1,0,0,1,17.751,-37.4172)">
                <rect x="85.332" y="167.87" width="${percentage * 1740}" height="65.324" style="fill:white;"/>
            </g>
            <g transform="matrix(0.525369,0,0,0.623741,1390.56,33.4282)">
                <rect x="73.498" y="67.628" width="45.05" height="280.578" style="fill:rgb(89,89,89);"/>
            </g>
            <g transform="matrix(0.525369,0,0,0.623741,1790.14,33.4282)">
                <rect x="73.498" y="67.628" width="45.05" height="280.578" style="fill:rgb(89,89,89);"/>
            </g>
            <g transform="matrix(0.525369,0,0,0.623741,40.8012,33.4282)">
                <rect x="73.498" y="67.628" width="45.05" height="280.578" style="fill:rgb(89,89,89);"/>
            </g>
            <g transform="matrix(1,0,0,1,-36.691,-19.161)">
                <text x="61.408px" y="340.285px" style="font-family:'Futura-Medium', 'Futura', sans-serif;font-weight:500;font-size:64px;fill:white;">${createTimeString(checkIn)}</text>
            </g>
            
        </svg>
        `
      );
    let image = await sharp(svg)
      .png()
      .toBuffer()
      
      .catch(function(err) {
        console.log(err)
      })
      
      res.contentType('image/png');
      res.end(image, 'binary');
    //res.sendFile(__dirname + '/assets/quickCheckin.svg')
})


const port = 8090;
app.listen(port, () => {
    console.log(`Running on port ${port}`)
})


function readTimeString(timeString) {
	return {
  		hour: timeString.substring(0, 2),
  		minute: timeString.substring(3, 5)
	}
}

function createTimeString(timeObject) {
 	return timeObject.hour + ':' + timeObject.minute; 
}

function calcTime(hour, minute, addHour, addMinute) {
	let newMinute = parseInt(minute) + parseInt(addMinute);
	let uebertrag = 0;
	if (newMinute >= 60) {
  		uebertrag = Math.trunc(newMinute / 60); 
		newMinute = (newMinute % 60) 
	}
	let newHour = (parseInt(hour) + parseInt(addHour) + uebertrag) % 24;
	return {
  		hour: newHour < 10 ? '0' + newHour:newHour,
    	minute: newMinute < 10 ? '0' + newMinute:newMinute
	}
}

function getCurrentTime() {
	let dateTime = new Date()

	let hour = dateTime.getHours() < 10 ? '0' + dateTime.getHours():dateTime.getHours();
	let minute = dateTime.getMinutes() < 10 ? '0' + dateTime.getMinutes():dateTime.getMinutes();
  	return {hour: hour, minute: minute}
}

function getPercentage(checkIn, tenHour, currentTime = getCurrentTime()) {
    let checkInMinutes = parseInt(checkIn.hour) * 60 + parseInt(checkIn.minute);
    let tenHourMinutes = tenHour.hour * 60 + parseInt(tenHour.minute);
    let currentTimeMinutes = currentTime.hour * 60 + parseInt(currentTime.minute);
    console.log(checkInMinutes)
    console.log(tenHourMinutes)
    console.log(currentTimeMinutes)
    return (currentTimeMinutes-checkInMinutes)/(tenHourMinutes-checkInMinutes)
}
