document.getElementById('posLoginButton').addEventListener('click', function() {
    const p = document.getElementById('username').value;
    const k = document.getElementById('password').value;
  
    if (p === '' && k === '') { 
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Login Success",
            showConfirmButton: false,
            timer: 1500
          });
          setTimeout(() => {
            window.location.href = 'controllerPanel.html';
          }, 2000);
       
    } else {
        alert('Invalid username or password.');
    }
});


function refreshTime() {
  const timeDisplay = document.getElementById("time");
  const dateString = new Date().toLocaleString();
  const formattedString = dateString.replace(", ", " - ");
  timeDisplay.textContent = formattedString;
}
  setInterval(refreshTime, 1000);
