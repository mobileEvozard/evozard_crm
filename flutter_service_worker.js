'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "3848b8b45f0e97e335a11d7736a02655",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"index.html": "0305545383d01af4a0d35f0cd36a59ea",
"/": "0305545383d01af4a0d35f0cd36a59ea",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"main.dart.js": "b14a899808b5515922a6eba5d69372c4",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/fonts/Raleway-Medium.ttf": "430a0518f5ff3b6c8968b759a29b36e2",
"assets/images/ic_sort.png": "0d0b92567a784c76471324f516d3e146",
"assets/images/ic_edit.png": "017110b76d839bd228b9355bed578acb",
"assets/images/ic_customer.png": "4d64dc5357c7e0b3f48a2adb1ca3ee4e",
"assets/images/ic_url.png": "d0727a4773e0ecae3f6b4ff1b511f097",
"assets/images/ic_email.png": "61b1c7505fa350c8e2fdb99b13af0451",
"assets/images/ic_activity.png": "cf40feb68955f713c5fd25ed7fd514f7",
"assets/images/ic_banner_login.jpg": "87d806fa1e2a35ee31f50c1b95443480",
"assets/images/ic_filter.png": "191e3d3e818d4248c85b757d67e815ee",
"assets/images/ic_port.jpeg": "2d8dee0998fb8bae8c21e0b12cfb9f90",
"assets/images/ic_database.png": "1f6b085339bb7307c049bd9301b194cc",
"assets/images/ic_done.png": "224e312bca85904edf1b2f61d163a826",
"assets/images/ic_lead.png": "9b050b091af16970550aa5dd74d791bf",
"assets/images/ic_telephone.png": "d2d599b47f528204409aaa3a06bc88c7",
"assets/images/ic_dashboard.png": "9b9655093b017cf36ddd08333447940b",
"assets/images/ic_message.png": "df8fc3cc577c5388747e6eae87d2233d",
"assets/images/ic_mobile.png": "895e81b6edee94e8150871c8e28539bf",
"assets/images/ic_warning.png": "639f5cc2716244cd964bddf96436b7a9",
"assets/images/ic_report.png": "fcc44fdb522933fca15e501cdd6063c0",
"assets/images/ic_password.png": "1f64d052f5c6ea50329d45e5077e4218",
"assets/images/ic_contact_us.png": "a4af53b9615de92abd609e9f5a211e9e",
"assets/images/ic_invoice.png": "522d68796b36804abe451ceb279d5622",
"assets/images/ic_logo.png": "129b95cc77f0554d39964d7ea4046380",
"assets/images/ic_opportunity.png": "9d1a18fde029bbad5f08affaafa4ef98",
"assets/images/ic_user.png": "96f70dbdb69e8fd34ee9d9280788d6c0",
"assets/images/ic_home_logout.png": "7ae8513081b9d0491f79fb57c1b4e88a",
"assets/images/ic_contact.png": "2c4ceed857e1beb20c3d792650063648",
"assets/images/ic_orders.png": "abc870346fb3c4085455cabafdff1cfd",
"assets/FontManifest.json": "9ede6e3d4cd1e29cfc145d72e7c32c3c",
"assets/NOTICES": "40f5632e87db420a44b2b2200578c211",
"assets/AssetManifest.json": "a267a59043b8ac9f04ea1cf48b08d0d2",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"manifest.json": "b430a21c3814ffeb191210a94df5c3fa"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
