const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.0.4:3000');
var interval = setInterval( function() {
  sendData()
},2000);
client.on('message', () => {
  console.log('message')
});
function sendData()
{
	console.log('publishing');
	client.publish('agua', ""+1000.31);//randomInt(11150, 11180));
	console.log('published');
}
function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}