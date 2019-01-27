"use strict";
const container = document.querySelector(".container");
const getRoot = document.querySelector(".pizzas-container");
const itemAdded = document.querySelector(".item-added");
const cartBtn = document.querySelector("#cart-btn");
const backgroundModal = document.querySelector(".background-modal");
const modalBox = document.querySelector(".modal-detail-box");
const modalCloseBtn = document.querySelector(".modal-total-close-btn");
const modalItems = document.querySelector(".modal-items");
const modalRemoveAllItems = document.querySelector("#modal-delete-order");
const totalPrice = document.querySelector("#total-price");
const modalSubmitBtn = document.querySelector("#modal-total-next");
const modalFinalOrder = document.querySelector(".checkout-modal");
const errorModal = document.querySelector(".error-modal");
const modalFinalForm = document.querySelector(".checkout-modal-submit");
let state = [];
let finalOrder = [];
const getData = async () => {
  const response = await fetch("../data/data.json");
  if (response.status === 200) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Something Went Wrong...");
  }
};
// add piza items to DOM
const drawItems = async () => {
  const data = await getData();
  let template = "";
  data.forEach(item => {
    template += `<div class="item">
            <div class="image-box">
                <img src="./images/${item.image}" alt="">
            </div>
        <div class="pizza-detail">
            <div class="pizza-size">${item.size}</div>
            <div class="pizza-name">${item.name}</div>
            <div class="pizza-ingredients">${item.ingredients}</div>
            <div class="pizza-delivery">
                <div class="left">
                    <button class="decrement" onclick="removeItemDetails(this,${
                      item.id
                    })"><i class="large material-icons">chevron_left</i></button>

                    <span class="pizza-count">0</span>
                    <button class="increment" onclick="addItemDetails(this,${
                      item.id
                    })">  <i class="large material-icons">chevron_right</i>
                    </button>
                </div>
                <button class="right" id="button${
                  item.id
                }"onclick="addToCart(this,${item.id})">Add to cart</button>
            </div>
            <div class="pizza-price">${item.price}$</div>

        </div>
        </div>`;
  });
  getRoot.innerHTML = template;
};
drawItems();
//increment button
const addItemDetails = async (e, id) => {
  const spanCount = e.previousSibling.previousSibling;
  const data = await getData();
  const item = data.filter(item => item.id === id)[0];
  const checkState = state.filter(clicked => clicked.id === item.id)[0];

  if (checkState === undefined) {
    state = [
      ...state,
      { id: item.id, name: item.name, quantity: 1, price: item.price }
    ];
    const filteredItem = state.filter(stateitem => stateitem.id === item.id)[0];
    spanCount.textContent = filteredItem.quantity;
  } else {
    const filteredItem = state.filter(stateitem => stateitem.id === item.id)[0];
    filteredItem.quantity += 1;
    filteredItem.price += item.price;
    spanCount.textContent = filteredItem.quantity;
  }
};
// decrement button
const removeItemDetails = async (e, id) => {
  const spanCount = e.nextSibling.nextSibling;
  const data = await getData();
  const item = data.filter(item => item.id === id)[0];
  const checkState = state.filter(clicked => clicked.id === item.id)[0];
  if (checkState !== undefined) {
    if (checkState.quantity > 0) {
      checkState.quantity -= 1;
      checkState.price -= item.price;
      spanCount.textContent = checkState.quantity;
      if (checkState.quantity === 0) {
        state = [];
      }
    }
  }
};
// Add to Cart add disable button
const addToCart = async (e, id) => {
  const data = await getData();
  const item = data.filter(item => item.id === id)[0];
  const checkState = state.filter(stateItem => stateItem.id === item.id)[0];
  if (checkState !== undefined) {
    finalOrder = [...finalOrder, checkState];
    itemAdded.classList.add("display-block");
    setTimeout(() => {
      itemAdded.classList.remove("display-block");
    }, 2000);
    e.textContent = "Added to cart";
    e.disabled = true;
  }
};

