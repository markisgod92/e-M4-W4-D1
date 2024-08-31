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
let loadedItem = {};

// DOM Elements
const favouritesButton = document.getElementById("favouritesButton");
const cartButton = document.getElementById("cartButton");
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
const errorToast = new bootstrap.Toast(document.getElementById("errorToast"));

// Functions
const getItemData = async () => {
    elements.startCornerLoader(document.querySelector("main"));

    try {
        const data = await productApi.get(query);
        elements.stopCornerLoader()
        loadInfo(data);
    } catch (error) {
        elements.stopCornerLoader()
        elements.showError(document.querySelector("main"))
    }
}

const loadInfo = (data) => {
    // pre compile form with item info
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

const modifyProduct = async () => {
    elements.startCornerLoader(document.querySelector("main"));

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
        elements.stopCornerLoader();
        window.location = `./product.html?q=${query}`;

    } catch (error) {
        elements.stopCornerLoader();
        errorToast.show();
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

    // check name valid
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
    } catch (error) {
        imgUrlInput.classList.add("input-error");
        isValid = false;
        displayMessage("Image url not valid.")
    }

    return isValid;
}

const checkUnique = async () => {
    const {nameData} = getInputData();

    // return if name is unchanged
    if(nameData === loadedItem.name && nameData !== "") {
        return true;
    }

    try {
        const products = await productApi.get();
        const isDuplicate = products.some(product => product.name.toLowerCase() === nameData.toLowerCase());

        if(isDuplicate) {
            nameInput.classList.add("input-error");
            displayMessage("Product name already exists.");
            return false;
        } else {
            nameInput.classList.remove("input-error");
            return true;
        }
    } catch (error) {
        throw new Error("Error checking uniqueness.")
    }
}

const displayMessage = (messageString) => {
    formMessage.innerText = messageString;
    formMessage.classList.remove("d-none")
}

// Calls
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

logoutBtn.addEventListener("click", () => {
    userMng.login();
    window.location = "./index.html";
})

imgUrlInput.addEventListener("input", () => {
    // real time update image preview
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
    elements.startCornerLoader(document.querySelector("main"));

    // check if inputs are valid and object is unique
    try {
        const inputsValid = await checkInputs();
        const unique = await checkUnique();

        if(inputsValid && unique) {
            const {nameData, brandData, descriptionData, priceData, imgUrl} = getInputData();
            const newItem = {
                name: nameData,
                brand: brandData,
                description: descriptionData,
                price: parseFloat(priceData),
                imageUrl: imgUrl
            }

            try {
                const response = await productApi.post(newItem);
                const updatedId = response._id;
                elements.stopCornerLoader();
                window.location = `./product.html?q=${updatedId}`
            } catch (error) {
                elements.stopCornerLoader();
                errorToast.show()
            }
        } else {
            elements.stopCornerLoader();
        }
    } catch (error) {
        elements.stopCornerLoader();
        errorToast.show();
    }
})

modifyBtn.addEventListener("click", async e => {
    e.preventDefault();

    try {
        // check if inputs are valid and name is unique
        const inputsValid = await checkInputs();
        const unique = await checkUnique();

        if (inputsValid && unique) {
            const result = await alerts.modifyAlert();
            if(result.isConfirmed) modifyProduct();
        }
    } catch (error) {
        errorToast.show();
    }
})

favouritesButton.addEventListener("click", () => elements.updateFavouritesView());

cartButton.addEventListener("click", () => elements.updateCartView());

resetBtn.addEventListener("click", () => resetForm())