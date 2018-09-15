import React, { Component } from 'react';
import Gun from 'gun';


class TestSpeed extends React.Component{
constructor(props){
super(props);
        this.cambio = false;
        this.tope = 0;
        this.ciclo =0;
        this.rX = 0;
        this.tX = 0;
        this.machine="B";
        this.state = {
            ciclo: 0,
            machine: "B",
            rX: 0,
            tX: 0,
            tope:0,
        }
        this.handleClick = this.handleClick.bind(this);
        //-- inicializa gun
        this.gun=Gun(location.origin+'/gun');
        console.log("GUN location.origin="+location.origin);
        window.gun = this.gun; //To have access to gun object in browser console
    }




    initMainLoop(scope){
        
        let tempMachine=scope.state.machine;
        scope.setState({tope: scope.tope,ciclo: scope.ciclo,rX:scope.rX,tX:scope.tX,machine:scope.machine})
        scope.tope = 0;
        scope.ciclo+=1;

        if(tempMachine=="B" && (scope.rX<scope.ciclo)){
            //--transmite un paquete como B
            let stateB = scope.gun.get("pool4").get("stateB");
            scope.tX++;
            stateB.put({tX: scope.tX});
        }
        if(tempMachine=="A" && (scope.rX<scope.ciclo)){
            //--transmite un paquete como A
            let stateA = scope.gun.get("pool4").get("stateA");
            scope.tX++;
            stateA.put({tX: scope.tX});
        }

        //--- si llega a 5 segundos y no ha recibido paquetes se cambia a A
        if(scope.ciclo>5 && tempMachine=="B" && !scope.cambio ){
            scope.cambio = true;
            //--Cancela suscripcion a A
            console.log("--cambiando a grupo A")
            let stateA = scope.gun.get("pool4").get("stateA");
            // stateA.off();

            scope.tX++;
            scope.machine = "A";
            //--transmite paquete
            stateA.put({tX: scope.tX});

            //-- Pone suscripción a B
            let stateB = scope.gun.get("pool4").get("stateB");
            stateB.on(function(valor){
                if(scope.state.machine=="A"){
                    //-- llegó paquete   
                    scope.rX+=1;
                    scope.tope++;
                    if(scope.tope<10){
                        //console.log("--Llego paquete a stateB--- Suscripcion cambiada");
                        //-- transmite a A porque es A
                        scope.tX+=1;
                        stateA.put({tX: scope.tX});
                    }
                }
            });
        }
    }

    componentWillMount(){
        let scope = this;
        setInterval(this.initMainLoop,1000,this);
        //--Poner suscripción a A, porque por defecto es la maquina B
        let stateA = scope.gun.get("pool4").get("stateA");
        stateA.on(function(valor){
            if(scope.state.machine=="B"){
                //console.log("--Llego paquete a stateA--- Suscripcion original");
                //-- Llego paquete
                scope.rX+=1;
                scope.tope++;
                if(scope.tope<10){
                    scope.tX+=1;
                    //-- transmite a B porque es B
                    let stateB = scope.gun.get("pool4").get("stateB");
                    stateB.put({tX: scope.tX});
                }

            }
        });

    }

    handleClick(e){
        e.preventDefault();
        console.log("Start---");
        this.cambio = true;
    }

    render(){
        return (
            <div>
                <h1> Pueba de velocidad</h1>
                <br/>
                {this.state.ciclo}
                <br/>
                Machine:{this.state.machine}
                <br/>
                tX={this.state.tX}
                <br/>
                rX={this.state.rX}
                <br/>
                tope={this.state.tope}
                <br/>
                <button onClick={this.handleClick}>
                Inicia Test
                </button>
            </div>
        )
    }

}

export default TestSpeed;