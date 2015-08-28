var uuid = require('uuid');

function Session(name) {
  return {
    name: name,
      id: uuid.v4(),
        startTime: null,
          endTime: null,
            dims: null,
              data: []
  };
}

module.exports = {
  createSession: Session
};

