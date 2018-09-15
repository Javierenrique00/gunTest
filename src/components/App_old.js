import React, { Component } from 'react';
import Gun from 'gun';
require('gun/lib/path.js');
require('gun-unset/unset.js')
import Home from './Home';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history;
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      xIsNext: !this.state.xIsNext,
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[history.length - 1];
    const winner = calculateWinner(current.squares);

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ============================================================================================

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}


//export default Game;


class MuestraUsersDb extends React.Component {
  constructor(props){
    super(props);
    //this.userList = props.userList;
  
  }

  render(){
    return (
      <div hidden={this.props.hidden}>
        Lista de usuarios
        <br/>
        <ul>
          {
            this.props.usersList.map((map,key)=><li key={key} onClick={e=>this.props.manejaClick(key,e)}>{map.nombre}</li>)
          }
        </ul>
      </div>
    );
  }
}


class Identificacion extends React.Component {
  constructor(props) {
  super(props);
  this.usersList = [];
  this.onlineList = [];
  this.state = {
    value: "",
    enemigo: "",
    hiddenName: true,
    hiddenTablero: true,
    usersList: this.usersList,
    onlineList: this.onlineList,
    juego: "", //-identificación del juego
    user1: "",
    user2: "",
    turno: 0,
    isX:false,
  };
  this.handleChange = this.handleChange.bind(this);
  this.handleSubmit = this.handleSubmit.bind(this);
  //this.loadUsers = this.loadUsers.bind(this);

  //-- inicializa gun
  this.gun=Gun(location.origin+'/gun');
  window.gun = this.gun; //To have access to gun object in browser console
}

  componentWillMount(){
    console.log("--------- se montó el componente")
    this.loadUsers(this);
    this.loadOnlineList(this);
    this.checkJuegosOnline(this);
  }


  loadUsers(scope){
    scope.usersList = [];
      gun.get("UserList").map().once(
        function(data){
          scope.usersList.push({nombre:data.nombre})
          scope.setState({usersList: scope.usersList});
        }) 
  }

  loadOnlineList(scope){
    scope.onlineList = [];
      gun.get("UserList").map().on(
        function(data){
          let tiempoAct = new Date();
          let ahora = tiempoAct.getTime();
          //console.log("Llego"+data.nombre+" <10000="+(Math.abs(ahora-data.online)<10000));
          if(Math.abs(ahora-data.online)<10000){ //--10 segundos
            //si no está en la lista lo debe agregar
            let esta=false;
            let indice=null;
            for(let x=0;x<scope.onlineList.length;x++){
              if(scope.onlineList[x].nombre==data.nombre) {esta=true;indice=x}
            }
            if(!esta){
              scope.onlineList.push({nombre:data.nombre,online:ahora})
              scope.setState({onlineList: scope.onlineList});
            }
            else{//-- si está debe actualizar el timer en la lista
              scope.onlineList[indice].online=data.online;
              scope.setState({onlineList: scope.onlineList});
            }
          }
          scope.onlineList.forEach(obj=>{if(Math.abs(ahora-obj.online)>10000){
            //console.log("Sacar "+obj.nombre);
            //--busca el indice del objeto para sacarlo
            let esta=false;
            let indice=null;
            for(let x=0;x<scope.onlineList.length;x++){
              if(scope.onlineList[x].nombre==data.nombre) {esta=true;indice=x}
            }
            if(esta){ //--- lo saca
              let saca=data.nombre;
              let result=scope.onlineList.splice(indice,1);
              scope.onlineList=result;
              scope.setState({onlineList: scope.onlineList});
              //--debe eliminar los juegos al que pertenece ese jugador
              scope.gun.get("juegos").map().once(
                function(juego){
                  if(juego.user1==saca || juego.user2==saca){
                    //--- saca este juego
                    console.log("Saca juego:"+juego.juego);
                    let juegoTemp=scope.gun.get(juego.juego).path("almacen1");
                    scope.gun.get("juegos").unset(juegoTemp);
                    scope.gun.get(juego.juego).path("almacen1").put(null);
                  }
                })
            }
            }});
        }) 
  }


  handleSubmit(e){
    e.preventDefault();
    this.setState({hiddenName: false})
    console.log("The button was clicked con "+this.state.value);
    //-- agrega el usuario nuevo a la lista de usuarios
    
    //--Agrega el usuario
    var user=gun.get(this.state.value).put({nombre: this.state.value});
    gun.get("UserList").set(user);

  }

  handleChange(e){
    this.setState({value: e.target.value.toUpperCase()});
  }
  
  manejaClick(id,e){
    console.log("Click en:"+id+" Usuario:"+this.usersList[id].nombre);
    //--- Carga el usuario seleccionado
    this.setState({value: this.usersList[id].nombre, hiddenName: false});
    this.setUserActivity(this);
    this.setOnlineActivity(this);
  }


  checkJuegosOnline(scope){
    this.gun.get("juegos").map().on(function(data){
      if(data.user2==scope.state.value){
        //--- Hay un juego al que pertenezco

        console.log(">>>Juego Encontrado>>>>="+data.juego);
       scope.setState({juego:data.juego, user1:data.user1,user2:data.user2,turno:0,isX:false,enemigo:data.user1,hiddenTablero: false});

      }
    });

  }

  manejaClickOnline(id,e){
    let enemigo=this.onlineList[id].nombre;
    console.log("Click en:"+id+" Usuario Online:"+enemigo);
    //--- Carga el enemigo seleccionado
    this.state.juego = "juego"+Math.floor(Math.random() * 100000);
    this.setState({enemigo: enemigo, hiddenTablero: false,juego:this.state.juego,user1:this.state.value,user2:enemigo,turno:0,isX:true});
    //--- Crea un juego con una entrada Random
    let juego = {juego:this.state.juego,user1:this.state.value,user2:enemigo,turno:0,isX:true}
    let refjuego=this.gun.get(this.state.juego).path("almacen1").put(juego);
    this.gun.get("juegos").set(refjuego);
  }
  

  setUserActivity(scope){
    let tiempoAct = new Date();
    let ahora = tiempoAct.getTime();
    console.log("Timer user"+scope.state.value+" ahora="+ahora);
    this.gun.get(scope.state.value).put({online:ahora})
  }

  setOnlineActivity(scope){
    setInterval(this.setUserActivity,5000,scope);
  }


  render(){
    return (
      <div>
        <form onSubmit={this.handleSubmit} hidden={!this.state.hiddenName}>
            <label>
              Nombre: &ensp; <input type="text" value={this.state.value} onChange={this.handleChange}/>
              <input type="submit" value="Submit"/>
            </label>
          </form>
          <br/>
          <br/>
          <div hidden={this.state.hiddenName} >Su usuario es:{this.state.value} </div>
          
          
          <MuestraUsersDb hidden={!this.state.hiddenName} usersList={this.state.usersList} manejaClick={(i,e) => this.manejaClick(i,e)} ></MuestraUsersDb>
          <br/>
          <div hidden={this.state.hiddenName}>
            Usuarios Online:
            <MuestraUsersDb usersList={this.state.onlineList} manejaClick={(i,e) => this.manejaClickOnline(i,e)}></MuestraUsersDb>
          </div>
          <div hidden={this.state.hiddenTablero}>
            Enemigo:{this.state.enemigo}
            <Game></Game>
          </div>
         </div>
    );
  }

}
export default Identificacion;



