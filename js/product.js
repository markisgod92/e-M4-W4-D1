import { fetchAPI, SweetAlerts, UserManager, ToastManager } from "./class.js";
const productApi = new fetchAPI;
const alerts = new SweetAlerts;
const userMng = new UserManager;
const toast = new ToastManager("toast");
const params = new URLSearchParams(window.location.search);
const query = params.get("q");

const newProductBtn = document.getElementById("newProductBtn");
const modifyBtn = document.getElementById("modifyBtn");
const deleteBtn = document.getElementById("deleteBtn");
const addFavouriteBtn = document.getElementById("addFavouriteBtn");
const addCartBtn = document.getElementById("addCartBtn");
const image = document.getElementById("image");
const name = document.getElementById("name");
const brand = document.getElementById("brand");
const description = document.getElementById("description");
const price = document.getElementById("price");
const productId = document.getElementById("productId");
const createdAt = document.getElementById("createdAt");
const lastUpdate = document.getElementById("lastUpdate");
const favouritesButton = document.getElementById("favouritesButton");
const favouritesOffcanvasContainer = document.getElementById("favouritesOffcanvasContainer");
const cartButton = document.getElementById("cartButton");
const cartOffcanvasContainer = document.getElementById("cartOffcanvasContainer");

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = await productApi.get(query)
        fillData(data);
    } catch (error) {
        console.log("Error loading data.", error)           // div errore
    }
})

const fillData = (data) => {
    console.log(data);
    image.src = data.imageUrl;
    image.alt = data.name;
    name.innerText = data.name;
    brand.innerText = data.brand;
    description.innerText = data.description;
    price.innerText = `${data.price.toFixed(2)} €`;

    if (userMng.isFavourite(data)) {
        addFavouriteBtn.classList.add("btn-danger");
    } else {
        addFavouriteBtn.classList.add("btn-outline-danger");
    }

    productId.innerText = data._id
    createdAt.innerText = convertUTC(data.createdAt);
    lastUpdate.innerText = convertUTC(data.updatedAt);

    addFavouriteBtn.addEventListener("click", () => userMng.addFavourite(data, addFavouriteBtn));
    addCartBtn.addEventListener("click", () => {
        userMng.addToCart(data);
        toast.toastAlert("Item added to cart.")
    })
    deleteBtn.addEventListener("click", () => {
        alerts.deleteAlert().then(result => {
            if(result.isConfirmed) {
                userMng.removeFavourite(data, addFavouriteBtn)
                userMng.removeFromCart(data);
                deleteItem(query);
            }
        })
    });
}

const convertUTC = (data) => {
    const date = new Date(data);
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }
    return date.toLocaleString("it-IT", options)
}

modifyBtn.addEventListener("click", () => window.location = `./backoffice.html?q=${query}`);



const deleteItem = async (id) => {
    try {
        await productApi.del(id);
        window.location = "./index.html";
    } catch (error) {
        console.log("Error deleting item", error)           // div errore
    }
}

const updateLoginBtn = () => {
    const isLogged = window.localStorage.getItem("isUserLoggedIn") === "true";

    if (isLogged) {
        loginBtn.querySelector("i").classList.replace("bi-box-arrow-in-right", "bi-box-arrow-left")
        loginBtn.querySelector("span").innerText = "Log Out"
        newProductBtn.classList.remove("d-none");
        modifyBtn.parentElement.classList.remove("d-none")
    } else {
        loginBtn.querySelector("i").classList.replace("bi-box-arrow-left", "bi-box-arrow-in-right")
        loginBtn.querySelector("span").innerText = "Login"
        newProductBtn.classList.add("d-none");
        modifyBtn.parentElement.classList.add("d-none")
    }
}

//OFFCANVAS FUNCTIONS
const updateCartView = () => {
    cartOffcanvasContainer.replaceChildren();

    const cart = JSON.parse(window.localStorage.getItem("cart")) || [];

    cart.length > 0 ? cart.forEach(item => createCartDiv(item)) : cartOffcanvasContainer.innerText = "Cart is empty."
}

const updateFavouritesView = () => {
    favouritesOffcanvasContainer.replaceChildren();

    const favourites = JSON.parse(window.localStorage.getItem("favourites")) || [];

    favourites.length > 0 ? favourites.forEach(item => createFavouriteDiv(item)) : favouritesOffcanvasContainer.innerText = "No favourites."
}

const createCartDiv = (data) => {
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
        userMng.removeFromCart(data.item);
        updateCartView()
    })

    body.append(itemName, quantity)
    cartDeleteBtn.appendChild(cartDeleteIcon);
    div.append(img, body, cartDeleteBtn);
    cartOffcanvasContainer.appendChild(div);
}

const createFavouriteDiv = (data) => {
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
        if(data.name === name.innerText) {
            addFavouriteBtn.classList.replace("btn-danger", "btn-outline-danger")
        }
        userMng.removeFavourite(data, favouriteDeleteBtn);
        updateFavouritesView();
    })

    favouriteDeleteBtn.appendChild(favouriteDeleteIcon);
    div.append(img, itemName, favouriteDeleteBtn);
    favouritesOffcanvasContainer.appendChild(div);
}


updateLoginBtn();

loginBtn.addEventListener("click", () => userMng.login())
favouritesButton.addEventListener("click", () => updateFavouritesView());
cartButton.addEventListener("click", () => updateCartView());