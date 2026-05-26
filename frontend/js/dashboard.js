const token = localStorage.getItem('token')

async function getNotes() {

    const res = await fetch("http://localhost:3000/notes", {

        method: "GET",

        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await res.json()

    console.log(data)
}

getNotes()