const path = require('path');
module.exports = (app) => {
  const models = require(path.resolve(__dirname, '../model-config.json'));
  const datasources = require(path.resolve(__dirname, '../datasources.json'));

  var mysqlDS = app.dataSources.mysqlDS;
  const arr = []
  Object.keys(models).forEach(modelName => {
    if (models[modelName].dataSource === 'mysqlDS') {
      arr.push(modelName)
    }
  });
  mysqlDS.autoupdate(arr, (err) => {
    if (err) {
      console.log(err, 'err')
      return
    }
    console.log('DB updated');
  });
};
