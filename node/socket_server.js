const {guess_country, peek_answers} = require('./game');
const WebSocket = require('ws');
const UUID = require('uuid');
const profile_colors = ['#008080', '#ffa500', '#ff00ff', '#00ff00', '#ff0000', '#0000ff', '#A52A2A', '#7FFFD4', '#FF69B4', '#FF4500', '#98FB98', '#9ACD32', '#EE82EE']
const protocol_lookup = {
    'join':user_join,
    'ready':user_toggle_ready,
    'guess':user_guess
};
const wss = new WebSocket.Server({port : 5001});
let socket_info = new Map();
let lobby_info = {}
var game_state  = {state:'pre_game', countdown:null, player_data:{}};


wss.on('connection', (ws, req) => {
    ws.send(`lobby_intro|${JSON.stringify(lobby_info)}`)
    ws.id = UUID.v4();
    socket_info.set(ws.id, ws);
    ws.on('message', (message) =>{
        try{
            let split_message = message.toString().split('|');
            let parameter = split_message[1];
            protocol_lookup[split_message[0]](ws, parameter);
        }catch(err){
            if(message.toString() == 'heartbeat')
                return;
            
            console.error(`recieved raw message: ${message}`);
            console.error(err);
        }
    })
    ws.on('close', () =>{
        socket_info.delete(ws.id);
        if(ws.id in lobby_info)
            delete lobby_info[ws.id];
        broadcast_to_all_users(`player_leave|${ws.id}`);
        readiness_consensus();
    })
})

function user_join(client, name){
    lobby_info[client.id] = {
        name:name,
        color:profile_colors[Math.floor(Math.random() * profile_colors.length)],
        ready:false
    };
    client.send(`lobby_state|${game_state.state}`);
    broadcast_to_all_users(`player_join|${client.id}_${JSON.stringify(lobby_info[client.id])}`);
    readiness_consensus();
}

function user_toggle_ready(client, state){
    if(game_state.state != 'pre_game'){
        console.log(`Cannot change ready ${game_state.state}`);
        return;
    }
    //state is a truthy value
    if(JSON.parse(state)){
        game_state.player_data[client.id] = [];
    }else if(game_state.player_data[client.id]){
        delete game_state.player_data[client.id];
    }
    broadcast_to_all_users(`player_ready|${client.id}_${state}`);
    readiness_consensus();
}

function readiness_consensus(){
    if(game_state.state == 'main_game')
        return;

    if(Object.keys(game_state.player_data).length/Object.keys(lobby_info).length > 0.65 && !game_state.countdown){
        console.log('readiness consensus achieved. starting game in 5 seconds');
        broadcast_to_all_users('consensus|true');
        game_state.countdown = setTimeout(() => {
            console.log('Game has begun');
            game_state.state = 'main_game';
            broadcast_to_all_users(`game_state|start_${JSON.stringify(Object.keys(game_state.player_data))}`);
            setTimeout(() => {
                end_game();
            }, 15000);
        }, 5000);
    }else if(Object.keys(game_state.player_data).length/Object.keys(lobby_info).length <= 0.65 && game_state.countdown){
        console.log('readiness consensus broken. cancelling countdown');
        clearTimeout(game_state.countdown);
        game_state.countdown = null;
        broadcast_to_all_users(`consensus|false`);
    }
}

function end_game(){
    let snapshot = {}
    snapshot.guesses = game_state.player_data;
    snapshot.answers = peek_answers();
    broadcast_to_all_users(`game_state|end_${JSON.stringify(snapshot)}`);
    game_state.player_data = {};
    game_state.state = 'pre_game';
}

function user_guess(client, country){
    let result = guess_country(country);
    console.log(result);
    if(result == false || game_state.player_data[client.id].includes(result.code)){
        client.send(`guess_result|false`);
        return;
    }
    client.send(`guess_result|${JSON.stringify(result)}`);
    game_state.player_data[client.id].push(result.code);
    broadcast_to_all_users(`player_score|${client.id}_${game_state.player_data[client.id].length}`);
}

function broadcast_to_all_users(update, except = null){
    socket_info.forEach((client, uuid) => {
        if(uuid==except)
            return;
        client.send(update);
    });
}