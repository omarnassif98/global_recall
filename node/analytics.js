const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId : 'global-recall',
    keyFilename : '/app/gcp_credentials.json'
})

function record_game(game_data){
    db.collection('games').add(game_data).then(() => console.log('recorded game'));
}

module.exports = {record_game};