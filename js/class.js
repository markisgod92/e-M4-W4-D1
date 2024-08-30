export class fetchAPI {
    #API_URL = `https://striveschool-api.herokuapp.com/api/product/`;
    #ACCESS_TOKEN = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmNjZWQ0NGZlN2VmODAwMTUwNjc2MjYiLCJpYXQiOjE3MjQ3MDYxMTcsImV4cCI6MTcyNTkxNTcxN30.jpHLG5jOMHhSF-GRK8-DTjglmUqaNQiqVUzHZCM9TMs`;

    async get(id = "") {
        try {
            /* const response = await new Error("HTTP error"); */
            const response = await fetch(this.#API_URL + id, {
                headers: {
                    "Authorization": this.#ACCESS_TOKEN
                }
            });

            if(!response.ok) throw new Error("HTTP error.")
            
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
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

            if(!response.ok) throw new Error("HTTP error.");

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    async put(id, modObj) {
        try {
            /* const response = await new Error("HTTP error"); */
            const response = await fetch(this.#API_URL + id, {
                method: "PUT",
                headers: {
                    "Authorization": this.#ACCESS_TOKEN,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(modObj)
            })

            if(!response.ok) throw new Error("HTTP error.");

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    async del(id) {
        try {
            /* const response = await new Error("HTTP error"); */
            const response = await fetch(this.#API_URL + id, {
                method: "DELETE",
                headers: {
                    "Authorization": this.#ACCESS_TOKEN
                }
            })

            if(!response.ok) throw new Error("HTTP error.");
            
            const data = await response.json;
            return data;
        } catch (error) {
            throw error;
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

export class UserManager {
    isLogged() {
        return window.localStorage.getItem("isUserLoggedIn") === "true";
    }

    login() {
        const isUserLogged = this.isLogged();
        window.localStorage.setItem("isUserLoggedIn", !isUserLogged);
        window.location.reload()
    }

    isFavourite(obj) {
        let favourites = window.localStorage.getItem("favourites");

        favourites = favourites ? JSON.parse(favourites) : [];

        const isFavourite = favourites.some(item => item.name === obj.name);

        return isFavourite;
    }

    addFavourite(obj, button) {
        let favourites = window.localStorage.getItem("favourites");

        favourites = favourites ? JSON.parse(favourites) : [];

        const isFavourite = this.isFavourite(obj);

        if (!isFavourite) {
            favourites.push(obj);
            window.localStorage.setItem("favourites", JSON.stringify(favourites))
            button.classList.replace("btn-outline-danger", "btn-danger")
        } else {
            this.removeFavourite(obj, button);
        }
    }

    removeFavourite(obj, button) {
        let favourites = window.localStorage.getItem("favourites");

        favourites = favourites ? JSON.parse(favourites) : [];

        const isFavourite = this.isFavourite(obj);

        if (isFavourite) {
            favourites = favourites.filter(item => item.name !== obj.name);
            window.localStorage.setItem("favourites", JSON.stringify(favourites))
            button.classList.replace("btn-danger", "btn-outline-danger")
        }
    }

    updateFavouriteObj(oldData, newData) {
        let favourites = window.localStorage.getItem("favourites");

        favourites = favourites ? JSON.parse(favourites) : [];

        const isFavourite = this.isFavourite(oldData);

        if(!isFavourite) {
            return
        }

        favourites = favourites.filter(item => item.name !== oldData.name)

        favourites.push(newData);

        window.localStorage.setItem("favourites", JSON.stringify(favourites))
    }

    isInCart(obj) {
        let cart = window.localStorage.getItem("cart");

        cart = cart ? JSON.parse(cart) : [];

        const isAdded = cart.some(item => item.item.name === obj.name);

        return isAdded;
    }

    addToCart(obj) {
        let cart = window.localStorage.getItem("cart");

        cart = cart ? JSON.parse(cart) : [];

        const isAdded = this.isInCart(obj);

        if (!isAdded) {
            cart.push({
                item: obj, 
                quantity: 1
            });
        } else {
            const item = cart.find(item => item.item.name === obj.name);
            item.quantity += 1;
        }

        window.localStorage.setItem("cart", JSON.stringify(cart))
    }

    removeFromCart(obj) {
        let cart = window.localStorage.getItem("cart");

        cart = cart ? JSON.parse(cart) : [];

        const isAdded = this.isInCart(obj);

        if(isAdded) {
            cart = cart.filter(item => item.item.name !== obj.name)
            window.localStorage.setItem("cart", JSON.stringify(cart))
        }
    }

    updateCartObj(oldData, newData) {
        let cart = window.localStorage.getItem("cart");

        cart = cart ? JSON.parse(cart) : [];

        const focusItem = cart.find(item => item.item.name === oldData.name);

        if(focusItem) {
            focusItem.item = newData;
            window.localStorage.setItem("cart", JSON.stringify(cart))
        } else {
            return
        }
    }
}

export class Elements {
    startLoader(container) {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "loader position-absolute top-0 start-0 d-flex vh-100 w-100 bg-white justify-content-center align-items-center");

        const spinner = document.createElement("div");
        spinner.setAttribute("class", "spinner-grow text-secondary");
        spinner.role = "status";

        const span = document.createElement("span");
        span.setAttribute("class", "visually-hidden");
        span.innerText = "Loading...";

        spinner.appendChild(span);
        wrapper.appendChild(spinner);
        container.appendChild(wrapper);
    }

    stopLoader() {
        document.querySelector(".loader").remove();
    }

    showError(container) {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "position-absolute top-0 start-0 d-flex vh-100 vw-100 bg-white justify-content-center align-items-center");

        const div = document.createElement("div");
        div.setAttribute("class", "d-flex flex-column align-items-center");

        const icon = document.createElement("i");
        icon.setAttribute("class", "bi bi-bug fs-1");

        const span = document.createElement("span");
        span.innerText = "Error, try to refresh page."

        div.append(icon, span);
        wrapper.appendChild(div);
        container.appendChild(wrapper);
    }

    startCornerLoader(container) {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "corner-loader position-fixed top-0 start-0 d-flex h-100 w-100 justify-content-end align-items-end");

        const spinner = document.createElement("div");
        spinner.setAttribute("class", "spinner-grow text-secondary m-5");
        spinner.role = "status";

        const span = document.createElement("span");
        span.setAttribute("class", "visually-hidden");
        span.innerText = "Loading...";

        spinner.appendChild(span);
        wrapper.appendChild(spinner);
        container.appendChild(wrapper);
    }

    stopCornerLoader() {
        document.querySelector(".corner-loader").remove();
    }
}