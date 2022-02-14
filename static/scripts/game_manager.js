var game_begun = false;

function game_state_change(data){
    console.log('Game' + data);
    let [state, player_data] = data.split('_');
    game_begun = (state=='start');
    update_input_area(game_begun);
    player_data = JSON.parse(player_data);
    if(game_begun){
        set_temporary_status_text('Game has Begun', false);
        player_data.forEach(uuid => {
            update_player_score(`${uuid}_0`)
        });
        var countdown_timer = 300;
        setInterval(() => {
            if(!temporary_showing)
                update_status_text(`${Math.floor(countdown_timer/60)}:${("0" + countdown_timer%60).slice(-2)}`)
            countdown_timer -= 1;
            if(countdown_timer%60==0){
                set_temporary_status_text(`${Math.floor(countdown_timer/60)} minutes left!`, false);
            }
        },1000)
    }else{
        set_temporary_status_text('Game has ended')
    }
}

function make_guess(){
    if(!game_begun)
        return
    let guess_value = document.getElementById('country_guess_input').value;
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