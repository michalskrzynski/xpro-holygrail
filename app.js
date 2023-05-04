const express = require('express')
const fs = require('fs')
const app = express();
const Redis = require('ioredis')

var client = new Redis();

client.mset({
    header: 0,
    left: 0,
    article: 0,
    right:0,
    footer: 0
  })
  .then( () => {
    console.log('Key set successfully.');
  })
  .catch( (err) => {
    console.error( err );
  })
client.mget(['header', 'left', 'article', 'right', 'footer'], (err, val) => {
  console.log( val );
})

function data() {
  return new Promise((resolve, reject) => {
    client.mget(['header', 'left', 'article','right','footer'], (err, value) => {
      const data= {
        'header': Number(value[0]),
        'left': Number(value[1]),
        'article': Number(value[2]),
        'right': Number(value[3]),
        'footer': Number(value[4])
      };
      err ? reject(null) : resolve(data);
    })
  })
}

app.use( express.static('public') );

app.get( '/', function(req, res) {
  res.send('Hello World!');
})

app.get('/data', (req, res) => {
  data()
    .then( data => {
      console.log(data);
      res.send(data);
    }) 
})

app.get('/update/:key/:value', (req, res) => {
  const key = req.params.key;
  let value = Number(req.params.value);

  client.get(key, function(err, reply) {

      //new value
      value = Number(reply) + value;
      client.set(key, value);

      //return data to client
      data()
        .then( data => {
          console.log( data );
          res.send(data);
        })
  })
})

app.listen( 3000, () => {
  console.log('Server is running on port 3000');
})