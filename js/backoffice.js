import { fetchAPI } from "./class.js";
const productApi = new fetchAPI;

const nameInput = document.getElementById("nameInput");
const brandInput = document.getElementById("brandInput");
const descriptionInput = document.getElementById("descriptionInput");
const priceInput = document.getElementById("priceInput");
const imgUrlInput = document.getElementById("imgUrlInput");
const createBtn = document.getElementById("createBtn");

createBtn.addEventListener("click", async e => {
    e.preventDefault();
    // check if inputs are valid
    const isValid = await checkInputs();

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
        try {
            const products = await productApi.get();
            const isDuplicate = products.some(product => product.name.toLowerCase() === nameData.toLowerCase());
            if(isDuplicate) {
                nameInput.classList.add("input-error");
                isValid = false;
            } else {
                nameInput.classList.remove("input-error");
            }
        } catch (error) {
            console.error("Error comparing products.", error);
            isValid = false;
        }
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