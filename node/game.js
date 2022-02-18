const fs = require('fs')
const country_codes = {};
fs.readFileSync('./emoji_countries.txt').toString().split('\n').forEach(raw_values => {
    [flag, country, code] = raw_values.split('|');
    console.log('Country: ' + country);
    console.log(country.toLowerCase().replace(/&/g, 'and').replace(/[.']/g, '').replace(/[-]/g, ' '));
    country_codes[country.toLowerCase().replace(/&/g, 'and').replace(/[.']/g, '').replace(/[-]/g, ' ')] = {code:code, flag:flag, country:country};
})

function guess_country(country){
    country = country.toLowerCase().replace(/saint/g, 'st').replace(/&/g, 'and').replace(/[.']/g, '').replace(/[-]/g, ' ').replace(/dpr/, 'democratic peoples republic of');
    console.log(country);
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