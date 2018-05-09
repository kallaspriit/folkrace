# Folkrace

**Folkrace autonomous robot project.**

Project resources for building an autonomous tracked vehicle controlled by an Android smartphone over bluetooth.

The robot gets it's main navigational information from a cheap LIDAR.

## Rules

* Track
  * Field is black
  * Walls are white
  * Walls are 120mm high (±10mm)
  * Trajectory is smooth and closed
  * Track width is between 1000-1200mm
* Obstacles
  * Humps
  * Perpendicular wall (max 150mm wide)
  * Extrusions (about 10mm high, 40mm wide)
  * Holes (max 30mm deep)
  * Sponges (min 120mm diameter)
  * Posts (min 15mm, actually around 60mm diameter)
* Robot
  * Autonomous
  * Max dimensions 150x200mm
  * Max weight 1000g
  * Height not limited
  * Has a start button
  * Starts 5 seconds after start button is pressed
* Competition
  * Every lap in the right direction gives one point
  * Every lap in the wrong direction subtracts one point
  * One round is 3 minutes long
  * Up to 5 robots in a single race
  * 3 races in each group

## Bluetooth setup

Hook up the bluetooth module to an USB to UART (or through mbed etc) at 9600 baudrate by default (for HC-06).

HC-06 default bluetooth pin is `1234` but for executing the AT commands, it should *not* be connected to.

Send the following commands without any line delimiters.

* `AT` just to check connection, should respond with `OK`
* `AT+VERSION` to check version, should respond with something like `linvorV1.8`
* `AT+PIN0000` to set the pin to 0000 (change this), should respond with `OKsetPIN`
* `AT+NAMEBot` to set name to Bot (change this), should respond with `OKsetname`
* `AT+BAUD8` to set baudrate to 115200, should respond with `OK115200` (and it now only talks back at this baud rate)
  * `AT+BAUD1` for 1200 baud rate
  * `AT+BAUD2` for 2400 baud rate
  * `AT+BAUD3` for 4800 baud rate
  * `AT+BAUD4` for 9600 baud rate (default for HC-06)
  * `AT+BAUD5` for 19200 baud rate
  * `AT+BAUD6` for 38400 baud rate
  * `AT+BAUD7` for 57600 baud rate
  * `AT+BAUD8` for 115200 baud rate
  * `AT+BAUD9` for 230400 baud rate
  * `AT+BAUDA` for 460800 baud rate
  * `AT+BAUDB` for 921600 baud rate
  * `AT+BAUDC` for 1382400 baud rate

See [this page](https://gist.github.com/garrows/f8f787dac6e85591737c) for source.

## Links

* [2018 rules](https://drive.google.com/file/d/1IRmw_ilnIUZXFogMFLV_Z74MJRQBaDCz/view)
* [Track 3D model](https://sketchfab.com/models/5b62a2502a494bd7af8224225431400b)