let spotSearch = document.getElementById('spot-search-form');
let manualEntry = document.getElementById('manual-entry-form');
let autocomplete;

function initAutocomplete() {
    //Constraints to search range for better search results
    const sw = { lat: 48.978508, lng: -123.397751};
    const ne = { lat: 49.423439, lng: -122.653118};
    const cornerBounds = new google.maps.LatLngBounds(sw, ne);
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
            types: ['establishment'],
            componentRestrictions: { 'country': ['CA'] },
            fields: ['geometry.location', 'name', 'formatted_address', 'type', 'icon', 'price_level', 'photos'],
        });

    autocomplete.setBounds(cornerBounds);
    autocomplete.setOptions({ strictBounds: true });

    autocomplete.addListener('place_changed', onPlaceChanged);
}

async function initMap(lat, lng, name) {
    const position = { lat: lat, lng: lng };
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    let map = new Map(document.getElementById("map"), {
        zoom: 14,
        center: position,
        mapId: "SPOT_MAP_ID",
    });

    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: name,
    });
}

function onPlaceChanged() {
    const place = autocomplete.getPlace();
    let location = place.geometry.location;
    if (location) {
        document.getElementById('autocomplete').value = place.name;
        document.getElementById('spot-auto-addr').value = place.formatted_address;
        let type = place.types[0];
        document.getElementById('spot-auto-category').value = type.charAt(0).toUpperCase() + type.substring(1);
        document.getElementById('spot-icon').src = place.icon;
        loadCarousel(place.photos);
        initMap(location.lat(), location.lng(), place.name);

        if (!place.price_level) {
            document.getElementById('spot-auto-price').innerHTML = "";
        } else {
            // TODO: Make price look pretty
            document.getElementById('spot-auto-price').innerHTML = "$".repeat(place.price_level);
        }
    }
}

function loadCarousel(photos) {
    document.getElementById('carousel-slide-entrance').innerHTML = "";
    photos.forEach((photo, i) => {
        if (i === 0) {
            var slide = `<div class="carousel-item active">
                            <img src=${photo.getUrl()} class="d-block w-100 carousel-img" alt="...">
                        </div>`;
        } else {
            var slide = `<div class="carousel-item">
                            <img src=${photo.getUrl()} class="d-block w-100 carousel-img" alt="...">
                        </div>`;
        }
        document.getElementById('carousel-slide-entrance').insertAdjacentHTML("beforeend", slide);
    });
}

function tabSelection(event, tab) {
    //TODO: Maybe abstract things better
    switch(tab) {
        case 0:
            spotSearch.style.display = "flex";
            manualEntry.style.display = "none";
            document.getElementById('manual-tab').className = "nav-link spot-tab";
            break;
        case 1:
            spotSearch.style.display = "none";
            manualEntry.style.display = "flex";
            document.getElementById('search-tab').className = "nav-link spot-tab";
            break;
    }
    event.currentTarget.className = "nav-link active spot-tab";
}

function invalidSearchAlert() {
    var modal = new bootstrap.Modal(document.getElementById('invalid-search-modal')); 
    modal.toggle(); 
}

document.getElementById('invalid-search-manual').addEventListener('click', function(e) {
    tabSelection({currentTarget: document.getElementById('manual-tab')}, 1);
})

spotSearch.addEventListener('reset', function(e) {
    resetSpotSearch();
});

function resetSpotSearch() {
    document.getElementById('spot-icon').src = "";
    document.getElementById('carousel-slide-entrance').innerHTML = "";
    document.getElementById('map').innerHTML = "";
}

spotSearch.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!autocomplete.getPlace() || !autocomplete.getPlace().geometry.location) {
        invalidSearchAlert();
    } else {
        let place = autocomplete.getPlace();
        let name = place.name;
        let category = place.types[0];
        let price = (place.price_level)? place.price_level : 0;
        let addrParts = place.formatted_address.split(', ');
        let addr = addrParts[0];
        let city = addrParts[1];
        let zip = addrParts[2].substring(3);
        let imgs = [];
        place.photos.forEach((photo) => {
            imgs.push(photo.getUrl());
        });
        let verified = true;
        submitSpot(name, category, price, addr, city, zip, imgs, verified, e);
    }
});

manualEntry.addEventListener('submit', function(e) {
    e.preventDefault();
    let name = document.getElementById('spot-man-name').value;
    let category = document.getElementById('spot-man-category').value;
    let price = document.getElementById('spot-man-price').value;
    let addr = document.getElementById('spot-man-addr').value;
    let city = document.getElementById('spot-man-city').value;
    let zip = document.getElementById('spot-man-zip').value;
    let imgs = [document.getElementById('spot-man-img').value];
    let verified = false;
    submitSpot(name, category, price, addr, city, zip, imgs, verified, e);
});

function submitSpot(name, category, price, addr, city, zip, imgs, verified, e) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            const userID = user.uid;
            var spotsDB = db.collection("spots");
            spotsDB.add({
                name: name,
                authorID: userID,
                category: category,
                price: price,
                addr: addr,
                city: city,
                zip: zip,
                imgs: imgs,
                verified: verified
                
            }).then(function(res) {
                e.target.reset();
                if (e.target.id === 'spot-search-form') {
                    resetSpotSearch();
                }
                spotSubmittedAlert();
            });
        }
    });
}

function spotSubmittedAlert() {
    var modal = new bootstrap.Modal(document.getElementById('spot-submitted-modal')); 
    modal.toggle(); 
}

let goHome = document.getElementById('spot-submitted-go-home');
goHome.addEventListener('click', function(e) {
    window.location.assign("main.html");
});
