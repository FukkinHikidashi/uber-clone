import * as firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

const config = {
  apiKey: "AIzaSyADzY6gU8vHXVVyFTtgdUYDnjAgURy1-lE",
  authDomain: "uber-clone-fukking.firebaseapp.com",
  databaseURL: "https://uber-clone-fukking.firebaseio.com",
  projectId: "uber-clone-fukking",
  storageBucket: "",
  messagingSenderId: "541404637499",
  appId: "1:541404637499:web:bd884f9eae6a2314"
}

firebase.initializeApp(config)

const firestore = firebase.firestore()
const GeoPoint = firebase.firestore.GeoPoint;
const auth = firebase.auth()

export default function(app,inject){
  inject("firestore",firestore)  //this.$firestore
  inject("auth",auth) //this.$auth
  inject("GeoPoint", GeoPoint)

  const {redirect} = app;

  auth.onAuthStateChanged(user=>{
    if(!user){
      console.warn("not logined")
      redirect("/login")
    }
    console.log({user})

  })

}
