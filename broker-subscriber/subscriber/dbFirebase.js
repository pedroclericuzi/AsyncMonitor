/*const { Observable, Subject, ReplaySubject, from, interval, of, timer, fromEvent } = require('rxjs');
const { map, filter, switchMap, reduce, combineLatest } = require('rxjs/operators');*/

const firebase = require('firebase-admin');
const servicosConta = require("./serviceAccountKey.json");
// Initialize Firebase
firebase.initializeApp({
  credential: firebase.credential.cert(servicosConta), 
  databaseURL: "https://rxmonitor-566e5.firebaseio.com"
});

exports.statusEnergia = function(p, s, v){
  firebase.database().ref('energia/status/').set({
    porcentagem : p,
    status : s,
    valor : v
  });
}

exports.statusAgua = function(l, s, v){
  firebase.database().ref('agua/status/').set({
    litros : l,
    status : s,
    valor : v
  });
}

//Altera os dados cadastrados no dispositivo
exports.definicoes = function(dia, mes, meta, topico){
  firebase.database().ref(''+topico+'/definicoes/').set({
    dia : dia,
    mes : mes,
    meta : meta
  });
}


//Recupera os dados cadastrados no dispositivo
exports.getDefinicoes = function(topico){
  var leitura = {};
  var starCountRef = firebase.database().ref(''+topico+'/definicoes/');
  starCountRef.on("value", function(snapshot) {
    leitura = snapshot.val();
  });

  /*var starCountRef = firebase.database().ref('energia/definicoes/');
  fromEvent(starCountRef, 'value').subscribe(function (snap) {
    leitura = snap.val();
  });*/

  return leitura;
}