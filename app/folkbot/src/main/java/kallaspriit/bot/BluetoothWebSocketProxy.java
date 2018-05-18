package kallaspriit.bot;

import android.content.Context;
import android.util.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

public class BluetoothWebSocketProxy implements WebSocketServer.Listener, BluetoothSerial.MessageHandler {

    private static final String TAG = "BluetoothWebSocketProxy";

    private BluetoothSerial bluetoothSerial;
    private WebSocketServer webSocketServer;
    private String commandBuffer = "";

    BluetoothWebSocketProxy(Context context, WebSocketServer webSocketServer, String bluetoothDeviceNamePrefix) {
        this.webSocketServer = webSocketServer;

        // create bluetooth serial instance
        bluetoothSerial = new BluetoothSerial(context, this, bluetoothDeviceNamePrefix);

        webSocketServer.setListener(this);
    }

    public void start() {
        // attempt to connect to the bluetooth device
        bluetoothSerial.connect();
    }

    public void stop() {
        // close the bluetooth serial connection
        bluetoothSerial.stop();
    }

    @Override
    public int read(int bufferSize, byte[] buffer) {
        try {
            commandBuffer += new String(buffer, 0, bufferSize, "UTF-8");

            handleCommands();

            return bufferSize;
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        return 0;
    }

    @Override
    public void onOpen(WebSocket connection, ClientHandshake handshake) {

    }

    @Override
    public void onClose(WebSocket connection, int code, String reason, boolean remote) {

    }

    @Override
    public void onError(WebSocket connection, Exception e) {

    }

    @Override
    public void onMessage(WebSocket connection, String message) {
        if (!bluetoothSerial.isConnected()) {
            Log.w(TAG, "received web-socket message '" + message + " but bluetooth is not connected");

            return;
        }

        Log.d(TAG, "forwarding web-socket message '" + message + "' to bluetooth device");

        try {
            bluetoothSerial.sendMessage(message);
        } catch (IOException e) {
            Log.w(TAG, "forwarding message '" + message + "' to bluetooth device failed");

            e.printStackTrace();
        }
    }

    private void handleCommands() {
        // search for new-line
        int newLineIndex = commandBuffer.indexOf("\n");

        // handle all commands
        while (newLineIndex != -1) {
            // extract the command
            String command = commandBuffer.substring(0, newLineIndex);

            // remove the handled message from the command buffer
            commandBuffer = commandBuffer.substring(newLineIndex + 1);

            Log.i(TAG, "forwarding bluetooth command '" + command + "' to web-socket clients");

            // forward the command to all active connections
            webSocketServer.getConnections().forEach((connection) -> connection.send(command));

            // search for next new-line
            newLineIndex = commandBuffer.indexOf("\n");
        }
    }
}
