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

    async put(id, modObj) {
        try {
            const response = await fetch(this.#API_URL + id, {
                method: "PUT",
                headers: {
                    "Authorization": this.#ACCESS_TOKEN,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(modObj)
            })
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("PUT error", error)
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


export class SweetAlerts {
    modifyAlert() {
        return Swal.fire({
            titleText: "Confirm modifies",
            text: "The changes you are about to make are irreversible. Are you sure you want to continue?",
            icon: "warning",
            iconColor: "Orange",
            position: "center",
            allowOutsideClick: "false",
            showCancelButton: "true",
            confirmButtonText: "Modify"
        })
    }

    deleteAlert() {
        return Swal.fire({
            titleText: "Delete object",
            text: `Type DELETE in the box below to continue. This action cannot be undone.`,
            icon: "warning",
            iconColor: "red",
            position: "center",
            allowOutsideClick: "false",
            showCancelButton: "true",
            confirmButtonText: "Delete",
            input: "text",
            inputPlaceholder: "Type DELETE here...",
            preConfirm: (inputValue) => {
                if(inputValue !== "DELETE") {
                    Swal.showValidationMessage("You must type DELETE to confirm.");
                    return false;
                }
            }
        })
    }
}