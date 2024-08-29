import { fetchAPI } from "./class.js";
const productApi = new fetchAPI;
import { SweetAlerts } from "./class.js";
const alerts = new SweetAlerts;
import { UserManager } from "./class.js";
const userMng = new UserManager;
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
    addCartBtn.addEventListener("click", () => userMng.addToCart(data));
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

updateLoginBtn();

loginBtn.addEventListener("click", () => userMng.login())