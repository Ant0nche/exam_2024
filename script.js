'use-strict'

let currentPage = 1;
let perPage = 5;
let selectedRoute;
let selectedGuide;
let searchedGuides;

/*Формирует URL для API запросов.*/
function getURL(path) {
    let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${path}`);
    url.searchParams.set("api_key", "51f99d95-e6b9-481d-a4fa-b02fba54a3c7");
    return url;
}

/*Яндекс.Карта*/
ymaps.ready(init);
function init() {
    var myMap = new ymaps.Map("map", {
            center: [55.76, 37.64],
            zoom: 10
        }, {
            searchControlProvider: 'yandex#search'
        }),
            objectManager = new ymaps.ObjectManager({
                // Чтобы метки начали кластеризоваться, выставляем опцию.
                clusterize: true,
                // ObjectManager принимает те же опции, что и кластеризатор.
                gridSize: 32,
                clusterDisableClickZoom: true
        });
        myGeoObject = new ymaps.GeoObject({
            // Описание геометрии.
            geometry: {
                type: "Point",
                coordinates: [55.8, 37.8]
            },
        });
        $.ajax('./js/coordinate.json').done(function (response) {
            let geoData = [];
            for(i = 7; i < response.length; i++){
                geoData.push(response[i].geoData.coordinates);
            }
            console.log(geoData)
            myMap.geoObjects
                .add(myGeoObject)   
                .add(new ymaps.Placemark(geoData[1]));  
                console.log(geoData[1]);XMLDocument
        });
}


/*Очищает выбранные элементы в таблице.*/
function clearSelect(name) {
    let table = document.getElementById(name);
    for (let row of table.children) {
        row.classList.remove('table-secondary');
    }
}

/*Получает информацию о маршрутах с сервера.*/
async function getRoute() {
    try {
        let response = await fetch(getURL('routes'));
        let routes = [];
        let items = await response.json();
        for (let i = 0; i < items.length; i++) {
            let item = {};
            item['id'] = items[i].id;
            item['name'] = items[i].name;
            item['description'] = items[i].description;
            item['mainObject'] = items[i].mainObject;
            routes.push(item);
        }
        sessionStorage.setItem('routes', JSON.stringify(routes));
        showRoute(1);
    } catch (error) {
        console.error('Error fetching routes:', error);
    }
}

/*Обрабатывает выбор маршрута.*/
async function RouteButtonHandler(item, tableRow) {
    selectedRoute = item;
    clearSelect('routeTableBody');
    tableRow.classList.add('table-secondary');
    let guides = document.getElementById('guide');
    guides.classList.remove('hide');
    let header = document.querySelector('.guide-route');
    header.innerHTML = `Доступные гиды по маршруту ${item.name}`;
    await getGuides(item.id);
    searchedGuides = [];
    showGuide();
    setLanguage();
    showOrder();
}


/*Создает элементы пагинации.*/
function liCreate(name, value, active) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    let link = document.createElement('a');
    link.innerHTML = name;
    link.classList.add('page-link');
    link.classList.add('link');
    link.onclick = () => {
        showRoute(value);
    };
    li.append(link);
    if (active) {
        link.classList.add('text-white');
        link.classList.add('primary');
    }
    return li;
}

/*Отображает пагинацию для маршрутов.*/
function showPag(page) {
    let pages = document.querySelector('.pagination');
    pages.innerHTML = '';

    pages.append(liCreate('Первая страница', 1));

    let items = getRouteFromStorage();
    let start = Math.max(page - 2, 1);
    let last = Math.ceil(items.length / perPage);
    let end = Math.min(page + 2, last);

    for (let i = start; i <= end; i++) {
        pages.append(liCreate(i, i, page === i));
    }

    pages.append(liCreate('Последняя страница', last));
}

/*Получает информацию о маршрутах из хранилища.*/
function getRouteFromStorage() {
    let items = JSON.parse(sessionStorage.getItem('searched-routes'));
    if (items == undefined) {
        items = JSON.parse(sessionStorage.getItem('routes'));
    }
    return items;
}

/*Отображает информацию о маршрутах.*/
function showRoute(page) {
    let table = document.getElementById('routeTableBody');
    let items = getRouteFromStorage();
    showPag(page);
    table.innerHTML = '';
    clearSelect('routeTableBody');
    let end = Math.min(page * perPage, items.length);
    for (let i = (page - 1) * perPage; i < end; i++) {
        let tr = document.createElement('tr');
        if (selectedRoute != undefined && items[i].id == selectedRoute.id) {
            tr.classList.add('table-secondary');
        }

        let name = document.createElement('th');
        name.innerHTML = items[i].name;
        tr.append(name);

        let descr = document.createElement('td');
        descr.innerHTML = items[i].description;
        tr.append(descr);

        let obj = document.createElement('td');
        obj.innerHTML = items[i].mainObject;
        tr.append(obj);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn');
        button.classList.add('primary');
        button.classList.add('text-white');
        button.onclick = () => {
            RouteButtonHandler(items[i], tr);
        };
        buttonTd.append(button);
        tr.append(buttonTd);
        table.append(tr);
    }
}

/*Настраивает фильтр объектов маршрутов.*/
function setterObj() {
    let items = JSON.parse(sessionStorage.getItem('routes'));
    let select = document.getElementById('objects');
    select.innerHTML = '';
    let uniqueObjects = ['Любой', ...new Set(items.map(item => item.mainObject))];
    for (let obj of uniqueObjects) {
        let option = document.createElement("option");
        option.innerHTML = obj;
        option.setAttribute("value", obj);
        select.appendChild(option);
    }
}

/*Ищет маршруты согласно заданным критериям.*/
function findRoute(form) {
    let items = JSON.parse(sessionStorage.getItem('routes'));
    let search = form.elements['search'].value.trim();
    let select = form.elements['objects'].value;
    let searched = [];
    if (search && search !== '') {
        searched = items.filter(item => item.name.includes(search));
    } else {
        searched = [...items]; 
    }
    if (select !== 'Любой') {
        searched = searched.filter(item => item.mainObject.includes(select));
    }
    sessionStorage.setItem('searched-routes', JSON.stringify(searched));
    showRoute(1);
}

/*Инициализирует страницу при загрузке.*/
window.onload = async () => {
    await getRoute();
    setterObj();
}