const cheerio = require('cheerio');
const axios = require('axios');

const url = 'https://www.tijd.be/customers/mediafin.be/funds_tijd/1423098/Fund/60125183?t='

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    let investment = {};
    investment.updatedAt = getInvestmentUpdateDate($);

    if (differenceBetweenTwoDates(investment.updatedAt)) {
      investment.updatedAt = investment.updatedAt.toISOString().split('T')[0]
      investment.name = getInvestmentName($);
      investment.price = getInvestmentPrice($);

      sendInvestmentToServer(investment);
    }
  }).catch(error => {
    console.log(error);
  });

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
  let date = new Date();

  date.setFullYear(parseInt(dateArr[2]));
  date.setMonth(parseInt(dateArr[1] - 1));
  date.setDate(parseInt(dateArr[0]));

  return date;
}

function differenceBetweenTwoDates(date) {
  let dateToday = new Date();
  let diffTime = Math.abs(dateToday - date);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays !== 0 ? true : false;
}

function sendInvestmentToServer(investment) {
  console.log('Sending investment to server...');
  console.log(investment);
}