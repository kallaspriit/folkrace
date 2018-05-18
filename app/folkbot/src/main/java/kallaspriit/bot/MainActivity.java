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
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import org.java_websocket.drafts.Draft_6455;

import java.io.IOException;

public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";

    private static final int HTTP_SERVER_PORT = 8080;
    private static final int WEB_SOCKET_SERVER_PORT = 8000;
    public static final String BLUETOOTH_DEVICE_NAME_PREFIX = "HC-06";

    WebView webView;
    private WebSocketServer webSocketServer;
    private HttpServer httpServer;
    private BluetoothWebSocketProxy bluetoothWebSocketProxy;

    private BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "received action: " + intent.getAction());

        // TODO: handle the intents
        Toast.makeText(context, intent.getAction(), Toast.LENGTH_SHORT).show();
        }
    };

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // use main activity
        super.onCreate(savedInstanceState);

        Log.i(TAG, "creating main activity");

        // use the main activity layout
        setContentView(R.layout.activity_main);

        // keep the screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

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
    }

    @Override
    protected void onResume() {
        super.onResume();

        Log.i(TAG, "resuming main activity");

        // start the services
        startBroadcastListeners();
        startHttpServer();
        startWebSocketServer();
        startBluetoothWebSocketProxy();

        // show the local index view
        webView.loadUrl("http://127.0.0.1:" + HTTP_SERVER_PORT + "/");
    }

    @Override
    protected void onPause() {
        super.onPause();

        Log.i(TAG, "pausing main activity");

        // stop the services
        stopBluetoothWebSocketProxy();
        stopWebSocketServer();
        stopHttpServer();
        stopBroadcastListeners();
    }

    private void startBroadcastListeners() {
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_CONNECTED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_DISCONNECTED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_CONNECTION_ATTEMPT_FAILED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_CONNECTION_FAILED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_NOT_SUPPORTED));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(BluetoothSerial.BLUETOOTH_DISABLED));
    }

    private void stopBroadcastListeners() {
        LocalBroadcastManager.getInstance(this).unregisterReceiver(broadcastReceiver);
    }

    private void startHttpServer() {
        Log.i(TAG, "starting http server");

        try {
            httpServer = new HttpServer(this, HTTP_SERVER_PORT);
        } catch (IOException e) {
            Log.e(TAG, "starting http server failed");

            e.printStackTrace();
        }
    }

    private void stopHttpServer() {
        // do nothing if already stopped
        if (httpServer == null) {
            return;
        }

        Log.i(TAG, "stopping http server");

        // stop the http server
        httpServer.stop();
        httpServer = null;
    }

    private void startWebSocketServer() {
        Log.i(TAG, "starting web-socket server");

        webSocketServer = new WebSocketServer(WEB_SOCKET_SERVER_PORT, new Draft_6455());
        webSocketServer.setConnectionLostTimeout(1000);

        // start the web-socket server
        try {
            webSocketServer.start();
        } catch (Exception e) {
            Log.e(TAG, "starting web-socket server failed");

            e.printStackTrace();
        }
    }

    private void stopWebSocketServer() {
        // do nothing if already stopped
        if (webSocketServer == null) {
            return;
        }

        Log.i(TAG, "stopping web-socket server");

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

    private void startBluetoothWebSocketProxy() {
        Log.i(TAG, "starting bluetooth web-socket proxy");

        // setup bluetooth web-socket proxy
        bluetoothWebSocketProxy = new BluetoothWebSocketProxy(this, webSocketServer, BLUETOOTH_DEVICE_NAME_PREFIX);

        // attempt to connect to the bluetooth device
        bluetoothWebSocketProxy.start();
    }

    private void stopBluetoothWebSocketProxy() {
        bluetoothWebSocketProxy.stop();
        bluetoothWebSocketProxy = null;
    }
}