// show detail info about user's order in MODAL
const addInfoToCart = state => {
  let template = "";
  state.forEach(item => {
    template += `<div class="modal-order-item"><div><span class="modal-order-pizza-name">${
      item.name
    }</span><span>${item.quantity}x ${
      item.price
    }$</span></div><button class="modal-remove-item" onclick="removeItem(this,${
      item.id
    })">remove</button></div>`;
  });
  let totalPriceSum = 0;
  state.forEach(item => (totalPriceSum += item.price));
  totalPrice.textContent = totalPriceSum;
  modalItems.innerHTML = template;
};
//  OPEN MODAL
let checkCondition = true;
cartBtn.addEventListener("click", function() {
  if (checkCondition) {
    if (finalOrder.length > 0) {
      addInfoToCart(finalOrder);
    }
    backgroundModal.classList.add("display-block");
    modalBox.classList.add("display-block");
    checkCondition = !checkCondition;
  } else {
    backgroundModal.classList.remove("display-block");
    modalBox.classList.remove("display-block");
    checkCondition = !checkCondition;
  }
});
// CLOSE MODAL
backgroundModal.addEventListener("click", function() {
  backgroundModal.classList.remove("display-block");
  modalBox.classList.remove("display-block");
  modalFinalOrder.classList.remove("display-block");
  checkCondition = !checkCondition;
});
modalCloseBtn.addEventListener("click", function() {
  backgroundModal.classList.remove("display-block");
  modalBox.classList.remove("display-block");
  checkCondition = !checkCondition;
});
// REMOVE ALL ITEMS
const removeAllItem = () => {
  finalOrder = [];
  state = [];
  addInfoToCart(finalOrder);
  const allButtons = document.querySelectorAll(".right");
  const allSpanCounts = document.querySelectorAll(".pizza-count");
  allSpanCounts.forEach(item => {
    item.textContent = 0;
  });
  allButtons.forEach(item => {
    item.disabled = false;
    item.textContent = "add to cart";
  });
};
modalRemoveAllItems.addEventListener("click", function() {
  removeAllItem();
});

//REMOVE CLICKED ITEM FROM MODAL + remove disable from the item button
const removeItem = (e, id) => {
  finalOrder = finalOrder.filter(finalOrderItem => finalOrderItem.id !== id);
  addInfoToCart(finalOrder);
  const allItems = document.querySelectorAll(".right");
  const exactItem = "button" + id;
  let buttonResult = "";
  allItems.forEach(item => {
    if (item.id === exactItem) {
      buttonResult = item;
    }
  });
  if (buttonResult !== "") {
    buttonResult.disabled = false;
    buttonResult.textContent = "add to cart";
  }
};
// Modal NEXT BTN / if item exists show form
modalSubmitBtn.addEventListener("click", function(e) {
  e.preventDefault();
  if (finalOrder.length > 0) {
    modalBox.classList.remove("display-block");
    modalFinalOrder.classList.add("display-block");
  } else {
    errorModal.textContent = "Your cart is empty";
    errorModal.classList.add("display-block");
    setTimeout(function() {
      errorModal.classList.remove("display-block");
      errorModal.textContent = "";
    }, 2000);
  }
});

//SUBMIT FORM
modalFinalForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const firstname = e.target.firstname.value.replace(/[^\w\s]/gi, "");
  const lastname = e.target.lastname.value.replace(/[^\w\s]/gi, "");
  const country = e.target.country.value.replace(/[^\w\s]/gi, "");
  const street = e.target.street.value.replace(/[^\w\s]/gi, "");
  if (firstname.length > 1 && lastname.length > 2 && country && street) {
    alert(`${firstname + lastname} -  You have successfully ordered food `);
    backgroundModal.classList.remove("display-block");
    modalFinalOrder.classList.remove("display-block");
    checkCondition = !checkCondition;
    removeAllItem();
  } else {
    errorModal.textContent = "Please enter a valid input";
    errorModal.classList.add("display-block");
    setTimeout(function() {
      errorModal.classList.remove("display-block");
      errorModal.textContent = "";
    }, 2000);
  }
});
