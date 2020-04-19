const stringToStream = require('string-to-stream');
const fs = jest.genMockFromModule('fs');

let mockFiles = {};
function __setMockFiles(newMockFiles) {
  mockFiles = newMockFiles;
}

const access = (path) => {
  if (mockFiles[path] === undefined) {
    throw new Error();
  }
};

const exists = (path, cb) => {
  const res = mockFiles[path] !== undefined;
  cb(res);
};

const writeFile = jest.fn().mockImplementation((path, data, option, cb) => {
  cb();
});

const createReadStream = (path) => stringToStream(mockFiles[path]);

fs.promises = { access };
fs.__setMockFiles = __setMockFiles;
fs.exists = exists;
fs.createReadStream = createReadStream;
fs.writeFile = writeFile;

module.exports = fs;
