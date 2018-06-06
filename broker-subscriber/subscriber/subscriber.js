const { Observable, Subject, ReplaySubject, from, interval, of, timer } = require('rxjs');
const { map, filter, switchMap, reduce, combineLatest } = require('rxjs/operators');
const mqtt = require('mqtt');
const dbfirebase = require('./dbFirebase.js');
//const client = mqtt.connect('mqtt://192.168.0.15:3000');
const client = mqtt.connect('mqtt://192.168.0.4:3000');
var valorReal = 0;
var diaLeitura;
var mesLeitura;
var meta;

dbfirebase.getDefinicoesEnergia();
client.on('connect', () => {
    console.log('connected');
    client.subscribe("energia");
	client.subscribe("agua");

	interval(3000).subscribe(val => {
		var getDefinicoes = dbfirebase.getDefinicoesEnergia();
		diaLeitura = getDefinicoes.dia;
		mesLeitura = getDefinicoes.mes;
		meta = getDefinicoes.meta;
	});

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
	if(meta!='undefined' && topico == "energia"){
		readEnergy(messagem);
	}
	if(meta!='undefined' && topico == "agua"){
		readWater(messagem);
	}
})
//0.0013888888888889
function readEnergy(value){
	of([value])
	.pipe(map(num => ((num / 1000) * 0.00027778)*0.69))
	.pipe(reduce((total,price) => total + price, valorReal))
	.subscribe(dado => {
			valorReal = dado;
			var d = new Date();
			var idDtHoje = d.getUTCDate()+""+(d.getUTCMonth() + 1);
			var idDtLeitura = diaLeitura+""+mesLeitura;
			var cmpDatas = [idDtHoje, idDtLeitura];
			if(cmpDatas[0] === cmpDatas[1]){
				//Se o mes for igual, mudo a data aqui e mando pro banco
				mesLeitura = (mesLeitura+1)%12 + 1;
				valorReal = 0;
				dbfirebase.definicoesEnergia(diaLeitura, mesLeitura, meta);
				dbfirebase.statusEnergia(0, 0, 0);
				console.log("mes: "+mesLeitura);
			} else {
				var porcentagem = (valorReal * 100)/meta
				if(porcentagem<80){ //evento disparado aqui
					dbfirebase.statusEnergia(porcentagem, 0, valorReal);
					console.log("valorReal < 80% = " + porcentagem);// + " - " +  "porcentagem: " + porcentagem);
				}
				if(porcentagem>=80 && porcentagem<100){ //evento disparado aqui
					dbfirebase.statusEnergia(porcentagem, 1, valorReal);
					console.log("valorReal entre 80% = " + porcentagem);
				}
				if(porcentagem>=100){ //evento disparado aqui
					dbfirebase.statusEnergia(porcentagem, 2, valorReal);
					console.log("valorReal igual ou acima de 100% = " + porcentagem);
				}
			}
		},
		error => console.log("Erro: "+error)
	);
}

function readWater(messagem){

}

function readEnergy_Funcional(value){
	var kwh = (value / 1000) * 0.00027778;
	var preco = kwh * 0.69;
	valorReal = valorReal + preco;
	var d = new Date();
	var idDtHoje = d.getUTCDate()+""+(d.getUTCMonth() + 1);
	var idDtLeitura = diaLeitura+""+mesLeitura;
	var cmpDatas = [idDtHoje, idDtLeitura];
	if(cmpDatas[0] === cmpDatas[1]){
		mesLeitura++;
		dbfirebase.definicoesEnergia(diaLeitura, mesLeitura, meta);
		dbfirebase.statusEnergia(0, 0, 0);
		console.log("mes: "+mesLeitura);
	} else {
		var porcentagem = (valorReal * 100)/meta
		if(porcentagem<80){
			dbfirebase.statusEnergia(porcentagem, 0, valorReal);
			console.log("valorReal < 80% = " + porcentagem);
		}
		if(porcentagem>=80 && porcentagem<100){
			dbfirebase.statusEnergia(porcentagem, 1, valorReal);
			console.log("valorReal entre 80% = " + porcentagem);
		}
		if(porcentagem>=100){
			dbfirebase.statusEnergia(porcentagem, 2, valorReal);
			console.log("valorReal igual ou acima de 100% = " + porcentagem);
		}
	}
}