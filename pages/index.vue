<template>
  <div>
    <v-btn @click="get" color="primary">get</v-btn>
    {{hoge}}
    <v-btn @click="getLocation" color="info" fab icon>
      <v-icon>
        mdi-crosshairs-gps
      </v-icon>
    </v-btn>
    lat:{{location.lat}}
    lng:{{location.lng}}
    <v-btn fab color="accondary" @click="searchTaxi(20)">
      <v-icon>mdi-taxi</v-icon>
    </v-btn>
    <v-btn fab color="accondary" @click="createTaxi">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <GmapMap
      :center="{lat:location.lat, lng:location.lng}"
      :zoom="18"
      style="width:98vw; height:98vh"
    >

      <GmapMarker
        :key="index"
        v-for="(m, index) in markers"
        :position="m.position"
        :clickable="true"
        :draggable="false"
        :icon="icon"
        @click="toggleInfo(m,index)"
      />
    </GmapMap>
    <v-dialog v-model="infoOpened">
      <v-card light >
          <v-container>
            <v-layout column wrap justify-center align-center>
              <h2 class="pa-3">Hey, TAXI</h2>
              <v-icon size="56">mdi-taxi</v-icon>
              <v-btn color="primary" rounded ><v-icon left>mdi-human-handsup</v-icon>Request</v-btn>
              <v-btn class="mt-4" color="success" text><v-icon left>mdi-phone</v-icon>Call</v-btn>
            </v-layout>
          </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDpe7EEYDCVnfH9IXJJmA2x_zjJryJF11s',
//    libraries: 'places', // This is required if you use the Autocomplete plugin
    // OR: libraries: 'places,drawing'
    // OR: libraries: 'places,drawing,visualization'
    // (as you require)

    //// If you want to set the version, you can do so:
    // v: '3.26',
  },

  //// If you intend to programmatically custom event listener code
  //// (e.g. `this.$refs.gmap.$on('zoom_changed', someFunc)`)
  //// instead of going through Vue templates (e.g. `<GmapMap @zoom_changed="someFunc">`)
  //// you might need to turn this on.
  // autobindAllEvents: false,

  //// If you want to manually install components, e.g.
  //// import {GmapMarker} from 'vue2-google-maps/src/components/marker'
  //// Vue.component('GmapMarker', GmapMarker)
  //// then set installComponents to 'false'.
  //// If you want to automatically install all the components this property must be set to 'true':
  installComponents: true
})


import geohash from "ngeohash"

export default {
  data(){
    return {
      hoge:null,
      location:{},
      loading:false,
      mapWidth:window.innerWidth*0.8,
      mapHeight:window.innerHeight*0.7,
      infoOpened:false,
      additionalMarkers:[],
      icon:{
        url: require("@/static/taxi.png"),
        size:{width: 30,height: 30, f:"px",b:"px"},
        scaledSize:{width: 30,height: 30, f:"px",b:"px"}
      },
      taxis:[],
    }
  },
  computed:{
    markers(){
    console.log(this)
      return [
      {
        position:{
          lat:this.location.lat,
          lng:this.location.lng
        },
        title:"you are here"
      },

      //...this.additionalMarkers,
      ...this.taxis.map(taxi=>({
        position:{
          lat:taxi.location.lat,
          lng:taxi.location.lng
        },
        }))
      ]
    }
  },
  methods:{
    uid(){
      return this.$auth.currentUser.uid
    },
    get(){
      const uid = this.uid()
      this.hoge = null;
      this.$firestore.doc(`users/${uid}`)
        .get()
        .then(doc=>{
          this.hoge = doc.data()
        })
    },
    getLocation(){
      this.loading = true
      navigator.geolocation.getCurrentPosition(location=>{
        console.log({location})
        this.location ={
          lat:location.coords.latitude,
          lng:location.coords.longitude,
          timestamp:location.timestamp
        }
        this.loading=false

      },err=>{
        console.log(err)
      })
    },
    toggleInfo(m,index){
      this.infoOpened=!this.infoOpened
    },
    createTaxi(){
      const lat = this.location.lat + (Math.random()-Math.random())/5;
      const lng = this.location.lng + (Math.random()-Math.random())/5;


      this.$firestore.collection('taxis').add({
        d:{
          carPhotoUrl:"",
          carType:"",
          driver:{
            name:"吉岡里帆",
            faceUrl:"",
            phone:"",
            rate:4.8,
            description:"" + Math.random
          },
          number:"AAA",
          location:{lat:lat,lng:lng}
        },
        g:geohash.encode(lat,lng,8),
        l:new this.$GeoPoint(lat,lng)
      })
    },

    searchTaxi(distance){
      const {GeoFirestore} = require('geofirestore')
      const geofirestore = new GeoFirestore(this.$firestore)

      console.log({distance})
      geofirestore
        .collection('taxis')
        .near({
          center: new this.$GeoPoint(this.location.lat, this.location.lng),
          radius: distance })
        .get()
        .then(query=>{　// [<firestore query>,<firebase query>]
          console.log({query})
          this.taxis = query.docs.map(doc=>doc.data()) // {name:"...",...}
          console.table(this.taxis)
        })
    }
  },

    watch:{
      location(location){
        const geoPoint = new this.$GeoPoint(location.lat,location.lng)
        console.log({geoPoint})
        this.$firestore.doc(`users/${this.uid()}`)
          .update({geoPoint})
          .then(res=>{
            console.info("updated",geoPoint)
          })
      }
    }
}
</script>
