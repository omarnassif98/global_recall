const fs = require('fs')
const country_lookup = {};
const country_info = {};

fs.readFileSync('./emoji_countries.txt').toString().split('\n').forEach(raw_values => {
    let [flag, country, code] = raw_values.split('|');
    country_cleaned = country.toLowerCase();
    if(!(code in country_info)){
        country_info[code] = {name:country, flag:flag}
    }
    country_lookup[country_cleaned] = code;
})

function guess_country(country){
    try{
        return country_lookup[country];
    }catch{
        return false;
    }
}

function get_country_info(code){
    try{
        return country_info[code]
    }catch{
    }
}

function peek_answers(){
    return country_info;
}
module.exports = {guess_country, peek_answers, get_country_info};
