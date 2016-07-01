# SocketIO - mobile controller

A Node.js server that creates a desktop client which connects to multiple mobile phones as player controls.

### Usage

Navigate to ``http://<YOUR_LOCAL_IP>:8080`` on the screen you would like to connect to. Then, on your mobile device, connect to `http://<YOUR_LOCAL_IP>:8080/mobile.html?id=<ROOM_ID>``.

Controls:
 - To move around, tilt your mobile device.
 - To change your color, tap/swipe on the gray area on your mobile device.
 - To make your mobile device vibrate, hold down on the gray area on your mobile device.

### Device APIs

Device API's include:
  - Geolocation
  - Orientation
  - Battery
  - Device Light
  - Ambient Light
  - Device Proximity
  - User Proximity
  - Vibration
