const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputFile = 'server/data/med_H.csv';
const outputFile = 'server/data/med_H_filled.csv';

const rows = [];
const therapeuticGroups = {};

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    rows.push(row);
    const therapeuticClass = row.therapeuticClass;
    if (!therapeuticGroups[therapeuticClass]) {
      therapeuticGroups[therapeuticClass] = { chemicalClass: {}, actionClass: {} };
    }
    if (row.chemicalClass && row.chemicalClass.trim() !== '') {
      therapeuticGroups[therapeuticClass].chemicalClass[row.chemicalClass] = (therapeuticGroups[therapeuticClass].chemicalClass[row.chemicalClass] || 0) + 1;
    }
    if (row.actionClass && row.actionClass.trim() !== '') {
      therapeuticGroups[therapeuticClass].actionClass[row.actionClass] = (therapeuticGroups[therapeuticClass].actionClass[row.actionClass] || 0) + 1;
    }
  })
  .on('end', () => {
    // Find modes
    const modes = {};
    for (const [therapeuticClass, groups] of Object.entries(therapeuticGroups)) {
      const chemicalMode = Object.keys(groups.chemicalClass).reduce((a, b) => groups.chemicalClass[a] > groups.chemicalClass[b] ? a : b, '');
      const actionMode = Object.keys(groups.actionClass).reduce((a, b) => groups.actionClass[a] > groups.actionClass[b] ? a : b, '');
      modes[therapeuticClass] = { chemicalClass: chemicalMode, actionClass: actionMode };
    }

    // Fill empty
    const filledRows = rows.map(row => {
      if (!row.chemicalClass || row.chemicalClass.trim() === '') {
        row.chemicalClass = modes[row.therapeuticClass]?.chemicalClass || '';
      }
      if (!row.actionClass || row.actionClass.trim() === '') {
        row.actionClass = modes[row.therapeuticClass]?.actionClass || '';
      }
      return row;
    });

    // Write to new CSV
    const csvWriter = createCsvWriter({
      path: outputFile,
      header: [
        {id: 'pk', title: 'pk'},
        {id: 'brandName', title: 'brandName'},
        {id: 'genericName', title: 'genericName'},
        {id: 'compositions', title: 'compositions'},
        {id: 'form', title: 'form'},
        {id: 'manufacturer', title: 'manufacturer'},
        {id: 'substitutes', title: 'substitutes'},
        {id: 'sideEffects', title: 'sideEffects'},
        {id: 'usage', title: 'usage'},
        {id: 'chemicalClass', title: 'chemicalClass'},
        {id: 'habitForming', title: 'habitForming'},
        {id: 'therapeuticClass', title: 'therapeuticClass'},
        {id: 'actionClass', title: 'actionClass'},
      ]
    });

    csvWriter.writeRecords(filledRows)
      .then(() => console.log('Filled CSV written to', outputFile));
  });
