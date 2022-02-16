const fs = require('fs')
const country_codes = {};
fs.readFileSync('./emoji_countries.txt').toString().split('\n').forEach(raw_values => {
    [flag, country, code] = raw_values.split('|');
    country_codes[country] = {code:code, flag:flag, country:country};
})

function guess_country(country){
    if(country in country_codes){
        return country_codes[country];
    }else{
        return false;
    }
}

function peek_answers(){
    return Object.values(country_codes);
}
module.exports = {guess_country, peek_answers};