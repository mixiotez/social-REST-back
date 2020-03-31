require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const cors         = require('cors');

const database = process.env.ENV == 'DEV' ? 'mongodb://localhost/back-end' : process.env.DB;

mongoose
  .connect(database, { useNewUrlParser: true,  useUnifiedTopology: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Browsers will block communication between apps for security reasons. Cors helps to avoid this
app.use(cors({
  credentials: true
}));

// Express View engine setup
app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));



// default value for title local
app.locals.title = 'Social-REST';



const index = require('./routes/index');
const account = require('./routes/account');
const auth = require('./routes/auth');
const dashboard = require('./routes/dashboard');
const twitter = require('./routes/twitter');

app.use('/', index);
app.use('/api/account', account);
app.use('/api/auth', auth);
app.use('/api/twitter', twitter);
app.use('/api/dashboard', dashboard);

app.all('*', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
})

module.exports = app;