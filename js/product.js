import { fetchAPI, SweetAlerts, UserManager, Elements } from "./class.js";
const productApi = new fetchAPI;
const alerts = new SweetAlerts;
const userMng = new UserManager;
const elements = new Elements({
    userManager: userMng,
    cartContainer: document.getElementById("cartOffcanvasContainer"), 
    favouritesContainer: document.getElementById("favouritesOffcanvasContainer")
});
const params = new URLSearchParams(window.location.search);
const query = params.get("q");

// DOM Elements
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
const cartButton = document.getElementById("cartButton");
const toast = new bootstrap.Toast(document.getElementById("toast"));
const errorToast = new bootstrap.Toast(document.getElementById("errorToast"));

// Functions
const fillData = (data) => {
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
        toast.show();
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

const deleteItem = async (id) => {
    elements.startCornerLoader(document.querySelector("main"));

    try {
        await productApi.del(id);
        elements.stopCornerLoader();
        window.location = "./index.html";
    } catch (error) {
        elements.stopCornerLoader();
        errorToast.show();
    }
}

const updateLoginBtn = () => {
     if (userMng.isLogged()) {
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

// Calls
window.addEventListener("DOMContentLoaded", async () => {
    updateLoginBtn();
    elements.startLoader(document.querySelector("main"));

    try {
        const data = await productApi.get(query)
        elements.stopLoader();
        fillData(data);
    } catch (error) {
        elements.stopLoader();
        elements.showError(document.querySelector("main"))
    }
})

loginBtn.addEventListener("click", () => userMng.login())

favouritesButton.addEventListener("click", () => elements.updateFavouritesView());

modifyBtn.addEventListener("click", () => window.location = `./backoffice.html?q=${query}`);

window.addEventListener("favouriteDeleted", event => {
    // if deleting favourite from favourites list, update if item is the same visualized on page
    if(event.detail.data.name === name.innerText) {
        addFavouriteBtn.classList.replace("btn-danger", "btn-outline-danger");
    }
})

cartButton.addEventListener("click", () => elements.updateCartView());