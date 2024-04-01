// Temoprary file, most likely will change behaviour

const successCallback = (position) => {
    updateUserLocation(position.coords);
  };
  
  const errorCallback = (error) => {
    console.log(error);
  };
  
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

function updateUserLocation(coords) {
    let lat = coords.latitude;
    let lng = coords.longitude;
    let position = { lat: lat, lng: lng};

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection("users").doc(user.uid).update({
                "position": position
            });
        }
    });
}
  