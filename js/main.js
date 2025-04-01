// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const modelSearch = document.getElementById('modelSearch');
const searchBtn = document.getElementById('searchBtn');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const purchaseBtn = document.getElementById('purchaseBtn');

// Load all products
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        displayProducts(data);
    } catch (error) {
        console.error('Error loading products:', error.message);
    }
}

// Display products in grid
function displayProducts(products) {
    productsContainer.innerHTML = products.map(product => `
        <div class="col-md-4 col-lg-3">
            <div class="card product-card">
                <img src="${product.image_url}" class="card-img-top product-image" alt="${product.model_number}">
                <div class="card-body">
                    <h5 class="card-title">موديل ${product.model_number}</h5>
                    <p class="card-text">
                        الألوان المتاحة: ${product.colors.join(', ')}<br>
                        القياسات المتاحة: ${product.sizes.join(', ')}
                    </p>
                    <button class="btn btn-primary view-product" data-product-id="${product.id}">
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to view buttons
    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', () => showProductDetails(button.dataset.productId));
    });
}

// Search for a specific model
async function searchModel(modelNumber) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('model_number', `%${modelNumber}%`);

        if (error) throw error;

        displayProducts(data);
    } catch (error) {
        console.error('Error searching products:', error.message);
    }
}

// Show product details in modal
async function showProductDetails(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        const modalBody = document.querySelector('#productModal .modal-body');
        modalBody.innerHTML = `
            <div class="text-center mb-3">
                <img src="${product.image_url}" class="img-fluid" alt="${product.model_number}">
            </div>
            <h4>موديل ${product.model_number}</h4>
            <div class="mb-3">
                <h5>الألوان المتاحة:</h5>
                <select class="form-select" id="colorSelect">
                    ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <h5>القياسات المتاحة:</h5>
                <select class="form-select" id="sizeSelect">
                    ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                </select>
            </div>
        `;

        purchaseBtn.dataset.productId = productId;
        productModal.show();
    } catch (error) {
        console.error('Error loading product details:', error.message);
    }
}

// Handle purchase
async function handlePurchase(productId) {
    const colorSelect = document.getElementById('colorSelect');
    const sizeSelect = document.getElementById('sizeSelect');
    
    try {
        const { data, error } = await supabase
            .from('sales')
            .insert([{
                product_id: productId,
                color: colorSelect.value,
                size: sizeSelect.value,
                sale_date: new Date().toISOString()
            }]);

        if (error) throw error;

        alert('تم الشراء بنجاح!');
        productModal.hide();
    } catch (error) {
        console.error('Error processing purchase:', error.message);
        alert('حدث خطأ أثناء عملية الشراء');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadProducts);
searchBtn.addEventListener('click', () => searchModel(modelSearch.value));
modelSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchModel(modelSearch.value);
});
purchaseBtn.addEventListener('click', () => handlePurchase(purchaseBtn.dataset.productId));