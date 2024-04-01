async function getSpotsByParams(distance, verified, price, rating, sortBy) {
    var spots = db.collection("spots");

    let allSpots = await spots.get();
    let queriedIDSet = getIDSet(allSpots);

    //TODO Need to add distance (requires calculations and probably a separate function)

    if(verified != null) {
        let q2 = await spots.where("verified", "==", verified).get();
        let q2Set = getIDSet(q2);
        queriedIDSet = intersection(queriedIDSet, q2Set);
    }

    if (price) {
        let q3 = await spots.where("price", "<=", price).get();
        let q3Set = getIDSet(q3);
        queriedIDSet = intersection(queriedIDSet, q3Set);
    }

    if (rating != null) {
        let q4 = await spots.where("rating", ">=", rating).get();
        let q4Set = getIDSet(q4);
        //queriedIDSet = intersection(queriedIDSet, q4Set);
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
    let smallerSet = set1;
    let largerSet = set2;
    if (set1.size > set2.size) {
        smallerSet = set2;
        largerSet = set1;
    }
    smallerSet.forEach(id => {
        if (largerSet.has(id)) {
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
                newcard.querySelector('a').href = "spot.html?docID="+docID;
                document.getElementById('reviews-holder').appendChild(newcard);
}

function resetTemplates() {
    document.getElementById('reviews-holder').innerHTML = "";
}