const { Observable, Subject, ReplaySubject, from, fromArray, of, timer, distinct } = require('rxjs');
const { map, filter, switchMap, reduce, scan, distinctUntilChanged } = require('rxjs/operators');
const mqtt = require('mqtt');
//const client = mqtt.connect('mqtt://192.168.0.15:3000');
const client = mqtt.connect('mqtt://192.168.0.9:3000');
var valorReal = 0;

var diaLeitura = 31;
var mesLeitura = 5;
var meta = 0.1;
client.on('connect', () => {
    console.log('connected');
    client.subscribe("energia");
	//var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	//var firstDate = new Date(2008,01,12);
	//var secondDate = new Date(2008,01,22);
	//var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
	//console.log("diffDays: " + diffDays + " - Milli: " + oneDay);
	//const source = timer(0, oneDay * diffDays).subscribe(val => {
	//},
	//error => console.log(""+error));
})

client.on('message', (topico, messagem) => {
	//console.log('received message %s %s', topic, message)
	read(messagem, meta, diaLeitura);
})

function read(value, meta, diaLeitura){
	var valueToArray = [value];
	of(valueToArray)
	.pipe(map(num => ((num / 1000) * 0.0013888888888889)*0.69))
	.pipe(reduce((total,price) => total + price, valorReal))
	.subscribe(dado => {
			valorReal = dado;
			var d = new Date();
			var mesAtual = d.getUTCMonth() + 1;
			var hoje = d.getUTCDate();
			var cmpDatas = [hoje+""+mesAtual, diaLeitura+""+mesLeitura];
			const source = from(cmpDatas);
			if(cmpDatas[0] === cmpDatas[1]){
				//Se o mes for igual, mudo a data aqui e mando pro banco
				console.log(mesLeitura);
				mesLeitura++;
			} else {
				var porcentagem = (valorReal * 100)/meta
				if(porcentagem<80){ //evento disparado aqui
					console.log("valorReal < 80% = " + porcentagem);// + " - " +  "porcentagem: " + porcentagem);
				}
				if(porcentagem>=80 && porcentagem<100){ //evento disparado aqui
					console.log("valorReal entre 80% = " + porcentagem);
				}
				if(porcentagem>=100){ //evento disparado aqui
					console.log("valorReal igual ou acima de 100% = " + porcentagem);
				}
			}
		},
		error => console.log("Erro: "+error));
};