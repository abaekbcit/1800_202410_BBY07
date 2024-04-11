let lat;
let lng;
let distance;
let verified;
let selectedVerified;
let price = [];
let selectedPrice = [];
let rating;
let sort;
let selectedSort;
let sortOrder = "desc";
let selectedSortOrder;
let autocompleteSearchAddr;

//Initializes a Google map autocomplete input bar. Strictly constrained to search only within the Greater
//Vancouver area. Fields are given appropriately to receive data needed later on.
function initAutocompletes() {
    //Gives an option to use current location in the autocomplete bar
    setTimeout(function () {
        $(".pac-container").append(`<div id="areasearch" class="pac-item areasearch" onmousedown="useCurrentLocation()">
                                        <span class="pac-icon pac-icon-areas">
                                        </span><span class="pac-item-query">
                                        <span class="pac-matched"></span>Current Location</span> 
                                    </div>`);
    }, 500);
    //Constraints to search range to restrict search area to roughly Greater Vancouver area
    const sw = { lat: 48.978508, lng: -123.397751 };
    const ne = { lat: 49.423439, lng: -122.653118 };
    const cornerBounds = new google.maps.LatLngBounds(sw, ne);

    //Autocomplete that only works with addresses
    autocompleteSearchAddr = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete-search-addr'),
        {
            types: ['address'],
            componentRestrictions: { 'country': ['CA'] },
            fields: ['geometry.location', 'formatted_address'],
        }
    );
    autocompleteSearchAddr.setBounds(cornerBounds);
    autocompleteSearchAddr.setOptions({ strictBounds: true });
    autocompleteSearchAddr.addListener('place_changed', onSearchAddrChanged);
}

//Prompts user for access to user's current location. Sets lat and lng appropriately
//if permitted.
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            document.getElementById('autocomplete-search-addr').value = "";
            document.getElementById('autocomplete-search-addr').placeholder = "Using current location";
            if (distance != null) {
                onParamsChanged();
            }
        });
    }
}

//Set lat and lng to place's coordinates once a place is selected in the autocompleteSearchAddr input.
function onSearchAddrChanged() {
    const place = autocompleteSearchAddr.getPlace();
    let location = place.geometry.location;
    document.getElementById('autocomplete-search-addr').placeholder = "Enter an address or use current location";
    if (location) {
        lat = location.lat();
        lng = location.lng();
        if (distance != null) {
            onParamsChanged();
        }
    }
}

//Resets autocompleteSearchAddr. Sets lat and lng to null.
function resetSearchAddr() {
    document.getElementById('autocomplete-search-addr').value = "";
    document.getElementById('autocomplete-search-addr').placeholder = "Enter an address or use current location";
    lat = null;
    lng = null;
}

//Calls getSpotsByParams with appropriate parameters (selected parameters as non-null values). Sort order is descending by default.
function onParamsChanged() {
    if (verified != null) {
        var verifiedBool = (verified === "verified");
    }
    let order = (sortOrder != null) ? sortOrder : "desc";
    getSpotsByParams(lat, lng, distance, verifiedBool, price, rating, sort, order);
}

//Opens modal for given param.
function toggleParamModal(param) {
    let modalToToggle = param + '-param-modal';
    var modal = new bootstrap.Modal(document.getElementById(modalToToggle));
    modal.toggle();
}

let off = "btn btn-light dropdown-toggle col";
let on = "btn btn-dark dropdown-toggle col";

//Toggles a given button to a given state through its class.
function toggleparamButton(button, state) {
    button.className = state;
}

//Resets all the search parameters.
function resetAllParams() {
    resetSearchAddr();
    resetDistance();
    resetVerified();
    resetPrice();
    resetRating();
    resetSort();
    onParamsChanged();
}

document.getElementById('reset-params-button').addEventListener('click', () => {
    resetAllParams();
})

//Unselects (change button appearance to light) for all buttons corresponding to param.
function unselectAllButtons(buttons, param) {
    let lightBtn = "btn btn-light col " + param + "-btn";
    buttons.forEach((btn) => {
        btn.className = lightBtn;
    });
}

