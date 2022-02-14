var socket =null;
const protocol_lookup = {
    'player_join': player_hot_join,
    'player_leave': player_hot_release,
    'lobby_intro': fill_lobby,
    'player_ready': player_ready_toggle,
    'guess_result': guess_result,
    'lobby_intro':fill_lobby,
    'player_score':update_score
};

function connect_to_server(){
    let player_name = document.getElementById('player_name_input').value;
    if(player_name.length == 0)
        return
    socket = new WebSocket(`ws://${location.hostname}/ws`);
    // Connection opened
    
    function heartbeat(){
        console.log('Hearbeat');
        if(!socket)
            return;
        socket.send('heartbeat');
        setTimeout(heartbeat, 2500);
    }

    socket.addEventListener('open', () => {
        heartbeat();
        send_message('join', player_name);
        dismiss_popup();
        update_status_text('Welcome to the game');
        document.addEventListener('country_guess', (e) => send_message('guess', e.detail.val));
        document.addEventListener('pregame_ready', (e) => send_message('ready', e.detail.val));
    });


    // Listen for messages
    socket.addEventListener('message',({ data }) => {
        let [protocol, payload] = data.split('|');
        console.log(`got ${protocol} message`)
        protocol_lookup[protocol](payload);
    });

    function send_message(protocol, message){
        console.log(`sending ${protocol} message`);
        socket.send(`${protocol}|${message}`)
    }


}