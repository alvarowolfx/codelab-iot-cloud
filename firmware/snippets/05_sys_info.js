load("api_events.js");
load("api_net.js");
load("api_sys.js");

Sys.uptime();

// Add to getInfo()
let msg = {
  total_ram: Sys.total_ram(),
  free_ram: Sys.free_ram()
};

// Monitor network connectivity.
Event.addGroupHandler(
  Net.EVENT_GRP,
  function(ev, evdata, arg) {
    let evs = "???";
    if (ev === Net.STATUS_DISCONNECTED) {
      evs = "DISCONNECTED";
    } else if (ev === Net.STATUS_CONNECTING) {
      evs = "CONNECTING";
    } else if (ev === Net.STATUS_CONNECTED) {
      evs = "CONNECTED";
    } else if (ev === Net.STATUS_GOT_IP) {
      evs = "GOT_IP";
    }
    print("== Net event:", ev, evs);
  },
  null
);
