import { fetchAPI } from "./class.js";
const productApi = new fetchAPI;

const productsContainer = document.getElementById("productsContainer");

const loadData = async () => {
    productsContainer.replaceChildren();

    try {
        const data = await productApi.get();
        data.forEach(product => createCard(product));
    } catch (error) {
        console.error("Error loading data", error)      // div di errore
    }
}

const createCard = (data) => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "col-12 col-md-6 col-lg-3");

    const card = document.createElement("div");
    card.setAttribute("class", "card h-100");

    const img = document.createElement("img");
    img.setAttribute("class", "card-img-top");
    img.src = data.imageUrl;
    img.alt = data.name;

    const cardBody = document.createElement("div");
    cardBody.setAttribute("class", "card-body");
    createCardBody(data, cardBody);

    card.append(img, cardBody);
    wrapper.appendChild(card);
    productsContainer.appendChild(wrapper);
}

const createCardBody = (data, container) => {
    const title = document.createElement("h5");
    title.setAttribute("class", "card-title");
    title.innerText = data.name;

    const brand = document.createElement("p");
    brand.setAttribute("class", "card-subtitle");
    brand.innerText = data.brand;

    const description = document.createElement("p");
    description.setAttribute("class", "card-text");
    description.innerText = data.description;

    const price = document.createElement("p");
    price.setAttribute("class", "card-text text-end fw-bold");
    price.innerText = data.price.toFixed(2);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.setAttribute("class", "d-flex align-items-center justify-content-end gap-4");

    const modifyBtn = document.createElement("button");
    modifyBtn.setAttribute("class", "btn btn-secondary");

    const modifyIcon = document.createElement("i");
    modifyIcon.setAttribute("class", "bi bi-pencil-square");
    modifyBtn.appendChild(modifyIcon);

    const deleteBtn = document.createElement("button");
    deleteBtn.setAttribute("class", "btn btn-danger");

    const deleteIcon = document.createElement("i");
    deleteIcon.setAttribute("class", "bi bi-trash");
    deleteBtn.appendChild(deleteIcon);

    deleteBtn.addEventListener("click", () => deleteItem(data._id))

    buttonsContainer.append(modifyBtn, deleteBtn);
    container.append(title, brand, description, price, buttonsContainer);
}

const deleteItem = async (id) => {          // div di conferma
    try {
        await productApi.del(id);
        await loadData()
    } catch (error) {
        console.error("Error deleting item", error)      // div di errore
    }
}


window.addEventListener("DOMContentLoaded", loadData)