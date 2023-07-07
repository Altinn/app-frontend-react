const fs = require('fs');

const generateComponentList = () => {
  const filePath = `${__dirname}/component-list.json`;
  const componentList = [];
  var files = fs.readdirSync(__dirname);
  const componentPattern = /([A-Z][a-zA-Z]*).schema.v1.json$/;
  files.forEach((filename) => {
    const match = filename.match(componentPattern);
    if (match) {
      componentList.push(match[1]);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(componentList));
};

generateComponentList();
