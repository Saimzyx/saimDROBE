function getCart(){
    try{
        return JSON.parse(localStorage.getItem("cart")) || [];
    }
    catch{
        return [];
    }
}

function saveCart(cart){
    localStorage.setItem("cart" , JSON.stringify(cart));
}

function addToCart(product){
    const cart = getCart();

    const existingProduct = cart.find(item => item.id === product.id);

    if(existingProduct){
        existingProduct.quantity++;
    }
    else{
        cart.push({
            ...product,
            quantity: 1
        });
    }
    saveCart(cart);
    updateCartCount();
}

document.querySelectorAll('[data-action = "add-to-cart"]').forEach(button => {
    button.addEventListener("click", function() {
        const productCard = this.closest(".product-card");

        const product= {
            id: productCard.dataset.productId,
            name: productCard.dataset.productName,
            price: Number(productCard.dataset.productPrice),
            image: productCard.dataset.productImage
        };
        addToCart(product);

        const originalText = this.textContent;
        this.textContent = "added";

        setTimeout(()=>{
            this.textContent = originalText;
        },1000);
    })
})

function updateCartCount(){
    const cart = getCart();

    const quantity = cart.reduce((total, item)=> {
        return total + item.quantity;
    },0);

    const cartCount = document.getElementById("cart-count");

    if(cartCount){
        cartCount.textContent = quantity;
    }
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");

    if (!cartItems) {
        return;
    }

    const cart = getCart();

    cartItems.innerHTML = cart.map(product => {
        const itemTotal = product.price * product.quantity;

        return `
            <article
                class="cart-item grid grid-cols-[110px_minmax(0,1fr)] gap-4 border-b border-black/15 py-6 sm:grid-cols-[145px_minmax(0,1fr)_110px_110px] sm:gap-6 sm:py-8"
                data-product-id="${product.id}"
            >
                <div class="aspect-[4/5] overflow-hidden bg-[#f1efeb]">
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        class="h-full w-full object-cover"
                    >
                </div>

                <div class="flex min-w-0 flex-col py-1">
                    <h3 class="text-[14px] font-medium sm:text-[16px]">
                        ${product.name}
                    </h3>

                    <p class="mt-3 text-[12px]">
                        Rs. ${product.price.toLocaleString()}
                    </p>

                    <button
                        type="button"
                        class="remove-item mt-auto w-fit border-b border-black/40 text-[9px] uppercase"
                        data-action="remove"
                        data-product-id="${product.id}"
                    >
                        Remove
                    </button>
                </div>

                <div class="col-start-2 flex items-center justify-end sm:col-start-auto sm:justify-center">
                    <div class="flex h-11 items-center border border-black/20">
                        <button
                            type="button"
                            class="h-full w-10"
                            data-action="decrease"
                            data-product-id="${product.id}"
                        >
                            −
                        </button>

                        <span class="flex h-full w-9 items-center justify-center border-x border-black/10 text-[11px]">
                            ${product.quantity}
                        </span>

                        <button
                            type="button"
                            class="h-full w-10"
                            data-action="increase"
                            data-product-id="${product.id}"
                        >
                            +
                        </button>
                    </div>
                </div>

                <p class="hidden items-center justify-end text-[12px] font-medium sm:flex">
                    Rs. ${itemTotal.toLocaleString()}
                </p>
            </article>
        `;
    }).join("");

    updateCartSummary();
    updateEmptyCartState();
}

function changeQuantity(productId, change) {
    const cart = getCart();
    const product = cart.find(item => item.id === productId);

    if (!product) {
        return;
    }

    product.quantity += change;

    const updatedCart = cart.filter(item => item.quantity > 0);

    saveCart(updatedCart);
    renderCart();
    updateCartCount();
}

function removeFromCart(productId) {
    const cart = getCart();

    const updatedCart = cart.filter(item => {
        return item.id !== productId;
    });

    saveCart(updatedCart);
    renderCart();
    updateCartCount();
}

document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const productId = button.dataset.productId;
    const action = button.dataset.action;

    if (action === "increase") {
        changeQuantity(productId, 1);
    }

    if (action === "decrease") {
        changeQuantity(productId, -1);
    }

    if (action === "remove") {
        removeFromCart(productId);
    }
});

function updateCartSummary() {
    const cart = getCart();

    const subtotal = cart.reduce((total, product) => {
        return total + product.price * product.quantity;
    }, 0);

    const quantity = cart.reduce((total, product) => {
        return total + product.quantity;
    }, 0);

    const subtotalElement = document.getElementById("cart-subtotal");
    const totalElement = document.getElementById("cart-total");
    const headingCount = document.getElementById("cart-heading-count");

    if (subtotalElement) {
        subtotalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
    }

    if (totalElement) {
        totalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
    }

    if (headingCount) {
        headingCount.textContent =
            `${quantity} ${quantity === 1 ? "item" : "items"}`;
    }
}

function updateEmptyCartState() {
    const cart = getCart();
    const cartContent = document.getElementById("cart-content");
    const emptyCart = document.getElementById("empty-cart");

    if (!cartContent || !emptyCart) {
        return;
    }

    if (cart.length === 0) {
        cartContent.classList.add("hidden");
        emptyCart.classList.remove("hidden");
    } else {
        cartContent.classList.remove("hidden");
        emptyCart.classList.add("hidden");
    }
}

const clearCartButton = document.getElementById("clear-cart");

if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
        localStorage.removeItem("cart");

        renderCart();
        updateCartCount();
    });
}

updateCartCount();
renderCart();
