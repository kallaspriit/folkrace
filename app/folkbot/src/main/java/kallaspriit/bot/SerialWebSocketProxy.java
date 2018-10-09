package kallaspriit.bot;

import android.content.Context;
import android.hardware.usb.UsbManager;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.io.IOException;

public class SerialWebSocketProxy implements WebSocketServer.Listener, BluetoothSerial.Listener, UsbSerial.Listener {

    public interface Listener {
        void onInternalCommand(String command);
    }

    private static final String TAG = "SerialWebSocketProxy";

    BluetoothSerial bluetoothSerial;
    private UsbSerial usbSerial;
    private WebSocketServer webSocketServer;
    private String bluetoothCommandBuffer = "";
    private String usbCommandBuffer = "";
    private Listener listener;

    SerialWebSocketProxy(Listener listener, Context context, WebSocketServer webSocketServer, String bluetoothDeviceNamePrefix) {
        this.listener = listener;
        this.webSocketServer = webSocketServer;

        // create serial instances
        bluetoothSerial = new BluetoothSerial(context, this, bluetoothDeviceNamePrefix);
        usbSerial = new UsbSerial(context, this);

        // register oneself as the web-socket server listener
        webSocketServer.setListener(this);
    }

    public void start() {
        // attempt to connect to the serial devices
        bluetoothSerial.connect();
        usbSerial.connect();
    }

    public void stop() {
        // close the serial connections
        bluetoothSerial.disconnect();
        usbSerial.disconnect();
    }

    @Override
    public void onBluetoothSerialMessage(String message) {
        bluetoothCommandBuffer += message;

        bluetoothCommandBuffer = handleCommands(bluetoothCommandBuffer);
    }

    @Override
    public void onUsbSerialMessage(String message) {
        usbCommandBuffer += message;

        usbCommandBuffer = handleCommands(usbCommandBuffer);
    }

    @Override
    public void onOpen(WebSocket connection, ClientHandshake handshake) {
        // report current states to the new connection
        connection.send("ip:" + Util.getIpAddress());
        connection.send("bluetooth:" + bluetoothSerial.getState() + (bluetoothSerial.isConnected() ? ":" + bluetoothSerial.getDevice().getName() : ""));
        connection.send("usb:" + usbSerial.getState());
    }

    @Override
    public void onClose(WebSocket connection, int code, String reason, boolean remote) {

    }

    @Override
    public void onError(WebSocket connection, Exception e) {

    }

    @Override
    public void onMessage(WebSocket connection, String message) {
        // commands starting with hash are handled by the app and not forwarded
        if (message.substring(0, 1).equals("!")) {
            String command = message.substring(1);

            // handle the internal command on the main thread
            new Handler(Looper.getMainLooper()).post(() -> listener.onInternalCommand(command));

            return;
        }

        // check for available connections
        if (usbSerial.isConnected()) {
            // prefer usb connection over bluetooth if available
            Log.d(TAG, "forwarding web-socket message '" + message + "' to usb serial device");

            try {
                bluetoothSerial.sendMessage(message + "\n");
            } catch (IOException e) {
                Log.w(TAG, "forwarding message '" + message + "' to bluetooth device failed");

                e.printStackTrace();
            }
        } else if (bluetoothSerial.isConnected()) {
            // use bluetooth if no usb connection is available
            Log.d(TAG, "forwarding web-socket message '" + message + "' to bluetooth serial device");

            try {
                bluetoothSerial.sendMessage(message + "\n");
            } catch (IOException e) {
                Log.w(TAG, "forwarding message '" + message + "' to bluetooth device failed");

                e.printStackTrace();
            }
        } else {
            // no connection available, ignore the message
            Log.w(TAG, "received web-socket '" + message + "' but no serial connection is available");
        }
    }

    private String handleCommands(String buffer) {
        // search for new-line
        int newLineIndex = buffer.indexOf("\n");

        // handle all commands
        while (newLineIndex != -1) {
            // extract the command
            String command = buffer.substring(0, newLineIndex);

            // remove the handled message from the command buffer
            buffer = buffer.substring(newLineIndex + 1);

            Log.d(TAG, "forwarding command '" + command + "' to web-socket clients");

            // forward the command to all active connections
            webSocketServer.getConnections().forEach((connection) -> connection.send(command));

            // search for next new-line
            newLineIndex = buffer.indexOf("\n");
        }

        return buffer;
    }
}
