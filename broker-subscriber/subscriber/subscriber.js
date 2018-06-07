const { Observable, Subject, ReplaySubject, from, interval, of, timer } = require('rxjs');
const { map, filter, reduce } = require('rxjs/operators');
const mqtt = require('mqtt');
const dbfirebase = require('./dbFirebase.js');
const client = mqtt.connect('mqtt://192.168.0.11:3001');

//Definicoes de energia
var diaLeituraEnergia;
var mesLeituraEnergia;
var metaEnergia;

//Definicoes da conta de agua
var diaLeituraAgua;
var	mesLeituraAgua;
var metaAgua;

var litros = 0; //valor dos litros de agua utilizados
var valorReal = 0; //valor em real do consumo atual de energia

//dbfirebase.getDefinicoesEnergia();
client.on('connect', () => {
    console.log('connected');
    client.subscribe("energia");
    client.subscribe("agua");

	interval(3000).subscribe(val => {
		var energiaDefinicoes = dbfirebase.getDefinicoes('energia');
		diaLeituraEnergia = energiaDefinicoes.dia;
		mesLeituraEnergia = energiaDefinicoes.mes;
		metaEnergia = energiaDefinicoes.meta;

		var aguaDefinicoes = dbfirebase.getDefinicoes('agua');
		diaLeituraAgua = aguaDefinicoes.dia;
		mesLeituraAgua = aguaDefinicoes.mes;
		metaAgua = aguaDefinicoes.meta;
	});
})

client.on('message', (topico, messagem) => {
	//console.log('received message %s %s', topic, message)
	if(metaEnergia!='undefined' && topico == "energia"){
		readEnergy(messagem);
	}
	if(metaAgua!='undefined' && topico == "agua"){
		var msg = parseFloat(messagem);
		readWater(msg);
	}
})

/* O consumo de água, segundo: https://lojavirtual.compesa.com.br:8443/gsan/exibirConsultarEstruturaTarifariaPortalAction.do
Até 10.000 litros/mês 	41,30
10.001 a 20.000 litros 	4,74
20.001 a 30.000 litros 	5,63
30.001 a 50.000 litros 	7,75
50.001 a 90.000 litros 	9,18
90.001 a 999999.000 litros 	17,65 */
function readWater(msg){
	of([msg])
	.pipe(reduce((total,price) => total + price, litros))
	.subscribe(dado => {
		litros = dado;
		console.log("bool litros " + typeof litros==='number');
		console.log("litros: "+litros);
		if(cmpData (diaLeituraEnergia, mesLeituraEnergia)===true){
			console.log("data igual");
			mesLeituraAgua = (mesLeituraAgua%12) + 1;
			dbfirebase.definicoes(diaLeituraAgua, mesLeituraAgua, metaAgua,'agua');
			dbfirebase.statusAgua(0, 0, 0);
			litros = 0;
		} else {
			console.log("datas diferentes");
			if(litros<=10000){
				dbfirebase.statusAgua(litros,0,41.3);
			} else if(litros>10000 && litros<=20000){
				dbfirebase.statusAgua(litros,0,(41.3+4.74));
			} else if(litros>20000 && litros<=30000){
				dbfirebase.statusAgua(litros,0,(41.3+4.74+5.63));
			} else if(litros>30000 && litros<=50000){
				dbfirebase.statusAgua(litros,0,(41.3+4.74+5.63+7.75));
			} else if(litros>50000 && litros<=90000){
				dbfirebase.statusAgua(litros,0,(41.3+4.74+5.63+7.75+9.18));
			} else if (litros>90000){
				dbfirebase.statusAgua(litros,0,(41.3+4.74+5.63+7.75+9.18+17.65));
			}
		}
	});
}

//0.0013888888888889
function readEnergy(value){
	of([value])
	.pipe(map(num => ((num / 1000) * 0.00027778)*0.69))
	.pipe(reduce((total,price) => total + price, valorReal))
	.subscribe(dado => {
			valorReal = dado;
			if(cmpData (diaLeituraEnergia, mesLeituraEnergia) === true){
				//Se o mes for igual, mudo a data aqui e mando pro banco
				mesLeituraEnergia = (mesLeituraEnergia%12) + 1;
				dbfirebase.definicoes(diaLeituraEnergia, mesLeituraEnergia, metaEnergia,'energia');
				dbfirebase.statusEnergia(0, 0, 0);
				valorReal = 0;
				console.log("mes: "+mesLeituraEnergia);
			} else {
				var porcentagem = (valorReal * 100)/metaEnergia;
				if(porcentagem<80){
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


/*function readEnergy_Funcional(value){
	var kwh = (value / 1000) * 0.00027778;
	var preco = kwh * 0.69;
	valorReal = valorReal + preco;
	var d = new Date();
	var idDtHoje = d.getUTCDate()+""+(d.getUTCMonth() + 1);
	var idDtLeitura = diaLeituraEnergia+""+mesLeituraEnergia;
	var cmpDatas = [idDtHoje, idDtLeitura];
	if(cmpDatas[0] === cmpDatas[1]){
		mesLeituraEnergia++;
		dbfirebase.definicoesEnergia(diaLeituraEnergia, mesLeituraEnergia, meta);
		dbfirebase.statusEnergia(0, 0, 0);
		console.log("mes: "+mesLeituraEnergia);
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
}*/

function cmpData (diaLeitura, mesLeitura){
	var d = new Date();
	var idDtHoje = d.getDate()+""+(d.getMonth() + 1);
	var idDtLeitura = diaLeitura+""+mesLeitura;
	var cmpDatas = [idDtHoje, idDtLeitura];

	if(cmpDatas[0] === cmpDatas[1]){
		return true;
	} else{
		return false;
	}
}