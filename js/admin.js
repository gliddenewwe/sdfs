// DOM Elements
const addProductForm = document.getElementById('addProductForm');
const colorsContainer = document.getElementById('colorsContainer');
const sizesContainer = document.getElementById('sizesContainer');
const productsTableBody = document.getElementById('productsTableBody');
const salesTableBody = document.getElementById('salesTableBody');
const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));

// Add new color/size input fields
function addNewField(container, type) {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <input type="text" class="form-control ${type}-input" placeholder="${type === 'color' ? 'اللون' : 'القياس'}">
        <button type="button" class="btn btn-danger remove-field">-</button>
    `;
    container.insertBefore(div, container.lastElementChild);
    
    div.querySelector('.remove-field').addEventListener('click', () => div.remove());
}

// Get values from multiple inputs
function getFieldValues(container) {
    return Array.from(container.getElementsByClassName(`${container.id.replace('Container', '')}-input`))
        .map(input => input.value.trim())
        .filter(value => value !== '');
}

// Add new product
async function handleAddProduct(e) {
    e.preventDefault();
    
    try {
        const modelNumber = document.getElementById('modelNumber').value;
        const colors = getFieldValues(colorsContainer);
        const sizes = getFieldValues(sizesContainer);
        const imageFile = document.getElementById('productImage').files[0];
        
        if (!modelNumber || !colors.length || !sizes.length || !imageFile) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'جاري الإضافة...';
        
        console.log('بدء رفع الصورة...');
        const imageUrl = await uploadImage(imageFile);
        console.log('تم رفع الصورة بنجاح:', imageUrl);
        
        console.log('جاري إضافة المنتج...');
        console.log('البيانات المرسلة:', {
            model_number: modelNumber,
            colors,
            sizes,
            image_url: imageUrl
        });
        
        const { data, error } = await supabase
            .from('products')
            .insert([{
                model_number: modelNumber,
                colors,
                sizes,
                image_url: imageUrl
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('تم إضافة المنتج بنجاح:', data);
        alert('تم إضافة المنتج بنجاح');
        addProductForm.reset();
        loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('حدث خطأ أثناء إضافة المنتج: ' + (error.message || error));
    } finally {
        // Restore button state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = 'إضافة المنتج';
    }
}

// Upload image to Supabase storage
async function uploadImage(file) {
    try {
        console.log('بدء رفع الصورة...', file.name);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('جاري رفع الملف إلى Supabase Storage...');
        const { data, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

        if (uploadError) {
            console.error('خطأ في رفع الصورة:', uploadError);
            throw uploadError;
        }

        console.log('تم رفع الملف بنجاح:', data);
        
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        console.log('رابط الصورة العام:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        throw new Error('فشل في رفع الصورة: ' + (error.message || error));
    }
}

// Load all products for management
async function loadProducts() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        productsTableBody.innerHTML = products.map(product => `
            <tr>
                <td>${product.model_number}</td>
                <td>${product.colors.join(', ')}</td>
                <td>${product.sizes.join(', ')}</td>
                <td>
                    <img src="${product.image_url}" alt="${product.model_number}" style="height: 50px;">
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary edit-product" data-product-id="${product.id}">
                            تعديل
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-product-id="${product.id}">
                            حذف
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', () => showEditProduct(button.dataset.productId));
        });

        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', () => deleteProduct(button.dataset.productId));
        });
    } catch (error) {
        console.error('Error loading products:', error.message);
    }
}

// Load sales data
async function loadSales() {
    try {
        const { data: sales, error } = await supabase
            .from('sales')
            .select(`
                *,
                products (model_number)
            `)
            .order('sale_date', { ascending: false });

        if (error) throw error;

        salesTableBody.innerHTML = sales.map(sale => `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.products.model_number}</td>
                <td>${sale.color}</td>
                <td>${sale.size}</td>
                <td>${new Date(sale.sale_date).toLocaleString('ar-SA')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading sales:', error.message);
    }
}

// Show edit product modal
async function showEditProduct(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        const form = document.getElementById('editProductForm');
        form.innerHTML = `
            <input type="hidden" id="editProductId" value="${product.id}">
            <div class="mb-3">
                <label class="form-label">رقم الموديل</label>
                <input type="text" class="form-control" id="editModelNumber" value="${product.model_number}">
            </div>
            <div class="mb-3">
                <label class="form-label">الألوان</label>
                <div id="editColorsContainer">
                    ${product.colors.map(color => `
                        <div class="input-group mb-2">
                            <input type="text" class="form-control color-input" value="${color}">
                            <button type="button" class="btn btn-danger remove-field">-</button>
                        </div>
                    `).join('')}
                    <button type="button" class="btn btn-success" id="addEditColor">إضافة لون</button>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">القياسات</label>
                <div id="editSizesContainer">
                    ${product.sizes.map(size => `
                        <div class="input-group mb-2">
                            <input type="text" class="form-control size-input" value="${size}">
                            <button type="button" class="btn btn-danger remove-field">-</button>
                        </div>
                    `).join('')}
                    <button type="button" class="btn btn-success" id="addEditSize">إضافة قياس</button>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">صورة جديدة (اختياري)</label>
                <input type="file" class="form-control" id="editProductImage" accept="image/*">
            </div>
            <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
        `;

        // Add event listeners
        form.addEventListener('submit', handleEditProduct);
        document.getElementById('addEditColor').addEventListener('click', () => 
            addNewField(document.getElementById('editColorsContainer'), 'color'));
        document.getElementById('addEditSize').addEventListener('click', () => 
            addNewField(document.getElementById('editSizesContainer'), 'size'));
        
        document.querySelectorAll('.remove-field').forEach(button => {
            button.addEventListener('click', () => button.parentElement.remove());
        });

        editProductModal.show();
    } catch (error) {
        console.error('Error loading product details:', error.message);
    }
}

// Handle edit product submission
async function handleEditProduct(e) {
    e.preventDefault();
    
    try {
        const productId = document.getElementById('editProductId').value;
        const modelNumber = document.getElementById('editModelNumber').value;
        const colors = getFieldValues(document.getElementById('editColorsContainer'));
        const sizes = getFieldValues(document.getElementById('editSizesContainer'));
        const imageFile = document.getElementById('editProductImage').files[0];

        const updateData = {
            model_number: modelNumber,
            colors,
            sizes
        };

        if (imageFile) {
            updateData.image_url = await uploadImage(imageFile);
        }

        const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId);

        if (error) throw error;

        alert('تم تحديث المنتج بنجاح');
        editProductModal.hide();
        loadProducts();
    } catch (error) {
        console.error('Error updating product:', error.message);
        alert('حدث خطأ أثناء تحديث المنتج');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        alert('تم حذف المنتج بنجاح');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error.message);
        alert('حدث خطأ أثناء حذف المنتج');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadSales();
    
    // Add color/size field buttons
    document.querySelector('.add-color').addEventListener('click', () => addNewField(colorsContainer, 'color'));
    document.querySelector('.add-size').addEventListener('click', () => addNewField(sizesContainer, 'size'));
    
    // Add product form
    addProductForm.addEventListener('submit', handleAddProduct);
});