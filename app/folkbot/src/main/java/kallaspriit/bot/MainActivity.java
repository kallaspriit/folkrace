package kallaspriit.bot;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import org.java_websocket.drafts.Draft_6455;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";

    private static final int HTTP_SERVER_PORT = 8080;
    private static final int WEB_SOCKET_SERVER_PORT = 8000;
    public static final String BLUETOOTH_DEVICE_NAME_PREFIX = "HC-06";

    public WebView webView;
    WebSocketServer webSocketServer;
    HttpServer httpServer;
    BluetoothSerial bluetoothSerial;

    private BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.i(TAG, "received action: " + intent.getAction());

            Toast.makeText(context, intent.getAction(), Toast.LENGTH_SHORT).show();
        }
    };

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // use main activity
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Log.i(TAG, "creating main activity");

        // create web-view
        webView = findViewById(R.id.webview);

        // enable javascript and storage
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // make the web-view debuggable
        WebView.setWebContentsDebuggingEnabled(true);

        // add javascript interface
        webView.addJavascriptInterface(new ScriptInterface(this), "app");

        // setup bluetooth serial
        // TODO: refactor into BluetoothCommander
        bluetoothSerial = new BluetoothSerial(this, new BluetoothSerial.MessageHandler() {
            String commandBuffer = "";

            @Override
            public int read(int bufferSize, byte[] buffer) {
                try {
                    String message = new String(buffer, 0, bufferSize, "UTF-8");

                    Log.d(TAG, "bluetooth read " + bufferSize + " bytes: '" + message + "'");

                    commandBuffer += message;

                    int newLineIndex = commandBuffer.indexOf("\n");

                    while (newLineIndex != -1) {
                        String command = commandBuffer.substring(0, newLineIndex);

                        commandBuffer = commandBuffer.substring(newLineIndex + 1);

                        newLineIndex = commandBuffer.indexOf("\n");

                        Log.i(TAG, "got bluetooth command: '" + command + "'");

                        // forward the command to all active connections
                        if (webSocketServer != null) {
                            webSocketServer.getConnections().forEach((connection) -> connection.send(command));
                        }
                    }
                    return bufferSize;
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }

                return 0;
            }
        // TODO: make the name prefix configurable
        }, BLUETOOTH_DEVICE_NAME_PREFIX);
    }

    @Override
    protected void onResume() {
        super.onResume();

        Log.i(TAG, "resuming main activity");

        // setup local broadcast receivers
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_CONNECTED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_DISCONNECTED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_CONNECTION_ATTEMPT_FAILED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_CONNECTION_FAILED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_NOT_SUPPORTED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_DISABLED));

        // create http server
        try {
            httpServer = new HttpServer(this, HTTP_SERVER_PORT);
        } catch (IOException e) {
            Log.e(TAG, "starting http server failed");

            e.printStackTrace();
        }

        // create web-socket server
        webSocketServer = new WebSocketServer(WEB_SOCKET_SERVER_PORT, new Draft_6455());
        webSocketServer.setConnectionLostTimeout(1000);
        webSocketServer.start();

        // show the local index view
        webView.loadUrl("http://127.0.0.1:" + HTTP_SERVER_PORT + "/");

        // attempt to connect to the bluetooth device
        bluetoothSerial.connect();
    }

    @Override
    protected void onPause() {
        super.onPause();

        Log.i(TAG, "pausing main activity");

        // stop the bluetooth serial
        bluetoothSerial.stop();

        // unregister the broadcast receiver
        LocalBroadcastManager.getInstance(this).unregisterReceiver(broadcastReceiver);

        // stop the servers
        stopHttpServer();
        stopWebSocketServer();
    }

    private void stopHttpServer() {
        // do nothing if already stopped
        if (httpServer == null) {
            return;
        }

        // stop the http server
        httpServer.stop();
        httpServer = null;
    }

    private void stopWebSocketServer() {
        // do nothing if already stopped
        if (webSocketServer == null) {
            return;
        }

        // attempt to stop the web-socket server
        try {
            webSocketServer.stop();
        } catch (IOException | InterruptedException e) {
            Log.e(TAG, "stopping web-socket server failed");

            e.printStackTrace();
        } finally {
            webSocketServer = null;
        }
    }
}
