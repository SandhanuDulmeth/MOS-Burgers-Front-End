document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("posLoginButton");
  const resetEmailInput = document.getElementById("resetEmail");
  const resetCodeInput = document.getElementById("resetCode");
  const newPasswordInput = document.getElementById("newPassword");
  const getCodeButton = document.getElementById("getCodeButton");
  const resetPasswordButton = document.getElementById("resetPasswordButton");
  resetEmailInput.disabled = true;
  loginButton.disabled = true;
  resetPasswordButton.disabled = true;
  emailInput.addEventListener("input", function () {
    resetEmailInput.value = emailInput.value;
  });
  function toggleLoginButton() {
    loginButton.disabled = passwordInput.value.trim() === "";
  }

  function toggleResetButton() {
    resetPasswordButton.disabled = resetCodeInput.value.trim() === "";
  }

  passwordInput.addEventListener("input", toggleLoginButton);
  resetCodeInput.addEventListener("input", toggleResetButton);

  loginButton.addEventListener("click", function () {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email.endsWith("@gmail.com")) {
      Swal.fire("Please enter a valid Gmail address");
      return;
    }

    fetch("http://localhost:8080/AdminController/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({email: this.email,password: this.password }),
    })
      .then((response) => response.text())
      .then((result) => {
        if (result === "true") {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Login Success",
            showConfirmButton: false,
            timer: 1500,
          });
          setTimeout(() => (window.location.href = "controllerPanel.html"), 2000);
        } else {
          Swal.fire("Invalid email or password");
        }
      })
      .catch((error) => console.error(error));
  });

  getCodeButton.addEventListener("click", function () {
    const email = resetEmailInput.value;
    if (!email.endsWith("@gmail.com")) {
      Swal.fire("Please enter a valid Gmail address");
      return;
    }

    fetch("http://localhost:8080/api/auth/sendOtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.text())
      .then((result) => {
        Swal.fire(result === "true" ? "OTP Sent Successfully" : "Failed to send OTP");
      })
      .catch((error) => console.error(error));
  });

  resetPasswordButton.addEventListener("click", function () {
    const email = resetEmailInput.value;
    const resetCode = resetCodeInput.value;
    const newPassword = newPasswordInput.value;

    if (!email.endsWith("@gmail.com")) {
      Swal.fire("Please enter a valid Gmail address");
      return;
    }
    if (resetCode.trim() === "" || newPassword.trim() === "") {
      Swal.fire("Please enter a valid reset code and new password");
      return;
    }

    fetch("http://localhost:8080/api/auth/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: this.email, otp: this.resetCode, newPassword: this.newPassword }),
    })
    .then((response) => response.json())
    .then((result) => {
      Swal.fire(result ? "Password Reset Successful" : "Invalid OTP or Email");
    })
      .catch((error) => console.error(error));
  });

  function refreshTime() {
    document.getElementById("time").textContent = new Date().toLocaleString().replace(", ", " - ");
  }

  setInterval(refreshTime, 1000);
  refreshTime();
});
