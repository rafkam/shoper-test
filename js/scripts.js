// BASE DATA
const API_BASE_URL = 'http://localhost:4000';
const PRODUCTS_API_BASE_URL = `${API_BASE_URL}/products`;
const CATEGORY_API_BASE_URL = `${API_BASE_URL}/category`;
const BRANDS_API_BASE_URL = `${API_BASE_URL}/brands`;
const CONTAINER = document.getElementById('container');
const BRAND_SELECT = document.getElementById('brand');
const LOADING_INFO = document.getElementById('load_content');
const CATEGORY_SELECT = document.getElementById('category');
const PRODUCTS_WRAPPER = document.getElementById('products');
const BUTTON_LOAD_MORE = document.getElementById('load_more');
const FILTER_FORM = document.getElementById('filter-form');
const NO_ITEMS_MESSAGE = document.getElementById('no-items');

// PAGER
let page = 1;
let limit = 5;
let total = 0;

// DATA CONTENT
let htmlListProduct = "";
let category = {};
let brands = {};
let actualCategory = "";
let actualBrand = "";

//EVENTS
BUTTON_LOAD_MORE.addEventListener('click',function(e){
    loadMoreProducts(e);
})

FILTER_FORM.addEventListener('change',function(){
    filterProducts();
})

//START APP
fetchDataView();


//App functions
async function fetchDataView() {
    const [productsResponse, categoryResponse, brandsResponse] = await Promise.all([
        fetch(`${PRODUCTS_API_BASE_URL}?_page=${page}&_limit=${limit}`),
        fetch(`${CATEGORY_API_BASE_URL}`),
        fetch(`${BRANDS_API_BASE_URL}`)
    ]);
    products = await productsResponse.json();
    category = await categoryResponse.json();
    brands = await brandsResponse.json();
    total = await productsResponse.headers.get('X-Total-Count');
    if(products == await products && category == await category && brands == await brands) {
        CONTAINER.classList.add('load');
        LOADING_INFO.classList.add('load');
    }
    createListProducts(products);
    createListCategory(category.sort(sortList));
    createListBrands(brands.sort(sortList));
}

function sortList( a, b ) {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
}

function createProduct(data) {
    return `<div class="item"><figure><img src="${data.thumbnail}" alt="${data.title}" /></figure><div><h3>${data.title}</h3><p class="category"><span>${getCategoryName(data.category).name}</span> <span>${getProducerName(data.brand).name}</span></p><p class="price">Price: <strong>${data.price} $</strong></p><br /><a href="#">Add to cart</a><br /><br /><p><strong>Description:</strong><br /><br />${data.description}</p></div></div>`;
}

function getCategoryName(el) {
    return category.find(category => category.id === el);
}

function getProducerName(el) {
    return brands.find(brand => brand.id === el);
}

function createSelectItem(data) {
    return `<option value="${data.id}">${data.name}</option>`;
}

function createListProducts(products){
    htmlListProduct = "";
    if(page == 1) {
        PRODUCTS_WRAPPER.innerHTML = ""
    }
    products.forEach(item => {
        htmlListProduct = htmlListProduct + createProduct(item);
    });
    PRODUCTS_WRAPPER.innerHTML += htmlListProduct;
}

function createListCategory(category){
    let htmlListCategories = "<option value=''>category</option>";
    category.forEach(item => {
        htmlListCategories = htmlListCategories + createSelectItem(item);
    });
    CATEGORY_SELECT.innerHTML += htmlListCategories;
}

function createListBrands(brands){
    let htmlListCategories = "<option value=''>brands</option>";
    brands.forEach(item => {
        htmlListCategories = htmlListCategories + createSelectItem(item);
    });
    BRAND_SELECT.innerHTML += htmlListCategories;
}

async function loadMoreProducts(e) {
    e.preventDefault();
    if(page < total/limit) {
        ++page;
        if(page > total/limit) {
            BUTTON_LOAD_MORE.classList.add('hide');
        } else {
            BUTTON_LOAD_MORE.classList.remove('hide');
        }
        const products = await fetch(`${PRODUCTS_API_BASE_URL}?${BRAND_SELECT.value ? 'brand='+BRAND_SELECT.value+'&' : ''}${CATEGORY_SELECT.value ? 'category='+CATEGORY_SELECT.value+'&' : ''}_page=${page}&_limit=${limit}`);
        let data = await products.json();
        createListProducts(data);
    }
}

async function filterProducts(){
    page = 1;
    const products = await fetch(`${PRODUCTS_API_BASE_URL}?${BRAND_SELECT.value ? 'brand='+BRAND_SELECT.value+'&' : ''}${CATEGORY_SELECT.value ? 'category='+CATEGORY_SELECT.value+'&' : ''}_page=${page}&_limit=${limit}`);
    let data = await products.json();
    total = products.headers.get('X-Total-Count');
    createListProducts(data);
    if(page > total/limit) {
        BUTTON_LOAD_MORE.classList.add('hide');
    } else {
        BUTTON_LOAD_MORE.classList.remove('hide');
    }
    // No items
    if(total == 0) {
        NO_ITEMS_MESSAGE.classList.add('active');
        BUTTON_LOAD_MORE.classList.add('hide');
    } else {
        NO_ITEMS_MESSAGE.classList.remove('active');
        BUTTON_LOAD_MORE.classList.remove('hide');
    }
}