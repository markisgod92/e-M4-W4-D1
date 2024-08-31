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
    #favourites;
    #cart;

    constructor() {
        this.#favourites = this.#loadFavourites();
        this.#cart = this.#loadCart();
    }

    // LOGIN METHODS
    isLogged() {
        return window.localStorage.getItem("isUserLoggedIn") === "true";
    }

    login() {
        const isUserLogged = this.isLogged();
        window.localStorage.setItem("isUserLoggedIn", !isUserLogged);
        window.location.reload()
    }

    // FAVOURITES METHODS
    #loadFavourites() {
        const stored = window.localStorage.getItem("favourites");
        return stored ? JSON.parse(stored) : [];
    }

    #saveFavourites() {
        window.localStorage.setItem("favourites", JSON.stringify(this.#favourites));
    }

    isFavourite(obj) {
        return this.#favourites.some(item => item.name === obj.name);
    }

    addFavourite(obj, button) {
        if (!this.isFavourite(obj)) {
            this.#favourites.push(obj);
            this.#saveFavourites();
            button.classList.replace("btn-outline-danger", "btn-danger")
        } else {
            this.removeFavourite(obj, button);
        }
    }

    removeFavourite(obj, button) {
        if (this.isFavourite(obj)) {
            this.#favourites = this.#favourites.filter(item => item.name !== obj.name);
            this.#saveFavourites();
            button.classList.replace("btn-danger", "btn-outline-danger")
        }
    }

    updateFavouriteObj(oldData, newData) {
        if(!this.isFavourite(oldData)) {
            return
        }

        this.#favourites = this.#favourites.filter(item => item.name !== oldData.name)
        this.#favourites.push(newData);
        this.#saveFavourites();
    }

    // CART METHODS
    #loadCart() {
        const stored = window.localStorage.getItem("cart");
        return stored ? JSON.parse(stored) : [];
    }

    #saveCart() {
        window.localStorage.setItem("cart", JSON.stringify(this.#cart))
    }

    isInCart(obj) {
        return this.#cart.some(item => item.item.name === obj.name);
    }

    addToCart(obj) {
        if (!this.isInCart(obj)) {
            this.#cart.push({
                item: obj, 
                quantity: 1
            });
        } else {
            const item = this.#cart.find(item => item.item.name === obj.name);
            item.quantity += 1;
        }

        this.#saveCart();
    }

    removeFromCart(obj) {
        if(this.isInCart(obj)) {
            this.#cart = this.#cart.filter(item => item.item.name !== obj.name);
            this.#saveCart();
        }
    }

    updateCartObj(oldData, newData) {
        const focusItem = this.#cart.find(item => item.item.name === oldData.name);

        if(focusItem) {
            focusItem.item = newData;
            this.#saveCart();
        } else {
            return
        }
    }
}

export class Elements {
    constructor({userManager, cartContainer, favouritesContainer}) {
        this.userMng = userManager;
        this.cartContainer = cartContainer;
        this.favouritesContainer = favouritesContainer;
    }

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

    updateCartView() {
        this.cartContainer.replaceChildren();
    
        const cart = JSON.parse(window.localStorage.getItem("cart")) || [];
    
        cart.length > 0 ? cart.forEach(item => this.createCartDiv(item)) : this.cartContainer.innerText = "Cart is empty.";
    
        document.getElementById("cartQty").innerText = `${cart.reduce((acc, cur) => acc + cur.quantity, 0)} items`;
        document.getElementById("cartTotal").innerText = `${(cart.reduce((acc, cur) => acc + (cur.item.price * cur.quantity), 0)).toFixed(2)} €`
    }

    createCartDiv(data) {
        const div = document.createElement("div");
        div.setAttribute("class", "d-flex justify-content-between align-items-center my-3");
    
        const img = document.createElement("img");
        img.setAttribute("class", "cart-image");
        img.src = data.item.imageUrl;
        img.alt = data.item.name;
    
        const body = document.createElement("div");
        body.setAttribute("class", "d-flex flex-column gap-3")
    
        const itemName = document.createElement("div");
        itemName.innerText = data.item.name;
    
        const quantity = document.createElement("div");
        quantity.innerText = `Qty: ${data.quantity}`;
    
        const cartDeleteBtn = document.createElement("button");
        cartDeleteBtn.setAttribute("class", "btn btn-danger");
    
        const cartDeleteIcon = document.createElement("i");
        cartDeleteIcon.setAttribute("class", "bi bi-cart-x");
    
        cartDeleteBtn.addEventListener("click", () => {
            this.userMng.removeFromCart(data.item);
            this.updateCartView()
        })
    
        body.append(itemName, quantity)
        cartDeleteBtn.appendChild(cartDeleteIcon);
        div.append(img, body, cartDeleteBtn);
        this.cartContainer.appendChild(div);
    }

    updateFavouritesView() {
        this.favouritesContainer.replaceChildren();
    
        const favourites = JSON.parse(window.localStorage.getItem("favourites")) || [];
    
        favourites.length > 0 ? favourites.forEach(item => this.createFavouriteDiv(item)) : this.favouritesContainer.innerText = "No favourites."
    }

    createFavouriteDiv(data) {
        const div = document.createElement("div");
        div.setAttribute("class", "d-flex justify-content-between align-items-center my-3");
    
        const img = document.createElement("img");
        img.setAttribute("class", "cart-image");
        img.src = data.imageUrl;
        img.alt = data.name;
    
        const itemName = document.createElement("div");
        itemName.innerText = data.name;
    
        const favouriteDeleteBtn = document.createElement("button");
        favouriteDeleteBtn.setAttribute("class", "btn btn-danger");
    
        const favouriteDeleteIcon = document.createElement("i");
        favouriteDeleteIcon.setAttribute("class", "bi bi-heartbreak");
    
        favouriteDeleteBtn.addEventListener("click", () => {
            this.userMng.removeFavourite(data, favouriteDeleteBtn);
            this.updateFavouritesView();
            const event = new CustomEvent("favouriteDeleted", {
                detail: { data }
            });
            window.dispatchEvent(event);
        })
    
        favouriteDeleteBtn.appendChild(favouriteDeleteIcon);
        div.append(img, itemName, favouriteDeleteBtn);
        this.favouritesContainer.appendChild(div);
    }
}