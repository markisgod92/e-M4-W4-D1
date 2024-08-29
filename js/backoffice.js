import { fetchAPI, SweetAlerts, UserManager } from "./class.js";
const productApi = new fetchAPI;
const alerts = new SweetAlerts;
const userMng = new UserManager;
const params = new URLSearchParams(window.location.search);
const query = params.get("q");

const favouritesButton = document.getElementById("favouritesButton");
const favouritesOffcanvasContainer = document.getElementById("favouritesOffcanvasContainer");
const cartButton = document.getElementById("cartButton");
const cartOffcanvasContainer = document.getElementById("cartOffcanvasContainer");
const logoutBtn = document.getElementById("logoutBtn");
const imagePreview = document.getElementById("imagePreview");
const nameInput = document.getElementById("nameInput");
const brandInput = document.getElementById("brandInput");
const descriptionInput = document.getElementById("descriptionInput");
const priceInput = document.getElementById("priceInput");
const imgUrlInput = document.getElementById("imgUrlInput");
const formMessage = document.getElementById("formMessage");
const resetBtn = document.getElementById("resetBtn");
const createBtn = document.getElementById("createBtn");
const modifyBtn = document.getElementById("modifyBtn");

let loadedItem = {};

window.addEventListener("DOMContentLoaded", () => {
    formMessage.classList.add("d-none");
    if (query) {
        createBtn.classList.add("d-none");
        modifyBtn.classList.remove("d-none");
        getItemData();
    } else {
        imagePreview.src = "./assets/image_placeholder.webp"
    }
})

const getItemData = async () => {
    try {
        const data = await productApi.get(query);
        loadInfo(data);
    } catch (error) {
        console.log("Error loading item data.", error)              // div errore
    }
}

// pre compile form with item info
const loadInfo = (data) => {
    console.log(data);
    loadedItem = data;
    imagePreview.src = data.imageUrl;
    nameInput.value = data.name;
    brandInput.value = data.brand;
    descriptionInput.value = data.description;
    priceInput.value = data.price;
    imgUrlInput.value = data.imageUrl;
}

const resetForm = () => {
        loadInfo(loadedItem)
}

// real time update image preview
imgUrlInput.addEventListener("input", () => {
    const img = new Image();

    img.onload = () => {
        imagePreview.src = imgUrlInput.value;
    }

    img.onerror = () => {
        imagePreview.src = "./assets/image_placeholder.webp";
    }

    img.src = imgUrlInput.value;
})

createBtn.addEventListener("click", async e => {
    e.preventDefault();
    // check if inputs are valid and object is unique
    const isValid = await Promise.all([checkInputs(), checkUnique()])
        .then(results => results.every(result => result === true))

    // post new item
    if(isValid) {
        const {nameData, brandData, descriptionData, priceData, imgUrl} = getInputData();
        const newItem = {
            name: nameData,
            brand: brandData,
            description: descriptionData,
            price: parseFloat(priceData),
            imageUrl: imgUrl
        }
        productApi.post(newItem)
            .then(data => console.log(data))
    }
})

modifyBtn.addEventListener("click", async e => {
    e.preventDefault();
    // check if inputs are valid
    const isValid = await Promise.all([checkInputs(), checkUnique()])
        .then(results => results.every(result => result === true))


    if(isValid) alerts.modifyAlert()
        .then(result => {
        if(result.isConfirmed) modifyProduct();
    })
})

const modifyProduct = async () => {
    const { nameData, brandData, descriptionData, priceData, imgUrl } = getInputData();
    const modItem = {
        ...loadedItem,
        name: nameData,
        brand: brandData,
        description: descriptionData,
        price: parseFloat(priceData),
        imageUrl: imgUrl,
    }

    try {
        await productApi.put(query, modItem)
        userMng.updateFavouriteObj(loadedItem, modItem)
        userMng.updateCartObj(loadedItem, modItem);
        window.location = `./product.html?q=${query}`;
    } catch (error) {
        console.log("Error modifying object.", error)
    }
}

const getInputData = () => {
    const inputs = [nameInput, brandInput, descriptionInput, priceInput, imgUrlInput];

    const [nameData, brandData, descriptionData, priceData, imgUrl] = inputs.map(input => {
        if(input === priceInput) {
            return input.value;
        } else {
            return input.value.trim();
        }
    })

    return {nameData, brandData, descriptionData, priceData, imgUrl}
}


const checkInputs = async () => {
    let isValid = true;

    // data
    const {nameData, brandData, descriptionData, priceData, imgUrl} = getInputData();

    // check name valid and unique
    if(nameData === "") {
        nameInput.classList.add("input-error");
        isValid = false;
        displayMessage("Product name not valid.")
    } else {
        nameInput.classList.remove("input-error");
    }

    // check other inputs valid
    if(brandData === "") {
        brandInput.classList.add("input-error");
        isValid = false;
        displayMessage("Brand name not valid.")
    } else {
        brandInput.classList.remove("input-error");
    }

    if(descriptionData === "") {
        descriptionInput.classList.add("input-error");
        isValid = false;
        displayMessage("Description not valid.")
    } else {
        descriptionInput.classList.remove("input-error");
    }

    if(isNaN(priceData) || priceData <= 0) {
        priceInput.classList.add("input-error");
        isValid = false;
        displayMessage("Price is not a valid number.")
    } else {
        priceInput.classList.remove("input-error");
    }

    //check if imageUrl is url
    try {
        new URL(imgUrl)
        imgUrlInput.classList.remove("input-error");
    } catch (e) {
        imgUrlInput.classList.add("input-error");
        isValid = false;
        displayMessage("Image url not valid.")
    }

    return isValid;
}

const checkUnique = async () => {
    let isUnique = true;
    const {nameData} = getInputData();

    try {
        const products = await productApi.get();
        const isDuplicate = products.some(product => product.name.toLowerCase() === nameData.toLowerCase());
        if(isDuplicate) {
            nameInput.classList.add("input-error");
            isUnique = false;
            displayMessage("Product name already exists.")
        } else {
            nameInput.classList.remove("input-error");
        }
    } catch (error) {
        console.error("Error comparing products.", error);
        isUnique = false;
    }

    return isUnique;
}

const displayMessage = (messageString) => {
    formMessage.innerText = messageString;
    formMessage.classList.remove("d-none")
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
        userMng.removeFavourite(data, favouriteDeleteBtn);
        updateFavouritesView();
    })

    favouriteDeleteBtn.appendChild(favouriteDeleteIcon);
    div.append(img, itemName, favouriteDeleteBtn);
    favouritesOffcanvasContainer.appendChild(div);
}

logoutBtn.addEventListener("click", () => {
    userMng.login();
    window.location = "./index.html";
})
favouritesButton.addEventListener("click", () => updateFavouritesView());
cartButton.addEventListener("click", () => updateCartView());
resetBtn.addEventListener("click", () => resetForm())