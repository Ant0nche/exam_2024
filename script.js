'use-strict'

let currentPage = 1;
let perPage = 5;
let selectedRoute;
let selectedGuide;
let searchedGuides;

function getURL(path) {
    let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${path}`);
    url.searchParams.set("api_key", "51f99d95-e6b9-481d-a4fa-b02fba54a3c7");
    return url;
}

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