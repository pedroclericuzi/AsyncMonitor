//Prog. reativa vs funcional

/*   PROGRAMACAO REATIVA 	*/

const valores = of(41.3, 4.74, 5.63, 7.75, 9.18, 17.65);
var takeIndex; 
if(litros<=10000){
	takeIndex = valores.pipe(take(1));
} else if(litros>10000 && litros<=20000){
	takeIndex = valores.pipe(take(2));
} else if(litros>20000 && litros<=30000){
	takeIndex = valores.pipe(take(3));
} else if(litros>30000 && litros<=50000){
	takeIndex = valores.pipe(take(4));
} else if(litros>50000 && litros<=90000){
	takeIndex = valores.pipe(take(5));
} else if (litros>90000){
	takeIndex = valores.pipe(take(6));
}

const reduceVal = takeIndex.pipe(reduce((acc, val) => acc + val));
reduceVal.subscribe(val => dbfirebase.statusAgua(litros,0,val));

/*    PROGRAMACAO FUNCIONAL  	*/

var array = [41.3, 4.74, 5.63, 7.75, 9.18, 17.65];
var val = 0;
if(litros<=10000){
	console.log("litros: "+litros);
	var count = 0;
	for (var i = 0; i < 1; i++) {
		count = count + array[i];
		console.log("count: "+count);
	}
	val = count;
} else if(litros>10000 && litros<=20000){
	var count = 0;
	for (var i = 0; i < 2; i++) {
		count = count + array[i];
	}
	val = count;
} else if(litros>20000 && litros<=30000){
	var count = 0;
	for (var i = 0; i < 3; i++) {
		count = count + array[i];
	}
	val = count;
} else if(litros>30000 && litros<=50000){
	var count = 0;
	for (var i = 0; i < 4; i++) {
		count = count + array[i];
	}
	val = count;
} else if(litros>50000 && litros<=90000){
	var count = 0;
	for (var i = 0; i < 5; i++) {
		count = count + array[i];
	}
	val = count;
} else if (litros>90000){
	var count = 0;
	for (var i = 0; i < 6; i++) {
		count = count + array[i];
	}
	val = count;
}
dbfirebase.statusAgua(litros,0,val);