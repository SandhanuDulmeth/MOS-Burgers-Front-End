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
            window.location.href = 'menu.html';
          }, 2000);
       
    } else {
        alert('Invalid username or password.');
    }
});
