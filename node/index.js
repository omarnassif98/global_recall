const {guess_country, peek_answers, get_country_info} = require('./game');
const WebSocket = require('ws');
const UUID = require('uuid');
const profile_colors = [
    "#ff0000",
    "#8F7200",
    "#000000",
    "#0050a4",
    "#ef4138",
    "#7f055f",
    "#357266",
    "#BB2A25",
    "#255c99",
    "#7c7c7c"
];
const protocol_lookup = {
    'join':user_join,
    'ready':user_toggle_ready,
    'guess':user_guess,
    'timelimit_vote':set_user_timelimit_vote
};
const wss = new WebSocket.Server({port : 5001});
let socket_info = new Map();
let lobby_info = {}
var game_state  = {state:'pre_game', countdown:null, player_data:{}, time_limit_votes:{}};


wss.on('connection', (ws, req) => {
    ws.send(`lobby_intro|${JSON.stringify(lobby_info)}`)
    ws.id = UUID.v4();
    socket_info.set(ws.id, ws);
    game_state.time_limit_votes[ws.id] = 300000;
    console.log(5000);
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
        if(ws.id in lobby_info){
            delete lobby_info[ws.id];
            delete game_state.time_limit_votes[ws.id];
        }

        broadcast_to_all_users(`player_leave|${ws.id}`);
        readiness_consensus();
    })
})


function get_elected_time_limit(){
    let vote_occurances = {}
    //Only the users who are ready
    for(uid in game_state.player_data){
        console.log(uid);
        try {
            vote_occurances[game_state.time_limit_votes[uid]] += 1
        } catch (error) {
            vote_occurances[game_state.time_limit_votes[uid]] = 1
        }
    }
    //return first time limit in list sorted descendingly by vote
    //ties go to the smaller time limit
    return parseInt(Object.entries(vote_occurances).sort((x,y) => {return y[1] - x[1]})[0][0])
    
}

function user_join(client, name){
    lobby_info[client.id] = {
        name:name,
        color:profile_colors[Math.floor(Math.random() * profile_colors.length)],
        ready:false
    };
    console.log(`Hello, ${name}`);
    client.send(`lobby_state|${game_state.state}`);
    broadcast_to_all_users(`player_join|${client.id}_${JSON.stringify(lobby_info[client.id])}`);
    readiness_consensus();
}

function set_user_timelimit_vote(client, timelimit){
    game_state.time_limit_votes[client.id] = parseInt(timelimit);
}

function readiness_consensus(){
    if(game_state.state == 'main_game')
        return;
    if(Object.keys(game_state.player_data).length/Object.keys(lobby_info).length > 0.65 && !game_state.countdown){
        let game_time_limit = get_elected_time_limit();
        console.log(`${game_time_limit/60} second limit`);
        broadcast_to_all_users('consensus|true');
        game_state.countdown = setTimeout(() => {
            game_state.state = 'main_game';
            broadcast_to_all_users(`game_state|start_${JSON.stringify(Object.keys(game_state.player_data))}_${game_time_limit}`);
            setTimeout(() => {
                end_game();
            }, game_time_limit);
        }, 5000);
    }else if(Object.keys(game_state.player_data).length/Object.keys(lobby_info).length <= 0.65 && game_state.countdown){
        clearTimeout(game_state.countdown);
        game_state.countdown = null;
        broadcast_to_all_users(`consensus|false`);
    }
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

function end_game(){
    let snapshot = {}
    snapshot.guesses = game_state.player_data;
    snapshot.answers = peek_answers();
    broadcast_to_all_users(`game_state|end_${JSON.stringify(snapshot)}`);
    game_state.player_data = {};
    game_state.state = 'pre_game';
    game_state.countdown = null;
}

function user_guess(client, country){
    console.log(`${client} guesses ${country}`);
    let result = guess_country(country);
    console.log(result);
    if(result == false || game_state.player_data[client.id].includes(result)){
        client.send(`guess_result|false`);
        return;
    }
    client.send(`guess_result|${JSON.stringify(get_country_info(result))}`);
    game_state.player_data[client.id].push(result);
    broadcast_to_all_users(`player_score|${client.id}_${game_state.player_data[client.id].length}`);
}

function broadcast_to_all_users(update, except = null){
    socket_info.forEach((client, uuid) => {
        if(uuid==except)
            return;
        client.send(update);
    });
}