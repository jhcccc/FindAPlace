require('dotenv').config()
const pptr = require('puppeteer');
const { Telegraf } = require('telegraf'); 
//Telegram Bot
const bot = new Telegraf(process.env.BOT_TOKEN)
const USR = process.env.USR;
const PW = process.env.PW;
//hard-coded values
const TERM = "202009";
const SUBJ = "COMP";
const CRNList = ["18276"]
bot.start((ctx) => ctx.reply('Welcome. I can help you subscribe to McGill courses. send /help for usage.  '))
bot.help((ctx) => {
    ctx.reply('Send me the course number and CRN(s) like this, case doesn\'t matter:');
    ctx.reply('SUBSCRIBE SUBJ 123 12345');
})
bot.hears((str)=>str.toUpperCase().includes('SUBSCRIBE'), (ctx) => {
    ctx.reply('Got it. Subcribed successfully!');
    handleCheckCourse(ctx);
    // const messageId = ctx.update.message.message_id;
    // const text = ctx.update.message.text;
    // console.log(messageId);
    // console.log(text);
    // const [_,SUBJ,NUMBER,...CRNLIST] = text.split(' ');
})
bot.launch()

function handleCheckCourse(ctx) {
  //random timeGap from 2 to 10 minutes
  const timeGap = Math.floor((Math.random() * 600000) + 120000);
  checkCourse()
      .then(info => {
          ctx.reply(JSON.stringify(info));
          ctx.reply(`Will check again in ${Math.round(timeGap/60000)} minutes`);
          setTimeout(()=>handleCheckCourse(ctx), timeGap);
      })
      .catch(err=>{
        console.log(err);
        ctx.reply(JSON.stringify(err));
      });
}
//subject and CRN are hard-coded for now
async function checkCourse(){
  const browser = await pptr.launch({headless: false});
  const page = await browser.newPage();
  page.setDefaultTimeout(60000)
  const baseURL = 'https://horizon.mcgill.ca/pban1/'

  //log in minerva
  await page.goto(baseURL + 'twbkwbis.P_WWWLogin');
  await page.waitForSelector('#mcg_un');
  await page.waitForSelector('#mcg_pw');
  await page.type('#mcg_un', USR);
  await page.type('#mcg_pw', PW);
  await page.click('#mcg_un_submit');

  //Choose Term
  await page.goto(baseURL + 'bwskfcls.p_sel_crse_search');
  await page.select('select[name="p_term"]', TERM);
  const submitTerm = (await page.$$("input[type='submit']"))[1];
  await submitTerm.click();

  //Choose Subject
  await page.waitForSelector("#subj_id");
  await page.select('#subj_id', SUBJ);
  await page.waitForSelector("input[value='Course Search']");
  await page.click("input[value='Course Search']");

  //Choose number
  await page.waitForSelector('.datadisplaytable');

  // FOR FALL 2020 COMP 310 ONLY
  await page.waitForSelector('body > div.pagebodydiv > table:nth-child(3) > tbody > tr:nth-child(14) > td:nth-child(3) > form > input[type=submit]:nth-child(30)');
  await page.click('body > div.pagebodydiv > table:nth-child(3) > tbody > tr:nth-child(14) > td:nth-child(3) > form > input[type=submit]:nth-child(30)')

  // FOR GENERAL USE CASE
  // const numberTable = (await page.$$('.datadisplaytable'))[1];
  // const numberTRs = await numberTable.$$('tr');
  // for(const tr of numberTRs){
  //   if ((await (await tr.getProperty('childElementCount')).jsonValue()) == 3 && 
  //   (await(await(await tr.$('td:nth-child(1)')).getProperty('textContent')).jsonValue()) == NUMBER) {
  //     await (await tr.$('td:nth-child(3) > form:nth-child(1) > input:nth-child(30)')).click();
  //     break;
  //   }
  // }

  //parse sections

  await page.waitForSelector('body > div.pagebodydiv > form > table > tbody > tr:nth-child(3) > td:nth-child(1)');
  const sections = await page.evaluate((CRNList)=>{
    const sectionData = [];
    const sectionTRs = document.querySelector('.datadisplaytable').querySelectorAll('tr');
    for(const tr of sectionTRs){
      const tds = tr.querySelectorAll("td");
      if(tds.length == 20 && Number(tds[10].textContent) > 1 && CRNList.includes(tds[1].textContent)){
        sectionData.push({
          "isAvailable": tds[0].childElementCount > 1,
          "CRN": tds[1].textContent,
          "Cap": tds[10].textContent,
          "Act": tds[11].textContent,
          "Rem": tds[12].textContent,
          "WLCap": tds[13].textContent,
          "WLAct": tds[14].textContent,
          "WLRem": tds[15].textContent
        })
      }
    }
    return sectionData;
  },CRNList);
  await browser.close();
  return sections;
}
