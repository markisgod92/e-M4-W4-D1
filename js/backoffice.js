import { fetchAPI } from "./class.js";
const productApi = new fetchAPI;
const params = new URLSearchParams(window.location.search);
const query = params.get("q");

const imagePreview = document.getElementById("imagePreview");
const nameInput = document.getElementById("nameInput");
const brandInput = document.getElementById("brandInput");
const descriptionInput = document.getElementById("descriptionInput");
const priceInput = document.getElementById("priceInput");
const imgUrlInput = document.getElementById("imgUrlInput");
const createBtn = document.getElementById("createBtn");
const modifyBtn = document.getElementById("modifyBtn");

window.addEventListener("DOMContentLoaded", () => {
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
    imagePreview.src = data.imageUrl;
    nameInput.value = data.name;
    brandInput.value = data.brand;
    descriptionInput.value = data.description;
    priceInput.value = data.price;
    imgUrlInput.value = data.imageUrl;
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
    const isValid = await checkInputs();

    //modify item
    if(isValid) {
        const {nameData, brandData, descriptionData, priceData, imgUrl} = getInputData();
        const modItem = {
            name: nameData,
            brand: brandData,
            description: descriptionData,
            price: parseFloat(priceData),
            imageUrl: imgUrl
        }

        try {
            await productApi.put(query, modItem)
            window.location = "./index.html"
        } catch (error) {
            console.log("Error modifying object.", error)
        }
    }
})

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
    } else {
        nameInput.classList.remove("input-error");
    }

    // check other inputs valid
    if(brandData === "") {
        brandInput.classList.add("input-error");
        isValid = false;
    } else {
        brandInput.classList.remove("input-error");
    }

    if(descriptionData === "") {
        descriptionInput.classList.add("input-error");
        isValid = false;
    } else {
        descriptionInput.classList.remove("input-error");
    }

    if(isNaN(priceData) || priceData <= 0) {
        priceInput.classList.add("input-error");
        isValid = false;
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
        } else {
            nameInput.classList.remove("input-error");
        }
    } catch (error) {
        console.error("Error comparing products.", error);
        isUnique = false;
    }

    return isUnique;
}