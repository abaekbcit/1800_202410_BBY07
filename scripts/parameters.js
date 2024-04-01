var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if user is signed in:
        if (user) {

            //go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid)
            //get the document for current user.
            currentUser.get()
                .then(userDoc => { 
                    console.log(userDoc);
                    //get the data fields of the user
                    let inputDistance = userDoc.data().distance;
                    let inputPrice = userDoc.data().price;
                    let inputAccuracy = userDoc.data().accuracy;
                    let inputReview = userDoc.data().review;

                    //if the data fields are not empty, then write them in to the form.
                    if (inputDistance != null) {
                        document.getElementById("inputDistance").value = inputDistance;
                    }
                    if (inputPrice != null) {
                        document.getElementById("inputPrice").value = inputPrice;
                    }
                    if (inputAccuracy != null) {
                        document.getElementById("inputAccuracy").value = inputAccuracy;
                    }
                    if (inputReview != null){
                        document.getElementById("inputReview").value = inputReview;
                    }

                })
        } else {
            // No user is signed in.
            console.log("No user is signed in");
        }
    });
}
populateUserInfo();
function saveUserInfo() { 

    userDistance = document.getElementById('inputDistance').value;       
    userPrice = document.getElementById('inputPrice').value; 
    userAccuracy = document.getElementById('inputAccuracy').value;
    userReview = document.getElementById('inputReview').value;    

    currentUser.update({
        distance: userDistance,
        price: userPrice,
        accuracy: userAccuracy,
        review: userReview,
    })
    .then(() => {
        console.log("Parameters successfully saved!");
    })

}

function savedParameters(){
    if (userDistance != null){
        inputDistance = userDistance;
    }
    if (userPrice != null){
        inputPrice = userPrice
    }
    if (userAccuracy != null){
        inputAccuracy = userAccuracy
    }
    if (userReview != null){
        inputReview = userReview
    }
}
savedParameters();

function outputParameters(){
    if (userDistance != null){
        outputDistance = userDistance;
    }
    if (userPrice != null){
        outputPrice = userPrice
    }
    if (userAccuracy != null){
        outputAccuracy = userAccuracy
    }
    if (userReview != null){
        outputReview = userReview
    }
}
outputParameters();

function myFunction() {
    let text = "Confirm changes\nAre you sure these are your preferences?";
    if (confirm(text) == true) {
      saveUserInfo()
    } 
    document.getElementById("demo").innerHTML = text;
  }