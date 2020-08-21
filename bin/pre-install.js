#!/usr/bin/env node

// NOTE - Test via `npm run preinstall`, otherwise `npm_execpath` will be undefined.

const { engines } = require('../package.json');

const engine = (process.env.npm_execpath.includes('yarn')) ? 'yarn' : 'node';
const engineVer = engines[engine];

// NOTE - uncomment the below to test different cases.
// const engineVer = '<10.14.2';
// const engineVer = '<=10.14.2';
// const engineVer = '>10.14.2';
// const engineVer = '>=10.14.2';
// const engineVer = '=10.14.2';
// const engineVer = '10.14.2';
// const engineVer = '5.40.x';
// const engineVer = '11.x';

const pad = (num, token='00') => token.substring(0, token.length-`${num}`.length) + num;
const verToNum = ver => {
  const parts = ver.split('.');
  const major = pad(parts[0]);
  const minor = pad((parts[1] || '0').replace(/x/g, ''));
  const patch = pad((parts[2] || '0').replace(/x/g, ''));
  return +`${major}${minor}${patch}`;
};

if (engineVer) {
  const parts = engineVer.match(/^([<>=])?(=)?([\d.x]+)$/);
  
  if (parts) {
    const operator = `${parts[1] || ''}${parts[2] || ''}` || '=';
    const rawEngineVer = parts[3];
    const rawCurrVer = process.version.replace('v', '');
    const requiredVer = verToNum(rawEngineVer);
    const currVer = verToNum(rawCurrVer);
    let verAcceptable = false;
    let operatorDesc = '';
    
    switch (operator) {
      case '<': 
        if (currVer < requiredVer) verAcceptable = true;
        else operatorDesc = 'less than';
        break;
        
      case '<=': 
        if (currVer <= requiredVer) verAcceptable = true;
        else operatorDesc = 'less than or equal to';
        break;
        
      case '>': 
        if (currVer > requiredVer) verAcceptable = true;
        else operatorDesc = 'greater than';
        break;
        
      case '>=': 
        if (currVer >= requiredVer) verAcceptable = true;
        else operatorDesc = 'greater than or equal to';
        break;
        
      default: 
        if (rawEngineVer.includes('x')) {
          if (currVer >= requiredVer) verAcceptable = true;
          else operatorDesc = 'greater than or equal to';
        }
        else {
          if (currVer === requiredVer) verAcceptable = true;
          else operatorDesc = 'equal to';
        }
        break;
    }
    
    if (!verAcceptable) {
      console.log(`[ERROR] Your current ${engine} version "${rawCurrVer}" is not ${operatorDesc} the required verion "${rawEngineVer}"\n`);
      process.exit(1);
    }
  }
}
