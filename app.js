const schedule = require('node-schedule');
const investmentScraper = require('./investmentScraper');

schedule.scheduleJob('30 0 * * *', () => investmentScraper.init());