const { getDb, initDb } = require('./config/db');
const { createUser } = require('./controllers/userController');

async function test() {
  await initDb();
  
  // mock req, res
  const req = {
    body: {
      username: 'testvisitor',
      password: 'password123',
      role: 'visitor'
    }
  };
  
  const res = {
    status: function(code) {
      console.log('Status:', code);
      return this;
    },
    json: function(data) {
      console.log('Response:', data);
    }
  };

  await createUser(req, res);
}

test().catch(console.error);
