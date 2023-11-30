/* eslint-disable */

export const hideAlert = () => {                    // no need to export this
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);       // javascript DOM manipulation
  };
  
  // type is 'success' or 'error'
  export const showAlert = (type, msg, time = 7) => {
    hideAlert();        // To hide previous alerts, if any
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);     // javascript code to insert html
    window.setTimeout(hideAlert, time * 1000);
  };
  