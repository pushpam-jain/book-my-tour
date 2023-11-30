import '@babel/polyfill';       // don't know reason of using this
import { displayMap } from './mapbox';
import { login, logOut } from './login'
import { showAlert } from './alerts';
import { updateInfo } from './updateSettings'


const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const loggedOut = document.querySelector('.nav__el--logout ');
const updateData = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');

if (loginForm)
    loginForm.addEventListener("submit", (e) => {     // e is the event
        e.preventDefault();     // prevents from loading the default page
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // console.log('SUBMITTED')
        login(email, password)
    });




if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loggedOut) loggedOut.addEventListener('click', logOut);


if (updateData) updateData.addEventListener('submit', async (e) => {

    const form = new FormData();        // WE WILL MAKE FORM AND GIVE FORM IN THE REQ TO API -- LIKE IN POSTMAN

    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])     // we made a element named photo in account.pug page // Remember the zero for array element

    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    document.querySelector('.data-save--submit').innerHTML = 'Updating...'

    // await updateInfo({name,email},'data')

    await updateInfo(form, 'data')

    if (document.getElementById('photo').files[0]) {
        window.setTimeout(() => {
            location.assign('/me');
        }, 1000)
    }


    else
        document.querySelector('.data-save--submit').innerHTML = 'Save settings';


});

if (updatePassword) updatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm = document.getElementById('password-confirm').value;

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    document.querySelector('.password--submit-btn').innerHTML = 'Updating...'

    await updateInfo({ oldPassword, newPassword, newPasswordConfirm }, 'password');

    document.querySelector('.password--submit-btn').innerHTML = 'Save password';
});

// if (!(await user.checkPasswords(req.body.oldPassword, user.password)))
// return next(new AppError('The old password is incorrect!'))

// // 3) Update Password
// user.password = req.body.newPassword;
// user.passwordConfirm = req.body.newPasswordConfirm;
