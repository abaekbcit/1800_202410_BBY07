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
/*
function onPlaceChanged() {
    var place = autocomplete.getPlace();

    if (!place.geometry) {
      //case for nonvalid place
    } else {
      document.getElementById('details').innerHTML = place.name;
    }
  }
*/

//TODO: case for when user enters an invalid place redirect to posting manual
function onPlaceChanged() {
    const place = autocomplete.getPlace();
    document.getElementById('spot-auto-addr').value = place.formatted_address;
    let name = place.types[0];
    document.getElementById('spot-auto-category').value = name.charAt(0).toUpperCase() + name.substring(1);
    document.getElementById('spot-icon').src = place.icon;
    loadCarousel(place.photos);

    //console.log(place.photos[0].getUrl());
    if (!place.price_level) {
        document.getElementById('spot-auto-price').innerHTML = "";
    } else {
        // TODO: Make price look pretty
        document.getElementById('spot-auto-price').innerHTML = "$".repeat(place.price_level);
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

//TODO: should only be able submit on login

function tabSelection(event, tab) {
    let manualEntry = document.getElementById('manual-entry-form');
    let spotSearch = document.getElementById('spot-search-form');
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
