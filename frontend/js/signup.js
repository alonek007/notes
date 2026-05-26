async function signup() {

const name = document.getElementById("name").value
const email = document.getElementById("email").value

const password = document.getElementById("password").value

const res = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name,
        email,
        password
    })
})
const data =  await res.json()
console.log(data)

// window.location.href = "login.html"
}
