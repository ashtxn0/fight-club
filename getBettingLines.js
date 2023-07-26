const axios = require('axios');
const cheerio = require('cheerio');

exports.scrapeBettingOdds = async function(i) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    };

    const response = await axios.get('https://www.bestfightodds.com/', { headers });
    const html = response.data;

    const $ = cheerio.load(html);
    const oddsContainer = $('.table-inner-wrapper');

    let allFighterOdds = []; // Store all the fighter odds here

    oddsContainer.slice(i, i + 1).each((index, element) => {
      const fighterOddsElements = $(element).find('.table-scroller > .odds-table > tbody > tr:not(.pr)');
      const fighterOdds = [];

      fighterOddsElements.each((index, element) => {
        const fighterName = $(element).find('span.t-b-fcc').text().trim();
        const fighterOdd = $(element).find('.bestbet').first().text().trim();
        fighterOdds.push({ type: "moneyline", condition: fighterName + "_won", odds: fighterOdd });
      });

      // // console.log('Fighter Odds:');
      // console.log(fighterOdds);
      // console.log('---');

      // Add the fighterOdds to the allFighterOdds array
      allFighterOdds = allFighterOdds.concat(fighterOdds);
    });

    return allFighterOdds; // Return the combined fighter odds after the loop finishes
  } catch (error) {
    console.error('An error occurred:', error);
    return []; // Return an empty array in case of an error
  }
};
