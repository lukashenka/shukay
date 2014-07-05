/*!
 *  GMAP3 Plugin for jQuery
 *  Version   : 6.0.0
 *  Date      : 2014-04-25
 *  Author    : DEMONTE Jean-Baptiste
 *  Contact   : jbdemonte@gmail.com
 *  Web site  : http://gmap3.net
 *  Licence   : GPL v3 : http://www.gnu.org/licenses/gpl.html
 *  
 *  Copyright (c) 2010-2014 Jean-Baptiste DEMONTE
 *  All rights reserved.
 */
;(function ($, undef) {

var defaults, gm,
  gId = 0,
  isFunction = $.isFunction,
  isArray = $.isArray;

function isObject(m) {
  return typeof m === "object";
}

function isString(m) {
  return typeof m === "string";
}

function isNumber(m) {
  return typeof m === "number";
}

function isUndefined(m) {
  return m === undef;
}

/**
 * Initialize default values
 * defaults are defined at first gmap3 call to pass the rails asset pipeline and jasmine while google library is not yet loaded
 */
function initDefaults() {
  gm = google.maps;
  if (!defaults) {
    defaults = {
      verbose: false,
      queryLimit: {
        attempt: 5,
        delay: 250, // setTimeout(..., delay + random);
        random: 250
      },
      classes: (function () {
        var r = {};
        $.each("Map Marker InfoWindow Circle Rectangle OverlayView StreetViewPanorama KmlLayer TrafficLayer BicyclingLayer GroundOverlay StyledMapType ImageMapType".split(" "), function (_, k) {
          r[k] = gm[k];
        });
        return r;
      }()),
      map: {
        mapTypeId : gm.MapTypeId.ROADMAP,
        center: [46.578498, 2.457275],
        zoom: 2
      },
      overlay: {
        pane: "floatPane",
        content: "",
        offset: {
          x: 0,
          y: 0
        }
      },
      geoloc: {
        getCurrentPosition: {
          maximumAge: 60000,
          timeout: 5000
        }
      }
    }
  }
}


/**
 * Generate a new ID if not defined
 * @param id {string} (optional)
 * @param simulate {boolean} (optional)
 * @returns {*}
 */
function globalId(id, simulate) {
  return isUndefined(id) ? "gmap3_" + (simulate ? gId + 1 : ++gId) : id;
}


/**
 * Return true if current version of Google Maps is equal or above to these in parameter
 * @param version {string} Minimal version required
 * @return {Boolean}
 */
function googleVersionMin(version) {
  var i,
    gmVersion = gm.version.split(".");
  version = version.split(".");
  for (i = 0; i < gmVersion.length; i++) {
    gmVersion[i] = parseInt(gmVersion[i], 10);
  }
  for (i = 0; i < version.length; i++) {
    version[i] = parseInt(version[i], 10);
    if (gmVersion.hasOwnProperty(i)) {
      if (gmVersion[i] < version[i]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}


/**
 * attach events from a container to a sender
 * td[
 *  events => { eventName => function, }
 *  onces  => { eventName => function, }
 *  data   => mixed data
 * ]
 **/
function attachEvents($container, args, sender, id, senders) {
  var td = args.td || {},
    context = {
      id: id,
      data: td.data,
      tag: td.tag
    };
  function bind(items, handler) {
    if (items) {
      $.each(items, function (name, f) {
        var self = $container, fn = f;
        if (isArray(f)) {
          self = f[0];
          fn = f[1];
        }
        handler(sender, name, function (event) {
          fn.apply(self, [senders || sender, event, context]);
        });
      });
    }
  }
  bind(td.events, gm.event.addListener);
  bind(td.onces, gm.event.addListenerOnce);
}

/**
 * Extract keys from object
 * @param obj {object}
 * @returns {Array}
 */
function getKeys(obj) {
  var k, keys = [];
  for (k in obj) {
    if (obj.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  return keys;
}

/**
 * copy a key content
 **/
function copyKey(target, key) {
  var i,
    args = arguments;
  for (i = 2; i < args.length; i++) {
    if (key in args[i]) {
      if (args[i].hasOwnProperty(key)) {
        target[key] = args[i][key];
        return;
      }
    }
  }
}

/**
 * Build a tuple
 * @param args {object}
 * @param value {object}
 * @returns {object}
 */
function tuple(args, value) {
  var k, i,
    keys = ["data", "tag", "id", "events",  "onces"],
    td = {};

  // "copy" the common data
  if (args.td) {
    for (k in args.td) {
      if (args.td.hasOwnProperty(k)) {
        if ((k !== "options") && (k !== "values")) {
          td[k] = args.td[k];
        }
      }
    }
  }
  // "copy" some specific keys from value first else args.td
  for (i = 0; i < keys.length; i++) {
    copyKey(td, keys[i], value, args.td);
  }

  // create an extended options
  td.options = $.extend({}, args.opts || {}, value.options || {});

  return td;
}

/**
 * Log error
 */
function error() {
  if (defaults.verbose) {
    var i, err = [];
    if (window.console && (isFunction(console.error))) {
      for (i = 0; i < arguments.length; i++) {
        err.push(arguments[i]);
      }
      console.error.apply(console, err);
    } else {
      err = "";
      for (i = 0; i < arguments.length; i++) {
        err += arguments[i].toString() + " ";
      }
      alert(err);
    }
  }
}

/**
 * return true if mixed is usable as number
 **/
function numeric(mixed) {
  return (isNumber(mixed) || isString(mixed)) && mixed !== "" && !isNaN(mixed);
}

/**
 * convert data to array
 **/
function array(mixed) {
  var k, a = [];
  if (!isUndefined(mixed)) {
    if (isObject(mixed)) {
      if (isNumber(mixed.length)) {
        a = mixed;
      } else {
        for (k in mixed) {
          a.push(mixed[k]);
        }
      }
    } else {
      a.push(mixed);
    }
  }
  return a;
}

/**
 * create a function to check a tag
 */
function ftag(tag) {
  if (tag) {
    if (isFunction(tag)) {
      return tag;
    }
    tag = array(tag);
    return function (val) {
      var i;
      if (isUndefined(val)) {
        return false;
      }
      if (isObject(val)) {
        for (i = 0; i < val.length; i++) {
          if ($.inArray(val[i], tag) >= 0) {
            return true;
          }
        }
        return false;
      }
      return $.inArray(val, tag) >= 0;
    };
  }
}


/**
 * convert mixed [ lat, lng ] objet to gm.LatLng
 **/
function toLatLng(mixed, emptyReturnMixed, noFlat) {
  var empty = emptyReturnMixed ? mixed : null;
  if (!mixed || (isString(mixed))) {
    return empty;
  }
  // defined latLng
  if (mixed.latLng) {
    return toLatLng(mixed.latLng);
  }
  // gm.LatLng object
  if (mixed instanceof gm.LatLng) {
    return mixed;
  }
  // {lat:X, lng:Y} object
  if (numeric(mixed.lat)) {
    return new gm.LatLng(mixed.lat, mixed.lng);
  }
  // [X, Y] object
  if (!noFlat && isArray(mixed)) {
    if (!numeric(mixed[0]) || !numeric(mixed[1])) {
      return empty;
    }
    return new gm.LatLng(mixed[0], mixed[1]);
  }
  return empty;
}

/**
 * convert mixed [ sw, ne ] object by gm.LatLngBounds
 **/
function toLatLngBounds(mixed) {
  var ne, sw;
  if (!mixed || mixed instanceof gm.LatLngBounds) {
    return mixed || null;
  }
  if (isArray(mixed)) {
    if (mixed.length === 2) {
      ne = toLatLng(mixed[0]);
      sw = toLatLng(mixed[1]);
    } else if (mixed.length === 4) {
      ne = toLatLng([mixed[0], mixed[1]]);
      sw = toLatLng([mixed[2], mixed[3]]);
    }
  } else {
    if (("ne" in mixed) && ("sw" in mixed)) {
      ne = toLatLng(mixed.ne);
      sw = toLatLng(mixed.sw);
    } else if (("n" in mixed) && ("e" in mixed) && ("s" in mixed) && ("w" in mixed)) {
      ne = toLatLng([mixed.n, mixed.e]);
      sw = toLatLng([mixed.s, mixed.w]);
    }
  }
  if (ne && sw) {
    return new gm.LatLngBounds(sw, ne);
  }
  return null;
}

/**
 * resolveLatLng
 **/
function resolveLatLng(ctx, method, runLatLng, args, attempt) {
  var latLng = runLatLng ? toLatLng(args.td, false, true) : false,
    conf = latLng ?  {latLng: latLng} : (args.td.address ? (isString(args.td.address) ? {address: args.td.address} : args.td.address) : false),
    cache = conf ? geocoderCache.get(conf) : false,
    self = this;
  if (conf) {
    attempt = attempt || 0; // convert undefined to int
    if (cache) {
      args.latLng = cache.results[0].geometry.location;
      args.results = cache.results;
      args.status = cache.status;
      method.apply(ctx, [args]);
    } else {
      if (conf.location) {
        conf.location = toLatLng(conf.location);
      }
      if (conf.bounds) {
        conf.bounds = toLatLngBounds(conf.bounds);
      }
      geocoder().geocode(
        conf,
        function (results, status) {
          if (status === gm.GeocoderStatus.OK) {
            geocoderCache.store(conf, {results: results, status: status});
            args.latLng = results[0].geometry.location;
            args.results = results;
            args.status = status;
            method.apply(ctx, [args]);
          } else if ((status === gm.GeocoderStatus.OVER_QUERY_LIMIT) && (attempt < defaults.queryLimit.attempt)) {
            setTimeout(
              function () {
                resolveLatLng.apply(self, [ctx, method, runLatLng, args, attempt + 1]);
              },
              defaults.queryLimit.delay + Math.floor(Math.random() * defaults.queryLimit.random)
            );
          } else {
            error("geocode failed", status, conf);
            args.latLng = args.results = false;
            args.status = status;
            method.apply(ctx, [args]);
          }
        }
      );
    }
  } else {
    args.latLng = toLatLng(args.td, false, true);
    method.apply(ctx, [args]);
  }
}

function resolveAllLatLng(list, ctx, method, args) {
  var self = this, i = -1;

  function resolve() {
    // look for next address to resolve
    do {
      i++;
    } while ((i < list.length) && !("address" in list[i]));

    // no address found, so run method
    if (i >= list.length) {
      method.apply(ctx, [args]);
      return;
    }

    resolveLatLng(
      self,
      function (args) {
        delete args.td;
        $.extend(list[i], args);
        resolve.apply(self, []); // resolve next (using apply avoid too much recursion)
      },
      true,
      {td: list[i]}
    );
  }
  resolve();
}



/**
 * geolocalise the user and return a LatLng
 **/
function geoloc(ctx, method, args) {
  var is_echo = false; // sometime, a kind of echo appear, this trick will notice once the first call is run to ignore the next one
  if (navigator && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        if (!is_echo) {
          is_echo = true;
          args.latLng = new gm.LatLng(pos.coords.latitude, pos.coords.longitude);
          method.apply(ctx, [args]);
        }
      },
      function () {
        if (!is_echo) {
          is_echo = true;
          args.latLng = false;
          method.apply(ctx, [args]);
        }
      },
      args.opts.getCurrentPosition
    );
  } else {
    args.latLng = false;
    method.apply(ctx, [args]);
  }
}

/**
 * Return true if get is a direct call
 * it means :
 *   - get is the only key
 *   - get has no callback
 * @param obj {Object} The request to check
 * @return {Boolean}
 */
function isDirectGet(obj) {
  var k,
    result = false;
  if (isObject(obj) && obj.hasOwnProperty("get")) {
    for (k in obj) {
      if (k !== "get") {
        return false;
      }
    }
    result = !obj.get.hasOwnProperty("callback");
  }
  return result;
}
var services = {},
  geocoderCache = new GeocoderCache();


function geocoder(){
  if (!services.geocoder) {
    services.geocoder = new gm.Geocoder();
  }
  return services.geocoder;
}
/**
 * Class GeocoderCache
 * @constructor
 */
function GeocoderCache() {
  var cache = [];

  this.get = function (request) {
    if (cache.length) {
      var i, j, k, item, eq,
        keys = getKeys(request);
      for (i = 0; i < cache.length; i++) {
        item = cache[i];
        eq = keys.length === item.keys.length;
        for (j = 0; (j < keys.length) && eq; j++) {
          k = keys[j];
          eq = k in item.request;
          if (eq) {
            if (isObject(request[k]) && ("equals" in request[k]) && isFunction(request[k])) {
              eq = request[k].equals(item.request[k]);
            } else {
              eq = request[k] === item.request[k];
            }
          }
        }
        if (eq) {
          return item.results;
        }
      }
    }
  };

  this.store = function (request, results) {
    cache.push({request: request, keys: getKeys(request), results: results});
  };
}
/**
 * Class Stack
 * @constructor
 */
function Stack() {
  var st = [],
    self = this;

  self.empty = function () {
    return !st.length;
  };

  self.add = function (v) {
    st.push(v);
  };

  self.get = function () {
    return st.length ? st[0] : false;
  };

  self.ack = function () {
    st.shift();
  };
}
/**
 * Class Store
 * @constructor
 */
function Store() {
  var store = {}, // name => [id, ...]
    objects = {}, // id => object
    self = this;

  function normalize(res) {
    return {
      id: res.id,
      name: res.name,
      object: res.obj,
      tag: res.tag,
      data: res.data
    };
  }

  /**
   * add a mixed to the store
   **/
  self.add = function (args, name, obj, sub) {
    var td = args.td || {},
      id = globalId(td.id);
    if (!store[name]) {
      store[name] = [];
    }
    if (id in objects) { // object already exists: remove it
      self.clearById(id);
    }
    objects[id] = {obj: obj, sub: sub, name: name, id: id, tag: td.tag, data: td.data};
    store[name].push(id);
    return id;
  };

  /**
   * return a stored object by its id
   **/
  self.getById = function (id, sub, full) {
    var result = false;
    if (id in objects) {
      if (sub) {
        result = objects[id].sub;
      } else if (full) {
        result = normalize(objects[id]);
      } else {
        result = objects[id].obj;
      }
    }
    return result;
  };

  /**
   * return a stored value
   **/
  self.get = function (name, last, tag, full) {
    var n, id, check = ftag(tag);
    if (!store[name] || !store[name].length) {
      return null;
    }
    n = store[name].length;
    while (n) {
      n--;
      id = store[name][last ? n : store[name].length - n - 1];
      if (id && objects[id]) {
        if (check && !check(objects[id].tag)) {
          continue;
        }
        return full ? normalize(objects[id]) : objects[id].obj;
      }
    }
    return null;
  };

  /**
   * return all stored values
   **/
  self.all = function (name, tag, full) {
    var result = [],
      check = ftag(tag),
      find = function (n) {
        var i, id;
        for (i = 0; i < store[n].length; i++) {
          id = store[n][i];
          if (id && objects[id]) {
            if (check && !check(objects[id].tag)) {
              continue;
            }
            result.push(full ? normalize(objects[id]) : objects[id].obj);
          }
        }
      };
    if (name in store) {
      find(name);
    } else if (isUndefined(name)) { // internal use only
      for (name in store) {
        find(name);
      }
    }
    return result;
  };

  /**
   * hide and remove an object
   **/
  function rm(obj) {
    // Google maps element
    if (isFunction(obj.setMap)) {
      obj.setMap(null);
    }
    // jQuery
    if (isFunction(obj.remove)) {
      obj.remove();
    }
    // internal (cluster)
    if (isFunction(obj.free)) {
      obj.free();
    }
    obj = null;
  }

  /**
   * remove one object from the store
   **/
  self.rm = function (name, check, pop) {
    var idx, id;
    if (!store[name]) {
      return false;
    }
    if (check) {
      if (pop) {
        for (idx = store[name].length - 1; idx >= 0; idx--) {
          id = store[name][idx];
          if (check(objects[id].tag)) {
            break;
          }
        }
      } else {
        for (idx = 0; idx < store[name].length; idx++) {
          id = store[name][idx];
          if (check(objects[id].tag)) {
            break;
          }
        }
      }
    } else {
      idx = pop ? store[name].length - 1 : 0;
    }
    if (!(idx in store[name])) {
      return false;
    }
    return self.clearById(store[name][idx], idx);
  };

  /**
   * remove object from the store by its id
   **/
  self.clearById = function (id, idx) {
    if (id in objects) {
      var i, name = objects[id].name;
      for (i = 0; isUndefined(idx) && i < store[name].length; i++) {
        if (id === store[name][i]) {
          idx = i;
        }
      }
      rm(objects[id].obj);
      if (objects[id].sub) {
        rm(objects[id].sub);
      }
      delete objects[id];
      store[name].splice(idx, 1);
      return true;
    }
    return false;
  };

  /**
   * return an object from a container object in the store by its id
   * ! for now, only cluster manage this feature
   **/
  self.objGetById = function (id) {
    var result, idx;
    if (store.clusterer) {
      for (idx in store.clusterer) {
        if ((result = objects[store.clusterer[idx]].obj.getById(id)) !== false) {
          return result;
        }
      }
    }
    return false;
  };

  /**
   * remove object from a container object in the store by its id
   * ! for now, only cluster manage this feature
   **/
  self.objClearById = function (id) {
    var idx;
    if (store.clusterer) {
      for (idx in store.clusterer) {
        if (objects[store.clusterer[idx]].obj.clearById(id)) {
          return true;
        }
      }
    }
    return null;
  };

  /**
   * remove objects from the store
   **/
  self.clear = function (list, last, first, tag) {
    var k, i, name,
      check = ftag(tag);
    if (!list || !list.length) {
      list = [];
      for (k in store) {
        list.push(k);
      }
    } else {
      list = array(list);
    }
    for (i = 0; i < list.length; i++) {
      name = list[i];
      if (last) {
        self.rm(name, check, true);
      } else if (first) {
        self.rm(name, check, false);
      } else { // all
        while (self.rm(name, check, false)) {
        }
      }
    }
  };

  /**
   * remove object from a container object in the store by its tags
   * ! for now, only cluster manage this feature
   **/
  self.objClear = function (list, last, first, tag) {
    var idx;
    if (store.clusterer && ($.inArray("marker", list) >= 0 || !list.length)) {
      for (idx in store.clusterer) {
        objects[store.clusterer[idx]].obj.clear(last, first, tag);
      }
    }
  };
}
/**
 * Class Task
 * @param ctx
 * @param onEnd
 * @param td
 * @constructor
 */
function Task(ctx, onEnd, td) {
  var session = {},
    self = this,
    current,
    resolve = {
      latLng: { // function => bool (=> address = latLng)
        map: false,
        marker: false,
        infowindow: false,
        circle: false,
        overlay: false,
        getlatlng: false,
        getmaxzoom: false,
        getelevation: false,
        streetviewpanorama: false,
        getaddress: true
      },
      geoloc: {
        getgeoloc: true
      }
    };

  function unify(td) {
    var result = {};
    result[td] = {};
    return result;
  }

  if (isString(td)) {
    td =  unify(td);
  }

  function next() {
    var k;
    for (k in td) {
      if (td.hasOwnProperty(k) && !session.hasOwnProperty(k)) {
        return k;
      }
    }
  }

  self.run = function () {
    var k, opts;
    while (k = next()) {
      if (isFunction(ctx[k])) {
        current = k;
        opts = $.extend(true, {}, defaults[k] || {}, td[k].options || {});
        if (k in resolve.latLng) {
          if (td[k].values) {
            resolveAllLatLng(td[k].values, ctx, ctx[k], {td: td[k], opts: opts, session: session});
          } else {
            resolveLatLng(ctx, ctx[k], resolve.latLng[k], {td: td[k], opts: opts, session: session});
          }
        } else if (k in resolve.geoloc) {
          geoloc(ctx, ctx[k], {td: td[k], opts: opts, session: session});
        } else {
          ctx[k].apply(ctx, [{td: td[k], opts: opts, session: session}]);
        }
        return; // wait until ack
      } else {
        session[k] = null;
      }
    }
    onEnd.apply(ctx, [td, session]);
  };

  self.ack = function(result){
    session[current] = result;
    self.run.apply(self, []);
  };
}

function directionsService(){
  if (!services.ds) {
    services.ds = new gm.DirectionsService();
  }
  return services.ds;
}

function distanceMatrixService() {
  if (!services.dms) {
    services.dms = new gm.DistanceMatrixService();
  }
  return services.dms;
}

function maxZoomService() {
  if (!services.mzs) {
    services.mzs = new gm.MaxZoomService();
  }
  return services.mzs;
}

function elevationService() {
  if (!services.es) {
    services.es = new gm.ElevationService();
  }
  return services.es;
}

  /**
   * Usefull to get a projection
   * => done in a function, to let dead-code analyser works without google library loaded
   **/
  function newEmptyOverlay(map, radius) {
    function Overlay() {
      var self = this;
      self.onAdd = function () {};
      self.onRemove = function () {};
      self.draw = function () {};
      return defaults.classes.OverlayView.apply(self, []);
    }
    Overlay.prototype = defaults.classes.OverlayView.prototype;
    var obj = new Overlay();
    obj.setMap(map);
    return obj;
  }

/**
 * Class InternalClusterer
 * This class manage clusters thanks to "td" objects
 *
 * Note:
 * Individuals marker are created on the fly thanks to the td objects, they are
 * first set to null to keep the indexes synchronised with the td list
 * This is the "display" function, set by the gmap3 object, which uses theses data
 * to create markers when clusters are not required
 * To remove a marker, the objects are deleted and set not null in arrays
 *    markers[key]
 *      = null : marker exist but has not been displayed yet
 *      = false : marker has been removed
 **/
function InternalClusterer($container, map, raw) {
  var timer, projection,
    ffilter, fdisplay, ferror, // callback function
    updating = false,
    updated = false,
    redrawing = false,
    ready = false,
    enabled = true,
    self = this,
    events =  [],
    store = {},   // combin of index (id1-id2-...) => object
    ids = {},     // unique id => index
    idxs = {},    // index => unique id
    markers = [], // index => marker
    tds = [],   // index => td or null if removed
    values = [],  // index => value
    overlay = newEmptyOverlay(map, raw.radius);

  main();

  function prepareMarker(index) {
    if (!markers[index]) {
      delete tds[index].options.map;
      markers[index] = new defaults.classes.Marker(tds[index].options);
      attachEvents($container, {td: tds[index]}, markers[index], tds[index].id);
    }
  }

  /**
   * return a marker by its id, null if not yet displayed and false if no exist or removed
   **/
  self.getById = function (id) {
    if (id in ids) {
      prepareMarker(ids[id]);
      return  markers[ids[id]];
    }
    return false;
  };

  /**
   * remove one object from the store
   **/
  self.rm = function (id) {
    var index = ids[id];
    if (markers[index]) { // can be null
      markers[index].setMap(null);
    }
    delete markers[index];
    markers[index] = false;

    delete tds[index];
    tds[index] = false;

    delete values[index];
    values[index] = false;

    delete ids[id];
    delete idxs[index];
    updated = true;
  };

  /**
   * remove a marker by its id
   **/
  self.clearById = function (id) {
    if (id in ids){
      self.rm(id);
      return true;
    }
  };

  /**
   * remove objects from the store
   **/
  self.clear = function (last, first, tag) {
    var start, stop, step, index, i,
      list = [],
      check = ftag(tag);
    if (last) {
      start = tds.length - 1;
      stop = -1;
      step = -1;
    } else {
      start = 0;
      stop =  tds.length;
      step = 1;
    }
    for (index = start; index !== stop; index += step) {
      if (tds[index]) {
        if (!check || check(tds[index].tag)) {
          list.push(idxs[index]);
          if (first || last) {
            break;
          }
        }
      }
    }
    for (i = 0; i < list.length; i++) {
      self.rm(list[i]);
    }
  };

  // add a "marker td" to the cluster
  self.add = function (td, value) {
    td.id = globalId(td.id);
    self.clearById(td.id);
    ids[td.id] = markers.length;
    idxs[markers.length] = td.id;
    markers.push(null); // null = marker not yet created / displayed
    tds.push(td);
    values.push(value);
    updated = true;
  };

  // add a real marker to the cluster
  self.addMarker = function (marker, td) {
    td = td || {};
    td.id = globalId(td.id);
    self.clearById(td.id);
    if (!td.options) {
      td.options = {};
    }
    td.options.position = marker.getPosition();
    attachEvents($container, {td: td}, marker, td.id);
    ids[td.id] = markers.length;
    idxs[markers.length] = td.id;
    markers.push(marker);
    tds.push(td);
    values.push(td.data || {});
    updated = true;
  };

  // return a "marker td" by its index
  self.td = function (index) {
    return tds[index];
  };

  // return a "marker value" by its index
  self.value = function (index) {
    return values[index];
  };

  // return a marker by its index
  self.marker = function (index) {
    if (index in markers) {
      prepareMarker(index);
      return  markers[index];
    }
    return false;
  };

  // return a marker by its index
  self.markerIsSet = function (index) {
    return Boolean(markers[index]);
  };

  // store a new marker instead if the default "false"
  self.setMarker = function (index, marker) {
    markers[index] = marker;
  };

  // link the visible overlay to the logical data (to hide overlays later)
  self.store = function (cluster, obj, shadow) {
    store[cluster.ref] = {obj: obj, shadow: shadow};
  };

  // free all objects
  self.free = function () {
    var i;
    for(i = 0; i < events.length; i++) {
      gm.event.removeListener(events[i]);
    }
    events = [];

    $.each(store, function (key) {
      flush(key);
    });
    store = {};

    $.each(tds, function (i) {
      tds[i] = null;
    });
    tds = [];

    $.each(markers, function (i) {
      if (markers[i]) { // false = removed
        markers[i].setMap(null);
        delete markers[i];
      }
    });
    markers = [];

    $.each(values, function (i) {
      delete values[i];
    });
    values = [];

    ids = {};
    idxs = {};
  };

  // link the display function
  self.filter = function (f) {
    ffilter = f;
    redraw();
  };

  // enable/disable the clustering feature
  self.enable = function (value) {
    if (enabled !== value) {
      enabled = value;
      redraw();
    }
  };

  // link the display function
  self.display = function (f) {
    fdisplay = f;
  };

  // link the errorfunction
  self.error = function (f) {
    ferror = f;
  };

  // lock the redraw
  self.beginUpdate = function () {
    updating = true;
  };

  // unlock the redraw
  self.endUpdate = function () {
    updating = false;
    if (updated) {
      redraw();
    }
  };

  // extends current bounds with internal markers
  self.autofit = function (bounds) {
    var i;
    for (i = 0; i < tds.length; i++) {
      if (tds[i]) {
        bounds.extend(tds[i].options.position);
      }
    }
  };

  // bind events
  function main() {
    projection = overlay.getProjection();
    if (!projection) {
      setTimeout(function () { main.apply(self, []); }, 25);
      return;
    }
    ready = true;
    events.push(gm.event.addListener(map, "zoom_changed", delayRedraw));
    events.push(gm.event.addListener(map, "bounds_changed", delayRedraw));
    redraw();
  }

  // flush overlays
  function flush(key) {
    if (isObject(store[key])) { // is overlay
      if (isFunction(store[key].obj.setMap)) {
        store[key].obj.setMap(null);
      }
      if (isFunction(store[key].obj.remove)) {
        store[key].obj.remove();
      }
      if (isFunction(store[key].shadow.remove)) {
        store[key].obj.remove();
      }
      if (isFunction(store[key].shadow.setMap)) {
        store[key].shadow.setMap(null);
      }
      delete store[key].obj;
      delete store[key].shadow;
    } else if (markers[key]) { // marker not removed
      markers[key].setMap(null);
      // don't remove the marker object, it may be displayed later
    }
    delete store[key];
  }

  /**
   * return the distance between 2 latLng couple into meters
   * Params :
   *  Lat1, Lng1, Lat2, Lng2
   *  LatLng1, Lat2, Lng2
   *  Lat1, Lng1, LatLng2
   *  LatLng1, LatLng2
   **/
  function distanceInMeter() {
    var lat1, lat2, lng1, lng2, e, f, g, h,
      cos = Math.cos,
      sin = Math.sin,
      args = arguments;
    if (args[0] instanceof gm.LatLng) {
      lat1 = args[0].lat();
      lng1 = args[0].lng();
      if (args[1] instanceof gm.LatLng) {
        lat2 = args[1].lat();
        lng2 = args[1].lng();
      } else {
        lat2 = args[1];
        lng2 = args[2];
      }
    } else {
      lat1 = args[0];
      lng1 = args[1];
      if (args[2] instanceof gm.LatLng) {
        lat2 = args[2].lat();
        lng2 = args[2].lng();
      } else {
        lat2 = args[2];
        lng2 = args[3];
      }
    }
    e = Math.PI * lat1 / 180;
    f = Math.PI * lng1 / 180;
    g = Math.PI * lat2 / 180;
    h = Math.PI * lng2 / 180;
    return 1000 * 6371 * Math.acos(Math.min(cos(e) * cos(g) * cos(f) * cos(h) + cos(e) * sin(f) * cos(g) * sin(h) + sin(e) * sin(g), 1));
  }

  // extend the visible bounds
  function extendsMapBounds() {
    var radius = distanceInMeter(map.getCenter(), map.getBounds().getNorthEast()),
      circle = new gm.Circle({
        center: map.getCenter(),
        radius: 1.25 * radius // + 25%
      });
    return circle.getBounds();
  }

  // return an object where keys are store keys
  function getStoreKeys() {
    var k,
      keys = {};
    for (k in store) {
      keys[k] = true;
    }
    return keys;
  }

  // async the delay function
  function delayRedraw() {
    clearTimeout(timer);
    timer = setTimeout(redraw, 25);
  }

  // generate bounds extended by radius
  function extendsBounds(latLng) {
    var p = projection.fromLatLngToDivPixel(latLng),
      ne = projection.fromDivPixelToLatLng(new gm.Point(p.x + raw.radius, p.y - raw.radius)),
      sw = projection.fromDivPixelToLatLng(new gm.Point(p.x - raw.radius, p.y + raw.radius));
    return new gm.LatLngBounds(sw, ne);
  }

  // run the clustering process and call the display function
  function redraw() {
    if (updating || redrawing || !ready) {
      return;
    }

    var i, j, k, indexes, check = false, bounds, cluster, position, previous, lat, lng, loop,
      keys = [],
      used = {},
      zoom = map.getZoom(),
      forceDisabled = ("maxZoom" in raw) && (zoom > raw.maxZoom),
      previousKeys = getStoreKeys();

    // reset flag
    updated = false;

    if (zoom > 3) {
      // extend the bounds of the visible map to manage clusters near the boundaries
      bounds = extendsMapBounds();

      // check contain only if boundaries are valid
      check = bounds.getSouthWest().lng() < bounds.getNorthEast().lng();
    }

    // calculate positions of "visibles" markers (in extended bounds)
    for (i = 0; i < tds.length; i++) {
      if (tds[i] && (!check || bounds.contains(tds[i].options.position)) && (!ffilter || ffilter(values[i]))) {
        keys.push(i);
      }
    }

    // for each "visible" marker, search its neighbors to create a cluster
    // we can't do a classical "for" loop, because, analysis can bypass a marker while focusing on cluster
    while (1) {
      i = 0;
      while (used[i] && (i < keys.length)) { // look for the next marker not used
        i++;
      }
      if (i === keys.length) {
        break;
      }

      indexes = [];

      if (enabled && !forceDisabled) {
        loop = 10;
        do {
          previous = indexes;
          indexes = [];
          loop--;

          if (previous.length) {
            position = bounds.getCenter();
          } else {
            position = tds[keys[i]].options.position;
          }
          bounds = extendsBounds(position);

          for (j = i; j < keys.length; j++) {
            if (used[j]) {
              continue;
            }
            if (bounds.contains(tds[keys[j]].options.position)) {
              indexes.push(j);
            }
          }
        } while ((previous.length < indexes.length) && (indexes.length > 1) && loop);
      } else {
        for (j = i; j < keys.length; j++) {
          if (!used[j]) {
            indexes.push(j);
            break;
          }
        }
      }

      cluster = {indexes: [], ref: []};
      lat = lng = 0;
      for (k = 0; k < indexes.length; k++) {
        used[indexes[k]] = true;
        cluster.indexes.push(keys[indexes[k]]);
        cluster.ref.push(keys[indexes[k]]);
        lat += tds[keys[indexes[k]]].options.position.lat();
        lng += tds[keys[indexes[k]]].options.position.lng();
      }
      lat /= indexes.length;
      lng /= indexes.length;
      cluster.latLng = new gm.LatLng(lat, lng);

      cluster.ref = cluster.ref.join("-");

      if (cluster.ref in previousKeys) { // cluster doesn't change
        delete previousKeys[cluster.ref]; // remove this entry, these still in this array will be removed
      } else { // cluster is new
        if (indexes.length === 1) { // alone markers are not stored, so need to keep the key (else, will be displayed every time and marker will blink)
          store[cluster.ref] = true;
        }
        fdisplay(cluster);
      }
    }

    // flush the previous overlays which are not still used
    $.each(previousKeys, function (key) {
      flush(key);
    });
    redrawing = false;
  }
}
/**
 * Class Clusterer
 * a facade with limited method for external use
 **/
function Clusterer(id, internalClusterer) {
  var self = this;
  self.id = function () {
    return id;
  };
  self.filter = function (f) {
    internalClusterer.filter(f);
  };
  self.enable = function () {
    internalClusterer.enable(true);
  };
  self.disable = function () {
    internalClusterer.enable(false);
  };
  self.add = function (marker, td, lock) {
    if (!lock) {
      internalClusterer.beginUpdate();
    }
    internalClusterer.addMarker(marker, td);
    if (!lock) {
      internalClusterer.endUpdate();
    }
  };
  self.getById = function (id) {
    return internalClusterer.getById(id);
  };
  self.clearById = function (id, lock) {
    var result;
    if (!lock) {
      internalClusterer.beginUpdate();
    }
    result = internalClusterer.clearById(id);
    if (!lock) {
      internalClusterer.endUpdate();
    }
    return result;
  };
  self.clear = function (last, first, tag, lock) {
    if (!lock) {
      internalClusterer.beginUpdate();
    }
    internalClusterer.clear(last, first, tag);
    if (!lock) {
      internalClusterer.endUpdate();
    }
  };
}

/**
 * Class OverlayView
 * @constructor
 */
function OverlayView(map, opts, latLng, $div) {
  var self = this,
    listeners = [];

  defaults.classes.OverlayView.call(self);
  self.setMap(map);

  self.onAdd = function () {
    var panes = self.getPanes();
    if (opts.pane in panes) {
      $(panes[opts.pane]).append($div);
    }
    $.each("dblclick click mouseover mousemove mouseout mouseup mousedown".split(" "), function (i, name) {
      listeners.push(
        gm.event.addDomListener($div[0], name, function (e) {
          $.Event(e).stopPropagation();
          gm.event.trigger(self, name, [e]);
          self.draw();
        })
      );
    });
    listeners.push(
      gm.event.addDomListener($div[0], "contextmenu", function (e) {
        $.Event(e).stopPropagation();
        gm.event.trigger(self, "rightclick", [e]);
        self.draw();
      })
    );
  };

  self.getPosition = function () {
    return latLng;
  };

  self.setPosition = function (newLatLng) {
    latLng = newLatLng;
    self.draw();
  };

  self.draw = function () {
    var ps = self.getProjection().fromLatLngToDivPixel(latLng);
    $div
      .css("left", (ps.x + opts.offset.x) + "px")
      .css("top", (ps.y + opts.offset.y) + "px");
  };

  self.onRemove = function () {
    var i;
    for (i = 0; i < listeners.length; i++) {
      gm.event.removeListener(listeners[i]);
    }
    $div.remove();
  };

  self.hide = function () {
    $div.hide();
  };

  self.show = function () {
    $div.show();
  };

  self.toggle = function () {
    if ($div) {
      if ($div.is(":visible")) {
        self.show();
      } else {
        self.hide();
      }
    }
  };

  self.toggleDOM = function () {
    self.setMap(self.getMap() ? null : map);
  };

  self.getDOMElement = function () {
    return $div[0];
  };
}

function Gmap3($this) {
  var self = this,
    stack = new Stack(),
    store = new Store(),
    map = null,
    task;

  /**
   * if not running, start next action in stack
   **/
  function run() {
    if (!task && (task = stack.get())) {
      task.run();
    }
  }

  /**
   * called when action in finished, to acknoledge the current in stack and start next one
   **/
  function end() {
    task = null;
    stack.ack();
    run.call(self); // restart to high level scope
  }

//-----------------------------------------------------------------------//
// Tools
//-----------------------------------------------------------------------//

  /**
   * execute callback functions
   **/
  function callback(args) {
    var params,
      cb = args.td.callback;
    if (cb) {
      params = Array.prototype.slice.call(arguments, 1);
      if (isFunction(cb)) {
        cb.apply($this, params);
      } else if (isArray(cb)) {
        if (isFunction(cb[1])) {
          cb[1].apply(cb[0], params);
        }
      }
    }
  }

  /**
   * execute ending functions
   **/
  function manageEnd(args, obj, id) {
    if (id) {
      attachEvents($this, args, obj, id);
    }
    callback(args, obj);
    task.ack(obj);
  }

  /**
   * initialize the map if not yet initialized
   **/
  function newMap(latLng, args) {
    args = args || {};
    var opts = args.td && args.td.options ? args.td.options : 0;
    if (map) {
      if (opts) {
        if (opts.center) {
          opts.center = toLatLng(opts.center);
        }
        map.setOptions(opts);
      }
    } else {
      opts = args.opts || $.extend(true, {}, defaults.map, opts || {});
      opts.center = latLng || toLatLng(opts.center);
      map = new defaults.classes.Map($this.get(0), opts);
    }
  }

  /**
   * store actions to execute in a stack manager
   **/
  self._plan = function (list) {
    var k;
    for (k = 0; k < list.length; k++) {
      stack.add(new Task(self, end, list[k]));
    }
    run();
  };

  /**
   * Initialize gm.Map object
   **/
  self.map = function (args) {
    newMap(args.latLng, args);
    attachEvents($this, args, map);
    manageEnd(args, map);
  };

  /**
   * destroy an existing instance
   **/
  self.destroy = function (args) {
    store.clear();
    $this.empty();
    if (map) {
      map = null;
    }
    manageEnd(args, true);
  };

  /**
   * add an overlay
   **/
  self.overlay = function (args, internal) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{latLng: args.latLng, options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    if (!OverlayView.__initialised) {
      OverlayView.prototype = new defaults.classes.OverlayView();
      OverlayView.__initialised = true;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj, td = tuple(args, value),
        $div = $(document.createElement("div")).css({
          border: "none",
          borderWidth: 0,
          position: "absolute"
        });
      $div.append(td.options.content);
      obj = new OverlayView(map, td.options, toLatLng(td) || toLatLng(value), $div);
      objs.push(obj);
      $div = null; // memory leak
      if (!internal) {
        id = store.add(args, "overlay", obj);
        attachEvents($this, {td: td}, obj, id);
      }
    });
    if (internal) {
      return objs[0];
    }
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * Create an InternalClusterer object
   **/
  function createClusterer(raw) {
    var internalClusterer = new InternalClusterer($this, map, raw),
      td = {},
      styles = {},
      thresholds = [],
      isInt = /^[0-9]+$/,
      calculator,
      k;

    for (k in raw) {
      if (isInt.test(k)) {
        thresholds.push(1 * k); // cast to int
        styles[k] = raw[k];
        styles[k].width = styles[k].width || 0;
        styles[k].height = styles[k].height || 0;
      } else {
        td[k] = raw[k];
      }
    }
    thresholds.sort(function (a, b) { return a > b; });

    // external calculator
    if (td.calculator) {
      calculator = function (indexes) {
        var data = [];
        $.each(indexes, function (i, index) {
          data.push(internalClusterer.value(index));
        });
        return td.calculator.apply($this, [data]);
      };
    } else {
      calculator = function (indexes) {
        return indexes.length;
      };
    }

    // set error function
    internalClusterer.error(function () {
      error.apply(self, arguments);
    });

    // set display function
    internalClusterer.display(function (cluster) {
      var i, style, atd, obj, offset, shadow,
        cnt = calculator(cluster.indexes);

      // look for the style to use
      if (raw.force || cnt > 1) {
        for (i = 0; i < thresholds.length; i++) {
          if (thresholds[i] <= cnt) {
            style = styles[thresholds[i]];
          }
        }
      }

      if (style) {
        offset = style.offset || [-style.width/2, -style.height/2];
        // create a custom overlay command
        // nb: 2 extends are faster self a deeper extend
        atd = $.extend({}, td);
        atd.options = $.extend({
            pane: "overlayLayer",
            content: style.content ? style.content.replace("CLUSTER_COUNT", cnt) : "",
            offset: {
              x: ("x" in offset ? offset.x : offset[0]) || 0,
              y: ("y" in offset ? offset.y : offset[1]) || 0
            }
          },
          td.options || {});

        obj = self.overlay({td: atd, opts: atd.options, latLng: toLatLng(cluster)}, true);

        atd.options.pane = "floatShadow";
        atd.options.content = $(document.createElement("div")).width(style.width + "px").height(style.height + "px").css({cursor: "pointer"});
        shadow = self.overlay({td: atd, opts: atd.options, latLng: toLatLng(cluster)}, true);

        // store data to the clusterer
        td.data = {
          latLng: toLatLng(cluster),
          markers:[]
        };
        $.each(cluster.indexes, function(i, index){
          td.data.markers.push(internalClusterer.value(index));
          if (internalClusterer.markerIsSet(index)){
            internalClusterer.marker(index).setMap(null);
          }
        });
        attachEvents($this, {td: td}, shadow, undef, {main: obj, shadow: shadow});
        internalClusterer.store(cluster, obj, shadow);
      } else {
        $.each(cluster.indexes, function (i, index) {
          internalClusterer.marker(index).setMap(map);
        });
      }
    });

    return internalClusterer;
  }

  /**
   *  add a marker
   **/
  self.marker = function (args) {
    var objs,
      clusterer, internalClusterer,
      multiple = "values" in args.td,
      init = !map;
    if (!multiple) {
      args.opts.position = args.latLng || toLatLng(args.opts.position);
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    if (init) {
      newMap();
    }
    if (args.td.cluster && !map.getBounds()) { // map not initialised => bounds not available : wait for map if clustering feature is required
      gm.event.addListenerOnce(map, "bounds_changed", function () { self.marker.apply(self, [args]); });
      return;
    }
    if (args.td.cluster) {
      if (args.td.cluster instanceof Clusterer) {
        clusterer = args.td.cluster;
        internalClusterer = store.getById(clusterer.id(), true);
      } else {
        internalClusterer = createClusterer(args.td.cluster);
        clusterer = new Clusterer(globalId(args.td.id, true), internalClusterer);
        store.add(args, "clusterer", clusterer, internalClusterer);
      }
      internalClusterer.beginUpdate();

      $.each(args.td.values, function (i, value) {
        var td = tuple(args, value);
        td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value);
        if (td.options.position) {
          td.options.map = map;
          if (init) {
            map.setCenter(td.options.position);
            init = false;
          }
          internalClusterer.add(td, value);
        }
      });

      internalClusterer.endUpdate();
      manageEnd(args, clusterer);

    } else {
      objs = [];
      $.each(args.td.values, function (i, value) {
        var id, obj,
          td = tuple(args, value);
        td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value);
        if (td.options.position) {
          td.options.map = map;
          if (init) {
            map.setCenter(td.options.position);
            init = false;
          }
          obj = new defaults.classes.Marker(td.options);
          objs.push(obj);
          id = store.add({td: td}, "marker", obj);
          attachEvents($this, {td: td}, obj, id);
        }
      });
      manageEnd(args, multiple ? objs : objs[0]);
    }
  };

  /**
   * return a route
   **/
  self.getroute = function (args) {
    args.opts.origin = toLatLng(args.opts.origin, true);
    args.opts.destination = toLatLng(args.opts.destination, true);
    directionsService().route(
      args.opts,
      function (results, status) {
        callback(args, status === gm.DirectionsStatus.OK ? results : false, status);
        task.ack();
      }
    );
  };

  /**
   * return the distance between an origin and a destination
   *
   **/
  self.getdistance = function (args) {
    var i;
    args.opts.origins = array(args.opts.origins);
    for (i = 0; i < args.opts.origins.length; i++) {
      args.opts.origins[i] = toLatLng(args.opts.origins[i], true);
    }
    args.opts.destinations = array(args.opts.destinations);
    for (i = 0; i < args.opts.destinations.length; i++) {
      args.opts.destinations[i] = toLatLng(args.opts.destinations[i], true);
    }
    distanceMatrixService().getDistanceMatrix(
      args.opts,
      function (results, status) {
        callback(args, status === gm.DistanceMatrixStatus.OK ? results : false, status);
        task.ack();
      }
    );
  };

  /**
   * add an infowindow
   **/
  self.infowindow = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      if (args.latLng) {
        args.opts.position = args.latLng;
      }
      args.td.values = [{options: args.opts}];
    }
    $.each(args.td.values, function (i, value) {
      var id, obj,
        td = tuple(args, value);
      td.options.position = td.options.position ? toLatLng(td.options.position) : toLatLng(value.latLng);
      if (!map) {
        newMap(td.options.position);
      }
      obj = new defaults.classes.InfoWindow(td.options);
      if (obj && (isUndefined(td.open) || td.open)) {
        if (multiple) {
          obj.open(map, td.anchor || undef);
        } else {
          obj.open(map, td.anchor || (args.latLng ? undef : (args.session.marker ? args.session.marker : undef)));
        }
      }
      objs.push(obj);
      id = store.add({td: td}, "infowindow", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * add a circle
   **/
  self.circle = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.opts.center = args.latLng || toLatLng(args.opts.center);
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj,
        td = tuple(args, value);
      td.options.center = td.options.center ? toLatLng(td.options.center) : toLatLng(value);
      if (!map) {
        newMap(td.options.center);
      }
      td.options.map = map;
      obj = new defaults.classes.Circle(td.options);
      objs.push(obj);
      id = store.add({td: td}, "circle", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * returns address structure from latlng
   **/
  self.getaddress = function (args) {
    callback(args, args.results, args.status);
    task.ack();
  };

  /**
   * returns latlng from an address
   **/
  self.getlatlng = function (args) {
    callback(args, args.results, args.status);
    task.ack();
  };

  /**
   * return the max zoom of a location
   **/
  self.getmaxzoom = function (args) {
    maxZoomService().getMaxZoomAtLatLng(
      args.latLng,
      function (result) {
        callback(args, result.status === gm.MaxZoomStatus.OK ? result.zoom : false, status);
        task.ack();
      }
    );
  };

  /**
   * return the elevation of a location
   **/
  self.getelevation = function (args) {
    var i,
      locations = [],
      f = function (results, status) {
        callback(args, status === gm.ElevationStatus.OK ? results : false, status);
        task.ack();
      };

    if (args.latLng) {
      locations.push(args.latLng);
    } else {
      locations = array(args.td.locations || []);
      for (i = 0; i < locations.length; i++) {
        locations[i] = toLatLng(locations[i]);
      }
    }
    if (locations.length) {
      elevationService().getElevationForLocations({locations: locations}, f);
    } else {
      if (args.td.path && args.td.path.length) {
        for (i = 0; i < args.td.path.length; i++) {
          locations.push(toLatLng(args.td.path[i]));
        }
      }
      if (locations.length) {
        elevationService().getElevationAlongPath({path: locations, samples:args.td.samples}, f);
      } else {
        task.ack();
      }
    }
  };

  /**
   * define defaults values
   **/
  self.defaults = function (args) {
    $.each(args.td, function(name, value) {
      if (isObject(defaults[name])) {
        defaults[name] = $.extend({}, defaults[name], value);
      } else {
        defaults[name] = value;
      }
    });
    task.ack(true);
  };

  /**
   * add a rectangle
   **/
  self.rectangle = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj,
        td = tuple(args, value);
      td.options.bounds = td.options.bounds ? toLatLngBounds(td.options.bounds) : toLatLngBounds(value);
      if (!map) {
        newMap(td.options.bounds.getCenter());
      }
      td.options.map = map;

      obj = new defaults.classes.Rectangle(td.options);
      objs.push(obj);
      id = store.add({td: td}, "rectangle", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * add a polygone / polyline
   **/
  function poly(args, poly, path) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    newMap();
    $.each(args.td.values, function (_, value) {
      var id, i, j, obj,
        td = tuple(args, value);
      if (td.options[path]) {
        if (td.options[path][0][0] && isArray(td.options[path][0][0])) {
          for (i = 0; i < td.options[path].length; i++) {
            for (j = 0; j < td.options[path][i].length; j++) {
              td.options[path][i][j] = toLatLng(td.options[path][i][j]);
            }
          }
        } else {
          for (i = 0; i < td.options[path].length; i++) {
            td.options[path][i] = toLatLng(td.options[path][i]);
          }
        }
      }
      td.options.map = map;
      obj = new gm[poly](td.options);
      objs.push(obj);
      id = store.add({td: td}, poly.toLowerCase(), obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  }

  self.polyline = function (args) {
    poly(args, "Polyline", "path");
  };

  self.polygon = function (args) {
    poly(args, "Polygon", "paths");
  };

  /**
   * add a traffic layer
   **/
  self.trafficlayer = function (args) {
    newMap();
    var obj = store.get("trafficlayer");
    if (!obj) {
      obj = new defaults.classes.TrafficLayer();
      obj.setMap(map);
      store.add(args, "trafficlayer", obj);
    }
    manageEnd(args, obj);
  };

  /**
   * add a bicycling layer
   **/
  self.bicyclinglayer = function (args) {
    newMap();
    var obj = store.get("bicyclinglayer");
    if (!obj) {
      obj = new defaults.classes.BicyclingLayer();
      obj.setMap(map);
      store.add(args, "bicyclinglayer", obj);
    }
    manageEnd(args, obj);
  };

  /**
   * add a ground overlay
   **/
  self.groundoverlay = function (args) {
    args.opts.bounds = toLatLngBounds(args.opts.bounds);
    if (args.opts.bounds){
      newMap(args.opts.bounds.getCenter());
    }
    var id,
      obj = new defaults.classes.GroundOverlay(args.opts.url, args.opts.bounds, args.opts.opts);
    obj.setMap(map);
    id = store.add(args, "groundoverlay", obj);
    manageEnd(args, obj, id);
  };

  /**
   * set a streetview
   **/
  self.streetviewpanorama = function (args) {
    if (!args.opts.opts) {
      args.opts.opts = {};
    }
    if (args.latLng) {
      args.opts.opts.position = args.latLng;
    } else if (args.opts.opts.position) {
      args.opts.opts.position = toLatLng(args.opts.opts.position);
    }
    if (args.td.divId) {
      args.opts.container = document.getElementById(args.td.divId);
    } else if (args.opts.container) {
      args.opts.container = $(args.opts.container).get(0);
    }
    var id, obj = new defaults.classes.StreetViewPanorama(args.opts.container, args.opts.opts);
    if (obj) {
      map.setStreetView(obj);
    }
    id = store.add(args, "streetviewpanorama", obj);
    manageEnd(args, obj, id);
  };

  self.kmllayer = function (args) {
    var objs = [],
      multiple = "values" in args.td;
    if (!multiple) {
      args.td.values = [{options: args.opts}];
    }
    if (!args.td.values.length) {
      manageEnd(args, false);
      return;
    }
    $.each(args.td.values, function (i, value) {
      var id, obj, options,
        td = tuple(args, value);
      if (!map) {
        newMap();
      }
      options = td.options;
      // compatibility 5.0-
      if (td.options.opts) {
        options = td.options.opts;
        if (td.options.url) {
          options.url = td.options.url;
        }
      }
      // -- end --
      options.map = map;
      if (googleVersionMin("3.10")) {
        obj = new defaults.classes.KmlLayer(options);
      } else {
        obj = new defaults.classes.KmlLayer(options.url, options);
      }
      objs.push(obj);
      id = store.add({td: td}, "kmllayer", obj);
      attachEvents($this, {td: td}, obj, id);
    });
    manageEnd(args, multiple ? objs : objs[0]);
  };

  /**
   * add a fix panel
   **/
  self.panel = function (args) {
    newMap();
    var id, $content,
      x = 0,
      y = 0,
      $div = $(document.createElement("div"));

    $div.css({
      position: "absolute",
      zIndex: 1000,
      visibility: "hidden"
    });

    if (args.opts.content) {
      $content = $(args.opts.content);
      $div.append($content);
      $this.first().prepend($div);

      if (!isUndefined(args.opts.left)) {
        x = args.opts.left;
      } else if (!isUndefined(args.opts.right)) {
        x = $this.width() - $content.width() - args.opts.right;
      } else if (args.opts.center) {
        x = ($this.width() - $content.width()) / 2;
      }

      if (!isUndefined(args.opts.top)) {
        y = args.opts.top;
      } else if (!isUndefined(args.opts.bottom)) {
        y = $this.height() - $content.height() - args.opts.bottom;
      } else if (args.opts.middle) {
        y = ($this.height() - $content.height()) / 2
      }

      $div.css({
        top: y,
        left: x,
        visibility: "visible"
      });
    }

    id = store.add(args, "panel", $div);
    manageEnd(args, $div, id);
    $div = null; // memory leak
  };

  /**
   * add a direction renderer
   **/
  self.directionsrenderer = function (args) {
    args.opts.map = map;
    var id,
      obj = new gm.DirectionsRenderer(args.opts);
    if (args.td.divId) {
      obj.setPanel(document.getElementById(args.td.divId));
    } else if (args.td.container) {
      obj.setPanel($(args.td.container).get(0));
    }
    id = store.add(args, "directionsrenderer", obj);
    manageEnd(args, obj, id);
  };

  /**
   * returns latLng of the user
   **/
  self.getgeoloc = function (args) {
    manageEnd(args, args.latLng);
  };

  /**
   * add a style
   **/
  self.styledmaptype = function (args) {
    newMap();
    var obj = new defaults.classes.StyledMapType(args.td.styles, args.opts);
    map.mapTypes.set(args.td.id, obj);
    manageEnd(args, obj);
  };

  /**
   * add an imageMapType
   **/
  self.imagemaptype = function (args) {
    newMap();
    var obj = new defaults.classes.ImageMapType(args.opts);
    map.mapTypes.set(args.td.id, obj);
    manageEnd(args, obj);
  };

  /**
   * autofit a map using its overlays (markers, rectangles ...)
   **/
  self.autofit = function (args) {
    var bounds = new gm.LatLngBounds();
    $.each(store.all(), function (i, obj) {
      if (obj.getPosition) {
        bounds.extend(obj.getPosition());
      } else if (obj.getBounds) {
        bounds.extend(obj.getBounds().getNorthEast());
        bounds.extend(obj.getBounds().getSouthWest());
      } else if (obj.getPaths) {
        obj.getPaths().forEach(function (path) {
          path.forEach(function (latLng) {
            bounds.extend(latLng);
          });
        });
      } else if (obj.getPath) {
        obj.getPath().forEach(function (latLng) {
          bounds.extend(latLng);
        });
      } else if (obj.getCenter) {
        bounds.extend(obj.getCenter());
      } else if (typeof Clusterer === "function" && obj instanceof Clusterer) {
        obj = store.getById(obj.id(), true);
        if (obj) {
          obj.autofit(bounds);
        }
      }
    });

    if (!bounds.isEmpty() && (!map.getBounds() || !map.getBounds().equals(bounds))) {
      if ("maxZoom" in args.td) {
        // fitBouds Callback event => detect zoom level and check maxZoom
        gm.event.addListenerOnce(
          map,
          "bounds_changed",
          function () {
            if (this.getZoom() > args.td.maxZoom) {
              this.setZoom(args.td.maxZoom);
            }
          }
        );
      }
      map.fitBounds(bounds);
    }
    manageEnd(args, true);
  };

  /**
   * remove objects from a map
   **/
  self.clear = function (args) {
    if (isString(args.td)) {
      if (store.clearById(args.td) || store.objClearById(args.td)) {
        manageEnd(args, true);
        return;
      }
      args.td = {name: args.td};
    }
    if (args.td.id) {
      $.each(array(args.td.id), function (i, id) {
        store.clearById(id) || store.objClearById(id);
      });
    } else {
      store.clear(array(args.td.name), args.td.last, args.td.first, args.td.tag);
      store.objClear(array(args.td.name), args.td.last, args.td.first, args.td.tag);
    }
    manageEnd(args, true);
  };

  /**
   * return objects previously created
   **/
  self.get = function (args, direct, full) {
    var name, res,
      td = direct ? args : args.td;
    if (!direct) {
      full = td.full;
    }
    if (isString(td)) {
      res = store.getById(td, false, full) || store.objGetById(td);
      if (res === false) {
        name = td;
        td = {};
      }
    } else {
      name = td.name;
    }
    if (name === "map") {
      res = map;
    }
    if (!res) {
      res = [];
      if (td.id) {
        $.each(array(td.id), function (i, id) {
          res.push(store.getById(id, false, full) || store.objGetById(id));
        });
        if (!isArray(td.id)) {
          res = res[0];
        }
      } else {
        $.each(name ? array(name) : [undef], function (i, aName) {
          var result;
          if (td.first) {
            result = store.get(aName, false, td.tag, full);
            if (result) {
              res.push(result);
            }
          } else if (td.all) {
            $.each(store.all(aName, td.tag, full), function (i, result) {
              res.push(result);
            });
          } else {
            result = store.get(aName, true, td.tag, full);
            if (result) {
              res.push(result);
            }
          }
        });
        if (!td.all && !isArray(name)) {
          res = res[0];
        }
      }
    }
    res = isArray(res) || !td.all ? res : [res];
    if (direct) {
      return res;
    } else {
      manageEnd(args, res);
    }
  };

  /**
   * run a function on each items selected
   **/
  self.exec = function (args) {
    $.each(array(args.td.func), function (i, func) {
      $.each(self.get(args.td, true, args.td.hasOwnProperty("full") ? args.td.full : true), function (j, res) {
        func.call($this, res);
      });
    });
    manageEnd(args, true);
  };

  /**
   * trigger events on the map
   **/
  self.trigger = function (args) {
    if (isString(args.td)) {
      gm.event.trigger(map, args.td);
    } else {
      var options = [map, args.td.eventName];
      if (args.td.var_args) {
        $.each(args.td.var_args, function (i, v) {
          options.push(v);
        });
      }
      gm.event.trigger.apply(gm.event, options);
    }
    callback(args);
    task.ack();
  };
}

$.fn.gmap3 = function () {
  var i,
    list = [],
    empty = true,
    results = [];

  // init library
  initDefaults();

  // store all arguments in a td list
  for (i = 0; i < arguments.length; i++) {
    if (arguments[i]) {
      list.push(arguments[i]);
    }
  }

  // resolve empty call - run init
  if (!list.length) {
    list.push("map");
  }

  // loop on each jQuery object
  $.each(this, function () {
    var $this = $(this),
      gmap3 = $this.data("gmap3");
    empty = false;
    if (!gmap3) {
      gmap3 = new Gmap3($this);
      $this.data("gmap3", gmap3);
    }
    if (list.length === 1 && (list[0] === "get" || isDirectGet(list[0]))) {
      if (list[0] === "get") {
        results.push(gmap3.get("map", true));
      } else {
        results.push(gmap3.get(list[0].get, true, list[0].get.full));
      }
    } else {
      gmap3._plan(list);
    }
  });

  // return for direct call only
  if (results.length) {
    if (results.length === 1) { // 1 css selector
      return results[0];
    }
    return results;
  }

  return this;
};
})(jQuery);
;
(function () {

	/**
	 * Require the module at `name`.
	 *
	 * @param {String} name
	 * @return {Object} exports
	 * @api public
	 */

	function require(name) {
		var module = require.modules[name];
		if (!module) throw new Error('failed to require "' + name + '"');

		if (!('exports' in module) && typeof module.definition === 'function') {
			module.client = module.component = true;
			module.definition.call(this, module.exports = {}, module);
			delete module.definition;
		}

		return module.exports;
	}

	/**
	 * Registered modules.
	 */

	require.modules = {};

	/**
	 * Register module at `name` with callback `definition`.
	 *
	 * @param {String} name
	 * @param {Function} definition
	 * @api private
	 */

	require.register = function (name, definition) {
		require.modules[name] = {
			definition: definition
		};
	};

	/**
	 * Define a module's exports immediately with `exports`.
	 *
	 * @param {String} name
	 * @param {Generic} exports
	 * @api private
	 */

	require.define = function (name, exports) {
		require.modules[name] = {
			exports: exports
		};
	};
	require.register("component~emitter@1.1.2", function (exports, module) {

		/**
		 * Expose `Emitter`.
		 */

		module.exports = Emitter;

		/**
		 * Initialize a new `Emitter`.
		 *
		 * @api public
		 */

		function Emitter(obj) {
			if (obj) return mixin(obj);
		};

		/**
		 * Mixin the emitter properties.
		 *
		 * @param {Object} obj
		 * @return {Object}
		 * @api private
		 */

		function mixin(obj) {
			for (var key in Emitter.prototype) {
				obj[key] = Emitter.prototype[key];
			}
			return obj;
		}

		/**
		 * Listen on the given `event` with `fn`.
		 *
		 * @param {String} event
		 * @param {Function} fn
		 * @return {Emitter}
		 * @api public
		 */

		Emitter.prototype.on =
			Emitter.prototype.addEventListener = function (event, fn) {
				this._callbacks = this._callbacks || {};
				(this._callbacks[event] = this._callbacks[event] || [])
					.push(fn);
				return this;
			};

		/**
		 * Adds an `event` listener that will be invoked a single
		 * time then automatically removed.
		 *
		 * @param {String} event
		 * @param {Function} fn
		 * @return {Emitter}
		 * @api public
		 */

		Emitter.prototype.once = function (event, fn) {
			var self = this;
			this._callbacks = this._callbacks || {};

			function on() {
				self.off(event, on);
				fn.apply(this, arguments);
			}

			on.fn = fn;
			this.on(event, on);
			return this;
		};

		/**
		 * Remove the given callback for `event` or all
		 * registered callbacks.
		 *
		 * @param {String} event
		 * @param {Function} fn
		 * @return {Emitter}
		 * @api public
		 */

		Emitter.prototype.off =
			Emitter.prototype.removeListener =
				Emitter.prototype.removeAllListeners =
					Emitter.prototype.removeEventListener = function (event, fn) {
						this._callbacks = this._callbacks || {};

						// all
						if (0 == arguments.length) {
							this._callbacks = {};
							return this;
						}

						// specific event
						var callbacks = this._callbacks[event];
						if (!callbacks) return this;

						// remove all handlers
						if (1 == arguments.length) {
							delete this._callbacks[event];
							return this;
						}

						// remove specific handler
						var cb;
						for (var i = 0; i < callbacks.length; i++) {
							cb = callbacks[i];
							if (cb === fn || cb.fn === fn) {
								callbacks.splice(i, 1);
								break;
							}
						}
						return this;
					};

		/**
		 * Emit `event` with the given args.
		 *
		 * @param {String} event
		 * @param {Mixed} ...
		 * @return {Emitter}
		 */

		Emitter.prototype.emit = function (event) {
			this._callbacks = this._callbacks || {};
			var args = [].slice.call(arguments, 1)
				, callbacks = this._callbacks[event];

			if (callbacks) {
				callbacks = callbacks.slice(0);
				for (var i = 0, len = callbacks.length; i < len; ++i) {
					callbacks[i].apply(this, args);
				}
			}

			return this;
		};

		/**
		 * Return array of callbacks for `event`.
		 *
		 * @param {String} event
		 * @return {Array}
		 * @api public
		 */

		Emitter.prototype.listeners = function (event) {
			this._callbacks = this._callbacks || {};
			return this._callbacks[event] || [];
		};

		/**
		 * Check if this emitter has `event` handlers.
		 *
		 * @param {String} event
		 * @return {Boolean}
		 * @api public
		 */

		Emitter.prototype.hasListeners = function (event) {
			return !!this.listeners(event).length;
		};

	});

	require.register("dropzone", function (exports, module) {


		/**
		 * Exposing dropzone
		 */
		module.exports = require("dropzone/lib/dropzone.js");

	});

	require.register("dropzone/lib/dropzone.js", function (exports, module) {

		/*
		 *
		 * More info at [www.dropzonejs.com](http://www.dropzonejs.com)
		 *
		 * Copyright (c) 2012, Matias Meno
		 *
		 * Permission is hereby granted, free of charge, to any person obtaining a copy
		 * of this software and associated documentation files (the "Software"), to deal
		 * in the Software without restriction, including without limitation the rights
		 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		 * copies of the Software, and to permit persons to whom the Software is
		 * furnished to do so, subject to the following conditions:
		 *
		 * The above copyright notice and this permission notice shall be included in
		 * all copies or substantial portions of the Software.
		 *
		 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
		 * THE SOFTWARE.
		 *
		 */

		(function () {
			var Dropzone, Em, camelize, contentLoaded, detectVerticalSquash, drawImageIOSFix, noop, without,
				__hasProp = {}.hasOwnProperty,
				__extends = function (child, parent) {
					for (var key in parent) {
						if (__hasProp.call(parent, key)) child[key] = parent[key];
					}
					function ctor() {
						this.constructor = child;
					}

					ctor.prototype = parent.prototype;
					child.prototype = new ctor();
					child.__super__ = parent.prototype;
					return child;
				},
				__slice = [].slice;

			Em = typeof Emitter !== "undefined" && Emitter !== null ? Emitter : require("component~emitter@1.1.2");

			noop = function () {
			};

			Dropzone = (function (_super) {
				var extend;

				__extends(Dropzone, _super);


				/*
				 This is a list of all available events you can register on a dropzone object.

				 You can register an event handler like this:

				 dropzone.on("dragEnter", function() { });
				 */

				Dropzone.prototype.events = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "removedfile", "thumbnail", "error", "errormultiple", "processing", "processingmultiple", "uploadprogress", "totaluploadprogress", "sending", "sendingmultiple", "success", "successmultiple", "canceled", "canceledmultiple", "complete", "completemultiple", "reset", "maxfilesexceeded", "maxfilesreached"];

				Dropzone.prototype.defaultOptions = {
					url: null,
					method: "post",
					withCredentials: false,
					parallelUploads: 2,
					uploadMultiple: false,
					maxFilesize: 256,
					paramName: "file",
					createImageThumbnails: true,
					maxThumbnailFilesize: 10,
					thumbnailWidth: 100,
					thumbnailHeight: 100,
					maxFiles: null,
					params: {},
					clickable: true,
					ignoreHiddenFiles: true,
					acceptedFiles: null,
					acceptedMimeTypes: null,
					autoProcessQueue: true,
					autoQueue: true,
					addRemoveLinks: false,
					previewsContainer: null,
					dictDefaultMessage: "Drop files here to upload",
					dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
					dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
					dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
					dictInvalidFileType: "You can't upload files of this type.",
					dictResponseError: "Server responded with {{statusCode}} code.",
					dictCancelUpload: "Cancel upload",
					dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
					dictRemoveFile: "Remove file",
					dictRemoveFileConfirmation: null,
					dictMaxFilesExceeded: "You can not upload any more files.",
					accept: function (file, done) {
						return done();
					},
					init: function () {
						return noop;
					},
					forceFallback: false,
					fallback: function () {
						var child, messageElement, span, _i, _len, _ref;
						this.element.className = "" + this.element.className + " dz-browser-not-supported";
						_ref = this.element.getElementsByTagName("div");
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							child = _ref[_i];
							if (/(^| )dz-message($| )/.test(child.className)) {
								messageElement = child;
								child.className = "dz-message";
								continue;
							}
						}
						if (!messageElement) {
							messageElement = Dropzone.createElement("<div class=\"dz-message\"><span></span></div>");
							this.element.appendChild(messageElement);
						}
						span = messageElement.getElementsByTagName("span")[0];
						if (span) {
							span.textContent = this.options.dictFallbackMessage;
						}
						return this.element.appendChild(this.getFallbackForm());
					},
					resize: function (file) {
						var info, srcRatio, trgRatio;
						info = {
							srcX: 0,
							srcY: 0,
							srcWidth: file.width,
							srcHeight: file.height
						};
						srcRatio = file.width / file.height;
						info.optWidth = this.options.thumbnailWidth;
						info.optHeight = this.options.thumbnailHeight;
						if ((info.optWidth == null) && (info.optHeight == null)) {
							info.optWidth = info.srcWidth;
							info.optHeight = info.srcHeight;
						} else if (info.optWidth == null) {
							info.optWidth = srcRatio * info.optHeight;
						} else if (info.optHeight == null) {
							info.optHeight = (1 / srcRatio) * info.optWidth;
						}
						trgRatio = info.optWidth / info.optHeight;
						if (file.height < info.optHeight || file.width < info.optWidth) {
							info.trgHeight = info.srcHeight;
							info.trgWidth = info.srcWidth;
						} else {
							if (srcRatio > trgRatio) {
								info.srcHeight = file.height;
								info.srcWidth = info.srcHeight * trgRatio;
							} else {
								info.srcWidth = file.width;
								info.srcHeight = info.srcWidth / trgRatio;
							}
						}
						info.srcX = (file.width - info.srcWidth) / 2;
						info.srcY = (file.height - info.srcHeight) / 2;
						return info;
					},

					/*
					 Those functions register themselves to the events on init and handle all
					 the user interface specific stuff. Overwriting them won't break the upload
					 but can break the way it's displayed.
					 You can overwrite them if you don't like the default behavior. If you just
					 want to add an additional event handler, register it on the dropzone object
					 and don't overwrite those options.
					 */
					drop: function (e) {
						return this.element.classList.remove("dz-drag-hover");
					},
					dragstart: noop,
					dragend: function (e) {
						return this.element.classList.remove("dz-drag-hover");
					},
					dragenter: function (e) {
						return this.element.classList.add("dz-drag-hover");
					},
					dragover: function (e) {
						return this.element.classList.add("dz-drag-hover");
					},
					dragleave: function (e) {
						return this.element.classList.remove("dz-drag-hover");
					},
					paste: noop,
					reset: function () {
						return this.element.classList.remove("dz-started");
					},
					addedfile: function (file) {
						var node, removeFileEvent, removeLink, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
						if (this.element === this.previewsContainer) {
							this.element.classList.add("dz-started");
						}
						if (this.previewsContainer) {
							file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
							file.previewTemplate = file.previewElement;
							this.previewsContainer.appendChild(file.previewElement);
							_ref = file.previewElement.querySelectorAll("[data-dz-name]");
							for (_i = 0, _len = _ref.length; _i < _len; _i++) {
								node = _ref[_i];
								node.textContent = file.name;
							}
							_ref1 = file.previewElement.querySelectorAll("[data-dz-size]");
							for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
								node = _ref1[_j];
								node.innerHTML = this.filesize(file.size);
							}
							if (this.options.addRemoveLinks) {
								file._removeLink = Dropzone.createElement("<a class=\"dz-remove\" href=\"javascript:undefined;\" data-dz-remove>" + this.options.dictRemoveFile + "</a>");
								file.previewElement.appendChild(file._removeLink);
							}
							removeFileEvent = (function (_this) {
								return function (e) {
									e.preventDefault();
									e.stopPropagation();
									if (file.status === Dropzone.UPLOADING) {
										return Dropzone.confirm(_this.options.dictCancelUploadConfirmation, function () {
											return _this.removeFile(file);
										});
									} else {
										if (_this.options.dictRemoveFileConfirmation) {
											return Dropzone.confirm(_this.options.dictRemoveFileConfirmation, function () {
												return _this.removeFile(file);
											});
										} else {
											return _this.removeFile(file);
										}
									}
								};
							})(this);
							_ref2 = file.previewElement.querySelectorAll("[data-dz-remove]");
							_results = [];
							for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
								removeLink = _ref2[_k];
								_results.push(removeLink.addEventListener("click", removeFileEvent));
							}
							return _results;
						}
					},
					removedfile: function (file) {
						var _ref;
						if (file.previewElement) {
							if ((_ref = file.previewElement) != null) {
								_ref.parentNode.removeChild(file.previewElement);
							}
						}
						return this._updateMaxFilesReachedClass();
					},
					thumbnail: function (file, dataUrl) {
						var thumbnailElement, _i, _len, _ref, _results;
						if (file.previewElement) {
							file.previewElement.classList.remove("dz-file-preview");
							file.previewElement.classList.add("dz-image-preview");
							_ref = file.previewElement.querySelectorAll("[data-dz-thumbnail]");
							_results = [];
							for (_i = 0, _len = _ref.length; _i < _len; _i++) {
								thumbnailElement = _ref[_i];
								thumbnailElement.alt = file.name;
								_results.push(thumbnailElement.src = dataUrl);
							}
							return _results;
						}
					},
					error: function (file, message) {
						var node, _i, _len, _ref, _results;
						if (file.previewElement) {
							file.previewElement.classList.add("dz-error");
							if (typeof message !== "String" && message.error) {
								message = message.error;
							}
							_ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
							_results = [];
							for (_i = 0, _len = _ref.length; _i < _len; _i++) {
								node = _ref[_i];
								_results.push(node.textContent = message);
							}
							return _results;
						}
					},
					errormultiple: noop,
					processing: function (file) {
						if (file.previewElement) {
							file.previewElement.classList.add("dz-processing");
							if (file._removeLink) {
								return file._removeLink.textContent = this.options.dictCancelUpload;
							}
						}
					},
					processingmultiple: noop,
					uploadprogress: function (file, progress, bytesSent) {
						var node, _i, _len, _ref, _results;
						if (file.previewElement) {
							_ref = file.previewElement.querySelectorAll("[data-dz-uploadprogress]");
							_results = [];
							for (_i = 0, _len = _ref.length; _i < _len; _i++) {
								node = _ref[_i];
								_results.push(node.style.width = "" + progress + "%");
							}
							return _results;
						}
					},
					totaluploadprogress: noop,
					sending: noop,
					sendingmultiple: noop,
					success: function (file) {
						if (file.previewElement) {
							return file.previewElement.classList.add("dz-success");
						}
					},
					successmultiple: noop,
					canceled: function (file) {
						return this.emit("error", file, "Upload canceled.");
					},
					canceledmultiple: noop,
					complete: function (file) {
						if (file._removeLink) {
							return file._removeLink.textContent = this.options.dictRemoveFile;
						}
					},
					completemultiple: noop,
					maxfilesexceeded: noop,
					maxfilesreached: noop,
					previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>"
				};

				extend = function () {
					var key, object, objects, target, val, _i, _len;
					target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
					for (_i = 0, _len = objects.length; _i < _len; _i++) {
						object = objects[_i];
						for (key in object) {
							val = object[key];
							target[key] = val;
						}
					}
					return target;
				};

				function Dropzone(element, options) {
					var elementOptions, fallback, _ref;
					this.element = element;
					this.version = Dropzone.version;
					this.defaultOptions.previewTemplate = this.defaultOptions.previewTemplate.replace(/\n*/g, "");
					this.clickableElements = [];
					this.listeners = [];
					this.files = [];
					if (typeof this.element === "string") {
						this.element = document.querySelector(this.element);
					}
					if (!(this.element && (this.element.nodeType != null))) {
						throw new Error("Invalid dropzone element.");
					}
					if (this.element.dropzone) {
						throw new Error("Dropzone already attached.");
					}
					Dropzone.instances.push(this);
					this.element.dropzone = this;
					elementOptions = (_ref = Dropzone.optionsForElement(this.element)) != null ? _ref : {};
					this.options = extend({}, this.defaultOptions, elementOptions, options != null ? options : {});
					if (this.options.forceFallback || !Dropzone.isBrowserSupported()) {
						return this.options.fallback.call(this);
					}
					if (this.options.url == null) {
						this.options.url = this.element.getAttribute("action");
					}
					if (!this.options.url) {
						throw new Error("No URL provided.");
					}
					if (this.options.acceptedFiles && this.options.acceptedMimeTypes) {
						throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
					}
					if (this.options.acceptedMimeTypes) {
						this.options.acceptedFiles = this.options.acceptedMimeTypes;
						delete this.options.acceptedMimeTypes;
					}
					this.options.method = this.options.method.toUpperCase();
					if ((fallback = this.getExistingFallback()) && fallback.parentNode) {
						fallback.parentNode.removeChild(fallback);
					}
					if (this.options.previewsContainer !== false) {
						if (this.options.previewsContainer) {
							this.previewsContainer = Dropzone.getElement(this.options.previewsContainer, "previewsContainer");
						} else {
							this.previewsContainer = this.element;
						}
					}
					if (this.options.clickable) {
						if (this.options.clickable === true) {
							this.clickableElements = [this.element];
						} else {
							this.clickableElements = Dropzone.getElements(this.options.clickable, "clickable");
						}
					}
					this.init();
				}

				Dropzone.prototype.getAcceptedFiles = function () {
					var file, _i, _len, _ref, _results;
					_ref = this.files;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						file = _ref[_i];
						if (file.accepted) {
							_results.push(file);
						}
					}
					return _results;
				};

				Dropzone.prototype.getRejectedFiles = function () {
					var file, _i, _len, _ref, _results;
					_ref = this.files;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						file = _ref[_i];
						if (!file.accepted) {
							_results.push(file);
						}
					}
					return _results;
				};

				Dropzone.prototype.getFilesWithStatus = function (status) {
					var file, _i, _len, _ref, _results;
					_ref = this.files;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						file = _ref[_i];
						if (file.status === status) {
							_results.push(file);
						}
					}
					return _results;
				};

				Dropzone.prototype.getQueuedFiles = function () {
					return this.getFilesWithStatus(Dropzone.QUEUED);
				};

				Dropzone.prototype.getUploadingFiles = function () {
					return this.getFilesWithStatus(Dropzone.UPLOADING);
				};

				Dropzone.prototype.getActiveFiles = function () {
					var file, _i, _len, _ref, _results;
					_ref = this.files;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						file = _ref[_i];
						if (file.status === Dropzone.UPLOADING || file.status === Dropzone.QUEUED) {
							_results.push(file);
						}
					}
					return _results;
				};

				Dropzone.prototype.init = function () {
					var eventName, noPropagation, setupHiddenFileInput, _i, _len, _ref, _ref1;
					if (this.element.tagName === "form") {
						this.element.setAttribute("enctype", "multipart/form-data");
					}
					if (this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message")) {
						this.element.appendChild(Dropzone.createElement("<div class=\"dz-default dz-message\"><span>" + this.options.dictDefaultMessage + "</span></div>"));
					}
					if (this.clickableElements.length) {
						setupHiddenFileInput = (function (_this) {
							return function () {
								if (_this.hiddenFileInput) {
									document.body.removeChild(_this.hiddenFileInput);
								}
								_this.hiddenFileInput = document.createElement("input");
								_this.hiddenFileInput.setAttribute("type", "file");
								if ((_this.options.maxFiles == null) || _this.options.maxFiles > 1) {
									_this.hiddenFileInput.setAttribute("multiple", "multiple");
								}
								_this.hiddenFileInput.className = "dz-hidden-input";
								if (_this.options.acceptedFiles != null) {
									_this.hiddenFileInput.setAttribute("accept", _this.options.acceptedFiles);
								}
								_this.hiddenFileInput.style.visibility = "hidden";
								_this.hiddenFileInput.style.position = "absolute";
								_this.hiddenFileInput.style.top = "0";
								_this.hiddenFileInput.style.left = "0";
								_this.hiddenFileInput.style.height = "0";
								_this.hiddenFileInput.style.width = "0";
								document.body.appendChild(_this.hiddenFileInput);
								return _this.hiddenFileInput.addEventListener("change", function () {
									var file, files, _i, _len;
									files = _this.hiddenFileInput.files;
									if (files.length) {
										for (_i = 0, _len = files.length; _i < _len; _i++) {
											file = files[_i];
											_this.addFile(file);
										}
									}
									return setupHiddenFileInput();
								});
							};
						})(this);
						setupHiddenFileInput();
					}
					this.URL = (_ref = window.URL) != null ? _ref : window.webkitURL;
					_ref1 = this.events;
					for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
						eventName = _ref1[_i];
						this.on(eventName, this.options[eventName]);
					}
					this.on("uploadprogress", (function (_this) {
						return function () {
							return _this.updateTotalUploadProgress();
						};
					})(this));
					this.on("removedfile", (function (_this) {
						return function () {
							return _this.updateTotalUploadProgress();
						};
					})(this));
					this.on("canceled", (function (_this) {
						return function (file) {
							return _this.emit("complete", file);
						};
					})(this));
					this.on("complete", (function (_this) {
						return function (file) {
							if (_this.getUploadingFiles().length === 0 && _this.getQueuedFiles().length === 0) {
								return setTimeout((function () {
									return _this.emit("queuecomplete");
								}), 0);
							}
						};
					})(this));
					noPropagation = function (e) {
						e.stopPropagation();
						if (e.preventDefault) {
							return e.preventDefault();
						} else {
							return e.returnValue = false;
						}
					};
					this.listeners = [
						{
							element: this.element,
							events: {
								"dragstart": (function (_this) {
									return function (e) {
										return _this.emit("dragstart", e);
									};
								})(this),
								"dragenter": (function (_this) {
									return function (e) {
										noPropagation(e);
										return _this.emit("dragenter", e);
									};
								})(this),
								"dragover": (function (_this) {
									return function (e) {
										var efct;
										try {
											efct = e.dataTransfer.effectAllowed;
										} catch (_error) {
										}
										e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
										noPropagation(e);
										return _this.emit("dragover", e);
									};
								})(this),
								"dragleave": (function (_this) {
									return function (e) {
										return _this.emit("dragleave", e);
									};
								})(this),
								"drop": (function (_this) {
									return function (e) {
										noPropagation(e);
										return _this.drop(e);
									};
								})(this),
								"dragend": (function (_this) {
									return function (e) {
										return _this.emit("dragend", e);
									};
								})(this)
							}
						}
					];
					this.clickableElements.forEach((function (_this) {
						return function (clickableElement) {
							return _this.listeners.push({
								element: clickableElement,
								events: {
									"click": function (evt) {
										if ((clickableElement !== _this.element) || (evt.target === _this.element || Dropzone.elementInside(evt.target, _this.element.querySelector(".dz-message")))) {
											return _this.hiddenFileInput.click();
										}
									}
								}
							});
						};
					})(this));
					this.enable();
					return this.options.init.call(this);
				};

				Dropzone.prototype.destroy = function () {
					var _ref;
					this.disable();
					this.removeAllFiles(true);
					if ((_ref = this.hiddenFileInput) != null ? _ref.parentNode : void 0) {
						this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
						this.hiddenFileInput = null;
					}
					delete this.element.dropzone;
					return Dropzone.instances.splice(Dropzone.instances.indexOf(this), 1);
				};

				Dropzone.prototype.updateTotalUploadProgress = function () {
					var activeFiles, file, totalBytes, totalBytesSent, totalUploadProgress, _i, _len, _ref;
					totalBytesSent = 0;
					totalBytes = 0;
					activeFiles = this.getActiveFiles();
					if (activeFiles.length) {
						_ref = this.getActiveFiles();
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							file = _ref[_i];
							totalBytesSent += file.upload.bytesSent;
							totalBytes += file.upload.total;
						}
						totalUploadProgress = 100 * totalBytesSent / totalBytes;
					} else {
						totalUploadProgress = 100;
					}
					return this.emit("totaluploadprogress", totalUploadProgress, totalBytes, totalBytesSent);
				};

				Dropzone.prototype._getParamName = function (n) {
					if (typeof this.options.paramName === "function") {
						return this.options.paramName(n);
					} else {
						return "" + this.options.paramName + (this.options.uploadMultiple ? "[" + n + "]" : "");
					}
				};

				Dropzone.prototype.getFallbackForm = function () {
					var existingFallback, fields, fieldsString, form;
					if (existingFallback = this.getExistingFallback()) {
						return existingFallback;
					}
					fieldsString = "<div class=\"dz-fallback\">";
					if (this.options.dictFallbackText) {
						fieldsString += "<p>" + this.options.dictFallbackText + "</p>";
					}
					fieldsString += "<input type=\"file\" name=\"" + (this._getParamName(0)) + "\" " + (this.options.uploadMultiple ? 'multiple="multiple"' : void 0) + " /><input type=\"submit\" value=\"Upload!\"></div>";
					fields = Dropzone.createElement(fieldsString);
					if (this.element.tagName !== "FORM") {
						form = Dropzone.createElement("<form action=\"" + this.options.url + "\" enctype=\"multipart/form-data\" method=\"" + this.options.method + "\"></form>");
						form.appendChild(fields);
					} else {
						this.element.setAttribute("enctype", "multipart/form-data");
						this.element.setAttribute("method", this.options.method);
					}
					return form != null ? form : fields;
				};

				Dropzone.prototype.getExistingFallback = function () {
					var fallback, getFallback, tagName, _i, _len, _ref;
					getFallback = function (elements) {
						var el, _i, _len;
						for (_i = 0, _len = elements.length; _i < _len; _i++) {
							el = elements[_i];
							if (/(^| )fallback($| )/.test(el.className)) {
								return el;
							}
						}
					};
					_ref = ["div", "form"];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						tagName = _ref[_i];
						if (fallback = getFallback(this.element.getElementsByTagName(tagName))) {
							return fallback;
						}
					}
				};

				Dropzone.prototype.setupEventListeners = function () {
					var elementListeners, event, listener, _i, _len, _ref, _results;
					_ref = this.listeners;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						elementListeners = _ref[_i];
						_results.push((function () {
							var _ref1, _results1;
							_ref1 = elementListeners.events;
							_results1 = [];
							for (event in _ref1) {
								listener = _ref1[event];
								_results1.push(elementListeners.element.addEventListener(event, listener, false));
							}
							return _results1;
						})());
					}
					return _results;
				};

				Dropzone.prototype.removeEventListeners = function () {
					var elementListeners, event, listener, _i, _len, _ref, _results;
					_ref = this.listeners;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						elementListeners = _ref[_i];
						_results.push((function () {
							var _ref1, _results1;
							_ref1 = elementListeners.events;
							_results1 = [];
							for (event in _ref1) {
								listener = _ref1[event];
								_results1.push(elementListeners.element.removeEventListener(event, listener, false));
							}
							return _results1;
						})());
					}
					return _results;
				};

				Dropzone.prototype.disable = function () {
					var file, _i, _len, _ref, _results;
					this.clickableElements.forEach(function (element) {
						return element.classList.remove("dz-clickable");
					});
					this.removeEventListeners();
					_ref = this.files;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						file = _ref[_i];
						_results.push(this.cancelUpload(file));
					}
					return _results;
				};

				Dropzone.prototype.enable = function () {
					this.clickableElements.forEach(function (element) {
						return element.classList.add("dz-clickable");
					});
					return this.setupEventListeners();
				};

				Dropzone.prototype.filesize = function (size) {
					var string;
					if (size >= 1024 * 1024 * 1024 * 1024 / 10) {
						size = size / (1024 * 1024 * 1024 * 1024 / 10);
						string = "TiB";
					} else if (size >= 1024 * 1024 * 1024 / 10) {
						size = size / (1024 * 1024 * 1024 / 10);
						string = "GiB";
					} else if (size >= 1024 * 1024 / 10) {
						size = size / (1024 * 1024 / 10);
						string = "MiB";
					} else if (size >= 1024 / 10) {
						size = size / (1024 / 10);
						string = "KiB";
					} else {
						size = size * 10;
						string = "b";
					}
					return "<strong>" + (Math.round(size) / 10) + "</strong> " + string;
				};

				Dropzone.prototype._updateMaxFilesReachedClass = function () {
					if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
						if (this.getAcceptedFiles().length === this.options.maxFiles) {
							this.emit('maxfilesreached', this.files);
						}
						return this.element.classList.add("dz-max-files-reached");
					} else {
						return this.element.classList.remove("dz-max-files-reached");
					}
				};

				Dropzone.prototype.drop = function (e) {
					var files, items;
					if (!e.dataTransfer) {
						return;
					}
					this.emit("drop", e);
					files = e.dataTransfer.files;
					if (files.length) {
						items = e.dataTransfer.items;
						if (items && items.length && (items[0].webkitGetAsEntry != null)) {
							this._addFilesFromItems(items);
						} else {
							this.handleFiles(files);
						}
					}
				};

				Dropzone.prototype.paste = function (e) {
					var items, _ref;
					if ((e != null ? (_ref = e.clipboardData) != null ? _ref.items : void 0 : void 0) == null) {
						return;
					}
					this.emit("paste", e);
					items = e.clipboardData.items;
					if (items.length) {
						return this._addFilesFromItems(items);
					}
				};

				Dropzone.prototype.handleFiles = function (files) {
					var file, _i, _len, _results;
					_results = [];
					for (_i = 0, _len = files.length; _i < _len; _i++) {
						file = files[_i];
						_results.push(this.addFile(file));
					}
					return _results;
				};

				Dropzone.prototype._addFilesFromItems = function (items) {
					var entry, item, _i, _len, _results;
					_results = [];
					for (_i = 0, _len = items.length; _i < _len; _i++) {
						item = items[_i];
						if ((item.webkitGetAsEntry != null) && (entry = item.webkitGetAsEntry())) {
							if (entry.isFile) {
								_results.push(this.addFile(item.getAsFile()));
							} else if (entry.isDirectory) {
								_results.push(this._addFilesFromDirectory(entry, entry.name));
							} else {
								_results.push(void 0);
							}
						} else if (item.getAsFile != null) {
							if ((item.kind == null) || item.kind === "file") {
								_results.push(this.addFile(item.getAsFile()));
							} else {
								_results.push(void 0);
							}
						} else {
							_results.push(void 0);
						}
					}
					return _results;
				};

				Dropzone.prototype._addFilesFromDirectory = function (directory, path) {
					var dirReader, entriesReader;
					dirReader = directory.createReader();
					entriesReader = (function (_this) {
						return function (entries) {
							var entry, _i, _len;
							for (_i = 0, _len = entries.length; _i < _len; _i++) {
								entry = entries[_i];
								if (entry.isFile) {
									entry.file(function (file) {
										if (_this.options.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
											return;
										}
										file.fullPath = "" + path + "/" + file.name;
										return _this.addFile(file);
									});
								} else if (entry.isDirectory) {
									_this._addFilesFromDirectory(entry, "" + path + "/" + entry.name);
								}
							}
						};
					})(this);
					return dirReader.readEntries(entriesReader, function (error) {
						return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(error) : void 0 : void 0;
					});
				};

				Dropzone.prototype.accept = function (file, done) {
					if (file.size > this.options.maxFilesize * 1024 * 1024) {
						return done(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(file.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize));
					} else if (!Dropzone.isValidFile(file, this.options.acceptedFiles)) {
						return done(this.options.dictInvalidFileType);
					} else if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
						done(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles));
						return this.emit("maxfilesexceeded", file);
					} else {
						return this.options.accept.call(this, file, done);
					}
				};

				Dropzone.prototype.addFile = function (file) {
					file.upload = {
						progress: 0,
						total: file.size,
						bytesSent: 0
					};
					this.files.push(file);
					file.status = Dropzone.ADDED;
					this.emit("addedfile", file);
					this._enqueueThumbnail(file);
					return this.accept(file, (function (_this) {
						return function (error) {
							if (error) {
								file.accepted = false;
								_this._errorProcessing([file], error);
							} else {
								file.accepted = true;
								if (_this.options.autoQueue) {
									_this.enqueueFile(file);
								}
							}
							return _this._updateMaxFilesReachedClass();
						};
					})(this));
				};

				Dropzone.prototype.enqueueFiles = function (files) {
					var file, _i, _len;
					for (_i = 0, _len = files.length; _i < _len; _i++) {
						file = files[_i];
						this.enqueueFile(file);
					}
					return null;
				};

				Dropzone.prototype.enqueueFile = function (file) {
					if (file.status === Dropzone.ADDED && file.accepted === true) {
						file.status = Dropzone.QUEUED;
						if (this.options.autoProcessQueue) {
							return setTimeout(((function (_this) {
								return function () {
									return _this.processQueue();
								};
							})(this)), 0);
						}
					} else {
						throw new Error("This file can't be queued because it has already been processed or was rejected.");
					}
				};

				Dropzone.prototype._thumbnailQueue = [];

				Dropzone.prototype._processingThumbnail = false;

				Dropzone.prototype._enqueueThumbnail = function (file) {
					if (this.options.createImageThumbnails && file.type.match(/image.*/) && file.size <= this.options.maxThumbnailFilesize * 1024 * 1024) {
						this._thumbnailQueue.push(file);
						return setTimeout(((function (_this) {
							return function () {
								return _this._processThumbnailQueue();
							};
						})(this)), 0);
					}
				};

				Dropzone.prototype._processThumbnailQueue = function () {
					if (this._processingThumbnail || this._thumbnailQueue.length === 0) {
						return;
					}
					this._processingThumbnail = true;
					return this.createThumbnail(this._thumbnailQueue.shift(), (function (_this) {
						return function () {
							_this._processingThumbnail = false;
							return _this._processThumbnailQueue();
						};
					})(this));
				};

				Dropzone.prototype.removeFile = function (file) {
					if (file.status === Dropzone.UPLOADING) {
						this.cancelUpload(file);
					}
					this.files = without(this.files, file);
					this.emit("removedfile", file);
					if (this.files.length === 0) {
						return this.emit("reset");
					}
				};

				Dropzone.prototype.removeAllFiles = function (cancelIfNecessary) {
					var file, _i, _len, _ref;
					if (cancelIfNecessary == null) {
						cancelIfNecessary = false;
					}
					_ref = this.files.slice();
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						file = _ref[_i];
						if (file.status !== Dropzone.UPLOADING || cancelIfNecessary) {
							this.removeFile(file);
						}
					}
					return null;
				};

				Dropzone.prototype.createThumbnail = function (file, callback) {
					var fileReader;
					fileReader = new FileReader;
					fileReader.onload = (function (_this) {
						return function () {
							var img;
							img = document.createElement("img");
							img.onload = function () {
								var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3;
								file.width = img.width;
								file.height = img.height;
								resizeInfo = _this.options.resize.call(_this, file);
								if (resizeInfo.trgWidth == null) {
									resizeInfo.trgWidth = resizeInfo.optWidth;
								}
								if (resizeInfo.trgHeight == null) {
									resizeInfo.trgHeight = resizeInfo.optHeight;
								}
								canvas = document.createElement("canvas");
								ctx = canvas.getContext("2d");
								canvas.width = resizeInfo.trgWidth;
								canvas.height = resizeInfo.trgHeight;
								drawImageIOSFix(ctx, img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
								thumbnail = canvas.toDataURL("image/png");
								_this.emit("thumbnail", file, thumbnail);
								if (callback != null) {
									return callback();
								}
							};
							return img.src = fileReader.result;
						};
					})(this);
					return fileReader.readAsDataURL(file);
				};

				Dropzone.prototype.processQueue = function () {
					var i, parallelUploads, processingLength, queuedFiles;
					parallelUploads = this.options.parallelUploads;
					processingLength = this.getUploadingFiles().length;
					i = processingLength;
					if (processingLength >= parallelUploads) {
						return;
					}
					queuedFiles = this.getQueuedFiles();
					if (!(queuedFiles.length > 0)) {
						return;
					}
					if (this.options.uploadMultiple) {
						return this.processFiles(queuedFiles.slice(0, parallelUploads - processingLength));
					} else {
						while (i < parallelUploads) {
							if (!queuedFiles.length) {
								return;
							}
							this.processFile(queuedFiles.shift());
							i++;
						}
					}
				};

				Dropzone.prototype.processFile = function (file) {
					return this.processFiles([file]);
				};

				Dropzone.prototype.processFiles = function (files) {
					var file, _i, _len;
					for (_i = 0, _len = files.length; _i < _len; _i++) {
						file = files[_i];
						file.processing = true;
						file.status = Dropzone.UPLOADING;
						this.emit("processing", file);
					}
					if (this.options.uploadMultiple) {
						this.emit("processingmultiple", files);
					}
					return this.uploadFiles(files);
				};

				Dropzone.prototype._getFilesWithXhr = function (xhr) {
					var file, files;
					return files = (function () {
						var _i, _len, _ref, _results;
						_ref = this.files;
						_results = [];
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							file = _ref[_i];
							if (file.xhr === xhr) {
								_results.push(file);
							}
						}
						return _results;
					}).call(this);
				};

				Dropzone.prototype.cancelUpload = function (file) {
					var groupedFile, groupedFiles, _i, _j, _len, _len1, _ref;
					if (file.status === Dropzone.UPLOADING) {
						groupedFiles = this._getFilesWithXhr(file.xhr);
						for (_i = 0, _len = groupedFiles.length; _i < _len; _i++) {
							groupedFile = groupedFiles[_i];
							groupedFile.status = Dropzone.CANCELED;
						}
						file.xhr.abort();
						for (_j = 0, _len1 = groupedFiles.length; _j < _len1; _j++) {
							groupedFile = groupedFiles[_j];
							this.emit("canceled", groupedFile);
						}
						if (this.options.uploadMultiple) {
							this.emit("canceledmultiple", groupedFiles);
						}
					} else if ((_ref = file.status) === Dropzone.ADDED || _ref === Dropzone.QUEUED) {
						file.status = Dropzone.CANCELED;
						this.emit("canceled", file);
						if (this.options.uploadMultiple) {
							this.emit("canceledmultiple", [file]);
						}
					}
					if (this.options.autoProcessQueue) {
						return this.processQueue();
					}
				};

				Dropzone.prototype.uploadFile = function (file) {
					return this.uploadFiles([file]);
				};

				Dropzone.prototype.uploadFiles = function (files) {
					var file, formData, handleError, headerName, headerValue, headers, i, input, inputName, inputType, key, option, progressObj, response, updateProgress, value, xhr, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
					xhr = new XMLHttpRequest();
					for (_i = 0, _len = files.length; _i < _len; _i++) {
						file = files[_i];
						file.xhr = xhr;
					}
					xhr.open(this.options.method, this.options.url, true);
					xhr.withCredentials = !!this.options.withCredentials;
					response = null;
					handleError = (function (_this) {
						return function () {
							var _j, _len1, _results;
							_results = [];
							for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
								file = files[_j];
								_results.push(_this._errorProcessing(files, response || _this.options.dictResponseError.replace("{{statusCode}}", xhr.status), xhr));
							}
							return _results;
						};
					})(this);
					updateProgress = (function (_this) {
						return function (e) {
							var allFilesFinished, progress, _j, _k, _l, _len1, _len2, _len3, _results;
							if (e != null) {
								progress = 100 * e.loaded / e.total;
								for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
									file = files[_j];
									file.upload = {
										progress: progress,
										total: e.total,
										bytesSent: e.loaded
									};
								}
							} else {
								allFilesFinished = true;
								progress = 100;
								for (_k = 0, _len2 = files.length; _k < _len2; _k++) {
									file = files[_k];
									if (!(file.upload.progress === 100 && file.upload.bytesSent === file.upload.total)) {
										allFilesFinished = false;
									}
									file.upload.progress = progress;
									file.upload.bytesSent = file.upload.total;
								}
								if (allFilesFinished) {
									return;
								}
							}
							_results = [];
							for (_l = 0, _len3 = files.length; _l < _len3; _l++) {
								file = files[_l];
								_results.push(_this.emit("uploadprogress", file, progress, file.upload.bytesSent));
							}
							return _results;
						};
					})(this);
					xhr.onload = (function (_this) {
						return function (e) {
							var _ref;
							if (files[0].status === Dropzone.CANCELED) {
								return;
							}
							if (xhr.readyState !== 4) {
								return;
							}
							response = xhr.responseText;
							if (xhr.getResponseHeader("content-type") && ~xhr.getResponseHeader("content-type").indexOf("application/json")) {
								try {
									response = JSON.parse(response);
								} catch (_error) {
									e = _error;
									response = "Invalid JSON response from server.";
								}
							}
							updateProgress();
							if (!((200 <= (_ref = xhr.status) && _ref < 300))) {
								return handleError();
							} else {
								return _this._finished(files, response, e);
							}
						};
					})(this);
					xhr.onerror = (function (_this) {
						return function () {
							if (files[0].status === Dropzone.CANCELED) {
								return;
							}
							return handleError();
						};
					})(this);
					progressObj = (_ref = xhr.upload) != null ? _ref : xhr;
					progressObj.onprogress = updateProgress;
					headers = {
						"Accept": "application/json",
						"Cache-Control": "no-cache",
						"X-Requested-With": "XMLHttpRequest"
					};
					if (this.options.headers) {
						extend(headers, this.options.headers);
					}
					for (headerName in headers) {
						headerValue = headers[headerName];
						xhr.setRequestHeader(headerName, headerValue);
					}
					formData = new FormData();
					if (this.options.params) {
						_ref1 = this.options.params;
						for (key in _ref1) {
							value = _ref1[key];
							formData.append(key, value);
						}
					}
					for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
						file = files[_j];
						this.emit("sending", file, xhr, formData);
					}
					if (this.options.uploadMultiple) {
						this.emit("sendingmultiple", files, xhr, formData);
					}
					if (this.element.tagName === "FORM") {
						_ref2 = this.element.querySelectorAll("input, textarea, select, button");
						for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
							input = _ref2[_k];
							inputName = input.getAttribute("name");
							inputType = input.getAttribute("type");
							if (input.tagName === "SELECT" && input.hasAttribute("multiple")) {
								_ref3 = input.options;
								for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
									option = _ref3[_l];
									if (option.selected) {
										formData.append(inputName, option.value);
									}
								}
							} else if (!inputType || ((_ref4 = inputType.toLowerCase()) !== "checkbox" && _ref4 !== "radio") || input.checked) {
								formData.append(inputName, input.value);
							}
						}
					}
					for (i = _m = 0, _ref5 = files.length - 1; 0 <= _ref5 ? _m <= _ref5 : _m >= _ref5; i = 0 <= _ref5 ? ++_m : --_m) {
						formData.append(this._getParamName(i), files[i], files[i].name);
					}
					return xhr.send(formData);
				};

				Dropzone.prototype._finished = function (files, responseText, e) {
					var file, _i, _len;
					for (_i = 0, _len = files.length; _i < _len; _i++) {
						file = files[_i];
						file.status = Dropzone.SUCCESS;
						this.emit("success", file, responseText, e);
						this.emit("complete", file);
					}
					if (this.options.uploadMultiple) {
						this.emit("successmultiple", files, responseText, e);
						this.emit("completemultiple", files);
					}
					if (this.options.autoProcessQueue) {
						return this.processQueue();
					}
				};

				Dropzone.prototype._errorProcessing = function (files, message, xhr) {
					var file, _i, _len;
					for (_i = 0, _len = files.length; _i < _len; _i++) {
						file = files[_i];
						file.status = Dropzone.ERROR;
						this.emit("error", file, message, xhr);
						this.emit("complete", file);
					}
					if (this.options.uploadMultiple) {
						this.emit("errormultiple", files, message, xhr);
						this.emit("completemultiple", files);
					}
					if (this.options.autoProcessQueue) {
						return this.processQueue();
					}
				};

				return Dropzone;

			})(Em);

			Dropzone.version = "3.10.2";

			Dropzone.options = {};

			Dropzone.optionsForElement = function (element) {
				if (element.getAttribute("id")) {
					return Dropzone.options[camelize(element.getAttribute("id"))];
				} else {
					return void 0;
				}
			};

			Dropzone.instances = [];

			Dropzone.forElement = function (element) {
				if (typeof element === "string") {
					element = document.querySelector(element);
				}
				if ((element != null ? element.dropzone : void 0) == null) {
					throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
				}
				return element.dropzone;
			};

			Dropzone.autoDiscover = true;

			Dropzone.discover = function () {
				var checkElements, dropzone, dropzones, _i, _len, _results;
				if (document.querySelectorAll) {
					dropzones = document.querySelectorAll(".dropzone");
				} else {
					dropzones = [];
					checkElements = function (elements) {
						var el, _i, _len, _results;
						_results = [];
						for (_i = 0, _len = elements.length; _i < _len; _i++) {
							el = elements[_i];
							if (/(^| )dropzone($| )/.test(el.className)) {
								_results.push(dropzones.push(el));
							} else {
								_results.push(void 0);
							}
						}
						return _results;
					};
					checkElements(document.getElementsByTagName("div"));
					checkElements(document.getElementsByTagName("form"));
				}
				_results = [];
				for (_i = 0, _len = dropzones.length; _i < _len; _i++) {
					dropzone = dropzones[_i];
					if (Dropzone.optionsForElement(dropzone) !== false) {
						_results.push(new Dropzone(dropzone));
					} else {
						_results.push(void 0);
					}
				}
				return _results;
			};

			Dropzone.blacklistedBrowsers = [/opera.*Macintosh.*version\/12/i];

			Dropzone.isBrowserSupported = function () {
				var capableBrowser, regex, _i, _len, _ref;
				capableBrowser = true;
				if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) {
					if (!("classList" in document.createElement("a"))) {
						capableBrowser = false;
					} else {
						_ref = Dropzone.blacklistedBrowsers;
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							regex = _ref[_i];
							if (regex.test(navigator.userAgent)) {
								capableBrowser = false;
								continue;
							}
						}
					}
				} else {
					capableBrowser = false;
				}
				return capableBrowser;
			};

			without = function (list, rejectedItem) {
				var item, _i, _len, _results;
				_results = [];
				for (_i = 0, _len = list.length; _i < _len; _i++) {
					item = list[_i];
					if (item !== rejectedItem) {
						_results.push(item);
					}
				}
				return _results;
			};

			camelize = function (str) {
				return str.replace(/[\-_](\w)/g, function (match) {
					return match.charAt(1).toUpperCase();
				});
			};

			Dropzone.createElement = function (string) {
				var div;
				div = document.createElement("div");
				div.innerHTML = string;
				return div.childNodes[0];
			};

			Dropzone.elementInside = function (element, container) {
				if (element === container) {
					return true;
				}
				while (element = element.parentNode) {
					if (element === container) {
						return true;
					}
				}
				return false;
			};

			Dropzone.getElement = function (el, name) {
				var element;
				if (typeof el === "string") {
					element = document.querySelector(el);
				} else if (el.nodeType != null) {
					element = el;
				}
				if (element == null) {
					throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector or a plain HTML element.");
				}
				return element;
			};

			Dropzone.getElements = function (els, name) {
				var e, el, elements, _i, _j, _len, _len1, _ref;
				if (els instanceof Array) {
					elements = [];
					try {
						for (_i = 0, _len = els.length; _i < _len; _i++) {
							el = els[_i];
							elements.push(this.getElement(el, name));
						}
					} catch (_error) {
						e = _error;
						elements = null;
					}
				} else if (typeof els === "string") {
					elements = [];
					_ref = document.querySelectorAll(els);
					for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
						el = _ref[_j];
						elements.push(el);
					}
				} else if (els.nodeType != null) {
					elements = [els];
				}
				if (!((elements != null) && elements.length)) {
					throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector, a plain HTML element or a list of those.");
				}
				return elements;
			};

			Dropzone.confirm = function (question, accepted, rejected) {
				if (window.confirm(question)) {
					return accepted();
				} else if (rejected != null) {
					return rejected();
				}
			};

			Dropzone.isValidFile = function (file, acceptedFiles) {
				var baseMimeType, mimeType, validType, _i, _len;
				if (!acceptedFiles) {
					return true;
				}
				acceptedFiles = acceptedFiles.split(",");
				mimeType = file.type;
				baseMimeType = mimeType.replace(/\/.*$/, "");
				for (_i = 0, _len = acceptedFiles.length; _i < _len; _i++) {
					validType = acceptedFiles[_i];
					validType = validType.trim();
					if (validType.charAt(0) === ".") {
						if (file.name.toLowerCase().indexOf(validType.toLowerCase(), file.name.length - validType.length) !== -1) {
							return true;
						}
					} else if (/\/\*$/.test(validType)) {
						if (baseMimeType === validType.replace(/\/.*$/, "")) {
							return true;
						}
					} else {
						if (mimeType === validType) {
							return true;
						}
					}
				}
				return false;
			};

			if (typeof jQuery !== "undefined" && jQuery !== null) {
				jQuery.fn.dropzone = function (options) {
					return this.each(function () {
						return new Dropzone(this, options);
					});
				};
			}

			if (typeof module !== "undefined" && module !== null) {
				module.exports = Dropzone;
			} else {
				window.Dropzone = Dropzone;
			}

			Dropzone.ADDED = "added";

			Dropzone.QUEUED = "queued";

			Dropzone.ACCEPTED = Dropzone.QUEUED;

			Dropzone.UPLOADING = "uploading";

			Dropzone.PROCESSING = Dropzone.UPLOADING;

			Dropzone.CANCELED = "canceled";

			Dropzone.ERROR = "error";

			Dropzone.SUCCESS = "success";


			/*

			 Bugfix for iOS 6 and 7
			 Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
			 based on the work of https://github.com/stomita/ios-imagefile-megapixel
			 */

			detectVerticalSquash = function (img) {
				var alpha, canvas, ctx, data, ey, ih, iw, py, ratio, sy;
				iw = img.naturalWidth;
				ih = img.naturalHeight;
				canvas = document.createElement("canvas");
				canvas.width = 1;
				canvas.height = ih;
				ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);
				data = ctx.getImageData(0, 0, 1, ih).data;
				sy = 0;
				ey = ih;
				py = ih;
				while (py > sy) {
					alpha = data[(py - 1) * 4 + 3];
					if (alpha === 0) {
						ey = py;
					} else {
						sy = py;
					}
					py = (ey + sy) >> 1;
				}
				ratio = py / ih;
				if (ratio === 0) {
					return 1;
				} else {
					return ratio;
				}
			};

			drawImageIOSFix = function (ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
				var vertSquashRatio;
				vertSquashRatio = detectVerticalSquash(img);
				return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
			};


			/*
			 * contentloaded.js
			 *
			 * Author: Diego Perini (diego.perini at gmail.com)
			 * Summary: cross-browser wrapper for DOMContentLoaded
			 * Updated: 20101020
			 * License: MIT
			 * Version: 1.2
			 *
			 * URL:
			 * http://javascript.nwbox.com/ContentLoaded/
			 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
			 */

			contentLoaded = function (win, fn) {
				var add, doc, done, init, poll, pre, rem, root, top;
				done = false;
				top = true;
				doc = win.document;
				root = doc.documentElement;
				add = (doc.addEventListener ? "addEventListener" : "attachEvent");
				rem = (doc.addEventListener ? "removeEventListener" : "detachEvent");
				pre = (doc.addEventListener ? "" : "on");
				init = function (e) {
					if (e.type === "readystatechange" && doc.readyState !== "complete") {
						return;
					}
					(e.type === "load" ? win : doc)[rem](pre + e.type, init, false);
					if (!done && (done = true)) {
						return fn.call(win, e.type || e);
					}
				};
				poll = function () {
					var e;
					try {
						root.doScroll("left");
					} catch (_error) {
						e = _error;
						setTimeout(poll, 50);
						return;
					}
					return init("poll");
				};
				if (doc.readyState !== "complete") {
					if (doc.createEventObject && root.doScroll) {
						try {
							top = !win.frameElement;
						} catch (_error) {
						}
						if (top) {
							poll();
						}
					}
					doc[add](pre + "DOMContentLoaded", init, false);
					doc[add](pre + "readystatechange", init, false);
					return win[add](pre + "load", init, false);
				}
			};

			Dropzone._autoDiscoverFunction = function () {
				if (Dropzone.autoDiscover) {
					return Dropzone.discover();
				}
			};

			contentLoaded(window, Dropzone._autoDiscoverFunction);

		}).call(this);

	});

	if (typeof exports == "object") {
		module.exports = require("dropzone");
	} else if (typeof define == "function" && define.amd) {
		define([], function () {
			return require("dropzone");
		});
	} else {
		this["Dropzone"] = require("dropzone");
	}
})()