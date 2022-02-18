
function dismiss_popup(){
    document.getElementById('backdrop').style.display = 'none';
}


function update_status_text(new_text){
    document.getElementById('game_status_text').innerHTML = new_text;
}

var temporary_showing = false;
function set_temporary_status_text(temporary_text, resolve_to_title=true){
    temporary_showing = true;
    update_status_text(temporary_text);
    setTimeout(() => {
        temporary_showing = false;
        if(resolve_to_title)
            update_status_text('Global Recall');
    }, 1500);
}

var preparer;
function prepare_game(consensus){
    var countdown_timer = 4;
    update_status_text(`Game begins in 5...`)
    if(consensus == 'true'){
        preparer = setInterval(() => {
            update_status_text(`Game begins in ${countdown_timer}...`)
            countdown_timer -= 1;
            if(countdown_timer == 0)
                clearInterval(preparer);
        },1000)
    }else{
        clearInterval(preparer);
        set_temporary_status_text('Game canceled, not enough people ready');
    }
}

window.addEventListener('load', () => {
    document.getElementById("country_guess_input").addEventListener('keyup', e => {
        e.preventDefault();
        if(e.key == 'Enter'){
            console.log('is this just happening twice?');
            document.getElementById('submit_guess').click();
        }
    })
})