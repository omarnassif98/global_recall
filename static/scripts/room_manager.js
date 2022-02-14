
function dismiss_popup(){
    document.getElementById('backdrop').style.display = 'none';
}

function update_status_text(new_text){
    document.getElementById('game_status_text').innerHTML = new_text;
}

///
/// Game
///

function make_guess(){
    let guess_value = document.getElementById('country_guess_input').value;
    console.log(`Guess value ${guess_value}`);
    if(guess_value.length == 0)
    return;
    document.dispatchEvent(new CustomEvent('country_guess', {'detail':{'val':guess_value}}))
}

var focus_list;

window.addEventListener('load', () => {
    change_focus(document.getElementById('default_list'))
})

function change_focus(list_wrapper_object){
    console.log(list_wrapper_object);
    focus_list = list_wrapper_object.querySelector('ul')
}

function guess_result(result){
    let payload = JSON.parse(result);
    if(payload){
        console.log(payload);
        let country_listing = document.createElement('li');
        country_listing.innerHTML = `${payload.flag} ${payload.country}`;
        focus_list.append(country_listing);
    }else{
        console.log('IMPROPER');
        console.error(result);
    }
}
function toggle_ready(state){
    document.dispatchEvent(new CustomEvent('pregame_ready', {detail:{val:state}}))
}

///
/// Sidebar
///


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
    console.log(data);
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

function update_score(message){
    console.log(message);
}

function game_state_change(message){
    if(state){
        document.getElementById('pre_game').style.display = 'none';
        document.getElementById('main_game').style.display = 'block';
    }else{
        document.getElementById('pre_game').style.display = 'block';
        document.getElementById('main_game').style.display = 'none';
    }
}