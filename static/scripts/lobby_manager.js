function lobby_context(game_state){
    if(game_state == 'main_game'){
        update_status_text('Game in progress. Please wait');
        document.getElementById('ready_up').disabled = true;
    }
}

function add_player(uuid, player_info){
    console.log('creating_player');
    let player_listing = document.createElement('li');
    player_listing.id = uuid;
    player_listing.setAttribute('name', player_info.name);
    player_listing.innerHTML = `${player_info.name}: ${player_info.ready?'Ready':'Not Ready'}`;
    player_listing.style.color = player_info.color;
    document.getElementById('lobby_members_list').append(player_listing);
}

function player_hot_join(data){
    console.log('PLAYER COMING IN HOT');
    let [uuid, raw_json] = data.split('_');
    add_player(uuid, JSON.parse(raw_json));
}

function player_hot_release(data){
    document.getElementById(data).remove();
}

function player_ready_toggle(data){
    var [uuid, state] = data.split('_');
    state = (state == 'true');
    let player_listing = document.getElementById(uuid);
    player_listing.innerHTML = `${player_listing.getAttribute('name')}: ${state?'Ready':'Not Ready'}`
}

function fill_lobby(existing_players){
    console.log('Catching lobby up to speed');
    for([uuid, player_info] of Object.entries(JSON.parse(existing_players))){
        add_player(uuid, player_info)
    }
}

function update_player_score(message){
    let [uuid, score] = message.split('_');
    document.getElementById(uuid).innerHTML = `${document.getElementById(uuid).getAttribute('name')}: ${score}`;
}

function update_input_area(state){
    if(state){
        document.getElementById('pre_game').style.display = 'none';
        document.getElementById('main_game').style.display = 'block';
    }else{
        document.getElementById('pre_game').style.display = 'block';
        document.getElementById('main_game').style.display = 'none';
    }
}

function update_pregame_readiness_state(state){
    if(state){
        document.getElementById('unready').style.display = 'none';
        document.getElementById('ready').style.display = 'block';
    }else{
        document.getElementById('ready').style.display = 'none';
        document.getElementById('unready').style.display = 'block';
    }
}