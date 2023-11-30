const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
// console.log(process.env);

// console.log(app.get('env'));

dotenv.config({path : './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    // useNewUrlParser: true,
    // useCreateParser: true,
    // useFindAndModify: false
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true // Add this line to enable createIndexes
}).then(con => {
    // console.log(con.connections);
    console.log('DB is connected!');
})

const port=process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening at port ${port}...`);
})