//Keep selected buttons selected even when other options selected then modal closed without applying.
function persistSelectedButton(buttons, value) {
    buttons.forEach((btn) => {
        if (btn.value == value) {
            btn.className = "btn btn-dark col price-btn";
        }
    });
}

//Sets the value for a range type input slider.
function setRange(slider, val) {
    slider.value = val;
}

//-------------------------- Functions related to distance param button --------------------------

let distanceParamButton = document.getElementById('spot-params-distance');
let distanceRange = document.getElementById('distance-param-range');

distanceParamButton.addEventListener('click', () => {
    toggleParamModal('distance');
});

//Sets the distance range input slider to be labelled appropriately.
function setDistanceRangeDesc() {
    let distanceRangeDesc = document.getElementById('distance-range-desc');
    let distInDesc = (distance != null) ? distance : 0;
    distanceRangeDesc.innerHTML = `Up to ${distInDesc}km`;
}

//Resets the distance parameter.
function resetDistance() {
    toggleparamButton(distanceParamButton, off);
    distance = null;
    setRange(distanceRange, 0);
    setDistanceRangeDesc();
}

document.getElementById('distance-param-reset').addEventListener('click', () => {
    resetDistance();
    onParamsChanged();
});

document.getElementById('distance-param-apply').addEventListener('click', () => {
    toggleparamButton(distanceParamButton, on);
    distance = parseInt(distanceRange.value);
    if (lat != null & lng != null) {
        onParamsChanged();

    }
});

document.getElementById('distance-param-close').addEventListener('click', () => {
    if (distance == null) {
        setRange(distanceRange, 0);
        setDistanceRangeDesc();
    } else {
        setRange(distanceRange, distance);
        setDistanceRangeDesc();
    }
});

//-------------------------- Functions related to verified param button --------------------------

let verifiedParamButton = document.getElementById('spot-params-verified');
let verifiedButtons = document.querySelectorAll('.verified-btn');

verifiedParamButton.addEventListener('click', () => {
    toggleParamModal('verified');
});

//For selecting (changing appearance to dark) buttons in the verified parameter options.
function selectVerifiedButton(e) {
    let darkBtn = "btn btn-dark col price-btn";
    e.target.className = darkBtn;
}

verifiedButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        selectedVerified = e.target.value;
        unselectAllButtons(verifiedButtons, "verified");
        selectVerifiedButton(e);
    });
});

//Resets the verified parameter.
function resetVerified() {
    toggleparamButton(verifiedParamButton, off);
    unselectAllButtons(verifiedButtons, "verified");
    verified = null;
    selectedVerified = null;
}

document.getElementById('verified-param-reset').addEventListener('click', () => {
    resetVerified();
    onParamsChanged();
});

document.getElementById('verified-param-apply').addEventListener('click', () => {
    toggleparamButton(verifiedParamButton, on);
    verified = selectedVerified;
    onParamsChanged();
});

document.getElementById('verified-param-close').addEventListener('click', () => {
    unselectAllButtons(verifiedButtons, "verified");
    if (verified != null) {
        persistSelectedButton(verifiedButtons, verified);
    }
});

//-------------------------- Functions related to price param button --------------------------

let priceParamButton = document.getElementById('spot-params-price');
let priceButtons = document.querySelectorAll('.price-btn');

priceParamButton.addEventListener('click', () => {
    toggleParamModal('price');
});

//Toggles a price button between two states (light/unselected and dark/selected).
function togglePriceButton(e) {
    let unselected = "btn btn-light col price-btn"
    let selected = "btn btn-dark col price-btn"
    e.target.className = e.target.className === unselected ? selected : unselected;
}

priceButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        selectedPrice.push(parseInt(e.target.value));
        togglePriceButton(e);
    });
});

//Resets the price parameter.
function resetPrice() {
    toggleparamButton(priceParamButton, off);
    unselectAllButtons(priceButtons, "price");
    price = [];
    selectedPrice = [];
}

