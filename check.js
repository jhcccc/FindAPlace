'use strict';

//fill in credential
const USR = "@mail.mcgill.ca";
const PW = "";
const TERM = "201909";
//fill in course name, number and CRNs
const SUBJ = "MATH";
const NUMBER = "323";
const CRNList = ['27944'];

let fs = require('fs');
const pptr = require('puppeteer');
(async () => {
  const browser = await pptr.launch({
    headless: true
    //change to false to see browser running
  });
  const page = await browser.newPage();
  const baseURL = 'https://horizon.mcgill.ca/pban1/'

  //log in minerva
  await page.goto(baseURL + 'twbkwbis.P_WWWLogin');
  await page.type('#mcg_un', USR);
  await page.type('#mcg_pw', PW);
  await page.click('#mcg_un_submit');

  //Choose Term
  await page.goto(baseURL + 'bwskfcls.p_sel_crse_search');
  await page.waitForSelector("#term_input_id");
  await page.select('#term_input_id', TERM);
  const submitTerm = (await page.$$("input[type='submit']"))[1];
  await submitTerm.click();

  //Choose Subject
  await page.waitForSelector("#subj_id");
  await page.select('#subj_id', SUBJ);
  const submitSubject = (await page.$("input[value='Course Search']"));
  await submitSubject.click();

  //Choose number
  await page.waitForSelector('.datadisplaytable');
  const numberTable = (await page.$$('.datadisplaytable'))[1];
  await page.waitForSelector('input[type=submit]');

  const numberTRs = await numberTable.$$('tr');
  for(const tr of numberTRs){
    if ((await (await tr.getProperty('childElementCount')).jsonValue()) == 3 && 
    (await(await(await tr.$('td:nth-child(1)')).getProperty('textContent')).jsonValue()) == NUMBER) {
      await (await tr.$('td:nth-child(3) > form:nth-child(1) > input:nth-child(30)')).click();
      break;
    }
  }

  //parse sections

  await page.waitForSelector('.datadisplaytable');
  const sections = await page.evaluate((CRNList)=>{
    const sectionData = [];
    const sectionTRs = document.querySelector('.datadisplaytable').querySelectorAll('tr');
    for(const tr of sectionTRs){
      const tds = tr.querySelectorAll("td");
      if(tds.length == 20 && Number(tds[10].textContent) > 1 && CRNList.includes(tds[1].textContent)){
        sectionData.push({
          "clickable": tds[0].childElementCount > 1,
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
  console.log(sections);
  fs.writeFile('data.json', JSON.stringify(sections), function (err) {
    if (err) throw err;
    console.log('Added to log');
  });

  await browser.close();
})();

