//--------------------------------------------------------
// Function taken from 1800 Tech Tips (202410)
// Function takes 2 points (long and lat)
// converts it to distance, and calculates the distance
// (absolute value between the two points)
//--------------------------------------------------------
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

//Converts degrees to radian.
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

//Set a date spot's card with its calculted distance. Decimal truncated to 1 place.
function setCardDistance(docWithDistance) {
    document.getElementById(docWithDistance.id).innerHTML = docWithDistance.distance.toFixed(1) + "km away";
}

//Returns an array of objects that each contain a spot's document id along with its calculated distance.
async function getDistances(lat, lng) {
    let docsWithDistance = [];
    await db.collection("spots").get()
        .then(allSpots => {
            allSpots.forEach(doc => {
                let distance = getDistanceFromLatLonInKm(lat, lng, doc.data().lat, doc.data().lng);
                docsWithDistance.push({ id: doc.id, distance: distance });
            });
        });
    return docsWithDistance;
}

//Sorts a given array of objects (toSort) by distance in the given sortOrder.
function sortByDistance(toSort, sortOrder) {
    if (sortOrder === "desc") {
        toSort.sort((a, b) => b.distance - a.distance);
    } else if (sortOrder === "asc") {
        toSort.sort((a, b) => a.distance - b.distance);
    }
}

//Returns a docsWithDistance, a set of spot document IDs along with calculated distances. 
//lat and lng are used to find the calculated distance from spots. While iterating through 
//docsWithDistance we filter for spots with distance <= to the argument distance. 
//We return the qualifying spot documents as an set of document IDs, queriedIDSet.
async function distanceQuery(lat, lng, distance, sortOrder) {
    let docsWithDistance;
    let queriedIDSet = new Set();
    docsWithDistance = await getDistances(lat, lng);
    if (sort === "distance") {
        sortByDistance(docsWithDistance, sortOrder);
    }
    docsWithDistance.forEach((doc) => {
        if (doc.distance <= distance) {
            queriedIDSet.add(doc.id);
        }
    });
    return {queriedIDSet: queriedIDSet, docsWithDistance: docsWithDistance};
}

//Queries DB for spots based on active parameters. If parameters are active, sets of qualifying 
//spot IDs all from their respective queries will be intersected together to find spots that meet
//all the requirements.
//
//Learned from Carly during demo that multiple wheres can be chained. However not enough time to figure
//out how to chain them programatically based on user input. Current solution isn't very effecient.
async function getSpotsByParams(lat, lng, distance, verified, price, rating, sort, sortOrder) {
    var spots = db.collection("spots");
    let allSpots;
    if (sort != null) {
        allSpots = (sort != "distance") ? await spots.orderBy(sort, sortOrder).get() : [];
    } else {
        allSpots = await spots.get();
    }
    let queriedIDSet = getIDSet(allSpots);
    let docsWithDistance;

    if (distance != null && (lat != null && lng != null)) {
        let queryRes = await distanceQuery(lat, lng, distance, sortOrder);
        queriedIDSet = queryRes.queriedIDSet;
        docsWithDistance = queryRes.docsWithDistance;
    }
    if (verified != null) {
        let q2 = await spots.where("verified", "==", verified).get();
        let q2Set = getIDSet(q2);
        queriedIDSet = intersection(queriedIDSet, q2Set);
    }
    if (price != null && price.length != 0) {
        let q3 = await spots.where("price", "in", price).get();
        let q3Set = getIDSet(q3);
        queriedIDSet = intersection(queriedIDSet, q3Set);
    }
    if (rating != null) {
        let q4 = await spots.where("ratingsAvg", ">=", rating).get();
        let q4Set = getIDSet(q4);
        queriedIDSet = intersection(queriedIDSet, q4Set);
    }

    resetTemplates();
    displayQueriedSpots(queriedIDSet, docsWithDistance);
}

//Uses queriedIDSet to display all of the spot documents that fit the parameters selected.
//If distance parameters are active, the spot cards will also display their distance from
//the selected location in the autocomplete address input.
function displayQueriedSpots(queriedIDSet, docsWithDistance) {
    queriedIDSet.forEach(spotID => {
        db.collection("spots").doc(spotID).get().then(doc => {
            displaySpots(doc);
            if (distance != null && (lat != null && lng != null)) {
                let docWithDistance = docsWithDistance.find((elem) => elem.id === doc.id);
                setCardDistance(docWithDistance);
            }
        });
    });
}

//Returns a set of IDs from a given array of documents.
function getIDSet(docs) {
    let idSet = new Set();
    docs.forEach(doc => {
        idSet.add(doc.id);
    });
    return idSet;
}

//Returns the intersection of 2 sets.
function intersection(set1, set2) {
    let res = new Set();
    set1.forEach(id => {
        if (set2.has(id)) {
            res.add(id);
        }
    });
    return res;
}

//Displays all the date spots in the DB.
function displayAllSpots() {
    db.collection("spots").get()
        .then(allReviews => {
            allReviews.forEach(doc => {
                displaySpots(doc);
            });
        });
}

//Given info of fields, fills out appropriate parts of the cards with the given parameters.
function fillSpotsCards(name, img, category, city, priceRange, verified, ratingsAvg, docID) {
    let cardTemplate = document.getElementById("reviewCardTemplate");
    let newcard = cardTemplate.content.cloneNode(true);
    newcard.querySelector('.card-title').innerHTML = name;
    if (img) {
        newcard.querySelector('.card-image').src = img;
    }
    if (priceRange > 0) {
        var price = "  ·  " + "$".repeat(priceRange);
    } else {
        var price = "";
    }
    newcard.querySelector('.card-cat-price').innerHTML = category + price;
    newcard.querySelector('.card-city').innerHTML = city;
    if (verified) {
        newcard.querySelector('.verified-entrance')
            .insertAdjacentHTML("beforeend", '<img src="/images/google-maps.png" class="card-verified" data-toggle="tooltip" data-placement="right" title="Spot verified on Google Maps"/>');
    }
    if (ratingsAvg) {
        var avgRating = (ratingsAvg).toFixed(1);
    } else {
        var avgRating = "Unrated";
    }
    newcard.querySelector('.card-rating').innerHTML = "Rating: " + avgRating;
    newcard.querySelector('.card-distance').id = docID;
    newcard.querySelector('a').href = "/pages/spot_pages/spot.html?docID=" + docID;
    document.getElementById('reviews-holder').appendChild(newcard);
}

//Reads fields of spot from spots collection in the DB then calls fillSpotsCards() on the read fields.
function displaySpots(doc) {
    var name = doc.data().name;
    var img = doc.data().imgs[0];
    var category = doc.data().category;
    var city = doc.data().city;
    var priceRange = doc.data().price;
    var verified = doc.data().verified;
    var ratingsAvg = doc.data().ratingsAvg;
    var docID = doc.id;
    fillSpotsCards(name, img, category, city, priceRange, verified, ratingsAvg, docID)
}

//Clears the template cards holder (reviews-holder).
function resetTemplates() {
    document.getElementById('reviews-holder').innerHTML = "";
}