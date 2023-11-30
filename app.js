const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');   // Built-in   // Used to deal with the issue of  __dirname - it will uses '/' automatically// See examples below
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const viewRouter = require('./routes/viewRouter');

const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();

const AppError = require('./utils/AppError');
const errorController = require('./controllers/errorController');

const reviewRouter = require('./routes/reviewRouter')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
// app.use(helmet())


// Limit requests from same API
const limiter = rateLimit({     // here limiter becomes a function which we use in middleware
  max: 100,                   // no. of request left after some usage can be checked in headers of response on postman
  windowMs: 60 * 60 * 1000,       // Window between which we check no. of requests 
  message: 'Too many request from this IP, try after an hour!'
})

app.use('/api', limiter)


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));          // Middle-ware code   // we use this for parsing req.body
app.use(cookieParser());


// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static('./public'));


// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));                     // for logging status of code run in console
}

// Data sanitization against NoSQL query injection      // ex- email: {$gt: ""}  // so basically it will query in find() and get all users(to hacker) // So this package will convert $ to something else
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());                     // does something in headers (for protection)

// Prevent parameter pollution  // prevents duplicate sortinging, filtering parameters
app.use(
  hpp({
    whitelist: [          // giving exceptions
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression()); // compresses text

// Test middleware
app.use((req, res, next) => {
  console.log('Hello from middle-ware');
  req.currentTime = new Date().toISOString();
  next();
})

// app.get('/', (req,res)=>{
//     res.status(200).json({message: 'Get request received!!!',app: 'natours'})
// })

// app.post('/',(req,res)=>{
//     res.send('Post request received!!!');
// })

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// 2) TOUR HANDLERS     // FUNCTIONS




// 3) ROUTS

// app.get('/api/v1/tours', getAllTours )
// app.get('/api/v1/tours/:id/:x?/:y?', getATour )
// app.post('/api/v1/tours', createTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

// 3) ROUTS

// app.get('/',(req,res)=>{
//     res.status(200).render('base',{
//         tour: 'The Forest Hiker',
//         user: 'Pushpam'
//     });
// });

// app.get('/tour',(req,res)=>{
//     res.status(200).render('base',{
//         tour: 'The Forest Hiker',
//         tours
//     });
// });

// 



app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);        // REMEMBER: these are basically 'middlewares'
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// 4) Handlers for other routes/urls
app.all('*', (req, res, next) => {               // 'all' includes get, post update,etc. and * means all possible cases
  // METHOD 1
  // res.status(404).json({                  // this will only work when no req is returned from the 2 routes above this.
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on this server!`    // There is a element named req.originalUrl to get input url also no need of next() as already output is given so won't ahead
  // });

  // METHOD 2
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err);          // This will skip all middleware in between and go directly to error handling middleware

  // METHOD 3
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


// Global Error Handling Middleware
app.use(errorController);           // this is GLOBAL error handling middleware because it has 3 inputs - err,req,res
// so any next(err) with 3 inputs will come directly to this handler. Also for next(err) res,req are default.

// 4) SERVER LISTENER // CALLER

module.exports = app;