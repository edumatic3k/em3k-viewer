const msg = document.getElementById('statusmsg');
const pb = document.getElementById('progressbar');

function setStatus(newdata) {
    if (!newdata) { return false; }
    // check for page elements
    if (msg && pb) {
        msg.textContent = newdata;
    }    
}

// update progress bar
// accepts % value (0-100)
// example: '45%'
function showProgress(val) {
    let bar = document.getElementById('bar');
    bar.textContent = val;
    bar.style.width = val;
    pb.classList.remove('d-none');
}

function clearStatus() {
   msg.textContent = '';
   pb.classList.add('d-none');
}