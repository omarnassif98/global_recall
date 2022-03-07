const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId : 'global-recall',
    keyFilename : '/app/gcp_credentials.json'
})

function record_game(game_data){
    db.collection('games').add(game_data).then(() => console.log('recorded game'));
}

function register_user(uuid, name){
    	let newUser = {};
	newUser[name] = true;
	db.collection('users').doc(uuid).set({
	usernames: newUser
    }, {merge:true}).then(() => console.log(`${name} has been registered`))
}
module.exports = {record_game, register_user};
