import { showAlert } from "./alerts"
import axios from 'axios'

export const updateInfo = async (data, type) => {
    console.log(data)
    const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe'; 

    try {    
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${ type === 'password' ? res.data.message : 'Updated Succesfully' }`);
        }
    } catch (err) {
            showAlert('error', err.response.data.message);
    }
}