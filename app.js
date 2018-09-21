const express = require('express')
const app = express()
const jsonData = require('./myfile.json');
//console.log(jsonData.audits["is-on-https"].title);
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const drive = google.drive("v3");
const key = require("./private_key.json");
const path = require("path");

const jwToken = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key, ["https://www.googleapis.com/auth/drive"],
    null
  );
  jwToken.authorize((authErr) => {
    if (authErr) {
      console.log("error : " + authErr);
      return;
    } else {
      console.log("Authorization accorded");
    }
  });

//Create CSV object and save as CSV file
const fields = ['name', 'type', 'value'];
const myReport = [
  {
    "name": jsonData.audits["first-contentful-paint"].title,
    "type": "numeric",
    "value": jsonData.audits["first-contentful-paint"].displayValue
  }, {
    "name": jsonData.audits["speed-index"].title,
    "type": "numeric",
    "value": jsonData.audits["speed-index"].displayValue
  }, {
    "name": jsonData.audits.interactive.title,
    "type": "numeric",
    "value": jsonData.audits.interactive.displayValue
  }
];
 
const json2csvParser = new Json2csvParser({ fields });
const csv = json2csvParser.parse(myReport);
 
console.log(csv);

fs.writeFile('name.csv', csv, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('FILE SUCCESSFULLY WRITTEN!\n');
});


var folderId = "1-pkCn-ryOCPL8RAsi2j8SwPa9RYNNx6Q";
var fileMetadata = {
    'name': 'My Report',
    'mimeType': 'application/vnd.google-apps.spreadsheet',
    parents: [folderId]
};
var media = {
  mimeType: 'text/csv',
  body: fs.createReadStream(path.join(__dirname, './name.csv'))
};
drive.files.create({
  auth: jwToken,
  resource: fileMetadata,
  media: media,
  fields: 'id'
}, function(err, file) {
  if (err) {
    // Handle error
    console.error(err);
  } else {
    console.log('File Id: ', file.id);
  }
});

/*
//Upload file to Google Drive
var fileMetadata = {
    'name': 'My Report',
    'mimeType': 'application/vnd.google-apps.spreadsheet'
  };
  var media = {
    mimeType: 'text/csv',
    body: fs.createReadStream('./name.csv')
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, function (err, file) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File Id:', file.id);
    }
  });  
*/


app.get('/', (req, res) => {
    res.send(jsonData.audits["is-on-https"].id);
});


app.listen(3330, () => console.log('Example app listening on port 3200!'));