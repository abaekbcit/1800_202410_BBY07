let spotSearch = document.getElementById('spot-search-form');
let manualEntry = document.getElementById('manual-entry-form');
let autocompletePlace;
let autocompleteAddr;

let spotID;

function initAutocompletes() {
    //Constraints to search range for better search results
    const sw = { lat: 48.978508, lng: -123.397751};
    const ne = { lat: 49.423439, lng: -122.653118};
    const cornerBounds = new google.maps.LatLngBounds(sw, ne);
    autocompletePlace = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete-place'),
        {
            types: ['establishment'],
            componentRestrictions: { 'country': ['CA'] },
            fields: ['geometry.location', 'name', 'formatted_address', 'type', 'icon', 'price_level', 'photos'],
        }
    );
    autocompletePlace.setBounds(cornerBounds);
    autocompletePlace.setOptions({ strictBounds: true });
    autocompletePlace.addListener('place_changed', onPlaceChanged);

    autocompleteAddr = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete-addr'),
        {
            types: ['address'],
            componentRestrictions: { 'country': ['CA'] },
            fields: ['geometry.location', 'formatted_address'],
        }
    );
    autocompleteAddr.setBounds(cornerBounds);
    autocompleteAddr.setOptions({ strictBounds: true });
    autocompleteAddr.addListener('place_changed', onAddrChanged);
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
    const place = autocompletePlace.getPlace();
    let location = place.geometry.location;
    if (location) {
        document.getElementById('autocomplete-place').value = place.name;
        document.getElementById('spot-auto-addr').value = place.formatted_address;
        let type = place.types[0];
        document.getElementById('spot-auto-category').value = type.charAt(0).toUpperCase() + type.substring(1);
        document.getElementById('spot-icon').src = place.icon;
        loadCarousel(place.photos);
        initMap(location.lat(), location.lng(), place.name);

        if (!place.price_level) {
            document.getElementById('spot-auto-price').innerHTML = "";
        } else {
            document.getElementById('spot-auto-price').innerHTML = "$".repeat(place.price_level);
        }
    }
}

function onAddrChanged() {
    const place = autocompleteAddr.getPlace();
    let addr = place.formatted_address;
    if (addr) {
        let addrComponents = addr.split(', ');
        document.getElementById('autocomplete-addr').value = addrComponents[0];
        document.getElementById('spot-man-city').value = addrComponents[1];
        document.getElementById('spot-man-zip').value = addrComponents[2].substring(3);
    }
}

function loadCarousel(photos) {
    document.getElementById('carousel-slide-entrance').innerHTML = "";
    if (photos) {
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
}

function tabSelection(event, tab) {
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

function invalidAlert(source) {
    let title;
    let text;
    if (source === "place") {
        title = "Spot not found"
        text = "The spot couldn't be found on Google Maps. Please enter the details in the Manual Entry tab.";
    } else {
        title = "Invalid address"
        text = "Adress is invalid, please try entering again."
    }
    document.getElementById('invalid-modal-title').innerHTML = title;
    document.getElementById('invalid-modal-text').innerHTML = text;
    var modal = new bootstrap.Modal(document.getElementById('invalid-modal')); 
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
    let place = autocompletePlace.getPlace();
    if (place) {
        let name = place.name;
        if (name === document.getElementById('autocomplete-place').value) {
        let category = place.types[0];
        let price = (place.price_level)? place.price_level : 0;
        let addrParts = place.formatted_address.split(', ');
        let addr = addrParts[0];
        let city = addrParts[1];
        let zip = addrParts[2].substring(3);
        let lat = place.geometry.location.lat();
        let lng = place.geometry.location.lng();
        let imgs = [];
        place.photos.forEach((photo) => {
            imgs.push(photo.getUrl());
        });
        let verified = true;
        submitSpot(name, category, price, addr, city, zip, lat, lng, imgs, verified, e);
        } else {
            invalidAlert("place");
        }
    } else {
        invalidAlert("place");
    }
});

manualEntry.addEventListener('submit', function(e) {
    e.preventDefault();
    let autoAddr = autocompleteAddr.getPlace();
    if (autoAddr) {
        let addr = autoAddr.formatted_address.split(', ')[0];
        if (addr === document.getElementById('autocomplete-addr').value) {
            let name = document.getElementById('spot-man-name').value;
            let category = document.getElementById('spot-man-category').value;
            let price = document.getElementById('spot-man-price').value;
            let city = document.getElementById('spot-man-city').value;
            let zip = document.getElementById('spot-man-zip').value;
            let lat = autoAddr.geometry.location.lat();
            let lng = autoAddr.geometry.location.lng();
            let imgs = "";
            let verified = false;
            submitSpot(name, category, parseInt(price), addr, city, zip, lat, lng, imgs, verified, e);
        } else {
            invalidAlert("addr");
        }
    } else {
        invalidAlert("addr");
    }
});

function submitSpot(name, category, price, addr, city, zip, lat, lng, imgs, verified, e) {
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
                lat: lat,
                lng: lng,
                imgs: imgs,
                verified: verified
                
            }).then(function(res) {
                spotID = res.id;
                e.target.reset();
                if (e.target.id === 'spot-search-form') {
                    resetSpotSearch();
                } else {
                    if (document.getElementById("spot-man-img-goes-here").src != "") {
                        uploadPic(spotID); //use the document id to call uploadPic function
                    }
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

let viewSpot = document.getElementById('spot-submitted-view-spot');
viewSpot.addEventListener('click', function(e) {
    window.location.assign("spot.html?docID=" + spotID);
});


var ImageFile;
function listenFileSelect() {
    // listen for file selection
    var fileInput = document.getElementById("spot-man-img"); // pointer #1
    const image = document.getElementById("spot-man-img-goes-here"); // pointer #2

    // When a change happens to the File Chooser Input
    fileInput.addEventListener('change', function (e) {
        ImageFile = e.target.files[0];   //Global variable
        var blob = URL.createObjectURL(ImageFile);
        image.src = blob; // Display this image
    });
}
listenFileSelect();

function uploadPic(postDocID) {
    console.log("inside uploadPic " + postDocID);
    var storageRef = storage.ref("images/" + postDocID + ".jpg");

    storageRef.put(ImageFile)   //global variable ImageFile
       
                   // AFTER .put() is done
        .then(function () {
            console.log('2. Uploaded to Cloud Storage.');
            storageRef.getDownloadURL()

                 // AFTER .getDownloadURL is done
                .then(function (url) { // Get URL of the uploaded file
                    console.log("3. Got the download URL.");

                    // Now that the image is on Storage, we can go back to the
                    // post document, and update it with an "image" field
                    // that contains the url of where the picture is stored.
                    db.collection("spots").doc(postDocID).update({
                            "image": url // Save the URL into users collection
                        })
                         // AFTER .update is done
                        .then(function () {
                            console.log('4. Added pic URL to Firestore.');
                            // One last thing to do:
                            // save this postID into an array for the OWNER
                            // so we can show "my posts" in the future
                            // savePostIDforUser(postDocID);
                        });
                });
        })
        .catch((error) => {
             console.log("error uploading to cloud storage");
        });
}