const pool = "pool1";
const group = "group1";

export function sendPool(data){
    gun.get(pool).get(group).set(data);  
}

export function createPool(tama){
    let cadena='';
    let max=0;
    //-- el tamano de los datos

    let grupos100=Math.floor(tama/100);
    let residuo100=tama % 100;

    let data={};
    for(let x=0;x<grupos100;x++){
        data["datos"+x]="0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
        max = x ;
    }

    for(let x=0;x<residuo100;x++){
        cadena+=x%10;
    }
    if(cadena!=''){
        data["datos"+(max+1)]=cadena;
    }
    //console.log(data);
    return data;
}

export function prgRecivePool(scope){
    gun.get(pool).get(group).map().on(
        function(data){
            let reP = /^datos/;

            let llaves=Object.keys(data);
            let valores=Object.values(data);
            let longitud = llaves.length;
            let acumula = 0;
            for(let x=0;x<longitud;x++){
                //console.log("Par("+x+"):"+"llave("+llaves[x]+"):"+valores[x].length);
                if(reP.exec(llaves[x]))
                acumula += valores[x].length;
            }
            let trae = scope.acumula;
            //console.log("Receive ant:"+trae+"-"+acumula);
            trae+=acumula;
            scope.acumula = trae;
        })

}

// gun.get("pool1").get("group1").map().once(function(data){console.log(data)})