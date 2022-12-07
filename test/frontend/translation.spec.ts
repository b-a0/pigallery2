import {ProjectPath} from '../../src/backend/ProjectPath';
import {promises as fsp} from 'fs';
const chai = require('chai');
import path = require('path');
const {expect} = chai;

// to help WebStorm to handle the test cases
declare let describe: any;


describe('UI', () => {


  it('translation should be listed in the angular.json', async () => {
    const base = path.join('src', 'frontend', 'translate');
    const translations = await fsp.readdir(path.join(ProjectPath.Root, base));
    const angularConfig = require(path.join(ProjectPath.Root, 'angular.json'));
    const knownTranslations = angularConfig.projects.pigallery2.i18n.locales;


    for (const t of translations) {
      const lang = t.substr(t.indexOf('.') + 1, 2);
      if (lang === 'en') {
        continue; // no need to add 'en' as it is the default language.
      }
      const translationPath = path.join(base, t).replace(new RegExp('\\\\', 'g'), '/');
      expect(knownTranslations[lang]).to.deep.equal({
        baseHref: '',
        translation: translationPath
      }, translationPath + ' should be added to angular.json');
    }


  });


});
