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
var game_state  = {}


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
        delete lobby_info[ws.id];
        console.log('GOODBYE ' + ws.id);
        broadcast_to_all_users(`player_leave|${ws.id}`)
    })
})

function user_join(client, name){
    lobby_info[client.id] = {
        name:name,
        color:profile_colors[Math.floor(Math.random() * profile_colors.length)],
        ready:false
    };
    console.log(`HELLO, ${name} joined`);
    broadcast_to_all_users(`player_join|${client.id}_${JSON.stringify(lobby_info[client.id])}`);
}

function user_toggle_ready(client, state){
    //state is a truthy value
    if(Boolean(state)){
        game_state[client.id] = [];
    }else if(game_state[client.id]){
        delete game_state[client.id];
    }
    broadcast_to_all_users(`player_ready|${client.id}_${state}`);
}

function user_guess(client, country){
    let result = guess_country(country);
    result.country = country;
    console.log(result);
    if(result == false || game_state[client.id].includes(result.code)){
        client.send(`guess_result|false`);
        return;
    }
    client.send(`guess_result|${JSON.stringify(result)}`);
    game_state[client.id].push(result.code)
    broadcast_to_all_users(`player_score|${client.id}_${game_state[client.id].length}`);
}

function broadcast_to_all_users(update, except = null){
    socket_info.forEach((client, uuid) => {
        if(uuid==except)
            return;
        client.send(update);
    });
}