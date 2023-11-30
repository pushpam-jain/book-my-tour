import axios from 'axios';
import { showAlert } from './alerts';


export const login = async (email, password) => {
    // console.log(email)
    // console.log(password)   

    // We use CDN referencing instead of installing Package of AXIOS
    try {
        const res = await axios({        // It is used to make HTTP request to our API for getting Logged in ansd getting authoreised // Basically for API requesting
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        });                 // the cookie in this res is automatically send in the response of this page rendering
        console.log(res);
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
    } catch (err) {
        // console.log(err.response.data.message)      // NOTE: it is not err.res.data
        showAlert('error', err.response.data.message)
    }
}

// querySelector is used to select CLASS
// document.querySelector('.form').addEventListener("submit", (e) => {     // e is the event
//     e.preventDefault();     // prevents from loading the default page
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     console.log('SUBMITTED')
//     login(email, password)
// });

// console.log(val);

// const email = document.findElementById('email').value();
// const password = document.findElementById('password').value();

// console.log(email)

export const logOut = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout'
        });
        if (res.data.status == 'success') {
            showAlert('success', 'Logged out successfully!!');
            location.reload(true)
        }

    } catch (err) {
        showAlert('error', 'Log out fail! Try again.')
    }
} 