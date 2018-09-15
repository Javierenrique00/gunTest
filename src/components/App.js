import React, { Component } from 'react';
import Gun from 'gun';
import {sendPool, createPool,prgRecivePool} from "./gunServices.js";


function PaintVectAcumula(props){
    return (<div>
        {JSON.stringify(props.vect)}
    </div>     
    )
}

class TestSpeed extends React.Component {
    constructor(props){
        super(props);
        this.ciclo = 0;
        this.handleInterval;
        this.handleIntervalReceiver;
        this.dataPacket;
        this.acumula = 0;
        this.antAcumula = 0;
        this.vectAcumula = [];
        this.state = {
            radio1: true,
            radio2: false,
            selectValue: "500",
            textValue: "1",
            packetValue: "10",
            packetsReceived: 0,
            vectAcumula:[],
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.selectChange = this.selectChange.bind(this);
        this.textChange = this.textChange.bind(this);
        this.packetChange = this.packetChange.bind(this);
    
        //-- inicializa gun
        this.gun=Gun(location.origin+'/gun');
        console.log("GUN location.origin="+location.origin);
        window.gun = this.gun; //To have access to gun object in browser console

    }

    handleChange(event) {
        this.setState({radio1: !this.state.radio1, radio2: !this.state.radio2})
    }

    selectChange(event){
        this.setState({selectValue: event.target.value});
        //console.log("Seleccionado:"+event.target.value);
    }

    textChange(event){
        var re = /^\d{1,10}[KM]?$/;  //-- Un número de hasta 10 gigitos con una K o M al final
        let texto = event.target.value.toUpperCase();
        if(re.exec(texto)){
            this.setState({textValue: texto})
            //console.log("Valor:"+texto);
        }

    }

    packetChange(event){
        this.setState({packetValue: event.target.value});
    }

    myTimerReceiver(scope){
        scope.ciclo++;
        let ind = scope.ciclo % 10;
        scope.vectAcumula[ind] = scope.acumula - scope.antAcumula;
        scope.antAcumula = scope.acumula; 
        if(ind==0){
            scope.setState({packetsReceived:scope.acumula,vectAcumula:scope.vectAcumula});
        }
        
    }


    myTimeoutFunction(scope){
        scope.ciclo++;
        //console.log("Ciclo:"+scope.ciclo);
        if(scope.ciclo+1>scope.state.packetValue && scope.state.packetValue!=0) clearInterval(scope.handleInterval);
        sendPool(scope.dataPacket);
        }

    handleSubmit(event){
        event.preventDefault();
        this.ciclo = 0;
        this.acumula = 0;
        function convNumber(valin){
            var reK = /K$/;
            if(reK.exec(valin)) return valin.slice(0,-1)*1000;
            var reK = /M$/;
            if(reK.exec(valin)) return valin.slice(0,-1)*1000000;
            return valin*1.0;
        }
        // console.log("Transmisor:"+ this.state.radio1);
        // console.log("Tiempo entre paquetes:"+this.state.selectValue);
        // console.log("Tamano paquetes:"+this.state.textValue+" conv="+convNumber(this.state.textValue));
        // console.log("Numero de paquetes:"+this.state.packetValue);
    
        if(this.state.radio2){
            //-- recibe los paquetes
            prgRecivePool(this);
            this.handleIntervalReceiver = setInterval(this.myTimerReceiver,100,this);
        }
        else{
            //-- transmite los paquetes
            this.dataPacket = createPool(convNumber(this.state.textValue));
            this.handleInterval = setInterval(this.myTimeoutFunction,this.state.selectValue,this);
        }
    }


    render(){
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="radio" name="tipo" onChange={this.handleChange} checked={this.state.radio1}/>Transmisor<br/>
                    <input type="radio" name="tipo" onChange={this.handleChange} checked={this.state.radio2}/>Receptor<br/>
                    <div hidden={this.state.radio2}>
                        <br/>Tiempo entre paquetes:<br/>
                        <select value={this.state.selectValue} onChange={this.selectChange}>
                            <option value="50">50ms</option>
                            <option value="75">75ms</option>
                            <option value="100">100ms</option>
                            <option value="150">150ms</option>
                            <option value="200">200ms</option>
                            <option value="250">250ms</option>
                            <option value="300">300ms</option>
                            <option value="400">400ms</option>
                            <option value="500">500ms</option>
                            <option value="1000">1000ms</option>
                        </select>
                        <br/>
                        <br/>
                        Tamaño del paquete: #(K,M) bytes
                        <br/>
                        <input type="text" onChange={this.textChange} value={this.state.textValue}/>
                        <br/>
                        <br/>
                        Grupo de paquetes: (0 es infinito)
                        <br/>
                        <input type="number" onChange={this.packetChange} value={this.state.packetValue}/>
                        <br/>
                        <br/>
                    </div>
                    <div hidden={this.state.radio1}>
                        <br/>
                        Paquetes recibidos:{this.state.packetsReceived}<br/>
                        <PaintVectAcumula vect={this.state.vectAcumula}/>
                        <br/>
                        <br/>
                    </div>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )};

}

export default TestSpeed;