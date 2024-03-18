function displayCardsDynamically() {
    let cardTemplate = document.getElementById("reviewCardTemplate"); // Retrieve the HTML element with the ID "hikeCardTemplate" and store it in the cardTemplate variable. 
    db.collection("reviews").get()
        .then(allReviews=> {
            allReviews.forEach(doc => {
                var title = doc.data().title;
                var img = doc.data().img;
                var spot = doc.data().spot;
                var text = doc.data().text;
                var city = doc.data().city;
                let newcard = cardTemplate.content.cloneNode(true);

                newcard.querySelector('.card-title').innerHTML = title;
                //TODO: Probably have to change to make image work
                newcard.querySelector('.card-image').innerHTML = img;
                newcard.querySelector('.card-spot').innerHTML = spot;
                newcard.querySelector('.card-city').innerHTML = city;
            
                if (text.length > 20) {
                    text = text.substring(0, 50) + "...";
                }
                newcard.querySelector('.card-text').innerHTML = text;

                document.getElementById('reviews-holder').appendChild(newcard);
            })
        })
}

displayCardsDynamically();