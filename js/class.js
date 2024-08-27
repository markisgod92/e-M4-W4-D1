export class fetchAPI {
    #API_URL = `https://striveschool-api.herokuapp.com/api/product/`;
    #ACCESS_TOKEN = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmNjZWQ0NGZlN2VmODAwMTUwNjc2MjYiLCJpYXQiOjE3MjQ3MDYxMTcsImV4cCI6MTcyNTkxNTcxN30.jpHLG5jOMHhSF-GRK8-DTjglmUqaNQiqVUzHZCM9TMs`;

    async get(id = "") {
        try {
            const response = await fetch(this.#API_URL + id, {
                headers: {
                    "Authorization": this.#ACCESS_TOKEN
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching data.", error)
        }
    }

    async post(newObj) {
        try {
            const response = await fetch(this.#API_URL, {
                method: "POST",
                headers: {
                    "Authorization": this.#ACCESS_TOKEN,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newObj)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("POST error.", error)
        }
    }

    async del(id) {
        try {
            const response = await fetch(this.#API_URL + id, {
                method: "DELETE",
                headers: {
                    "Authorization": this.#ACCESS_TOKEN
                }
            })
            const data = await response.json;
            return data;
        } catch (error) {
            console.error("DELETE error", error)
        }
    }
}




/*
api.post({
    name: "Prova",
    description: "Prova prova",
    brand: "Provolone",
    imageUrl: "www.it",
    price: 10
}).then(data => console.log(data))
*/