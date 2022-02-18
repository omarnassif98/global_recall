var player_answer_list = [];

function render_player_list(player_uuid, data, occurances, answers){
    player_ready_toggle(`${player_uuid}_false`);
    console.log('render');
    console.log(data);
    var unique_score = 0;
    let player_list_wrapper = document.createElement('div');
    player_list_wrapper.classList.add('country_list_wrapper');
    let player_list_wrapper_title = document.createElement('h2');
    player_list_wrapper_title.innerHTML = `${document.getElementById(player_uuid).getAttribute('name')}'s recollection`;
    player_list_wrapper.append(player_list_wrapper_title);
    player_list_wrapper.append(document.createElement('hr'));
    let player_country_list = document.createElement('div');
    player_country_list.classList.add('country_list')
    data.forEach(country_code => {
        let country_listing = document.createElement('span');
        country_listing.innerHTML = `${answers[country_code].flag} ${answers[country_code].country}`;
        if(occurances[country_code] == 1){
            unique_score += 1;
            country_listing.style.color = 'green';
        }
        player_country_list.append(country_listing);
    });
    player_list_wrapper.append(player_country_list);
    player_list_wrapper.append(document.createElement('hr'));
    let overall_score_prompt = document.createElement('span');
    overall_score_prompt.innerHTML = `Score: ${Object.keys(data).length}`;
    let unique_score_prompt = document.createElement('span');
    unique_score_prompt.innerHTML = `${unique_score} of those being unique!`;
    unique_score_prompt.style.color = 'green';
    player_list_wrapper.append(overall_score_prompt);
    player_list_wrapper.append(unique_score_prompt);
    document.getElementById('list_flex_container').append(player_list_wrapper);
    player_answer_list.push(player_list_wrapper);
}

function clear_player_lists(){
    while(player_answer_list.length > 0){
        player_answer_list.pop().remove();
    }
    while(document.getElementById('main_player_list').childElementCount > 0){
        document.getElementById('main_player_list').firstChild.remove();
    }
}

var game_timer;
function game_state_change(data){
    console.log(data);
    let [state, player_data] = data.split('_');
    game_begun = (state=='start');
    document.getElementById('main_player_list_wrapper').style.display = game_begun?'flex':'none';
    update_input_area(game_begun);
    player_data = JSON.parse(player_data);
    if(game_begun){
        document.getElementById('readiness_checkbox').checked = false;
        clear_player_lists();
        set_temporary_status_text('Game has Begun', false);
        player_data.forEach(uuid => {
            update_player_score(`${uuid}_0`)
        });
        var countdown_timer = 300;
        game_timer = setInterval(() => {
            countdown_timer -= 1;
            if(!temporary_showing)
                update_status_text(`${Math.floor(countdown_timer/60)}:${("0" + countdown_timer%60).slice(-2)}`)
                if(countdown_timer%60==0){
                    set_temporary_status_text(`${Math.floor(countdown_timer/60)} minutes left!`, false);
                }
        },1000)
    }else{
        console.log(player_data);
        clearInterval(game_timer);
        set_temporary_status_text('Game has ended');
        occurances = {};
        Object.values(player_data.guesses).forEach(data => {
            data.forEach(country_code => {
                if(country_code in occurances){
                    occurances[country_code] += 1;
                }else{
                    occurances[country_code] = 1; 
                }
            })
        })
        console.log(occurances);
        Object.entries(player_data.guesses).forEach(([uuid, data]) => {
            render_player_list(uuid, data, occurances, player_data.answers);
        })
        update_input_area(false);

    }
}

function make_guess(){
    console.log('guessing!');
    console.trace();
    let guess_value = document.getElementById('country_guess_input').value;
    if(guess_value.length == 0)
        return;
    document.dispatchEvent(new CustomEvent('country_guess', {'detail':{'val':guess_value}}))
}



function guess_result(result){
    console.log(result);
    let payload = JSON.parse(result);
    if(payload){
        console.log(payload);
        let country_listing = document.createElement('span');
        country_listing.innerHTML = `${payload.flag} ${payload.country}`;
        document.getElementById('main_player_list').append(country_listing);
        document.getElementById('country_guess_input').style.backgroundColor = 'yellowgreen';
        document.getElementById("country_guess_input").value = '';
    }else{
        console.log('ITS FAILING');
        document.getElementById('country_guess_input').style.backgroundColor = 'salmon';
    }
}

function toggle_ready(state){
    document.dispatchEvent(new CustomEvent('pregame_ready', {detail:{val:state}}))
}