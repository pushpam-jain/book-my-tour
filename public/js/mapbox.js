// // console.log('Hello from the client side')

// const locations = JSON.parse(document.getElementById('map').dataset.locations);

// // console.log(locations)

// mapboxgl.accessToken = 'pk.eyJ1IjoicHVzaHBhbXRwMTIzNCIsImEiOiJjbGplbzlqeXcwNnczM2tteWhtcDV5eDVyIn0.Pmr8aRTJfOdhf8XL4HsO-A';

// // mapboxgl.accessToken = 'pk.eyJ1IjoicHVzaHBhbXRwMTIzNCIsImEiOiJjbGphYzRhdDExbXh1M2RxeXQ1bWM0MG5iIn0.gaueG4x9uwEbogA2a-J_7w';

// var map = new mapboxgl.Map({
//   container: 'map',
//   style: 'mapbox://styles/mapbox/light-v11', // 'mapbox://styles/pushpamtp1234/cljepg7rp005t01qu535g1kgj',
// //   center: [-118.113491,34.111745],
// //   zoom:2,
// //   interactive: false
// scrollZoom: false
// });

// // const marker1 = new mapboxgl.Marker()
// // .setLngLat([12.554729, 55.70651])
// // .addTo(map);
 
// // const marker2 = new mapboxgl.Marker({ color: 'black'})
// // .setLngLat([12.65147, 55.608166])
// // .addTo(map);

// // new mapboxgl.Popup().setLngLat([12.554729, 55.70651]).setText('<h1>Hello World!</h1>')

// const Bounds = new mapboxgl.LngLatBounds();



// const addMarker = (val)=>{

// const el = document.createElement('div');
// el.className = 'marker';

// const marker = new mapboxgl.Marker({ anchor: 'bottom', element : el})
// .setLngLat(val.coordinates)
// .addTo(map)

// new mapboxgl.Popup({offset: 30})
// .setLngLat(val.coordinates)
// .setHTML(`<p>Day ${val.day}: ${val.description}<p>`)
// .addTo(map)

// Bounds.extend(val.coordinates);

// // marker.togglePopup(); // toggle popup open or closed

// }

// // - console.log(locations[0].coordinates)
// locations.forEach(val=>addMarker(val));
// console.log(Bounds)
// map.fitBounds(Bounds,{
//   padding:{
//     top: 200,
//     bottom: 150,
//     left: 100,
//     right: 100
//   }
// });


// // export const displayMap = (locations) => {
// //     mapboxgl.accessToken = `pk.eyJ1IjoicGVzaHdhcmluYWFuIiwiYSI6ImNsZHltc3hzMTBlbWczdW53d2MydXN0a2cifQ.fi--XA37Ab73fzBEZb7g8Q`;
// //     const map = new mapboxgl.Map({
// //       container: 'map',
// //       style: 'mapbox://styles/peshwarinaan/cldyq4yrh007r01plcrldnsq6',
// //       scrollZoom: false,
// //       //   center: [-118.184759, 33.782588],
// //       //   zoom: 7,
// //       //interactive: false,
// //     });




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/* eslint-disable */
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