//Selected price buttons stay selected.
function persistSelectedPrices() {
    priceButtons.forEach((btn) => {
        if (price.includes(parseInt(btn.value))) {
            btn.className = "btn btn-dark col price-btn"
        }
    });
}

document.getElementById('price-param-reset').addEventListener('click', () => {
    resetPrice();
    onParamsChanged();
});

document.getElementById('price-param-apply').addEventListener('click', () => {
    toggleparamButton(priceParamButton, on);
    price = selectedPrice;
    onParamsChanged();
});

document.getElementById('price-param-close').addEventListener('click', () => {
    selectedPrice = [];
    unselectAllButtons(priceButtons, "price");
    if (price.length != 0) {
        persistSelectedPrices();
    }
});

//-------------------------- Functions related to rating param button --------------------------

let ratingParamButton = document.getElementById('spot-params-rating');
let ratingRange = document.getElementById('rating-param-range');

ratingParamButton.addEventListener('click', () => {
    toggleParamModal('rating');
});

//Sets the rating range input slider to be labelled appropriately.
function setRatingRangeDesc() {
    let ratingRangeDesc = document.getElementById('rating-range-desc');
    let ratingInDesc = (rating != null) ? rating : 0;
    ratingRangeDesc.innerHTML = `${ratingInDesc} and above`;
}

//Resets the rating parameter.
function resetRating() {
    toggleparamButton(ratingParamButton, off);
    rating = null;
    setRange(ratingRange, 0);
    setRatingRangeDesc();
}

document.getElementById('rating-param-reset').addEventListener('click', () => {
    resetRating();
    onParamsChanged();
});

document.getElementById('rating-param-apply').addEventListener('click', () => {
    toggleparamButton(ratingParamButton, on);
    rating = parseInt(ratingRange.value);
    onParamsChanged();
});

document.getElementById('rating-param-close').addEventListener('click', () => {
    if (rating == null) {
        setRange(ratingRange, 0);
        setRatingRangeDesc();
    } else {
        setRange(ratingRange, rating)
        setRatingRangeDesc();
    }
});

//-------------------------- Functions related to sort param button --------------------------

let sortParamButton = document.getElementById('spot-params-sort');
let sortButtons = document.querySelectorAll('.sort-btn');
let sortOrderButtons = document.querySelectorAll('.sort-order-btn');

sortParamButton.addEventListener('click', () => {
    toggleParamModal('sort');
});

//Selects (change appearance to dark) a sort button.
function selectSortButton(e) {
    let darkBtn = "btn btn-dark col sort-btn";
    e.target.className = darkBtn;
}

//Selects (change appearance to dark) an order button.
function selectSortOrderButton(e) {
    let darkBtn = "btn btn-dark col sort-order-btn";
    e.target.className = darkBtn;
}

sortButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        selectedSort = e.target.value;
        unselectAllButtons(sortButtons, "sort");
        selectSortButton(e);
    });
});

sortOrderButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        selectedSortOrder = e.target.value;
        unselectAllButtons(sortOrderButtons, "sort-order");
        selectSortOrderButton(e);
    });
});

//Resets the sort parameter.
function resetSort() {
    toggleparamButton(sortParamButton, off);
    unselectAllButtons(sortButtons, "sort");
    unselectAllButtons(sortOrderButtons, "sort-order");
    document.getElementById("sort-order-desc").className = "btn btn-dark col sort-order-btn";
    sort = null;
    selectedSort = null;
    sortOrder = "desc";
    selectedSortOrder = null;
}

document.getElementById('sort-param-reset').addEventListener('click', () => {
    resetSort();
    onParamsChanged();
});

document.getElementById('sort-param-apply').addEventListener('click', () => {
    toggleparamButton(sortParamButton, on);
    sort = selectedSort;
    sortOrder = selectedSortOrder;
    onParamsChanged();
});

document.getElementById('sort-param-close').addEventListener('click', () => {
    unselectAllButtons(sortButtons, "sort");
    if (sort != null) {
        persistSelectedButton(sortButtons, "sort");
    }
});