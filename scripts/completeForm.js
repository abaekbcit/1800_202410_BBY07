let spotSearch = document.getElementById('spot-search-form');
let manualEntry = document.getElementById('manual-entry-form');
let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
            types: ['establishment'],
            componentRestrictions: { 'country': ['CA'] },
            //fields: ["geometry"],
            fields: ['place_id', 'name', 'formatted_address', 'type', 'icon', 'price_level', 'photos'],
            //types: ['address']
        });

    autocomplete.addListener('place_changed', onPlaceChanged);
}

//TODO: case for when user enters an invalid place redirect to posting manual
function onPlaceChanged() {
    const place = autocomplete.getPlace();
    if (place.place_id) {
        document.getElementById('spot-auto-addr').value = place.formatted_address;
        let name = place.types[0];
        document.getElementById('spot-auto-category').value = name.charAt(0).toUpperCase() + name.substring(1);
        document.getElementById('spot-icon').src = place.icon;
        loadCarousel(place.photos);

        if (!place.price_level) {
            document.getElementById('spot-auto-price').innerHTML = "";
        } else {
            // TODO: Make price look pretty
            document.getElementById('spot-auto-price').innerHTML = "$".repeat(place.price_level);
        }
    }
}

function loadCarousel(photos) {
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

spotSearch.addEventListener('submit', function(e) {
    e.preventDefault();
    submitSpotSearch();
});

//TODO: should only be able submit on login
function submitSpotSearch() {
    if (!autocomplete.getPlace() || !autocomplete.getPlace().place_id) {
        invalidSearchAlert();
    }
}

function invalidSearchAlert() {
    var modal = new bootstrap.Modal(document.getElementById('invalid-search-modal')); 
    modal.toggle(); 
}

document.getElementById('invalid-search-manual').addEventListener('click', function(e) {
    tabSelection({currentTarget: document.getElementById('manual-tab')}, 1);
})