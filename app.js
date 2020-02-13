const cheerio = require('cheerio');
const axios = require('axios');

const url = 'https://www.tijd.be/customers/mediafin.be/funds_tijd/1423098/Fund/60125183?t='

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    let investment = {};
    investment.updatedAt = getInvestmentUpdateDate($);

    isNewInvestmentUpdate(investment.updatedAt).then(isNew => {
      if (isNew) {
        investment.name = getInvestmentName($);
        investment.price = getInvestmentPrice($);

        sendInvestmentToServer(investment);
      }
    });
    
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

  return dateArr.reverse().join('-');
}

async function isNewInvestmentUpdate(scrapedDate) {
  const response = await axios.get('http://localhost:5000/api/investments/latest');

  return response.data.updatedAt === scrapedDate ? false : true;
}

function sendInvestmentToServer(investment) {
  console.log('Sending investment to server...');
  console.log(investment);
}