const express = require('express');
const history = require('connect-history-api-fallback');
const compression = require('compression');
const app = express();

app.use(history());
app.use(compression());
app.use(express.static('./dist1'));
app.listen(80,()=>{
    console.log('running at http://127.0.0.1');
})