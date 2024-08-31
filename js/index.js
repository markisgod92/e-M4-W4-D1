import { fetchAPI, SweetAlerts, UserManager, Elements } from "./class.js";
const productApi = new fetchAPI;
const alerts = new SweetAlerts;
const userMng = new UserManager;
const elements = new Elements({
    userManager: userMng,
    cartContainer: document.getElementById("cartOffcanvasContainer"), 
    favouritesContainer: document.getElementById("favouritesOffcanvasContainer")
});

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const newProductBtn = document.getElementById("newProductBtn");
const searchBar = document.getElementById("searchBar");
const productsContainer = document.getElementById("productsContainer");
const favouritesButton = document.getElementById("favouritesButton");
const cartButton = document.getElementById("cartButton");
const toast = new bootstrap.Toast(document.getElementById("toast"));
const errorToast = new bootstrap.Toast(document.getElementById("errorToast"));

// Functions
const loadData = async () => {
    productsContainer.replaceChildren();
    
    elements.startLoader(productsContainer);
    try {
        const data = await productApi.get();
        elements.stopLoader();
        visualizeData(data);
    } catch (error) {
        elements.stopLoader();
        elements.showError(productsContainer);
    }
}

const search = async (query) => {
    productsContainer.replaceChildren();
    
    elements.startLoader(productsContainer);
    try {
        const data = await productApi.get();
        elements.stopLoader();
        const result = data.filter(item => item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
        visualizeData(result);
    } catch (error) {
        elements.stopLoader();
        elements.showError(productsContainer);
    }
}

const visualizeData = (data) => {
    data.forEach(product => createCard(product))
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
    checkFavouriteBtn(data, favouriteBtn);

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

    window.addEventListener("favouriteDeleted", () => checkFavouriteBtn(data, favouriteBtn));

    cartBtn.addEventListener("click", () => {
        userMng.addToCart(data)
        toast.show();
    })
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
    elements.startCornerLoader(document.body);

    try {
        await productApi.del(id);
        elements.stopCornerLoader()
        await loadData()
    } catch (error) {
        elements.stopCornerLoader()
        errorToast.show()
    }
}

const checkFavouriteBtn = (data, button) => {
    if(userMng.isFavourite(data)) {
        button.classList.remove("btn-outline-danger")
        button.classList.add("btn-danger")
    } else {
        button.classList.remove("btn-danger")
        button.classList.add("btn-outline-danger")
    }
}

const updateLoginBtn = () => {
    if (userMng.isLogged()) {
        loginBtn.querySelector("i").classList.replace("bi-box-arrow-in-right", "bi-box-arrow-left")
        loginBtn.querySelector("span").innerText = "Log Out"
        newProductBtn.classList.remove("d-none");
    } else {
        loginBtn.querySelector("i").classList.replace("bi-box-arrow-left", "bi-box-arrow-in-right")
        loginBtn.querySelector("span").innerText = "Login"
        newProductBtn.classList.add("d-none");
    }
}

// Calls
window.addEventListener("DOMContentLoaded", () => {
    const isFirstTimeUser = window.localStorage.getItem("isFirstTimeUser");

    if(isFirstTimeUser === null) {
        const welcomeModal = new bootstrap.Modal(document.getElementById("welcomeModal"));
        welcomeModal.show();
        window.localStorage.setItem("isFirstTimeUser", "false");
    }
    updateLoginBtn();
    loadData();
})

searchBar.addEventListener("input", () => {
    const query = searchBar.value.trim().toLowerCase();

    if(query.length >= 3) {
        search(query);
    } else if (query.length === 0) {
        loadData();
    }
})

loginBtn.addEventListener("click", () => userMng.login());

favouritesButton.addEventListener("click", () => elements.updateFavouritesView());

cartButton.addEventListener("click", () => elements.updateCartView());