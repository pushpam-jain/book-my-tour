const fs = require('fs');
const mongoose = require('mongoose');
const Tour= require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

const app = require('./../../app');
const dotenv = require('dotenv');

dotenv.config({path : './../../config.env'});



const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    // useNewUrlParser: true,
    // useCreateParser: true,
    // useFindAndModify: false
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true // This is added extra for NO ERROR
}).then(con => {
    // console.log(con.connections);
    console.log('DB is connected!');
})



const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));        // in JSON Object form
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));        // in JSON Object form
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));        // in JSON Object form


const ImportData = async () => {
try{
await Tour.create(tours);
await User.create(users,{validateBeforeSave: false});
await Review.create(reviews);

console.log('Data Imported Successfully');
}catch(err){
    console.log(err);
}
process.exit();
}

const DeleteData = async () =>{
    try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data Deleted Successfully');
    }catch(err){
        console.log(err);
    }
    process.exit();
}


if(process.argv[2]=='--import')     //node import-dev-data.js --import
ImportData();

if(process.argv[2]=='--delete')     //node import-dev-data.js --delete
DeleteData();