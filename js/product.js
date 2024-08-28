import { fetchAPI } from "./class.js";
const productApi = new fetchAPI;
const params = new URLSearchParams(window.location.search);
const query = params.get("q");

const modifyBtn = document.getElementById("modifyBtn");
const deleteBtn = document.getElementById("deleteBtn");
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
    productId.innerText = data._id
    createdAt.innerText = convertUTC(data.createdAt);
    lastUpdate.innerText = convertUTC(data.updatedAt);
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
deleteBtn.addEventListener("click", () => deleteItem(query));

const deleteItem = async (id) => {
    try {
        await productApi.del(id);
        window.location = "./index.html";
    } catch (error) {
        console.log("Error deleting item", error)           // div errore
    }
}