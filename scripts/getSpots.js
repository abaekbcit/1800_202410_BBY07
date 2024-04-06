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

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function getDistances(lat, lng) {
    return 0;
}

function sortByDistance(sortOrder) {
    db.collection("spots").get()
        .then(allSpots => {
            allSpots.forEach(doc => {
                getDistanceFromLatLonInKm(lat, lng, doc.data().lat, doc.data().lng);
            });
            queriedIDSet = intersection(queriedIDSet, q1Set);
        });
}

async function getSpotsByParams(lat, lng, distance, verified, price, rating, sort, sortOrder) {
    var spots = db.collection("spots");

    let allSpots;
    if (sort != null) {
        if (sort === "distance") {
            allSpots = null;
        } else {
            allSpots = await spots.orderBy(sort, sortOrder).get();
        }
    } else {
        allSpots = await spots.get();
    }

    let queriedIDSet = getIDSet(allSpots);

    if (distance != null && (lat != null && lng != null)) {
        let q1Set = new Set();
        await spots.get()
            .then(allSpots => {
                allSpots.forEach(doc => {
                    if (getDistanceFromLatLonInKm(lat, lng, doc.data().lat, doc.data().lng) <= distance) {
                        q1Set.add(doc.id);
                    }
                });
                queriedIDSet = intersection(queriedIDSet, q1Set);
            });
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
    queriedIDSet.forEach(spotID => {
        spots.doc(spotID).get().then(doc => {
            fillTemplates(doc);
        });
    });
}

function getIDSet(docs) {
    let idSet = new Set();
    docs.forEach(doc => {
        idSet.add(doc.id);
    });
    return idSet;
}

function intersection(set1, set2) {
    let res = new Set();
    set1.forEach(id => {
        if (set2.has(id)) {
            res.add(id);
        }
    });
    return res;
}

function displayAllSpots() {
    db.collection("spots").get()
        .then(allReviews=> {
            allReviews.forEach(doc => {
                fillTemplates(doc);
            });
        });
}

function fillTemplates(doc) {
    let cardTemplate = document.getElementById("reviewCardTemplate");
    var name = doc.data().name;
                var img = doc.data().imgs[0];
                var category = doc.data().category;
                var city = doc.data().city;
                var priceRange = doc.data().price;
                var verified = doc.data().verified;
                var ratingsAvg = doc.data().ratingsAvg;
                var docID = doc.id;
                let newcard = cardTemplate.content.cloneNode(true);
                newcard.querySelector('.card-title').innerHTML = name;
                //TODO: Probably have to change to make image work
                if (img) {
                    newcard.querySelector('.card-image').src = img;
                }
                if (priceRange > 0) {
                    var price = "  ·  " + "$".repeat(doc.data().price);
                } else {
                    var price = "";
                }
                newcard.querySelector('.card-cat-price').innerHTML = category + price;
                newcard.querySelector('.card-city').innerHTML = city;
                if (verified) {
                    newcard.querySelector('.verified-entrance')
                        .insertAdjacentHTML("beforeend", '<img src="images/google-maps.png" class="card-verified" data-toggle="tooltip" data-placement="right" title="Spot verified on Google Maps"/>');
                }
                if (ratingsAvg) {
                    var avgRating = (ratingsAvg).toFixed(1);
                } else {
                    var avgRating = "Unrated";
                }
                newcard.querySelector('.card-rating').innerHTML = avgRating;
                newcard.querySelector('a').href = "spot.html?docID="+docID;
                document.getElementById('reviews-holder').appendChild(newcard);
}

function resetTemplates() {
    document.getElementById('reviews-holder').innerHTML = "";
}