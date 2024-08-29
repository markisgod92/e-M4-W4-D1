import { fetchAPI, SweetAlerts, UserManager } from "./class.js";
const productApi = new fetchAPI;
const alerts = new SweetAlerts;
const userMng = new UserManager;

const loginBtn = document.getElementById("loginBtn");
const newProductBtn = document.getElementById("newProductBtn");
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
    cardBody.setAttribute("class", "card-body d-flex flex-column");
    createCardBody(data, cardBody);

    const cardFooter = document.createElement("div");
    cardFooter.setAttribute("class", "card-footer d-flex gap-3 justify-content-between");
    createCardFooter(data, cardFooter);

    card.append(img, cardBody, cardFooter);
    wrapper.appendChild(card);
    productsContainer.appendChild(wrapper);
}

const createCardBody = (data, container) => {
    const title = document.createElement("h5");
    title.setAttribute("class", "card-title");
    title.innerText = data.name;

    const brand = document.createElement("p");
    brand.setAttribute("class", "card-subtitle fw-bold mb-3");
    brand.innerText = data.brand;

    const description = document.createElement("p");
    description.setAttribute("class", "card-text");
    description.innerText = data.description;

    const price = document.createElement("p");
    price.setAttribute("class", "card-text text-end fw-bold mt-auto");
    price.innerText = `${data.price.toFixed(2)} €`;

    container.append(title, brand, description, price);
}

const createCardFooter = (data, container) => {
    const loggedMode = window.localStorage.getItem("isUserLoggedIn") === "true";

    //favourite button
    const favouriteBtn = document.createElement("button");
    favouriteBtn.setAttribute("class", "btn rounded-circle");
    if(userMng.isFavourite(data)) {
        favouriteBtn.classList.add("btn-danger")
    } else {
        favouriteBtn.classList.add("btn-outline-danger")
    }

    const favouriteIcon = document.createElement("i");
    favouriteIcon.setAttribute("class", "bi bi-heart");

    favouriteBtn.appendChild(favouriteIcon);

    //cart button
    const cartBtn = document.createElement("button");
    cartBtn.setAttribute("class", "btn btn-success w-100");

    const cartIcon = document.createElement("i");
    cartIcon.setAttribute("class", "bi bi-cart");

    const cartSpan = document.createElement("span");
    cartSpan.innerText = "Add to cart";

    cartBtn.append(cartIcon, cartSpan);

    // info button
    const infoBtn = document.createElement("button");
    infoBtn.setAttribute("class", "btn btn-primary");

    const infoIcon = document.createElement("i");
    infoIcon.setAttribute("class", "bi bi-info-circle");

    infoBtn.appendChild(infoIcon);

    // event listeners
    favouriteBtn.addEventListener("click", () => userMng.addFavourite(data, favouriteBtn));
    cartBtn.addEventListener("click", () => userMng.addToCart(data))
    infoBtn.addEventListener("click", () => window.location = `./product.html?q=${data._id}`);

    container.append(favouriteBtn, infoBtn, cartBtn);


    // if user logged, create management buttons
    if(!loggedMode) return;

    container.classList.toggle("flex-wrap")

    // modify button
    const modifyBtn = document.createElement("button");
    modifyBtn.setAttribute("class", "btn btn-secondary");

    const modifyIcon = document.createElement("i");
    modifyIcon.setAttribute("class", "bi bi-pencil-square");

    modifyBtn.appendChild(modifyIcon);

    // delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.setAttribute("class", "btn btn-danger");

    const deleteIcon = document.createElement("i");
    deleteIcon.setAttribute("class", "bi bi-trash");

    deleteBtn.appendChild(deleteIcon);

    // event listeners
    modifyBtn.addEventListener("click", () => window.location = `./backoffice.html?q=${data._id}`);
    deleteBtn.addEventListener("click", () => {
        alerts.deleteAlert().then(result => {
            if(result.isConfirmed)  {
                deleteItem(data._id)
                userMng.removeFavourite(data, favouriteBtn)
                userMng.removeFromCart(data);
            }
        })
    })

    container.insertBefore(modifyBtn, cartBtn)
    container.insertBefore(deleteBtn, cartBtn)
}


const deleteItem = async (id) => {
    try {
        await productApi.del(id);
        await loadData()
    } catch (error) {
        console.error("Error deleting item", error)      // div di errore
    }
}

const updateLoginBtn = () => {
    const isLogged = window.localStorage.getItem("isUserLoggedIn") === "true";

    if (isLogged) {
        loginBtn.querySelector("i").classList.replace("bi-box-arrow-in-right", "bi-box-arrow-left")
        loginBtn.querySelector("span").innerText = "Log Out"
        newProductBtn.classList.remove("d-none");
    } else {
        loginBtn.querySelector("i").classList.replace("bi-box-arrow-left", "bi-box-arrow-in-right")
        loginBtn.querySelector("span").innerText = "Login"
        newProductBtn.classList.add("d-none");
    }
}

updateLoginBtn();

window.addEventListener("DOMContentLoaded", () => {
    loadData()
})

loginBtn.addEventListener("click", () => userMng.login())