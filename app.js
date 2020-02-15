const cheerio = require('cheerio');
const axios = require('axios');

init();

async function init() {
  try {
    const url = 'https://www.tijd.be/customers/mediafin.be/funds_tijd/1423098/Fund/60125183?t='
    const htmlResponse = await axios.get(url);
    const html = htmlResponse.data;
    const $ = cheerio.load(html);
    let investment = {};
    investment.updatedAt = getInvestmentUpdateDate($);

    if (await isNewInvestmentUpdate(investment.updatedAt)) {
      investment.name = getInvestmentName($);
      investment.price = getInvestmentPrice($);

      sendInvestmentToServer(investment);
    }
  } catch (error) {
    console.log("error", error);
  }
}

function getInvestmentName($) {
  let scrapedName = $('h1.header-small').text();
  let name = scrapedName.trim();

  return name;
}

function getInvestmentPrice($) {
  let scrapedPrice = $('header.clearfix.header-stats span span').first().text();
  let price = parseFloat(scrapedPrice.replace(',', '.'));

  return price;
}

function getInvestmentUpdateDate($) {
  let scrapedDate = $('header.clearfix.header-stats label').first().text();
  let dateArr = scrapedDate.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g)[0].split('/');
  let dateString = dateArr.reverse().join('-');

  return new Date(dateString);
}

async function isNewInvestmentUpdate(scrapedDate) {
  const response = await axios.get('http://localhost:5000/api/investments/latest');

  return new Date(response.data.updatedAt).getTime() === scrapedDate.getTime() ? false : true;
}

async function sendInvestmentToServer(investment) {
  try {
    await axios.post('http://localhost:5000/api/investments', investment);
    console.log('Posted a new update of the investment');
  } catch (error) {
    console.log(error);
  }
}